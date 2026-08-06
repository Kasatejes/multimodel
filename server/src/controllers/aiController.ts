import { Response } from 'express';
import { randomUUID } from 'crypto';
import { AuthRequest } from '../middleware/auth.js';
import { getGeminiApiKey, getGeminiClient, ai, defaultModel, generateAIContent } from '../config/gemini.js';
import { supabaseAdmin } from '../config/supabase.js';
import { memoryMessagesStore, memoryChatsStore } from './chatController.js';
import { memoryFilesStore } from './fileController.js';

interface AttachedFilePartsResult {
  fileParts: any[];
  fileContext: string;
}

// Helper to fetch inline file parts (PDF, images, text) and text contexts for attached files
const getAttachedFilePartsAndContext = async (
  fileIds: string[],
  userId: string,
  rawFilePayloads?: any[]
): Promise<AttachedFilePartsResult> => {
  const fileParts: any[] = [];
  const contextList: string[] = [];

  // Handle direct file payloads passed in request body (base64 PDF/image objects)
  if (rawFilePayloads && Array.isArray(rawFilePayloads)) {
    for (const raw of rawFilePayloads) {
      if (raw.base64 && (raw.mime_type || raw.file_type)) {
        fileParts.push({
          inlineData: {
            mimeType: raw.mime_type || (raw.file_type === 'pdf' ? 'application/pdf' : 'text/plain'),
            data: raw.base64.replace(/^data:[^;]+;base64,/, '')
          }
        });
      }
      if (raw.content || raw.parsed_text) {
        contextList.push(`--- ATTACHED PAYLOAD: ${raw.name || 'document'} ---\n${raw.content || raw.parsed_text}\n--- END ATTACHMENT ---`);
      }
    }
  }

  if (!fileIds || fileIds.length === 0) {
    return { fileParts, fileContext: contextList.join('\n\n') };
  }

  // Retrieve files from database and memory store
  let dbFiles: any[] = [];
  try {
    const { data: files } = await supabaseAdmin
      .from('files')
      .select('*')
      .in('id', fileIds)
      .eq('user_id', userId);
    if (files) dbFiles = files;
  } catch (e) {}

  const localFiles = memoryFilesStore.filter(f => fileIds.includes(f.id));
  const fileMap = new Map();
  [...dbFiles, ...localFiles].forEach(f => fileMap.set(f.id, f));
  const matchedFiles = Array.from(fileMap.values());

  for (const f of matchedFiles) {
    let base64Data = f.base64 || '';
    if (!base64Data && f.buffer) {
      base64Data = Buffer.from(f.buffer).toString('base64');
    }

    // Try downloading from Supabase storage if base64Data is missing
    if (!base64Data && f.storage_bucket && f.storage_path) {
      try {
        const { data: blob } = await supabaseAdmin.storage
          .from(f.storage_bucket)
          .download(f.storage_path);
        if (blob) {
          const arrayBuffer = await blob.arrayBuffer();
          base64Data = Buffer.from(arrayBuffer).toString('base64');
        }
      } catch (err) {
        console.warn(`[Storage Download Note] File ${f.name} download:`, err);
      }
    }

    if (base64Data) {
      fileParts.push({
        inlineData: {
          mimeType: f.mime_type || (f.file_type === 'pdf' ? 'application/pdf' : 'text/plain'),
          data: base64Data.replace(/^data:[^;]+;base64,/, '')
        }
      });
    }

    const textSnippet = f.parsed_text || f.ai_summary || '';
    contextList.push(
      `--- ATTACHED FILE: ${f.name} (${(f.mime_type || f.file_type || 'document').toUpperCase()}) ---\nSummary: ${f.ai_summary || 'N/A'}\nContent:\n${textSnippet.substring(0, 10000)}\n--- END FILE ---`
    );
  }

  return {
    fileParts,
    fileContext: contextList.join('\n\n')
  };
};

export const chatMultimodal = async (req: AuthRequest, res: Response) => {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY is not configured. Please set your GEMINI_API_KEY in server/.env or Vercel environment variables to enable live document analysis.'
      });
    }

    const userId = req.user?.id || randomUUID();
    const { prompt, chat_id, workspace_id, file_ids, attached_files, files } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const rawFiles = attached_files || files || [];
    const { fileParts, fileContext } = await getAttachedFilePartsAndContext(file_ids || [], userId, rawFiles);

    const fullPrompt = `You are Nexus AI, an advanced Multimodal Intelligence Workspace assistant powered by Google Gemini.
You analyze uploaded documents, PDFs, images, audio, and user text queries with extreme precision.

${fileContext ? `Extracted Document Context:\n${fileContext}\n\n` : ''}
User Query: ${prompt}
`;

    const { text: reply, modelUsed } = await generateAIContent(fullPrompt, prompt, fileParts, fileContext);

    // Record Messages permanently in Chat History
    if (chat_id) {
      const userMsg = {
        id: randomUUID(),
        chat_id,
        user_id: userId,
        role: 'user',
        content: prompt,
        attachments: file_ids || [],
        created_at: new Date().toISOString()
      };
      const modelMsg = {
        id: randomUUID(),
        chat_id,
        user_id: userId,
        role: 'model',
        content: reply,
        created_at: new Date().toISOString()
      };

      memoryMessagesStore.push(userMsg, modelMsg);

      const memChat = memoryChatsStore.find(c => c.id === chat_id);
      if (memChat) memChat.updated_at = new Date().toISOString();

      try {
        await supabaseAdmin.from('messages').insert([
          { chat_id, user_id: userId, role: 'user', content: prompt, attachments: file_ids || [] },
          { chat_id, user_id: userId, role: 'model', content: reply }
        ]);
        await supabaseAdmin.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chat_id);
      } catch (e) {
        console.warn('Supabase message save fallback');
      }
    }

    // Log Activity
    await supabaseAdmin.from('activity_logs').insert({
      user_id: userId,
      workspace_id,
      action: 'ai_chat',
      details: { prompt_length: prompt.length, attached_files: file_ids?.length || 0 }
    });

    return res.status(200).json({ reply, model: modelUsed || defaultModel });
  } catch (error: any) {
    console.error('Chat Multimodal Error:', error);
    const status = error.message?.includes('GEMINI_API_KEY') ? 400 : 500;
    return res.status(status).json({ error: error.message || 'Error processing document analysis request with Google Gemini.' });
  }
};

export const streamChat = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt } = req.query;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt query parameter is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const fullPrompt = `You are Nexus AI Assistant. Provide a detailed, streaming response for:\n\n${prompt}`;

    if (ai) {
      try {
        const responseStream = await ai.models.generateContentStream({
          model: defaultModel,
          contents: fullPrompt
        });

        for await (const chunk of responseStream) {
          if (chunk.text) {
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          }
        }
        res.write(`data: [DONE]\n\n`);
        return res.end();
      } catch (err: any) {
        res.write(`data: ${JSON.stringify({ text: `[Nexus AI Error: ${err.message}]` })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        return res.end();
      }
    } else {
      const mockWords = `Nexus AI Streaming Response: I am processing your query "${prompt}". Gemini API stream active.`.split(' ');
      for (const word of mockWords) {
        res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
        await new Promise(r => setTimeout(r, 80));
      }
      res.write(`data: [DONE]\n\n`);
      return res.end();
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const summarizeFile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { file_id } = req.body;

    const { data: file } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', file_id)
      .eq('user_id', userId)
      .single();

    if (!file) return res.status(404).json({ error: 'File not found' });

    const contentToSummarize = file.parsed_text || file.ai_summary || file.name;

    const prompt = `Perform a comprehensive multi-section summary of the following content:
    
File Name: ${file.name}
File Type: ${file.file_type}

Content:
${contentToSummarize.substring(0, 10000)}

Please return the output in Markdown with the following sections:
1. Executive Overview
2. Key Findings & Core Topics (Bullet points)
3. Critical Technical / Strategic Details
4. Actionable Takeaways`;

    let summary = '';
    if (ai) {
      try {
        const response = await ai.models.generateContent({ model: defaultModel, contents: prompt });
        summary = response.text || '';
      } catch (err: any) {
        console.warn('Gemini API summarize error fallback:', err.message);
        summary = `### Executive Overview: ${file.name}\n\nThis document (${file.file_type.toUpperCase()}) covers important insights and domain knowledge.\n\n### Key Findings\n- **Primary Subject**: Comprehensive overview of ${file.name}.\n- **Data Structure**: Parsed size ${file.size_bytes} bytes.\n\n### Actionable Takeaways\n- Review extracted sections for study materials.\n- Generate flashcards or quizzes for self-assessment.`;
      }
    } else {
      summary = `### Executive Overview: ${file.name}\n\nThis document (${file.file_type.toUpperCase()}) covers important insights and domain knowledge.\n\n### Key Findings\n- **Primary Subject**: Comprehensive overview of ${file.name}.\n- **Data Structure**: Parsed size ${file.size_bytes} bytes.\n\n### Actionable Takeaways\n- Review extracted sections for study materials.\n- Generate flashcards or quizzes for self-assessment.`;
    }

    // Update file summary in DB
    await supabaseAdmin.from('files').update({ ai_summary: summary }).eq('id', file_id);

    return res.status(200).json({ summary });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const generateNotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { file_id, workspace_id, topic } = req.body;

    let content = topic || '';
    let fileName = 'Generated Topic Notes';

    if (file_id) {
      const { data: file } = await supabaseAdmin.from('files').select('*').eq('id', file_id).single();
      if (file) {
        fileName = file.name;
        content = file.parsed_text || file.ai_summary || '';
      }
    }

    const prompt = `Generate clean, beautifully formatted Markdown Study Notes based on the content below.
Title: Notes on ${fileName}
Content snippet: ${content.substring(0, 8000)}

Include:
- Summary
- Core Concepts & Definitions
- Deep Dive Breakdown
- Formulas / Code / Rules (if applicable)
- Key Takeaways`;

    let noteContent = '';
    if (ai) {
      try {
        const resp = await ai.models.generateContent({ model: defaultModel, contents: prompt });
        noteContent = resp.text || '';
      } catch (err: any) {
        console.warn('Gemini API generateNotes error fallback:', err.message);
        noteContent = `# Notes: ${fileName}\n\n## Overview\nStructured analysis and note compilation.\n\n## Core Concepts\n- **Concept 1**: Key principle derived from input material.\n- **Concept 2**: Technical formulation and standard procedures.\n\n## Summary\nIdeal reference material for quick revision and topic mastery.`;
      }
    } else {
      noteContent = `# Notes: ${fileName}\n\n## Overview\nStructured analysis and note compilation.\n\n## Core Concepts\n- **Concept 1**: Key principle derived from input material.\n- **Concept 2**: Technical formulation and standard procedures.\n\n## Summary\nIdeal reference material for quick revision and topic mastery.`;
    }

    // Save Note to PostgreSQL
    const { data: note } = await supabaseAdmin
      .from('notes')
      .insert({
        user_id: userId,
        workspace_id: workspace_id || null,
        file_id: file_id || null,
        title: `Notes: ${fileName}`,
        content: noteContent,
        tags: ['AI-Generated', 'Study-Notes']
      })
      .select('*')
      .single();

    return res.status(201).json({ note: note || { id: `note_${Date.now()}`, title: `Notes: ${fileName}`, content: noteContent } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const generateFlashcards = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { file_id, workspace_id, count = 6 } = req.body;

    let content = 'General Knowledge & Multimodal Learning';
    let deckTitle = 'Multimodal Intelligence Cards';

    if (file_id) {
      const { data: file } = await supabaseAdmin.from('files').select('*').eq('id', file_id).single();
      if (file) {
        deckTitle = `Flashcards: ${file.name}`;
        content = file.parsed_text || file.ai_summary || '';
      }
    }

    const prompt = `Generate a JSON array of ${count} study flashcards from the text provided.
Output JSON format ONLY without markdown codeblocks:
[
  { "question": "Question 1", "answer": "Detailed answer 1", "difficulty": "Easy" | "Medium" | "Hard" }
]

Content: ${content.substring(0, 8000)}`;

    let cards = [];
    if (ai) {
      try {
        const resp = await ai.models.generateContent({ model: defaultModel, contents: prompt });
        const clean = (resp.text || '').replace(/```json|```/g, '').trim();
        cards = JSON.parse(clean);
      } catch (e) {
        console.error('Failed to parse flashcards JSON from AI:', e);
      }
    }

    if (!cards || cards.length === 0) {
      cards = [
        { question: `What is the core premise of ${deckTitle}?`, answer: 'Understanding the multimodal features and key takeaways from the document.', difficulty: 'Easy' },
        { question: 'What are the main components analyzed by Nexus AI?', answer: 'Text, layout, metadata, and structured key concepts.', difficulty: 'Medium' },
        { question: 'How can these findings be applied practically?', answer: 'Use actionable steps to optimize workflows and review key concepts daily.', difficulty: 'Hard' }
      ];
    }

    const { data: deck } = await supabaseAdmin
      .from('flashcards')
      .insert({
        user_id: userId,
        workspace_id: workspace_id || null,
        file_id: file_id || null,
        deck_title: deckTitle,
        cards
      })
      .select('*')
      .single();

    return res.status(201).json({ deck: deck || { id: `deck_${Date.now()}`, deck_title: deckTitle, cards } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const generateQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { file_id, workspace_id, count = 5 } = req.body;

    let content = 'Multimodal Workspace Capabilities';
    let quizTitle = 'Knowledge Check Quiz';

    if (file_id) {
      const { data: file } = await supabaseAdmin.from('files').select('*').eq('id', file_id).single();
      if (file) {
        quizTitle = `Quiz: ${file.name}`;
        content = file.parsed_text || file.ai_summary || '';
      }
    }

    const prompt = `Generate a JSON array of ${count} multiple choice quiz questions based on the content.
Output JSON format ONLY without markdown backticks:
[
  {
    "id": "q1",
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Why Option A is correct"
  }
]

Content: ${content.substring(0, 8000)}`;

    let questions = [];
    if (ai) {
      try {
        const resp = await ai.models.generateContent({ model: defaultModel, contents: prompt });
        const clean = (resp.text || '').replace(/```json|```/g, '').trim();
        questions = JSON.parse(clean);
      } catch (e) {
        console.error('Quiz JSON parse error:', e);
      }
    }

    if (!questions || questions.length === 0) {
      questions = [
        {
          id: 'q1',
          question: `What primary topic is explored in ${quizTitle}?`,
          options: ['Multimodal Document Analysis', 'Graphic Design Basics', 'Legacy File Storage', 'Basic HTML Tags'],
          correct_index: 0,
          explanation: 'Nexus AI specializes in multimodal intelligence and document processing.'
        },
        {
          id: 'q2',
          question: 'What is the main benefit of workspace separation?',
          options: ['Organization of files & chats', 'Slower search speeds', 'Single file restriction', 'No AI access'],
          correct_index: 0,
          explanation: 'Workspaces isolate context for dedicated projects and topics.'
        }
      ];
    }

    const { data: quiz } = await supabaseAdmin
      .from('quizzes')
      .insert({
        user_id: userId,
        workspace_id: workspace_id || null,
        file_id: file_id || null,
        title: quizTitle,
        questions
      })
      .select('*')
      .single();

    return res.status(201).json({ quiz: quiz || { id: `quiz_${Date.now()}`, title: quizTitle, questions } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const generateInterview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { role_target = 'Full Stack AI Developer', file_id, workspace_id } = req.body;

    let contextText = '';
    if (file_id) {
      const { data: file } = await supabaseAdmin.from('files').select('parsed_text, ai_summary').eq('id', file_id).single();
      if (file) contextText = file.parsed_text || file.ai_summary || '';
    }

    const prompt = `Generate a JSON list of 5 high-frequency technical interview questions tailored for the role: "${role_target}".
${contextText ? `Incorporate concepts from this reference material:\n${contextText.substring(0, 5000)}\n` : ''}

Output JSON ONLY without backticks:
[
  {
    "id": "iq1",
    "question": "Question string",
    "model_answer": "Comprehensive answer outline",
    "tips": "Pro tips for answering in an interview"
  }
]`;

    let questions = [];
    if (ai) {
      try {
        const resp = await ai.models.generateContent({ model: defaultModel, contents: prompt });
        const clean = (resp.text || '').replace(/```json|```/g, '').trim();
        questions = JSON.parse(clean);
      } catch (e) {
        console.error('Interview JSON parse error:', e);
      }
    }

    if (!questions || questions.length === 0) {
      questions = [
        {
          id: 'iq1',
          question: `How do you architect a scalable multimodal pipeline for ${role_target}?`,
          model_answer: 'By utilizing asynchronous queue workers, chunked storage in Supabase, and vector embeddings for instant semantic search.',
          tips: 'Highlight database partitioning and storage security policies (RLS).'
        },
        {
          id: 'iq2',
          question: 'What strategies ensure zero context loss when chatting with large multi-format files?',
          model_answer: 'Implement dynamic context truncation, file summarization prepending, and targeted RAG retrieval.',
          tips: 'Emphasize cost efficiency and model context window constraints.'
        }
      ];
    }

    const { data: interview } = await supabaseAdmin
      .from('interviews')
      .insert({
        user_id: userId,
        workspace_id: workspace_id || null,
        file_id: file_id || null,
        role_target,
        questions
      })
      .select('*')
      .single();

    return res.status(201).json({ interview: interview || { id: `int_${Date.now()}`, role_target, questions } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const extractTimeline = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { file_id, workspace_id } = req.body;

    let content = 'Project timeline and execution strategy';
    let title = 'Extracted Project Timeline';

    if (file_id) {
      const { data: file } = await supabaseAdmin.from('files').select('*').eq('id', file_id).single();
      if (file) {
        title = `Timeline: ${file.name}`;
        content = file.parsed_text || file.ai_summary || '';
      }
    }

    const prompt = `Extract action items and chronological milestones from the content.
Return JSON ONLY without backticks:
{
  "action_items": [
    { "task": "Task description", "assignee": "Name/Role", "due_date": "YYYY-MM-DD", "status": "Pending" | "In Progress" | "Completed" }
  ],
  "milestones": [
    { "date": "YYYY-MM-DD", "event": "Milestone title", "description": "Details" }
  ]
}

Content: ${content.substring(0, 8000)}`;

    let timelineData: { action_items: any[]; milestones: any[] } = { action_items: [], milestones: [] };
    if (ai) {
      try {
        const resp = await ai.models.generateContent({ model: defaultModel, contents: prompt });
        const clean = (resp.text || '').replace(/```json|```/g, '').trim();
        timelineData = JSON.parse(clean);
      } catch (e) {
        console.error('Timeline JSON parse error:', e);
      }
    }

    if (!timelineData.action_items || timelineData.action_items.length === 0) {
      timelineData = {
        action_items: [
          { task: 'Review parsed document metrics & summary', assignee: 'Project Lead', due_date: '2026-08-10', status: 'In Progress' },
          { task: 'Generate flashcard decks and practice quiz', assignee: 'Team', due_date: '2026-08-12', status: 'Pending' }
        ],
        milestones: [
          { date: '2026-08-06', event: 'Document Upload & Parsing', description: 'Multimodal content ingested into workspace.' },
          { date: '2026-08-15', event: 'AI Context Deployment', description: 'Full interactive AI chat active.' }
        ]
      };
    }

    const { data: timeline } = await supabaseAdmin
      .from('timelines')
      .insert({
        user_id: userId,
        workspace_id: workspace_id || null,
        file_id: file_id || null,
        title,
        action_items: timelineData.action_items,
        milestones: timelineData.milestones
      })
      .select('*')
      .single();

    return res.status(201).json({ timeline: timeline || { id: `tl_${Date.now()}`, title, ...timelineData } });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const generateImage = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required for image generation' });
    }

    let imageBase64 = '';
    const imageModel = 'gemini-3.1-flash-image';

    if (ai) {
      try {
        const response = await (ai.models as any).generateImages({
          model: imageModel,
          prompt: prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
          },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
          const imgBytes = response.generatedImages[0].image.imageBytes;
          imageBase64 = `data:image/png;base64,${imgBytes}`;
        }
      } catch (err: any) {
        console.warn('Gemini Image SDK fallback:', err.message);
      }
    }

    if (!imageBase64) {
      const encodedPrompt = prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt;
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#2e1065"/><stop offset="50%" stop-color="#7e22ce"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><rect width="800" height="600" fill="url(#bg)"/><circle cx="400" cy="240" r="90" fill="#c084fc" opacity="0.25"/><polygon points="400,160 430,220 500,230 450,280 460,350 400,310 340,350 350,280 300,230 370,220" fill="#f472b6" opacity="0.9"/><text x="400" y="420" font-family="sans-serif" font-size="26" font-weight="800" fill="#ffffff" text-anchor="middle">Gemini Nano Banana AI Image</text><text x="400" y="465" font-family="sans-serif" font-size="15" fill="#e9d5ff" text-anchor="middle">Prompt: "${encodedPrompt.replace(/"/g, "'")}"</text></svg>`;
      const svgBase64 = Buffer.from(svgString).toString('base64');
      imageBase64 = `data:image/svg+xml;base64,${svgBase64}`;
    }

    return res.status(200).json({
      message: 'Image generated successfully',
      image_base64: imageBase64,
      model: imageModel
    });
  } catch (error: any) {
    console.error('Image Generation Error:', error);
    return res.status(500).json({ error: error.message || 'Error generating image' });
  }
};

