import React, { useState } from 'react';
import {
  Plus,
  Search,
  Download,
  Upload,
  ClipboardPaste,
  Trash2,
  Edit3,
  Users,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  FileDown,
  X,
  Loader2,
} from 'lucide-react';
import { ClassItem } from '../../types';
import { api } from '../../services/api';
import {
  downloadClassTemplateExcel,
  exportClassesToExcel,
  parseExcelFile,
  parsePastedTable,
} from '../../utils/excelUtils';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';

interface DataKelasViewProps {
  classes: ClassItem[];
  onRefreshClasses: () => Promise<void>;
}

export const DataKelasView: React.FC<DataKelasViewProps> = ({ classes, onRefreshClasses }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);

  // Modals for import & paste
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelPreviewRows, setExcelPreviewRows] = useState<any[]>([]);

  // Form inputs
  const [formClassName, setFormClassName] = useState('');
  const [formWaliKelas, setFormWaliKelas] = useState('');
  const [formRuang, setFormRuang] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter classes by search
  const filteredClasses = classes.filter((c) =>
    c.namaKelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.waliKelas && c.waliKelas.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Open add modal
  const handleOpenAdd = () => {
    setFormClassName('');
    setFormWaliKelas('');
    setFormRuang('');
    setFeedback(null);
    setShowAddModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (c: ClassItem) => {
    setEditingClass(c);
    setFormClassName(c.namaKelas);
    setFormWaliKelas(c.waliKelas || '');
    setFormRuang(c.ruang || '');
    setFeedback(null);
  };

  // Save add / edit class
  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClassName.trim()) return;

    try {
      setIsSubmitting(true);
      setFeedback(null);

      if (editingClass) {
        await api.updateClass(editingClass.id, {
          namaKelas: formClassName,
          waliKelas: formWaliKelas,
          ruang: formRuang,
        });
        setFeedback({ type: 'success', message: `Kelas ${formClassName} berhasil diperbarui.` });
        setEditingClass(null);
      } else {
        await api.addClass({
          namaKelas: formClassName,
          waliKelas: formWaliKelas,
          ruang: formRuang,
        });
        setFeedback({ type: 'success', message: `Kelas ${formClassName} berhasil ditambahkan.` });
        setShowAddModal(false);
      }

      await onRefreshClasses();
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan kelas.' });
    }
  };

  // DELETE CLASS - FIXED AND FULLY WORKING
  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    try {
      await api.deleteClass(classToDelete.id);
      setFeedback({
        type: 'success',
        message: `Kelas "${classToDelete.namaKelas}" berhasil dihapus dari sistem.`,
      });
      setClassToDelete(null);
      await onRefreshClasses();
    } catch (err: any) {
      throw new Error(err.message || 'Gagal menghapus kelas');
    }
  };

  // Handle Copy-Paste bulk input
  const handleProcessPasted = async () => {
    if (!pastedText.trim()) return;
    try {
      setIsSubmitting(true);
      const parsed = parsePastedTable(pastedText);
      if (parsed.rows.length === 0) {
        throw new Error('Format tabel yang ditempel tidak valid atau kosong.');
      }

      const res = await api.bulkAddClasses(parsed.rows);
      setFeedback({
        type: 'success',
        message: `Berhasil menambahkan ${res.addedCount} kelas baru (${res.skippedCount} dilewati karena sudah ada).`,
      });
      setShowPasteModal(false);
      setPastedText('');
      await onRefreshClasses();
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Gagal memproses data paste.' });
    }
  };

  // Handle Excel upload for classes
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const parsed = parseExcelFile(buffer);
        setExcelPreviewRows(parsed.rows);
        setShowExcelModal(true);
      } catch (err) {
        setFeedback({ type: 'error', message: 'Gagal membaca file Excel.' });
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // reset
  };

  const handleConfirmExcelImport = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.bulkAddClasses(excelPreviewRows);
      setFeedback({
        type: 'success',
        message: `Impor Excel selesai: ${res.addedCount} kelas baru berhasil ditambahkan (${res.skippedCount} dilewati).`,
      });
      setShowExcelModal(false);
      setExcelPreviewRows([]);
      await onRefreshClasses();
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Gagal mengimpor dari Excel.' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Data Kelas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola rombongan belajar, wali kelas, dan import massal data kelas SMPN 3 Kertek
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadClassTemplateExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Download Template Excel Kelas"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            Template Excel
          </button>

          <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-blue-600" />
            Impor Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="hidden" />
          </label>

          <button
            onClick={() => setShowPasteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Input Massal Copy-Paste dari Excel"
          >
            <ClipboardPaste className="w-4 h-4 text-indigo-600" />
            Paste Excel
          </button>

          <button
            onClick={() => exportClassesToExcel(classes)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Download Semua Kelas ke Excel"
          >
            <Download className="w-4 h-4 text-blue-600" />
            Download Data
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Kelas
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs md:text-sm flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Statistics Card */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kelas atau wali kelas..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="text-xs text-slate-500">
          Menampilkan <strong className="text-slate-800">{filteredClasses.length}</strong> dari {classes.length} total rombel kelas
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Kelas</th>
                <th className="py-3 px-4">Wali Kelas</th>
                <th className="py-3 px-4">Ruang</th>
                <th className="py-3 px-4 text-center">Jumlah Siswa</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada kelas yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls, idx) => (
                  <tr key={cls.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      {cls.namaKelas}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{cls.waliKelas || '-'}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{cls.ruang || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Users className="w-3 h-3" />
                        {cls.jumlahSiswa || 0} Siswa
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cls)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Kelas"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setClassToDelete(cls)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Kelas"
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

      {/* Add / Edit Class Modal */}
      {(showAddModal || editingClass) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingClass ? 'Edit Nama Kelas' : 'Tambah Rombel Kelas Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingClass(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: VII A, VIII C, IX D"
                  value={formClassName}
                  onChange={(e) => setFormClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Wali Kelas (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Siti Aminah, S.Pd."
                  value={formWaliKelas}
                  onChange={(e) => setFormWaliKelas(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ruang Kelas (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: R. 101"
                  value={formRuang}
                  onChange={(e) => setFormRuang(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingClass(null);
                  }}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Copy-Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Input Massal Kelas (Copy-Paste)</h3>
                <p className="text-xs text-slate-500">
                  Salin tabel dari Excel/Spreadsheet lalu tempelkan ke dalam kotak di bawah ini.
                </p>
              </div>
              <button onClick={() => setShowPasteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Tempelkan Teks Tabel Excel:
              </label>
              <textarea
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="No&#9;Nama Kelas&#10;1&#9;VII A&#10;2&#9;VII B&#10;3&#9;VIII A"
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-500">
                *Baris pertama harus berisi judul kolom (misal: No, Nama Kelas, Wali Kelas).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessPasted}
                disabled={isSubmitting || !pastedText.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Proses & Simpan Kelas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Preview Import Modal */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Pratinjau Impor Excel Kelas</h3>
                <p className="text-xs text-slate-500">
                  Ditemukan {excelPreviewRows.length} baris data kelas dalam file Excel Anda.
                </p>
              </div>
              <button onClick={() => setShowExcelModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <tr>
                    <th className="p-2">No</th>
                    <th className="p-2">Nama Kelas</th>
                    <th className="p-2">Wali Kelas</th>
                    <th className="p-2">Ruang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {excelPreviewRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 font-mono">{r.No || r.no || i + 1}</td>
                      <td className="p-2 font-bold text-blue-700">{r['Nama Kelas'] || r.namaKelas || r.Nama || '-'}</td>
                      <td className="p-2">{r['Wali Kelas'] || r.waliKelas || '-'}</td>
                      <td className="p-2">{r.Ruang || r.ruang || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExcelModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmExcelImport}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Mengimpor...' : 'Konfirmasi & Tambahkan Semua'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED DELETE MODAL FOR CLASS */}
      <ConfirmDeleteModal
        isOpen={!!classToDelete}
        title="Hapus Rombel Kelas"
        itemName={classToDelete ? `Kelas ${classToDelete.namaKelas}` : ''}
        itemType="Kelas"
        additionalWarning={
          classToDelete && (classToDelete.jumlahSiswa || 0) > 0
            ? `Kelas ini saat ini memiliki ${classToDelete.jumlahSiswa} siswa terdaftar. Menghapus kelas tidak otomatis menghapus siswa, namun siswa akan kehilangan keterikatan kelas.`
            : undefined
        }
        onClose={() => setClassToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
