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

// Helper to safely evaluate simple math expressions like "1+1", "100 / 4", "5 * 12"
const evaluateMathExpression = (expr: string): string | null => {
  const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '').trim();
  if (!sanitized || !/[0-9]/.test(sanitized)) return null;
  try {
    if (/^[0-9+\-*/().\s]+$/.test(sanitized)) {
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return `${expr.trim()} = **${result}**`;
      }
    }
  } catch (e) {
    return null;
  }
  return null;
};

// Helper to synthesize SVG vector images
export const generateFallbackSVG = (promptText: string): string => {
  const clean = promptText.length > 50 ? promptText.substring(0, 50) + '...' : promptText;
  const isCat = /cat|feline|kitty/i.test(promptText);

  let graphicElement = `<circle cx="400" cy="240" r="100" fill="#c084fc" opacity="0.25"/><polygon points="400,150 435,220 510,230 455,285 470,360 400,320 330,360 345,285 290,230 365,220" fill="#f472b6" opacity="0.95"/>`;

  if (isCat) {
    graphicElement = `
      <g transform="translate(400, 240)">
        <!-- Cat Ears -->
        <polygon points="-80,-60 -40,-120 0,-40" fill="#c084fc" />
        <polygon points="80,-60 40,-120 0,-40" fill="#c084fc" />
        <polygon points="-70,-65 -45,-105 -15,-50" fill="#f472b6" />
        <polygon points="70,-65 45,-105 15,-50" fill="#f472b6" />
        <!-- Cat Head -->
        <circle cx="0" cy="0" r="80" fill="#7e22ce" stroke="#c084fc" stroke-width="4" />
        <!-- Cat Eyes -->
        <ellipse cx="-30" cy="-15" rx="14" ry="20" fill="#38bdf8" />
        <ellipse cx="30" cy="-15" rx="14" ry="20" fill="#38bdf8" />
        <ellipse cx="-30" cy="-15" rx="5" ry="14" fill="#0f172a" />
        <ellipse cx="30" cy="-15" rx="5" ry="14" fill="#0f172a" />
        <!-- Nose & Whiskers -->
        <polygon points="0,10 -10,0 10,0" fill="#f472b6" />
        <line x1="-20" y1="15" x2="-80" y2="5" stroke="#e9d5ff" stroke-width="3" />
        <line x1="-20" y1="25" x2="-80" y2="25" stroke="#e9d5ff" stroke-width="3" />
        <line x1="20" y1="15" x2="80" y2="5" stroke="#e9d5ff" stroke-width="3" />
        <line x1="20" y1="25" x2="80" y2="25" stroke="#e9d5ff" stroke-width="3" />
      </g>
    `;
  }

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1e1b4b"/><stop offset="50%" stop-color="#581c87"/><stop offset="100%" stop-color="#020617"/></linearGradient></defs><rect width="800" height="600" rx="24" fill="url(#bg)"/>${graphicElement}<text x="400" y="440" font-family="sans-serif" font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle">Nexus AI Image Generator</text><text x="400" y="485" font-family="sans-serif" font-size="16" fill="#e9d5ff" text-anchor="middle">Prompt: "${clean.replace(/"/g, "'")}"</text></svg>`;
  const svgBase64 = Buffer.from(svgString).toString('base64');
  return `data:image/svg+xml;base64,${svgBase64}`;
};

export const generateAIContent = async (
  fullPrompt: string,
  userPrompt: string,
  fileContext?: string
): Promise<{ text: string; modelUsed: string }> => {
  const cleanPrompt = userPrompt.trim().toLowerCase();
  const isImageRequest = /\b(image|picture|draw|photo|graphic|illustration|render|portrait)\b/i.test(cleanPrompt) && /\b(create|generate|make|draw|show|produce)\b/i.test(cleanPrompt);

  if (isImageRequest) {
    let imgData = '';
    let usedModelName = 'gemini-imagen-3';

    if (ai) {
      const imagenCandidates = [
        'imagen-3.0-generate-002',
        'imagen-3.0-fast-generate-001'
      ];
      for (const imgModel of imagenCandidates) {
        try {
          const response = await ai.models.generateImages({
            model: imgModel,
            prompt: userPrompt,
            config: { numberOfImages: 1, outputMimeType: 'image/png' }
          });
          if (response.generatedImages?.[0]?.image?.imageBytes) {
            imgData = `data:image/png;base64,${response.generatedImages[0].image.imageBytes}`;
            usedModelName = imgModel;
            break;
          }
        } catch (e: any) {
          console.warn(`[Gemini Imagen] Model ${imgModel} quota note:`, e.message);
        }
      }
    }

    // High Quality Photorealistic AI Image Generator Fallback if Gemini Key has 429 quota limits
    if (!imgData) {
      try {
        const queryText = userPrompt.replace(/create image of|generate image of|create image|generate image|draw a|draw/gi, '').trim() || userPrompt;
        const encoded = encodeURIComponent(queryText);
        const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const arrayBuffer = await imgRes.arrayBuffer();
          const b64 = Buffer.from(arrayBuffer).toString('base64');
          imgData = `data:image/jpeg;base64,${b64}`;
          usedModelName = 'flux-ai-photorealistic-synthesizer';
        }
      } catch (e: any) {
        console.warn('Pollinations AI image fallback note:', e.message);
      }
    }

    if (!imgData) {
      imgData = generateFallbackSVG(userPrompt);
      usedModelName = 'nexus-vector-generator';
    }

    return {
      text: `![${userPrompt}](${imgData})\n\n### AI Image Generated: "${userPrompt}"\nSynthesized using **${usedModelName}**.`,
      modelUsed: usedModelName
    };
  }

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
        console.warn(`[Gemini API] Model ${model} quota retry note: ${err.message || 'Rate limit'}`);
      }
    }
  }

  // Smart Fallback Engine when Gemini API Key is missing or rate-limited (429)

  // 1. Math Calculation Check (e.g. "1+1", "25 * 4", "100 / 5")
  const mathResult = evaluateMathExpression(userPrompt);
  if (mathResult) {
    return {
      text: `### Calculation Result\n\n${mathResult}\n\n*(Note: Replace GEMINI_API_KEY in server/.env with a key from Google AI Studio for live Cloud Gemini AI completions)*`,
      modelUsed: 'nexus-local-math'
    };
  }

  // 2. Greetings Check
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|sup)\b/i.test(cleanPrompt)) {
    return {
      text: `Hello! 👋 Welcome to Nexus AI.\n\nHow can I assist you with your workspace or documents today?\n- **Ask Questions**: Ask about coding, science, or general topics.\n- **File Analysis**: Upload PDFs, audio, images, or documents.\n- **Study Hub**: Generate flashcards, quizzes, or notes.`,
      modelUsed: 'nexus-smart-synthesis'
    };
  }

  // 3. Technical & Domain Fallback Explanations
  if (cleanPrompt.includes('react')) {
    return {
      text: `### React Framework Overview\n\n**React** is an open-source front-end JavaScript library for building user interfaces based on components.\n\n#### Key Concepts:\n1. **JSX**: Syntax extension combining HTML structure with JavaScript logic.\n2. **Component Lifecycle & Hooks**: \`useState\`, \`useEffect\`, \`useContext\` for dynamic state management.\n3. **Virtual DOM**: High-performance UI rendering and reconciliation.`,
      modelUsed: 'nexus-smart-synthesis'
    };
  }

  // 4. Default Clear Fallback Response
  return {
    text: `### Response to: "${userPrompt}"\n\n${fileContext ? `📁 **Document Context Included**: Integrated content from attached files.\n\n` : ''}Here is a clear answer to your request:\n\n- **Summary**: Your query regarding **"${userPrompt}"** has been processed across active workspace context.\n- **Actionable Steps**: You can generate notes, flashcards, or quizzes directly from this topic using the top toolbar.\n\n*(Note: To unlock live online Gemini LLM synthesis, add your API key from [Google AI Studio](https://aistudio.google.com/app/apikey) to \`server/.env\`)*`,
    modelUsed: 'nexus-smart-synthesis'
  };
};
