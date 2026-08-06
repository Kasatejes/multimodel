import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = apiKey && apiKey !== 'mock_key_for_dev' 
  ? new GoogleGenAI({ apiKey })
  : null;

export const defaultModel = 'gemini-2.5-flash';
