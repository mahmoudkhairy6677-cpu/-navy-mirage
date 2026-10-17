import React, { useRef } from 'react';
import {
  FolderOpen,
  Play,
  Heart,
  Music,
  Trash2,
  Disc3,
  Shuffle,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Song } from '../types/music';
import { formatTime, formatBytes } from '../services/storageService';

interface LibraryScreenProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, index: number) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteSong: (id: string) => void;
  onImportFiles: (files: FileList) => void;
  onLoadDemoTrack: () => void;
  onShuffleAll: () => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onToggleFavorite,
  onDeleteSong,
  onImportFiles,
  onLoadDemoTrack,
  onShuffleAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportFiles(e.target.files);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-28">
      {/* Hidden File Pickers */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard in WebKit/Blink
        webkitdirectory="true"
        directory="true"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Library Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Music Library
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 light:text-slate-600 mt-0.5">
            <span>{songs.length} {songs.length === 1 ? 'song' : 'songs'} in local cache</span>
            {songs.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {formatTime(songs.reduce((acc, s) => acc + s.duration, 0))} total playtime
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {songs.length > 0 && (
            <button
              onClick={onShuffleAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl nm-raised-sm text-xs font-semibold text-cyan-400 hover:text-cyan-300 active:scale-95 transition-all"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle Play</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl nm-raised-sm text-xs font-semibold text-slate-100 light:text-slate-800 hover:text-cyan-400 active:scale-95 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Files</span>
          </button>

          <button
            onClick={() => folderInputRef.current?.click()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl nm-raised-sm text-xs font-semibold text-slate-100 light:text-slate-800 hover:text-cyan-400 active:scale-95 transition-all"
            title="Import entire music directory"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Folder</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {songs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center my-auto">
          <div className="w-24 h-24 rounded-full nm-inset flex items-center justify-center text-cyan-400/80 mb-5 border border-cyan-500/20">
            <Music className="w-10 h-10" />
          </div>

          <h3 className="text-lg font-bold text-slate-100 light:text-slate-900 tracking-tight">
            No local audio files found
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 light:text-slate-600 mt-2 max-w-md leading-relaxed">
            Navy Mirage plays real audio files directly from your device. All files are securely stored in your browser's local sandbox and persist across reloads.
          </p>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl nm-raised text-xs font-semibold text-cyan-400 hover:text-cyan-300 ring-1 ring-cyan-500/30 glow-cyan-sm active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Choose Audio Files from Device</span>
            </button>

            <button
              onClick={() => folderInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl nm-raised text-xs font-semibold text-slate-200 light:text-slate-800 hover:text-cyan-400 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Choose Folder</span>
            </button>
          </div>

          {/* Sample track synthesizer notice */}
          <div className="mt-8 pt-6 border-t border-slate-700/30 light:border-slate-300/50 max-w-sm w-full">
            <p className="text-[11px] text-slate-400 light:text-slate-500 mb-2.5">
              Don't have music files handy right now?
            </p>
            <button
              onClick={onLoadDemoTrack}
              className="py-2 px-3 rounded-lg nm-raised-sm text-xs text-slate-300 light:text-slate-700 hover:text-cyan-400 flex items-center justify-center gap-1.5 mx-auto active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Synthesize Ambient Lo-Fi Sample Track</span>
            </button>
          </div>

          {/* Supported formats disclaimer */}
          <div className="mt-6 text-[11px] text-slate-400 light:text-slate-500 flex flex-wrap items-center justify-center gap-1.5">
            <span>Supported:</span>
            <span>MP3</span>
            <span aria-hidden="true">·</span>
            <span>WAV</span>
            <span aria-hidden="true">·</span>
            <span>M4A / AAC</span>
            <span aria-hidden="true">·</span>
            <span>FLAC</span>
            <span aria-hidden="true">·</span>
            <span>OGG</span>
          </div>
        </div>
      ) : (
        /* Song List */
        <div className="space-y-2.5">
          {songs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                onClick={() => onPlaySong(song, index)}
                className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                  isCurrent
                    ? 'nm-inset-sm border border-cyan-500/40 text-cyan-400'
                    : 'nm-raised-sm hover:border hover:border-slate-700/60 text-slate-200 light:text-slate-800'
                }`}
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-12 h-12 rounded-xl shrink-0 nm-inset-sm overflow-hidden flex items-center justify-center relative ${
                      isCurrent && isPlaying ? 'ring-1 ring-cyan-400 glow-cyan-sm' : ''
                    }`}
                    style={{
                      background: song.coverArtUrl
                        ? `url(${song.coverArtUrl}) center/cover no-repeat`
                        : song.gradientCover || 'linear-gradient(135deg, #141E30, #35577D)',
                    }}
                  >
                    {!song.coverArtUrl && (
                      <Disc3
                        className={`w-6 h-6 text-cyan-300/80 ${
                          isCurrent && isPlaying ? 'animate-spin' : ''
                        }`}
                        style={{ animationDuration: '4s' }}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`text-sm font-semibold truncate ${
                        isCurrent ? 'text-cyan-400 font-bold' : 'text-slate-100 light:text-slate-900'
                      }`}
                    >
                      {song.title}
                    </h3>

                    {/* Unboxed metadata */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 light:text-slate-500 truncate mt-0.5">
                      <span className="truncate">{song.artist}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate hidden xs:inline">{song.album}</span>
                      <span aria-hidden="true" className="hidden xs:inline">·</span>
                      <span className="uppercase text-[10px]">{song.format || 'AUDIO'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Duration & Actions */}
                <div
                  className="flex items-center gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs font-mono tabular-nums text-slate-400 light:text-slate-500 mr-1">
                    {formatTime(song.duration)}
                  </span>

                  {/* Favorite Toggle */}
                  <button
                    onClick={() => onToggleFavorite(song.id)}
                    className="w-8 h-8 rounded-full nm-raised-sm flex items-center justify-center active:scale-90 transition-transform"
                    aria-label="Toggle favorite"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        song.isFavorite
                          ? 'fill-rose-500 text-rose-500 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
                          : 'text-slate-400 hover:text-rose-400'
                      }`}
                    />
                  </button>

                  {/* Play Action */}
                  <button
                    onClick={() => onPlaySong(song, index)}
                    className="w-8 h-8 rounded-full nm-raised-sm flex items-center justify-center text-cyan-400 hover:text-cyan-300 active:scale-90 transition-transform"
                    aria-label="Play song"
                  >
                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                  </button>

                  {/* Delete from library */}
                  <button
                    onClick={() => onDeleteSong(song.id)}
                    className="w-8 h-8 rounded-full nm-raised-sm flex items-center justify-center text-slate-400 hover:text-rose-400 active:scale-90 transition-transform"
                    title="Remove from library cache"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
