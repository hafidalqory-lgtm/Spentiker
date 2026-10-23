import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Users,
  School,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  FileDown,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Student, ClassItem, ReportItem } from '../../types';
import {
  exportStudentsToExcel,
  exportClassesToExcel,
  exportReportsToExcel,
  downloadStudentTemplateExcel,
  downloadClassTemplateExcel,
} from '../../utils/excelUtils';

interface DownloadExcelViewProps {
  students: Student[];
  classes: ClassItem[];
  reports: ReportItem[];
}

export const DownloadExcelView: React.FC<DownloadExcelViewProps> = ({
  students,
  classes,
  reports,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.namaKelas || 'VII A');

  // Computed counts
  const totalStudents = students.length;
  const belumDiperiksaStudents = students.filter((s) => s.statusPengecekan === 'Belum Diperiksa');
  const sudahDiperiksaStudents = students.filter(
    (s) => s.statusPengecekan === 'Sudah Diperiksa Siswa' || s.statusPengecekan === 'Terverifikasi Admin'
  );
  const menungguVerifikasiStudents = students.filter((s) => s.statusPengecekan === 'Menunggu Verifikasi Admin');
  const perluPerbaikanStudents = students.filter((s) => s.statusPengecekan === 'Perlu Perbaikan');
  const classStudents = students.filter((s) => s.kelas.trim().toLowerCase() === selectedClass.trim().toLowerCase());

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md text-sky-100">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Pusat Ekspor Data Resmi .XLSX
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pusat Unduhan & Ekspor Excel
          </h2>
          <p className="text-sm text-sky-100 leading-relaxed">
            Unduh seluruh database siswa, data rombel per kelas, status verifikasi, rekapitulasi aduan Lapor Spentiker, dan template standar dalam format Microsoft Excel (.xlsx) dengan kolom yang rapi serta angka nol depan (NIK/NISN/RT/RW) yang tetap utuh.
          </p>
        </div>
      </div>

      {/* Primary Download Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Semua Data Siswa */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Database Lengkap
              </span>
              <h3 className="text-lg font-bold text-slate-800">Semua Data Siswa</h3>
              <p className="text-xs text-slate-500 mt-1">
                Seluruh {totalStudents} siswa lengkap dengan 30 kolom identitas, orang tua, status PIP, dan catatan admin.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => exportStudentsToExcel(students, 'Semua_Data_Siswa_SMPN_3_Kertek.xlsx')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Semua Siswa (.xlsx)
            </button>
            <div className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Semua_Data_Siswa_SMPN_3_Kertek.xlsx
            </div>
          </div>
        </div>

        {/* 2. Data Siswa Berdasarkan Kelas */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <School className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                Per Rombongan Belajar
              </span>
              <h3 className="text-lg font-bold text-slate-800">Data Siswa per Kelas</h3>
              <p className="text-xs text-slate-500 mt-1">
                Pilih kelas yang diinginkan untuk mengunduh rekap khusus siswa di kelas tersebut.
              </p>
            </div>

            <div className="pt-1">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Pilih Kelas yang Diunduh:
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.namaKelas}>
                    Kelas {cls.namaKelas} ({cls.jumlahSiswa || 0} Siswa)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                const safeName = selectedClass.replace(/\s+/g, '_');
                exportStudentsToExcel(classStudents, `Data_Siswa_Kelas_${safeName}.xlsx`);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Kelas {selectedClass} ({classStudents.length} Siswa)
            </button>
            <div className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Data_Siswa_Kelas_{selectedClass.replace(/\s+/g, '_')}.xlsx
            </div>
          </div>
        </div>

        {/* 3. Siswa Belum Diperiksa */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Monitoring Siswa
              </span>
              <h3 className="text-lg font-bold text-slate-800">Siswa Belum Diperiksa</h3>
              <p className="text-xs text-slate-500 mt-1">
                Daftar {belumDiperiksaStudents.length} siswa yang belum login dan belum melakukan validasi data mandiri.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => exportStudentsToExcel(belumDiperiksaStudents, 'Data_Belum_Diperiksa.xlsx')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Belum Diperiksa ({belumDiperiksaStudents.length})
            </button>
            <div className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Data_Belum_Diperiksa.xlsx
            </div>
          </div>
        </div>

        {/* 4. Siswa Menunggu Verifikasi */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                Antrean Koreksi
              </span>
              <h3 className="text-lg font-bold text-slate-800">Menunggu Verifikasi</h3>
              <p className="text-xs text-slate-500 mt-1">
                {menungguVerifikasiStudents.length} siswa yang telah mengajukan perubahan data dan menunggu persetujuan admin sekolah.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => exportStudentsToExcel(menungguVerifikasiStudents, 'Data_Menunggu_Verifikasi.xlsx')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Menunggu Verifikasi ({menungguVerifikasiStudents.length})
            </button>
            <div className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Data_Menunggu_Verifikasi.xlsx
            </div>
          </div>
        </div>

        {/* 5. Siswa Sudah Diperiksa / Terverifikasi */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Data Valid
              </span>
              <h3 className="text-lg font-bold text-slate-800">Siswa Sudah Diperiksa</h3>
              <p className="text-xs text-slate-500 mt-1">
                {sudahDiperiksaStudents.length} siswa yang telah melakukan konfirmasi & validasi data secara lengkap.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => exportStudentsToExcel(sudahDiperiksaStudents, 'Data_Sudah_Diperiksa.xlsx')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Sudah Diperiksa ({sudahDiperiksaStudents.length})
            </button>
            <div className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Data_Sudah_Diperiksa.xlsx
            </div>
          </div>
        </div>

        {/* 6. Siswa Perlu Perbaikan */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                Perlu Tindak Lanjut
              </span>
              <h3 className="text-lg font-bold text-slate-800">Perlu Perbaikan</h3>
              <p className="text-xs text-slate-500 mt-1">
                {perluPerbaikanStudents.length} siswa dengan catatan ketidaksesuaian dokumen yang diminta revisi ulang.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => exportStudentsToExcel(perluPerbaikanStudents, 'Data_Perlu_Perbaikan.xlsx')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Perlu Perbaikan ({perluPerbaikanStudents.length})
            </button>
            <div className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Data_Perlu_Perbaikan.xlsx
            </div>
          </div>
        </div>

        {/* 7. Data Rombel Kelas */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                Struktur Sekolah
              </span>
              <h3 className="text-lg font-bold text-slate-800">Data Rombel Kelas</h3>
              <p className="text-xs text-slate-500 mt-1">
                Daftar {classes.length} rombel kelas, nama wali kelas, ruangan, dan rekapitulasi jumlah siswa.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => exportClassesToExcel(classes, 'Data_Kelas_SMPN_3_Kertek.xlsx')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Data Kelas (.xlsx)
            </button>
            <div className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Data_Kelas_SMPN_3_Kertek.xlsx
            </div>
          </div>
        </div>

        {/* 8. Rekapitulasi Lapor Spentiker */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wider">
                Layanan Publik
              </span>
              <h3 className="text-lg font-bold text-slate-800">Rekap Lapor Spentiker</h3>
              <p className="text-xs text-slate-500 mt-1">
                Rekap seluruh {reports.length} aduan PIP, Sarpras, Sekolah, nomor tiket, detail aduan, dan masukan sekolah.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => exportReportsToExcel(reports, 'Rekap_Aduan_Lapor_Spentiker_SMPN_3_Kertek.xlsx')}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Rekap Aduan (.xlsx)
            </button>
            <div className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Rekap_Aduan_Lapor_Spentiker_SMPN_3_Kertek.xlsx
            </div>
          </div>
        </div>

        {/* 9. Template Kosong Excel */}
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <FileDown className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Template Standar
              </span>
              <h3 className="text-lg font-bold text-slate-800">Template Impor Data Siswa</h3>
              <p className="text-xs text-slate-500 mt-1">
                Template Excel standar dengan baris contoh dan petunjuk format teks NIK/NISN pada sheet kedua.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={downloadStudentTemplateExcel}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              Download Template Excel (.xlsx)
            </button>
            <div className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Template_Data_Siswa_SMP_Negeri_3_Kertek.xlsx
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
