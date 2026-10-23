import React, { useState, useEffect } from 'react';
import { UserCheck, X, AlertCircle, ArrowRight, School, User } from 'lucide-react';
import { ClassItem, Student } from '../types';
import { api } from '../services/api';

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: Student) => void;
  classes: ClassItem[];
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  classes,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // When class changes, fetch students in that class
  useEffect(() => {
    if (!selectedClass) {
      setStudentsInClass([]);
      setSelectedStudentName('');
      return;
    }

    const fetchStudents = async () => {
      try {
        setIsLoadingStudents(true);
        setErrorMessage(null);
        setSelectedStudentName('');
        const list = await api.getStudents({ kelas: selectedClass });
        setStudentsInClass(list);
      } catch (err: any) {
        setErrorMessage('Gagal memuat daftar nama siswa di kelas ini.');
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedClass) {
      setErrorMessage('Silakan pilih kelas terlebih dahulu.');
      return;
    }

    if (!selectedStudentName) {
      setErrorMessage('Silakan pilih nama siswa yang terdaftar.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.lookupStudent(selectedClass, selectedStudentName);
      if (res.student) {
        setIsSubmitting(false);
        onSuccess(res.student);
        onClose();
      } else {
        throw new Error('Data siswa tidak ditemukan. Silakan hubungi admin sekolah.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Data siswa tidak ditemukan. Silakan hubungi admin sekolah.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-md">
            <UserCheck className="w-6 h-6 text-sky-200" />
          </div>
          <h3 className="text-xl font-bold">Masuk Pengecekan Data</h3>
          <p className="text-xs text-sky-100 mt-1">
            Pilih kelas dan nama Anda yang terdaftar pada database SMP Negeri 3 Kertek.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Pilih Kelas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-blue-600" />
              Pilih Kelas
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              required
            >
              <option value="">-- Pilih Kelas Anda --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.namaKelas}>
                  {cls.namaKelas} {cls.ruang ? `(${cls.ruang})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Pilih Nama Siswa */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Pilih Nama Siswa
            </label>
            <select
              value={selectedStudentName}
              disabled={!selectedClass || isLoadingStudents}
              onChange={(e) => setSelectedStudentName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50 disabled:bg-slate-100"
              required
            >
              <option value="">
                {!selectedClass
                  ? '-- Pilih kelas terlebih dahulu --'
                  : isLoadingStudents
                  ? 'Sedang memuat nama...'
                  : studentsInClass.length === 0
                  ? 'Belum ada siswa di kelas ini'
                  : '-- Pilih Nama Lengkap Anda --'}
              </option>
              {studentsInClass.map((std) => (
                <option key={std.id} value={std.nama}>
                  {std.nama} {std.nisn ? `(NISN: ${std.nisn})` : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Nama disinkronkan otomatis sesuai data resmi sekolah.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !selectedClass || !selectedStudentName}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memeriksa Database...
                </>
              ) : (
                <>
                  Periksa Data Diri Saya
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
