import React, { useEffect, useRef } from 'react';
import { AudioEngine } from '../services/audioEngine';
import { Song, VisualizerMode } from '../types/music';
import { Disc3 } from 'lucide-react';

interface AudioVisualizerProps {
  song: Song | null;
  isPlaying: boolean;
  mode?: VisualizerMode;
  size?: number; // default 260px
  onToggleMode?: () => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  song,
  isPlaying,
  mode = 'radial',
  size = 280,
  onToggleMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const rotationRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const engine = AudioEngine.getInstance();
    const centerX = size / 2;
    const centerY = size / 2;
    const innerRadius = size * 0.33; // radius of inner disc
    const maxBarLength = size * 0.14; // length of radial bars

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      const freqData = engine.getFrequencyData();
      const avgEnergy = freqData.length > 0 
        ? freqData.reduce((acc, val) => acc + val, 0) / (freqData.length * 255) 
        : 0;

      phaseRef.current += isPlaying ? 0.04 : 0.01;
      if (isPlaying) {
        rotationRef.current = (rotationRef.current + 0.35 + avgEnergy * 0.5) % 360;
      }

      ctx.save();

      if (mode === 'radial') {
        // Mode 1: 360 Radial Cyan Bars
        const barCount = 48;
        const step = (Math.PI * 2) / barCount;

        for (let i = 0; i < barCount; i++) {
          const angle = i * step + (rotationRef.current * Math.PI) / 180;
          const dataIdx = Math.floor((i / barCount) * (freqData.length * 0.8));
          const val = freqData[dataIdx] || 0;
          
          // Normalized height with subtle breathing wave when paused
          const normalized = isPlaying 
            ? Math.max(0.08, val / 255) 
            : 0.06 + Math.sin(phaseRef.current + i * 0.3) * 0.04;
          
          const barLength = normalized * maxBarLength;
          const startX = centerX + Math.cos(angle) * (innerRadius + 4);
          const startY = centerY + Math.sin(angle) * (innerRadius + 4);
          const endX = centerX + Math.cos(angle) * (innerRadius + 4 + barLength);
          const endY = centerY + Math.sin(angle) * (innerRadius + 4 + barLength);

          // Cyan glow styling
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';

          // Cyan gradient stroke
          const grad = ctx.createLinearGradient(startX, startY, endX, endY);
          grad.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
          grad.addColorStop(1, 'rgba(34, 211, 238, 0.95)');
          ctx.strokeStyle = grad;

          // Shadow glow
          ctx.shadowColor = 'rgba(6, 182, 212, 0.7)';
          ctx.shadowBlur = 8;
          ctx.stroke();
        }
      } else if (mode === 'halo') {
        // Mode 2: Multi-layer Pulsing Cyan Halo
        const pulse = Math.sin(phaseRef.current * 2) * 6;
        const haloRadius = innerRadius + 12 + avgEnergy * 30 + (isPlaying ? pulse : 2);

        // Outer glow circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, haloRadius, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
        ctx.shadowColor = 'rgba(6, 182, 212, 0.9)';
        ctx.shadowBlur = 18;
        ctx.stroke();

        // Secondary harmonic ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, haloRadius + 10, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
        ctx.shadowBlur = 8;
        ctx.stroke();
      } else {
        // Mode 3: Dynamic Cyan Waveform Ring
        ctx.beginPath();
        const points = 72;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const dataIdx = Math.floor((i / points) * (freqData.length * 0.7));
          const val = freqData[dataIdx] || 0;
          const offset = isPlaying 
            ? (val / 255) * (maxBarLength * 1.1) 
            : Math.sin(phaseRef.current + i * 0.4) * 5;
          
          const r = innerRadius + 8 + offset;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.9)';
        ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
        ctx.shadowBlur = 12;
        ctx.stroke();
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [size, mode, isPlaying]);

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer select-none group"
      style={{ width: size, height: size }}
      onClick={onToggleMode}
      title="Tap to switch visualizer mode"
    >
      {/* Real-time Web Audio Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{ width: size, height: size }}
      />

      {/* Outer Neumorphic Sunken Groove Ring */}
      <div
        className="absolute rounded-full nm-inset flex items-center justify-center transition-all duration-300"
        style={{
          width: size * 0.82,
          height: size * 0.82,
        }}
      >
        {/* Raised Neumorphic Center Hub / Disc */}
        <div
          className={`relative rounded-full nm-raised flex items-center justify-center overflow-hidden transition-all duration-300 ${
            isPlaying ? 'ring-2 ring-cyan-400/40 glow-cyan-sm' : ''
          }`}
          style={{
            width: size * 0.68,
            height: size * 0.68,
            background: song?.coverArtUrl
              ? `url(${song.coverArtUrl}) center/cover no-repeat`
              : song?.gradientCover || 'linear-gradient(145deg, #18263c, #121d2e)',
          }}
        >
          {/* Subtle vinyl micro-grooves overlay */}
          <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none bg-[radial-gradient(circle,transparent_20%,#000_21%,transparent_22%,#000_35%,transparent_36%,#000_50%,transparent_51%,#000_65%,transparent_66%,#000_80%,transparent_81%)]" />

          {/* Central Neumorphic Center Cap with Vinyl spindle */}
          <div className="relative z-20 w-12 h-12 rounded-full nm-raised-sm bg-[#162234] dark:bg-[#141e30] border border-cyan-500/20 flex items-center justify-center shadow-inner">
            <div className="w-4 h-4 rounded-full nm-inset-sm bg-[#0f1725] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 glow-cyan-sm" />
            </div>
          </div>

          {/* Fallback Disc Icon if no cover */}
          {!song?.coverArtUrl && (
            <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
              <Disc3 className="w-24 h-24 text-cyan-300" />
            </div>
          )}
        </div>
      </div>

      {/* Mode hint indicator */}
      <div className="absolute -bottom-2 text-[10px] tracking-wider uppercase font-medium text-cyan-400/70 group-hover:text-cyan-300 transition-colors z-20">
        {mode} mode
      </div>
    </div>
  );
};
