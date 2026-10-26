import { StoryFeedback, StuckHintResponse } from '../types';

export function getDynamicIdeasFallback(body: any) {
  const { setting, problem, magicalElement, moralValue, characters } = body;
  const hero = Array.isArray(characters)
    ? characters.find((c: any) => c.role === 'Hero')?.name || 'your hero'
    : 'your hero';
  const villain = Array.isArray(characters)
    ? characters.find((c: any) => c.role === 'Villain')?.name || 'the villain'
    : 'the villain';
  const helper = Array.isArray(characters)
    ? characters.find((c: any) => c.role === 'Helper')?.name || 'a loyal helper'
    : 'a loyal helper';

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

export function getDynamicStuckFallback(body: any): StuckHintResponse {
  const { part, orientationText, characters, setting, problem } = body;
  const hero = Array.isArray(characters)
    ? characters.find((c: any) => c.role === 'Hero')?.name || 'your main character'
    : 'your main character';

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

export function getDynamicCheckFallback(body: any): StoryFeedback {
  const { orientation = '', complication = '', resolution = '' } = body;

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
