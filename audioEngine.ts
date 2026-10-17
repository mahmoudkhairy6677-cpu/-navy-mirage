import { Song, EqualizerPreset } from '../types/music';

export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  { id: 'flat', name: 'Flat / Studio', bass: 0, mid: 0, treble: 0 },
  { id: 'bass', name: 'Deep Bass Boost', bass: 6, mid: -1, treble: 0 },
  { id: 'vocal', name: 'Vocal Clarity', bass: -2, mid: 5, treble: 2 },
  { id: 'acoustic', name: 'Acoustic Warmth', bass: 3, mid: 2, treble: 4 },
  { id: 'treble', name: 'Bright Treble', bass: -2, mid: 1, treble: 6 },
  { id: 'mellow', name: 'Night Mellow', bass: 3, mid: -1, treble: -4 },
];

export class AudioEngine {
  private static instance: AudioEngine;
  private audio: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private frequencyData: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(64));

  private isInitialized = false;
  private currentSong: Song | null = null;

  // Callbacks
  public onPlayStateChange?: (isPlaying: boolean) => void;
  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onSongEnded?: () => void;
  public onError?: (error: string) => void;
  public onNextTrackRequest?: () => void;
  public onPrevTrackRequest?: () => void;

  private constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';

    // Hook standard HTML audio events
    this.audio.addEventListener('play', () => {
      this.updateMediaSessionPlaybackState('playing');
      this.onPlayStateChange?.(true);
    });

    this.audio.addEventListener('pause', () => {
      this.updateMediaSessionPlaybackState('paused');
      this.onPlayStateChange?.(false);
    });

    this.audio.addEventListener('timeupdate', () => {
      const current = this.audio.currentTime || 0;
      const total = this.audio.duration || this.currentSong?.duration || 0;
      this.onTimeUpdate?.(current, total);
      this.updateMediaSessionPosition(current, total);
    });

    this.audio.addEventListener('ended', () => {
      this.onSongEnded?.();
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      this.onError?.('Unable to play audio track. The format may not be supported by this browser.');
    });
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  // Web Audio Context initialization on user gesture
  private initAudioContext(): void {
    if (this.isInitialized) {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      // Analyser for visualizer
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.frequencyData = new Uint8Array(new ArrayBuffer(this.analyserNode.frequencyBinCount));

      // 3-Band Equalizer nodes
      // Bass: LowShelf at 150 Hz
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 150;
      this.bassFilter.gain.value = 0;

      // Mid: Peaking at 1000 Hz
      this.midFilter = this.audioCtx.createBiquadFilter();
      this.midFilter.type = 'peaking';
      this.midFilter.frequency.value = 1000;
      this.midFilter.Q.value = 1.0;
      this.midFilter.gain.value = 0;

      // Treble: HighShelf at 6000 Hz
      this.trebleFilter = this.audioCtx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 6000;
      this.trebleFilter.gain.value = 0;

      // Master Gain
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 1.0;

      // Connect HTML Audio -> Source -> Bass -> Mid -> Treble -> Gain -> Analyser -> Destination
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.bassFilter);
      this.bassFilter.connect(this.midFilter);
      this.midFilter.connect(this.trebleFilter);
      this.trebleFilter.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);

      this.isInitialized = true;
    } catch (err) {
      console.warn('Web Audio API not fully available, falling back to basic audio:', err);
    }
  }

  // Load and play a song
  public async loadAndPlay(song: Song, startTime = 0): Promise<void> {
    this.initAudioContext();
    this.currentSong = song;

    let src = song.fileUrl;
    if (!src && song.fileBlob) {
      src = URL.createObjectURL(song.fileBlob);
      song.fileUrl = src;
    }

    if (!src) {
      this.onError?.('Missing audio source for song.');
      return;
    }

    this.audio.src = src;
    this.audio.currentTime = startTime;

    this.setupMediaSession(song);

    try {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }
      await this.audio.play();
    } catch (err) {
      console.error('Play prevented or failed:', err);
    }
  }

  public async play(): Promise<void> {
    this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    try {
      await this.audio.play();
    } catch (e) {
      console.error('Playback resume failed:', e);
    }
  }

  public pause(): void {
    this.audio.pause();
  }

  public seek(seconds: number): void {
    if (isFinite(seconds) && seconds >= 0) {
      this.audio.currentTime = seconds;
    }
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.audio.volume = clamped;
  }

  public setEqualizer(bass: number, mid: number, treble: number): void {
    if (this.bassFilter) this.bassFilter.gain.value = bass;
    if (this.midFilter) this.midFilter.gain.value = mid;
    if (this.trebleFilter) this.trebleFilter.gain.value = treble;
  }

  public applyPreset(presetId: string): void {
    const preset = EQUALIZER_PRESETS.find((p) => p.id === presetId) || EQUALIZER_PRESETS[0];
    this.setEqualizer(preset.bass, preset.mid, preset.treble);
  }

  // Get live frequency data for cyan visualizer
  public getFrequencyData(): Uint8Array<ArrayBuffer> {
    if (this.analyserNode && !this.audio.paused) {
      this.analyserNode.getByteFrequencyData(this.frequencyData);
    } else {
      // Gentle decay when paused
      for (let i = 0; i < this.frequencyData.length; i++) {
        this.frequencyData[i] = Math.max(0, this.frequencyData[i] * 0.9);
      }
    }
    return this.frequencyData;
  }

  public isPlaying(): boolean {
    return !this.audio.paused && !this.audio.ended && this.audio.readyState > 2;
  }

  public getCurrentTime(): number {
    return this.audio.currentTime || 0;
  }

  public getDuration(): number {
    return this.audio.duration || this.currentSong?.duration || 0;
  }

  // MediaSession API Integration for Lockscreen & Background playback
  private setupMediaSession(song: Song): void {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album,
        artwork: [
          {
            src: song.coverArtUrl || '/favicon.ico',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        this.play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.onPrevTrackRequest?.();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.onNextTrackRequest?.();
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        this.seek(Math.max(0, this.audio.currentTime - offset));
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        this.seek(Math.min(this.audio.duration, this.audio.currentTime + offset));
      });
    } catch (e) {
      console.warn('MediaSession handler error:', e);
    }
  }

  private updateMediaSessionPlaybackState(state: 'playing' | 'paused'): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  private updateMediaSessionPosition(current: number, total: number): void {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      try {
        if (total > 0 && isFinite(current) && isFinite(total)) {
          navigator.mediaSession.setPositionState({
            duration: total,
            playbackRate: this.audio.playbackRate || 1,
            position: Math.min(current, total),
          });
        }
      } catch {
        // Ignore minor position state rate errors
      }
    }
  }
}
