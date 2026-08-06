import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ai, defaultModel } from '../config/gemini.js';
import { supabaseAdmin } from '../config/supabase.js';

// Helper to fetch text content of attached file IDs
const getAttachedContexts = async (fileIds: string[], userId: string): Promise<string> => {
  if (!fileIds || fileIds.length === 0) return '';

  const { data: files } = await supabaseAdmin
    .from('files')
    .select('name, file_type, parsed_text, ai_summary')
    .in('id', fileIds)
    .eq('user_id', userId);

  if (!files || files.length === 0) return '';

  return files.map(f => `--- ATTACHED FILE: ${f.name} (${f.file_type.toUpperCase()}) ---\nSummary: ${f.ai_summary || 'N/A'}\nContent:\n${(f.parsed_text || '').substring(0, 8000)}\n--- END FILE ---`).join('\n\n');
};

export const chatMultimodal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { prompt, chat_id, workspace_id, file_ids } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const fileContext = await getAttachedContexts(file_ids || [], userId || '');

    const fullPrompt = `You are Nexus AI, a state-of-the-art Multimodal Intelligence Workspace assistant.
You provide clear, accurate, structured, and insightful answers.

${fileContext ? `Context from uploaded user files:\n${fileContext}\n\n` : ''}
User Query: ${prompt}
`;

    let reply = '';

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: defaultModel,
          contents: fullPrompt
        });
        reply = response.text || 'I analyzed the provided context but could not form a response.';
      } catch (err: any) {
        console.error('Gemini API Error:', err);
        reply = `Nexus AI Analysis:\n\nBased on your prompt "${prompt}"${file_ids?.length ? ' and the attached documents' : ''}:\n\n1. Key Context: The query focuses on multimodal data processing and retrieval.\n2. Insight: Ensure your files are parsed and linked in the active workspace.\n\n(Note: Set GEMINI_API_KEY for live online response synthesis).`;
      }
    } else {
      reply = `### Nexus AI Response\n\nI have received your request regarding: **"${prompt}"**.\n\n${fileContext ? `📁 **Analyzed Content**: Integrated information from attached files.` : ''}\n\n- **Summary**: Your query has been processed across active workspace context.\n- **Actionable Steps**: You can generate notes, flashcards, or quizzes directly from this conversation using the top toolbar.`;
    }

    // Record Message in Chat History if chat_id provided
    if (chat_id) {
      await supabaseAdmin.from('messages').insert([
        { chat_id, user_id: userId, role: 'user', content: prompt, attachments: file_ids || [] },
        { chat_id, user_id: userId, role: 'model', content: reply }
      ]);

      await supabaseAdmin
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chat_id);
    }

    // Log Activity
    await supabaseAdmin.from('activity_logs').insert({
      user_id: userId,
      workspace_id,
      action: 'ai_chat',
      details: { prompt_length: prompt.length, attached_files: file_ids?.length || 0 }
    });

    return res.status(200).json({ reply, model: defaultModel });
  } catch (error: any) {
    console.error('Chat Multimodal Error:', error);
    return res.status(500).json({ error: error.message || 'Error generating AI response' });
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
      const response = await ai.models.generateContent({ model: defaultModel, contents: prompt });
      summary = response.text || '';
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
      const resp = await ai.models.generateContent({ model: defaultModel, contents: prompt });
      noteContent = resp.text || '';
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
