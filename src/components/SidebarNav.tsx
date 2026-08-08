import React from 'react';
import { Language, AccessLevel } from '../types';
import { getTranslation } from '../i18n/translations';
import { Database, FilePlus, Sparkles, FileSpreadsheet, HardDrive, Users, PieChart } from 'lucide-react';

export type TabType = 'database' | 'form' | 'ai' | 'import_export' | 'drive' | 'users' | 'analytics';

interface SidebarNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentLang: Language;
  userRole?: AccessLevel;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentTab,
  onTabChange,
  currentLang,
  userRole
}) => {
  const t = getTranslation(currentLang);

  const navItems = [
    { id: 'database' as TabType, label: t.navDatabase, icon: Database },
    { id: 'form' as TabType, label: t.navAddCv, icon: FilePlus },
    { id: 'ai' as TabType, label: t.navAiEnhance, icon: Sparkles, badge: 'Gemini' },
    { id: 'import_export' as TabType, label: t.navImportExport, icon: FileSpreadsheet },
    { id: 'drive' as TabType, label: t.navDriveSync, icon: HardDrive },
    { id: 'analytics' as TabType, label: t.navAnalytics, icon: PieChart },
  ];

  // Admin tab
  if (userRole === 'admin') {
    navItems.push({ id: 'users' as TabType, label: t.navUsers, icon: Users });
  }

  return (
    <nav className="bg-[#141414]/90 border-b border-white/5 backdrop-blur sticky top-20 z-30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 py-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-[#00d0b0] text-[#0A0A0A] font-bold shadow-md shadow-[#00d0b0]/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-[#0A0A0A]' : 'text-white/50'} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    isActive ? 'bg-[#0A0A0A] text-[#00d0b0]' : 'bg-[#00d0b0]/20 text-[#00d0b0] border border-[#00d0b0]/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
