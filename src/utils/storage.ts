import { StoryData } from '../types';

export const STORAGE_KEY = 'fairytale_studio_saved_data_v1';

export const DEFAULT_STORY_DATA: StoryData = {
  studentName: '',
  studentClass: '',
  title: 'The Secret of the Whispering Woods',
  setting: '🌲 Enchanted Forest',
  customSetting: '',
  problem: 'A greedy giant stole the village water source',
  customProblem: '',
  magicalElement: 'A talking golden deer (Kancil)',
  customMagicalElement: '',
  moralValue: 'Kindness and generosity defeat greed',
  customMoralValue: '',
  characters: [
    {
      id: 'char-1',
      name: 'Rian',
      role: 'Hero',
      adjectives: ['Brave', 'Kind', 'Curious'],
      appearance: 'A young village boy wearing a brown vest and woven bamboo hat.',
    },
    {
      id: 'char-2',
      name: 'Grom',
      role: 'Villain',
      adjectives: ['Greedy', 'Proud'],
      appearance: 'A towering stone giant with fiery orange eyes.',
    },
    {
      id: 'char-3',
      name: 'Kencana',
      role: 'Helper',
      adjectives: ['Wise', 'Loyal'],
      appearance: 'A golden deer that leaves glowing star footprints on moss.',
    },
  ],
  coachIdeasFeedback: null,
  orientation: '',
  complication: '',
  resolution: '',
  checkFeedback: null,
  coverImageUrl: '',
  coverRegenCount: 0,
  currentStep: 0,
  lastUpdated: new Date().toISOString(),
};

export function loadSavedStory(): StoryData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && typeof data === 'object') {
      return { ...DEFAULT_STORY_DATA, ...data };
    }
  } catch (e) {
    console.error('Failed to parse saved story:', e);
  }
  return null;
}

export function saveStory(data: StoryData): void {
  try {
    const toSave = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Failed to save story to localStorage:', e);
  }
}

export function clearSavedStory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear saved story:', e);
  }
}

export function countWords(text: string): number {
  if (!text) return 0;
  const words = text.trim().match(/\b[\w'-]+\b/g);
  return words ? words.length : 0;
}
