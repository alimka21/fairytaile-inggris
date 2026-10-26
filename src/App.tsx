/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoryData } from './types';
import { 
  DEFAULT_STORY_DATA, 
  loadSavedStory, 
  saveStory, 
  clearSavedStory 
} from './utils/storage';
import { Header } from './components/Header';
import { StepProgressBar } from './components/StepProgressBar';
import { StartScreen } from './components/StartScreen';
import { Step1Ideas } from './components/Step1Ideas';
import { Step2Write } from './components/Step2Write';
import { Step3Check } from './components/Step3Check';
import { Step4Storybook } from './components/Step4Storybook';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [savedStory, setSavedStory] = useState<StoryData | null>(null);
  const [storyData, setStoryData] = useState<StoryData>(DEFAULT_STORY_DATA);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(1);
  const [showResetModal, setShowResetModal] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadSavedStory();
    if (loaded) {
      setSavedStory(loaded);
      setStoryData(loaded);
      setMaxReachedStep(Math.max(1, loaded.currentStep || 1));
    }
  }, []);

  // Auto-save whenever storyData changes
  useEffect(() => {
    if (storyData.studentName || storyData.currentStep > 0) {
      saveStory(storyData);
    }
  }, [storyData]);

  const updateStoryData = (partial: Partial<StoryData>) => {
    setStoryData((prev) => {
      const next = { ...prev, ...partial };
      return next;
    });
  };

  const handleStartNewStory = (name: string, studentClass: string) => {
    const fresh: StoryData = {
      ...DEFAULT_STORY_DATA,
      studentName: name,
      studentClass: studentClass,
      currentStep: 1,
      lastUpdated: new Date().toISOString(),
    };
    setStoryData(fresh);
    setMaxReachedStep(1);
    saveStory(fresh);
  };

  const handleContinueStory = () => {
    if (savedStory) {
      const targetStep = savedStory.currentStep > 0 ? savedStory.currentStep : 1;
      setStoryData({
        ...savedStory,
        currentStep: targetStep,
      });
      setMaxReachedStep(Math.max(1, targetStep));
    }
  };

  const goToStep = (step: number) => {
    updateStoryData({ currentStep: step });
    if (step > maxReachedStep) {
      setMaxReachedStep(step);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmReset = () => {
    clearSavedStory();
    setSavedStory(null);
    setStoryData(DEFAULT_STORY_DATA);
    setMaxReachedStep(1);
    setShowResetModal(false);
  };

  return (
    <div className="min-h-screen bg-parchment flex flex-col text-stone-900 selection:bg-amber-200">
      {/* Top Header */}
      <Header
        studentName={storyData.studentName}
        studentClass={storyData.studentClass}
        currentStep={storyData.currentStep}
        onReset={() => setShowResetModal(true)}
        onGoToStep={goToStep}
      />

      {/* Progress Bar (Only visible when story is active, steps 1-4) */}
      {storyData.currentStep > 0 && (
        <StepProgressBar
          currentStep={storyData.currentStep}
          onSelectStep={goToStep}
          maxReachedStep={maxReachedStep}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 w-full pb-16">
        {storyData.currentStep === 0 && (
          <StartScreen
            initialName={storyData.studentName}
            initialClass={storyData.studentClass}
            savedStory={savedStory}
            onStartNew={handleStartNewStory}
            onContinue={handleContinueStory}
          />
        )}

        {storyData.currentStep === 1 && (
          <Step1Ideas
            storyData={storyData}
            onUpdate={updateStoryData}
            onNext={() => goToStep(2)}
          />
        )}

        {storyData.currentStep === 2 && (
          <Step2Write
            storyData={storyData}
            onUpdate={updateStoryData}
            onNext={() => goToStep(3)}
            onPrev={() => goToStep(1)}
          />
        )}

        {storyData.currentStep === 3 && (
          <Step3Check
            storyData={storyData}
            onUpdate={updateStoryData}
            onNext={() => goToStep(4)}
            onPrev={() => goToStep(2)}
          />
        )}

        {storyData.currentStep === 4 && (
          <Step4Storybook
            storyData={storyData}
            onUpdate={updateStoryData}
            onPrev={() => goToStep(3)}
          />
        )}
      </main>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fffdfa] border border-[#ebdccb] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif-story font-bold text-lg text-stone-900">
                Start New Story?
              </h3>
              <p className="text-xs text-stone-600">
                Are you sure? This will clear your current fairy tale draft. (Mulai cerita baru? Draf ceritamu saat ini akan direset.)
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                Cancel (Batal)
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Yes, Start New (Ya, Reset)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
