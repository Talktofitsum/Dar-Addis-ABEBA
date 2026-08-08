import React, { useState } from 'react';
import { User, AccessLevel, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { Users, UserPlus, Key, ShieldCheck, Trash2, Edit3, CheckCircle2 } from 'lucide-react';

interface UserManagementViewProps {
  users: User[];
  currentLang: Language;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentLang,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const t = getTranslation(currentLang);

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AccessLevel>('view');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    const newUser: User = {
      id: `u-${Date.now()}`,
      username,
      fullName: fullName || username,
      role,
      email: email || `${(username || '').toLowerCase()}@dar.com`,
      password,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddUser(newUser);
    setSuccessMsg(`Created account for ${username} with ${role.toUpperCase()} access!`);
    setUsername('');
    setFullName('');
    setEmail('');
    setPassword('');
    setShowAddModal(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    onUpdateUser(editingUser);
    setSuccessMsg(`Updated user credentials for ${editingUser.username}!`);
    setEditingUser(null);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const getRoleLabel = (r: AccessLevel) => {
    switch (r) {
      case 'admin': return t.roleAdmin;
      case 'delete': return t.roleDelete;
      case 'edit': return t.roleEdit;
      default: return t.roleView;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#121212] border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#00d0b0] uppercase tracking-[0.2em] block">
            Role-Based Access Control (RBAC)
          </span>
          <h2 className="text-xl sm:text-2xl font-light text-white">
            {t.userManagementTitle}
          </h2>
          <p className="text-xs text-white/60">
            Admin can manage accounts, passwords, edit credentials (including admin credentials), and configure granular access levels (View, Edit, Delete, Full Admin).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-lg bg-[#00d0b0] hover:bg-[#00b894] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00d0b0]/10 shrink-0"
        >
          <UserPlus size={16} />
          {t.addNewUser}
        </button>

      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* User Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121212] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-md w-full space-y-5 shadow-2xl">
            
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserPlus size={18} className="text-[#00d0b0]" />
                {t.addNewUser}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/40 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1 block">{t.username} *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. supervisor_addis"
                  className="w-full bg-[#181818] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1 block">{t.fullName}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Almaz Bekele"
                  className="w-full bg-[#181818] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1 block">{t.password} *</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Set password..."
                  className="w-full bg-[#181818] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:border-[#00d0b0] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1 block">{t.assignRole}</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as AccessLevel)}
                  className="w-full bg-[#181818] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
                >
                  <option value="view">{t.roleView} (መመልከት ብቻ)</option>
                  <option value="edit">{t.roleEdit} (ማስተካከል/ማሻሻል)</option>
                  <option value="delete">{t.roleDelete} (መረጃ የማጥፋት መብት)</option>
                  <option value="admin">{t.roleAdmin} (ሙሉ አስተዳዳሪ)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#181818] text-white/70 text-xs font-bold uppercase tracking-wider border border-white/10"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#00d0b0] hover:bg-[#00b894] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider"
                >
                  Create User
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121212] border border-white/10 p-6 sm:p-8 rounded-2xl max-w-md w-full space-y-5 shadow-2xl">
            
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Edit3 size={18} className="text-[#00d0b0]" />
                Edit Credentials & Access Level
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-white/40 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              
              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1 block">{t.username} *</label>
                <input
                  type="text"
                  required
                  value={editingUser.username}
                  onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1 block">{t.fullName}</label>
                <input
                  type="text"
                  value={editingUser.fullName}
                  onChange={e => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1 block">{t.password} *</label>
                <input
                  type="text"
                  required
                  value={editingUser.password || ''}
                  onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:border-[#00d0b0] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-1 block">{t.assignRole}</label>
                <select
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value as AccessLevel })}
                  className="w-full bg-[#181818] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
                >
                  <option value="view">{t.roleView} (መመልከት ብቻ)</option>
                  <option value="edit">{t.roleEdit} (ማስተካከል/ማሻሻል)</option>
                  <option value="delete">{t.roleDelete} (መረጃ የማጥፋት መብት)</option>
                  <option value="admin">{t.roleAdmin} (ሙሉ አስተዳዳሪ)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg bg-[#181818] text-white/70 text-xs font-bold uppercase tracking-wider border border-white/10"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#00d0b0] hover:bg-[#00b894] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider"
                >
                  Save Changes
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-[#181818] text-white/50 uppercase text-[10px] tracking-widest font-bold border-b border-white/10">
              <tr>
                <th className="px-4 py-3.5">{t.username}</th>
                <th className="px-4 py-3.5">{t.fullName}</th>
                <th className="px-4 py-3.5">{t.accessLevel}</th>
                <th className="px-4 py-3.5">{t.password}</th>
                <th className="px-4 py-3.5">Created</th>
                <th className="px-4 py-3.5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-medium">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5 font-bold font-mono text-white flex items-center gap-2">
                    <Users size={14} className="text-[#00d0b0]" />
                    {u.username}
                  </td>
                  <td className="px-4 py-3.5 text-white/90">
                    {u.fullName}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-[#00d0b0]/10 text-[#00d0b0] border border-[#00d0b0]/20' :
                      u.role === 'delete' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      u.role === 'edit' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-white/10 text-white/70 border border-white/10'
                    }`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#00d0b0] text-[11px]">
                    {u.password || '••••••••'}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-white/50 text-[11px]">
                    {u.createdAt}
                  </td>
                  <td className="px-4 py-3.5 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/80 transition-colors border border-white/10"
                      title="Edit Credentials"
                    >
                      <Edit3 size={14} />
                    </button>
                    {users.length > 1 && (
                      <button
                        onClick={() => onDeleteUser(u.id)}
                        className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
                        title={t.delete}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
