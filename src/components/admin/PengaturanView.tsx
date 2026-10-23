import React, { useState } from 'react';
import {
  Settings,
  Upload,
  Image as ImageIcon,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileCode,
  Globe,
  Database,
  RotateCcw,
  Sparkles,
  School,
  X,
} from 'lucide-react';
import { SchoolSettings } from '../../types';
import { SchoolLogo } from '../SchoolLogo';
import { api } from '../../services/api';

interface PengaturanViewProps {
  settings: SchoolSettings;
  onRefreshSettings: () => Promise<void>;
  onResetSampleData: () => Promise<void>;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  settings,
  onRefreshSettings,
  onResetSampleData,
}) => {
  const [activeTab, setActiveTab] = useState<'profil' | 'logo' | 'keamanan' | 'hosting' | 'database'>('profil');

  // Form states
  const [profileForm, setProfileForm] = useState<Partial<SchoolSettings>>({ ...settings });
  const [logoPreview, setLogoPreview] = useState<string>(settings.logoUrl || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isCopiedGas, setIsCopiedGas] = useState(false);

  // Logo file selection with instant Base64 converter
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'File harus berupa gambar (PNG, JPG, SVG, WebP)' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Ukuran file gambar maksimal 2 MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64Data = evt.target?.result as string;
      setLogoPreview(base64Data);
      setFeedback({ type: 'success', message: 'Logo berhasil dimuat. Klik "Simpan Perubahan Logo" untuk memperbarui.' });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = async () => {
    try {
      setIsSubmitting(true);
      await api.updateSettings({ logoUrl: logoPreview });
      await onRefreshSettings();
      setFeedback({ type: 'success', message: 'Logo sekolah berhasil diperbarui di seluruh aplikasi!' });
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan logo' });
    }
  };

  const handleResetToDefaultLogo = async () => {
    try {
      setIsSubmitting(true);
      setLogoPreview('');
      await api.updateSettings({ logoUrl: '' });
      await onRefreshSettings();
      setFeedback({ type: 'success', message: 'Logo dikembalikan ke lambang resmi default SMP Negeri 3 Kertek.' });
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Gagal mereset logo' });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.updateSettings(profileForm);
      await onRefreshSettings();
      setFeedback({ type: 'success', message: 'Profil dan identitas sekolah berhasil disimpan.' });
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan pengaturan' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Konfirmasi password baru tidak cocok!' });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.changePassword(oldPassword, newPassword);
      setFeedback({ type: 'success', message: res.message });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSubmitting(false);
    } catch (err: any) {
      setIsSubmitting(false);
      setFeedback({ type: 'error', message: err.message || 'Gagal mengubah password' });
    }
  };

  const gasScriptCode = `/**
 * GOOGLE APPS SCRIPT BACKEND FOR SMP NEGERI 3 KERTEK
 * Web App & Google Sheet Integration
 * ==============================================================
 * Petunjuk Instalasi:
 * 1. Buat Google Sheet baru bernama "DATABASE BANK DATA SMPN 3 KERTEK".
 * 2. Buat 4 sheet: "Siswa", "Kelas", "Aduan", "Pengaturan".
 * 3. Buka Extensions > Apps Script.
 * 4. Paste seluruh kode ini ke dalam Code.gs.
 * 5. Isi SPREADSHEET_ID dengan ID spreadsheet Google Anda.
 * 6. Klik Deploy > New Deployment > Web App (Who has access: Anyone).
 */

var SPREADSHEET_ID = "MASUKKAN_SPREADSHEET_ID_ANDA_DISINI";

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'stats';
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  if (action === 'students') {
    var sheet = ss.getSheetByName('Siswa');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var students = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var item = {};
      for (var j = 0; j < headers.length; j++) {
        item[headers[j]] = row[j];
      }
      students.push(item);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, students: students }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "API Bank Data Siswa SMPN 3 Kertek Aktif" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (action === 'lapor_spentiker') {
      var sheetAduan = ss.getSheetByName('Aduan');
      sheetAduan.appendRow([
        new Date(),
        payload.nomorTiket,
        payload.namaPelapor,
        payload.statusPelapor,
        payload.kontak,
        payload.jenisAduan,
        payload.judulAduan,
        payload.detailAduan,
        payload.masukanSekolah,
        "Menunggu Tanggapan"
      ]);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Aduan tersimpan di Google Sheets!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Aksi tidak dikenal" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyGas = () => {
    navigator.clipboard.writeText(gasScriptCode);
    setIsCopiedGas(true);
    setTimeout(() => setIsCopiedGas(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pengaturan & Konfigurasi Sistem</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola profil sekolah, upload logo resmi, ganti password admin, dan integrasi Google Apps Script
          </p>
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
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'profil', label: 'Profil & Identitas Sekolah', icon: School },
          { id: 'logo', label: 'Upload & Ganti Logo', icon: ImageIcon },
          { id: 'keamanan', label: 'Keamanan & Password', icon: Lock },
          { id: 'hosting', label: 'Panduan Google Apps Script & Hosting', icon: Globe },
          { id: 'database', label: 'Cadangan & Reset Database', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setFeedback(null);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFIL SEKOLAH */}
      {activeTab === 'profil' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-base font-bold text-slate-800">Identitas Resmi Sekolah</h3>
            <p className="text-xs text-slate-500">
              Data ini tampil pada kop surat, laporan excel, dan beranda aplikasi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Sekolah</label>
              <input
                type="text"
                value={profileForm.namaSekolah || ''}
                onChange={(e) => setProfileForm({ ...profileForm, namaSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Subjudul / Slogan</label>
              <input
                type="text"
                value={profileForm.subjudul || ''}
                onChange={(e) => setProfileForm({ ...profileForm, subjudul: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NPSN</label>
              <input
                type="text"
                value={profileForm.npsn || ''}
                onChange={(e) => setProfileForm({ ...profileForm, npsn: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tahun Ajaran & Semester</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="2026/2027"
                  value={profileForm.tahunAjaran || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, tahunAjaran: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Ganjil"
                  value={profileForm.semester || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={profileForm.alamatSekolah || ''}
                onChange={(e) => setProfileForm({ ...profileForm, alamatSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kepala Sekolah</label>
              <input
                type="text"
                value={profileForm.kepalaSekolah || ''}
                onChange={(e) => setProfileForm({ ...profileForm, kepalaSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={profileForm.nipKepalaSekolah || ''}
                onChange={(e) => setProfileForm({ ...profileForm, nipKepalaSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Telepon Sekolah</label>
              <input
                type="text"
                value={profileForm.telepon || ''}
                onChange={(e) => setProfileForm({ ...profileForm, telepon: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Sekolah</label>
              <input
                type="email"
                value={profileForm.email || ''}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Pesan Pengumuman Beranda</label>
              <textarea
                rows={3}
                value={profileForm.pesanPengumuman || ''}
                onChange={(e) => setProfileForm({ ...profileForm, pesanPengumuman: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                placeholder="Pesan penting yang ditampilkan di bagian atas beranda..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: UPLOAD & GANTI LOGO */}
      {activeTab === 'logo' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-base font-bold text-slate-800">Upload & Ubah Logo Sekolah</h3>
            <p className="text-xs text-slate-500">
              Ubah logo SMP Negeri 3 Kertek yang tampil pada SplashScreen, Header, dan kop laporan
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 py-4">
            {/* Live Preview */}
            <div className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500">Pratinjau Logo Saat Ini:</span>
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                <SchoolLogo customLogoUrl={logoPreview} size="xl" />
              </div>
              <span className="text-[11px] text-slate-400">
                {logoPreview ? 'Menggunakan Logo Kustom Upload' : 'Menggunakan Lambang Resmi Default'}
              </span>
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-4">
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 space-y-2">
                <h4 className="text-xs font-bold text-sky-950">Petunjuk Upload Logo:</h4>
                <ul className="text-xs text-slate-600 list-disc pl-4 space-y-1">
                  <li>Format file yang didukung: PNG, JPG, JPEG, SVG, WebP.</li>
                  <li>Disarankan berlatar belakang transparan (PNG/SVG) dengan rasio 1:1.</li>
                  <li>Ukuran maksimal: 2 MB.</li>
                  <li>Logo disimpan langsung di database dan segera aktif seketika.</li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-blue-500/20 transition-all">
                  <Upload className="w-4 h-4" />
                  Pilih File Gambar Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleResetToDefaultLogo}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset ke Lambang Default
                  </button>
                )}
              </div>

              {logoPreview !== (settings.logoUrl || '') && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveLogo}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20"
                  >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Logo'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KEAMANAN & PASSWORD */}
      {activeTab === 'keamanan' && (
        <form onSubmit={handleChangePassword} className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm max-w-xl space-y-5">
          <div className="border-b pb-4">
            <h3 className="text-base font-bold text-slate-800">Ganti Password Administrator</h3>
            <p className="text-xs text-slate-500">
              Perbarui password akun admin untuk menjaga kerahasiaan database siswa
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Password Saat Ini</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password saat ini (default: admin123)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password Baru</label>
              <input
                type="password"
                required
                minLength={5}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 5 karakter"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Konfirmasi Password Baru</label>
              <input
                type="password"
                required
                minLength={5}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Memproses...' : 'Simpan Password Baru'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: PANDUAN GOOGLE APPS SCRIPT & HOSTING ONLINE */}
      {activeTab === 'hosting' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-base font-bold text-slate-800">
              Panduan Hosting Google Apps Script & Publikasi Online
            </h3>
            <p className="text-xs text-slate-500">
              Petunjuk langkah demi langkah menjalankan aplikasi ini secara online menggunakan Google Apps Script atau Cloud Hosting.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs leading-relaxed">
            {/* Step by Step */}
            <div className="space-y-4 bg-sky-50/60 p-5 rounded-2xl border border-sky-100">
              <h4 className="font-bold text-sky-950 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Cara Menghubungkan ke Google Apps Script:
              </h4>

              <ol className="list-decimal pl-4 space-y-2 text-slate-700">
                <li>
                  Buka akun Google Drive sekolah, buat <strong>Google Sheets baru</strong> berjudul: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">DATABASE BANK DATA SMPN 3 KERTEK</code>.
                </li>
                <li>
                  Buat 4 sheet: <strong>Siswa</strong>, <strong>Kelas</strong>, <strong>Aduan</strong>, dan <strong>Pengaturan</strong>.
                </li>
                <li>
                  Buka menu <strong>Extensions &gt; Apps Script</strong>.
                </li>
                <li>
                  Salin script di samping ini dan tempelkan ke dalam file <code className="bg-white px-1.5 py-0.5 rounded border font-mono">Code.gs</code>.
                </li>
                <li>
                  Ganti <code className="bg-white px-1.5 py-0.5 rounded border font-mono">SPREADSHEET_ID</code> dengan ID spreadsheet Google Anda (tertera di URL Google Sheet).
                </li>
                <li>
                  Klik tombol <strong>Deploy &gt; New deployment</strong>, pilih jenis <strong>Web app</strong>, atur <em>Who has access</em> ke <strong>Anyone</strong>, lalu klik Deploy.
                </li>
                <li>
                  Salin Web App URL yang dihasilkan. Sekarang data otomatis tersimpan di Google Sheet Anda!
                </li>
              </ol>

              <div className="p-3 bg-white rounded-xl border border-sky-200 text-sky-900 text-[11px]">
                <strong>Keuntungan Google Apps Script:</strong> 100% Gratis, terintegrasi langsung dengan Google Drive dan Google Sheets sekolah tanpa biaya server bulanan.
              </div>
            </div>

            {/* Code Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  Kode Siap Pakai: Code.gs
                </span>
                <button
                  onClick={handleCopyGas}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-[11px]"
                >
                  {isCopiedGas ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopiedGas ? 'Tersalin!' : 'Salin Kode'}
                </button>
              </div>

              <pre className="h-96 p-4 bg-slate-900 text-sky-200 font-mono text-[11px] rounded-2xl overflow-y-auto leading-relaxed border border-slate-800">
                {gasScriptCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CADANGAN & RESET DATABASE */}
      {activeTab === 'database' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-base font-bold text-slate-800">Manajemen Database & Pemulihan</h3>
            <p className="text-xs text-slate-500">
              Download salinan lengkap database atau reset ke data contoh resmi SMP Negeri 3 Kertek
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                Reset ke Data Contoh Resmi
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Kembalikan database ke data contoh default yang mencakup 12 rombel kelas (VII A - IX D), data siswa dengan contoh perbaikan, dan laporan aduan Lapor Spentiker.
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Apakah Anda yakin ingin mereset seluruh database ke data contoh resmi?')) {
                    await onResetSampleData();
                    setFeedback({ type: 'success', message: 'Database berhasil direset ke data contoh resmi.' });
                  }
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Reset Database Contoh
              </button>
            </div>

            <div className="p-5 bg-sky-50 rounded-2xl border border-sky-100 space-y-3 text-xs">
              <h4 className="font-bold text-sky-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Status Penyimpanan Server
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Aplikasi ini dilengkapi dengan database server persisten (<code className="font-mono bg-white px-1.5 py-0.5 rounded border">data/db.json</code>). Setiap perubahan data siswa, rombel, aduan, dan logo langsung tersimpan dan dapat diakses multi-user.
              </p>
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Penyimpanan Database Aktif & Siap Digunakan
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
