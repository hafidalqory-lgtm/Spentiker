import React from 'react';
import { Shield, MessageSquare, Home, Sparkles, UserCheck } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { SchoolSettings } from '../types';

interface HeaderProps {
  settings: SchoolSettings;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onGoToDashboard: () => void;
  onGoHome: () => void;
  onOpenLaporSpentiker?: () => void;
  onOpenStudentLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onGoToDashboard,
  onGoHome,
  onOpenLaporSpentiker,
  onOpenStudentLogin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm shadow-blue-900/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-3.5 cursor-pointer group transition-transform"
        >
          <SchoolLogo customLogoUrl={settings.logoUrl} size="md" />
          <div className="flex flex-col">
            <span className="text-xs uppercase font-bold tracking-wider text-sky-700 flex items-center gap-1">
              BANK DATA SISWA
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight leading-tight group-hover:text-blue-700 transition-colors">
              {settings.namaSekolah || 'SMP NEGERI 3 KERTEK'}
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline-block font-medium">
              Kabupaten Wonosobo &bull; Jawa Tengah
            </span>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenStudentLogin && (
            <button
              onClick={onOpenStudentLogin}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all"
            >
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline">Cek Data Siswa</span>
              <span className="md:hidden">Siswa</span>
            </button>
          )}

          {onOpenLaporSpentiker && (
            <button
              onClick={onOpenLaporSpentiker}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all"
            >
              <MessageSquare className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Lapor Spentiker</span>
              <span className="sm:hidden">Lapor</span>
            </button>
          )}

          {isAdminLoggedIn ? (
            <button
              onClick={onGoToDashboard}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 rounded-xl shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <Shield className="w-4 h-4 text-sky-200" />
              <span>Dashboard Admin</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm transition-all hover:border-slate-400"
              title="Masuk sebagai Administrator Sekolah"
            >
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
