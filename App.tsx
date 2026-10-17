/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Song, AppSettings, RepeatMode, VisualizerMode } from './types/music';
import { AudioEngine } from './services/audioEngine';
import {
  loadAllSongsFromDB,
  saveSongToDB,
  deleteSongFromDB,
  clearAllSongsFromDB,
  getStorageSize,
  getStoredSettings,
  saveStoredSettings,
  toggleFavoriteInStorage,
  parseAudioFile,
  createProceduralDemoTrack,
} from './services/storageService';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { MiniPlayer } from './components/MiniPlayer';
import { EqualizerModal } from './components/EqualizerModal';
import { LibraryScreen } from './screens/LibraryScreen';
import { NowPlayingScreen } from './screens/NowPlayingScreen';
import { SearchScreen } from './screens/SearchScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [storageBytes, setStorageBytes] = useState<number>(0);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState<boolean>(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioEngineRef = useRef<AudioEngine>(AudioEngine.getInstance());

  // Next / Prev song handlers
  const handleNext = useCallback(() => {
    if (queue.length === 0) return;

    if (repeatMode === 'one' && currentSong) {
      audioEngineRef.current.seek(0);
      audioEngineRef.current.play();
      return;
    }

    let nextIdx = currentIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    const nextSong = queue[nextIdx];
    if (nextSong) {
      setCurrentIndex(nextIdx);
      setCurrentSong(nextSong);
      audioEngineRef.current.loadAndPlay(nextSong);
    }
  }, [queue, currentIndex, isShuffle, repeatMode, currentSong]);

  const handlePrevious = useCallback(() => {
    if (queue.length === 0) return;

    // If more than 3 seconds in, restart track
    if (currentTime > 3) {
      audioEngineRef.current.seek(0);
      return;
    }

    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }

    const prevSong = queue[prevIdx];
    if (prevSong) {
      setCurrentIndex(prevIdx);
      setCurrentSong(prevSong);
      audioEngineRef.current.loadAndPlay(prevSong);
    }
  }, [queue, currentIndex, currentTime]);

  // AudioEngine callback setup
  useEffect(() => {
    const engine = audioEngineRef.current;

    engine.onPlayStateChange = (playing) => {
      setIsPlaying(playing);
    };

    engine.onTimeUpdate = (curr, total) => {
      setCurrentTime(curr);
      setDuration(total);
    };

    engine.onSongEnded = () => {
      handleNext();
    };

    engine.onNextTrackRequest = () => {
      handleNext();
    };

    engine.onPrevTrackRequest = () => {
      handlePrevious();
    };
  }, [handleNext, handlePrevious]);

  // Load songs and storage size on mount
  useEffect(() => {
    async function loadData() {
      try {
        const storedSongs = await loadAllSongsFromDB();
        setSongs(storedSongs);
        setQueue(storedSongs);

        const bytes = await getStorageSize();
        setStorageBytes(bytes);
      } catch (err) {
        console.error('Failed to load songs from IndexedDB:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync theme to HTML documentElement
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    saveStoredSettings(settings);
  }, [settings]);

  // Play a specific song
  const handlePlaySong = async (song: Song, index?: number) => {
    setCurrentSong(song);
    if (index !== undefined) {
      setCurrentIndex(index);
    } else {
      const idx = queue.findIndex((s) => s.id === song.id);
      if (idx !== -1) {
        setCurrentIndex(idx);
      } else {
        const newQueue = [...queue, song];
        setQueue(newQueue);
        setCurrentIndex(newQueue.length - 1);
      }
    }
    await audioEngineRef.current.loadAndPlay(song);
  };

  const handlePlayPause = async () => {
    if (!currentSong && songs.length > 0) {
      handlePlaySong(songs[0], 0);
      return;
    }

    if (isPlaying) {
      audioEngineRef.current.pause();
    } else {
      await audioEngineRef.current.play();
    }
  };

  const handleSeek = (seconds: number) => {
    audioEngineRef.current.seek(seconds);
    setCurrentTime(seconds);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(false);
    audioEngineRef.current.setVolume(vol);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngineRef.current.setVolume(volume);
    } else {
      setIsMuted(true);
      audioEngineRef.current.setVolume(0);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const isFav = toggleFavoriteInStorage(id);
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: isFav } : s))
    );
    setQueue((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: isFav } : s))
    );
    if (currentSong && currentSong.id === id) {
      setCurrentSong({ ...currentSong, isFavorite: isFav });
    }
  };

  const handleDeleteSong = async (id: string) => {
    await deleteSongFromDB(id);
    const updatedSongs = songs.filter((s) => s.id !== id);
    setSongs(updatedSongs);
    setQueue(updatedSongs);

    if (currentSong && currentSong.id === id) {
      audioEngineRef.current.pause();
      setCurrentSong(null);
      setCurrentIndex(-1);
    }

    const bytes = await getStorageSize();
    setStorageBytes(bytes);
  };

  const handleClearLibrary = async () => {
    audioEngineRef.current.pause();
    setCurrentSong(null);
    setCurrentIndex(-1);
    setIsPlaying(false);
    await clearAllSongsFromDB();
    setSongs([]);
    setQueue([]);
    setStorageBytes(0);
  };

  const handleImportFiles = async (fileList: FileList) => {
    setIsLoading(true);
    const importedSongs: Song[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (
        file.type.startsWith('audio/') ||
        /\.(mp3|wav|m4a|aac|flac|ogg)$/i.test(file.name)
      ) {
        try {
          const parsed = await parseAudioFile(file);
          await saveSongToDB(parsed);
          importedSongs.push(parsed);
        } catch (e) {
          console.error('Error importing file:', file.name, e);
        }
      }
    }

    if (importedSongs.length > 0) {
      const newSongs = [...importedSongs, ...songs];
      setSongs(newSongs);
      setQueue(newSongs);
      const bytes = await getStorageSize();
      setStorageBytes(bytes);

      // Auto-play first imported song if nothing is playing
      if (!currentSong) {
        handlePlaySong(importedSongs[0], 0);
      }
    }
    setIsLoading(false);
  };

  const handleLoadDemoTrack = async () => {
    setIsLoading(true);
    try {
      const demo = await createProceduralDemoTrack();
      const updated = [demo, ...songs];
      setSongs(updated);
      setQueue(updated);
      const bytes = await getStorageSize();
      setStorageBytes(bytes);
      handlePlaySong(demo, 0);
    } catch (e) {
      console.error('Failed to create demo track:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShuffleAll = () => {
    if (songs.length === 0) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setIsShuffle(true);
    handlePlaySong(shuffled[0], 0);
  };

  const handlePlayAllFavorites = () => {
    const favorites = songs.filter((s) => s.isFavorite);
    if (favorites.length === 0) return;
    setQueue(favorites);
    handlePlaySong(favorites[0], 0);
  };

  const handleShuffleFavorites = () => {
    const favorites = songs.filter((s) => s.isFavorite).sort(() => Math.random() - 0.5);
    if (favorites.length === 0) return;
    setQueue(favorites);
    setIsShuffle(true);
    handlePlaySong(favorites[0], 0);
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  const handlePresetSelect = (presetId: string) => {
    handleUpdateSettings({ equalizerPreset: presetId });
    audioEngineRef.current.applyPreset(presetId);
  };

  const handleCustomEqChange = (bass: number, mid: number, treble: number) => {
    handleUpdateSettings({
      customBass: bass,
      customMid: mid,
      customTreble: treble,
    });
    audioEngineRef.current.setEqualizer(bass, mid, treble);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#141E30] light:bg-[#E6EDF5] text-slate-100 light:text-slate-900 transition-colors flex flex-col justify-between">
      {/* Hidden file input triggered by header */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg"
        onChange={(e) => {
          if (e.target.files) handleImportFiles(e.target.files);
        }}
        className="hidden"
      />

      {/* Frame layout wrapper: allows user to toggle sleek mobile simulator frame on desktop */}
      <div className={`flex-1 flex flex-col ${isPhoneFrame ? 'py-4 sm:py-8' : ''}`}>
        {/* Desktop Viewport Switcher Toolbar */}
        <div className="hidden lg:flex items-center justify-between px-6 py-2 border-b border-slate-800/40 light:border-slate-300/40 bg-black/20 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-cyan-400">Navy Mirage</span>
            <span>· Neumorphic Mobile-First Architecture</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPhoneFrame(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                !isPhoneFrame
                  ? 'bg-cyan-500/20 text-cyan-400 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Responsive Edge-to-Edge</span>
            </button>
            <button
              onClick={() => setIsPhoneFrame(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                isPhoneFrame
                  ? 'bg-cyan-500/20 text-cyan-400 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone Device Shell</span>
            </button>
          </div>
        </div>

        {/* Main Application Container */}
        <div
          className={`flex-1 flex flex-col mx-auto w-full transition-all duration-300 ${
            isPhoneFrame
              ? 'max-w-[420px] rounded-[42px] border-[10px] border-slate-900 shadow-2xl overflow-hidden relative min-h-[820px] max-h-[90vh]'
              : 'max-w-4xl'
          }`}
          style={{
            backgroundColor: settings.theme === 'dark' ? '#141E30' : '#E6EDF5',
          }}
        >
          {/* Header */}
          <Header
            theme={settings.theme}
            onToggleTheme={() =>
              handleUpdateSettings({
                theme: settings.theme === 'dark' ? 'light' : 'dark',
              })
            }
            onImportClick={() => fileInputRef.current?.click()}
            onLoadDemoClick={handleLoadDemoTrack}
            songCount={songs.length}
          />

          {/* Loading Indicator */}
          {isLoading && (
            <div className="w-full h-1 bg-slate-800 overflow-hidden">
              <div className="h-full bg-cyan-400 animate-pulse w-full" />
            </div>
          )}

          {/* Screen Routing */}
          <main className="flex-1 flex flex-col relative overflow-y-auto no-scrollbar">
            {activeTab === 'library' && (
              <LibraryScreen
                songs={songs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlaySong={handlePlaySong}
                onToggleFavorite={handleToggleFavorite}
                onDeleteSong={handleDeleteSong}
                onImportFiles={handleImportFiles}
                onLoadDemoTrack={handleLoadDemoTrack}
                onShuffleAll={handleShuffleAll}
              />
            )}

            {activeTab === 'search' && (
              <SearchScreen
                songs={songs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlaySong={handlePlaySong}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeTab === 'player' && (
              <NowPlayingScreen
                currentSong={currentSong}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                isShuffle={isShuffle}
                repeatMode={repeatMode}
                visualizerMode={settings.visualizerMode}
                volume={volume}
                isMuted={isMuted}
                queue={queue}
                currentIndex={currentIndex}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onSeek={handleSeek}
                onToggleShuffle={() => setIsShuffle(!isShuffle)}
                onToggleRepeat={() => {
                  const nextRepeat: RepeatMode =
                    repeatMode === 'off'
                      ? 'all'
                      : repeatMode === 'all'
                      ? 'one'
                      : 'off';
                  setRepeatMode(nextRepeat);
                }}
                onToggleFavorite={handleToggleFavorite}
                onToggleVisualizerMode={() => {
                  const modes: VisualizerMode[] = ['radial', 'halo', 'wave'];
                  const nextMode =
                    modes[(modes.indexOf(settings.visualizerMode) + 1) % modes.length];
                  handleUpdateSettings({ visualizerMode: nextMode });
                }}
                onVolumeChange={handleVolumeChange}
                onToggleMute={handleToggleMute}
                onOpenEqualizer={() => setIsEqualizerOpen(true)}
                onSelectQueueTrack={(idx) => {
                  setCurrentIndex(idx);
                  const song = queue[idx];
                  if (song) {
                    setCurrentSong(song);
                    audioEngineRef.current.loadAndPlay(song);
                  }
                }}
                onMinimize={() => setActiveTab('library')}
              />
            )}

            {activeTab === 'favorites' && (
              <FavoritesScreen
                songs={songs}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlaySong={handlePlaySong}
                onPlayAllFavorites={handlePlayAllFavorites}
                onShuffleFavorites={handleShuffleFavorites}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsScreen
                settings={settings}
                storageBytes={storageBytes}
                onUpdateSettings={handleUpdateSettings}
                onClearLibrary={handleClearLibrary}
                onOpenEqualizer={() => setIsEqualizerOpen(true)}
              />
            )}
          </main>

          {/* Floating Mini Player (Shown when on other tabs and a song is loaded) */}
          {activeTab !== 'player' && currentSong && (
            <MiniPlayer
              song={currentSong}
              isPlaying={isPlaying}
              progressPercent={progressPercent}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onExpand={() => setActiveTab('player')}
            />
          )}

          {/* Bottom Navigation */}
          <BottomNav
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            hasActiveSong={!!currentSong}
          />
        </div>
      </div>

      {/* Real-time Parametric Equalizer Modal */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
        currentPreset={settings.equalizerPreset}
        bass={settings.customBass}
        mid={settings.customMid}
        treble={settings.customTreble}
        onPresetSelect={handlePresetSelect}
        onCustomChange={handleCustomEqChange}
      />
    </div>
  );
}
