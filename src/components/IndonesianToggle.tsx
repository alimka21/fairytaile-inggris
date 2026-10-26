import React, { useState } from 'react';
import { Languages } from 'lucide-react';

interface IndonesianToggleProps {
  englishText: string | React.ReactNode;
  indonesianText: string | React.ReactNode;
  className?: string;
  defaultIndonesian?: boolean;
}

export const IndonesianToggle: React.FC<IndonesianToggleProps> = ({
  englishText,
  indonesianText,
  className = '',
  defaultIndonesian = false,
}) => {
  const [showIndonesian, setShowIndonesian] = useState(defaultIndonesian);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="text-stone-800 transition-all duration-200">
        {showIndonesian ? (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 text-stone-900 text-sm leading-relaxed">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded mr-1.5">
              Bahasa Indonesia
            </span>
            {indonesianText}
          </div>
        ) : (
          <div className="text-stone-800 text-sm leading-relaxed">
            {englishText}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowIndonesian(!showIndonesian)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:text-amber-950 bg-amber-100/60 hover:bg-amber-100 border border-amber-300/60 rounded-full px-2.5 py-1 transition cursor-pointer select-none"
        title="Toggle translation"
      >
        <Languages className="w-3.5 h-3.5 text-amber-700" />
        {showIndonesian ? 'Show in English (Tampilkan Bahasa Inggris)' : 'Lihat dalam Bahasa Indonesia 🇮🇩'}
      </button>
    </div>
  );
};
