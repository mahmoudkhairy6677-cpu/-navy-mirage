export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  fileBlob?: Blob;
  fileUrl?: string;
  coverArtUrl?: string;
  gradientCover?: string;
  format?: string;
  size?: number; // bytes
  dateAdded: number;
  isFavorite?: boolean;
}

export type VisualizerMode = 'radial' | 'halo' | 'wave';

export type RepeatMode = 'off' | 'all' | 'one';

export interface EqualizerPreset {
  id: string;
  name: string;
  bass: number; // dB (-10 to 10)
  mid: number;  // dB (-10 to 10)
  treble: number; // dB (-10 to 10)
}

export interface AppSettings {
  theme: 'dark' | 'light';
  visualizerMode: VisualizerMode;
  equalizerPreset: string;
  customBass: number;
  customMid: number;
  customTreble: number;
  autoplayNext: boolean;
  mediaSessionEnabled: boolean;
}
