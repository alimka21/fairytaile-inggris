import React from 'react';

interface WatercolorCoverCanvasProps {
  title: string;
  setting: string;
  characters: Array<{ name: string; role: string; adjectives: string[] }>;
  studentName: string;
  studentClass: string;
  magicalElement: string;
  className?: string;
}

export const WatercolorCoverCanvas: React.FC<WatercolorCoverCanvasProps> = ({
  title,
  setting,
  characters,
  studentName,
  studentClass,
  magicalElement,
  className = '',
}) => {
  // Determine color scheme based on setting
  let skyGradient = 'from-amber-100 via-emerald-100 to-sky-100';
  let accentHues = 'text-emerald-900 border-emerald-300';
  let settingIcon = '🌲';

  if (setting.includes('Volcano')) {
    skyGradient = 'from-amber-200 via-orange-100 to-rose-100';
    accentHues = 'text-amber-950 border-amber-300';
    settingIcon = '🌋';
  } else if (setting.includes('Sea') || setting.includes('Coral')) {
    skyGradient = 'from-cyan-100 via-sky-200 to-indigo-100';
    accentHues = 'text-cyan-950 border-cyan-300';
    settingIcon = '🌊';
  } else if (setting.includes('Cloud')) {
    skyGradient = 'from-blue-100 via-indigo-50 to-purple-100';
    accentHues = 'text-indigo-950 border-indigo-300';
    settingIcon = '☁️';
  }

  const hero = characters.find((c) => c.role === 'Hero') || characters[0];
  const helper = characters.find((c) => c.role === 'Helper');

  return (
    <div
      className={`relative aspect-[3/4] w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl border-4 border-[#efe5d5] bg-gradient-to-b ${skyGradient} p-6 flex flex-col justify-between text-center select-none ${className}`}
      style={{
        boxShadow: '0 20px 25px -5px rgba(60, 40, 20, 0.15), 0 8px 10px -6px rgba(60, 40, 20, 0.1)',
      }}
    >
      {/* Decorative watercolor texture overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, rgba(200, 160, 100, 0.4) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(120, 180, 150, 0.3) 0%, transparent 50%)`,
        }}
      />

      {/* Decorative border frame */}
      <div className="absolute inset-2 border-2 border-amber-900/15 rounded-xl pointer-events-none" />
      <div className="absolute inset-3 border border-amber-900/10 rounded-lg pointer-events-none" />

      {/* Top: Header / Category */}
      <div className="relative z-10 pt-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900/70 bg-white/70 px-2.5 py-0.5 rounded-full border border-amber-800/15">
          Fairy Tale • Grade 9 English
        </span>
      </div>

      {/* Center: Whimsical Illustrated Scene */}
      <div className="relative z-10 my-auto py-4 space-y-3">
        <div className="w-24 h-24 mx-auto rounded-full bg-white/60 backdrop-blur-xs border border-amber-800/15 flex items-center justify-center shadow-inner text-4xl transform hover:scale-105 transition-transform">
          {settingIcon}
        </div>

        {/* Title */}
        <h2 className="font-serif-story font-bold text-xl sm:text-2xl text-stone-900 leading-tight px-2 drop-shadow-xs">
          {title || 'My Fairy Tale'}
        </h2>

        {/* Characters & Magic Element Badge */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 px-3">
          {hero && (
            <span className="text-[11px] font-semibold bg-white/80 text-stone-800 px-2 py-0.5 rounded-full border border-stone-200">
              Hero: {hero.name || 'Hero'}
            </span>
          )}
          {helper && (
            <span className="text-[11px] font-semibold bg-white/80 text-stone-800 px-2 py-0.5 rounded-full border border-stone-200">
              Helper: {helper.name || 'Helper'}
            </span>
          )}
        </div>

        {magicalElement && (
          <p className="text-[10px] text-stone-600 italic max-w-xs mx-auto line-clamp-1 px-4">
            Featuring {magicalElement}
          </p>
        )}
      </div>

      {/* Bottom: Author info */}
      <div className="relative z-10 pb-2">
        <div className="inline-block bg-white/90 backdrop-blur-xs border border-amber-800/20 rounded-xl px-4 py-2 shadow-xs">
          <p className="text-xs font-serif-story text-stone-900 font-bold">
            Written by {studentName || 'Student'}
          </p>
          <p className="text-[10px] text-amber-800 font-medium">
            Class {studentClass || '9'} • SMP
          </p>
        </div>
      </div>
    </div>
  );
};
