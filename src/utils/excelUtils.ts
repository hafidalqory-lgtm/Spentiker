import * as XLSX from 'xlsx';
import { Student, ClassItem, ReportItem } from '../types';

export const STUDENT_COLUMNS = [
  'No',
  'Nama',
  'NIPD',
  'JK',
  'NISN',
  'Tempat Lahir',
  'Tanggal Lahir',
  'NIK',
  'Agama',
  'Alamat',
  'RT',
  'RW',
  'Dusun',
  'Kelurahan',
  'Kecamatan',
  'Kelas',
  'Nama Ayah',
  'Tahun Lahir Ayah',
  'Jenjang Pendidikan Ayah',
  'Pekerjaan Ayah',
  'Penghasilan Ayah',
  'NIK Ayah',
  'Nama Ibu',
  'Tahun Lahir Ibu',
  'Jenjang Pendidikan Ibu',
  'Pekerjaan Ibu',
  'Penghasilan Ibu',
  'NIK Ibu',
  'Menerima PIP',
  'Status Pengecekan',
];

/**
 * Downloads a complete, professional Excel file for students
 */
export function exportStudentsToExcel(students: Student[], filename: string = 'Data_Siswa_SMPN_3_Kertek.xlsx') {
  const rows = students.map((s, idx) => ({
    'No': s.no || idx + 1,
    'Nama': s.nama || '',
    'NIPD': String(s.nipd || ''),
    'JK': s.jk || '',
    'NISN': String(s.nisn || ''),
    'Tempat Lahir': s.tempatLahir || '',
    'Tanggal Lahir': s.tanggalLahir || '',
    'NIK': String(s.nik || ''),
    'Agama': s.agama || '',
    'Alamat': s.alamat || '',
    'RT': String(s.rt || ''),
    'RW': String(s.rw || ''),
    'Dusun': s.dusun || '',
    'Kelurahan': s.kelurahan || '',
    'Kecamatan': s.kecamatan || '',
    'Kelas': s.kelas || '',
    'Nama Ayah': s.namaAyah || '',
    'Tahun Lahir Ayah': String(s.tahunLahirAyah || ''),
    'Jenjang Pendidikan Ayah': s.jenjangPendidikanAyah || '',
    'Pekerjaan Ayah': s.pekerjaanAyah || '',
    'Penghasilan Ayah': s.penghasilanAyah || '',
    'NIK Ayah': String(s.nikAyah || ''),
    'Nama Ibu': s.namaIbu || '',
    'Tahun Lahir Ibu': String(s.tahunLahirIbu || ''),
    'Jenjang Pendidikan Ibu': s.jenjangPendidikanIbu || '',
    'Pekerjaan Ibu': s.pekerjaanIbu || '',
    'Penghasilan Ibu': s.penghasilanIbu || '',
    'NIK Ibu': String(s.nikIbu || ''),
    'Menerima PIP': s.menerimaPip || '',
    'Status Pengecekan': s.statusPengecekan || '',
    'Catatan Admin': s.catatanAdmin || '',
    'Terakhir Diperbarui': s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('id-ID') : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: [...STUDENT_COLUMNS, 'Catatan Admin', 'Terakhir Diperbarui'] });

  // Format columns widths
  const colWidths = [
    { wch: 6 },  // No
    { wch: 28 }, // Nama
    { wch: 12 }, // NIPD
    { wch: 6 },  // JK
    { wch: 14 }, // NISN
    { wch: 18 }, // Tempat Lahir
    { wch: 14 }, // Tanggal Lahir
    { wch: 20 }, // NIK
    { wch: 12 }, // Agama
    { wch: 32 }, // Alamat
    { wch: 6 },  // RT
    { wch: 6 },  // RW
    { wch: 16 }, // Dusun
    { wch: 16 }, // Kelurahan
    { wch: 14 }, // Kecamatan
    { wch: 10 }, // Kelas
    { wch: 24 }, // Nama Ayah
    { wch: 14 }, // Tahun Lahir Ayah
    { wch: 22 }, // Pendidikan Ayah
    { wch: 18 }, // Pekerjaan Ayah
    { wch: 24 }, // Penghasilan Ayah
    { wch: 20 }, // NIK Ayah
    { wch: 24 }, // Nama Ibu
    { wch: 14 }, // Tahun Lahir Ibu
    { wch: 22 }, // Pendidikan Ibu
    { wch: 18 }, // Pekerjaan Ibu
    { wch: 24 }, // Penghasilan Ibu
    { wch: 20 }, // NIK Ibu
    { wch: 16 }, // Menerima PIP
    { wch: 22 }, // Status
    { wch: 30 }, // Catatan Admin
    { wch: 18 }, // Terakhir Diperbarui
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');

  XLSX.writeFile(workbook, filename);
}

/**
 * Downloads the official student template Excel with guidance sheet
 */
export function downloadStudentTemplateExcel() {
  const exampleRow = {
    'No': 1,
    'Nama': 'Contoh Siswa Teladan',
    'NIPD': '2607099',
    'JK': 'L',
    'NISN': '0123456789',
    'Tempat Lahir': 'Wonosobo',
    'Tanggal Lahir': '2013-05-15',
    'NIK': '3307051505130001',
    'Agama': 'Islam',
    'Alamat': 'Dusun Kapencar RT 01 RW 02',
    'RT': '01',
    'RW': '02',
    'Dusun': 'Kapencar',
    'Kelurahan': 'Kapencar',
    'Kecamatan': 'Kertek',
    'Kelas': 'VII A',
    'Nama Ayah': 'Sugiarto',
    'Tahun Lahir Ayah': '1980',
    'Jenjang Pendidikan Ayah': 'SMA / Sederajat',
    'Pekerjaan Ayah': 'Wiraswasta',
    'Penghasilan Ayah': 'Rp 2.000.000 - Rp 3.000.000',
    'NIK Ayah': '3307051206800002',
    'Nama Ibu': 'Sri Wahyuni',
    'Tahun Lahir Ibu': '1983',
    'Jenjang Pendidikan Ibu': 'SMA / Sederajat',
    'Pekerjaan Ibu': 'Ibu Rumah Tangga',
    'Penghasilan Ibu': 'Tidak Berpenghasilan',
    'NIK Ibu': '3307055408830004',
    'Menerima PIP': 'Ya',
  };

  const wsData = XLSX.utils.json_to_sheet([exampleRow], { header: STUDENT_COLUMNS.slice(0, 29) });

  // Column width config
  wsData['!cols'] = [
    { wch: 6 }, { wch: 28 }, { wch: 12 }, { wch: 6 }, { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 20 },
    { wch: 12 }, { wch: 32 }, { wch: 6 }, { wch: 6 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 10 },
    { wch: 24 }, { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 24 }, { wch: 20 },
    { wch: 24 }, { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 24 }, { wch: 20 },
    { wch: 16 }
  ];

  // Sheet 2: Petunjuk Pengisian
  const instructions = [
    { 'Petunjuk Pengisian Data Siswa': '1. Kolom Nama dan Kelas wajib diisi.' },
    { 'Petunjuk Pengisian Data Siswa': '2. Kolom NIK, NISN, NIPD, RT, dan RW diperlakukan sebagai teks (jangan menghilangkan angka nol di depan).' },
    { 'Petunjuk Pengisian Data Siswa': '3. Kolom Tanggal Lahir disarankan berformat YYYY-MM-DD (Contoh: 2013-05-15) atau teks yang jelas.' },
    { 'Petunjuk Pengisian Data Siswa': '4. Kolom JK diisi dengan "L" untuk Laki-laki atau "P" untuk Perempuan.' },
    { 'Petunjuk Pengisian Data Siswa': '5. Kolom Menerima PIP diisi dengan "Ya", "Tidak", atau "Belum Diketahui".' },
    { 'Petunjuk Pengisian Data Siswa': '6. Header baris pertama jangan diubah atau dihapus agar pencocokan kolom otomatis berjalan akurat.' },
    { 'Petunjuk Pengisian Data Siswa': '7. Baris contoh pada sheet pertama dapat dihapus sebelum diunggah.' },
  ];
  const wsGuide = XLSX.utils.json_to_sheet(instructions);
  wsGuide['!cols'] = [{ wch: 90 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsData, 'Template Siswa');
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk Pengisian');

  XLSX.writeFile(wb, 'Template_Data_Siswa_SMP_Negeri_3_Kertek.xlsx');
}

/**
 * Downloads class template Excel
 */
export function downloadClassTemplateExcel() {
  const exampleClasses = [
    { 'No': 1, 'Nama Kelas': 'VII A', 'Wali Kelas': 'Siti Aminah, S.Pd.', 'Ruang': 'R. 101' },
    { 'No': 2, 'Nama Kelas': 'VII B', 'Wali Kelas': 'Ahmad Fauzi, S.Pd.', 'Ruang': 'R. 102' },
    { 'No': 3, 'Nama Kelas': 'VIII A', 'Wali Kelas': 'Nur Hidayah, S.Pd.', 'Ruang': 'R. 201' },
    { 'No': 4, 'Nama Kelas': 'IX A', 'Wali Kelas': 'Endang Purwanti, S.Pd.', 'Ruang': 'R. 301' },
  ];

  const ws = XLSX.utils.json_to_sheet(exampleClasses, { header: ['No', 'Nama Kelas', 'Wali Kelas', 'Ruang'] });
  ws['!cols'] = [{ wch: 6 }, { wch: 18 }, { wch: 28 }, { wch: 14 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Kelas');
  XLSX.writeFile(wb, 'Template_Data_Kelas_SMP_Negeri_3_Kertek.xlsx');
}

/**
 * Exports classes to Excel
 */
export function exportClassesToExcel(classes: ClassItem[], filename: string = 'Data_Kelas_SMPN_3_Kertek.xlsx') {
  const rows = classes.map((c, i) => ({
    'No': c.no || i + 1,
    'Nama Kelas': c.namaKelas,
    'Wali Kelas': c.waliKelas || '',
    'Ruang': c.ruang || '',
    'Jumlah Siswa': c.jumlahSiswa || 0,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 6 }, { wch: 18 }, { wch: 28 }, { wch: 14 }, { wch: 14 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daftar Kelas');
  XLSX.writeFile(wb, filename);
}

/**
 * Exports Lapor Spentiker reports to Excel
 */
export function exportReportsToExcel(reports: ReportItem[], filename: string = 'Rekap_Aduan_Lapor_Spentiker_SMPN_3_Kertek.xlsx') {
  const rows = reports.map((r, i) => ({
    'No': i + 1,
    'Nomor Tiket': r.nomorTiket,
    'Tanggal Lapor': new Date(r.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    'Nama Pelapor': r.namaPelapor,
    'Kategori Pelapor': r.statusPelapor,
    'Kontak / WA': r.kontak,
    'Kelas Siswa': r.kelasSiswa || '-',
    'Jenis Aduan': r.jenisAduan,
    'Judul Aduan': r.judulAduan,
    'Detail Aduan': r.detailAduan,
    'Masukan untuk Sekolah': r.masukanSekolah,
    'Status Tindak Lanjut': r.status,
    'Tanggapan Sekolah / Admin': r.tanggapanAdmin || 'Belum ada tanggapan',
    'Tanggal Tanggapan': r.tanggalTanggapan ? new Date(r.tanggalTanggapan).toLocaleDateString('id-ID') : '-',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 }, { wch: 18 }, { wch: 20 }, { wch: 22 }, { wch: 16 }, { wch: 16 },
    { wch: 12 }, { wch: 14 }, { wch: 26 }, { wch: 45 }, { wch: 40 }, { wch: 20 },
    { wch: 40 }, { wch: 18 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Lapor Spentiker');
  XLSX.writeFile(wb, filename);
}

/**
 * Normalizes header string (removes excess spaces, lowercases, strips special characters)
 */
export function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Fuzzy header matcher to map variations in user uploaded files
 */
export function mapHeaderToField(headerName: string): keyof Student | null {
  const norm = normalizeHeader(headerName);

  if (['nama', 'namasiswa', 'studentname', 'namalengkap'].includes(norm)) return 'nama';
  if (['nipd', 'nomorinduk', 'noinduk'].includes(norm)) return 'nipd';
  if (['jk', 'jeniskelamin', 'sex', 'gender'].includes(norm)) return 'jk';
  if (['nisn', 'nomorinduksiswanasional'].includes(norm)) return 'nisn';
  if (['tempatlahir', 'tempat'].includes(norm)) return 'tempatLahir';
  if (['tanggallahir', 'tgllahir', 'tgllhr', 'dob'].includes(norm)) return 'tanggalLahir';
  if (['nik', 'niksiswa', 'noktp', 'nokk'].includes(norm)) return 'nik';
  if (['agama', 'religion'].includes(norm)) return 'agama';
  if (['alamat', 'alamatlengkap', 'address'].includes(norm)) return 'alamat';
  if (['rt'].includes(norm)) return 'rt';
  if (['rw'].includes(norm)) return 'rw';
  if (['dusun', 'kampung', 'dukuh'].includes(norm)) return 'dusun';
  if (['kelurahan', 'desa'].includes(norm)) return 'kelurahan';
  if (['kecamatan'].includes(norm)) return 'kecamatan';
  if (['kelas', 'rombel', 'ruangkelas'].includes(norm)) return 'kelas';

  // Ayah
  if (['namaayah', 'ayah', 'fathername'].includes(norm)) return 'namaAyah';
  if (['tahunlahirayah', 'tgllahirayah'].includes(norm)) return 'tahunLahirAyah';
  if (['jenjangpendidikanayah', 'pendidikanayah', 'pendayah'].includes(norm)) return 'jenjangPendidikanAyah';
  if (['pekerjaanayah', 'pekayah'].includes(norm)) return 'pekerjaanAyah';
  if (['penghasilanayah', 'gajiayah'].includes(norm)) return 'penghasilanAyah';
  if (['nikayah', 'noktpayah'].includes(norm)) return 'nikAyah';

  // Ibu
  if (['namaibu', 'ibu', 'mothername'].includes(norm)) return 'namaIbu';
  if (['tahunlahiribu', 'tgllahiribu'].includes(norm)) return 'tahunLahirIbu';
  if (['jenjangpendidikanibu', 'pendidikanibu', 'pendibu'].includes(norm)) return 'jenjangPendidikanIbu';
  if (['pekerjaanibu', 'pekibu'].includes(norm)) return 'pekerjaanIbu';
  if (['penghasilanibu', 'gajiibu'].includes(norm)) return 'penghasilanIbu';
  if (['nikibu', 'noktpibu'].includes(norm)) return 'nikIbu';

  // PIP
  if (['menerimapip', 'pip', 'kip', 'penerimapip', 'bantuanpip'].includes(norm)) return 'menerimaPip';

  return null;
}

/**
 * Parse raw excel buffer or binary
 */
export function parseExcelFile(data: ArrayBuffer): { headers: string[]; rows: any[]; raw: any[] } {
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // raw json
  const raw: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
  if (raw.length === 0) {
    return { headers: [], rows: [], raw: [] };
  }

  const headers = Object.keys(raw[0]);
  return { headers, rows: raw, raw };
}

/**
 * Parse copy-paste tab-delimited text from spreadsheet
 */
export function parsePastedTable(text: string): { headers: string[]; rows: any[] } {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { headers: [], rows: [] };
  }

  const headers = lines[0].split('\t').map((h) => h.trim());
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    const obj: any = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] !== undefined ? cols[idx].trim() : '';
    });
    rows.push(obj);
  }

  return { headers, rows };
}
