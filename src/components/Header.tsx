import React from 'react';
import { Sparkles, BookOpen, RefreshCw, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  studentName: string;
  studentClass: string;
  currentStep: number;
  onReset: () => void;
  onGoToStep: (step: number) => void;
  isSaved?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  studentName,
  studentClass,
  currentStep,
  onReset,
  onGoToStep,
  isSaved = true,
}) => {
  return (
    <header className="no-print bg-[#fbf6ec]/95 backdrop-blur-sm border-b border-[#ebdccb] sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div 
          onClick={() => onGoToStep(0)} 
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Return to Start Screen"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-700/10 border border-amber-800/20 flex items-center justify-center text-amber-900 group-hover:scale-105 transition-transform shadow-xs">
            <BookOpen className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-title font-bold text-lg text-[#3c2a1e] tracking-wide">
                Fairy Tale Studio
              </span>
              <Sparkles className="w-4 h-4 text-amber-600 inline" />
            </div>
            <p className="text-[11px] text-amber-800/80 font-medium">
              AI Story Coach • SMP Kelas 9 (CEFR A2–B1)
            </p>
          </div>
        </div>

        {/* Student info & Save indicator */}
        <div className="flex items-center gap-3">
          {studentName && currentStep > 0 && (
            <div className="hidden sm:flex items-center gap-2 bg-amber-50/80 border border-amber-200/80 rounded-full px-3 py-1 text-xs text-amber-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold">{studentName}</span>
              {studentClass && <span className="text-amber-700">({studentClass})</span>}
            </div>
          )}

          {currentStep > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium bg-stone-100/80 px-2.5 py-1 rounded-full border border-stone-200/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xs:inline">Auto-saved</span>
            </div>
          )}

          {currentStep > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-red-700 bg-white/80 hover:bg-red-50 border border-stone-300 hover:border-red-200 rounded-lg px-2.5 py-1.5 transition cursor-pointer"
              title="Start a new fairy tale"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">New Story</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
