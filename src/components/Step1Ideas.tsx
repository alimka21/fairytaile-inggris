import React, { useState } from 'react';
import { Character, StoryData } from '../types';
import { IndonesianToggle } from './IndonesianToggle';
import { 
  Compass, 
  Sparkles, 
  Users, 
  HelpCircle, 
  Plus, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Lightbulb
} from 'lucide-react';

interface Step1IdeasProps {
  storyData: StoryData;
  onUpdate: (partial: Partial<StoryData>) => void;
  onNext: () => void;
}

const SETTING_OPTIONS = [
  '🌲 Enchanted Deep Forest',
  '🌋 Ancient Kingdom on a Volcano',
  '🏝️ Hidden Village by the Sea',
  '☁️ Floating Cloud Island',
  '🌊 Magical Coral Reef Palace',
  '🏰 Forgotten Temple in the Jungle',
];

const PROBLEM_OPTIONS = [
  'A greedy giant stole the village freshwater source',
  'A dark curse turned the royal family into golden birds',
  'The sacred glowing jewel was lost in a forbidden cave',
  'A mysterious sleeping fog covered the entire village',
  'A wounded mythical dragon needed secret shelter',
];

const MAGICAL_OPTIONS = [
  'A talking golden deer (Kancil) with star steps',
  'An ancient glowing keris that detects lies',
  'A magical flying batik cloth',
  'A mystic seed that grows into a giant tree overnight',
  'A silver flute that speaks to animals',
];

const MORAL_OPTIONS = [
  'Kindness and honesty defeat greed',
  'True courage comes from helping others in danger',
  'Respect nature and listen to elders',
  'Patience and hard work overcome hardship',
  'Do not judge someone only by their appearance',
];

const ADJECTIVE_OPTIONS = [
  'Brave', 'Kind', 'Clever', 'Greedy', 'Wise', 'Shy', 
  'Jealous', 'Loyal', 'Curious', 'Mischievous', 'Honest', 'Proud'
];

export const Step1Ideas: React.FC<Step1IdeasProps> = ({
  storyData,
  onUpdate,
  onNext,
}) => {
  const [isAskingCoach, setIsAskingCoach] = useState(false);
  const [coachError, setCoachError] = useState('');
  const [activeTab, setActiveTab] = useState<'ingredients' | 'characters'>('ingredients');

  const {
    setting,
    customSetting,
    problem,
    customProblem,
    magicalElement,
    customMagicalElement,
    moralValue,
    customMoralValue,
    characters,
    coachIdeasFeedback,
  } = storyData;

  // Character helpers
  const handleAddCharacter = () => {
    if (characters.length >= 3) return;
    const newChar: Character = {
      id: `char-${Date.now()}`,
      name: '',
      role: characters.some((c) => c.role === 'Helper') ? 'Villain' : 'Helper',
      adjectives: ['Kind'],
      appearance: '',
    };
    onUpdate({ characters: [...characters, newChar] });
  };

  const handleRemoveCharacter = (id: string) => {
    if (characters.length <= 1) return;
    onUpdate({ characters: characters.filter((c) => c.id !== id) });
  };

  const handleUpdateCharacter = (id: string, updates: Partial<Character>) => {
    const updated = characters.map((c) => (c.id === id ? { ...c, ...updates } : c));
    onUpdate({ characters: updated });
  };

  const handleToggleAdjective = (charId: string, adj: string) => {
    const char = characters.find((c) => c.id === charId);
    if (!char) return;
    const exists = char.adjectives.includes(adj);
    let nextAdjs = exists
      ? char.adjectives.filter((a) => a !== adj)
      : [...char.adjectives, adj];
    if (nextAdjs.length > 3) {
      nextAdjs = nextAdjs.slice(-3); // Keep max 3
    }
    handleUpdateCharacter(charId, { adjectives: nextAdjs });
  };

  // Ask Coach
  const handleAskCoach = async () => {
    setIsAskingCoach(true);
    setCoachError('');
    try {
      const response = await fetch('/api/coach/ask-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setting: setting === 'Other' ? customSetting : setting,
          problem: problem === 'Other' ? customProblem : problem,
          magicalElement: magicalElement === 'Other' ? customMagicalElement : magicalElement,
          moralValue: moralValue === 'Other' ? customMoralValue : moralValue,
          characters,
        }),
      });

      if (!response.ok) {
        throw new Error('Coach service did not respond properly.');
      }

      const data = await response.json();
      onUpdate({ coachIdeasFeedback: data });
    } catch (err: any) {
      console.error(err);
      setCoachError('Could not connect to Coach Riko. Please check your network and try again.');
    } finally {
      setIsAskingCoach(false);
    }
  };

  const currentSettingText = setting === 'Other' ? customSetting || 'Custom setting' : setting;
  const currentProblemText = problem === 'Other' ? customProblem || 'Custom problem' : problem;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Intro Header */}
      <div className="bg-[#fffdf9] border border-[#ebdccb] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full mb-1.5">
              <Compass className="w-3.5 h-3.5" />
              Step 1 of 4 • Story Foundations
            </div>
            <h2 className="font-serif-story text-2xl font-bold text-stone-900">
              Idea & Characters
            </h2>
            <p className="text-stone-600 text-sm mt-0.5">
              Pick your story ingredients and create 2–3 characters. Then ask your Coach for &ldquo;What if...?&rdquo; ideas!
            </p>
          </div>

          {/* Quick tab switcher for mobile/chromebook convenience */}
          <div className="flex bg-[#f3e9db] p-1 rounded-xl self-stretch sm:self-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'ingredients'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Story Ingredients
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('characters')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'characters'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Characters ({characters.length})
            </button>
          </div>
        </div>
      </div>

      {/* SECTION A: STORY INGREDIENTS */}
      {(activeTab === 'ingredients' || window.innerWidth >= 1024) && (
        <div className="space-y-6">
          {/* Setting */}
          <div className="bg-[#fffdf9] border border-[#ebdccb] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold">1</span>
                Setting (Where does your fairy tale happen?)
              </label>
              <span className="text-xs text-stone-500 italic">Orientasi: Latar tempat</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {SETTING_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onUpdate({ setting: opt })}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer border ${
                    setting === opt
                      ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                      : 'bg-[#faf6ee] text-stone-700 border-[#e5d4c0] hover:bg-[#f3ebd9]'
                  }`}
                >
                  {opt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onUpdate({ setting: 'Other' })}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer border ${
                  setting === 'Other'
                    ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                    : 'bg-[#faf6ee] text-stone-700 border-[#e5d4c0] hover:bg-[#f3ebd9]'
                }`}
              >
                + Other (Tulis sendiri)
              </button>
            </div>

            {setting === 'Other' && (
              <input
                type="text"
                value={customSetting || ''}
                onChange={(e) => onUpdate({ customSetting: e.target.value })}
                placeholder="Type your custom setting (e.g. A hidden waterfall in Kalimantan)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            )}
          </div>

          {/* Problem */}
          <div className="bg-[#fffdf9] border border-[#ebdccb] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold">2</span>
                The Main Problem / Conflict (What goes wrong?)
              </label>
              <span className="text-xs text-stone-500 italic">Komplikasi: Masalah</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {PROBLEM_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onUpdate({ problem: opt })}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer border ${
                    problem === opt
                      ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                      : 'bg-[#faf6ee] text-stone-700 border-[#e5d4c0] hover:bg-[#f3ebd9]'
                  }`}
                >
                  {opt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onUpdate({ problem: 'Other' })}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer border ${
                  problem === 'Other'
                    ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                    : 'bg-[#faf6ee] text-stone-700 border-[#e5d4c0] hover:bg-[#f3ebd9]'
                }`}
              >
                + Other (Tulis sendiri)
              </button>
            </div>

            {problem === 'Other' && (
              <input
                type="text"
                value={customProblem || ''}
                onChange={(e) => onUpdate({ customProblem: e.target.value })}
                placeholder="Describe the main problem (e.g. A witch poisoned the golden rice fields)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            )}
          </div>

          {/* Magical Element */}
          <div className="bg-[#fffdf9] border border-[#ebdccb] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold">3</span>
                Magical Element (What magic exists in the story?)
              </label>
              <span className="text-xs text-stone-500 italic">Unsur magis / keajaiban</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {MAGICAL_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onUpdate({ magicalElement: opt })}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer border ${
                    magicalElement === opt
                      ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                      : 'bg-[#faf6ee] text-stone-700 border-[#e5d4c0] hover:bg-[#f3ebd9]'
                  }`}
                >
                  {opt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onUpdate({ magicalElement: 'Other' })}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer border ${
                  magicalElement === 'Other'
                    ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                    : 'bg-[#faf6ee] text-stone-700 border-[#e5d4c0] hover:bg-[#f3ebd9]'
                }`}
              >
                + Other (Tulis sendiri)
              </button>
            </div>

            {magicalElement === 'Other' && (
              <input
                type="text"
                value={customMagicalElement || ''}
                onChange={(e) => onUpdate({ customMagicalElement: e.target.value })}
                placeholder="e.g. A glowing pearl that grants breathing underwater"
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            )}
          </div>

          {/* Moral Value */}
          <div className="bg-[#fffdf9] border border-[#ebdccb] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center text-xs font-bold">4</span>
                Moral Value (What lesson will readers learn?)
              </label>
              <span className="text-xs text-stone-500 italic">Pesan moral / nilai budi pekerti</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {MORAL_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onUpdate({ moralValue: opt })}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer border ${
                    moralValue === opt
                      ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                      : 'bg-[#faf6ee] text-stone-700 border-[#e5d4c0] hover:bg-[#f3ebd9]'
                  }`}
                >
                  {opt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onUpdate({ moralValue: 'Other' })}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer border ${
                  moralValue === 'Other'
                    ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                    : 'bg-[#faf6ee] text-stone-700 border-[#e5d4c0] hover:bg-[#f3ebd9]'
                }`}
              >
                + Other (Tulis sendiri)
              </button>
            </div>

            {moralValue === 'Other' && (
              <input
                type="text"
                value={customMoralValue || ''}
                onChange={(e) => onUpdate({ customMoralValue: e.target.value })}
                placeholder="e.g. Always keep your promise even when it is hard"
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            )}
          </div>
        </div>
      )}

      {/* SECTION B: CHARACTERS (2–3 characters) */}
      {(activeTab === 'characters' || window.innerWidth >= 1024) && (
        <div className="bg-[#fffdf9] border border-[#ebdccb] rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-800" />
                Characters (Tokoh Cerita • 2–3 characters)
              </h3>
              <p className="text-xs text-stone-500">
                Give each character a name, role, 2–3 personality traits, and short appearance.
              </p>
            </div>

            {characters.length < 3 && (
              <button
                type="button"
                onClick={handleAddCharacter}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300/80 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Character
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((char, index) => (
              <div
                key={char.id}
                className="bg-[#faf6ee] border border-[#e4d4be] rounded-xl p-4 space-y-3 relative flex flex-col justify-between"
              >
                {/* Header of character card */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md">
                    Character #{index + 1}
                  </span>
                  {characters.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCharacter(char.id)}
                      className="text-stone-400 hover:text-red-600 transition p-1"
                      title="Remove character"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Name (Nama)
                  </label>
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => handleUpdateCharacter(char.id, { name: e.target.value })}
                    placeholder="e.g. Sari, Rangga, or Kala"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#d6c4ae] bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Role (Peran)
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['Hero', 'Villain', 'Helper'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleUpdateCharacter(char.id, { role: r })}
                        className={`text-xs py-1.5 rounded-lg font-medium transition cursor-pointer ${
                          char.role === r
                            ? r === 'Hero'
                              ? 'bg-emerald-700 text-white font-bold'
                              : r === 'Villain'
                              ? 'bg-rose-700 text-white font-bold'
                              : 'bg-amber-700 text-white font-bold'
                            : 'bg-white text-stone-600 border border-[#d6c4ae] hover:bg-stone-50'
                        }`}
                      >
                        {r === 'Hero' ? '⭐ Hero' : r === 'Villain' ? '⚡ Villain' : '🤝 Helper'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personality Adjectives */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-700">
                      Personality (Sifat: pick 2–3)
                    </label>
                    <span className="text-[10px] text-stone-500">
                      {char.adjectives.length}/3 selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-white/70 border border-[#e2d2bd] rounded-lg">
                    {ADJECTIVE_OPTIONS.map((adj) => {
                      const selected = char.adjectives.includes(adj);
                      return (
                        <button
                          key={adj}
                          type="button"
                          onClick={() => handleToggleAdjective(char.id, adj)}
                          className={`text-[11px] px-2 py-0.5 rounded-md transition cursor-pointer font-medium ${
                            selected
                              ? 'bg-amber-800 text-white shadow-2xs'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {adj}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Appearance */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Appearance (Ciri Fisik)
                  </label>
                  <input
                    type="text"
                    value={char.appearance}
                    onChange={(e) => handleUpdateCharacter(char.id, { appearance: e.target.value })}
                    placeholder="e.g. wears a green scarf, tall with silver eyes"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#d6c4ae] bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION C: ASK THE COACH */}
      <div className="bg-[#fff9ef] border-2 border-amber-300/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-900 flex items-center justify-center shrink-0">
              <Lightbulb className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Coach Riko&rsquo;s &ldquo;What if...?&rdquo; Spark
              </h3>
              <p className="text-xs text-stone-600">
                Ask your AI story coach for 2–3 creative questions to guide your plot. (The coach guides you — you write the story!)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAskCoach}
            disabled={isAskingCoach}
            className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer shrink-0"
          >
            {isAskingCoach ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>The coach is thinking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Ask the Coach</span>
              </>
            )}
          </button>
        </div>

        {/* Coach loading message */}
        {isAskingCoach && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center animate-pulse">
            <p className="text-sm font-medium text-amber-900">
              The coach is thinking... (Coach Riko sedang membaca ide ceritamu...)
            </p>
          </div>
        )}

        {/* Coach error */}
        {coachError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-2 text-xs text-red-800">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{coachError}</span>
            </div>
            <button
              type="button"
              onClick={handleAskCoach}
              className="text-xs font-bold underline hover:text-red-950 cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {/* Coach feedback display */}
        {coachIdeasFeedback && !isAskingCoach && (
          <div className="space-y-4 pt-2">
            {/* Greeting */}
            <div className="bg-white/90 border border-amber-200/90 rounded-xl p-3.5 shadow-2xs">
              <IndonesianToggle
                englishText={coachIdeasFeedback.greeting}
                indonesianText={coachIdeasFeedback.greeting_id}
              />
            </div>

            {/* Guiding Questions */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Guiding &ldquo;What if...?&rdquo; Questions:
              </div>

              {coachIdeasFeedback.questions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-white/90 border border-amber-200 rounded-xl p-3.5 shadow-2xs"
                >
                  <div className="text-xs font-bold text-amber-800 mb-1">
                    Question #{idx + 1}:
                  </div>
                  <IndonesianToggle
                    englishText={q}
                    indonesianText={coachIdeasFeedback.questions_id[idx] || q}
                  />
                </div>
              ))}
            </div>

            {/* Encouragement */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="flex-1">
                <IndonesianToggle
                  englishText={coachIdeasFeedback.encouragement}
                  indonesianText={coachIdeasFeedback.encouragement_id}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#ebdccb]">
        <div className="text-xs text-stone-500 font-medium">
          Ready to write? You can come back and edit your ideas anytime.
        </div>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 active:scale-[0.99] text-white font-semibold py-3 px-6 rounded-xl shadow-md transition cursor-pointer text-sm"
        >
          <span>Continue to Step 2: Write</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
