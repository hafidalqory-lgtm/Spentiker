import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  Save,
  RotateCcw,
  Check,
  User,
  HeartHandshake,
  CreditCard,
  Building,
  Info,
  Calendar,
  Eye,
  FileCheck2,
} from 'lucide-react';
import { Student, ClassItem } from '../types';
import { api } from '../services/api';

interface StudentCheckViewProps {
  student: Student;
  classes: ClassItem[];
  onBack: () => void;
  onStudentUpdated: (updatedStudent: Student) => void;
}

export const StudentCheckView: React.FC<StudentCheckViewProps> = ({
  student,
  classes,
  onBack,
  onStudentUpdated,
}) => {
  // Current working form copy
  const [formData, setFormData] = useState<Student>({ ...student });
  // Initial clean snapshot
  const initialSnapshot = { ...student };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate field differences
  const getChangedFields = () => {
    const changes: Record<string, { label: string; oldVal: string; newVal: string }> = {};

    const fieldLabels: Record<string, string> = {
      nama: 'Nama Lengkap',
      nipd: 'NIPD',
      jk: 'Jenis Kelamin',
      nisn: 'NISN',
      tempatLahir: 'Tempat Lahir',
      tanggalLahir: 'Tanggal Lahir',
      nik: 'NIK Siswa',
      agama: 'Agama',
      alamat: 'Alamat',
      rt: 'RT',
      rw: 'RW',
      dusun: 'Dusun',
      kelurahan: 'Kelurahan / Desa',
      kecamatan: 'Kecamatan',
      kelas: 'Kelas',
      namaAyah: 'Nama Ayah',
      tahunLahirAyah: 'Tahun Lahir Ayah',
      jenjangPendidikanAyah: 'Pendidikan Ayah',
      pekerjaanAyah: 'Pekerjaan Ayah',
      penghasilanAyah: 'Penghasilan Ayah',
      nikAyah: 'NIK Ayah',
      namaIbu: 'Nama Ibu',
      tahunLahirIbu: 'Tahun Lahir Ibu',
      jenjangPendidikanIbu: 'Pendidikan Ibu',
      pekerjaanIbu: 'Pekerjaan Ibu',
      penghasilanIbu: 'Penghasilan Ibu',
      nikIbu: 'NIK Ibu',
      menerimaPip: 'Status Penerimaan PIP',
    };

    Object.keys(fieldLabels).forEach((key) => {
      const oldVal = String((initialSnapshot as any)[key] || '').trim();
      const newVal = String((formData as any)[key] || '').trim();
      if (oldVal !== newVal) {
        changes[key] = {
          label: fieldLabels[key],
          oldVal: oldVal || '(Kosong)',
          newVal: newVal || '(Dikosongkan)',
        };
      }
    });

    return changes;
  };

  const changedFields = getChangedFields();
  const hasChanges = Object.keys(changedFields).length > 0;

  // Handle "DATA SUDAH BENAR"
  const handleConfirmCorrect = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const res = await api.submitStudentCheck(student.id, true);
      setIsSubmitting(false);
      setSuccessMessage('Data Anda berhasil diverifikasi sebagai SUDAH BENAR!');
      onStudentUpdated(res.student);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Gagal menyimpan konfirmasi.');
    }
  };

  // Handle "SIMPAN PERBAIKAN"
  const handleSaveEdits = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Prepare changes payload
      const changesPayload: Partial<Student> = {};
      Object.keys(changedFields).forEach((key) => {
        (changesPayload as any)[key] = (formData as any)[key];
      });

      const res = await api.submitStudentCheck(student.id, false, changesPayload);
      setIsSubmitting(false);
      setShowConfirmModal(false);
      setSuccessMessage('Perubahan data berhasil disimpan dan menunggu verifikasi admin sekolah.');
      onStudentUpdated(res.student);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Gagal menyimpan perubahan. Data Anda tetap tersimpan di formulir ini.');
    }
  };

  const handleResetToInitial = () => {
    setFormData({ ...initialSnapshot });
    setErrorMessage(null);
  };

  // Status badge styling helper
  const renderStatusBadge = () => {
    switch (formData.statusPengecekan) {
      case 'Terverifikasi Admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3.5 h-3.5" />
            Terverifikasi Admin
          </span>
        );
      case 'Sudah Diperiksa Siswa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <Check className="w-3.5 h-3.5" />
            Sudah Diperiksa Siswa
          </span>
        );
      case 'Menunggu Verifikasi Admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Verifikasi Admin
          </span>
        );
      case 'Perlu Perbaikan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Perlu Perbaikan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Info className="w-3.5 h-3.5" />
            Belum Diperiksa
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-900/5 border border-sky-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Halaman Utama
            </button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              PERIKSA DAN VALIDASI DATA DIRI
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              Silakan periksa seluruh data diri dan data orang tua Anda. Jika terdapat kesalahan, silakan lakukan perbaikan pada kolom yang sesuai, kemudian simpan perubahan untuk diperiksa oleh admin sekolah.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="text-xs text-slate-400">Status Saat Ini:</div>
            {renderStatusBadge()}
            <span className="text-xs font-mono text-slate-500">
              Kelas: <strong className="text-blue-700">{formData.kelas}</strong> &bull; NISN: {formData.nisn || '-'}
            </span>
          </div>
        </div>

        {/* Admin Note Notice if Perlu Perbaikan */}
        {formData.catatanAdmin && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs md:text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Catatan dari Admin Sekolah: </span>
              {formData.catatanAdmin}
            </div>
          </div>
        )}

        {/* Success or Error Notifications */}
        {successMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Bagian 1: Identitas Siswa */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-900/5 border border-sky-100 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Bagian 1: Identitas Siswa</h2>
            <p className="text-xs text-slate-500">Data pribadi siswa yang terdaftar di SMP Negeri 3 Kertek</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Lengkap Siswa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kelas Terdaftar <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.kelas}
              onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
              required
            >
              {classes.map((c) => (
                <option key={c.id} value={c.namaKelas}>
                  {c.namaKelas}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              NIPD (Nomor Induk Siswa)
            </label>
            <input
              type="text"
              value={formData.nipd}
              onChange={(e) => setFormData({ ...formData, nipd: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              NISN (10 Digit)
            </label>
            <input
              type="text"
              maxLength={10}
              value={formData.nisn}
              onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Jenis Kelamin (JK)
            </label>
            <select
              value={formData.jk}
              onChange={(e) => setFormData({ ...formData, jk: e.target.value as 'L' | 'P' })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="L">Laki-laki (L)</option>
              <option value="P">Perempuan (P)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              NIK Siswa (16 Digit Sesuai KK)
            </label>
            <input
              type="text"
              maxLength={16}
              value={formData.nik}
              onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tempat Lahir
            </label>
            <input
              type="text"
              value={formData.tempatLahir}
              onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tanggal Lahir
            </label>
            <input
              type="date"
              value={formData.tanggalLahir}
              onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Agama
            </label>
            <select
              value={formData.agama}
              onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="Islam">Islam</option>
              <option value="Kristen">Kristen</option>
              <option value="Katolik">Katolik</option>
              <option value="Hindu">Hindu</option>
              <option value="Buddha">Buddha</option>
              <option value="Konghucu">Konghucu</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Alamat Lengkap / Jalan
            </label>
            <input
              type="text"
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">RT</label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.rt}
                  onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">RW</label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.rw}
                  onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Dusun / Dukuh</label>
            <input
              type="text"
              value={formData.dusun}
              onChange={(e) => setFormData({ ...formData, dusun: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kelurahan / Desa</label>
            <input
              type="text"
              value={formData.kelurahan}
              onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kecamatan</label>
            <input
              type="text"
              value={formData.kecamatan}
              onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bagian 2: Data Ayah */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-900/5 border border-sky-100 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Bagian 2: Data Ayah Kandung</h2>
            <p className="text-xs text-slate-500">Informasi identitas dan pekerjaan ayah kandung siswa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Ayah</label>
            <input
              type="text"
              value={formData.namaAyah}
              onChange={(e) => setFormData({ ...formData, namaAyah: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tahun Lahir Ayah</label>
            <input
              type="text"
              placeholder="Contoh: 1978"
              maxLength={4}
              value={formData.tahunLahirAyah}
              onChange={(e) => setFormData({ ...formData, tahunLahirAyah: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenjang Pendidikan Ayah</label>
            <select
              value={formData.jenjangPendidikanAyah}
              onChange={(e) => setFormData({ ...formData, jenjangPendidikanAyah: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Jenjang --</option>
              <option value="Tidak Sekolah">Tidak Sekolah</option>
              <option value="SD / Sederajat">SD / Sederajat</option>
              <option value="SMP / Sederajat">SMP / Sederajat</option>
              <option value="SMA / Sederajat">SMA / Sederajat</option>
              <option value="D1 / D2 / D3">D1 / D2 / D3</option>
              <option value="D3 / S1">D3 / S1</option>
              <option value="S2 / S3">S2 / S3</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Pekerjaan Ayah</label>
            <input
              type="text"
              placeholder="Petani / Wiraswasta / Buruh"
              value={formData.pekerjaanAyah}
              onChange={(e) => setFormData({ ...formData, pekerjaanAyah: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Penghasilan Ayah</label>
            <select
              value={formData.penghasilanAyah}
              onChange={(e) => setFormData({ ...formData, penghasilanAyah: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Rentang Penghasilan --</option>
              <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
              <option value="Kurang dari Rp 1.000.000">Kurang dari Rp 1.000.000</option>
              <option value="Kurang dari Rp 1.500.000">Kurang dari Rp 1.500.000</option>
              <option value="Rp 1.000.000 - Rp 2.000.000">Rp 1.000.000 - Rp 2.000.000</option>
              <option value="Rp 1.500.000 - Rp 2.500.000">Rp 1.500.000 - Rp 2.500.000</option>
              <option value="Rp 2.000.000 - Rp 3.500.000">Rp 2.000.000 - Rp 3.500.000</option>
              <option value="Rp 3.500.000 - Rp 5.000.000">Rp 3.500.000 - Rp 5.000.000</option>
              <option value="Lebih dari Rp 5.000.000">Lebih dari Rp 5.000.000</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">NIK Ayah (16 Digit)</label>
            <input
              type="text"
              maxLength={16}
              placeholder="3307xxxxxxxxxxxx"
              value={formData.nikAyah}
              onChange={(e) => setFormData({ ...formData, nikAyah: e.target.value })}
              className="w-full max-w-md px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bagian 3: Data Ibu */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-900/5 border border-sky-100 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Bagian 3: Data Ibu Kandung</h2>
            <p className="text-xs text-slate-500">Informasi identitas dan pekerjaan ibu kandung siswa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Ibu</label>
            <input
              type="text"
              value={formData.namaIbu}
              onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tahun Lahir Ibu</label>
            <input
              type="text"
              placeholder="Contoh: 1982"
              maxLength={4}
              value={formData.tahunLahirIbu}
              onChange={(e) => setFormData({ ...formData, tahunLahirIbu: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenjang Pendidikan Ibu</label>
            <select
              value={formData.jenjangPendidikanIbu}
              onChange={(e) => setFormData({ ...formData, jenjangPendidikanIbu: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Jenjang --</option>
              <option value="Tidak Sekolah">Tidak Sekolah</option>
              <option value="SD / Sederajat">SD / Sederajat</option>
              <option value="SMP / Sederajat">SMP / Sederajat</option>
              <option value="SMA / Sederajat">SMA / Sederajat</option>
              <option value="D1 / D2 / D3">D1 / D2 / D3</option>
              <option value="D3 / S1">D3 / S1</option>
              <option value="S2 / S3">S2 / S3</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Pekerjaan Ibu</label>
            <input
              type="text"
              placeholder="Ibu Rumah Tangga / Pedagang / Buruh"
              value={formData.pekerjaanIbu}
              onChange={(e) => setFormData({ ...formData, pekerjaanIbu: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Penghasilan Ibu</label>
            <select
              value={formData.penghasilanIbu}
              onChange={(e) => setFormData({ ...formData, penghasilanIbu: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Rentang Penghasilan --</option>
              <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
              <option value="Kurang dari Rp 1.000.000">Kurang dari Rp 1.000.000</option>
              <option value="Rp 1.000.000 - Rp 2.000.000">Rp 1.000.000 - Rp 2.000.000</option>
              <option value="Rp 2.000.000 - Rp 3.000.000">Rp 2.000.000 - Rp 3.000.000</option>
              <option value="Lebih dari Rp 3.000.000">Lebih dari Rp 3.000.000</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">NIK Ibu (16 Digit)</label>
            <input
              type="text"
              maxLength={16}
              placeholder="3307xxxxxxxxxxxx"
              value={formData.nikIbu}
              onChange={(e) => setFormData({ ...formData, nikIbu: e.target.value })}
              className="w-full max-w-md px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Bagian 4: Program Indonesia Pintar */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-900/5 border border-sky-100 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Bagian 4: Program Indonesia Pintar (PIP)</h2>
            <p className="text-xs text-slate-500">Status penerimaan bantuan beasiswa pendidikan pemerintah</p>
          </div>
        </div>

        <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200/80">
          <label className="block text-sm font-bold text-sky-950 mb-3">
            Apakah Anda saat ini menerima bantuan PIP (Program Indonesia Pintar / KIP)?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { val: 'Ya', label: 'Ya, Menerima PIP', desc: 'Memiliki KIP / Buku SimPel aktif' },
              { val: 'Tidak', label: 'Tidak Menerima', desc: 'Bukan penerima bantuan' },
              { val: 'Belum Diketahui', label: 'Belum Mengetahui', desc: 'Belum pasti / menunggu verifikasi' },
            ].map((opt) => (
              <label
                key={opt.val}
                className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.menerimaPip === opt.val
                    ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-800">{opt.label}</span>
                  <input
                    type="radio"
                    name="pipRadio"
                    checked={formData.menerimaPip === opt.val}
                    onChange={() => setFormData({ ...formData, menerimaPip: opt.val as any })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <span className="text-xs text-slate-500">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Floating / Bottom Bar */}
      <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-600">
          {hasChanges ? (
            <span className="font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 inline-flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Ada {Object.keys(changedFields).length} kolom yang Anda ubah
            </span>
          ) : (
            <span className="text-slate-500">
              Belum ada data yang diubah. Anda dapat langsung mengonfirmasi data jika sudah sesuai.
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          {hasChanges && (
            <button
              type="button"
              onClick={handleResetToInitial}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Kembalikan ke Data Awal
            </button>
          )}

          {!hasChanges && (
            <button
              type="button"
              onClick={handleConfirmCorrect}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              DATA SUDAH BENAR
            </button>
          )}

          {hasChanges && (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              SIMPAN PERBAIKAN
            </button>
          )}
        </div>
      </div>

      {/* Confirmation & Summary Comparison Modal before Saving */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 overflow-hidden space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Ringkasan Perubahan Data</h3>
                <p className="text-xs text-slate-500">
                  Periksa kembali daftar perubahan sebelum dikirim ke admin sekolah:
                </p>
              </div>
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-xl">
                <FileCheck2 className="w-5 h-5" />
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {Object.entries(changedFields).map(([key, item]) => (
                <div key={key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-700">{item.label}</div>
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded line-through">
                      {item.oldVal}
                    </span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      {item.newVal}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500 bg-sky-50 p-3 rounded-xl border border-sky-100">
              Setelah disimpan, status data Anda akan menjadi <strong>Menunggu Verifikasi Admin</strong> hingga disetujui oleh operator sekolah.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal / Edit Lagi
              </button>
              <button
                type="button"
                onClick={handleSaveEdits}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Kirim Perbaikan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
