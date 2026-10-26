import React, { useState, useRef } from 'react';
import { StoryData, StuckHintResponse } from '../types';
import { countWords } from '../utils/storage';
import { IndonesianToggle } from './IndonesianToggle';
import { 
  Feather, 
  Sparkles, 
  Clock, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft,
  BookOpen,
  Info
} from 'lucide-react';

interface Step2WriteProps {
  storyData: StoryData;
  onUpdate: (partial: Partial<StoryData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const TIME_CONNECTIVES = [
  'Once upon a time,',
  'One day,',
  'A long time ago,',
  'Then,',
  'After that,',
  'Suddenly,',
  'Meanwhile,',
  'Finally,',
  'In the end,',
];

export const Step2Write: React.FC<Step2WriteProps> = ({
  storyData,
  onUpdate,
  onNext,
  onPrev,
}) => {
  const { orientation, complication, resolution } = storyData;

  // Track active textarea for time connectives insertion
  const [activeField, setActiveField] = useState<'orientation' | 'complication' | 'resolution'>('orientation');
  
  // Refs for inserting text at cursor position
  const orientationRef = useRef<HTMLTextAreaElement>(null);
  const complicationRef = useRef<HTMLTextAreaElement>(null);
  const resolutionRef = useRef<HTMLTextAreaElement>(null);

  // Stuck coach state
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [stuckHint, setStuckHint] = useState<StuckHintResponse | null>(null);
  const [hintError, setHintError] = useState('');

  // Calculate words
  const orientationWords = countWords(orientation);
  const complicationWords = countWords(complication);
  const resolutionWords = countWords(resolution);
  const totalWords = orientationWords + complicationWords + resolutionWords;

  // Word count status
  let wordBadgeColor = 'bg-stone-100 text-stone-700 border-stone-300';
  let wordMessage = 'Target: 150–300 words';

  if (totalWords === 0) {
    wordBadgeColor = 'bg-stone-100 text-stone-600 border-stone-200';
    wordMessage = 'Start writing your fairy tale!';
  } else if (totalWords < 150) {
    wordBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
    wordMessage = `${150 - totalWords} more words to reach target (150–300)`;
  } else if (totalWords <= 300) {
    wordBadgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    wordMessage = 'Target reached! Great length for Grade 9 narrative text.';
  } else {
    wordBadgeColor = 'bg-blue-100 text-blue-900 border-blue-300';
    wordMessage = 'Rich, detailed story! Check for clarity.';
  }

  // Handle connective click
  const handleInsertConnective = (phrase: string) => {
    let targetRef: React.RefObject<HTMLTextAreaElement | null>;
    let currentVal = '';
    let fieldKey: 'orientation' | 'complication' | 'resolution';

    if (activeField === 'orientation') {
      targetRef = orientationRef;
      currentVal = orientation;
      fieldKey = 'orientation';
    } else if (activeField === 'complication') {
      targetRef = complicationRef;
      currentVal = complication;
      fieldKey = 'complication';
    } else {
      targetRef = resolutionRef;
      currentVal = resolution;
      fieldKey = 'resolution';
    }

    const textarea = targetRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? currentVal.length;
      const end = textarea.selectionEnd ?? currentVal.length;
      
      const before = currentVal.substring(0, start);
      const after = currentVal.substring(end);
      
      // Add spaces appropriately
      const needsSpaceBefore = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n');
      const insertStr = (needsSpaceBefore ? ' ' : '') + phrase + ' ';
      const newVal = before + insertStr + after;
      
      onUpdate({ [fieldKey]: newVal });
      
      setTimeout(() => {
        textarea.focus();
        const cursorPosition = start + insertStr.length;
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      }, 50);
    } else {
      // Fallback: append
      const newVal = currentVal ? `${currentVal} ${phrase} ` : `${phrase} `;
      onUpdate({ [fieldKey]: newVal });
    }
  };

  // Handle "I'm stuck"
  const handleImStuck = async () => {
    setIsGettingHint(true);
    setHintError('');
    try {
      const response = await fetch('/api/coach/stuck-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part: activeField,
          orientationText: orientation,
          complicationText: complication,
          resolutionText: resolution,
          characters: storyData.characters,
          setting: storyData.setting,
          problem: storyData.problem,
        }),
      });

      if (!response.ok) {
        throw new Error('Coach was unable to generate hint');
      }

      const data = await response.json();
      setStuckHint(data);
    } catch (e: any) {
      console.error(e);
      setHintError('Coach Riko could not be reached right now. Try again in a moment.');
    } finally {
      setIsGettingHint(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Intro Header */}
      <div className="bg-[#fffdf9] border border-[#ebdccb] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full mb-1.5">
              <Feather className="w-3.5 h-3.5" />
              Step 2 of 4 • Draft Your Story
            </div>
            <h2 className="font-serif-story text-2xl font-bold text-stone-900">
              Write Your Fairy Tale
            </h2>
            <p className="text-stone-600 text-sm mt-0.5">
              Complete the three narrative parts. Use time connectives and simple past tense.
            </p>
          </div>

          {/* Word counter summary card */}
          <div className={`px-4 py-2.5 rounded-xl border font-medium text-xs sm:text-sm flex flex-col items-center sm:items-end ${wordBadgeColor}`}>
            <div className="flex items-center gap-1.5 font-bold">
              <span>{totalWords} / 150–300 words</span>
            </div>
            <span className="text-[11px] opacity-90">{wordMessage}</span>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="mt-4 pt-3 border-t border-[#ebdccb]/60 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-4">
            <span>Orientation: <strong>{orientationWords}w</strong></span>
            <span>•</span>
            <span>Complication: <strong>{complicationWords}w</strong></span>
            <span>•</span>
            <span>Resolution: <strong>{resolutionWords}w</strong></span>
          </div>
          <span className="hidden sm:inline italic text-[11px]">
            Tip: Click a section before inserting words
          </span>
        </div>
      </div>

      {/* Grammar Reminder & Connectives Toolbar */}
      <div className="bg-[#fbf7ee] border border-[#e8d8c3] rounded-2xl p-4 shadow-xs space-y-3">
        {/* Simple past tense reminder */}
        <div className="flex items-center gap-2 text-xs font-medium text-amber-950 bg-amber-100/60 border border-amber-200/80 rounded-xl px-3.5 py-2">
          <Info className="w-4 h-4 text-amber-800 shrink-0" />
          <span>
            <strong>Grammar Reminder:</strong> Use <em>Simple Past Tense</em> (e.g. <code>went</code>, <code>saw</code>, <code>lived</code>, <code>discovered</code>, <code>decided</code>, <code>helped</code>).
          </span>
        </div>

        {/* Time connectives */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-800" />
              Clickable Time Connectives (Kata Penghubung Waktu):
            </span>
            <span className="text-[11px] text-stone-500">
              Inserting into: <span className="font-bold text-amber-900 capitalize">{activeField}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TIME_CONNECTIVES.map((tc) => (
              <button
                key={tc}
                type="button"
                onClick={() => handleInsertConnective(tc)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 active:scale-95 border border-[#d8c7b2] text-stone-800 font-medium transition cursor-pointer shadow-2xs hover:border-amber-400"
                title={`Insert "${tc}" into ${activeField}`}
              >
                + {tc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* THREE NARRATIVE TEXT BOXES */}
      <div className="space-y-5">
        {/* 1. Orientation */}
        <div className={`bg-[#fffdf9] border-2 rounded-2xl p-5 shadow-xs transition ${
          activeField === 'orientation' ? 'border-amber-600/80 ring-2 ring-amber-200/50' : 'border-[#ebdccb]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label 
                htmlFor="orientation-box"
                className="font-serif-story text-base font-bold text-stone-900 flex items-center gap-2 cursor-pointer"
                onClick={() => setActiveField('orientation')}
              >
                <span className="w-6 h-6 rounded-lg bg-amber-700 text-white flex items-center justify-center text-xs font-bold">1</span>
                Orientation (Who? Where? When?)
              </label>
              <p className="text-xs text-stone-500 mt-0.5">
                Introduce your main characters, the magical setting, and when the adventure began.
              </p>
            </div>
            <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
              {orientationWords} words
            </span>
          </div>

          <textarea
            id="orientation-box"
            ref={orientationRef}
            rows={4}
            value={orientation}
            onFocus={() => setActiveField('orientation')}
            onChange={(e) => onUpdate({ orientation: e.target.value })}
            placeholder="e.g. Once upon a time, in an enchanted deep forest, lived a brave young boy named Rian. He had a golden deer friend named Kencana who possessed star footprints..."
            className="w-full p-3.5 rounded-xl border border-[#dfd0be] bg-[#faf6ee] text-stone-900 text-sm sm:text-base leading-relaxed placeholder:text-stone-400 focus:outline-none focus:bg-white transition"
          />
        </div>

        {/* 2. Complication */}
        <div className={`bg-[#fffdf9] border-2 rounded-2xl p-5 shadow-xs transition ${
          activeField === 'complication' ? 'border-amber-600/80 ring-2 ring-amber-200/50' : 'border-[#ebdccb]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label 
                htmlFor="complication-box"
                className="font-serif-story text-base font-bold text-stone-900 flex items-center gap-2 cursor-pointer"
                onClick={() => setActiveField('complication')}
              >
                <span className="w-6 h-6 rounded-lg bg-rose-700 text-white flex items-center justify-center text-xs font-bold">2</span>
                Complication (What problem happens?)
              </label>
              <p className="text-xs text-stone-500 mt-0.5">
                Describe the dangerous conflict, challenge, or crisis that puts your hero to the test.
              </p>
            </div>
            <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
              {complicationWords} words
            </span>
          </div>

          <textarea
            id="complication-box"
            ref={complicationRef}
            rows={5}
            value={complication}
            onFocus={() => setActiveField('complication')}
            onChange={(e) => onUpdate({ complication: e.target.value })}
            placeholder="e.g. One day, a greedy giant named Grom arrived and blocked the mountain river with massive rocks. The villagers had no water to drink. Rian decided to journey into the giant's dark cave..."
            className="w-full p-3.5 rounded-xl border border-[#dfd0be] bg-[#faf6ee] text-stone-900 text-sm sm:text-base leading-relaxed placeholder:text-stone-400 focus:outline-none focus:bg-white transition"
          />
        </div>

        {/* 3. Resolution */}
        <div className={`bg-[#fffdf9] border-2 rounded-2xl p-5 shadow-xs transition ${
          activeField === 'resolution' ? 'border-amber-600/80 ring-2 ring-amber-200/50' : 'border-[#ebdccb]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label 
                htmlFor="resolution-box"
                className="font-serif-story text-base font-bold text-stone-900 flex items-center gap-2 cursor-pointer"
                onClick={() => setActiveField('resolution')}
              >
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">3</span>
                Resolution (How is it solved? What is the moral?)
              </label>
              <p className="text-xs text-stone-500 mt-0.5">
                Explain how the characters resolved the problem, how the story ends, and what lesson was learned.
              </p>
            </div>
            <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
              {resolutionWords} words
            </span>
          </div>

          <textarea
            id="resolution-box"
            ref={resolutionRef}
            rows={5}
            value={resolution}
            onFocus={() => setActiveField('resolution')}
            onChange={(e) => onUpdate({ resolution: e.target.value })}
            placeholder="e.g. Finally, Kencana used its magical glowing antlers to illuminate the cave. Rian offered the giant sweet wild honey and spoke kindly. Touched by his kindness, Grom apologized and released the river water..."
            className="w-full p-3.5 rounded-xl border border-[#dfd0be] bg-[#faf6ee] text-stone-900 text-sm sm:text-base leading-relaxed placeholder:text-stone-400 focus:outline-none focus:bg-white transition"
          />
        </div>
      </div>

      {/* "I'M STUCK" COACH SECTION */}
      <div className="bg-[#fff9ef] border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-900 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Feeling Stuck? Ask Coach Riko!
              </h3>
              <p className="text-xs text-stone-600">
                The coach will give you ONE guiding question based on what you already wrote to get your words flowing again.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleImStuck}
            disabled={isGettingHint}
            className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer shrink-0"
          >
            {isGettingHint ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>The coach is thinking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>I&rsquo;m Stuck (Saya Bingung)</span>
              </>
            )}
          </button>
        </div>

        {/* Hint loading message */}
        {isGettingHint && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center animate-pulse text-xs font-medium text-amber-900">
            Coach Riko is reading your draft and thinking of a guiding question...
          </div>
        )}

        {/* Error message */}
        {hintError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{hintError}</span>
            </div>
            <button
              type="button"
              onClick={handleImStuck}
              className="text-xs font-bold underline hover:text-red-950 cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {/* Guiding Question card */}
        {stuckHint && !isGettingHint && (
          <div className="bg-white/95 border border-amber-200/90 rounded-xl p-4 shadow-2xs space-y-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Guiding Question for Your {activeField.toUpperCase()}:
              </div>
              <IndonesianToggle
                englishText={stuckHint.guidingQuestion}
                indonesianText={stuckHint.guidingQuestion_id}
              />
            </div>

            <div className="pt-2 border-t border-amber-100">
              <IndonesianToggle
                englishText={stuckHint.shortTip}
                indonesianText={stuckHint.shortTip_id}
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#ebdccb]">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 bg-[#f4ece1] hover:bg-[#ebdccb] text-stone-800 font-semibold py-3 px-5 rounded-xl border border-[#d8c5b0] transition cursor-pointer text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ideas</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 active:scale-[0.99] text-white font-semibold py-3 px-6 rounded-xl shadow-md transition cursor-pointer text-sm"
        >
          <span>Continue to Step 3: Check & Edit</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
