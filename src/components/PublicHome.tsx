import React from 'react';
import {
  UserCheck,
  ArrowRight,
  ShieldAlert,
  Users,
  School,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  HelpCircle,
  FileQuestion,
  Megaphone,
} from 'lucide-react';
import { LaporSpentikerSection } from './LaporSpentikerSection';
import { SchoolSettings, DashboardStats } from '../types';

interface PublicHomeProps {
  settings: SchoolSettings;
  stats: DashboardStats;
  onOpenStudentLogin: () => void;
  onOpenAdminLogin: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  settings,
  stats,
  onOpenStudentLogin,
  onOpenAdminLogin,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Announcement Alert if set */}
      {settings.pesanPengumuman && (
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Pengumuman Sekolah &bull; Tahun Ajaran {settings.tahunAjaran || '2026/2027'}
            </h4>
            <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">
              {settings.pesanPengumuman}
            </p>
          </div>
        </div>
      )}

      {/* Main Hero Card: Pengecekan Data Siswa */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-sky-600 to-indigo-900 text-white shadow-2xl shadow-blue-900/20 border border-blue-400/20">
        {/* Glow Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-300/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12">
          {/* Text & Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-sky-200 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Sistem Validasi Mandiri
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                PENGECEKAN DATA SISWA
              </h1>
              <p className="text-base sm:text-lg text-sky-100 font-light leading-relaxed max-w-xl">
                Silakan masuk menggunakan kelas dan nama untuk memeriksa serta memastikan kebenaran data pribadi Anda.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onOpenStudentLogin}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-blue-800 hover:bg-sky-50 active:bg-blue-100 text-base font-extrabold rounded-2xl shadow-xl shadow-blue-950/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <UserCheck className="w-5 h-5 text-blue-600" />
                MASUK MENU SISWA
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </button>

              <div className="text-xs text-sky-200/90 font-medium sm:max-w-xs">
                Cukup pilih kelas dan nama terdaftar Anda untuk melihat & mengajukan koreksi data diri.
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15 text-xs text-sky-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0" />
                <span>Terhubung Dapodik</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0" />
                <span>Validasi Orang Tua</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0" />
                <span>Data PIP Terpantau</span>
              </div>
            </div>
          </div>

          {/* Education Graphic / Quick Stats Highlights */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-inner">
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Status Database Sekolah</h3>
                    <p className="text-xs text-sky-200">SMP Negeri 3 Kertek</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-full text-[11px] font-semibold">
                  Online
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-5">
                <div className="bg-white/10 rounded-xl p-3.5">
                  <div className="text-xs text-sky-200">Total Kelas</div>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {stats.totalKelas || 12} <span className="text-xs font-normal text-sky-200">Rombel</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-3.5">
                  <div className="text-xs text-sky-200">Total Murid</div>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {stats.totalSiswa || 0} <span className="text-xs font-normal text-sky-200">Siswa</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-3.5">
                  <div className="text-xs text-sky-200">Sudah Periksa</div>
                  <div className="text-2xl font-extrabold text-emerald-300 mt-1">
                    {(stats.sudahDiperiksaSiswa || 0) + (stats.terverifikasiAdmin || 0)}{' '}
                    <span className="text-xs font-normal text-sky-200">Siswa</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-3.5">
                  <div className="text-xs text-sky-200">Penerima PIP</div>
                  <div className="text-2xl font-extrabold text-amber-300 mt-1">
                    {stats.penerimaPip || 0}{' '}
                    <span className="text-xs font-normal text-sky-200">Siswa</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-sky-200/80 mt-4 text-center">
                *Data pribadi (NIK, NIPD, Alamat, Orang Tua) dilindungi dan tidak ditampilkan ke publik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lapor Spentiker Section directly on Front Page as requested */}
      <section id="lapor-spentiker" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-6 bg-blue-600 rounded-full" />
              Layanan Aspirasi & Pengaduan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Formulir pengaduan resmi Lapor Spentiker untuk siswa, wali murid, dan warga sekolah
            </p>
          </div>
        </div>

        <LaporSpentikerSection />
      </section>

      {/* 3 Step Guide Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 text-center">
          Tata Cara Pemeriksaan & Validasi Data Siswa
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
              1
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Pilih Kelas & Nama Anda</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Klik tombol &ldquo;Masuk Menu Siswa&rdquo; di atas, kemudian pilih rombongan belajar kelas Anda dan cari nama lengkap Anda di daftar.
            </p>
          </div>

          <div className="p-5 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
              2
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Periksa Seluruh 4 Bagian Data</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cocokkan NIK, NISN, Tempat/Tanggal Lahir, Alamat RT/RW, data Ayah dan Ibu, serta status penerimaan beasiswa PIP dengan Kartu Keluarga Anda.
            </p>
          </div>

          <div className="p-5 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
              3
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Konfirmasi / Simpan Perbaikan</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Jika data sudah tepat, klik tombol &ldquo;Data Sudah Benar&rdquo;. Jika ada kesalahan ketik, perbaiki langsung di kolom lalu klik &ldquo;Simpan Perbaikan&rdquo;.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="text-center py-6 border-t border-slate-200 text-xs text-slate-400 space-y-1">
        <p className="font-medium text-slate-600">
          &copy; {new Date().getFullYear()} Bank Data Siswa SMP Negeri 3 Kertek
        </p>
        <p>
          {settings.alamatSekolah} &bull; Wonosobo, Jawa Tengah &bull; Telepon: {settings.telepon}
        </p>
      </footer>
    </div>
  );
};
