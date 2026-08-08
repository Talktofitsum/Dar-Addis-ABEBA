import React, { useState, useMemo } from 'react';
import { Employee, Language, User } from '../types';
import { getTranslation } from '../i18n/translations';
import { Search, Filter, FileSpreadsheet, Eye, Edit3, Trash2, Plus, Sparkles, HardDrive, CheckCircle2, AlertCircle, FileText, Download, Share2, Mail, Send, MessageCircle, ExternalLink } from 'lucide-react';
import { exportToExcel, exportToPdf, exportToWord } from '../utils/fileExportImport';

interface DatabaseViewProps {
  employees: Employee[];
  currentLang: Language;
  currentUser: User | null;
  onAddClick: () => void;
  onEditClick: (emp: Employee) => void;
  onDeleteClick: (id: string) => void;
  onViewClick: (emp: Employee) => void;
  onSyncDriveClick: (emp: Employee) => void;
  onOpenAiEnhance: (emp: Employee) => void;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  employees,
  currentLang,
  currentUser,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onViewClick,
  onSyncDriveClick,
  onOpenAiEnhance
}) => {
  const t = getTranslation(currentLang);

  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [shareMenuEmpId, setShareMenuEmpId] = useState<string | null>(null);

  // Extract unique regions and professions for dropdown filters
  const regions = useMemo(() => Array.from(new Set(employees.map(e => e.currentRegion).filter(Boolean))), [employees]);
  const professions = useMemo(() => Array.from(new Set(employees.map(e => e.professionRole).filter(Boolean))), [employees]);

  // Filtered list
  const filteredEmployees = useMemo(() => {
    const searchLower = (search || '').toLowerCase();
    return employees.filter(e => {
      const matchesSearch =
        (e.fullName || '').toLowerCase().includes(searchLower) ||
        (e.employeeId || '').toLowerCase().includes(searchLower) ||
        (e.title || '').toLowerCase().includes(searchLower) ||
        (e.currentProjectNo || '').toLowerCase().includes(searchLower) ||
        (e.qualifications || '').toLowerCase().includes(searchLower) ||
        (e.nationality || '').toLowerCase().includes(searchLower) ||
        (e.currentRegion || '').toLowerCase().includes(searchLower) ||
        (e.professionRole || '').toLowerCase().includes(searchLower) ||
        (e.email || '').toLowerCase().includes(searchLower);

      const matchesRegion = !selectedRegion || e.currentRegion === selectedRegion;
      const matchesProfession = !selectedProfession || e.professionRole === selectedProfession;
      const matchesStatus = !selectedStatus || e.cvStatus === selectedStatus;

      return matchesSearch && matchesRegion && matchesProfession && matchesStatus;
    });
  }, [employees, search, selectedRegion, selectedProfession, selectedStatus]);

  // Permissions checks
  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'edit' || currentUser?.role === 'delete';
  const canDelete = currentUser?.role === 'admin' || currentUser?.role === 'delete';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active_staff':
        return <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1 w-fit"><CheckCircle2 size={10}/> Active</span>;
      case 'new_applicant':
        return <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-[#00d0b0]/10 text-[#00d0b0] border border-[#00d0b0]/20 flex items-center gap-1 w-fit"><Plus size={10}/> Applicant</span>;
      case 'under_review':
        return <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 w-fit"><AlertCircle size={10}/> Review</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-white/5 text-white/50 border border-white/10 w-fit">Archived</span>;
    }
  };

  const generateShareText = (emp: Employee) => {
    return encodeURIComponent(
      `Dar Al-Handasah Ethiopia - Staff Profile:\n` +
      `ID: ${emp.employeeId}\n` +
      `Name: ${emp.fullName}\n` +
      `Title: ${emp.title}\n` +
      `Project: ${emp.currentProjectNo}\n` +
      `Degree: ${emp.qualifications} (${emp.degreeType})\n` +
      `Email: ${emp.email}\n` +
      `Nationality: ${emp.nationality} (${emp.nationalOrExpat})`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Action Bar */}
      <div className="bg-[#121212] border border-white/10 p-5 sm:p-6 rounded-2xl shadow-2xl space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-white/40" size={17} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#00d0b0] focus:ring-1 focus:ring-[#00d0b0] focus:outline-none transition-all text-xs sm:text-sm font-sans"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => exportToExcel(filteredEmployees)}
              className="px-3.5 py-2.5 rounded-lg bg-[#181818] hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:border-[#00d0b0]/50"
            >
              <FileSpreadsheet size={15} className="text-[#00d0b0]" />
              {t.exportExcel}
            </button>

            <button
              onClick={() => exportToWord(filteredEmployees[0] || employees[0])}
              className="px-3.5 py-2.5 rounded-lg bg-[#181818] hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:border-[#00d0b0]/50"
            >
              <FileText size={15} className="text-[#00d0b0]" />
              {t.exportWord}
            </button>

            {canEdit && (
              <button
                onClick={onAddClick}
                className="px-4 py-2.5 rounded-lg bg-[#00d0b0] hover:bg-[#00b894] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00d0b0]/10 transition-all transform hover:scale-[1.02]"
              >
                <Plus size={15} />
                {t.addEmployee}
              </button>
            )}
          </div>

        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
          
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1 flex items-center gap-1">
              <Filter size={11} /> {t.filterRegion}
            </label>
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
            >
              <option value="">{t.allRegions}</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1 flex items-center gap-1">
              <Filter size={11} /> {t.filterProfession}
            </label>
            <select
              value={selectedProfession}
              onChange={e => setSelectedProfession(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
            >
              <option value="">{t.allProfessions}</option>
              {professions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1 flex items-center gap-1">
              <Filter size={11} /> {t.filterStatus}
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
            >
              <option value="">{t.allStatuses}</option>
              <option value="active_staff">{t.statusActiveStaff}</option>
              <option value="new_applicant">{t.statusNewApplicant}</option>
              <option value="under_review">{t.statusUnderReview}</option>
              <option value="archived">{t.statusArchived}</option>
            </select>
          </div>

        </div>

      </div>

      {/* Staff Counter Header */}
      <div className="flex items-center justify-between text-xs font-medium text-white/50 px-1">
        <span className="uppercase tracking-widest text-[11px]">
          Staff Master Sheet: <strong className="text-[#00d0b0] font-mono text-sm">{filteredEmployees.length}</strong> / {employees.length} Records
        </span>
        {!canEdit && (
          <span className="text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
            {t.roleView} Mode — View, Share & Export Enabled
          </span>
        )}
      </div>

      {/* Standard Dar Excel Grid Table */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-white/80 text-xs">
            
            <thead className="bg-[#181818] text-[#00d0b0] uppercase text-[10px] tracking-widest border-b border-white/10 font-bold whitespace-nowrap">
              <tr>
                <th className="px-4 py-3.5 border-r border-white/10">{t.darOffice}</th>
                <th className="px-4 py-3.5 border-r border-white/10">{t.employeeId}</th>
                <th className="px-4 py-3.5 border-r border-white/10">{t.fullName}</th>
                <th className="px-4 py-3.5 border-r border-white/10">{t.title}</th>
                <th className="px-4 py-3.5 border-r border-white/10">{t.currentProjectNo}</th>
                <th className="px-4 py-3.5 border-r border-white/10">{t.qualifications}</th>
                <th className="px-4 py-3.5 border-r border-white/10">{t.degreeType}</th>
                <th className="px-4 py-3.5 border-r border-white/10">{t.languages}</th>
                <th className="px-4 py-3.5 border-r border-white/10">{t.nationality}</th>
                <th className="px-4 py-3.5 border-r border-white/10">{t.dob}</th>
                <th className="px-4 py-3.5 border-r border-white/10">{t.graduationYear}</th>
                <th className="px-4 py-3.5 border-r border-white/10">{t.email}</th>
                <th className="px-4 py-3.5 border-r border-white/10">{t.nationalOrExpat}</th>
                <th className="px-4 py-3.5 text-center">{t.actions}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10 font-medium whitespace-nowrap">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={14} className="text-center py-12 text-white/40 italic">
                    No staff or applicant records matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-white/[0.03] transition-colors group">
                    
                    {/* Dar Office */}
                    <td className="px-4 py-3.5 font-bold text-white/70 border-r border-white/5 uppercase font-mono text-[11px]">
                      {emp.darOffice || 'ETHIOPIA'}
                    </td>

                    {/* Dar ID No. */}
                    <td className="px-4 py-3.5 font-mono text-[#00d0b0] border-r border-white/5 text-[11px] font-bold">
                      {emp.employeeId}
                    </td>

                    {/* Names */}
                    <td className="px-4 py-3.5 border-r border-white/5 cursor-pointer" onClick={() => onViewClick(emp)}>
                      <div className="font-bold text-white group-hover:text-[#00d0b0] transition-colors flex items-center gap-1.5">
                        {emp.fullName}
                        <ExternalLink size={10} className="text-[#00d0b0] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[9px] text-white/40 flex items-center gap-1">
                        <span>{emp.cvStatus === 'active_staff' ? 'Active Staff' : 'Applicant'}</span>
                        <span>•</span>
                        <span className="text-[#00d0b0]/80 font-mono hover:underline">View Folder & Detail</span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3.5 font-medium text-white/90 border-r border-white/5">
                      {emp.title}
                    </td>

                    {/* Current Project No. */}
                    <td className="px-4 py-3.5 font-mono text-xs text-green-400 border-r border-white/5">
                      {emp.currentProjectNo || 'General'}
                    </td>

                    {/* Qualifications / Degree */}
                    <td className="px-4 py-3.5 text-white/80 border-r border-white/5 max-w-[200px] truncate" title={emp.qualifications}>
                      {emp.qualifications}
                    </td>

                    {/* Degree Type */}
                    <td className="px-4 py-3.5 text-white/70 border-r border-white/5 max-w-[180px] truncate" title={emp.degreeType}>
                      {emp.degreeType || emp.educationLevel}
                    </td>

                    {/* Languages */}
                    <td className="px-4 py-3.5 text-white/70 border-r border-white/5 text-[11px]">
                      {Array.isArray(emp.languages) ? emp.languages.join(', ') : emp.languages}
                    </td>

                    {/* Nationality */}
                    <td className="px-4 py-3.5 text-white/80 border-r border-white/5">
                      {emp.nationality || 'Ethiopian'}
                    </td>

                    {/* Birth Date */}
                    <td className="px-4 py-3.5 font-mono text-white/60 border-r border-white/5 text-[11px]">
                      {emp.dob || '—'}
                    </td>

                    {/* Bachelor Grad Year */}
                    <td className="px-4 py-3.5 font-mono text-white/80 border-r border-white/5 text-[11px]">
                      {emp.graduationYear || '—'}
                    </td>

                    {/* E-mail */}
                    <td className="px-4 py-3.5 font-mono text-white/60 border-r border-white/5 text-[11px]">
                      {emp.email}
                    </td>

                    {/* National / Expat */}
                    <td className="px-4 py-3.5 border-r border-white/5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        emp.nationalOrExpat === 'Expat' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {emp.nationalOrExpat || 'National'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-center relative">
                      <div className="flex items-center justify-center gap-1">
                        
                        {/* View Details Profile */}
                        <button
                          onClick={() => onViewClick(emp)}
                          className="px-2 py-1 rounded bg-[#00d0b0]/20 hover:bg-[#00d0b0]/30 text-[#00d0b0] transition-colors border border-[#00d0b0]/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                          title={t.viewDetails}
                        >
                          <Eye size={12} />
                          <span>View Detail</span>
                        </button>

                        {/* Share Menu Dropdown Toggle */}
                        <div className="relative">
                          <button
                            onClick={() => setShareMenuEmpId(shareMenuEmpId === emp.id ? null : emp.id)}
                            className="p-1.5 rounded bg-[#00d0b0]/10 hover:bg-[#00d0b0]/20 text-[#00d0b0] transition-colors border border-[#00d0b0]/20"
                            title="Share Profile via Email, WhatsApp, Telegram"
                          >
                            <Share2 size={13} />
                          </button>

                          {shareMenuEmpId === emp.id && (
                            <div className="absolute right-0 mt-1 z-30 w-44 bg-[#181818] border border-white/20 rounded-xl p-2 shadow-2xl text-left space-y-1">
                              <a
                                href={`mailto:?subject=Dar-Et%20CV%20Profile%20-${encodeURIComponent(emp.fullName)}&body=${generateShareText(emp)}`}
                                onClick={() => setShareMenuEmpId(null)}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-white/10 text-[11px] font-bold text-white transition-colors"
                              >
                                <Mail size={12} className="text-[#00d0b0]" /> Email
                              </a>
                              <a
                                href={`https://api.whatsapp.com/send?text=${generateShareText(emp)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShareMenuEmpId(null)}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-white/10 text-[11px] font-bold text-green-400 transition-colors"
                              >
                                <MessageCircle size={12} /> WhatsApp
                              </a>
                              <a
                                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${generateShareText(emp)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShareMenuEmpId(null)}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-white/10 text-[11px] font-bold text-blue-400 transition-colors"
                              >
                                <Send size={12} /> Telegram
                              </a>
                            </div>
                          )}
                        </div>

                        {/* AI Enhancer */}
                        <button
                          onClick={() => onOpenAiEnhance(emp)}
                          className="p-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors border border-amber-500/20"
                          title={t.aiEnhanceBtn}
                        >
                          <Sparkles size={13} />
                        </button>

                        {/* Export PDF */}
                        <button
                          onClick={() => exportToPdf(emp)}
                          className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
                          title="Export Official PDF"
                        >
                          <Download size={13} />
                        </button>

                        {/* Sync Drive */}
                        <button
                          onClick={() => onSyncDriveClick(emp)}
                          className="p-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors border border-blue-500/20"
                          title={t.syncDriveBtn}
                        >
                          <HardDrive size={13} />
                        </button>

                        {/* Edit Button */}
                        {canEdit && (
                          <button
                            onClick={() => onEditClick(emp)}
                            className="p-1.5 rounded bg-[#00d0b0]/10 hover:bg-[#00d0b0]/20 text-[#00d0b0] transition-colors border border-[#00d0b0]/20"
                            title={t.edit}
                          >
                            <Edit3 size={13} />
                          </button>
                        )}

                        {/* Delete Button */}
                        {canDelete && (
                          <button
                            onClick={() => onDeleteClick(emp.id)}
                            className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
                            title={t.delete}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
