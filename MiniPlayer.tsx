import React from 'react';
import { Play, Pause, SkipForward, Disc3 } from 'lucide-react';
import { Song } from '../types/music';

interface MiniPlayerProps {
  song: Song;
  isPlaying: boolean;
  progressPercent: number;
  onPlayPause: () => void;
  onNext: () => void;
  onExpand: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  song,
  isPlaying,
  progressPercent,
  onPlayPause,
  onNext,
  onExpand,
}) => {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 px-3 pb-1 max-w-md mx-auto pointer-events-auto">
      <div
        onClick={onExpand}
        className="relative overflow-hidden rounded-2xl bg-[#162234]/95 light:bg-[#edf3fa]/95 backdrop-blur-md nm-raised-sm border border-slate-700/40 light:border-slate-300/60 p-2.5 flex items-center gap-3 cursor-pointer group active:scale-[0.99] transition-transform"
      >
        {/* Progress bar hairline */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 light:bg-slate-300 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-200"
            style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
          />
        </div>

        {/* Thumbnail Cover Art */}
        <div
          className={`w-11 h-11 rounded-xl shrink-0 nm-inset-sm overflow-hidden flex items-center justify-center relative ${
            isPlaying ? 'ring-1 ring-cyan-400/50' : ''
          }`}
          style={{
            background: song.coverArtUrl
              ? `url(${song.coverArtUrl}) center/cover no-repeat`
              : song.gradientCover || 'linear-gradient(135deg, #141E30, #35577D)',
          }}
        >
          {!song.coverArtUrl && (
            <Disc3
              className={`w-6 h-6 text-cyan-300/70 ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '6s' }}
            />
          )}
        </div>

        {/* Title & Artist info */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-xs font-semibold text-slate-100 light:text-slate-900 truncate">
            {song.title}
          </h4>
          <p className="text-[11px] text-slate-400 light:text-slate-600 truncate mt-0.5">
            {song.artist}
          </p>
        </div>

        {/* Play/Pause Button */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onPlayPause}
            className="min-w-[40px] min-h-[40px] w-10 h-10 rounded-full nm-raised-sm flex items-center justify-center text-cyan-400 hover:text-cyan-300 active:scale-95 transition-all"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-cyan-400" />
            ) : (
              <Play className="w-4 h-4 fill-cyan-400 translate-x-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={onNext}
            className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-full nm-raised-sm flex items-center justify-center text-slate-300 light:text-slate-700 hover:text-cyan-400 active:scale-95 transition-all"
            aria-label="Next song"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
