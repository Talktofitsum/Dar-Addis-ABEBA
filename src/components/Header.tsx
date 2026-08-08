import React from 'react';
import { User, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { MASTER_DRIVE_FOLDER_URL } from '../data/initialData';
import { Globe, User as UserIcon, LogOut, Lock, CloudCheck, ShieldCheck, ExternalLink } from 'lucide-react';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  currentUser: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  lastDriveSync: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  currentUser,
  onLoginClick,
  onLogoutClick,
  lastDriveSync
}) => {
  const t = getTranslation(currentLang);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#00d0b0]/10 text-[#00d0b0] border border-[#00d0b0]/20 flex items-center gap-1"><ShieldCheck size={11} /> {t.roleAdmin}</span>;
      case 'delete':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-red-500/10 text-red-400 border border-red-500/20">{t.roleDelete}</span>;
      case 'edit':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">{t.roleEdit}</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-white/5 text-white/60 border border-white/10">{t.roleView}</span>;
    }
  };

  return (
    <header className="bg-[#121212] border-b border-white/10 text-[#E0E0E0] sticky top-0 z-40 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo & Title matching dar.com */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-3xl font-black text-white lowercase tracking-tight font-sans">dar</span>
            <span className="w-2 h-2 rounded-full bg-[#00d0b0]"></span>
          </div>
          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-[0.15em] text-[#00d0b0] uppercase leading-none">
                Dar Al-Handasah
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono hidden md:inline-block">
                Ethiopia Area Office
              </span>
            </div>
            <h1 className="text-sm font-semibold text-white leading-tight mt-1">
              Dar-Et cv database
            </h1>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Direct Google Drive Link */}
          <a
            href={MASTER_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-white/10 border border-white/10 text-xs text-white/80 transition-all hover:border-[#00d0b0]/40 group"
            title="Open Google Drive Storage Folder"
          >
            <CloudCheck className="text-[#00d0b0] animate-pulse" size={16} />
            <div>
              <div className="font-semibold text-white text-[11px] flex items-center gap-1 group-hover:text-[#00d0b0]">
                Drive Linked <ExternalLink size={10} />
              </div>
              <div className="text-[9px] text-white/40 uppercase tracking-wider font-mono">Synced: {lastDriveSync}</div>
            </div>
          </a>

          {/* Language Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181818] border border-white/10 text-xs text-white/80">
            <Globe size={13} className="text-[#00d0b0]" />
            <span className="font-semibold text-white text-[11px]">English (US)</span>
          </div>

          {/* User Auth Section */}
          {currentUser ? (
            <div className="flex items-center gap-3 border-l border-white/10 pl-3 sm:pl-4">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center justify-end gap-1.5">
                  <UserIcon size={12} className="text-[#00d0b0]" />
                  {currentUser.fullName}
                </span>
                <div className="mt-0.5 flex justify-end">
                  {getRoleBadge(currentUser.role)}
                </div>
              </div>
              <button
                onClick={onLogoutClick}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors"
                title={t.logout}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#00d0b0] hover:bg-[#00b894] text-[#0A0A0A] flex items-center gap-1.5 shadow-lg shadow-[#00d0b0]/10 transition-all transform hover:scale-[1.02]"
            >
              <Lock size={13} />
              {t.login}
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
