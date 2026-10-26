import React, { useState } from 'react';
import { BookOpen, Sparkles, ArrowRight, History, User, GraduationCap, Feather } from 'lucide-react';
import { StoryData } from '../types';

interface StartScreenProps {
  initialName: string;
  initialClass: string;
  savedStory: StoryData | null;
  onStartNew: (name: string, studentClass: string) => void;
  onContinue: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  initialName,
  initialClass,
  savedStory,
  onStartNew,
  onContinue,
}) => {
  const [name, setName] = useState(initialName || (savedStory?.studentName ?? ''));
  const [studentClass, setStudentClass] = useState(initialClass || (savedStory?.studentClass ?? ''));
  const [nameError, setNameError] = useState('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Please enter your name (Silakan masukkan namamu)');
      return;
    }
    setNameError('');
    onStartNew(name.trim(), studentClass.trim() || '9');
  };

  const hasSavedDraft = savedStory && (savedStory.orientation || savedStory.setting || savedStory.studentName);

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4 sm:p-6 bg-parchment">
      <div className="w-full max-w-xl bg-[#fffefb] rounded-3xl border border-[#ebdccb] shadow-xl p-6 sm:p-10 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-100/50 blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-emerald-100/40 blur-xl pointer-events-none" />

        {/* Hero Badge */}
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/70 border border-amber-300/60 rounded-full px-3.5 py-1 text-xs font-semibold text-amber-900 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Grade 9 English Narrative Text • SMP</span>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-700/10 border border-amber-800/20 rounded-2xl flex items-center justify-center text-amber-900 shadow-sm">
            <BookOpen className="w-8 h-8 text-amber-800" />
          </div>
          <h1 className="font-title text-3xl sm:text-4xl font-extrabold text-[#3a271a] tracking-tight mb-2">
            Fairy Tale Studio
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-medium max-w-md mx-auto leading-relaxed">
            Write your own fairy tale with your AI story coach.
          </p>
          <p className="text-xs text-amber-800/80 mt-1 italic">
            Tulis dongeng bahasa Inggrismu sendiri dengan bimbingan Coach AI.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleStart} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="studentName"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-amber-700" />
                Student Name (Nama Siswa) <span className="text-red-500">*</span>
              </label>
              <input
                id="studentName"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError('');
                }}
                placeholder="e.g. Siti Rahma / Budi Santoso"
                className={`w-full px-4 py-3 rounded-xl border bg-[#fbf8f2] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 transition text-sm ${
                  nameError
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-[#dfd0be] focus:border-amber-700 focus:ring-amber-200'
                }`}
                autoFocus
              />
              {nameError && (
                <p className="text-xs text-red-600 mt-1 font-medium">{nameError}</p>
              )}
            </div>

            <div>
              <label 
                htmlFor="studentClass"
                className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
                Class (Kelas)
              </label>
              <input
                id="studentClass"
                type="text"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="e.g. 9A, 9-B, 9.3"
                className="w-full px-4 py-3 rounded-xl border border-[#dfd0be] bg-[#fbf8f2] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:border-amber-700 focus:ring-amber-200 transition text-sm"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer text-sm sm:text-base"
            >
              <Feather className="w-4 h-4" />
              <span>Start New Story (Mulai Cerita Baru)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {hasSavedDraft && (
              <button
                type="button"
                onClick={onContinue}
                className="w-full flex items-center justify-center gap-2 bg-[#f4ebe0] hover:bg-[#ebdccb] active:scale-[0.99] text-amber-950 font-semibold py-3 px-6 rounded-xl border border-[#d8c5b0] transition cursor-pointer text-sm"
              >
                <History className="w-4 h-4 text-amber-800" />
                <span>
                  Continue My Story: &ldquo;{savedStory?.title || 'Saved Fairy Tale'}&rdquo;
                </span>
              </button>
            )}
          </div>
        </form>

        {/* Learning goals pill */}
        <div className="mt-8 pt-6 border-t border-[#ebdccb]/80">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2 text-center">
            Narrative Text Target Structure:
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#fbf7ee] border border-[#e8d9c5] rounded-lg p-2">
              <span className="font-bold text-amber-900 block">1. Orientation</span>
              <span className="text-stone-500 text-[10px]">Who, Where, When</span>
            </div>
            <div className="bg-[#fbf7ee] border border-[#e8d9c5] rounded-lg p-2">
              <span className="font-bold text-amber-900 block">2. Complication</span>
              <span className="text-stone-500 text-[10px]">Problem & Conflict</span>
            </div>
            <div className="bg-[#fbf7ee] border border-[#e8d9c5] rounded-lg p-2">
              <span className="font-bold text-amber-900 block">3. Resolution</span>
              <span className="text-stone-500 text-[10px]">Ending & Moral</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
