import React from 'react';
import { Heart, Play, Shuffle, Disc3 } from 'lucide-react';
import { Song } from '../types/music';
import { formatTime } from '../services/storageService';

interface FavoritesScreenProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, index: number) => void;
  onPlayAllFavorites: () => void;
  onShuffleFavorites: () => void;
  onToggleFavorite: (id: string) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onPlayAllFavorites,
  onShuffleFavorites,
  onToggleFavorite,
}) => {
  const favoriteSongs = songs.filter((s) => s.isFavorite);

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 light:text-slate-900">
              Favorite Tracks
            </h1>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
            {favoriteSongs.length} {favoriteSongs.length === 1 ? 'track' : 'tracks'} marked as favorite
          </p>
        </div>

        {favoriteSongs.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onPlayAllFavorites}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl nm-raised-sm text-xs font-semibold text-cyan-400 hover:text-cyan-300 active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>
            <button
              onClick={onShuffleFavorites}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl nm-raised-sm text-xs font-semibold text-slate-200 light:text-slate-800 hover:text-cyan-400 active:scale-95 transition-all"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {favoriteSongs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center my-auto">
          <div className="w-20 h-20 rounded-full nm-inset flex items-center justify-center text-rose-400/80 mb-4 border border-rose-500/20">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-100 light:text-slate-900">
            No favorite songs yet
          </h3>
          <p className="text-xs text-slate-400 light:text-slate-500 mt-1 max-w-xs leading-relaxed">
            Tap the heart icon on any track in your library or now playing screen to save it here for fast access.
          </p>
        </div>
      ) : (
        /* Favorites List */
        <div className="space-y-2.5">
          {favoriteSongs.map((song, index) => {
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
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className="w-12 h-12 rounded-xl shrink-0 nm-inset-sm overflow-hidden flex items-center justify-center"
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
                    <h3 className="text-sm font-semibold truncate text-slate-100 light:text-slate-900">
                      {song.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 light:text-slate-500 truncate mt-0.5">
                      <span className="truncate">{song.artist}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{song.album}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs font-mono tabular-nums text-slate-400 light:text-slate-500 mr-1">
                    {formatTime(song.duration)}
                  </span>

                  <button
                    onClick={() => onToggleFavorite(song.id)}
                    className="w-8 h-8 rounded-full nm-raised-sm flex items-center justify-center active:scale-90 transition-transform"
                    aria-label="Remove from favorites"
                    title="Remove from favorites"
                  >
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                  </button>

                  <button
                    onClick={() => onPlaySong(song, index)}
                    className="w-8 h-8 rounded-full nm-raised-sm flex items-center justify-center text-cyan-400 hover:text-cyan-300 active:scale-90 transition-transform"
                    aria-label="Play song"
                  >
                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
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
