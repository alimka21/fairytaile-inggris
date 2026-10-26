import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

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

  // Helper to generate dynamic contextual fallback for Step 1
  function getDynamicIdeasFallback(body: any) {
    const { setting, problem, magicalElement, moralValue, characters } = body;
    const hero = Array.isArray(characters) ? characters.find((c: any) => c.role === 'Hero')?.name || 'your hero' : 'your hero';
    const villain = Array.isArray(characters) ? characters.find((c: any) => c.role === 'Villain')?.name || 'the villain' : 'the villain';
    const helper = Array.isArray(characters) ? characters.find((c: any) => c.role === 'Helper')?.name || 'a loyal helper' : 'a loyal helper';

    return {
      greeting: `Welcome, young writer! Your story set in ${setting || 'a magical kingdom'} has wonderful potential.`,
      greeting_id: `Selamat datang, penulis muda! Ceritamu yang berlatar di ${setting || 'kerajaan magis'} memiliki potensi yang luar biasa.`,
      questions: [
        `What if ${hero} accidentally discovered ${magicalElement || 'a magical relic'} while trying to solve the problem of ${problem || 'the crisis'}?`,
        `What if ${villain} was once good, but became selfish because of a lost secret in ${setting || 'this realm'}?`,
        `How can ${helper} support ${hero} to show that "${moralValue || 'Kindness defeats greed'}"?`,
      ],
      questions_id: [
        `Bagaimana jika ${hero} tidak sengaja menemukan ${magicalElement || 'benda magis'} saat mencoba mengatasi masalah ${problem || 'krisis ini'}?`,
        `Bagaimana jika ${villain} dulunya baik, tetapi menjadi serakah karena sebuah rahasia masa lalu di ${setting || 'tempat ini'}?`,
        `Bagaimana cara ${helper} membantu ${hero} untuk membuktikan bahwa "${moralValue || 'Kebaikan mengalahkan keserakahan'}"?`,
      ],
      encouragement: `Think about how ${hero} feels when the adventure begins. You are ready to start writing your Orientation!`,
      encouragement_id: `Pikirkan bagaimana perasaan ${hero} saat petualangan dimulai. Kamu sudah siap mulai menulis bagian Orientasi!`,
    };
  }

  // Helper to generate dynamic stuck hint for Step 2
  function getDynamicStuckFallback(body: any) {
    const { part, orientationText, complicationText, resolutionText, characters, setting, problem } = body;
    const hero = Array.isArray(characters) ? characters.find((c: any) => c.role === 'Hero')?.name || 'your main character' : 'your main character';

    if (part === 'orientation' || (!orientationText && part !== 'complication' && part !== 'resolution')) {
      return {
        guidingQuestion: `How did ${hero} feel living in ${setting || 'the kingdom'}, and what was their daily life like before trouble started?`,
        guidingQuestion_id: `Bagaimana perasaan ${hero} tinggal di ${setting || 'kerajaan'}, dan seperti apa kehidupan sehari-harinya sebelum masalah muncul?`,
        shortTip: 'Tip: Start with "Once upon a time," and describe who lived there using simple past tense (e.g., "lived", "worked", "loved").',
        shortTip_id: 'Tip: Mulai dengan "Once upon a time," dan ceritakan siapa yang tinggal di sana menggunakan kata kerja lampau (misal: "lived", "worked", "loved").',
      };
    } else if (part === 'complication') {
      return {
        guidingQuestion: `Suddenly, what shocking event or sound warned ${hero} that ${problem || 'a dangerous problem'} had arrived?`,
        guidingQuestion_id: `Tiba-tiba, peristiwa atau suara mengejutkan apa yang memperingatkan ${hero} bahwa ${problem || 'masalah berbahaya'} telah tiba?`,
        shortTip: 'Tip: Use the time connective "Suddenly," or "One afternoon," and describe the crisis with verbs like "stole", "threatened", or "shook".',
        shortTip_id: 'Tip: Gunakan kata hubung waktu "Suddenly," atau "One afternoon," dan jelaskan krisis menggunakan kata kerja seperti "stole", "threatened", atau "shook".',
      };
    } else {
      return {
        guidingQuestion: `How did ${hero} finally overcome the challenge, and what did everyone in ${setting || 'the village'} learn from it?`,
        guidingQuestion_id: `Bagaimana akhirnya ${hero} mengatasi tantangan tersebut, dan apa yang dipelajari semua orang di ${setting || 'desa'} dari peristiwa itu?`,
        shortTip: 'Tip: Start with "Finally," or "In the end," and state the moral lesson clearly.',
        shortTip_id: 'Tip: Mulai dengan "Finally," atau "In the end," dan sebutkan pesan moralnya dengan jelas.',
      };
    }
  }

  // Helper to detect language errors and structure for Step 3
  function getDynamicCheckFallback(body: any) {
    const { orientation = '', complication = '', resolution = '', moral = 'Kindness' } = body;

    const hasOrientation = orientation.trim().length > 20;
    const hasComplication = complication.trim().length > 20;
    const hasResolution = resolution.trim().length > 20;

    const errors: Array<{
      original: string;
      hint: string;
      hint_id: string;
      answer: string;
      explanation: string;
      explanation_id: string;
    }> = [];

    const fullText = `${orientation} ${complication} ${resolution}`;

    const checks = [
      { pattern: /\b(he|she|they|it|the hero|the boy|the girl)\s+(live)\b/i, original: 'live', answer: 'lived', verb: 'live -> lived' },
      { pattern: /\b(he|she|they|it|the hero|the boy|the girl)\s+(go)\b/i, original: 'go', answer: 'went', verb: 'go -> went' },
      { pattern: /\b(he|she|they|it|the hero|the boy|the girl)\s+(see)\b/i, original: 'see', answer: 'saw', verb: 'see -> saw' },
      { pattern: /\b(he|she|they|it|the hero|the boy|the girl)\s+(say)\b/i, original: 'say', answer: 'said', verb: 'say -> said' },
      { pattern: /\b(he|she|they|it|the hero|the boy|the girl)\s+(find)\b/i, original: 'find', answer: 'found', verb: 'find -> found' },
      { pattern: /\b(he|she|it)\s+(don't|dont)\b/i, original: "don't", answer: "didn't", verb: "don't -> didn't" },
      { pattern: /\b(is)\s+(lived|went|saw)\b/i, original: 'is', answer: 'was', verb: 'is -> was' },
    ];

    for (const c of checks) {
      if (errors.length >= 5) break;
      const match = fullText.match(c.pattern);
      if (match) {
        errors.push({
          original: match[0],
          hint: `In a fairy tale, we describe past events. Check the verb form for "${c.original}".`,
          hint_id: `Dalam teks dongeng (narrative text), gunakan Simple Past tense untuk kata kerja "${c.original}".`,
          answer: match[0].replace(new RegExp(`\\b${c.original}\\b`, 'i'), c.answer),
          explanation: `Use simple past tense (${c.verb}) for narrative storytelling.`,
          explanation_id: `Gunakan bentuk kata kerja lampau (${c.verb}) dalam cerita naratif.`,
        });
      }
    }

    if (errors.length === 0) {
      errors.push({
        original: 'Check regular & irregular verbs',
        hint: 'Make sure all action verbs are in the past tense (walked, decided, heard, helped).',
        hint_id: 'Pastikan semua kata kerja aksi berbentuk lampau (walked, decided, heard, helped).',
        answer: 'Past tense forms verified',
        explanation: 'Fairy tales use simple past tense to describe completed actions.',
        explanation_id: 'Dongeng selalu menggunakan Simple Past tense untuk peristiwa yang sudah lampau.',
      });
    }

    return {
      structure: {
        orientation: {
          status: hasOrientation ? 'yes' : 'needs_work',
          note: hasOrientation
            ? 'Good introduction! You clearly set the scene and introduced your character.'
            : 'Add more details about who the main character is, where they lived, and when the story began.',
          note_id: hasOrientation
            ? 'Pengenalan yang baik! Kamu sudah mengenalkan latar dan tokoh utama dengan jelas.'
            : 'Tambahkan detail tentang siapa tokoh utama, di mana mereka tinggal, dan kapan cerita dimulai.',
        },
        complication: {
          status: hasComplication ? 'yes' : 'needs_work',
          note: hasComplication
            ? 'A clear conflict is established! The challenge moves the narrative forward.'
            : 'Make sure the problem is clearly stated: what conflict or danger happened to the hero?',
          note_id: hasComplication
            ? 'Konflik cerita sudah jelas! Tantangan ini menggerakkan alur cerita.'
            : 'Pastikan masalahnya diceritakan dengan jelas: bahaya atau krisis apa yang dialami tokoh?',
        },
        resolution: {
          status: hasResolution ? 'yes' : 'needs_work',
          note: hasResolution
            ? 'The story concludes nicely with a resolution and moral lesson.'
            : 'Explain how the characters solved the crisis and what lesson everyone learned.',
          note_id: hasResolution
            ? 'Cerita diakhiri dengan penyelesaian yang memuaskan dan pesan moral.'
            : 'Jelaskan bagaimana tokoh menyelesaikan masalah dan pelajaran apa yang didapat.',
        },
      },
      language_errors: errors,
      glow: [
        'Creative fairy tale plot with engaging characters and clear sequence.',
        'Good narrative flow using time phrases to connect the events.',
      ],
      glow_id: [
        'Alur dongeng kreatif dengan tokoh menarik dan urutan cerita yang runtut.',
        'Alur naratif mengalir lancar dengan kata keterangan waktu yang tepat.',
      ],
      grow: [
        'Double-check that all verbs in the events use simple past tense (e.g. went, saw, lived).',
        'Add 1 or 2 sensory adjectives to make the setting and characters even more vivid.',
      ],
      grow_id: [
        'Periksa kembali agar semua kata kerja menggunakan Simple Past (misal: went, saw, lived).',
        'Tambahkan 1 atau 2 kata sifat deskriptif agar latar dan karakter terasa lebih hidup.',
      ],
      overall_feedback: `Great effort! Your fairy tale has a true narrative structure. Check the hints below to polish your English before reading it to the class!`,
      overall_feedback_id: `Kerja yang hebat! Ceritamu memiliki struktur naratif yang lengkap. Periksa petunjuk di bawah untuk menyempurnakan tulisanmu sebelum dibacakan di depan kelas!`,
    };
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
