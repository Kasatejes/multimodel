import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
console.log('API Key loaded. First 6 chars:', apiKey.substring(0, 6));

const ai = new GoogleGenAI({ apiKey });

async function main() {
  try {
    console.log('Sending test request with model "gemini-2.0-flash"...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Hello'
    });
    console.log('RESPONSE RECEIVED:');
    console.log(response.text);
  } catch (err: any) {
    console.log('FULL ERROR OBJECT:');
    console.dir(err, { depth: null });
  }
}

main();
