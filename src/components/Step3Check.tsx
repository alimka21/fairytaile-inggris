import React, { useState } from 'react';
import { StoryData, StoryFeedback } from '../types';
import { countWords } from '../utils/storage';
import { IndonesianToggle } from './IndonesianToggle';
import { 
  CheckSquare, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft,
  Eye,
  EyeOff,
  Flame,
  Sprout,
  Edit3
} from 'lucide-react';

interface Step3CheckProps {
  storyData: StoryData;
  onUpdate: (partial: Partial<StoryData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step3Check: React.FC<Step3CheckProps> = ({
  storyData,
  onUpdate,
  onNext,
  onPrev,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Track which language error answers are revealed by student
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const {
    orientation,
    complication,
    resolution,
    setting,
    moralValue,
    customMoralValue,
    characters,
    checkFeedback,
  } = storyData;

  const totalWords = countWords(orientation) + countWords(complication) + countWords(resolution);

  const toggleAnswer = (index: number) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCheckStory = async () => {
    setIsChecking(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/coach/check-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orientation,
          complication,
          resolution,
          setting,
          moral: moralValue === 'Other' ? customMoralValue : moralValue,
          characters,
        }),
      });

      if (!response.ok) {
        throw new Error('Coach service encountered an error.');
      }

      const data: StoryFeedback = await response.json();
      onUpdate({ checkFeedback: data });
      setRevealedAnswers({});
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Coach Riko could not check your story at this time. Please check connection and try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Intro Header */}
      <div className="bg-[#fffdf9] border border-[#ebdccb] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full mb-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              Step 3 of 4 • Story Coach Feedback
            </div>
            <h2 className="font-serif-story text-2xl font-bold text-stone-900">
              Check & Edit Your Story
            </h2>
            <p className="text-stone-600 text-sm mt-0.5">
              Let Coach Riko analyze your structure, grammar, and style. You can edit directly below!
            </p>
          </div>

          <button
            type="button"
            onClick={handleCheckStory}
            disabled={isChecking}
            className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-md transition cursor-pointer shrink-0"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>The coach is thinking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{checkFeedback ? 'Check Again (Periksa Lagi)' : 'Check My Story (Periksa Cerita)'}</span>
              </>
            )}
          </button>
        </div>

        {/* Word count notice */}
        <div className="mt-4 pt-3 border-t border-[#ebdccb]/60 flex items-center justify-between text-xs text-stone-500">
          <span>Current draft: <strong className="text-stone-800">{totalWords} words</strong></span>
          {totalWords < 150 && (
            <span className="text-amber-700 font-medium">
              ⚠️ Recommendation: aim for at least 150 words total.
            </span>
          )}
        </div>
      </div>

      {/* Loading Banner */}
      {isChecking && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-6 text-center animate-pulse space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-amber-200/80 flex items-center justify-center text-amber-900">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <h4 className="font-bold text-amber-950 text-base">
            Coach Riko is reading your story...
          </h4>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            Checking narrative structure (Orientation, Complication, Resolution) and language hints.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-sm text-red-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={handleCheckStory}
            className="text-xs font-bold underline hover:text-red-950 cursor-pointer shrink-0"
          >
            Try again
          </button>
        </div>
      )}

      {/* COACH RESULTS CARDS */}
      {checkFeedback && !isChecking && (
        <div className="space-y-6">
          {/* Overall Encouraging Comment */}
          <div className="bg-[#fff9ef] border-2 border-amber-300 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🦉</span>
              <h3 className="font-serif-story font-bold text-base text-stone-900">
                Coach Riko&rsquo;s Overview:
              </h3>
            </div>
            <IndonesianToggle
              englishText={checkFeedback.overall_feedback}
              indonesianText={checkFeedback.overall_feedback_id}
            />
          </div>

          {/* 1. Structure Checklist */}
          <div className="bg-[#fffdf9] border border-[#ebdccb] rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              1. Narrative Structure Checklist
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Orientation card */}
              <div className="bg-[#faf6ee] border border-[#e5d4c0] rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">Orientation</span>
                  {checkFeedback.structure.orientation.status === 'yes' ? (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Clear
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      ⚠️ Needs work
                    </span>
                  )}
                </div>
                <IndonesianToggle
                  englishText={checkFeedback.structure.orientation.note}
                  indonesianText={checkFeedback.structure.orientation.note_id}
                  className="text-xs"
                />
              </div>

              {/* Complication card */}
              <div className="bg-[#faf6ee] border border-[#e5d4c0] rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">Complication</span>
                  {checkFeedback.structure.complication.status === 'yes' ? (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Clear
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      ⚠️ Needs work
                    </span>
                  )}
                </div>
                <IndonesianToggle
                  englishText={checkFeedback.structure.complication.note}
                  indonesianText={checkFeedback.structure.complication.note_id}
                  className="text-xs"
                />
              </div>

              {/* Resolution card */}
              <div className="bg-[#faf6ee] border border-[#e5d4c0] rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">Resolution</span>
                  {checkFeedback.structure.resolution.status === 'yes' ? (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Clear
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      ⚠️ Needs work
                    </span>
                  )}
                </div>
                <IndonesianToggle
                  englishText={checkFeedback.structure.resolution.note}
                  indonesianText={checkFeedback.structure.resolution.note_id}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* 2. Glow & Grow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Glow (Strengths) */}
            <div className="bg-[#f0f9f4] border border-[#c7e9d7] rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-200/80 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  ⭐
                </div>
                <h4 className="font-bold text-emerald-950 text-sm uppercase tracking-wide">
                  Glow (2 Strengths / Kelebihan Ceritamu)
                </h4>
              </div>

              <div className="space-y-2.5">
                {checkFeedback.glow.map((item, idx) => (
                  <div key={idx} className="bg-white/80 rounded-xl p-3 border border-emerald-200/70 text-xs shadow-2xs">
                    <IndonesianToggle
                      englishText={item}
                      indonesianText={checkFeedback.glow_id[idx] || item}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Grow (Areas to improve) */}
            <div className="bg-[#fff8f0] border border-[#ebdccb] rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center font-bold text-sm">
                  🌱
                </div>
                <h4 className="font-bold text-amber-950 text-sm uppercase tracking-wide">
                  Grow (2 Things to Improve / Langkah Perbaikan)
                </h4>
              </div>

              <div className="space-y-2.5">
                {checkFeedback.grow.map((item, idx) => (
                  <div key={idx} className="bg-white/80 rounded-xl p-3 border border-amber-200/70 text-xs shadow-2xs">
                    <IndonesianToggle
                      englishText={item}
                      indonesianText={checkFeedback.grow_id[idx] || item}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Language & Grammar Cards */}
          <div className="bg-[#fffdf9] border border-[#ebdccb] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-700" />
                  Language & Grammar Checks (Up to 5 Hints)
                </h3>
                <p className="text-xs text-stone-500">
                  Read each hint first. Try to fix it yourself, or click &ldquo;Show Answer&rdquo; to see the suggested correction!
                </p>
              </div>
              <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                {checkFeedback.language_errors.length} item{checkFeedback.language_errors.length === 1 ? '' : 's'}
              </span>
            </div>

            {checkFeedback.language_errors.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-xs font-medium text-emerald-900">
                🎉 Excellent job! Coach Riko did not find any major grammar or spelling errors in this draft.
              </div>
            ) : (
              <div className="space-y-3">
                {checkFeedback.language_errors.map((err, index) => {
                  const isRevealed = revealedAnswers[index];
                  return (
                    <div
                      key={index}
                      className="bg-[#faf6ee] border border-[#e5d4c0] rounded-xl p-4 space-y-3 shadow-2xs"
                    >
                      {/* Original text snippet */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ebdccb] pb-2">
                        <div className="text-xs text-stone-600">
                          <span className="font-bold text-stone-800">Original phrase:</span>{' '}
                          <span className="bg-amber-100/90 text-amber-950 px-2 py-0.5 rounded font-mono text-xs">
                            &ldquo;{err.original}&rdquo;
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-stone-400">
                          Hint #{index + 1}
                        </span>
                      </div>

                      {/* Coach Hint (no direct answer given yet) */}
                      <div>
                        <div className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Coach&rsquo;s Hint:
                        </div>
                        <IndonesianToggle
                          englishText={err.hint}
                          indonesianText={err.hint_id}
                          className="text-xs"
                        />
                      </div>

                      {/* Hidden Answer Toggle */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => toggleAnswer(index)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 transition cursor-pointer"
                        >
                          {isRevealed ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                              <span>Hide Answer (Sembunyikan)</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-amber-700" />
                              <span>Show Answer (Tampilkan Jawaban & Penjelasan)</span>
                            </>
                          )}
                        </button>

                        {isRevealed && (
                          <div className="mt-3 p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-1.5 text-xs animate-fadeIn">
                            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              Suggested fix:{' '}
                              <span className="font-mono bg-white px-2 py-0.5 rounded text-emerald-900 border border-emerald-300">
                                {err.answer}
                              </span>
                            </div>
                            <div className="text-emerald-900/90 text-[11px] pt-1">
                              <strong>Why:</strong> {err.explanation}
                              <div className="text-stone-500 italic mt-0.5">
                                {err.explanation_id}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DIRECT EDITING SECTION */}
      <div className="bg-[#fffdf9] border-2 border-[#e5d4c0] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-800" />
            <h3 className="font-serif-story font-bold text-stone-900 text-lg">
              Edit Your Story Here
            </h3>
          </div>
          <span className="text-xs text-stone-500">
            Changes save automatically
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Orientation
            </label>
            <textarea
              rows={3}
              value={orientation}
              onChange={(e) => onUpdate({ orientation: e.target.value })}
              className="w-full p-3 rounded-xl border border-[#dfd0be] bg-[#faf6ee] text-stone-900 text-sm focus:outline-none focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Complication
            </label>
            <textarea
              rows={4}
              value={complication}
              onChange={(e) => onUpdate({ complication: e.target.value })}
              className="w-full p-3 rounded-xl border border-[#dfd0be] bg-[#faf6ee] text-stone-900 text-sm focus:outline-none focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Resolution
            </label>
            <textarea
              rows={4}
              value={resolution}
              onChange={(e) => onUpdate({ resolution: e.target.value })}
              className="w-full p-3 rounded-xl border border-[#dfd0be] bg-[#faf6ee] text-stone-900 text-sm focus:outline-none focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#ebdccb]">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 bg-[#f4ece1] hover:bg-[#ebdccb] text-stone-800 font-semibold py-3 px-5 rounded-xl border border-[#d8c5b0] transition cursor-pointer text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Write</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 active:scale-[0.99] text-white font-semibold py-3 px-6 rounded-xl shadow-md transition cursor-pointer text-sm"
        >
          <span>Ready to View My Storybook</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
