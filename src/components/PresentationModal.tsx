import React, { useState, useEffect } from 'react';
import { StoryData } from '../types';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  Award,
  Maximize2
} from 'lucide-react';
import { WatercolorCoverCanvas } from './WatercolorCoverCanvas';

interface PresentationModalProps {
  storyData: StoryData;
  onClose: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  storyData,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  const {
    title,
    studentName,
    studentClass,
    orientation,
    complication,
    resolution,
    moralValue,
    customMoralValue,
    coverImageUrl,
    setting,
    characters,
    magicalElement,
  } = storyData;

  const finalMoral = moralValue === 'Other' ? customMoralValue : moralValue;

  const totalPages = 4;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-[#221c16]/95 backdrop-blur-md flex flex-col justify-between text-stone-900 select-none overflow-hidden animate-fadeIn">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#191410]/80 border-b border-[#3d3227] text-white">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span className="font-serif-story font-bold text-base sm:text-lg text-amber-100 truncate max-w-md">
            {title || 'Fairy Tale'}
          </span>
          <span className="hidden sm:inline text-xs text-amber-300/70 border border-amber-300/30 px-2 py-0.5 rounded-full">
            Presentation Mode (Mode Retelling)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-300 font-mono">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition cursor-pointer"
            title="Exit Presentation Mode (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex items-center justify-center">
        {/* Page 0: Cover Slide */}
        {currentPage === 0 && (
          <div className="bg-[#fffdf9] rounded-3xl p-6 sm:p-10 border border-[#ebdccb] shadow-2xl w-full max-w-2xl text-center flex flex-col items-center justify-center space-y-6 animate-fadeIn">
            {coverImageUrl ? (
              <div className="w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-4 border-amber-200/80">
                <img
                  src={coverImageUrl}
                  alt="Story Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-48 sm:w-56">
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

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                Narrative Text Presentation
              </span>
              <h1 className="font-serif-story font-bold text-3xl sm:text-4xl text-stone-900 leading-tight">
                {title || 'The Magical Fairy Tale'}
              </h1>
              <p className="text-stone-600 text-lg sm:text-xl font-serif-story">
                Retold by <strong>{studentName || 'Student'}</strong> (Class {studentClass || '9'})
              </p>
            </div>

            <p className="text-xs text-stone-400 italic">
              Press Next or Right Arrow key to begin retelling your story →
            </p>
          </div>
        )}

        {/* Page 1: Orientation */}
        {currentPage === 1 && (
          <div className="bg-[#fffdf9] rounded-3xl p-6 sm:p-12 border border-[#ebdccb] shadow-2xl w-full max-w-3xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center font-bold text-lg">
                  1
                </span>
                <div>
                  <h2 className="font-serif-story font-bold text-2xl sm:text-3xl text-stone-900">
                    Orientation
                  </h2>
                  <span className="text-xs text-amber-800 font-medium">
                    Who? Where? When?
                  </span>
                </div>
              </div>
              <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">
                Part I
              </span>
            </div>

            <div className="py-2">
              <p className="font-serif-story text-xl sm:text-2xl sm:leading-relaxed text-stone-900 whitespace-pre-wrap selection:bg-amber-100">
                {orientation || 'No orientation text written yet.'}
              </p>
            </div>
          </div>
        )}

        {/* Page 2: Complication */}
        {currentPage === 2 && (
          <div className="bg-[#fffdf9] rounded-3xl p-6 sm:p-12 border border-[#ebdccb] shadow-2xl w-full max-w-3xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-rose-200/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-rose-700 text-white flex items-center justify-center font-bold text-lg">
                  2
                </span>
                <div>
                  <h2 className="font-serif-story font-bold text-2xl sm:text-3xl text-stone-900">
                    Complication
                  </h2>
                  <span className="text-xs text-rose-800 font-medium">
                    The Problem & The Challenge
                  </span>
                </div>
              </div>
              <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">
                Part II
              </span>
            </div>

            <div className="py-2">
              <p className="font-serif-story text-xl sm:text-2xl sm:leading-relaxed text-stone-900 whitespace-pre-wrap selection:bg-rose-100">
                {complication || 'No complication text written yet.'}
              </p>
            </div>
          </div>
        )}

        {/* Page 3: Resolution & Moral */}
        {currentPage === 3 && (
          <div className="bg-[#fffdf9] rounded-3xl p-6 sm:p-12 border border-[#ebdccb] shadow-2xl w-full max-w-3xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-emerald-200/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg">
                  3
                </span>
                <div>
                  <h2 className="font-serif-story font-bold text-2xl sm:text-3xl text-stone-900">
                    Resolution & Moral
                  </h2>
                  <span className="text-xs text-emerald-800 font-medium">
                    How it was solved and the life lesson
                  </span>
                </div>
              </div>
              <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">
                Part III
              </span>
            </div>

            <div className="py-2">
              <p className="font-serif-story text-xl sm:text-2xl sm:leading-relaxed text-stone-900 whitespace-pre-wrap selection:bg-emerald-100 mb-6">
                {resolution || 'No resolution text written yet.'}
              </p>

              {finalMoral && (
                <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-amber-800" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block mb-0.5">
                      Moral of the Story (Pesan Moral):
                    </span>
                    <p className="font-serif-story text-base sm:text-lg font-semibold text-stone-900">
                      &ldquo;{finalMoral}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="bg-[#191410]/90 border-t border-[#3d3227] px-6 py-4 flex items-center justify-between text-white">
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentPage(idx)}
              className={`w-3 h-3 rounded-full transition cursor-pointer ${
                currentPage === idx
                  ? 'bg-amber-400 scale-125'
                  : 'bg-stone-600 hover:bg-stone-500'
              }`}
              title={`Jump to page ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={currentPage === totalPages - 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed font-medium text-sm transition cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
