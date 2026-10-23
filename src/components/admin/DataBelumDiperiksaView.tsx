import React, { useState } from 'react';
import { Clock, Search, Filter, Download, UserCheck, AlertCircle } from 'lucide-react';
import { Student, ClassItem } from '../../types';
import { exportStudentsToExcel } from '../../utils/excelUtils';

interface DataBelumDiperiksaViewProps {
  students: Student[];
  classes: ClassItem[];
}

export const DataBelumDiperiksaView: React.FC<DataBelumDiperiksaViewProps> = ({
  students,
  classes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');

  // Filter students whose status is 'Belum Diperiksa'
  const belumDiperiksaList = students
    .filter((s) => s.statusPengecekan === 'Belum Diperiksa')
    .filter((s) => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800">Data Siswa Belum Diperiksa</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar siswa yang belum login atau belum melakukan validasi data mandiri
          </p>
        </div>

        <button
          onClick={() =>
            exportStudentsToExcel(
              belumDiperiksaList,
              selectedClass !== 'ALL'
                ? `Data_Belum_Diperiksa_Kelas_${selectedClass.replace(/\s+/g, '_')}.xlsx`
                : 'Data_Belum_Diperiksa_SMPN_3_Kertek.xlsx'
            )
          }
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Ekspor Excel Siswa Belum Diperiksa ({belumDiperiksaList.length})
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
                <th className="py-3 px-4">Nama Ayah</th>
                <th className="py-3 px-4">Nama Ibu</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {belumDiperiksaList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Bagus! Tidak ada siswa dengan status Belum Diperiksa pada filter ini.
                  </td>
                </tr>
              ) : (
                belumDiperiksaList.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 text-sm">{s.nama}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{s.kelas}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {s.nisn || '-'} <span className="text-slate-400">({s.nipd || '-'})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{s.namaAyah || '-'}</td>
                    <td className="py-3 px-4 text-slate-600">{s.namaIbu || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Belum Diperiksa
                      </span>
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
