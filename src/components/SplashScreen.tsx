import React, { useEffect, useState } from 'react';
import { SchoolLogo } from './SchoolLogo';

interface SplashScreenProps {
  onFinish: () => void;
  logoUrl?: string;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  logoUrl,
  durationMs = 3000,
}) => {
  const [progress, setProgress] = useState(0);
  const [fadeState, setFadeState] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    // Fade in
    const enterTimer = setTimeout(() => {
      setFadeState('visible');
    }, 100);

    // Progress bar animation
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);
      if (elapsed >= durationMs) {
        clearInterval(interval);
      }
    }, 30);

    // Exit transition trigger at 2700ms
    const exitTimer = setTimeout(() => {
      setFadeState('exit');
    }, Math.max(0, durationMs - 300));

    // Finish exactly at durationMs (3000ms)
    const finishTimer = setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
      clearInterval(interval);
    };
  }, [durationMs, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-sky-500 via-blue-700 to-indigo-950 text-white transition-opacity duration-300 ${
        fadeState === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Digital Grid / Radial Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.25)_0%,transparent_70%)] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative Ornaments */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-sky-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Logo with pulsing glow */}
        <div className="relative mb-6 transform transition-all duration-700 hover:scale-105">
          <div className="absolute -inset-3 bg-gradient-to-r from-sky-400 to-blue-300 rounded-2xl blur-lg opacity-60 animate-pulse" />
          <div className="relative p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl">
            <SchoolLogo customLogoUrl={logoUrl} size="xl" />
          </div>
        </div>

        {/* Titles with elegant staggered animations */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-white/15 text-sky-200 rounded-full border border-white/20 backdrop-blur-sm">
            Sistem Informasi Sekolah
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            SELAMAT DATANG
          </h1>
          <h2 className="text-lg md:text-xl font-medium text-sky-100 tracking-wide">
            DI BANK DATA SMP NEGERI 3 KERTEK
          </h2>
          <p className="text-xs text-sky-200/80 pt-1">
            Kecamatan Kertek, Kabupaten Wonosobo, Jawa Tengah
          </p>
        </div>

        {/* Loading Bar with 3-second duration */}
        <div className="w-56 mt-8 space-y-2">
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-sky-300 to-white rounded-full transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-sky-200/70 font-mono">
            <span>Memuat data aplikasi...</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="absolute bottom-6 text-center text-xs text-sky-200/60 font-light">
        SMP Negeri 3 Kertek &bull; Unggul dalam Prestasi, Santun dalam Budi Pekerti
      </div>
    </div>
  );
};
