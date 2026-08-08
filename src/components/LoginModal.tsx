import React, { useState } from 'react';
import { User, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { Lock, User as UserIcon, ShieldCheck, Key } from 'lucide-react';

interface LoginModalProps {
  users: User[];
  currentLang: Language;
  onLoginSuccess: (user: User) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  users,
  currentLang,
  onLoginSuccess,
  onClose
}) => {
  const t = getTranslation(currentLang);

  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('AdminPass1010');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const found = users.find(
      u => (u.username || '').toLowerCase() === (usernameInput || '').trim().toLowerCase() && u.password === passwordInput
    );

    if (found) {
      onLoginSuccess(found);
      onClose();
    } else {
      setError(t.loginFailed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121212] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-sm w-full space-y-6 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white text-lg font-bold"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#00d0b0]/10 text-[#00d0b0] border border-[#00d0b0]/20 mb-1">
            <Lock size={28} />
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl font-black text-white lowercase tracking-tight font-sans">dar</span>
            <span className="w-2 h-2 rounded-full bg-[#00d0b0]"></span>
          </div>
          <h2 className="text-xs font-bold text-[#00d0b0] uppercase tracking-widest">{t.loginTitle}</h2>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-bold uppercase tracking-wider text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          <div>
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1 block">{t.username}</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-2.5 text-white/40" size={16} />
              <input
                type="text"
                required
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#181818] border border-white/10 rounded-lg text-xs text-white focus:border-[#00d0b0] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1 block">{t.password}</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-2.5 text-white/40" size={16} />
              <input
                type="password"
                required
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#181818] border border-white/10 rounded-lg text-xs text-white focus:border-[#00d0b0] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#00d0b0] hover:bg-[#00b894] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#00d0b0]/10 transition-all"
          >
            {t.login}
          </button>

        </form>

        {/* Preset Hint */}
        <div className="p-3.5 bg-[#181818] border border-white/10 rounded-xl text-[11px] text-white/60 space-y-1">
          <div className="font-bold text-[#00d0b0] uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1">
            <ShieldCheck size={13} /> Default Admin Credentials:
          </div>
          <div>Username: <strong className="text-white font-mono">admin</strong></div>
          <div>Password: <strong className="text-white font-mono">AdminPass1010</strong></div>
        </div>

      </div>
    </div>
  );
};
