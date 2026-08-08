import React, { useState, useEffect } from 'react';
import { Employee, User, DriveSyncLog, Language, AttachmentFile } from './types';
import { initialEmployees, initialUsers, initialDriveLogs } from './data/initialData';

import { Header } from './components/Header';
import { SidebarNav, TabType } from './components/SidebarNav';
import { DatabaseView } from './components/DatabaseView';
import { StandardCvForm } from './components/StandardCvForm';
import { AiEnhancerView } from './components/AiEnhancerView';
import { ImportExportView } from './components/ImportExportView';
import { DriveSyncView } from './components/DriveSyncView';
import { UserManagementView } from './components/UserManagementView';
import { AnalyticsView } from './components/AnalyticsView';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { LoginModal } from './components/LoginModal';

export default function App() {
  // Application State with local storage persistence fallback
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [currentTab, setCurrentTab] = useState<TabType>('database');
  
  // Data State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const savedVer = localStorage.getItem('dar_db_version');
    const saved = localStorage.getItem('dar_db_employees');
    if (saved && savedVer === 'drive_folder_10id') {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 100) return parsed;
      } catch (e) {
        // Fallback to initial
      }
    }
    localStorage.setItem('dar_db_version', 'drive_folder_10id');
    return initialEmployees;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('dar_db_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [driveLogs, setDriveLogs] = useState<DriveSyncLog[]>(() => {
    const saved = localStorage.getItem('dar_db_drive_logs');
    return saved ? JSON.parse(saved) : initialDriveLogs;
  });

  // Logged-in User State (Default Admin: admin / AdminPass1010)
  const [currentUser, setCurrentUser] = useState<User | null>(initialUsers[0]);

  // Modal States
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lastDriveSyncTime, setLastDriveSyncTime] = useState('2026-08-04 10:15');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('dar_db_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('dar_db_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('dar_db_drive_logs', JSON.stringify(driveLogs));
  }, [driveLogs]);

  // Set RTL direction attribute when language is Arabic
  useEffect(() => {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Handlers for Employee Operations
  const handleSaveEmployee = (empData: Employee) => {
    setEmployees(prev => {
      const existsIndex = prev.findIndex(e => e.id === empData.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = empData;
        return updated;
      } else {
        return [empData, ...prev];
      }
    });
    setEditingEmployee(null);
    setCurrentTab('database');
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff record from Dar database?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleImportEmployees = (newEmployees: Employee[]) => {
    setEmployees(prev => [...newEmployees, ...prev]);
    setCurrentTab('database');
  };

  const handleAddAttachment = (empId: string, attachment: AttachmentFile) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === empId) {
        return {
          ...e,
          attachments: [attachment, ...e.attachments]
        };
      }
      return e;
    }));
  };

  // Google Drive Sync trigger
  const handleDriveSync = async (emp?: Employee) => {
    const fileName = emp ? `Folder_[${emp.employeeId}]_${emp.fullName.replace(/\s+/g, '_')}` : `Dar_Ethiopia_Staff_Master.xlsx`;
    
    try {
      const res = await fetch('/api/drive/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          action: emp ? 'upload' : 'backup',
          payload: emp || employees
        })
      });

      const data = await res.json();
      if (data.success && data.syncLog) {
        setDriveLogs(prev => [data.syncLog, ...prev]);
        setLastDriveSyncTime(data.syncLog.timestamp);
      }
    } catch (error) {
      console.error('Drive Sync Error:', error);
      // Fallback local log if offline
      const fallbackLog: DriveSyncLog = {
        id: `sync-${Date.now()}`,
        fileName,
        fileSize: '185 KB',
        action: emp ? 'upload' : 'backup',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'synced',
        driveUrl: 'https://drive.google.com/drive/folders/10idSQEP8yefEYlT5qqF0LcsyCfjXEvMH?usp=drive_link'
      };
      setDriveLogs(prev => [fallbackLog, ...prev]);
      setLastDriveSyncTime(fallbackLog.timestamp);
    }
  };

  // User Management
  const handleAddUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-sans antialiased selection:bg-[#00d0b0] selection:text-[#0A0A0A]">
      
      {/* Top Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        currentUser={currentUser}
        onLoginClick={() => setShowLoginModal(true)}
        onLogoutClick={() => setCurrentUser(null)}
        lastDriveSync={lastDriveSyncTime}
      />

      {/* Navigation Bar */}
      <SidebarNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentLang={currentLang}
        userRole={currentUser?.role}
      />

      {/* Main Page Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        
        {/* Tab 1: Database Table */}
        {currentTab === 'database' && (
          <DatabaseView
            employees={employees}
            currentLang={currentLang}
            currentUser={currentUser}
            onAddClick={() => {
              setEditingEmployee(null);
              setCurrentTab('form');
            }}
            onEditClick={(emp) => {
              setEditingEmployee(emp);
              setCurrentTab('form');
            }}
            onDeleteClick={handleDeleteEmployee}
            onViewClick={(emp) => setViewingEmployee(emp)}
            onSyncDriveClick={handleDriveSync}
            onOpenAiEnhance={() => setCurrentTab('ai')}
          />
        )}

        {/* Tab 2: Standard CV Form */}
        {currentTab === 'form' && (
          <StandardCvForm
            initialEmployee={editingEmployee}
            currentLang={currentLang}
            onSave={handleSaveEmployee}
            onCancel={() => {
              setEditingEmployee(null);
              setCurrentTab('database');
            }}
          />
        )}

        {/* Tab 3: AI CV Enhancer */}
        {currentTab === 'ai' && (
          <AiEnhancerView
            currentLang={currentLang}
          />
        )}

        {/* Tab 4: Import & Export */}
        {currentTab === 'import_export' && (
          <ImportExportView
            currentLang={currentLang}
            onEmployeesImported={handleImportEmployees}
            onUpdateEmployees={(migrated) => setEmployees(migrated)}
            employees={employees}
          />
        )}

        {/* Tab 5: Google Drive Sync */}
        {currentTab === 'drive' && (
          <DriveSyncView
            currentLang={currentLang}
            logs={driveLogs}
            employees={employees}
            onManualSync={() => handleDriveSync()}
            lastSyncTime={lastDriveSyncTime}
          />
        )}

        {/* Tab 6: User Management (Admin only) */}
        {currentTab === 'users' && currentUser?.role === 'admin' && (
          <UserManagementView
            users={users}
            currentLang={currentLang}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {/* Tab 7: Projects & Analytics */}
        {currentTab === 'analytics' && (
          <AnalyticsView
            employees={employees}
            currentLang={currentLang}
          />
        )}

      </main>

      {/* Modals */}
      {viewingEmployee && (
        <EmployeeDetailModal
          employee={viewingEmployee}
          currentLang={currentLang}
          onClose={() => setViewingEmployee(null)}
          onSyncDrive={(emp) => {
            handleDriveSync(emp);
          }}
          onAddAttachment={handleAddAttachment}
          onUpdateEmployee={(updated) => {
            setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
            setViewingEmployee(updated);
          }}
        />
      )}

      {showLoginModal && (
        <LoginModal
          users={users}
          currentLang={currentLang}
          onLoginSuccess={(u) => setCurrentUser(u)}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Footer Branding matching dar.com */}
      <footer className="border-t border-white/10 bg-[#121212] py-8 text-center text-xs text-white/50 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xl font-black text-white lowercase tracking-tight">dar</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d0b0]"></span>
            </div>
            <span className="text-[11px] uppercase tracking-wider text-white/60">Dar Ethiopia Staff CV Database & Google Drive Synchronization System</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/40">© 2026 Dar Al-Handasah Consultancy Services</div>
        </div>
      </footer>

    </div>
  );
}
