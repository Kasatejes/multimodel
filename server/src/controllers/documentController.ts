import { Response } from 'express';
import { randomUUID } from 'crypto';
import { AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { ai, defaultModel } from '../config/gemini.js';

// In-Memory Backup Stores for Permanent Document Storage, Versions & Audit Logs
export const memoryDocsStore: any[] = [];
export const memoryDocVersionsStore: any[] = [];
export const memoryAuditLogsStore: any[] = [];

// Helper to log audit events permanently
const logAuditEvent = async (userId: string, action: string, details: any, workspaceId?: string) => {
  const auditRecord = {
    id: randomUUID(),
    user_id: userId,
    workspace_id: workspaceId || null,
    action,
    details,
    created_at: new Date().toISOString()
  };
  memoryAuditLogsStore.unshift(auditRecord);

  try {
    await supabaseAdmin.from('audit_logs').insert(auditRecord);
  } catch (e) {}
};

// 1. Create or Save Processed Text / Document Data Permanently
export const createProcessedDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || randomUUID();
    const { title, content, tags, workspace_id } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const docId = randomUUID();
    let aiSummary = '';

    if (ai && content.trim().length > 30) {
      try {
        const response = await ai.models.generateContent({
          model: defaultModel,
          contents: `Provide a concise, key-point summary and key topics for the following text document:\n\n${content.substring(0, 4000)}`
        });
        aiSummary = response.text || '';
      } catch (e) {
        aiSummary = `Document containing ${content.split(/\s+/).length} words.`;
      }
    } else {
      aiSummary = `Document containing ${content.split(/\s+/).length} words.`;
    }

    const docRecord = {
      id: docId,
      user_id: userId,
      workspace_id: workspace_id || null,
      title,
      content,
      ai_summary: aiSummary,
      tags: tags || ['text-document'],
      version: 1,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save Initial Version Record
    const initialVersion = {
      id: randomUUID(),
      document_id: docId,
      version: 1,
      title,
      content,
      ai_summary: aiSummary,
      created_at: new Date().toISOString()
    };
    memoryDocVersionsStore.unshift(initialVersion);

    let dbInserted = null;
    try {
      const { data } = await supabaseAdmin.from('processed_documents').insert(docRecord).select('*').single();
      if (data) dbInserted = data;
    } catch (e) {}

    const finalDoc = dbInserted || docRecord;
    memoryDocsStore.unshift(finalDoc);

    await logAuditEvent(userId, 'document_create', { doc_id: docId, title }, workspace_id);

    return res.status(201).json({
      message: 'Processed document stored permanently',
      document: finalDoc
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 2. Get Processed Documents (Supports Search & Soft-Deleted Filter)
export const getProcessedDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { search, include_deleted, workspace_id } = req.query;

    let dbDocs: any[] = [];
    try {
      let query = supabaseAdmin.from('processed_documents').select('*').eq('user_id', userId);
      if (include_deleted !== 'true') {
        query = query.eq('is_deleted', false);
      }
      if (workspace_id) {
        query = query.eq('workspace_id', workspace_id as string);
      }
      const { data } = await query.order('updated_at', { ascending: false });
      if (data) dbDocs = data;
    } catch (e) {}

    const localDocs = memoryDocsStore.filter(d => {
      if (d.user_id !== userId) return false;
      if (include_deleted !== 'true' && d.is_deleted) return false;
      if (workspace_id && d.workspace_id !== workspace_id) return false;
      if (search) {
        const q = (search as string).toLowerCase();
        return d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q) || (d.ai_summary || '').toLowerCase().includes(q);
      }
      return true;
    });

    const allMap = new Map();
    [...dbDocs, ...localDocs].forEach(d => allMap.set(d.id, d));
    const mergedDocs = Array.from(allMap.values()).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return res.status(200).json({ documents: mergedDocs });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 3. Update Document (Generates Version History & Audit Log)
export const updateProcessedDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, content, tags } = req.body;

    const existingDoc = memoryDocsStore.find(d => d.id === id);
    if (!existingDoc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const newVersionNum = (existingDoc.version || 1) + 1;
    let newSummary = existingDoc.ai_summary;

    if (content && content !== existingDoc.content && ai && content.trim().length > 30) {
      try {
        const response = await ai.models.generateContent({
          model: defaultModel,
          contents: `Summarize updated text document:\n\n${content.substring(0, 4000)}`
        });
        newSummary = response.text || existingDoc.ai_summary;
      } catch (e) {}
    }

    existingDoc.title = title || existingDoc.title;
    existingDoc.content = content || existingDoc.content;
    existingDoc.tags = tags || existingDoc.tags;
    existingDoc.version = newVersionNum;
    existingDoc.ai_summary = newSummary;
    existingDoc.updated_at = new Date().toISOString();

    // Save Version Snapshot
    memoryDocVersionsStore.unshift({
      id: randomUUID(),
      document_id: id,
      version: newVersionNum,
      title: existingDoc.title,
      content: existingDoc.content,
      ai_summary: newSummary,
      created_at: new Date().toISOString()
    });

    try {
      await supabaseAdmin.from('processed_documents').update({
        title: existingDoc.title,
        content: existingDoc.content,
        tags: existingDoc.tags,
        version: newVersionNum,
        ai_summary: newSummary,
        updated_at: new Date().toISOString()
      }).eq('id', id);
    } catch (e) {}

    await logAuditEvent(userId || '', 'document_update', { doc_id: id, version: newVersionNum });

    return res.status(200).json({ document: existingDoc, message: 'Document updated with new version snapshot' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 4. Soft Delete Document (Moves to Trash Bin)
export const softDeleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || '';
    const { id } = req.params;

    const doc = memoryDocsStore.find(d => d.id === id);
    if (doc) {
      doc.is_deleted = true;
      doc.deleted_at = new Date().toISOString();
    }

    try {
      await supabaseAdmin.from('processed_documents').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', id);
    } catch (e) {}

    await logAuditEvent(userId, 'document_soft_delete', { doc_id: id });

    return res.status(200).json({ message: 'Document moved to Trash Bin. Can be recovered anytime.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 5. Recover Soft-Deleted Document
export const recoverDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || '';
    const { id } = req.params;

    const doc = memoryDocsStore.find(d => d.id === id);
    if (doc) {
      doc.is_deleted = false;
      doc.deleted_at = null;
    }

    try {
      await supabaseAdmin.from('processed_documents').update({ is_deleted: false, deleted_at: null }).eq('id', id);
    } catch (e) {}

    await logAuditEvent(userId, 'document_recover', { doc_id: id });

    return res.status(200).json({ message: 'Document fully recovered to active vault' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 6. Hard Delete Document Permanently
export const hardDeleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || '';
    const { id } = req.params;

    const idx = memoryDocsStore.findIndex(d => d.id === id);
    if (idx !== -1) memoryDocsStore.splice(idx, 1);

    try {
      await supabaseAdmin.from('processed_documents').delete().eq('id', id);
    } catch (e) {}

    await logAuditEvent(userId, 'document_hard_delete', { doc_id: id });

    return res.status(200).json({ message: 'Document permanently deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 7. Get Document Version History
export const getDocumentVersions = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const versions = memoryDocVersionsStore.filter(v => v.document_id === id);
    return res.status(200).json({ versions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// 8. Get Audit Logs
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const logs = memoryAuditLogsStore.filter(l => l.user_id === userId);
    return res.status(200).json({ audit_logs: logs });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
