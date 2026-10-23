import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  GitCompare,
  Check,
  RotateCcw,
  MessageSquare,
  Search,
  Filter,
  X,
  FileCheck2,
} from 'lucide-react';
import { Student } from '../../types';
import { api } from '../../services/api';

interface PengecekanDataViewProps {
  students: Student[];
  onRefreshStudents: () => Promise<void>;
}

export const PengecekanDataView: React.FC<PengecekanDataViewProps> = ({
  students,
  onRefreshStudents,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal Compare State
  const [comparingStudent, setComparingStudent] = useState<Student | null>(null);

  // Admin Verification Note Modal
  const [actionStudent, setActionStudent] = useState<Student | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'request_fix'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredStudents = students.filter((s) => {
    if (statusFilter !== 'ALL' && s.statusPengecekan !== statusFilter) return false;
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

  // Open Verify Modal
  const handleOpenAction = (s: Student, type: 'approve' | 'request_fix') => {
    setActionStudent(s);
    setActionType(type);
    setAdminNotes(
      type === 'approve'
        ? 'Data perbaikan telah diverifikasi sesuai berkas resmi.'
        : 'Mohon perbaiki data NIK / NISN / Nama sesuai Kartu Keluarga.'
    );
  };

  const handleExecuteVerification = async () => {
    if (!actionStudent) return;
    try {
      setIsSubmitting(true);
      setFeedback(null);
      await api.verifyStudentAdmin(actionStudent.id, actionType, adminNotes);
      setFeedback({
        type: 'success',
        message:
          actionType === 'approve'
            ? `Perubahan data siswa "${actionStudent.nama}" telah disetujui!`
            : `Permintaan perbaikan untuk "${actionStudent.nama}" berhasil dikirimkan.`,
      });
      setActionStudent(null);
      setComparingStudent(null);
      await onRefreshStudents();
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Gagal memproses verifikasi.' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pengecekan & Validasi Data Siswa</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tinjau data yang diperiksa siswa, perbandingkan perubahan diff, dan setujui atau minta perbaikan
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-amber-50 text-amber-800 font-bold rounded-xl border border-amber-200">
            {students.filter((s) => s.statusPengecekan === 'Menunggu Verifikasi Admin').length} Menunggu Verifikasi
          </span>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-200">
            {students.filter((s) => s.statusPengecekan === 'Terverifikasi Admin').length} Terverifikasi
          </span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs md:text-sm flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari siswa atau NISN..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <span className="text-slate-500">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status ({students.length})</option>
            <option value="Menunggu Verifikasi Admin">Menunggu Verifikasi Admin</option>
            <option value="Sudah Diperiksa Siswa">Sudah Diperiksa Siswa</option>
            <option value="Terverifikasi Admin">Terverifikasi Admin</option>
            <option value="Perlu Perbaikan">Perlu Perbaikan</option>
            <option value="Belum Diperiksa">Belum Diperiksa</option>
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
                <th className="py-3 px-4 text-center">Status Pengecekan</th>
                <th className="py-3 px-4">Perubahan Diajukan</th>
                <th className="py-3 px-4">Terakhir Diperbarui</th>
                <th className="py-3 px-4 text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada siswa pada kriteria filter ini.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const hasPendingChanges = s.pendingChanges && Object.keys(s.pendingChanges).length > 0;
                  return (
                    <tr key={s.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-800 text-sm">{s.nama}</td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{s.kelas}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {s.nisn || '-'} <span className="text-slate-400">({s.nipd || '-'})</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.statusPengecekan === 'Terverifikasi Admin'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : s.statusPengecekan === 'Sudah Diperiksa Siswa'
                              ? 'bg-sky-100 text-sky-800 border border-sky-300'
                              : s.statusPengecekan === 'Menunggu Verifikasi Admin'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : s.statusPengecekan === 'Perlu Perbaikan'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.statusPengecekan}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {hasPendingChanges ? (
                          <button
                            onClick={() => setComparingStudent(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold border border-amber-200 text-[11px] transition-colors"
                          >
                            <GitCompare className="w-3.5 h-3.5" />
                            {Object.keys(s.pendingChanges!).length} Kolom Berubah (Bandingkan)
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {hasPendingChanges && (
                            <>
                              <button
                                onClick={() => handleOpenAction(s, 'approve')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
                                title="Setujui Perubahan Siswa"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Setujui
                              </button>
                              <button
                                onClick={() => handleOpenAction(s, 'request_fix')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all"
                                title="Minta Perbaikan Ulang"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Minta Perbaikan
                              </button>
                            </>
                          )}
                          {!hasPendingChanges && s.statusPengecekan === 'Sudah Diperiksa Siswa' && (
                            <button
                              onClick={() => handleOpenAction(s, 'approve')}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                            >
                              Verifikasi Admin
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Diff Comparison Modal */}
      {comparingStudent && comparingStudent.pendingChanges && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Bandingkan Perubahan Siswa
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  {comparingStudent.nama} ({comparingStudent.kelas})
                </h3>
              </div>
              <button onClick={() => setComparingStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Berikut adalah rincian kolom data yang diajukan perbaikan oleh siswa:
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {Object.entries(comparingStudent.pendingChanges).map(([fieldKey, newVal]) => {
                const oldVal = (comparingStudent.originalData as any)?.[fieldKey] ?? (comparingStudent as any)[fieldKey];
                return (
                  <div key={fieldKey} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Kolom: {fieldKey}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-red-50 text-red-800 rounded-lg border border-red-200">
                        <span className="text-[10px] text-red-500 block font-semibold">Data Lama:</span>
                        <span className="font-medium">{String(oldVal || '(Kosong)')}</span>
                      </div>
                      <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                        <span className="text-[10px] text-emerald-500 block font-semibold">Data Baru (Diajukan):</span>
                        <span className="font-bold">{String(newVal || '(Dikosongkan)')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setComparingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
              <button
                onClick={() => handleOpenAction(comparingStudent, 'request_fix')}
                className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl"
              >
                Minta Perbaikan
              </button>
              <button
                onClick={() => handleOpenAction(comparingStudent, 'approve')}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20"
              >
                Setujui Perubahan Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action / Note Confirmation Modal */}
      {actionStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-800">
                {actionType === 'approve' ? 'Setujui Perubahan Data' : 'Minta Perbaikan Data'}
              </h3>
              <button onClick={() => setActionStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Siswa: <strong>{actionStudent.nama}</strong> ({actionStudent.kelas})
              </p>
              <label className="block font-bold text-slate-700 pt-2">
                Catatan Admin untuk Siswa:
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Tuliskan catatan verifikasi atau arahan perbaikan..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteVerification}
                disabled={isSubmitting}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md disabled:opacity-50 ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                }`}
              >
                {isSubmitting
                  ? 'Memproses...'
                  : actionType === 'approve'
                  ? 'Konfirmasi Setujui'
                  : 'Kirim Permintaan Perbaikan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
