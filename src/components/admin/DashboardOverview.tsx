import React from 'react';
import {
  Users,
  School,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { DashboardStats, Student, ReportItem, ClassItem } from '../../types';

interface DashboardOverviewProps {
  stats: DashboardStats;
  students: Student[];
  reports: ReportItem[];
  classes: ClassItem[];
  onNavigate: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  students,
  reports,
  classes,
  onNavigate,
}) => {
  // Pending students waiting for admin check
  const pendingStudents = students.filter(
    (s) => s.statusPengecekan === 'Menunggu Verifikasi Admin'
  );

  // Recent reports
  const pendingReports = reports.filter(
    (r) => r.status === 'Menunggu Tanggapan' || r.status === 'Sedang Ditindaklanjuti'
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sky-100 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Panel Utama Operator Sekolah
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Bank Data Siswa
            </h2>
            <p className="text-sm text-sky-100 leading-relaxed">
              Monitoring real-time status validasi data mandiri siswa, perbaikan berkas Dapodik, dan layanan pengaduan Lapor Spentiker SMP Negeri 3 Kertek.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('pengecekan')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-800 hover:bg-sky-50 text-xs font-extrabold rounded-2xl shadow-lg transition-all"
            >
              <Clock className="w-4 h-4 text-blue-600" />
              Tinjau ({pendingStudents.length}) Verifikasi
            </button>
            <button
              onClick={() => onNavigate('lapor-spentiker')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-extrabold rounded-2xl backdrop-blur-md transition-all"
            >
              <MessageSquare className="w-4 h-4 text-sky-200" />
              Aduan ({pendingReports.length})
            </button>
          </div>
        </div>
      </div>

      {/* 6 Mandatory Statistics Cards calculated from real data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Siswa */}
        <div
          onClick={() => onNavigate('data-murid')}
          className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Siswa</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            {stats.totalSiswa}
          </div>
          <div className="text-[11px] text-slate-400">Terdaftar di database</div>
        </div>

        {/* 2. Total Kelas */}
        <div
          onClick={() => onNavigate('data-kelas')}
          className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kelas</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            {stats.totalKelas}
          </div>
          <div className="text-[11px] text-slate-400">Rombongan belajar</div>
        </div>

        {/* 3. Sudah Memeriksa */}
        <div
          onClick={() => onNavigate('data-sudah')}
          className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sudah Periksa</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-600">
            {stats.sudahDiperiksaSiswa}
          </div>
          <div className="text-[11px] text-slate-400">Konfirmasi mandiri</div>
        </div>

        {/* 4. Belum Memeriksa */}
        <div
          onClick={() => onNavigate('data-belum')}
          className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Belum Periksa</span>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-700">
            {stats.belumDiperiksa}
          </div>
          <div className="text-[11px] text-slate-400">Perlu diingatkan</div>
        </div>

        {/* 5. Mengajukan Perbaikan */}
        <div
          onClick={() => onNavigate('pengecekan')}
          className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ajukan Koreksi</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {stats.menungguVerifikasi}
          </div>
          <div className="text-[11px] text-slate-400">Menunggu persetujuan</div>
        </div>

        {/* 6. Terverifikasi Admin */}
        <div
          onClick={() => onNavigate('data-sudah')}
          className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Terverifikasi</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {stats.terverifikasiAdmin}
          </div>
          <div className="text-[11px] text-slate-400">Sah sesuai dokumen</div>
        </div>
      </div>

      {/* Two Column Section: Antrean Verifikasi & Rekap Aduan Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antrean Verifikasi Perbaikan */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Antrean Verifikasi Perbaikan</h3>
                <p className="text-xs text-slate-400">Siswa yang mengajukan perubahan data</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('pengecekan')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingStudents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Semua pengajuan perbaikan data siswa telah selesai diproses!
              </div>
            ) : (
              pendingStudents.slice(0, 5).map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{s.nama}</span>
                    <div className="text-[11px] text-slate-500">
                      Kelas: <strong>{s.kelas}</strong> &bull; NISN: {s.nisn || '-'}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('pengecekan')}
                    className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-[11px]"
                  >
                    Periksa
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rekap Lapor Spentiker Terkini */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Lapor Spentiker Terkini</h3>
                <p className="text-xs text-slate-400">Pengaduan dan aspirasi masuk</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('lapor-spentiker')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              Kelola Aduan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {reports.slice(0, 5).map((r) => (
              <div key={r.id} className="py-3 flex items-start justify-between text-xs gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700 text-[10px] bg-blue-50 px-1.5 py-0.5 rounded">
                      {r.nomorTiket}
                    </span>
                    <span className="font-bold text-slate-800 line-clamp-1">{r.judulAduan}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] line-clamp-1">
                    {r.namaPelapor} ({r.jenisAduan}) &bull; {r.detailAduan}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    r.status === 'Selesai'
                      ? 'bg-emerald-100 text-emerald-800'
                      : r.status === 'Sedang Ditindaklanjuti'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
