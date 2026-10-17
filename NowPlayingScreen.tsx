import React, { useState } from 'react';
import {
  ChevronDown,
  ListMusic,
  Heart,
  Shuffle,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Sliders,
  Volume2,
  VolumeX,
  X,
  Music,
} from 'lucide-react';
import { Song, RepeatMode, VisualizerMode } from '../types/music';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { formatTime, formatBytes } from '../services/storageService';

interface NowPlayingScreenProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  visualizerMode: VisualizerMode;
  volume: number;
  isMuted: boolean;
  queue: Song[];
  currentIndex: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: (id: string) => void;
  onToggleVisualizerMode: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onOpenEqualizer: () => void;
  onSelectQueueTrack: (index: number) => void;
  onMinimize: () => void;
}

export const NowPlayingScreen: React.FC<NowPlayingScreenProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  isShuffle,
  repeatMode,
  visualizerMode,
  volume,
  isMuted,
  queue,
  currentIndex,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onToggleVisualizerMode,
  onVolumeChange,
  onToggleMute,
  onOpenEqualizer,
  onSelectQueueTrack,
  onMinimize,
}) => {
  const [showQueue, setShowQueue] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  const displayTime = isScrubbing ? scrubValue : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full nm-inset flex items-center justify-center text-slate-500 mb-4">
          <Music className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No Song Selected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Select a track from your library or import your local audio files to start playback.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col justify-between max-w-md mx-auto w-full px-5 py-4 pb-24 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onMinimize}
          className="w-10 h-10 rounded-full nm-raised-sm flex items-center justify-center text-slate-300 light:text-slate-700 hover:text-cyan-400 active:scale-95 transition-all"
          aria-label="Minimize player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-cyan-400/90">
            Playing From Library
          </span>
          <p className="text-xs text-slate-400 light:text-slate-600 truncate max-w-[180px]">
            {currentSong.album || 'Local Tracks'}
          </p>
        </div>

        <button
          onClick={() => setShowQueue(!showQueue)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            showQueue
              ? 'nm-inset-sm text-cyan-400 border border-cyan-500/30'
              : 'nm-raised-sm text-slate-300 light:text-slate-700 hover:text-cyan-400'
          }`}
          aria-label="Toggle playlist queue"
        >
          <ListMusic className="w-5 h-5" />
        </button>
      </div>

      {/* Central Visualizer Section */}
      <div className="my-auto py-4 flex flex-col items-center justify-center">
        <AudioVisualizer
          song={currentSong}
          isPlaying={isPlaying}
          mode={visualizerMode}
          size={270}
          onToggleMode={onToggleVisualizerMode}
        />
      </div>

      {/* Song Metadata */}
      <div className="space-y-1 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 light:text-slate-900 truncate">
              {currentSong.title}
            </h2>
            <p className="text-sm text-slate-400 light:text-slate-600 truncate">
              {currentSong.artist}
            </p>
          </div>

          <button
            onClick={() => onToggleFavorite(currentSong.id)}
            className="w-10 h-10 rounded-full nm-raised-sm flex items-center justify-center active:scale-90 transition-transform shrink-0"
            aria-label={currentSong.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                currentSong.isFavorite
                  ? 'fill-rose-500 text-rose-500 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            />
          </button>
        </div>

        {/* Unboxed Metadata (Zero-Pill discipline) */}
        <div className="flex items-center gap-2 text-xs text-slate-400 light:text-slate-600 pt-0.5">
          <span>{currentSong.format || 'AUDIO'}</span>
          <span aria-hidden="true">·</span>
          <span>{formatBytes(currentSong.size)}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Neumorphic Seekbar */}
      <div className="mb-4">
        <div className="relative flex items-center group py-2">
          {/* Groove Track */}
          <div className="w-full h-2.5 rounded-full nm-inset bg-[#111927] light:bg-[#d6e0ec] relative overflow-hidden">
            {/* Cyan glowing progress fill */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-75 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Interactive Range Input overlay */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={displayTime}
            onMouseDown={() => setIsScrubbing(true)}
            onTouchStart={() => setIsScrubbing(true)}
            onChange={(e) => setScrubValue(Number(e.target.value))}
            onMouseUp={() => {
              setIsScrubbing(false);
              onSeek(scrubValue);
            }}
            onTouchEnd={() => {
              setIsScrubbing(false);
              onSeek(scrubValue);
            }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
            aria-label="Seek time"
          />
        </div>

        {/* Timestamps */}
        <div className="flex justify-between items-center text-xs font-mono tabular-nums text-slate-400 light:text-slate-600 mt-1 px-1">
          <span>{formatTime(displayTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Playback Controls Dock */}
      <div className="flex items-center justify-between px-2 mb-4">
        {/* Shuffle */}
        <button
          onClick={onToggleShuffle}
          className={`w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-all ${
            isShuffle
              ? 'nm-inset-sm text-cyan-400 border border-cyan-500/30 glow-cyan-sm'
              : 'nm-raised-sm text-slate-400 light:text-slate-600 hover:text-slate-200'
          }`}
          title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Previous Track */}
        <button
          onClick={onPrevious}
          className="w-12 h-12 rounded-full nm-raised flex items-center justify-center text-slate-200 light:text-slate-800 hover:text-cyan-400 active:scale-95 transition-all"
          aria-label="Previous track"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Play / Pause Hero Button */}
        <button
          onClick={onPlayPause}
          className={`w-18 h-18 rounded-full flex items-center justify-center active:scale-95 transition-all ${
            isPlaying
              ? 'nm-pressed text-cyan-300 ring-2 ring-cyan-400/60 glow-cyan'
              : 'nm-raised text-cyan-400 ring-1 ring-cyan-500/30 glow-cyan-sm hover:text-cyan-300'
          }`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current translate-x-0.5" />
          )}
        </button>

        {/* Next Track */}
        <button
          onClick={onNext}
          className="w-12 h-12 rounded-full nm-raised flex items-center justify-center text-slate-200 light:text-slate-800 hover:text-cyan-400 active:scale-95 transition-all"
          aria-label="Next track"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        {/* Repeat */}
        <button
          onClick={onToggleRepeat}
          className={`w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-all ${
            repeatMode !== 'off'
              ? 'nm-inset-sm text-cyan-400 border border-cyan-500/30 glow-cyan-sm'
              : 'nm-raised-sm text-slate-400 light:text-slate-600 hover:text-slate-200'
          }`}
          title={`Repeat: ${repeatMode}`}
        >
          {repeatMode === 'one' ? (
            <Repeat1 className="w-4 h-4" />
          ) : (
            <Repeat className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Bottom Secondary Controls: Volume & Equalizer */}
      <div className="flex items-center justify-between gap-4 px-2 pt-1">
        {/* Equalizer trigger */}
        <button
          onClick={onOpenEqualizer}
          className="px-3 py-1.5 rounded-xl nm-raised-sm flex items-center gap-1.5 text-xs font-medium text-slate-300 light:text-slate-700 hover:text-cyan-400 active:scale-95 transition-all shrink-0"
          title="Open Audio Equalizer"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>EQ</span>
        </button>

        {/* Volume Bar */}
        <div className="flex-1 flex items-center gap-2 max-w-[200px]">
          <button
            onClick={onToggleMute}
            className="text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg nm-inset appearance-none bg-slate-900/60"
              aria-label="Volume slider"
            />
          </div>
        </div>
      </div>

      {/* Playlist Queue Slide-Over Sheet */}
      {showQueue && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md mx-auto bg-[#162234] dark:bg-[#141e30] light:bg-[#edf3fa] border-t border-slate-700/50 light:border-slate-300/80 rounded-t-3xl p-5 nm-raised-lg max-h-[75vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40 light:border-slate-300/60">
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-100 light:text-slate-900">
                  Current Queue ({queue.length} songs)
                </h3>
              </div>
              <button
                onClick={() => setShowQueue(false)}
                className="w-8 h-8 rounded-full nm-raised-sm flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-2">
              {queue.map((track, idx) => {
                const isCurrent = idx === currentIndex;
                return (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => {
                      onSelectQueueTrack(idx);
                      setShowQueue(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isCurrent
                        ? 'nm-inset-sm border border-cyan-500/30 text-cyan-400'
                        : 'nm-raised-sm hover:border hover:border-slate-700 text-slate-300 light:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="font-mono text-xs tabular-nums text-slate-400 w-5 text-right">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{track.title}</p>
                        <p className="text-[11px] text-slate-400 light:text-slate-500 truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-slate-400 shrink-0">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
