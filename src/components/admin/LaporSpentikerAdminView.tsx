import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Download,
  Trash2,
  Reply,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  X,
  PieChart,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { ReportItem, ComplaintCategory } from '../../types';
import { api } from '../../services/api';
import { exportReportsToExcel } from '../../utils/excelUtils';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';

interface LaporSpentikerAdminViewProps {
  reports: ReportItem[];
  onRefreshReports: () => Promise<void>;
}

export const LaporSpentikerAdminView: React.FC<LaporSpentikerAdminViewProps> = ({
  reports,
  onRefreshReports,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Respond Modal
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [respondStatus, setRespondStatus] = useState<ReportItem['status']>('Sedang Ditindaklanjuti');
  const [adminResponseText, setAdminResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // DELETE REPORT - FIXED AND TESTED
  const [reportToDelete, setReportToDelete] = useState<ReportItem | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (categoryFilter !== 'ALL' && r.jenisAduan !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        r.namaPelapor.toLowerCase().includes(q) ||
        r.nomorTiket.toLowerCase().includes(q) ||
        r.judulAduan.toLowerCase().includes(q) ||
        r.detailAduan.toLowerCase().includes(q) ||
        r.masukanSekolah.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate statistics for diagrams
  const categories: ComplaintCategory[] = ['PIP', 'SARPRAS', 'SEKOLAH', 'KURIKULUM', 'KEDISIPLINAN', 'LAINNYA'];
  const categoryCounts = categories.map((cat) => ({
    cat,
    count: reports.filter((r) => r.jenisAduan === cat).length,
    pct: reports.length > 0 ? Math.round((reports.filter((r) => r.jenisAduan === cat).length / reports.length) * 100) : 0,
  }));

  const maxCatCount = Math.max(...categoryCounts.map((c) => c.count), 1);

  const statusCounts = {
    menunggu: reports.filter((r) => r.status === 'Menunggu Tanggapan').length,
    proses: reports.filter((r) => r.status === 'Sedang Ditindaklanjuti').length,
    selesai: reports.filter((r) => r.status === 'Selesai').length,
  };

  const handleOpenRespond = (report: ReportItem) => {
    setSelectedReport(report);
    setRespondStatus(report.status);
    setAdminResponseText(report.tanggapanAdmin || '');
    setFeedback(null);
  };

  const handleSaveResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      setIsSubmitting(true);
      await api.updateReport(selectedReport.id, {
        status: respondStatus,
        tanggapanAdmin: adminResponseText,
      });
      setFeedback({
        type: 'success',
        message: `Tanggapan untuk tiket "${selectedReport.nomorTiket}" berhasil disimpan.`,
      });
      setSelectedReport(null);
      await onRefreshReports();
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan tanggapan' });
    }
  };

  // DELETE REPORT - FIXED AND TESTED
  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    try {
      await api.deleteReport(reportToDelete.id);
      setFeedback({
        type: 'success',
        message: `Aduan tiket "${reportToDelete.nomorTiket}" berhasil dihapus.`,
      });
      setReportToDelete(null);
      await onRefreshReports();
    } catch (err: any) {
      throw new Error(err.message || 'Gagal menghapus aduan');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Rekapitulasi Lapor Spentiker</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola pengaduan, keluhan PIP/Sarpras, dan masukan kemajuan sekolah dari warga SMPN 3 Kertek
          </p>
        </div>

        <button
          onClick={() => exportReportsToExcel(reports)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          Ekspor Rekap Excel
        </button>
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

      {/* DIAGRAM & STATISTIK VISUAL ADUAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card Overview */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              Status Penyelesaian Aduan
            </h3>
            <span className="text-xs font-bold text-slate-500">Total: {reports.length}</span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Menunggu Tanggapan</span>
                <span className="font-bold text-amber-600">{statusCounts.menunggu} aduan</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${reports.length > 0 ? (statusCounts.menunggu / reports.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Sedang Ditindaklanjuti</span>
                <span className="font-bold text-blue-600">{statusCounts.proses} aduan</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${reports.length > 0 ? (statusCounts.proses / reports.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Selesai Ditangani</span>
                <span className="font-bold text-emerald-600">{statusCounts.selesai} aduan</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${reports.length > 0 ? (statusCounts.selesai / reports.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Diagram (Interactive Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-sky-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Diagram Distribusi Jenis Aduan (Lapor Spentiker)
            </h3>
            <span className="text-xs text-slate-400">Kategori Terbanyak</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {categoryCounts.map((item) => {
              const barWidth = Math.max(8, Math.round((item.count / maxCatCount) * 100));
              return (
                <div key={item.cat} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 w-28">{item.cat}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {item.count} laporan ({item.pct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.cat === 'PIP'
                          ? 'bg-amber-500'
                          : item.cat === 'SARPRAS'
                          ? 'bg-blue-600'
                          : item.cat === 'SEKOLAH'
                          ? 'bg-sky-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor tiket, nama, judul aduan..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Jenis Aduan</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="Menunggu Tanggapan">Menunggu Tanggapan</option>
            <option value="Sedang Ditindaklanjuti">Sedang Ditindaklanjuti</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3">Tiket</th>
                <th className="py-3 px-3">Jenis</th>
                <th className="py-3 px-4">Pelapor</th>
                <th className="py-3 px-4">Judul & Detail Aduan</th>
                <th className="py-3 px-4">Masukan Sekolah</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Belum ada aduan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-700 text-[11px]">
                      {r.nomorTiket}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(r.tanggal).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.jenisAduan === 'PIP'
                            ? 'bg-amber-100 text-amber-800'
                            : r.jenisAduan === 'SARPRAS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {r.jenisAduan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-bold">{r.namaPelapor}</div>
                      <div className="text-[10px] text-slate-400">
                        {r.statusPelapor} {r.kontak ? `&bull; ${r.kontak}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-800">{r.judulAduan}</div>
                      <p className="text-slate-600 line-clamp-2 mt-0.5">{r.detailAduan}</p>
                      {r.tanggapanAdmin && (
                        <div className="mt-1 text-[11px] text-blue-700 bg-blue-50 p-1.5 rounded-lg border border-blue-100">
                          <strong>Tanggapan:</strong> {r.tanggapanAdmin}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-600 italic">
                      {r.masukanSekolah ? `"${r.masukanSekolah}"` : '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : r.status === 'Sedang Ditindaklanjuti'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenRespond(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                          title="Tanggapi Aduan"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          Tanggapi
                        </button>
                        {/* FIXED DELETE BUTTON */}
                        <button
                          onClick={() => setReportToDelete(r)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Aduan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Respond Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">Tanggapi Lapor Spentiker</span>
                <h3 className="text-base font-bold text-slate-800">Tiket: {selectedReport.nomorTiket}</h3>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div>Pelapor: <strong>{selectedReport.namaPelapor}</strong> ({selectedReport.statusPelapor})</div>
              <div>Jenis: <strong>{selectedReport.jenisAduan}</strong></div>
              <div>Judul: <strong>{selectedReport.judulAduan}</strong></div>
              <div className="text-slate-600 pt-1 border-t mt-1">
                <em>{selectedReport.detailAduan}</em>
              </div>
              {selectedReport.masukanSekolah && (
                <div className="text-slate-500 pt-1 text-[11px]">
                  <strong>Masukan:</strong> {selectedReport.masukanSekolah}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveResponse} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Penanganan:</label>
                <select
                  value={respondStatus}
                  onChange={(e) => setRespondStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Menunggu Tanggapan">Menunggu Tanggapan</option>
                  <option value="Sedang Ditindaklanjuti">Sedang Ditindaklanjuti</option>
                  <option value="Selesai">Selesai (Sudah Teratasi)</option>
                  <option value="Diarsipkan">Diarsipkan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggapan Resmi Admin / Sekolah:</label>
                <textarea
                  rows={4}
                  value={adminResponseText}
                  onChange={(e) => setAdminResponseText(e.target.value)}
                  placeholder="Tuliskan respon atau langkah tindak lanjut yang telah dilakukan..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Kirim Tanggapan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FIXED DELETE MODAL FOR REPORT */}
      <ConfirmDeleteModal
        isOpen={!!reportToDelete}
        title="Hapus Laporan Aduan"
        itemName={reportToDelete ? `Tiket ${reportToDelete.nomorTiket} (${reportToDelete.judulAduan})` : ''}
        itemType="Aduan"
        additionalWarning="Data aduan ini akan dihapus secara permanen dari sistem rekapitulasi."
        onClose={() => setReportToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
