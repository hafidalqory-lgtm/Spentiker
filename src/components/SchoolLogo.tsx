import React from 'react';

interface SchoolLogoProps {
  customLogoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  customLogoUrl,
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  if (customLogoUrl && customLogoUrl.trim().length > 0) {
    return (
      <img
        src={customLogoUrl}
        alt="Logo SMP Negeri 3 Kertek"
        className={`${sizeMap[size]} object-contain drop-shadow-sm rounded-lg ${className}`}
      />
    );
  }

  // Official aesthetic vector emblem for SMP Negeri 3 Kertek
  return (
    <div
      className={`${sizeMap[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 via-sky-600 to-indigo-800 text-white shadow-md shadow-blue-500/20 border border-blue-400/30 shrink-0 ${className}`}
      title="SMP Negeri 3 Kertek"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-[85%] h-[85%] drop-shadow"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pentagon Shield Outline */}
        <polygon
          points="50,6 94,36 78,92 22,92 6,36"
          fill="#0284c7"
          stroke="#f8fafc"
          strokeWidth="3.5"
        />
        {/* Inner Shield */}
        <polygon
          points="50,14 86,40 72,86 28,86 14,40"
          fill="#0369a1"
          stroke="#38bdf8"
          strokeWidth="2"
        />
        {/* Open Book */}
        <path
          d="M50 68 C42 62 30 63 24 67 L24 45 C30 41 42 40 50 46 C58 40 70 41 76 45 L76 67 C70 63 58 62 50 68 Z"
          fill="#f8fafc"
        />
        <path
          d="M50 46 L50 68"
          stroke="#0284c7"
          strokeWidth="2"
        />
        {/* Torch / Flame */}
        <path
          d="M50 22 C47 27 45 32 47 36 C49 39 52 40 53 38 C54 36 53 34 51 32 C54 31 55 27 50 22 Z"
          fill="#f59e0b"
        />
        <path
          d="M49 26 C47 29 47 31 48 34 C49 32 50 30 49 26 Z"
          fill="#fef08a"
        />
        {/* Star */}
        <polygon
          points="50,16 51.5,19.5 55,19.5 52,21.5 53,25 50,23 47,25 48,21.5 45,19.5 48.5,19.5"
          fill="#fbbf24"
        />
      </svg>
    </div>
  );
};
