import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquare, AlertCircle, HelpCircle, Shield, FileText } from 'lucide-react';
import { api } from '../services/api';
import { ComplaintCategory, ReportItem } from '../types';

interface LaporSpentikerSectionProps {
  onSuccessSubmitted?: (report: ReportItem) => void;
}

export const LaporSpentikerSection: React.FC<LaporSpentikerSectionProps> = ({ onSuccessSubmitted }) => {
  const [formData, setFormData] = useState({
    namaPelapor: '',
    statusPelapor: 'Siswa' as 'Siswa' | 'Orang Tua' | 'Alumni' | 'Masyarakat' | 'Anonim',
    kontak: '',
    kelasSiswa: '',
    jenisAduan: 'PIP' as ComplaintCategory,
    judulAduan: '',
    detailAduan: '',
    masukanSekolah: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<ReportItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.detailAduan.trim()) {
      setErrorMessage('Kolom Detail Aduan wajib diisi dengan jelas.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.submitReport({
        namaPelapor: formData.statusPelapor === 'Anonim' ? 'Anonim' : formData.namaPelapor,
        statusPelapor: formData.statusPelapor,
        kontak: formData.kontak,
        kelasSiswa: formData.kelasSiswa,
        jenisAduan: formData.jenisAduan,
        judulAduan: formData.judulAduan || `Aduan ${formData.jenisAduan}`,
        detailAduan: formData.detailAduan,
        masukanSekolah: formData.masukanSekolah,
      });

      setSubmittedReport(res.report);
      setIsSubmitting(false);
      if (onSuccessSubmitted) {
        onSuccessSubmitted(res.report);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Gagal mengirim aduan. Silakan periksa koneksi Anda.');
    }
  };

  const handleReset = () => {
    setSubmittedReport(null);
    setFormData({
      namaPelapor: '',
      statusPelapor: 'Siswa',
      kontak: '',
      kelasSiswa: '',
      jenisAduan: 'PIP',
      judulAduan: '',
      detailAduan: '',
      masukanSekolah: '',
    });
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-sky-100 overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-800 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sky-100 text-xs font-semibold backdrop-blur-md mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Layanan Aspirasi & Pengaduan Resmi
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              LAPOR SPENTIKER
            </h2>
            <p className="text-sky-100 text-sm mt-1 max-w-xl">
              Sampaikan keluhan, kendala, atau aspirasi terkait Bantuan PIP, Sarana Prasarana, dan Layanan SMP Negeri 3 Kertek secara transparan dan terpercaya.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 self-start md:self-auto">
            <Shield className="w-8 h-8 text-sky-300 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-white">Aman & Terjamin</p>
              <p className="text-sky-200">Data Anda ditindaklanjuti kepala sekolah & tim</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {submittedReport ? (
          <div className="py-8 px-4 text-center max-w-lg mx-auto animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Aduan Anda Berhasil Terkirim!</h3>
            <p className="text-slate-600 text-sm mt-2">
              Terima kasih telah berpartisipasi dalam peningkatan kualitas SMP Negeri 3 Kertek.
            </p>

            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2">
              <div className="flex justify-between items-center text-xs border-b pb-2 border-slate-200">
                <span className="text-slate-500">Nomor Tiket Aduan:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {submittedReport.nomorTiket}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-b pb-2 border-slate-200">
                <span className="text-slate-500">Jenis Aduan:</span>
                <span className="font-semibold text-slate-700">{submittedReport.jenisAduan}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Status Tindak Lanjut:</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium">
                  {submittedReport.status}
                </span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              Kirim Aduan Lainnya
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 1: Identitas Pelapor */}
            <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100/80">
              <h4 className="text-sm font-bold text-sky-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs">1</span>
                Identitas Pelapor
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Kategori Pelapor
                  </label>
                  <select
                    value={formData.statusPelapor}
                    onChange={(e) => setFormData({ ...formData, statusPelapor: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Siswa">Siswa SMPN 3 Kertek</option>
                    <option value="Orang Tua">Orang Tua / Wali Siswa</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Masyarakat">Masyarakat Umum</option>
                    <option value="Anonim">Anonim (Rahasia)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nama Pelapor {formData.statusPelapor === 'Anonim' ? '(Dirahasiakan)' : ''}
                  </label>
                  <input
                    type="text"
                    disabled={formData.statusPelapor === 'Anonim'}
                    value={formData.statusPelapor === 'Anonim' ? 'Anonim' : formData.namaPelapor}
                    onChange={(e) => setFormData({ ...formData, namaPelapor: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    No. WhatsApp / HP (Untuk konfirmasi respon)
                  </label>
                  <input
                    type="tel"
                    value={formData.kontak}
                    onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Form Pengaduan */}
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
                Form Pengaduan & Jenis Aduan
              </h4>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jenis Aduan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.jenisAduan}
                      onChange={(e) => setFormData({ ...formData, jenisAduan: e.target.value as ComplaintCategory })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PIP">PIP (Bantuan Program Indonesia Pintar / KIP)</option>
                      <option value="SARPRAS">SARPRAS (Sarana & Prasarana Sekolah, Meja, Toilet, Kelas)</option>
                      <option value="SEKOLAH">SEKOLAH (Layanan Tata Usaha, Guru, Administrasi)</option>
                      <option value="KURIKULUM">KURIKULUM (Pembelajaran, Buku Pelajaran, Nilai)</option>
                      <option value="KEDISIPLINAN">KEDISIPLINAN (Ketertiban, Keamanan, Kebersihan)</option>
                      <option value="LAINNYA">LAINNYA (Aduan / Saran Umum Lainnya)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Judul / Ringkasan Aduan
                    </label>
                    <input
                      type="text"
                      value={formData.judulAduan}
                      onChange={(e) => setFormData({ ...formData, judulAduan: e.target.value })}
                      placeholder="Contoh: Kendala Pencairan Dana PIP Semester Ganjil"
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detail Aduan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.detailAduan}
                    onChange={(e) => setFormData({ ...formData, detailAduan: e.target.value })}
                    placeholder="Jelaskan secara rinci permasalahan, waktu, lokasi, atau pihak terkait yang perlu ditindaklanjuti..."
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tuliskan keluhan dengan bahasa yang sopan dan didukung fakta yang jelas.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Masukan untuk Sekolah */}
            <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100/80">
              <h4 className="text-sm font-bold text-sky-900 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs">3</span>
                Masukan untuk Sekolah
              </h4>
              <p className="text-xs text-slate-600 mb-3">
                Saran atau usulan konstruktif Anda untuk perbaikan fasilitas atau kemajuan SMP Negeri 3 Kertek ke depan.
              </p>
              <textarea
                rows={3}
                value={formData.masukanSekolah}
                onChange={(e) => setFormData({ ...formData, masukanSekolah: e.target.value })}
                placeholder="Contoh: Kami mengusulkan agar diadakan ruang tunggu khusus bagi wali murid saat penjemputan siswa..."
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sky-600" />
                Laporan Anda akan tercatat dalam sistem admin dan dievaluasi berkala.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sedang Mengirim Aduan...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Kirim Aduan & Masukan
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
