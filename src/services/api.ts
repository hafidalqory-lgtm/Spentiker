import { Student, ClassItem, ReportItem, SchoolSettings, DashboardStats, AuditLog } from '../types';

const API_BASE = '/api';

export const api = {
  // Settings
  async getSettings(): Promise<SchoolSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Gagal mengambil pengaturan');
    return res.json();
  },

  async updateSettings(updates: Partial<SchoolSettings>): Promise<{ success: boolean; settings: SchoolSettings }> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Gagal memperbarui pengaturan');
    return res.json();
  },

  // Auth
  async loginAdmin(username: string, password: string): Promise<{ success: boolean; token: string; admin: any }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login gagal');
    }
    return data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Gagal mengubah password');
    }
    return data;
  },

  // Classes
  async getClasses(): Promise<ClassItem[]> {
    const res = await fetch(`${API_BASE}/classes`);
    if (!res.ok) throw new Error('Gagal memuat data kelas');
    return res.json();
  },

  async addClass(data: { namaKelas: string; waliKelas?: string; ruang?: string }): Promise<{ success: boolean; classItem: ClassItem }> {
    const res = await fetch(`${API_BASE}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal menambah kelas');
    return result;
  },

  async updateClass(id: string, data: { namaKelas: string; waliKelas?: string; ruang?: string }): Promise<{ success: boolean; classItem: ClassItem }> {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal memperbarui kelas');
    return result;
  },

  // DELETE CLASS - RELIABLE AND TESTED
  async deleteClass(id: string): Promise<{ success: boolean; message: string; deletedId: string; studentCount: number }> {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal menghapus kelas');
    return result;
  },

  async bulkAddClasses(items: any[]): Promise<{ success: boolean; addedCount: number; skippedCount: number; addedList: ClassItem[] }> {
    const res = await fetch(`${API_BASE}/classes/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal mengimpor data kelas');
    return result;
  },

  // Students
  async getStudents(params?: { kelas?: string; status?: string; search?: string; sortField?: string; sortOrder?: string }): Promise<Student[]> {
    const searchParams = new URLSearchParams();
    if (params?.kelas) searchParams.append('kelas', params.kelas);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortField) searchParams.append('sortField', params.sortField);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const res = await fetch(`${API_BASE}/students?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Gagal memuat data siswa');
    return res.json();
  },

  async getStudent(id: string): Promise<Student> {
    const res = await fetch(`${API_BASE}/students/${id}`);
    if (!res.ok) throw new Error('Siswa tidak ditemukan');
    return res.json();
  },

  async lookupStudent(kelas: string, nama: string): Promise<{ success: boolean; student: Student }> {
    const res = await fetch(`${API_BASE}/students/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kelas, nama }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Data siswa tidak ditemukan');
    return result;
  },

  async addStudent(data: Partial<Student>): Promise<{ success: boolean; student: Student }> {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal menambah siswa');
    return result;
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<{ success: boolean; student: Student }> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal mengupdate data siswa');
    return result;
  },

  // DELETE STUDENT - RELIABLE AND TESTED
  async deleteStudent(id: string): Promise<{ success: boolean; message: string; deletedId: string }> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal menghapus siswa');
    return result;
  },

  // BULK DELETE STUDENTS - RELIABLE AND TESTED
  async bulkDeleteStudents(ids: string[]): Promise<{ success: boolean; message: string; deletedCount: number }> {
    const res = await fetch(`${API_BASE}/students/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal menghapus data siswa yang dipilih');
    return result;
  },

  // Bulk import students
  async bulkAddStudents(items: any[], overwriteDuplicates: boolean = false): Promise<{
    success: boolean;
    addedCount: number;
    updatedCount: number;
    skippedCount: number;
    totalStudents: number;
    errors: string[];
  }> {
    const res = await fetch(`${API_BASE}/students/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, overwriteDuplicates }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal mengimpor data siswa');
    return result;
  },

  // Student verification check
  async submitStudentCheck(id: string, isConfirmedCorrect: boolean, changes?: Partial<Student>): Promise<{ success: boolean; message: string; student: Student }> {
    const res = await fetch(`${API_BASE}/students/${id}/student-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isConfirmedCorrect, changes }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal menyimpan pengecekan');
    return result;
  },

  // Admin verification
  async verifyStudentAdmin(id: string, action: 'approve' | 'request_fix', notes?: string): Promise<{ success: boolean; message: string; student: Student }> {
    const res = await fetch(`${API_BASE}/students/${id}/admin-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal memproses verifikasi');
    return result;
  },

  // Reports - Lapor Spentiker
  async getReports(params?: { jenis?: string; status?: string; search?: string }): Promise<ReportItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.jenis) searchParams.append('jenis', params.jenis);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);

    const res = await fetch(`${API_BASE}/reports?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Gagal mengambil data laporan aduan');
    return res.json();
  },

  async submitReport(data: {
    namaPelapor?: string;
    statusPelapor?: string;
    kontak?: string;
    kelasSiswa?: string;
    jenisAduan: string;
    judulAduan: string;
    detailAduan: string;
    masukanSekolah?: string;
  }): Promise<{ success: boolean; message: string; report: ReportItem }> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal mengirim aduan');
    return result;
  },

  async updateReport(id: string, updates: { status?: string; tanggapanAdmin?: string }): Promise<{ success: boolean; report: ReportItem }> {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal memperbarui aduan');
    return result;
  },

  // DELETE REPORT - RELIABLE AND TESTED
  async deleteReport(id: string): Promise<{ success: boolean; message: string; deletedId: string }> {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Gagal menghapus aduan');
    return result;
  },

  // Stats
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Gagal mengambil statistik');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs`);
    if (!res.ok) return [];
    return res.json();
  },

  // Reset sample data
  async resetSampleData(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/reset-sample`, {
      method: 'POST',
    });
    return res.json();
  },
};
