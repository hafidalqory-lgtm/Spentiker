import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_SCHOOL_SETTINGS, INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_REPORTS } from './src/data/initialData';
import { Student, ClassItem, ReportItem, SchoolSettings, AuditLog } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  settings: SchoolSettings;
  classes: ClassItem[];
  students: Student[];
  reports: ReportItem[];
  auditLogs: AuditLog[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        settings: { ...DEFAULT_SCHOOL_SETTINGS, ...(data.settings || {}) },
        classes: Array.isArray(data.classes) ? data.classes : INITIAL_CLASSES,
        students: Array.isArray(data.students) ? data.students : INITIAL_STUDENTS,
        reports: Array.isArray(data.reports) ? data.reports : INITIAL_REPORTS,
        auditLogs: Array.isArray(data.auditLogs) ? data.auditLogs : [],
      };
    }
  } catch (err) {
    console.error('Error loading db.json, initializing defaults:', err);
  }

  const initialDb: DatabaseSchema = {
    settings: { ...DEFAULT_SCHOOL_SETTINGS },
    classes: [...INITIAL_CLASSES],
    students: [...INITIAL_STUDENTS],
    reports: [...INITIAL_REPORTS],
    auditLogs: [
      {
        id: 'log-001',
        timestamp: new Date().toISOString(),
        aktor: 'Sistem',
        aksi: 'Inisialisasi',
        target: 'Database',
        detail: 'Inisialisasi awal database Bank Data Siswa SMP Negeri 3 Kertek',
      },
    ],
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

let db = loadDatabase();

function addAuditLog(aktor: string, aksi: string, target: string, detail: string) {
  const log: AuditLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    timestamp: new Date().toISOString(),
    aktor,
    aksi,
    target,
    detail,
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase(db);
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Increase payload limit for Excel uploads and Base64 school logos
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // --- REST API ENDPOINTS ---

  // 1. Settings
  app.get('/api/settings', (req, res) => {
    const { adminPasswordHash, ...safeSettings } = db.settings;
    res.json(safeSettings);
  });

  app.put('/api/settings', (req, res) => {
    const updates = req.body;
    db.settings = {
      ...db.settings,
      ...updates,
      // preserve password if not explicitly updated
      adminPasswordHash: updates.adminPasswordHash || db.settings.adminPasswordHash || 'admin123',
    };
    saveDatabase(db);
    addAuditLog('Admin', 'Ubah Pengaturan', 'Pengaturan Sekolah', 'Memperbarui profil / pengaturan / logo sekolah');
    const { adminPasswordHash, ...safeSettings } = db.settings;
    res.json({ success: true, settings: safeSettings });
  });

  // 2. Auth
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const currentPassword = db.settings.adminPasswordHash || 'admin123';

    if (username === 'admin' && password === currentPassword) {
      addAuditLog('Admin', 'Login', 'Autentikasi', 'Admin berhasil login ke dashboard');
      return res.json({
        success: true,
        token: 'token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8),
        admin: {
          username: 'admin',
          nama: 'Operator SMP Negeri 3 Kertek',
          role: 'administrator',
        },
      });
    }

    res.status(401).json({
      success: false,
      message: 'Username atau password salah. Silakan periksa kembali!',
    });
  });

  app.post('/api/auth/change-password', (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const currentPassword = db.settings.adminPasswordHash || 'admin123';

    if (oldPassword !== currentPassword) {
      return res.status(400).json({ success: false, message: 'Password lama salah!' });
    }

    if (!newPassword || newPassword.length < 5) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 5 karakter!' });
    }

    db.settings.adminPasswordHash = newPassword;
    saveDatabase(db);
    addAuditLog('Admin', 'Ganti Password', 'Keamanan', 'Password akun admin berhasil diubah');
    res.json({ success: true, message: 'Password admin berhasil diperbarui!' });
  });

  // 3. Classes
  app.get('/api/classes', (req, res) => {
    // calculate student count for each class
    const classesWithCount = db.classes.map((cls, idx) => {
      const count = db.students.filter((s) => s.kelas.trim().toLowerCase() === cls.namaKelas.trim().toLowerCase()).length;
      return {
        ...cls,
        no: idx + 1,
        jumlahSiswa: count,
      };
    });
    res.json(classesWithCount);
  });

  app.post('/api/classes', (req, res) => {
    const { namaKelas, waliKelas, ruang } = req.body;
    if (!namaKelas || !namaKelas.trim()) {
      return res.status(400).json({ success: false, message: 'Nama kelas wajib diisi!' });
    }

    const cleanName = namaKelas.trim();
    const exists = db.classes.some((c) => c.namaKelas.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: `Kelas "${cleanName}" sudah terdaftar!` });
    }

    const newClass: ClassItem = {
      id: 'cls-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      no: db.classes.length + 1,
      namaKelas: cleanName,
      waliKelas: waliKelas?.trim() || '',
      ruang: ruang?.trim() || '',
      jumlahSiswa: 0,
      createdAt: new Date().toISOString(),
    };

    db.classes.push(newClass);
    saveDatabase(db);
    addAuditLog('Admin', 'Tambah Kelas', 'Data Kelas', `Menambahkan kelas ${cleanName}`);
    res.json({ success: true, classItem: newClass });
  });

  app.put('/api/classes/:id', (req, res) => {
    const { id } = req.params;
    const { namaKelas, waliKelas, ruang } = req.body;

    const idx = db.classes.findIndex((c) => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Kelas tidak ditemukan!' });
    }

    const oldName = db.classes[idx].namaKelas;
    const newName = namaKelas ? namaKelas.trim() : oldName;

    // Check duplicate if name changed
    if (newName.toLowerCase() !== oldName.toLowerCase()) {
      const duplicate = db.classes.some((c) => c.id !== id && c.namaKelas.toLowerCase() === newName.toLowerCase());
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Kelas "${newName}" sudah ada!` });
      }

      // Update students assigned to the old class name
      db.students.forEach((s) => {
        if (s.kelas.trim().toLowerCase() === oldName.toLowerCase()) {
          s.kelas = newName;
        }
      });
    }

    db.classes[idx] = {
      ...db.classes[idx],
      namaKelas: newName,
      waliKelas: waliKelas !== undefined ? waliKelas.trim() : db.classes[idx].waliKelas,
      ruang: ruang !== undefined ? ruang.trim() : db.classes[idx].ruang,
    };

    saveDatabase(db);
    addAuditLog('Admin', 'Edit Kelas', 'Data Kelas', `Mengubah kelas ${oldName} menjadi ${newName}`);
    res.json({ success: true, classItem: db.classes[idx] });
  });

  // DELETE CLASS - FIXED AND FULLY WORKING
  app.delete('/api/classes/:id', (req, res) => {
    const { id } = req.params;
    const idx = db.classes.findIndex((c) => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Kelas tidak ditemukan atau sudah dihapus!' });
    }

    const removedClass = db.classes[idx];
    const studentCount = db.students.filter(
      (s) => s.kelas.trim().toLowerCase() === removedClass.namaKelas.trim().toLowerCase()
    ).length;

    // Remove class
    db.classes.splice(idx, 1);
    // Reindex classes
    db.classes.forEach((c, i) => {
      c.no = i + 1;
    });

    saveDatabase(db);
    addAuditLog(
      'Admin',
      'Hapus Kelas',
      'Data Kelas',
      `Menghapus kelas ${removedClass.namaKelas} (berisi ${studentCount} siswa)`
    );

    res.json({
      success: true,
      message: `Kelas "${removedClass.namaKelas}" berhasil dihapus.`,
      deletedId: id,
      studentCount,
    });
  });

  // Bulk add classes (Excel / Copy-Paste)
  app.post('/api/classes/bulk', (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Data kelas kosong atau tidak valid!' });
    }

    let addedCount = 0;
    let skippedCount = 0;
    const addedList: ClassItem[] = [];

    items.forEach((item: any) => {
      const rawName = item.namaKelas || item.nama || item['Nama Kelas'] || item['NAMA KELAS'];
      if (!rawName || typeof rawName !== 'string') return;
      const cleanName = rawName.trim();
      if (!cleanName) return;

      const exists = db.classes.some((c) => c.namaKelas.toLowerCase() === cleanName.toLowerCase());
      if (exists) {
        skippedCount++;
        return;
      }

      const newClass: ClassItem = {
        id: 'cls-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        no: db.classes.length + 1,
        namaKelas: cleanName,
        waliKelas: (item.waliKelas || item['Wali Kelas'] || '').trim(),
        ruang: (item.ruang || item['Ruang'] || '').trim(),
        jumlahSiswa: 0,
        createdAt: new Date().toISOString(),
      };

      db.classes.push(newClass);
      addedList.push(newClass);
      addedCount++;
    });

    saveDatabase(db);
    addAuditLog('Admin', 'Impor Kelas', 'Data Kelas', `Impor massal: ${addedCount} ditambahkan, ${skippedCount} dilewati`);
    res.json({
      success: true,
      addedCount,
      skippedCount,
      totalClasses: db.classes.length,
      addedList,
    });
  });

  // 4. Students
  app.get('/api/students', (req, res) => {
    const { kelas, status, search, sortField, sortOrder } = req.query;
    let list = [...db.students];

    if (kelas && typeof kelas === 'string' && kelas !== 'ALL') {
      list = list.filter((s) => s.kelas.trim().toLowerCase() === kelas.trim().toLowerCase());
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      list = list.filter((s) => s.statusPengecekan === status);
    }

    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.nama.toLowerCase().includes(q) ||
          s.nipd.includes(q) ||
          s.nisn.includes(q) ||
          s.nik.includes(q) ||
          s.kelas.toLowerCase().includes(q) ||
          s.alamat.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortField === 'nama') {
        const diff = a.nama.localeCompare(b.nama);
        return sortOrder === 'desc' ? -diff : diff;
      }
      if (sortField === 'kelas') {
        const diff = a.kelas.localeCompare(b.kelas);
        return sortOrder === 'desc' ? -diff : diff;
      }
      return a.no - b.no;
    });

    res.json(list);
  });

  app.get('/api/students/:id', (req, res) => {
    const student = db.students.find((s) => s.id === req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan!' });
    }
    res.json(student);
  });

  // Student public login lookup by class and name
  app.post('/api/students/lookup', (req, res) => {
    const { kelas, nama, nisn } = req.body;
    if (!kelas || !nama) {
      return res.status(400).json({ success: false, message: 'Kelas dan Nama siswa wajib dipilih!' });
    }

    const student = db.students.find(
      (s) =>
        s.kelas.trim().toLowerCase() === kelas.trim().toLowerCase() &&
        s.nama.trim().toLowerCase() === nama.trim().toLowerCase()
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Data siswa tidak ditemukan. Silakan hubungi admin sekolah.',
      });
    }

    // Return the student data
    res.json({
      success: true,
      student,
    });
  });

  // Add single student
  app.post('/api/students', (req, res) => {
    const body = req.body;
    if (!body.nama || !body.nama.trim()) {
      return res.status(400).json({ success: false, message: 'Nama siswa wajib diisi!' });
    }
    if (!body.kelas || !body.kelas.trim()) {
      return res.status(400).json({ success: false, message: 'Kelas wajib dipilih!' });
    }

    // Check duplicate NISN / NIK / NIPD if provided
    if (body.nisn && body.nisn.trim()) {
      const dup = db.students.find((s) => s.nisn === body.nisn.trim());
      if (dup) {
        return res.status(400).json({ success: false, message: `NISN "${body.nisn}" sudah digunakan oleh ${dup.nama}!` });
      }
    }
    if (body.nik && body.nik.trim()) {
      const dup = db.students.find((s) => s.nik === body.nik.trim());
      if (dup) {
        return res.status(400).json({ success: false, message: `NIK "${body.nik}" sudah digunakan oleh ${dup.nama}!` });
      }
    }

    const newStudent: Student = {
      id: 'std-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      no: db.students.length + 1,
      nama: body.nama.trim(),
      nipd: (body.nipd || '').trim(),
      jk: body.jk === 'P' ? 'P' : 'L',
      nisn: (body.nisn || '').trim(),
      tempatLahir: (body.tempatLahir || '').trim(),
      tanggalLahir: (body.tanggalLahir || '').trim(),
      nik: (body.nik || '').trim(),
      agama: (body.agama || 'Islam').trim(),
      alamat: (body.alamat || '').trim(),
      rt: (body.rt || '').trim(),
      rw: (body.rw || '').trim(),
      dusun: (body.dusun || '').trim(),
      kelurahan: (body.kelurahan || '').trim(),
      kecamatan: (body.kecamatan || 'Kertek').trim(),
      kelas: body.kelas.trim(),
      namaAyah: (body.namaAyah || '').trim(),
      tahunLahirAyah: (body.tahunLahirAyah || '').trim(),
      jenjangPendidikanAyah: (body.jenjangPendidikanAyah || '').trim(),
      pekerjaanAyah: (body.pekerjaanAyah || '').trim(),
      penghasilanAyah: (body.penghasilanAyah || '').trim(),
      nikAyah: (body.nikAyah || '').trim(),
      namaIbu: (body.namaIbu || '').trim(),
      tahunLahirIbu: (body.tahunLahirIbu || '').trim(),
      jenjangPendidikanIbu: (body.jenjangPendidikanIbu || '').trim(),
      pekerjaanIbu: (body.pekerjaanIbu || '').trim(),
      penghasilanIbu: (body.penghasilanIbu || '').trim(),
      nikIbu: (body.nikIbu || '').trim(),
      menerimaPip: body.menerimaPip || 'Belum Diketahui',
      statusPengecekan: body.statusPengecekan || 'Belum Diperiksa',
      catatanAdmin: body.catatanAdmin || '',
      updatedAt: new Date().toISOString(),
    };

    db.students.push(newStudent);
    saveDatabase(db);
    addAuditLog('Admin', 'Tambah Siswa', 'Data Murid', `Menambahkan siswa ${newStudent.nama} (${newStudent.kelas})`);
    res.json({ success: true, student: newStudent });
  });

  // Edit single student
  app.put('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const idx = db.students.findIndex((s) => s.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan!' });
    }

    const current = db.students[idx];
    const updates = req.body;

    // Check duplicate NISN / NIK if changed
    if (updates.nisn && updates.nisn.trim() !== current.nisn) {
      const dup = db.students.find((s) => s.id !== id && s.nisn === updates.nisn.trim());
      if (dup) {
        return res.status(400).json({ success: false, message: `NISN "${updates.nisn}" sudah digunakan oleh siswa ${dup.nama}!` });
      }
    }
    if (updates.nik && updates.nik.trim() !== current.nik) {
      const dup = db.students.find((s) => s.id !== id && s.nik === updates.nik.trim());
      if (dup) {
        return res.status(400).json({ success: false, message: `NIK "${updates.nik}" sudah digunakan oleh siswa ${dup.nama}!` });
      }
    }

    db.students[idx] = {
      ...current,
      ...updates,
      id, // guarantee ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    saveDatabase(db);
    addAuditLog('Admin', 'Edit Siswa', 'Data Murid', `Mengupdate data siswa ${current.nama}`);
    res.json({ success: true, student: db.students[idx] });
  });

  // DELETE STUDENT - FIXED AND FULLY WORKING
  app.delete('/api/students/:id', (req, res) => {
    const { id } = req.params;
    const idx = db.students.findIndex((s) => s.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan atau sudah dihapus!' });
    }

    const removedStudent = db.students[idx];
    db.students.splice(idx, 1);

    // Re-index numbering
    db.students.forEach((s, index) => {
      s.no = index + 1;
    });

    saveDatabase(db);
    addAuditLog('Admin', 'Hapus Siswa', 'Data Murid', `Menghapus data siswa ${removedStudent.nama} (${removedStudent.kelas})`);

    res.json({
      success: true,
      message: `Siswa "${removedStudent.nama}" berhasil dihapus dari database.`,
      deletedId: id,
    });
  });

  // BULK DELETE STUDENTS - FIXED AND FULLY WORKING
  app.post('/api/students/bulk-delete', (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Daftar ID siswa yang akan dihapus tidak valid!' });
    }

    const initialLength = db.students.length;
    const idsSet = new Set(ids);
    db.students = db.students.filter((s) => !idsSet.has(s.id));
    const deletedCount = initialLength - db.students.length;

    // Re-index
    db.students.forEach((s, idx) => {
      s.no = idx + 1;
    });

    saveDatabase(db);
    addAuditLog('Admin', 'Hapus Siswa Massal', 'Data Murid', `Menghapus ${deletedCount} siswa sekaligus`);

    res.json({
      success: true,
      message: `Berhasil menghapus ${deletedCount} data siswa.`,
      deletedCount,
    });
  });

  // Student Self-Verification Endpoint
  app.post('/api/students/:id/student-check', (req, res) => {
    const { id } = req.params;
    const { isConfirmedCorrect, changes } = req.body;

    const idx = db.students.findIndex((s) => s.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan!' });
    }

    const current = db.students[idx];

    if (isConfirmedCorrect) {
      // Confirmed no changes needed
      db.students[idx] = {
        ...current,
        statusPengecekan: 'Sudah Diperiksa Siswa',
        tanggalPeriksa: new Date().toISOString(),
        pendingChanges: undefined,
        updatedAt: new Date().toISOString(),
      };
      saveDatabase(db);
      addAuditLog('Siswa', 'Konfirmasi Data', 'Pengecekan Siswa', `${current.nama} mengonfirmasi data telah benar.`);
      return res.json({
        success: true,
        message: 'Konfirmasi berhasil disimpan. Terima kasih telah memeriksa data Anda!',
        student: db.students[idx],
      });
    }

    // Has changes: save original snapshot and store pending changes
    if (!changes || Object.keys(changes).length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada perubahan yang dikirimkan.' });
    }

    const originalSnapshot: Partial<Student> = {};
    Object.keys(changes).forEach((key) => {
      (originalSnapshot as any)[key] = (current as any)[key];
    });

    db.students[idx] = {
      ...current,
      statusPengecekan: 'Menunggu Verifikasi Admin',
      tanggalPeriksa: new Date().toISOString(),
      originalData: originalSnapshot,
      pendingChanges: changes,
      updatedAt: new Date().toISOString(),
    };

    saveDatabase(db);
    addAuditLog(
      'Siswa',
      'Pengajuan Perbaikan',
      'Pengecekan Siswa',
      `${current.nama} mengajukan perbaikan pada ${Object.keys(changes).length} kolom data`
    );

    res.json({
      success: true,
      message: 'Perubahan data berhasil disimpan dan menunggu verifikasi admin sekolah.',
      student: db.students[idx],
    });
  });

  // Admin Verification Action (Approve / Request Fix)
  app.post('/api/students/:id/admin-verify', (req, res) => {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'approve' | 'request_fix'

    const idx = db.students.findIndex((s) => s.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan!' });
    }

    const student = db.students[idx];

    if (action === 'approve') {
      // Merge pendingChanges into main student data
      const merged: Student = {
        ...student,
        ...(student.pendingChanges || {}),
        statusPengecekan: 'Terverifikasi Admin',
        catatanAdmin: notes || 'Data telah divalidasi dan disetujui admin.',
        tanggalVerifikasi: new Date().toISOString(),
        pendingChanges: undefined,
        updatedAt: new Date().toISOString(),
      };
      db.students[idx] = merged;
      saveDatabase(db);
      addAuditLog('Admin', 'Setujui Perubahan', 'Verifikasi Admin', `Menyetujui perubahan data siswa ${student.nama}`);
      return res.json({
        success: true,
        message: `Perubahan data untuk siswa ${student.nama} berhasil disetujui.`,
        student: merged,
      });
    }

    if (action === 'request_fix') {
      db.students[idx] = {
        ...student,
        statusPengecekan: 'Perlu Perbaikan',
        catatanAdmin: notes || 'Mohon perbaiki data sesuai catatan admin.',
        tanggalVerifikasi: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveDatabase(db);
      addAuditLog(
        'Admin',
        'Minta Perbaikan',
        'Verifikasi Admin',
        `Meminta perbaikan data siswa ${student.nama}: "${notes || ''}"`
      );
      return res.json({
        success: true,
        message: `Status siswa ${student.nama} diubah menjadi 'Perlu Perbaikan'.`,
        student: db.students[idx],
      });
    }

    res.status(400).json({ success: false, message: 'Aksi verifikasi tidak valid!' });
  });

  // Bulk import students (Excel / Paste)
  app.post('/api/students/bulk', (req, res) => {
    const { items, overwriteDuplicates } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Data siswa kosong atau format tidak sesuai!' });
    }

    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    items.forEach((item: any, rowIdx: number) => {
      const nama = item.nama || item['Nama'] || item['NAMA'] || item['Nama Siswa'] || '';
      if (!nama || !nama.trim()) {
        errors.push(`Baris ${rowIdx + 1}: Nama siswa kosong.`);
        skippedCount++;
        return;
      }

      const kelas = item.kelas || item['Kelas'] || item['KELAS'] || 'VII A';
      const nisn = String(item.nisn || item['NISN'] || '').trim();
      const nik = String(item.nik || item['NIK'] || '').trim();
      const nipd = String(item.nipd || item['NIPD'] || '').trim();

      // Check existing duplicate by NISN / NIK / NIPD
      const existingIdx = db.students.findIndex(
        (s) => (nisn && s.nisn === nisn) || (nik && s.nik === nik) || (nipd && s.nipd === nipd)
      );

      if (existingIdx !== -1) {
        if (overwriteDuplicates) {
          db.students[existingIdx] = {
            ...db.students[existingIdx],
            nama: nama.trim(),
            kelas: kelas.trim(),
            nipd: nipd || db.students[existingIdx].nipd,
            nisn: nisn || db.students[existingIdx].nisn,
            nik: nik || db.students[existingIdx].nik,
            jk: (item.jk || item['JK'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
            tempatLahir: item.tempatLahir || item['Tempat Lahir'] || db.students[existingIdx].tempatLahir,
            tanggalLahir: item.tanggalLahir || item['Tanggal Lahir'] || db.students[existingIdx].tanggalLahir,
            agama: item.agama || item['Agama'] || db.students[existingIdx].agama,
            alamat: item.alamat || item['Alamat'] || db.students[existingIdx].alamat,
            rt: String(item.rt || item['RT'] || db.students[existingIdx].rt),
            rw: String(item.rw || item['RW'] || db.students[existingIdx].rw),
            dusun: item.dusun || item['Dusun'] || db.students[existingIdx].dusun,
            kelurahan: item.kelurahan || item['Kelurahan'] || db.students[existingIdx].kelurahan,
            kecamatan: item.kecamatan || item['Kecamatan'] || db.students[existingIdx].kecamatan,
            namaAyah: item.namaAyah || item['Nama Ayah'] || db.students[existingIdx].namaAyah,
            tahunLahirAyah: String(item.tahunLahirAyah || item['Tahun Lahir Ayah'] || db.students[existingIdx].tahunLahirAyah),
            jenjangPendidikanAyah: item.jenjangPendidikanAyah || item['Jenjang Pendidikan Ayah'] || db.students[existingIdx].jenjangPendidikanAyah,
            pekerjaanAyah: item.pekerjaanAyah || item['Pekerjaan Ayah'] || db.students[existingIdx].pekerjaanAyah,
            penghasilanAyah: item.penghasilanAyah || item['Penghasilan Ayah'] || db.students[existingIdx].penghasilanAyah,
            nikAyah: String(item.nikAyah || item['NIK Ayah'] || db.students[existingIdx].nikAyah),
            namaIbu: item.namaIbu || item['Nama Ibu'] || db.students[existingIdx].namaIbu,
            tahunLahirIbu: String(item.tahunLahirIbu || item['Tahun Lahir Ibu'] || db.students[existingIdx].tahunLahirIbu),
            jenjangPendidikanIbu: item.jenjangPendidikanIbu || item['Jenjang Pendidikan Ibu'] || db.students[existingIdx].jenjangPendidikanIbu,
            pekerjaanIbu: item.pekerjaanIbu || item['Pekerjaan Ibu'] || db.students[existingIdx].pekerjaanIbu,
            penghasilanIbu: item.penghasilanIbu || item['Penghasilan Ibu'] || db.students[existingIdx].penghasilanIbu,
            nikIbu: String(item.nikIbu || item['NIK Ibu'] || db.students[existingIdx].nikIbu),
            menerimaPip: item.menerimaPip || item['Menerima PIP'] || db.students[existingIdx].menerimaPip,
            updatedAt: new Date().toISOString(),
          };
          updatedCount++;
        } else {
          skippedCount++;
        }
        return;
      }

      // Add new student
      const newStd: Student = {
        id: 'std-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
        no: db.students.length + 1,
        nama: nama.trim(),
        nipd,
        jk: (item.jk || item['JK'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
        nisn,
        tempatLahir: item.tempatLahir || item['Tempat Lahir'] || 'Wonosobo',
        tanggalLahir: item.tanggalLahir || item['Tanggal Lahir'] || '',
        nik,
        agama: item.agama || item['Agama'] || 'Islam',
        alamat: item.alamat || item['Alamat'] || '',
        rt: String(item.rt || item['RT'] || ''),
        rw: String(item.rw || item['RW'] || ''),
        dusun: item.dusun || item['Dusun'] || '',
        kelurahan: item.kelurahan || item['Kelurahan'] || '',
        kecamatan: item.kecamatan || item['Kecamatan'] || 'Kertek',
        kelas: kelas.trim(),
        namaAyah: item.namaAyah || item['Nama Ayah'] || '',
        tahunLahirAyah: String(item.tahunLahirAyah || item['Tahun Lahir Ayah'] || ''),
        jenjangPendidikanAyah: item.jenjangPendidikanAyah || item['Jenjang Pendidikan Ayah'] || '',
        pekerjaanAyah: item.pekerjaanAyah || item['Pekerjaan Ayah'] || '',
        penghasilanAyah: item.penghasilanAyah || item['Penghasilan Ayah'] || '',
        nikAyah: String(item.nikAyah || item['NIK Ayah'] || ''),
        namaIbu: item.namaIbu || item['Nama Ibu'] || '',
        tahunLahirIbu: String(item.tahunLahirIbu || item['Tahun Lahir Ibu'] || ''),
        jenjangPendidikanIbu: item.jenjangPendidikanIbu || item['Jenjang Pendidikan Ibu'] || '',
        pekerjaanIbu: item.pekerjaanIbu || item['Pekerjaan Ibu'] || '',
        penghasilanIbu: item.penghasilanIbu || item['Penghasilan Ibu'] || '',
        nikIbu: String(item.nikIbu || item['NIK Ibu'] || ''),
        menerimaPip: item.menerimaPip || item['Menerima PIP'] || 'Belum Diketahui',
        statusPengecekan: 'Belum Diperiksa',
        updatedAt: new Date().toISOString(),
      };

      db.students.push(newStd);
      addedCount++;
    });

    saveDatabase(db);
    addAuditLog(
      'Admin',
      'Impor Siswa',
      'Data Murid',
      `Impor massal: ${addedCount} baru, ${updatedCount} diperbarui, ${skippedCount} dilewati.`
    );

    res.json({
      success: true,
      addedCount,
      updatedCount,
      skippedCount,
      totalStudents: db.students.length,
      errors,
    });
  });

  // 5. Reports (Lapor Spentiker)
  app.get('/api/reports', (req, res) => {
    const { jenis, status, search } = req.query;
    let list = [...db.reports];

    if (jenis && typeof jenis === 'string' && jenis !== 'ALL') {
      list = list.filter((r) => r.jenisAduan === jenis);
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      list = list.filter((r) => r.status === status);
    }
    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.namaPelapor.toLowerCase().includes(q) ||
          r.judulAduan.toLowerCase().includes(q) ||
          r.detailAduan.toLowerCase().includes(q) ||
          r.nomorTiket.toLowerCase().includes(q)
      );
    }

    res.json(list);
  });

  app.post('/api/reports', (req, res) => {
    const { namaPelapor, statusPelapor, kontak, kelasSiswa, jenisAduan, judulAduan, detailAduan, masukanSekolah } =
      req.body;

    if (!detailAduan || !detailAduan.trim()) {
      return res.status(400).json({ success: false, message: 'Detail aduan wajib diisi!' });
    }

    const countToday = db.reports.length + 1;
    const ticketNo = `SPK-${new Date().toISOString().slice(0, 7).replace('-', '')}-${String(countToday).padStart(3, '0')}`;

    const newReport: ReportItem = {
      id: 'rep-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      nomorTiket: ticketNo,
      tanggal: new Date().toISOString(),
      namaPelapor: namaPelapor?.trim() || 'Anonim',
      statusPelapor: statusPelapor || 'Masyarakat',
      kontak: kontak?.trim() || '-',
      kelasSiswa: kelasSiswa?.trim() || '',
      jenisAduan: jenisAduan || 'SEKOLAH',
      judulAduan: judulAduan?.trim() || `Aduan ${jenisAduan || 'Umum'}`,
      detailAduan: detailAduan.trim(),
      masukanSekolah: masukanSekolah?.trim() || '',
      status: 'Menunggu Tanggapan',
      createdAt: new Date().toISOString(),
    };

    db.reports.unshift(newReport);
    saveDatabase(db);
    addAuditLog('Publik', 'Kirim Aduan', 'Lapor Spentiker', `Aduan baru [${ticketNo}] terkait ${newReport.jenisAduan}`);

    res.json({
      success: true,
      message: 'Aduan dan masukan Anda berhasil dikirim ke SMP Negeri 3 Kertek.',
      report: newReport,
    });
  });

  app.put('/api/reports/:id', (req, res) => {
    const { id } = req.params;
    const { status, tanggapanAdmin } = req.body;

    const idx = db.reports.findIndex((r) => r.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Laporan aduan tidak ditemukan!' });
    }

    db.reports[idx] = {
      ...db.reports[idx],
      status: status || db.reports[idx].status,
      tanggapanAdmin: tanggapanAdmin !== undefined ? tanggapanAdmin : db.reports[idx].tanggapanAdmin,
      tanggalTanggapan: new Date().toISOString(),
    };

    saveDatabase(db);
    addAuditLog('Admin', 'Tanggapi Aduan', 'Lapor Spentiker', `Menanggapi tiket ${db.reports[idx].nomorTiket}`);
    res.json({ success: true, report: db.reports[idx] });
  });

  // DELETE REPORT - FIXED AND FULLY WORKING
  app.delete('/api/reports/:id', (req, res) => {
    const { id } = req.params;
    const idx = db.reports.findIndex((r) => r.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Laporan aduan tidak ditemukan atau sudah dihapus!' });
    }

    const removed = db.reports[idx];
    db.reports.splice(idx, 1);
    saveDatabase(db);
    addAuditLog('Admin', 'Hapus Aduan', 'Lapor Spentiker', `Menghapus aduan tiket ${removed.nomorTiket}`);

    res.json({
      success: true,
      message: `Aduan tiket "${removed.nomorTiket}" berhasil dihapus.`,
      deletedId: id,
    });
  });

  // 6. Statistics
  app.get('/api/stats', (req, res) => {
    const totalSiswa = db.students.length;
    const totalKelas = db.classes.length;
    const belumDiperiksa = db.students.filter((s) => s.statusPengecekan === 'Belum Diperiksa').length;
    const sudahDiperiksaSiswa = db.students.filter((s) => s.statusPengecekan === 'Sudah Diperiksa Siswa').length;
    const menungguVerifikasi = db.students.filter((s) => s.statusPengecekan === 'Menunggu Verifikasi Admin').length;
    const terverifikasiAdmin = db.students.filter((s) => s.statusPengecekan === 'Terverifikasi Admin').length;
    const perluPerbaikan = db.students.filter((s) => s.statusPengecekan === 'Perlu Perbaikan').length;
    const penerimaPip = db.students.filter((s) => s.menerimaPip === 'Ya').length;

    const totalAduan = db.reports.length;
    const aduanPending = db.reports.filter((r) => r.status === 'Menunggu Tanggapan').length;
    const aduanSelesai = db.reports.filter((r) => r.status === 'Selesai').length;

    res.json({
      totalSiswa,
      totalKelas,
      belumDiperiksa,
      sudahDiperiksaSiswa,
      menungguVerifikasi,
      terverifikasiAdmin,
      perluPerbaikan,
      penerimaPip,
      totalAduan,
      aduanPending,
      aduanSelesai,
    });
  });

  // 7. Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    res.json(db.auditLogs);
  });

  // 8. Reset to Sample Data
  app.post('/api/reset-sample', (req, res) => {
    db = {
      settings: { ...DEFAULT_SCHOOL_SETTINGS },
      classes: [...INITIAL_CLASSES],
      students: [...INITIAL_STUDENTS],
      reports: [...INITIAL_REPORTS],
      auditLogs: [
        {
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString(),
          aktor: 'Admin',
          aksi: 'Reset Data',
          target: 'Database',
          detail: 'Database telah direset ke data contoh resmi SMP Negeri 3 Kertek',
        },
      ],
    };
    saveDatabase(db);
    res.json({ success: true, message: 'Database berhasil direset ke data contoh resmi SMPN 3 Kertek.' });
  });

  // Google Apps Script generator script
  app.get('/api/gas-script', (req, res) => {
    const scriptCode = `/**
 * ==============================================================
 * GOOGLE APPS SCRIPT BACKEND FOR SMP NEGERI 3 KERTEK
 * Web App & Google Sheet Integration
 * ==============================================================
 * Petunjuk Instalasi:
 * 1. Buka https://script.google.com
 * 2. Buat New Project (Proyek Baru), beri nama "Bank Data Siswa SMPN 3 Kertek"
 * 3. Hapus kode default di Code.gs, lalu paste seluruh kode ini.
 * 4. Buat Spreadsheet Google baru bernama "DATABASE BANK DATA SMPN 3 KERTEK"
 *    dengan sheet: "Siswa", "Kelas", "Aduan", "Pengaturan".
 * 5. Isi SPREADSHEET_ID di bawah ini dengan ID spreadsheet Anda.
 * 6. Klik Deploy > New Deployment > Web App.
 *    - Execute as: Me
 *    - Who has access: Anyone (Siapa saja)
 * 7. Copy URL Web App yang dihasilkan.
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
    return jsonResponse({ success: true, students: students });
  }
  
  if (action === 'classes') {
    var sheetCls = ss.getSheetByName('Kelas');
    var cData = sheetCls.getDataRange().getValues();
    var classes = [];
    for (var k = 1; k < cData.length; k++) {
      classes.push({ no: cData[k][0], namaKelas: cData[k][1] });
    }
    return jsonResponse({ success: true, classes: classes });
  }

  return jsonResponse({ success: true, message: "API Bank Data Siswa SMPN 3 Kertek Aktif" });
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
      return jsonResponse({ success: true, message: "Aduan tersimpan di Google Sheets!" });
    }

    if (action === 'update_student') {
      var sheetSiswa = ss.getSheetByName('Siswa');
      var sData = sheetSiswa.getDataRange().getValues();
      for (var i = 1; i < sData.length; i++) {
        if (sData[i][3] == payload.nisn || sData[i][2] == payload.nipd) {
          // Update status column
          sheetSiswa.getRange(i + 1, 28).setValue("Sudah Diperiksa Siswa");
          sheetSiswa.getRange(i + 1, 29).setValue(new Date());
          break;
        }
      }
      return jsonResponse({ success: true, message: "Data siswa berhasil diperbarui di Google Sheets!" });
    }

    return jsonResponse({ success: false, message: "Aksi tidak dikenal" });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
    res.type('text/plain').send(scriptCode);
  });

  // Mount Vite or static server
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Bank Data Siswa SMP Negeri 3 Kertek running on port ${PORT}`);
  });
}

startServer();
