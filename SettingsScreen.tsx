import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Info,
  Radio,
  Sliders,
  Trash2,
  HardDrive,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { AppSettings, VisualizerMode } from '../types/music';
import { formatBytes } from '../services/storageService';

interface SettingsScreenProps {
  settings: AppSettings;
  storageBytes: number;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearLibrary: () => void;
  onOpenEqualizer: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  storageBytes,
  onUpdateSettings,
  onClearLibrary,
  onOpenEqualizer,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  const handleConfirmClear = () => {
    onClearLibrary();
    setShowClearConfirm(false);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-28 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 light:text-slate-900">
          Settings & Preferences
        </h1>
        <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
          Customize neumorphic aesthetics, playback engine, and storage
        </p>
      </div>

      {/* Section 1: Appearance & Theme */}
      <div className="p-4 sm:p-5 rounded-2xl nm-raised-sm bg-[#162234]/80 light:bg-[#edf3fa]/80 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Interface & Visual Style
        </h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-100 light:text-slate-900">
              Color Palette Theme
            </p>
            <p className="text-xs text-slate-400 light:text-slate-500">
              {settings.theme === 'dark'
                ? 'Navy Mirage (#141E30 & #35577D) with cyan glow'
                : 'Silvery Slate Neumorphic Surface with cyan accents'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#121926]/70 light:bg-[#d6e0ec]/70 rounded-xl nm-inset-sm">
            <button
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                settings.theme === 'dark'
                  ? 'bg-[#18263c] text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ theme: 'light' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                settings.theme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 light:text-slate-600 hover:text-slate-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
          </div>
        </div>

        {/* Visualizer Mode selector */}
        <div className="pt-2 border-t border-slate-700/30 light:border-slate-300/60">
          <p className="text-sm font-semibold text-slate-100 light:text-slate-900 mb-2">
            Audio Visualizer Style
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'radial', name: 'Radial Bars' },
                { id: 'halo', name: 'Pulsing Halo' },
                { id: 'wave', name: 'Wave Ring' },
              ] as { id: VisualizerMode; name: string }[]
            ).map((v) => (
              <button
                key={v.id}
                onClick={() => onUpdateSettings({ visualizerMode: v.id })}
                className={`py-2 px-2 text-xs font-medium rounded-xl transition-all text-center truncate ${
                  settings.visualizerMode === v.id
                    ? 'nm-inset-sm text-cyan-400 border border-cyan-500/30 glow-cyan-sm font-semibold'
                    : 'nm-raised-sm text-slate-300 light:text-slate-700 hover:text-white'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Audio Engine & Equalizer */}
      <div className="p-4 sm:p-5 rounded-2xl nm-raised-sm bg-[#162234]/80 light:bg-[#edf3fa]/80 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Audio Engine & DSP
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-100 light:text-slate-900">
              Parametric Equalizer
            </p>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Adjust 3-band hardware frequency filters in real-time
            </p>
          </div>
          <button
            onClick={onOpenEqualizer}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl nm-raised-sm text-xs font-semibold text-cyan-400 hover:text-cyan-300 active:scale-95 transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Open EQ</span>
          </button>
        </div>

        {/* Autoplay next */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/30 light:border-slate-300/60">
          <div>
            <p className="text-sm font-semibold text-slate-100 light:text-slate-900">
              Auto-Play Next Track
            </p>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Seamlessly proceed to the next track in the queue
            </p>
          </div>
          <button
            onClick={() => onUpdateSettings({ autoplayNext: !settings.autoplayNext })}
            className={`w-12 h-7 rounded-full transition-all duration-200 relative p-0.5 ${
              settings.autoplayNext
                ? 'nm-inset bg-cyan-600/70 border border-cyan-400/40'
                : 'nm-inset bg-slate-800 light:bg-slate-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full nm-raised-sm bg-white transition-transform ${
                settings.autoplayNext ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* MediaSession Lockscreen */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/30 light:border-slate-300/60">
          <div>
            <p className="text-sm font-semibold text-slate-100 light:text-slate-900">
              Lock-Screen & Notification Controls
            </p>
            <p className="text-xs text-slate-400 light:text-slate-500">
              Uses HTML5 MediaSession API for Android/iOS lock-screens
            </p>
          </div>
          <button
            onClick={() =>
              onUpdateSettings({ mediaSessionEnabled: !settings.mediaSessionEnabled })
            }
            className={`w-12 h-7 rounded-full transition-all duration-200 relative p-0.5 ${
              settings.mediaSessionEnabled
                ? 'nm-inset bg-cyan-600/70 border border-cyan-400/40'
                : 'nm-inset bg-slate-800 light:bg-slate-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full nm-raised-sm bg-white transition-transform ${
                settings.mediaSessionEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Section 3: Browser vs Flutter Platform Architecture Notice (Requested in brief) */}
      <div className="p-4 sm:p-5 rounded-2xl nm-raised-sm bg-[#162234]/80 light:bg-[#edf3fa]/80 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Smartphone className="w-4 h-4 shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider">
            Platform & Architecture Notes
          </h2>
        </div>

        <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
          This responsive mobile-first prototype is built with React, Web Audio API, and IndexedDB. Here is how browser capabilities compare to native Flutter/Dart:
        </p>

        <div className="space-y-2.5 text-xs text-slate-400 light:text-slate-600">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 light:text-slate-800">Local Music Access:</strong>{' '}
              Web browsers enforce strict security sandboxes. Audio files are loaded via the File Picker API and cached inside your browser&apos;s IndexedDB. In a native Flutter app, direct filesystem access to Android MediaStore and iOS iPodLibrary is available with native permissions.
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Radio className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 light:text-slate-800">Background Audio:</strong>{' '}
              Implemented via the W3C MediaSession API. On mobile Chrome and Safari, audio continues in the background while the browser tab remains active. A native Flutter service with <code className="text-cyan-400">just_audio_background</code> or <code className="text-cyan-400">audio_service</code> enables persistent foreground OS services even if killed.
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Device Storage & Cache */}
      <div className="p-4 sm:p-5 rounded-2xl nm-raised-sm bg-[#162234]/80 light:bg-[#edf3fa]/80 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Storage & Cache
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl nm-inset-sm flex items-center justify-center text-cyan-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100 light:text-slate-900">
                IndexedDB Cache Size
              </p>
              <p className="text-xs text-slate-400 light:text-slate-500 font-mono tabular-nums">
                {formatBytes(storageBytes)} utilized locally
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl nm-raised-sm text-xs font-semibold text-rose-400 hover:text-rose-300 active:scale-95 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Library</span>
          </button>
        </div>

        {clearedNotice && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Library cache has been cleared successfully.</span>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#162234] light:bg-white rounded-2xl p-5 nm-raised-lg border border-slate-700/60 light:border-slate-300 text-center space-y-3">
            <div className="w-12 h-12 rounded-full nm-inset-sm text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100 light:text-slate-900">
              Clear All Cached Songs?
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-600">
              This will remove all cached audio files and metadata from your browser&apos;s IndexedDB. Your physical files on your device will NOT be deleted.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl nm-raised-sm text-xs font-semibold text-slate-300 light:text-slate-700 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="flex-1 py-2.5 rounded-xl nm-raised-sm text-xs font-semibold text-rose-400 hover:text-rose-300 active:scale-95 transition-all"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
