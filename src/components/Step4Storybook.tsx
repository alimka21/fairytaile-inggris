import React, { useState } from 'react';
import { StoryData } from '../types';
import { 
  BookMarked, 
  Sparkles, 
  Printer, 
  Play, 
  ArrowLeft, 
  Edit3, 
  RefreshCw, 
  Award,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { WatercolorCoverCanvas } from './WatercolorCoverCanvas';
import { PresentationModal } from './PresentationModal';

interface Step4StorybookProps {
  storyData: StoryData;
  onUpdate: (partial: Partial<StoryData>) => void;
  onPrev: () => void;
}

export const Step4Storybook: React.FC<Step4StorybookProps> = ({
  storyData,
  onUpdate,
  onPrev,
}) => {
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverError, setCoverError] = useState('');
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  const {
    title,
    studentName,
    studentClass,
    setting,
    problem,
    moralValue,
    customMoralValue,
    characters,
    magicalElement,
    orientation,
    complication,
    resolution,
    coverImageUrl,
    coverRegenCount = 0,
  } = storyData;

  const finalMoral = moralValue === 'Other' ? customMoralValue : moralValue;
  const maxRegens = 3;
  const regensRemaining = Math.max(0, maxRegens - coverRegenCount);

  // Generate Cover Illustration using Gemini model on server
  const handleGenerateCover = async () => {
    if (regensRemaining <= 0) return;
    setIsGeneratingCover(true);
    setCoverError('');

    try {
      const response = await fetch('/api/coach/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          setting,
          characters,
          magicalElement,
        }),
      });

      const data = await response.json();
      if (data.imageUrl) {
        onUpdate({
          coverImageUrl: data.imageUrl,
          coverRegenCount: coverRegenCount + 1,
        });
      } else {
        // Fallback or warning
        onUpdate({
          coverRegenCount: coverRegenCount + 1,
        });
        if (data.error) {
          setCoverError('Image generation model responded: ' + data.error + '. Showing your custom watercolor cover design!');
        }
      }
    } catch (e: any) {
      console.error(e);
      setCoverError('Could not reach image generator. Showing your custom watercolor canvas cover!');
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Intro & Controls Header (Hidden in Print) */}
      <div className="no-print bg-[#fffdf9] border border-[#ebdccb] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full mb-1.5">
              <BookMarked className="w-3.5 h-3.5" />
              Step 4 of 4 • Final Storybook
            </div>
            <h2 className="font-serif-story text-2xl font-bold text-stone-900">
              My Fairy Tale Storybook
            </h2>
            <p className="text-stone-600 text-sm mt-0.5">
              Your fairy tale is complete! Generate a cover, present in front of class, or print/save as PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPresentationOpen(true)}
              className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              title="Full screen slide mode to retell in front of class"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Presentation Mode</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#f4ece1] hover:bg-[#ebdccb] text-stone-800 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[#d8c5b0] transition cursor-pointer"
              title="Print storybook or save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cover Generation Controls Card (Hidden in Print) */}
      <div className="no-print bg-[#fff9ef] border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-900 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                Gemini AI Storybook Cover Illustration
              </h3>
              <p className="text-xs text-stone-600">
                Style: Soft watercolor children&rsquo;s storybook. Limit: 3 generations to save time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              {regensRemaining} / {maxRegens} left
            </span>

            <button
              type="button"
              onClick={handleGenerateCover}
              disabled={isGeneratingCover || regensRemaining <= 0}
              className="flex items-center gap-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition cursor-pointer"
            >
              {isGeneratingCover ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Mixing watercolors...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {coverImageUrl ? 'Regenerate Cover' : 'Generate Cover Image'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading notice */}
        {isGeneratingCover && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center animate-pulse text-xs text-amber-900 font-medium">
            🎨 Mixing soft watercolor paints and painting your fairy tale characters and setting...
          </div>
        )}

        {/* Error notice */}
        {coverError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{coverError}</span>
          </div>
        )}
      </div>

      {/* STORYBOOK DISPLAY CONTAINER (Formatted for reading & printing) */}
      <div className="print-page bg-[#fffdfa] border-2 border-[#ebdccb] rounded-3xl p-6 sm:p-12 shadow-lg space-y-10 relative overflow-hidden">
        {/* Story Title & Author Banner */}
        <div className="text-center space-y-3 border-b-2 border-[#ebdccb]/70 pb-8">
          <div className="no-print max-w-lg mx-auto mb-2">
            <label 
              htmlFor="storybook-title"
              className="text-[11px] uppercase font-bold text-stone-500 tracking-wider flex items-center justify-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" /> Click title to edit
            </label>
            <input
              id="storybook-title"
              type="text"
              value={title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full text-center font-serif-story font-bold text-2xl sm:text-4xl text-stone-900 border-b border-dashed border-amber-400 focus:border-amber-700 focus:outline-none bg-transparent py-1"
              placeholder="Title of Your Story"
            />
          </div>

          <div className="hidden print:block font-serif-story font-bold text-3xl text-stone-900">
            {title || 'My Fairy Tale'}
          </div>

          <p className="font-serif-story text-base sm:text-lg text-amber-900 font-medium">
            Written by <strong>{studentName || 'Student Name'}</strong> • Class{' '}
            <strong>{studentClass || '9'}</strong>
          </p>
        </div>

        {/* Cover Illustration Showcase */}
        <div className="flex flex-col items-center justify-center">
          {coverImageUrl ? (
            <div className="relative group max-w-sm rounded-2xl overflow-hidden shadow-xl border-4 border-[#ebdccb]">
              <img
                src={coverImageUrl}
                alt="Storybook Cover"
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="no-print absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded">
                AI Watercolor Cover
              </div>
            </div>
          ) : (
            <div className="w-full max-w-sm">
              <WatercolorCoverCanvas
                title={title}
                setting={setting}
                characters={characters}
                studentName={studentName}
                studentClass={studentClass}
                magicalElement={magicalElement}
              />
            </div>
          )}
        </div>

        {/* Narrative Text Story Layout */}
        <div className="space-y-8 max-w-2xl mx-auto font-serif-story text-stone-900">
          {/* Part 1: Orientation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-amber-200 pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Part I: Orientation (Pengenalan)
              </span>
            </div>
            <p className="text-base sm:text-lg leading-relaxed text-justify whitespace-pre-wrap first-letter:text-4xl first-letter:font-bold first-letter:text-amber-900 first-letter:float-left first-letter:mr-2">
              {orientation || 'No orientation text yet.'}
            </p>
          </div>

          {/* Part 2: Complication */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-rose-200 pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
                Part II: Complication (Masalah / Konflik)
              </span>
            </div>
            <p className="text-base sm:text-lg leading-relaxed text-justify whitespace-pre-wrap">
              {complication || 'No complication text yet.'}
            </p>
          </div>

          {/* Part 3: Resolution */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b border-emerald-200 pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Part III: Resolution (Penyelesaian)
              </span>
            </div>
            <p className="text-base sm:text-lg leading-relaxed text-justify whitespace-pre-wrap">
              {resolution || 'No resolution text yet.'}
            </p>
          </div>

          {/* Moral of the Story Ribbon */}
          {finalMoral && (
            <div className="mt-8 bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 text-center shadow-xs">
              <div className="w-8 h-8 mx-auto mb-2 bg-amber-200/80 rounded-full flex items-center justify-center text-amber-900">
                <Award className="w-4 h-4 text-amber-800" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-900 block mb-1">
                The Moral of the Story:
              </span>
              <p className="font-serif-story text-base sm:text-lg font-bold text-stone-900 italic">
                &ldquo;{finalMoral}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Storybook Footer Seal */}
        <div className="text-center pt-6 border-t border-[#ebdccb] text-xs text-stone-500 font-serif-story">
          ✦ Grade 9 English Narrative Text Portfolio • Fairy Tale Studio ✦
        </div>
      </div>

      {/* Navigation Footer (Hidden in Print) */}
      <div className="no-print flex items-center justify-between pt-4 border-t border-[#ebdccb]">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 bg-[#f4ece1] hover:bg-[#ebdccb] text-stone-800 font-semibold py-3 px-5 rounded-xl border border-[#d8c5b0] transition cursor-pointer text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Check & Edit</span>
        </button>

        <button
          type="button"
          onClick={() => setIsPresentationOpen(true)}
          className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition cursor-pointer text-sm"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Present Story to Class</span>
        </button>
      </div>

      {/* Presentation Mode Modal */}
      {isPresentationOpen && (
        <PresentationModal
          storyData={storyData}
          onClose={() => setIsPresentationOpen(false)}
        />
      )}
    </div>
  );
};
