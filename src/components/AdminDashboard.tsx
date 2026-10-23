import React, { useState } from 'react';
import {
  LayoutDashboard,
  School,
  Users,
  CheckSquare,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Shield,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { SchoolSettings, Student, ClassItem, ReportItem, DashboardStats } from '../types';
import { DashboardOverview } from './admin/DashboardOverview';
import { DataKelasView } from './admin/DataKelasView';
import { DataMuridView } from './admin/DataMuridView';
import { PengecekanDataView } from './admin/PengecekanDataView';
import { DataBelumDiperiksaView } from './admin/DataBelumDiperiksaView';
import { DataSudahDiperiksaView } from './admin/DataSudahDiperiksaView';
import { LaporSpentikerAdminView } from './admin/LaporSpentikerAdminView';
import { DownloadExcelView } from './admin/DownloadExcelView';
import { PengaturanView } from './admin/PengaturanView';

interface AdminDashboardProps {
  settings: SchoolSettings;
  stats: DashboardStats;
  students: Student[];
  classes: ClassItem[];
  reports: ReportItem[];
  onRefreshAll: () => Promise<void>;
  onResetSampleData: () => Promise<void>;
  onLogout: () => void;
  onGoHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  stats,
  students,
  classes,
  reports,
  onRefreshAll,
  onResetSampleData,
  onLogout,
  onGoHome,
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'data-kelas', label: 'Data Kelas', icon: School, badge: classes.length },
    { id: 'data-murid', label: 'Data Murid', icon: Users, badge: students.length },
    {
      id: 'pengecekan',
      label: 'Pengecekan Data',
      icon: CheckSquare,
      badge: stats.menungguVerifikasi > 0 ? stats.menungguVerifikasi : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'data-belum',
      label: 'Data Belum Diperiksa',
      icon: Clock,
      badge: stats.belumDiperiksa > 0 ? stats.belumDiperiksa : undefined,
    },
    {
      id: 'data-sudah',
      label: 'Data Sudah Diperiksa',
      icon: CheckCircle2,
      badge: stats.sudahDiperiksaSiswa + stats.terverifikasiAdmin,
    },
    {
      id: 'lapor-spentiker',
      label: 'Lapor Spentiker',
      icon: MessageSquare,
      badge: stats.aduanPending > 0 ? stats.aduanPending : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'download-excel', label: 'Download Excel', icon: FileSpreadsheet },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased">
      {/* Mobile Top Navbar with hamburger */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <SchoolLogo customLogoUrl={settings.logoUrl} size="sm" />
          <span className="font-bold text-sm">Admin SMPN 3 Kertek</span>
        </div>
        <button
          onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl"
        >
          {isSidebarOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ${
          isSidebarOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar School Branding */}
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3.5">
            <SchoolLogo customLogoUrl={settings.logoUrl} size="md" />
            <div className="overflow-hidden">
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400 block">
                ADMIN PANEL
              </span>
              <h1 className="text-sm font-extrabold tracking-tight truncate text-white">
                SMPN 3 KERTEK
              </h1>
              <span className="text-[11px] text-slate-400 truncate block">
                Bank Data & Validasi
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 overflow-y-auto space-y-1.5 scrollbar-thin">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpenMobile(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer User & Actions */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
            <button
              onClick={onGoHome}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-sky-300 hover:text-white hover:bg-white/5 transition-colors font-medium"
            >
              <span>Lihat Halaman Publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Keluar / Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              stats={stats}
              students={students}
              reports={reports}
              classes={classes}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'data-kelas' && (
            <DataKelasView classes={classes} onRefreshClasses={onRefreshAll} />
          )}

          {activeTab === 'data-murid' && (
            <DataMuridView
              students={students}
              classes={classes}
              onRefreshStudents={onRefreshAll}
            />
          )}

          {activeTab === 'pengecekan' && (
            <PengecekanDataView
              students={students}
              onRefreshStudents={onRefreshAll}
            />
          )}

          {activeTab === 'data-belum' && (
            <DataBelumDiperiksaView students={students} classes={classes} />
          )}

          {activeTab === 'data-sudah' && (
            <DataSudahDiperiksaView students={students} classes={classes} />
          )}

          {activeTab === 'lapor-spentiker' && (
            <LaporSpentikerAdminView
              reports={reports}
              onRefreshReports={onRefreshAll}
            />
          )}

          {activeTab === 'download-excel' && (
            <DownloadExcelView
              students={students}
              classes={classes}
              reports={reports}
            />
          )}

          {activeTab === 'pengaturan' && (
            <PengaturanView
              settings={settings}
              onRefreshSettings={onRefreshAll}
              onResetSampleData={onResetSampleData}
            />
          )}
        </div>
      </main>
    </div>
  );
};
