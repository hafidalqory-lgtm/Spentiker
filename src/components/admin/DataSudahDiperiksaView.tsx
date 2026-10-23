import React, { useState } from 'react';
import { CheckCircle2, Search, Filter, Download, ShieldCheck, Check } from 'lucide-react';
import { Student, ClassItem } from '../../types';
import { exportStudentsToExcel } from '../../utils/excelUtils';

interface DataSudahDiperiksaViewProps {
  students: Student[];
  classes: ClassItem[];
}

export const DataSudahDiperiksaView: React.FC<DataSudahDiperiksaViewProps> = ({
  students,
  classes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [statusSubTab, setStatusSubTab] = useState<'ALL' | 'Sudah Diperiksa Siswa' | 'Terverifikasi Admin'>('ALL');

  // Filter students who have checked their data
  const sudahDiperiksaList = students
    .filter(
      (s) =>
        s.statusPengecekan === 'Sudah Diperiksa Siswa' ||
        s.statusPengecekan === 'Terverifikasi Admin'
    )
    .filter((s) => {
      if (statusSubTab !== 'ALL' && s.statusPengecekan !== statusSubTab) return false;
      if (selectedClass !== 'ALL' && s.kelas.trim().toLowerCase() !== selectedClass.trim().toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          s.nama.toLowerCase().includes(q) ||
          s.nisn.includes(q) ||
          s.nipd.includes(q) ||
          s.kelas.toLowerCase().includes(q)
        );
      }
      return true;
    });

  const countSudahSiswa = students.filter((s) => s.statusPengecekan === 'Sudah Diperiksa Siswa').length;
  const countTerverifikasi = students.filter((s) => s.statusPengecekan === 'Terverifikasi Admin').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800">Data Siswa Sudah Diperiksa</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar siswa yang telah menyelesaikan proses pemeriksaan dan validasi data pribadi
          </p>
        </div>

        <button
          onClick={() =>
            exportStudentsToExcel(
              sudahDiperiksaList,
              selectedClass !== 'ALL'
                ? `Data_Sudah_Diperiksa_Kelas_${selectedClass.replace(/\s+/g, '_')}.xlsx`
                : 'Data_Sudah_Diperiksa_SMPN_3_Kertek.xlsx'
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Ekspor Excel Siswa Sudah Diperiksa ({sudahDiperiksaList.length})
        </button>
      </div>

      {/* Sub Tabs: Pisahkan status sudah diperiksa siswa dan yang sudah diverifikasi admin */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusSubTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            statusSubTab === 'ALL'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Semua Sudah Diperiksa ({countSudahSiswa + countTerverifikasi})
        </button>

        <button
          onClick={() => setStatusSubTab('Sudah Diperiksa Siswa')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            statusSubTab === 'Sudah Diperiksa Siswa'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Check className="w-3.5 h-3.5 text-sky-400" />
          Sudah Diperiksa Siswa ({countSudahSiswa})
        </button>

        <button
          onClick={() => setStatusSubTab('Terverifikasi Admin')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            statusSubTab === 'Terverifikasi Admin'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Terverifikasi Admin ({countTerverifikasi})
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama siswa atau NISN..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <span className="text-slate-500">Filter Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.namaKelas}>
                {cls.namaKelas}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-4">NIPD / NISN</th>
                <th className="py-3 px-4">Waktu Pengecekan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Catatan Validasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sudahDiperiksaList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada siswa yang sesuai dengan filter ini.
                  </td>
                </tr>
              ) : (
                sudahDiperiksaList.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 text-sm">{s.nama}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{s.kelas}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {s.nisn || '-'} <span className="text-slate-400">({s.nipd || '-'})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {s.tanggalPeriksa ? new Date(s.tanggalPeriksa).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          s.statusPengecekan === 'Terverifikasi Admin'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-sky-100 text-sky-800 border border-sky-300'
                        }`}
                      >
                        {s.statusPengecekan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {s.catatanAdmin || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
