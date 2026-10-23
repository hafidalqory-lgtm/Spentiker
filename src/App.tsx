import React, { useState, useEffect, useCallback } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { PublicHome } from './components/PublicHome';
import { StudentLoginModal } from './components/StudentLoginModal';
import { StudentCheckView } from './components/StudentCheckView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { DEFAULT_SCHOOL_SETTINGS, INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_REPORTS } from './data/initialData';
import { SchoolSettings, Student, ClassItem, ReportItem, DashboardStats } from './types';
import { api } from './services/api';

export default function App() {
  // Splash screen state (3 seconds duration as required)
  const [showSplash, setShowSplash] = useState(true);

  // App navigation state: 'home' | 'student-check' | 'admin-dashboard'
  const [currentView, setCurrentView] = useState<'home' | 'student-check' | 'admin-dashboard'>('home');

  // Modal states
  const [isStudentLoginOpen, setIsStudentLoginOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Active student in session
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  // Data states
  const [settings, setSettings] = useState<SchoolSettings>(DEFAULT_SCHOOL_SETTINGS);
  const [classes, setClasses] = useState<ClassItem[]>(INITIAL_CLASSES);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [stats, setStats] = useState<DashboardStats>({
    totalSiswa: INITIAL_STUDENTS.length,
    totalKelas: INITIAL_CLASSES.length,
    belumDiperiksa: 0,
    sudahDiperiksaSiswa: 0,
    menungguVerifikasi: 0,
    terverifikasiAdmin: 0,
    perluPerbaikan: 0,
    penerimaPip: 0,
    totalAduan: INITIAL_REPORTS.length,
    aduanPending: 0,
    aduanSelesai: 0,
  });

  // Fetch all data from backend
  const loadAllData = useCallback(async () => {
    try {
      const [fetchedSettings, fetchedClasses, fetchedStudents, fetchedReports, fetchedStats] =
        await Promise.all([
          api.getSettings().catch(() => DEFAULT_SCHOOL_SETTINGS),
          api.getClasses().catch(() => INITIAL_CLASSES),
          api.getStudents().catch(() => INITIAL_STUDENTS),
          api.getReports().catch(() => INITIAL_REPORTS),
          api.getStats().catch(() => ({
            totalSiswa: INITIAL_STUDENTS.length,
            totalKelas: INITIAL_CLASSES.length,
            belumDiperiksa: 0,
            sudahDiperiksaSiswa: 0,
            menungguVerifikasi: 0,
            terverifikasiAdmin: 0,
            perluPerbaikan: 0,
            penerimaPip: 0,
            totalAduan: INITIAL_REPORTS.length,
            aduanPending: 0,
            aduanSelesai: 0,
          })),
        ]);

      setSettings(fetchedSettings);
      setClasses(fetchedClasses);
      setStudents(fetchedStudents);
      setReports(fetchedReports);
      setStats(fetchedStats);
    } catch (err) {
      console.warn('Backend sync error:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle student login success
  const handleStudentLoginSuccess = (student: Student) => {
    setActiveStudent(student);
    setCurrentView('student-check');
  };

  // Handle student update (after submitting changes or confirming correct)
  const handleStudentUpdated = (updated: Student) => {
    setActiveStudent(updated);
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    loadAllData();
  };

  // Handle admin login success
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setCurrentView('admin-dashboard');
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentView('home');
  };

  // Handle reset to sample data
  const handleResetSampleData = async () => {
    await api.resetSampleData();
    await loadAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-blue-600 selection:text-white">
      {/* 1. Splash Screen (exactly 3 seconds) */}
      {showSplash && (
        <SplashScreen
          durationMs={3000}
          logoUrl={settings.logoUrl}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {/* If inside Admin Dashboard, render the admin dashboard directly */}
      {currentView === 'admin-dashboard' ? (
        <AdminDashboard
          settings={settings}
          stats={stats}
          students={students}
          classes={classes}
          reports={reports}
          onRefreshAll={loadAllData}
          onResetSampleData={handleResetSampleData}
          onLogout={handleAdminLogout}
          onGoHome={() => setCurrentView('home')}
        />
      ) : (
        <>
          {/* Top Header */}
          <Header
            settings={settings}
            isAdminLoggedIn={isAdminLoggedIn}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            onGoToDashboard={() => setCurrentView('admin-dashboard')}
            onGoHome={() => {
              setActiveStudent(null);
              setCurrentView('home');
            }}
            onOpenLaporSpentiker={() => {
              if (currentView !== 'home') {
                setCurrentView('home');
              }
              setTimeout(() => {
                const el = document.getElementById('lapor-spentiker');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            onOpenStudentLogin={() => setIsStudentLoginOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1">
            {currentView === 'home' && (
              <PublicHome
                settings={settings}
                stats={stats}
                onOpenStudentLogin={() => setIsStudentLoginOpen(true)}
                onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
              />
            )}

            {currentView === 'student-check' && activeStudent && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <StudentCheckView
                  student={activeStudent}
                  classes={classes}
                  onBack={() => {
                    setActiveStudent(null);
                    setCurrentView('home');
                  }}
                  onStudentUpdated={handleStudentUpdated}
                />
              </div>
            )}
          </main>
        </>
      )}

      {/* Student Login Selection Modal */}
      <StudentLoginModal
        isOpen={isStudentLoginOpen}
        classes={classes}
        onClose={() => setIsStudentLoginOpen(false)}
        onSuccess={handleStudentLoginSuccess}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
