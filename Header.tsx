import React from 'react';
import { Sun, Moon, Plus, Sparkles } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onImportClick: () => void;
  onLoadDemoClick?: () => void;
  songCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onImportClick,
  onLoadDemoClick,
  songCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#141e30]/90 dark:bg-[#141e30]/90 light:bg-[#e6edf5]/90 backdrop-blur-md border-b border-slate-700/30 light:border-slate-300/60 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-full nm-raised-sm flex items-center justify-center bg-[#162234] light:bg-[#e6edf5] text-cyan-400">
            <span className="font-bold text-sm tracking-tighter">NM</span>
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-100 light:text-slate-900">
            Navy Mirage
          </span>
        </div>

        {/* Zone 2: Informational / context indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 light:text-slate-600 whitespace-nowrap">
          <span>Neumorphic Audio</span>
          <span aria-hidden="true">·</span>
          <span>{songCount} {songCount === 1 ? 'track' : 'tracks'} loaded</span>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Demo synthesis button if 0 songs */}
          {songCount === 0 && onLoadDemoClick && (
            <button
              onClick={onLoadDemoClick}
              className="hidden xs:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl nm-raised-sm text-cyan-400 hover:text-cyan-300 active:scale-95 transition-all"
              title="Generate a sample ambient track without uploading"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sample Track</span>
            </button>
          )}

          {/* Import Music Button */}
          <button
            onClick={onImportClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl nm-raised-sm text-slate-100 light:text-slate-800 hover:text-cyan-400 active:scale-95 transition-all"
            title="Import local audio files (.mp3, .wav, .m4a, .flac)"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Import Music</span>
            <span className="sm:hidden">Import</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-full nm-raised-sm flex items-center justify-center text-slate-300 light:text-slate-700 hover:text-cyan-400 active:scale-95 transition-all"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
