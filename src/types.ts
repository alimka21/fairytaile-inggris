export interface Character {
  id: string;
  name: string;
  role: 'Hero' | 'Villain' | 'Helper';
  adjectives: string[];
  appearance: string;
}

export interface StoryData {
  studentName: string;
  studentClass: string;
  title: string;
  
  // Step 1
  setting: string;
  customSetting?: string;
  problem: string;
  customProblem?: string;
  magicalElement: string;
  customMagicalElement?: string;
  moralValue: string;
  customMoralValue?: string;
  characters: Character[];
  coachIdeasFeedback?: {
    greeting: string;
    greeting_id: string;
    questions: string[];
    questions_id: string[];
    encouragement: string;
    encouragement_id: string;
  } | null;

  // Step 2
  orientation: string;
  complication: string;
  resolution: string;

  // Step 3
  checkFeedback?: StoryFeedback | null;

  // Step 4
  coverImageUrl?: string;
  coverRegenCount: number;

  currentStep: number; // 0 = start screen, 1 = ideas, 2 = write, 3 = check, 4 = storybook
  lastUpdated: string;
}

export interface StoryFeedback {
  structure: {
    orientation: { status: 'yes' | 'needs_work'; note: string; note_id: string };
    complication: { status: 'yes' | 'needs_work'; note: string; note_id: string };
    resolution: { status: 'yes' | 'needs_work'; note: string; note_id: string };
  };
  language_errors: Array<{
    original: string;
    hint: string;
    hint_id: string;
    answer: string;
    explanation: string;
    explanation_id: string;
  }>;
  glow: string[];
  glow_id: string[];
  grow: string[];
  grow_id: string[];
  overall_feedback: string;
  overall_feedback_id: string;
}

export interface StuckHintResponse {
  guidingQuestion: string;
  guidingQuestion_id: string;
  shortTip: string;
  shortTip_id: string;
}
