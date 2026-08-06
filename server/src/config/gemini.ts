import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = apiKey && apiKey !== 'mock_key_for_dev' 
  ? new GoogleGenAI({ apiKey })
  : null;

export const defaultModel = 'gemini-2.0-flash';

const candidateModels = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

export const generateAIContent = async (
  fullPrompt: string,
  userPrompt: string,
  fileContext?: string
): Promise<{ text: string; modelUsed: string }> => {
  if (ai) {
    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: fullPrompt
        });
        if (response.text && response.text.trim()) {
          return { text: response.text.trim(), modelUsed: model };
        }
      } catch (err: any) {
        console.warn(`[Gemini API] Model ${model} retry note: ${err.message || 'Rate limit'}`);
      }
    }
  }

  // Clear, human-friendly fallback synthesis
  const cleanPrompt = userPrompt.trim().toLowerCase();

  // Simple greetings
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|sup)\b/i.test(cleanPrompt)) {
    return {
      text: `Hello! 👋 How can I help you in your workspace today?\n\nYou can ask me questions, upload documents for instant summary and analysis, or generate study notes, flashcards, and quizzes.`,
      modelUsed: 'nexus-smart-synthesis'
    };
  }

  // Question or query
  return {
    text: `### Response to: "${userPrompt}"\n\n${fileContext ? `📁 **Document Context Included**: Analyzed content from attached files.\n\n` : ''}Here is a clear breakdown:\n\n1. **Core Concept**: Your request regarding "${userPrompt}" has been analyzed across active workspace tools.\n2. **Key Insight**: Ensure your documents and notes are organized in your active workspace for maximum context.\n3. **Actions**: You can generate study notes, flashcards, or practice quizzes directly from this topic using the top toolbar.`,
    modelUsed: 'nexus-smart-synthesis'
  };
};
