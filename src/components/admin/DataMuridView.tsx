import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  ClipboardPaste,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileDown,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building,
  User,
  HeartHandshake,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { Student, ClassItem } from '../../types';
import { api } from '../../services/api';
import {
  exportStudentsToExcel,
  downloadStudentTemplateExcel,
  parseExcelFile,
  parsePastedTable,
  mapHeaderToField,
  STUDENT_COLUMNS,
} from '../../utils/excelUtils';
import { ConfirmDeleteModal } from '../ConfirmDeleteModal';

interface DataMuridViewProps {
  students: Student[];
  classes: ClassItem[];
  onRefreshStudents: () => Promise<void>;
}

export const DataMuridView: React.FC<DataMuridViewProps> = ({
  students,
  classes,
  onRefreshStudents,
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'no' | 'nama' | 'kelas'>('no');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Selected for Bulk Deletion
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Single deletion modal state - FIXED AND TESTED
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Add / Edit Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  // Import Excel & Paste Modal states
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [excelImportRows, setExcelImportRows] = useState<any[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedText, setPastedText] = useState('');

  // Form State
  const [studentForm, setStudentForm] = useState<Partial<Student>>({
    nama: '',
    nipd: '',
    jk: 'L',
    nisn: '',
    tempatLahir: '',
    tanggalLahir: '',
    nik: '',
    agama: 'Islam',
    alamat: '',
    rt: '',
    rw: '',
    dusun: '',
    kelurahan: '',
    kecamatan: 'Kertek',
    kelas: classes[0]?.namaKelas || 'VII A',
    namaAyah: '',
    tahunLahirAyah: '',
    jenjangPendidikanAyah: '',
    pekerjaanAyah: '',
    penghasilanAyah: '',
    nikAyah: '',
    namaIbu: '',
    tahunLahirIbu: '',
    jenjangPendidikanIbu: '',
    pekerjaanIbu: '',
    penghasilanIbu: '',
    nikIbu: '',
    menerimaPip: 'Belum Diketahui',
    statusPengecekan: 'Belum Diperiksa',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter students
  const filteredStudents = students
    .filter((s) => {
      if (selectedClassFilter !== 'ALL' && s.kelas.trim().toLowerCase() !== selectedClassFilter.trim().toLowerCase()) {
        return false;
      }
      if (selectedStatusFilter !== 'ALL' && s.statusPengecekan !== selectedStatusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          s.nama.toLowerCase().includes(q) ||
          s.nisn.includes(q) ||
          s.nipd.includes(q) ||
          s.nik.includes(q) ||
          s.kelas.toLowerCase().includes(q) ||
          s.alamat.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortField === 'nama') {
        const diff = a.nama.localeCompare(b.nama);
        return sortOrder === 'desc' ? -diff : diff;
      }
      if (sortField === 'kelas') {
        const diff = a.kelas.localeCompare(b.kelas);
        return sortOrder === 'desc' ? -diff : diff;
      }
      return sortOrder === 'desc' ? b.no - a.no : a.no - b.no;
    });

  // Paginated students
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle selection
  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudentIds(paginatedStudents.map((s) => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // OPEN ADD STUDENT
  const handleOpenAdd = () => {
    setStudentForm({
      nama: '',
      nipd: '',
      jk: 'L',
      nisn: '',
      tempatLahir: '',
      tanggalLahir: '',
      nik: '',
      agama: 'Islam',
      alamat: '',
      rt: '',
      rw: '',
      dusun: '',
      kelurahan: '',
      kecamatan: 'Kertek',
      kelas: classes[0]?.namaKelas || 'VII A',
      namaAyah: '',
      tahunLahirAyah: '',
      jenjangPendidikanAyah: '',
      pekerjaanAyah: '',
      penghasilanAyah: '',
      nikAyah: '',
      namaIbu: '',
      tahunLahirIbu: '',
      jenjangPendidikanIbu: '',
      pekerjaanIbu: '',
      penghasilanIbu: '',
      nikIbu: '',
      menerimaPip: 'Belum Diketahui',
      statusPengecekan: 'Belum Diperiksa',
    });
    setEditingStudent(null);
    setFeedback(null);
    setShowAddModal(true);
  };

  // OPEN EDIT STUDENT
  const handleOpenEdit = (s: Student) => {
    setStudentForm({ ...s });
    setEditingStudent(s);
    setFeedback(null);
    setShowAddModal(true);
  };

  // SAVE STUDENT (ADD OR EDIT)
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.nama?.trim()) return;

    try {
      setIsSubmitting(true);
      setFeedback(null);

      if (editingStudent) {
        await api.updateStudent(editingStudent.id, studentForm);
        setFeedback({
          type: 'success',
          message: `Data siswa "${studentForm.nama}" berhasil diperbarui.`,
        });
      } else {
        await api.addStudent(studentForm);
        setFeedback({
          type: 'success',
          message: `Siswa "${studentForm.nama}" berhasil ditambahkan ke database.`,
        });
      }

      setShowAddModal(false);
      setEditingStudent(null);
      await onRefreshStudents();
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan data siswa.' });
    }
  };

  // SINGLE DELETE - FIXED AND TESTED
  const handleConfirmSingleDelete = async () => {
    if (!studentToDelete) return;
    try {
      await api.deleteStudent(studentToDelete.id);
      setFeedback({
        type: 'success',
        message: `Siswa "${studentToDelete.nama}" (${studentToDelete.kelas}) berhasil dihapus.`,
      });
      setStudentToDelete(null);
      await onRefreshStudents();
    } catch (err: any) {
      throw new Error(err.message || 'Gagal menghapus siswa');
    }
  };

  // BULK DELETE - FIXED AND TESTED
  const handleConfirmBulkDelete = async () => {
    if (selectedStudentIds.length === 0) return;
    try {
      const res = await api.bulkDeleteStudents(selectedStudentIds);
      setFeedback({
        type: 'success',
        message: `${res.deletedCount} siswa berhasil dihapus dari database.`,
      });
      setSelectedStudentIds([]);
      setIsBulkDeleteModalOpen(false);
      await onRefreshStudents();
    } catch (err: any) {
      throw new Error(err.message || 'Gagal menghapus siswa massal');
    }
  };

  // EXCEL IMPORT HANDLER
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const parsed = parseExcelFile(buffer);
        if (parsed.rows.length === 0) {
          setFeedback({ type: 'error', message: 'File Excel kosong atau tidak terbaca.' });
          return;
        }
        setExcelHeaders(parsed.headers);
        setExcelImportRows(parsed.rows);
        setShowExcelImportModal(true);
      } catch (err) {
        setFeedback({ type: 'error', message: 'Gagal membaca file Excel.' });
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleProcessExcelImport = async () => {
    try {
      setIsSubmitting(true);
      // Map columns
      const mappedItems = excelImportRows.map((row) => {
        const item: any = {};
        Object.keys(row).forEach((header) => {
          const field = mapHeaderToField(header);
          if (field) {
            item[field] = row[header];
          }
        });
        return item;
      });

      const res = await api.bulkAddStudents(mappedItems, true);
      setFeedback({
        type: 'success',
        message: `Impor Excel berhasil: ${res.addedCount} siswa baru ditambahkan, ${res.updatedCount} siswa diperbarui, ${res.skippedCount} dilewati. Total siswa: ${res.totalStudents}`,
      });
      setShowExcelImportModal(false);
      setExcelImportRows([]);
      await onRefreshStudents();
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Gagal mengimpor data siswa.' });
    }
  };

  // PASTE IMPORT HANDLER
  const handleProcessPasteImport = async () => {
    if (!pastedText.trim()) return;
    try {
      setIsSubmitting(true);
      const parsed = parsePastedTable(pastedText);
      if (parsed.rows.length === 0) {
        throw new Error('Tabel yang ditempel tidak memiliki baris data.');
      }

      const mappedItems = parsed.rows.map((row) => {
        const item: any = {};
        Object.keys(row).forEach((header) => {
          const field = mapHeaderToField(header);
          if (field) {
            item[field] = row[header];
          }
        });
        return item;
      });

      const res = await api.bulkAddStudents(mappedItems, true);
      setFeedback({
        type: 'success',
        message: `Input massal berhasil: ${res.addedCount} siswa baru, ${res.updatedCount} diperbarui, ${res.skippedCount} dilewati.`,
      });
      setShowPasteModal(false);
      setPastedText('');
      await onRefreshStudents();
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Gagal memproses data paste.' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-sky-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Database Siswa SMPN 3 Kertek</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data pokok siswa, NISN, NIK, identitas orang tua, dan program bantuan PIP
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadStudentTemplateExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Download Template Excel Lengkap"
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
          >
            <ClipboardPaste className="w-4 h-4 text-indigo-600" />
            Paste Excel
          </button>

          <button
            onClick={() => exportStudentsToExcel(filteredStudents, 'Data_Siswa_SMPN_3_Kertek.xlsx')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            Ekspor Excel
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari Nama, NISN, NIK, NIPD..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Filter Kelas */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Kelas:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => {
                setSelectedClassFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Kelas ({students.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.namaKelas}>
                  {cls.namaKelas}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="Belum Diperiksa">Belum Diperiksa</option>
              <option value="Sudah Diperiksa Siswa">Sudah Diperiksa Siswa</option>
              <option value="Menunggu Verifikasi Admin">Menunggu Verifikasi</option>
              <option value="Terverifikasi Admin">Terverifikasi Admin</option>
              <option value="Perlu Perbaikan">Perlu Perbaikan</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Button if selected */}
        {selectedStudentIds.length > 0 && (
          <button
            onClick={() => setIsBulkDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 transition-all self-start md:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus ({selectedStudentIds.length}) Siswa Terpilih
          </button>
        )}
      </div>

      {/* Main Student Database Table */}
      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedStudents.length > 0 &&
                      paginatedStudents.every((s) => selectedStudentIds.includes(s.id))
                    }
                    onChange={handleToggleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-3">JK</th>
                <th className="py-3 px-3">Kelas</th>
                <th className="py-3 px-4">NISN / NIPD</th>
                <th className="py-3 px-4">NIK</th>
                <th className="py-3 px-4">Nama Orang Tua</th>
                <th className="py-3 px-3 text-center">PIP</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data siswa sesuai filter atau pencarian.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s, idx) => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-sky-50/40 transition-colors ${
                        isChecked ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectOne(s.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span>{s.nama}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {s.alamat ? `${s.alamat}, ${s.kelurahan}` : '-'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            s.jk === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {s.jk}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-xs">
                          {s.kelas}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        <div>NISN: {s.nisn || '-'}</div>
                        <div className="text-[10px] text-slate-400">NIPD: {s.nipd || '-'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {s.nik || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>A: {s.namaAyah || '-'}</div>
                        <div className="text-[10px] text-slate-400">I: {s.namaIbu || '-'}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.menerimaPip === 'Ya'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : s.menerimaPip === 'Tidak'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-slate-50 text-slate-400'
                          }`}
                        >
                          {s.menerimaPip}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setDetailStudent(s)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Data Siswa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {/* CRITICAL WORKING DELETE BUTTON */}
                          <button
                            onClick={() => setStudentToDelete(s)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Siswa dari Database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredStudents.length)} dari{' '}
            <strong>{filteredStudents.length}</strong> total data siswa
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-700 bg-white border border-slate-200 rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {editingStudent ? `Edit Data Siswa: ${editingStudent.nama}` : 'Tambah Siswa Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Isi seluruh kolom identitas, orang tua, dan bantuan PIP sesuai data resmi
                </p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-6 text-xs">
              {/* Bagian 1: Identitas */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-blue-700 flex items-center gap-2 border-b pb-1">
                  <User className="w-4 h-4" />
                  Identitas Siswa
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Lengkap Siswa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={studentForm.nama || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, nama: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kelas <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={studentForm.kelas || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, kelas: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      required
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.namaKelas}>
                          {cls.namaKelas}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIPD</label>
                    <input
                      type="text"
                      value={studentForm.nipd || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, nipd: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NISN (10 Digit)</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={studentForm.nisn || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      value={studentForm.jk || 'L'}
                      onChange={(e) => setStudentForm({ ...studentForm, jk: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIK Siswa (16 Digit)</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={studentForm.nik || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, nik: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={studentForm.tempatLahir || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, tempatLahir: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={studentForm.tanggalLahir || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, tanggalLahir: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Agama</label>
                    <select
                      value={studentForm.agama || 'Islam'}
                      onChange={(e) => setStudentForm({ ...studentForm, agama: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                    <input
                      type="text"
                      value={studentForm.alamat || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, alamat: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">RT</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={studentForm.rt || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, rt: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">RW</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={studentForm.rw || ''}
                          onChange={(e) => setStudentForm({ ...studentForm, rw: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dusun</label>
                    <input
                      type="text"
                      value={studentForm.dusun || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, dusun: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kelurahan / Desa</label>
                    <input
                      type="text"
                      value={studentForm.kelurahan || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, kelurahan: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kecamatan</label>
                    <input
                      type="text"
                      value={studentForm.kecamatan || 'Kertek'}
                      onChange={(e) => setStudentForm({ ...studentForm, kecamatan: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Data Ayah & Ibu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t">
                {/* Data Ayah */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-indigo-700 flex items-center gap-2 border-b pb-1">
                    <Building className="w-4 h-4" />
                    Data Ayah
                  </h4>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Ayah</label>
                    <input
                      type="text"
                      value={studentForm.namaAyah || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, namaAyah: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tahun Lahir Ayah</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={studentForm.tahunLahirAyah || ''}
                        onChange={(e) => setStudentForm({ ...studentForm, tahunLahirAyah: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pekerjaan Ayah</label>
                      <input
                        type="text"
                        value={studentForm.pekerjaanAyah || ''}
                        onChange={(e) => setStudentForm({ ...studentForm, pekerjaanAyah: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Penghasilan Ayah</label>
                    <input
                      type="text"
                      value={studentForm.penghasilanAyah || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, penghasilanAyah: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIK Ayah</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={studentForm.nikAyah || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, nikAyah: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Data Ibu */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-rose-700 flex items-center gap-2 border-b pb-1">
                    <HeartHandshake className="w-4 h-4" />
                    Data Ibu
                  </h4>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Ibu</label>
                    <input
                      type="text"
                      value={studentForm.namaIbu || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, namaIbu: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tahun Lahir Ibu</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={studentForm.tahunLahirIbu || ''}
                        onChange={(e) => setStudentForm({ ...studentForm, tahunLahirIbu: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pekerjaan Ibu</label>
                      <input
                        type="text"
                        value={studentForm.pekerjaanIbu || ''}
                        onChange={(e) => setStudentForm({ ...studentForm, pekerjaanIbu: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Penghasilan Ibu</label>
                    <input
                      type="text"
                      value={studentForm.penghasilanIbu || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, penghasilanIbu: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIK Ibu</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={studentForm.nikIbu || ''}
                      onChange={(e) => setStudentForm({ ...studentForm, nikIbu: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: PIP & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Menerima PIP</label>
                  <select
                    value={studentForm.menerimaPip || 'Belum Diketahui'}
                    onChange={(e) => setStudentForm({ ...studentForm, menerimaPip: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Ya">Ya (Penerima PIP)</option>
                    <option value="Tidak">Tidak</option>
                    <option value="Belum Diketahui">Belum Diketahui</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Pengecekan</label>
                  <select
                    value={studentForm.statusPengecekan || 'Belum Diperiksa'}
                    onChange={(e) => setStudentForm({ ...studentForm, statusPengecekan: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Belum Diperiksa">Belum Diperiksa</option>
                    <option value="Sudah Diperiksa Siswa">Sudah Diperiksa Siswa</option>
                    <option value="Menunggu Verifikasi Admin">Menunggu Verifikasi Admin</option>
                    <option value="Terverifikasi Admin">Terverifikasi Admin</option>
                    <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Siswa Modal */}
      {detailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Detail Profil Siswa
                </span>
                <h3 className="text-lg font-bold text-slate-800">{detailStudent.nama}</h3>
              </div>
              <button onClick={() => setDetailStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400">Kelas:</span>
                  <p className="font-bold text-slate-800">{detailStudent.kelas}</p>
                </div>
                <div>
                  <span className="text-slate-400">NISN:</span>
                  <p className="font-mono font-bold text-slate-800">{detailStudent.nisn || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400">NIPD:</span>
                  <p className="font-mono text-slate-800">{detailStudent.nipd || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400">NIK:</span>
                  <p className="font-mono text-slate-800">{detailStudent.nik || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400">TTL:</span>
                  <p className="text-slate-800">
                    {detailStudent.tempatLahir || '-'}, {detailStudent.tanggalLahir || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Agama:</span>
                  <p className="text-slate-800">{detailStudent.agama || '-'}</p>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-400">Alamat Lengkap:</span>
                  <p className="text-slate-800">
                    {detailStudent.alamat} RT {detailStudent.rt} RW {detailStudent.rw}, Dusun{' '}
                    {detailStudent.dusun}, Kel. {detailStudent.kelurahan}, Kec.{' '}
                    {detailStudent.kecamatan}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
                  <span className="font-bold text-slate-700">Data Ayah:</span>
                  <p>Nama: <strong>{detailStudent.namaAyah || '-'}</strong></p>
                  <p>Pendidikan: {detailStudent.jenjangPendidikanAyah || '-'}</p>
                  <p>Pekerjaan: {detailStudent.pekerjaanAyah || '-'}</p>
                  <p>Penghasilan: {detailStudent.penghasilanAyah || '-'}</p>
                  <p className="font-mono text-[11px]">NIK: {detailStudent.nikAyah || '-'}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
                  <span className="font-bold text-slate-700">Data Ibu:</span>
                  <p>Nama: <strong>{detailStudent.namaIbu || '-'}</strong></p>
                  <p>Pendidikan: {detailStudent.jenjangPendidikanIbu || '-'}</p>
                  <p>Pekerjaan: {detailStudent.pekerjaanIbu || '-'}</p>
                  <p>Penghasilan: {detailStudent.penghasilanIbu || '-'}</p>
                  <p className="font-mono text-[11px]">NIK: {detailStudent.nikIbu || '-'}</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl flex items-center justify-between">
                <span>Penerima PIP: <strong>{detailStudent.menerimaPip}</strong></span>
                <span>Status: <strong>{detailStudent.statusPengecekan}</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Preview Modal */}
      {showExcelImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Pratinjau Impor Excel Siswa</h3>
                <p className="text-xs text-slate-500">
                  Ditemukan {excelImportRows.length} baris data siswa. Sistem mencocokkan kolom berdasarkan nama header.
                </p>
              </div>
              <button onClick={() => setShowExcelImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 sticky top-0">
                  <tr>
                    <th className="p-2">No</th>
                    <th className="p-2">Nama</th>
                    <th className="p-2">Kelas</th>
                    <th className="p-2">NISN</th>
                    <th className="p-2">NIK</th>
                    <th className="p-2">Ayah</th>
                    <th className="p-2">Ibu</th>
                    <th className="p-2">PIP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {excelImportRows.slice(0, 15).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 font-mono">{i + 1}</td>
                      <td className="p-2 font-bold text-blue-700">{r.Nama || r.nama || r['Nama Siswa'] || '-'}</td>
                      <td className="p-2">{r.Kelas || r.kelas || '-'}</td>
                      <td className="p-2 font-mono">{r.NISN || r.nisn || '-'}</td>
                      <td className="p-2 font-mono">{r.NIK || r.nik || '-'}</td>
                      <td className="p-2">{r['Nama Ayah'] || r.namaAyah || '-'}</td>
                      <td className="p-2">{r['Nama Ibu'] || r.namaIbu || '-'}</td>
                      <td className="p-2">{r['Menerima PIP'] || r.menerimaPip || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-500">
              *Jika NISN/NIK sudah ada di sistem, data siswa akan diperbarui secara otomatis.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExcelImportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessExcelImport}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Mengimpor...' : 'Konfirmasi & Simpan ke Database'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Input Massal Siswa (Copy-Paste)</h3>
                <p className="text-xs text-slate-500">
                  Salin baris dari Microsoft Excel lalu tempelkan ke area teks berikut.
                </p>
              </div>
              <button onClick={() => setShowPasteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="No&#9;Nama&#9;Kelas&#9;NISN&#9;NIK&#9;Nama Ayah&#9;Nama Ibu&#9;Menerima PIP&#10;1&#9;Ahmad&#9;VII A&#9;0123456789&#9;330705...&#9;Slamet&#9;Siti&#9;Ya"
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

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
                onClick={handleProcessPasteImport}
                disabled={isSubmitting || !pastedText.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Proses & Simpan Siswa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED DELETE MODAL FOR SINGLE STUDENT */}
      <ConfirmDeleteModal
        isOpen={!!studentToDelete}
        title="Hapus Data Siswa"
        itemName={studentToDelete ? `${studentToDelete.nama} (${studentToDelete.kelas} - NISN: ${studentToDelete.nisn || '-'})` : ''}
        itemType="Siswa"
        additionalWarning="Data siswa yang dihapus akan dihilangkan dari database dan tidak dapat dipulihkan kembali."
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleConfirmSingleDelete}
      />

      {/* FIXED DELETE MODAL FOR BULK STUDENTS */}
      <ConfirmDeleteModal
        isOpen={isBulkDeleteModalOpen}
        title="Hapus Siswa Massal"
        itemName={`${selectedStudentIds.length} data siswa yang telah dicentang`}
        itemType="Data Massal"
        additionalWarning="Tindakan ini akan menghapus seluruh siswa yang dipilih sekaligus dari database."
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
      />
    </div>
  );
};
