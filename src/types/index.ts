/**
 * Types definition for Bank Data Siswa SMP Negeri 3 Kertek
 */

export interface Student {
  id: string;
  no: number;
  nama: string;
  nipd: string;
  jk: 'L' | 'P';
  nisn: string;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  nik: string;
  agama: string;
  alamat: string;
  rt: string;
  rw: string;
  dusun: string;
  kelurahan: string;
  kecamatan: string;
  kelas: string;
  
  // Data Ayah
  namaAyah: string;
  tahunLahirAyah: string;
  jenjangPendidikanAyah: string;
  pekerjaanAyah: string;
  penghasilanAyah: string;
  nikAyah: string;
  
  // Data Ibu
  namaIbu: string;
  tahunLahirIbu: string;
  jenjangPendidikanIbu: string;
  pekerjaanIbu: string;
  penghasilanIbu: string;
  nikIbu: string;
  
  // Bantuan PIP
  menerimaPip: 'Ya' | 'Tidak' | 'Belum Diketahui';
  
  // Status Validasi
  statusPengecekan: 'Belum Diperiksa' | 'Sudah Diperiksa Siswa' | 'Menunggu Verifikasi Admin' | 'Terverifikasi Admin' | 'Perlu Perbaikan';
  catatanAdmin?: string;
  tanggalPeriksa?: string;
  tanggalVerifikasi?: string;
  updatedAt: string;
  
  // Riwayat perubahan untuk audit & perbandingan diff
  originalData?: Partial<Student>;
  pendingChanges?: Partial<Student>;
}

export interface ClassItem {
  id: string;
  no: number;
  namaKelas: string;
  waliKelas?: string;
  ruang?: string;
  jumlahSiswa?: number;
  createdAt: string;
}

export type ComplaintCategory = 'PIP' | 'SARPRAS' | 'SEKOLAH' | 'KURIKULUM' | 'KEDISIPLINAN' | 'LAINNYA';

export interface ReportItem {
  id: string;
  nomorTiket: string;
  tanggal: string;
  namaPelapor: string;
  statusPelapor: 'Siswa' | 'Orang Tua' | 'Alumni' | 'Masyarakat' | 'Anonim';
  kontak: string;
  kelasSiswa?: string;
  jenisAduan: ComplaintCategory;
  judulAduan: string;
  detailAduan: string;
  masukanSekolah: string;
  status: 'Menunggu Tanggapan' | 'Sedang Ditindaklanjuti' | 'Selesai' | 'Diarsipkan';
  tanggapanAdmin?: string;
  tanggalTanggapan?: string;
  createdAt: string;
}

export interface SchoolSettings {
  namaSekolah: string;
  subjudul: string;
  npsn: string;
  alamatSekolah: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  logoUrl: string; // Base64 data URL or external URL
  pesanPengumuman: string;
  tahunAjaran: string;
  semester: string;
  adminPasswordHash?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  aktor: string;
  aksi: string;
  target: string;
  detail: string;
}

export interface DashboardStats {
  totalSiswa: number;
  totalKelas: number;
  belumDiperiksa: number;
  sudahDiperiksaSiswa: number;
  menungguVerifikasi: number;
  terverifikasiAdmin: number;
  perluPerbaikan: number;
  penerimaPip: number;
  totalAduan: number;
  aduanPending: number;
  aduanSelesai: number;
}
