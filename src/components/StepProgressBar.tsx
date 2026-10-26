import React from 'react';
import { Compass, Feather, CheckSquare, BookMarked } from 'lucide-react';

interface StepProgressBarProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  maxReachedStep: number;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  onSelectStep,
  maxReachedStep,
}) => {
  const steps = [
    {
      step: 1,
      name: 'Idea & Characters',
      subtitle: 'Setting & Roles',
      icon: Compass,
    },
    {
      step: 2,
      name: 'Write',
      subtitle: 'Orientation, Complication, Resolution',
      icon: Feather,
    },
    {
      step: 3,
      name: 'Check & Edit',
      subtitle: 'Coach Feedback & Polish',
      icon: CheckSquare,
    },
    {
      step: 4,
      name: 'My Storybook',
      subtitle: 'Cover & Presentation',
      icon: BookMarked,
    },
  ];

  return (
    <nav aria-label="Story creation steps" className="no-print w-full bg-[#f6eee0]/70 border-b border-[#ebdccb] py-3 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            const isClickable = s.step <= Math.max(maxReachedStep, currentStep);

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => isClickable && onSelectStep(s.step)}
                disabled={!isClickable}
                className={`relative flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-3 px-2 py-2 sm:px-3 sm:py-2.5 rounded-xl transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-amber-800 text-white shadow-md ring-2 ring-amber-700/30 font-semibold'
                    : isCompleted
                    ? 'bg-[#ece0cc] text-stone-800 hover:bg-[#e4d4bd]'
                    : 'bg-[#f7efe3]/80 text-stone-400 cursor-not-allowed opacity-60'
                }`}
              >
                {/* Step indicator circle / icon */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isActive
                      ? 'bg-white text-amber-900 shadow-xs'
                      : isCompleted
                      ? 'bg-amber-800/15 text-amber-900'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Text */}
                <div className="min-w-0 flex flex-col text-center sm:text-left">
                  <div className="text-[10px] uppercase tracking-wider opacity-80 leading-none">
                    Step {s.step}
                  </div>
                  <div className="text-xs sm:text-sm font-medium truncate mt-0.5 leading-tight">
                    {s.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
