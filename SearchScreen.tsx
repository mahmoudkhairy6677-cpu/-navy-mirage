import React, { useState, useMemo } from 'react';
import { Search, X, Play, Heart, Disc3 } from 'lucide-react';
import { Song } from '../types/music';
import { formatTime } from '../services/storageService';

interface SearchScreenProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onToggleFavorite: (id: string) => void;
}

type FilterScope = 'all' | 'title' | 'artist' | 'album';

export const SearchScreen: React.FC<SearchScreenProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onToggleFavorite,
}) => {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<FilterScope>('all');

  const filteredSongs = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    return songs.filter((s) => {
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchArtist = s.artist.toLowerCase().includes(q);
      const matchAlbum = s.album.toLowerCase().includes(q);

      if (scope === 'title') return matchTitle;
      if (scope === 'artist') return matchArtist;
      if (scope === 'album') return matchAlbum;
      return matchTitle || matchArtist || matchAlbum;
    });
  }, [songs, query, scope]);

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-28">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 light:text-slate-900">
          Search Music
        </h1>
        <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
          Find songs, artists, and albums instantly in your library
        </p>
      </div>

      {/* Neumorphic Search Input Bar */}
      <div className="relative mb-3">
        <div className="w-full flex items-center rounded-2xl nm-inset bg-[#121926]/80 light:bg-[#d6e0ec]/80 px-3.5 py-2.5">
          <Search className="w-4 h-4 text-cyan-400 shrink-0 mr-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, artist, or album..."
            className="w-full bg-transparent text-sm text-slate-100 light:text-slate-900 placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="w-6 h-6 rounded-full nm-raised-sm flex items-center justify-center text-slate-400 hover:text-white shrink-0 active:scale-95 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scope Segmented Control (Interactive Filter Tabs) */}
      <div className="flex items-center gap-1.5 p-1 bg-[#121926]/60 light:bg-[#d6e0ec]/60 rounded-xl nm-inset-sm mb-5 self-start">
        {(['all', 'title', 'artist', 'album'] as FilterScope[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setScope(tab)}
            className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
              scope === tab
                ? 'bg-[#18263c] light:bg-white text-cyan-400 light:text-slate-900 shadow-sm'
                : 'text-slate-400 light:text-slate-600 hover:text-slate-200 light:hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Results View */}
      {query.trim() === '' ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full nm-inset flex items-center justify-center text-slate-500 mb-3">
            <Search className="w-7 h-7" />
          </div>
          <p className="text-xs text-slate-400 light:text-slate-500">
            Type a song name, artist name, or album to search
          </p>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-semibold text-slate-300 light:text-slate-700">
            No matching tracks found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Check the spelling or try searching another term
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-slate-400 light:text-slate-500 mb-1 px-1">
            Found {filteredSongs.length} {filteredSongs.length === 1 ? 'result' : 'results'}
          </div>

          {filteredSongs.map((song) => {
            const isCurrent = currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                onClick={() => onPlaySong(song)}
                className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                  isCurrent
                    ? 'nm-inset-sm border border-cyan-500/40 text-cyan-400'
                    : 'nm-raised-sm hover:border hover:border-slate-700/60 text-slate-200 light:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className="w-11 h-11 rounded-xl shrink-0 nm-inset-sm overflow-hidden flex items-center justify-center"
                    style={{
                      background: song.coverArtUrl
                        ? `url(${song.coverArtUrl}) center/cover no-repeat`
                        : song.gradientCover || 'linear-gradient(135deg, #141E30, #35577D)',
                    }}
                  >
                    {!song.coverArtUrl && (
                      <Disc3
                        className={`w-5 h-5 text-cyan-300/80 ${
                          isCurrent && isPlaying ? 'animate-spin' : ''
                        }`}
                        style={{ animationDuration: '4s' }}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold truncate text-slate-100 light:text-slate-900">
                      {song.title}
                    </h4>
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
                  <span className="text-xs font-mono tabular-nums text-slate-400 mr-1">
                    {formatTime(song.duration)}
                  </span>

                  <button
                    onClick={() => onToggleFavorite(song.id)}
                    className="w-8 h-8 rounded-full nm-raised-sm flex items-center justify-center active:scale-90 transition-transform"
                    aria-label="Toggle favorite"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        song.isFavorite
                          ? 'fill-rose-500 text-rose-500'
                          : 'text-slate-400 hover:text-rose-400'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => onPlaySong(song)}
                    className="w-8 h-8 rounded-full nm-raised-sm flex items-center justify-center text-cyan-400 hover:text-cyan-300 active:scale-90 transition-transform"
                    aria-label="Play track"
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
