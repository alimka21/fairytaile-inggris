import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  getDynamicIdeasFallback, 
  getDynamicStuckFallback, 
  getDynamicCheckFallback 
} from './src/utils/coachFallback';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini client with User-Agent header for telemetry
  // We do NOT set a short 12s timeout to avoid 504 DEADLINE_EXCEEDED
  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: 45000, // 45s allows full reasoning/generation without premature abort
    },
  });

  const SYSTEM_INSTRUCTION_BASE = `
You are a friendly, encouraging AI Story Coach named "Coach Riko" for Grade 9 Indonesian students (SMP Kelas 9) learning English (CEFR Level A2–B1).
The student is learning to write narrative texts (specifically fairy tales / fables / legends) with standard structure:
- Orientation (Who, Where, When)
- Complication (The Problem / Crisis)
- Resolution (The Solution & Moral Lesson)

CRITICAL RULES YOU MUST STRICTLY FOLLOW:
1. You are a COACH, NOT A GHOSTWRITER.
2. NEVER write the student's story, paragraphs, or full story sentences for them.
3. If the student asks you to write the story or any part of it, politely decline and ask a guiding question instead.
4. Help only by asking guiding questions (like "What if...", "How did they feel?", "What happened next?"), giving short hints, and giving encouraging feedback.
5. Use simple English suitable for Grade 9 Indonesian students (CEFR A2-B1): short sentences, active verbs, encouraging vocabulary.
6. Under or with every response, ALWAYS provide natural, warm Indonesian translation (Bahasa Indonesia) so students can toggle "Lihat dalam Bahasa Indonesia".
7. Keep all content completely child-safe, positive, educational, and culturally respectful.
8. Encourage the use of Simple Past Tense (e.g., lived, walked, saw, discovered, helped) and Time Connectives (Once upon a time, One day, Suddenly, Then, Finally).
`;

  // Helper to call Gemini model with fallback between flash-lite and flash
  async function callGemini(contents: string, config: any) {
    try {
      return await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config,
      });
    } catch (err: any) {
      console.warn('gemini-3.1-flash-lite encountered error, trying gemini-3.8-flash:', err.message);
      return await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config,
      });
    }
  }
  // Endpoint 1: Ask the Coach in Step 1 (Idea & Characters)
  app.post('/api/coach/ask-coach', async (req, res) => {
    try {
      const { setting, problem, magicalElement, moralValue, characters } = req.body;

      const charText = Array.isArray(characters)
        ? characters
            .map(
              (c: any) =>
                `- ${c.name || 'Unnamed'} (${c.role || 'Character'}): adjectives [${(c.adjectives || []).join(', ')}], appearance: ${c.appearance || 'none'}`
            )
            .join('\n')
        : 'No characters provided yet';

      const prompt = `
The student has selected these story ingredients for their fairy tale:
- Setting: ${setting || 'A magical place'}
- Problem / Conflict: ${problem || 'A great mystery'}
- Magical Element: ${magicalElement || 'A wonder'}
- Moral Value: ${moralValue || 'Kindness'}
- Characters:
${charText}

As the friendly story coach, provide:
1. A warm greeting and 1 short encouraging compliment about their creative idea.
2. 2 or 3 thought-provoking "What if...?" guiding questions to spark their imagination for the story's plot. DO NOT write the story for them.
3. Natural Indonesian translations for each part.
`;

      const response = await callGemini(prompt, {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING, description: 'Short warm greeting & compliment in English' },
            greeting_id: { type: Type.STRING, description: 'Full natural Indonesian translation of greeting' },
            questions: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2 or 3 guiding questions in simple English' },
            questions_id: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Full natural Indonesian translations of the questions' },
            encouragement: { type: Type.STRING, description: 'Short encouraging remark in simple English' },
            encouragement_id: { type: Type.STRING, description: 'Full natural Indonesian translation of encouragement' },
          },
          required: ['greeting', 'greeting_id', 'questions', 'questions_id', 'encouragement', 'encouragement_id'],
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (error: any) {
      console.warn('Falling back to contextual dynamic coach advice for Step 1:', error.message);
      return res.json(getDynamicIdeasFallback(req.body));
    }
  });

  // Endpoint 2: "I'm stuck" hint in Step 2 (Write)
  app.post('/api/coach/stuck-hint', async (req, res) => {
    try {
      const { part, orientationText, complicationText, resolutionText, characters, setting, problem } = req.body;

      const prompt = `
The student is writing the "${part || 'story'}" section of their Grade 9 English fairy tale, but they clicked "I'm stuck".
Here is what they have written so far:
- Orientation: "${orientationText || '(empty)'}"
- Complication: "${complicationText || '(empty)'}"
- Resolution: "${resolutionText || '(empty)'}"
- Setting: ${setting || 'unknown'}
- Main problem: ${problem || 'unknown'}

Remember:
- Give EXACTLY ONE guiding question that prompts their imagination for what to write next.
- DO NOT write sentences or plot lines for them.
- Give ONE short language or writing tip (e.g., reminding them of a past tense verb or a time connective like "Suddenly").
- Provide simple Indonesian translations for both.
`;

      const response = await callGemini(prompt, {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            guidingQuestion: { type: Type.STRING, description: 'One single guiding question in simple English' },
            guidingQuestion_id: { type: Type.STRING, description: 'Full natural Indonesian translation of the guiding question' },
            shortTip: { type: Type.STRING, description: 'A brief tip in simple English' },
            shortTip_id: { type: Type.STRING, description: 'Full natural Indonesian translation of the tip' },
          },
          required: ['guidingQuestion', 'guidingQuestion_id', 'shortTip', 'shortTip_id'],
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (error: any) {
      console.warn('Falling back to dynamic stuck hint for Step 2:', error.message);
      return res.json(getDynamicStuckFallback(req.body));
    }
  });

  // Endpoint 3: Check My Story in Step 3 (Check & Edit)
  app.post('/api/coach/check-story', async (req, res) => {
    try {
      const { orientation, complication, resolution, setting, moral, characters } = req.body;

      const prompt = `
Please evaluate this Grade 9 Indonesian student's fairy tale narrative text:

[ORIENTATION]
${orientation || '(empty)'}

[COMPLICATION]
${complication || '(empty)'}

[RESOLUTION]
${resolution || '(empty)'}

[INTENDED MORAL VALUE]
${moral || 'Not specified'}

Analyze the text and return structured JSON:
1. "structure":
   - orientation: { status: "yes" | "needs_work", note: "short note in simple English", note_id: "Indonesian translation" }
   - complication: { status: "yes" | "needs_work", note: "short note in simple English", note_id: "Indonesian translation" }
   - resolution: { status: "yes" | "needs_work", note: "short note in simple English", note_id: "Indonesian translation" }
2. "language_errors": array of up to 5 items found in the student's text.
   For each error:
   - "original": the exact phrase from student's text
   - "hint": friendly explanation of the grammar or spelling mistake (DO NOT write the corrected answer directly in the hint!)
   - "hint_id": Indonesian translation of the hint
   - "answer": the correct phrase/sentence
   - "explanation": why this is correct in simple terms (e.g. Simple Past rule)
   - "explanation_id": Indonesian translation of explanation
3. "glow": array of exactly 2 strengths/positive points in simple English
   "glow_id": array of 2 strengths in Indonesian
4. "grow": array of exactly 2 actionable things to improve in simple English
   "grow_id": array of 2 things in Indonesian
5. "overall_feedback": encouraging summary message
   "overall_feedback_id": Indonesian translation
`;

      const response = await callGemini(prompt, {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            structure: {
              type: Type.OBJECT,
              properties: {
                orientation: {
                  type: Type.OBJECT,
                  properties: {
                    status: { type: Type.STRING },
                    note: { type: Type.STRING },
                    note_id: { type: Type.STRING },
                  },
                  required: ['status', 'note', 'note_id'],
                },
                complication: {
                  type: Type.OBJECT,
                  properties: {
                    status: { type: Type.STRING },
                    note: { type: Type.STRING },
                    note_id: { type: Type.STRING },
                  },
                  required: ['status', 'note', 'note_id'],
                },
                resolution: {
                  type: Type.OBJECT,
                  properties: {
                    status: { type: Type.STRING },
                    note: { type: Type.STRING },
                    note_id: { type: Type.STRING },
                  },
                  required: ['status', 'note', 'note_id'],
                },
              },
              required: ['orientation', 'complication', 'resolution'],
            },
            language_errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  hint_id: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  explanation_id: { type: Type.STRING },
                },
                required: ['original', 'hint', 'hint_id', 'answer', 'explanation', 'explanation_id'],
              },
            },
            glow: { type: Type.ARRAY, items: { type: Type.STRING } },
            glow_id: { type: Type.ARRAY, items: { type: Type.STRING } },
            grow: { type: Type.ARRAY, items: { type: Type.STRING } },
            grow_id: { type: Type.ARRAY, items: { type: Type.STRING } },
            overall_feedback: { type: Type.STRING },
            overall_feedback_id: { type: Type.STRING },
          },
          required: ['structure', 'language_errors', 'glow', 'glow_id', 'grow', 'grow_id', 'overall_feedback', 'overall_feedback_id'],
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (error: any) {
      console.warn('Falling back to dynamic check story analysis for Step 3:', error.message);
      return res.json(getDynamicCheckFallback(req.body));
    }
  });

  // Endpoint 4: Generate Cover Illustration in Step 4
  app.post('/api/coach/generate-cover', async (req, res) => {
    try {
      const { title, setting, characters, magicalElement } = req.body;

      const charSummary = Array.isArray(characters)
        ? characters.map((c: any) => `${c.name} (${c.role}, ${c.appearance || 'fairytale character'})`).join(', ')
        : 'fairytale hero';

      const prompt = `Soft watercolor children's storybook illustration of a fairy tale titled "${title || 'Fairy Tale'}". Setting: ${setting || 'an enchanted magical realm'}. Characters: ${charSummary}. Magical element: ${magicalElement || 'a magical charm'}. Whimsical storybook art style, gentle pastel color palette, soft watercolor wash texture, storybook cover illustration, peaceful and inspiring atmosphere, high quality, no text or typography written on the image.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: '3:4',
          },
        },
      });

      let imageUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error('No image was returned from the model.');
      }

      return res.json({ imageUrl, success: true });
    } catch (error: any) {
      console.warn('Image generation encountered issue:', error.message);
      return res.status(200).json({
        success: false,
        error: error.message || 'Image generation unavailable',
        fallbackCover: true,
      });
    }
  });

  // Mount Vite middleware for dev mode or serve static files in prod
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fairy Tale Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
