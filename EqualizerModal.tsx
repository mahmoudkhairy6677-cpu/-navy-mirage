import React from 'react';
import { X, Sliders, RotateCcw } from 'lucide-react';
import { EQUALIZER_PRESETS } from '../services/audioEngine';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: string;
  bass: number;
  mid: number;
  treble: number;
  onPresetSelect: (presetId: string) => void;
  onCustomChange: (bass: number, mid: number, treble: number) => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  currentPreset,
  bass,
  mid,
  treble,
  onPresetSelect,
  onCustomChange,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    onPresetSelect('flat');
    onCustomChange(0, 0, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-md bg-[#162234] dark:bg-[#141e30] border-t sm:border border-slate-700/50 rounded-t-3xl sm:rounded-3xl p-6 nm-raised-lg relative max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full nm-inset-sm flex items-center justify-center text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 tracking-tight">Audio Equalizer</h3>
              <p className="text-xs text-slate-400">Web Audio API 3-band parametric DSP</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="w-8 h-8 rounded-full nm-raised-sm flex items-center justify-center text-slate-400 hover:text-cyan-400 active:scale-95 transition-transform"
              title="Reset to Flat"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full nm-raised-sm flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="my-5">
          <label className="text-xs font-medium text-slate-400 block mb-2.5 uppercase tracking-wider">
            Acoustic Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            {EQUALIZER_PRESETS.map((preset) => {
              const isActive = currentPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onPresetSelect(preset.id)}
                  className={`py-2 px-2 text-xs font-medium rounded-xl transition-all duration-200 text-center truncate ${
                    isActive
                      ? 'nm-inset-sm text-cyan-400 border border-cyan-500/30 glow-cyan-sm'
                      : 'nm-raised-sm text-slate-300 hover:text-white'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Band Sliders */}
        <div className="space-y-5 my-6 p-4 rounded-2xl nm-inset-sm bg-[#121926]/50">
          {/* Bass */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-300">Bass (150 Hz)</span>
              <span className="text-cyan-400 font-mono tabular-nums">{bass > 0 ? `+${bass}` : bass} dB</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={bass}
                onChange={(e) => onCustomChange(Number(e.target.value), mid, treble)}
                className="w-full h-2 rounded-lg nm-inset appearance-none bg-slate-900/60"
              />
            </div>
          </div>

          {/* Mid */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-300">Mid (1.0 kHz)</span>
              <span className="text-cyan-400 font-mono tabular-nums">{mid > 0 ? `+${mid}` : mid} dB</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={mid}
                onChange={(e) => onCustomChange(bass, Number(e.target.value), treble)}
                className="w-full h-2 rounded-lg nm-inset appearance-none bg-slate-900/60"
              />
            </div>
          </div>

          {/* Treble */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-medium text-slate-300">Treble (6.0 kHz)</span>
              <span className="text-cyan-400 font-mono tabular-nums">{treble > 0 ? `+${treble}` : treble} dB</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={treble}
                onChange={(e) => onCustomChange(bass, mid, Number(e.target.value))}
                className="w-full h-2 rounded-lg nm-inset appearance-none bg-slate-900/60"
              />
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl nm-raised text-xs font-semibold text-cyan-400 hover:text-cyan-300 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
        >
          Apply & Return to Player
        </button>
      </div>
    </div>
  );
};
