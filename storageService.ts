import { Song, AppSettings } from '../types/music';

const DB_NAME = 'navy_mirage_music_db';
const DB_VERSION = 1;
const STORE_SONGS = 'songs';

const SETTINGS_KEY = 'navy_mirage_settings';
const FAVORITES_KEY = 'navy_mirage_favorites';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  visualizerMode: 'radial',
  equalizerPreset: 'flat',
  customBass: 0,
  customMid: 0,
  customTreble: 0,
  autoplayNext: true,
  mediaSessionEnabled: true,
};

// Initialize or open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_SONGS)) {
        db.createObjectStore(STORE_SONGS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generate aesthetic procedural gradient cover art based on song title
export function generateCoverGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 45 + (Math.abs(hash >> 3) % 60)) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 25%), hsl(${hue2}, 75%, 15%))`;
}

// Format seconds into MM:SS
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Format file size
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Save a song to IndexedDB
export async function saveSongToDB(song: Song): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readwrite');
    const store = tx.objectStore(STORE_SONGS);
    // Don't persist ephemeral fileUrl; keep fileBlob
    const itemToStore = {
      ...song,
      fileUrl: undefined,
    };
    const req = store.put(itemToStore);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Load all songs from IndexedDB
export async function loadAllSongsFromDB(): Promise<Song[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readonly');
    const store = tx.objectStore(STORE_SONGS);
    const req = store.getAll();

    req.onsuccess = () => {
      const favorites = getStoredFavorites();
      const rawSongs = req.result as Song[];
      const songs = rawSongs.map((s) => {
        let fileUrl: string | undefined = undefined;
        if (s.fileBlob) {
          try {
            fileUrl = URL.createObjectURL(s.fileBlob);
          } catch (e) {
            console.error('Failed to create object URL for song:', s.title, e);
          }
        }
        return {
          ...s,
          fileUrl,
          isFavorite: favorites.includes(s.id),
        };
      });
      resolve(songs);
    };

    req.onerror = () => reject(req.error);
  });
}

// Delete a song from IndexedDB
export async function deleteSongFromDB(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readwrite');
    const store = tx.objectStore(STORE_SONGS);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Clear all songs from IndexedDB
export async function clearAllSongsFromDB(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SONGS, 'readwrite');
    const store = tx.objectStore(STORE_SONGS);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Calculate total storage size in IndexedDB
export async function getStorageSize(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_SONGS, 'readonly');
    const store = tx.objectStore(STORE_SONGS);
    const req = store.getAll();

    req.onsuccess = () => {
      const songs = req.result as Song[];
      let total = 0;
      for (const song of songs) {
        if (song.size) {
          total += song.size;
        } else if (song.fileBlob) {
          total += song.fileBlob.size;
        }
      }
      resolve(total);
    };

    req.onerror = () => resolve(0);
  });
}

// LocalStorage helpers for Settings
export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

// LocalStorage helpers for Favorites
export function getStoredFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteInStorage(id: string): boolean {
  const favs = getStoredFavorites();
  const exists = favs.includes(id);
  const nextFavs = exists ? favs.filter((f) => f !== id) : [...favs, id];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavs));
  } catch (e) {
    console.warn('Failed to save favorites:', e);
  }
  return !exists;
}

// Parse metadata from File object (Filename parsing & duration detection)
export async function parseAudioFile(file: File): Promise<Song> {
  const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const ext = file.name.split('.').pop()?.toUpperCase() || 'AUDIO';

  let artist = 'Local Artist';
  let title = fileNameWithoutExt;
  let album = 'Local Library';

  // Attempt smart filename split: "Artist - Title" or "TrackNumber - Artist - Title"
  if (fileNameWithoutExt.includes(' - ')) {
    const parts = fileNameWithoutExt.split(' - ').map((s) => s.trim());
    if (parts.length === 2) {
      artist = parts[0];
      title = parts[1];
    } else if (parts.length >= 3) {
      artist = parts[1];
      title = parts.slice(2).join(' - ');
      album = parts[0];
    }
  }

  // Get duration via temporary Audio element
  const fileUrl = URL.createObjectURL(file);
  const duration = await new Promise<number>((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = fileUrl;
    audio.onloadedmetadata = () => {
      resolve(audio.duration || 0);
    };
    audio.onerror = () => {
      resolve(0);
    };
    // timeout after 2 seconds
    setTimeout(() => resolve(0), 2000);
  });

  const songId = `song_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return {
    id: songId,
    title,
    artist,
    album,
    duration,
    fileBlob: file,
    fileUrl,
    format: ext,
    size: file.size,
    dateAdded: Date.now(),
    gradientCover: generateCoverGradient(title + artist),
    isFavorite: false,
  };
}

// Create a high-quality royalty-free demo track using Web Audio API procedural synthesis
// This allows users to test the cyan visualizer and playback without forcing them to upload a file right away.
export async function createProceduralDemoTrack(): Promise<Song> {
  const sampleRate = 44100;
  const durationSec = 35; // 35 second ambient lofi loop
  const offlineCtx = new OfflineAudioContext(2, sampleRate * durationSec, sampleRate);

  // Synthesize a calming ambient lofi chord progression
  // Chords: Dm9 -> G13 -> Cmaj9 -> Am9
  const chords = [
    [146.83, 220.0, 261.63, 329.63], // Dm9
    [196.0, 246.94, 329.63, 392.0],  // G13
    [130.81, 196.0, 246.94, 329.63], // Cmaj9
    [110.0, 164.81, 220.0, 261.63],  // Am9
  ];

  const chordDuration = durationSec / chords.length;

  chords.forEach((chord, chordIdx) => {
    const startTime = chordIdx * chordDuration;
    chord.forEach((freq) => {
      // Warm sine/triangle wave
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      const filter = offlineCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.07, startTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.04, startTime + chordDuration - 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + chordDuration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(offlineCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + chordDuration);
    });
  });

  // Add subtle gentle kick / pulse on each beat
  for (let t = 0; t < durationSec; t += 2) {
    const kick = offlineCtx.createOscillator();
    const kickGain = offlineCtx.createGain();
    kick.frequency.setValueAtTime(120, t);
    kick.frequency.exponentialRampToValueAtTime(35, t + 0.3);

    kickGain.gain.setValueAtTime(0.2, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    kick.connect(kickGain);
    kickGain.connect(offlineCtx.destination);

    kick.start(t);
    kick.stop(t + 0.4);
  }

  const renderedBuffer = await offlineCtx.startRendering();

  // Convert AudioBuffer to WAV Blob
  const wavBlob = audioBufferToWavBlob(renderedBuffer);

  const songId = `demo_track_mirage_${Date.now()}`;
  const fileUrl = URL.createObjectURL(wavBlob);

  const demoSong: Song = {
    id: songId,
    title: 'Midnight Mirage (Ambient Lo-Fi)',
    artist: 'Navy Mirage Synthesizer',
    album: 'Demo Sessions Vol. 1',
    duration: durationSec,
    fileBlob: wavBlob,
    fileUrl,
    format: 'WAV',
    size: wavBlob.size,
    dateAdded: Date.now(),
    gradientCover: 'linear-gradient(135deg, #141E30 0%, #243B55 50%, #06b6d4 100%)',
    isFavorite: true,
  };

  await saveSongToDB(demoSong);
  return demoSong;
}

// Convert AudioBuffer to WAV format Blob helper
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = buffer.length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const arrayBuffer = new ArrayBuffer(totalSize);
  const dataView = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      dataView.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  dataView.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  dataView.setUint32(16, 16, true);
  dataView.setUint16(20, format, true);
  dataView.setUint16(22, numChannels, true);
  dataView.setUint32(24, sampleRate, true);
  dataView.setUint32(28, byteRate, true);
  dataView.setUint16(32, blockAlign, true);
  dataView.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  dataView.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      dataView.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
