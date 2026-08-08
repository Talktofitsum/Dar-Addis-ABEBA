import React, { useState } from 'react';
import { Employee, Language, AttachmentFile } from '../types';
import { getTranslation } from '../i18n/translations';
import { getEmployeeDriveSearchUrl, MASTER_DRIVE_FOLDER_URL } from '../utils/driveUtils';
import { CvFolderExplorer } from './CvFolderExplorer';
import { Download, FileText, FileSpreadsheet, HardDrive, Briefcase, CheckCircle2, X, ExternalLink, Share2, Mail, Send, MessageCircle, Folder, Paperclip, Upload, Plus, Search } from 'lucide-react';
import { exportToPdf, exportToWord, exportToExcel } from '../utils/fileExportImport';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  currentLang: Language;
  onClose: () => void;
  onSyncDrive: (emp: Employee) => void;
  onAddAttachment?: (empId: string, file: AttachmentFile) => void;
  onUpdateEmployee?: (updated: Employee) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee: initialEmployee,
  currentLang,
  onClose,
  onSyncDrive,
  onAddAttachment,
  onUpdateEmployee
}) => {
  if (!initialEmployee) return null;
  const t = getTranslation(currentLang);

  const [employee, setEmployee] = useState<Employee>(initialEmployee);
  const [activeViewMode, setActiveViewMode] = useState<'details' | 'folders'>('details');

  const handleLocalUpdate = (updated: Employee) => {
    setEmployee(updated);
    if (onUpdateEmployee) {
      onUpdateEmployee(updated);
    }
  };

  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('application/pdf');
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');

  const generateShareText = () => {
    return encodeURIComponent(
      `Dar Al-Handasah Ethiopia - Staff Profile:\n` +
      `ID: ${employee.employeeId}\n` +
      `Name: ${employee.fullName}\n` +
      `Title: ${employee.title}\n` +
      `Project: ${employee.currentProjectNo}\n` +
      `Qualifications: ${employee.qualifications} (${employee.degreeType})\n` +
      `Email: ${employee.email}\n` +
      `Drive Folder: ${employee.driveFolderUrl || MASTER_DRIVE_FOLDER_URL}`
    );
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName || !employee) return;

    const targetFolderDriveUrl = getEmployeeDriveSearchUrl(employee.fullName, employee.employeeId);

    const newAtt: AttachmentFile = {
      id: `att-${Date.now()}`,
      name: newFileName,
      type: newFileType,
      size: Math.floor(Math.random() * 500 + 200) * 1024,
      uploadDate: new Date().toISOString().split('T')[0],
      driveUrl: targetFolderDriveUrl
    };

    if (onAddAttachment) {
      onAddAttachment(employee.id, newAtt);
    } else {
      employee.attachments.unshift(newAtt);
    }

    // Trigger drive sync
    if (onSyncDrive) {
      onSyncDrive(employee);
    }

    setUploadNotice(`✅ Additional certificate/degree '${newFileName}' uploaded & synced to Google Drive folder for ${employee.fullName}!`);
    setNewFileName('');
    setShowFileUploader(false);
    setTimeout(() => setUploadNotice(''), 6000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-4xl w-full my-8 space-y-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header Bar matching dar.com */}
        <div className="bg-[#181818] p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black text-white lowercase tracking-tight">dar</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d0b0]"></span>
              </div>
              <span className="text-xs text-[#00d0b0] font-mono font-bold">[{employee.employeeId}]</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#00d0b0]/10 text-[#00d0b0] border border-[#00d0b0]/20">
                {employee.darOffice || 'ETHIOPIA AREA OFFICE'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{employee.fullName}</h2>
            <div className="text-xs text-white/70 font-medium flex flex-wrap items-center gap-3 mt-1">
              <span className="text-[#00d0b0] font-bold flex items-center gap-1"><Briefcase size={13} /> {employee.title}</span>
              <span>• Project: <strong className="text-green-400 font-mono">{employee.currentProjectNo}</strong></span>
              <span>• Location: <strong className="text-white">📍 {employee.currentRegion}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* View Mode Switcher */}
            <div className="bg-[#121212] p-1 rounded-xl border border-white/10 flex items-center gap-1">
              <button
                onClick={() => setActiveViewMode('details')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeViewMode === 'details'
                    ? 'bg-[#00d0b0] text-[#0A0A0A] shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <FileSpreadsheet size={13} /> Credentials
              </button>
              <button
                onClick={() => setActiveViewMode('folders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeViewMode === 'folders'
                    ? 'bg-[#00d0b0] text-[#0A0A0A] shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Folder size={13} /> Subfolders Space
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#121212] hover:bg-white/10 text-white/50 hover:text-white border border-white/10"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-white/80">
          
          {uploadNotice && (
            <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 size={16} /> {uploadNotice}
            </div>
          )}

          {activeViewMode === 'folders' ? (
            <CvFolderExplorer
              employee={employee}
              onUpdateEmployee={handleLocalUpdate}
              onSyncDrive={onSyncDrive}
            />
          ) : (
            <>

          {/* Standard Excel Master Record Fields */}
          <div className="bg-[#181818] border border-white/10 p-4 rounded-xl space-y-3">
            <h3 className="text-[11px] font-bold text-[#00d0b0] uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet size={14} /> Standard Master Record Credentials (Excel Sheet View)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-white/90">
              <div>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block">Dar Office</span>
                <strong className="text-white font-mono">{employee.darOffice || 'ETHIOPIA'}</strong>
              </div>
              <div>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block">Dar ID No.</span>
                <strong className="text-[#00d0b0] font-mono">{employee.employeeId}</strong>
              </div>
              <div>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block">Title / Designation</span>
                <strong className="text-white line-clamp-1">{employee.title}</strong>
              </div>
              <div>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block">Current Project No.</span>
                <strong className="text-green-400 font-mono">{employee.currentProjectNo}</strong>
              </div>
              <div>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block">Qualifications / Degree</span>
                <strong className="text-white line-clamp-1">{employee.qualifications}</strong>
              </div>
              <div>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block">Degree Type (MSc/BSc)</span>
                <strong className="text-white line-clamp-1">{employee.degreeType || employee.educationLevel}</strong>
              </div>
              <div>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block">Languages</span>
                <strong className="text-white line-clamp-1">{Array.isArray(employee.languages) ? employee.languages.join(', ') : employee.languages}</strong>
              </div>
              <div>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block">Nationality & Category</span>
                <strong className="text-white">{employee.nationality} ({employee.nationalOrExpat || 'National'})</strong>
              </div>
              <div>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block">Birth Date</span>
                <strong className="text-white font-mono">{employee.dob || '—'}</strong>
              </div>
              <div>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block">Bachelor Grad Year</span>
                <strong className="text-white font-mono">{employee.graduationYear}</strong>
              </div>
              <div>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block">E-mail</span>
                <strong className="text-white font-mono text-[11px]">{employee.email}</strong>
              </div>
              <div>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider block">Total Experience</span>
                <strong className="text-[#00d0b0] font-mono">{employee.experienceYears} Years</strong>
              </div>
            </div>
          </div>

          {/* Individual Google Drive Subfolder Section */}
          <div className="bg-[#181818] border border-white/10 p-4 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Folder size={15} className="text-[#00d0b0]" /> Individual Google Drive Folder
                </h3>
                <p className="text-[10px] text-white/50 mt-0.5">
                  Folder Name: <span className="font-mono text-[#00d0b0] font-bold">Folder_[{employee.employeeId || 'ID'}]_{(employee.fullName || 'Staff').replace(/\s+/g, '_')}</span>
                </p>
                <p className="text-[9px] text-[#00d0b0]/80 mt-0.5 flex items-center gap-1">
                  <Search size={10} /> Clicking opens Google Drive & highlights strictly <strong>"{employee.fullName}"</strong>
                </p>
              </div>
              <a
                href={getEmployeeDriveSearchUrl(employee.fullName, employee.employeeId)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-[#00d0b0] hover:bg-[#00b894] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#00d0b0]/10 transition-all shrink-0"
              >
                <Search size={13} /> Open & Highlight "{employee.fullName}" in Drive
              </a>
            </div>

            {/* Attachments list */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider flex items-center gap-1">
                  <Paperclip size={13} className="text-[#00d0b0]" /> Attached Degrees & Certificates ({employee.attachments.length})
                </span>
                <button
                  onClick={() => setShowFileUploader(!showFileUploader)}
                  className="text-[10px] font-bold text-[#00d0b0] hover:underline flex items-center gap-1 uppercase tracking-wider"
                >
                  <Plus size={12} /> Attach New File (PDF/Word/Excel/Image)
                </button>
              </div>

              {/* Attach File Form */}
              {showFileUploader && (
                <form onSubmit={handleFileUpload} className="p-3 bg-[#121212] border border-[#00d0b0]/30 rounded-lg space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="File Name (e.g. BSc_Degree_Certificate.pdf)"
                      value={newFileName}
                      onChange={e => setNewFileName(e.target.value)}
                      className="bg-[#181818] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
                    />
                    <select
                      value={newFileType}
                      onChange={e => setNewFileType(e.target.value)}
                      className="bg-[#181818] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
                    >
                      <option value="application/pdf">PDF Document (.pdf)</option>
                      <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word Document (.docx)</option>
                      <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel Sheet (.xlsx)</option>
                      <option value="image/jpeg">JPEG Image (.jpg)</option>
                      <option value="image/png">PNG Image (.png)</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFileUploader(false)}
                      className="px-3 py-1 rounded bg-[#181818] text-white/60 text-[10px] uppercase font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 rounded bg-[#00d0b0] hover:bg-[#00b894] text-[#0A0A0A] text-[10px] uppercase font-bold flex items-center gap-1"
                    >
                      <Upload size={12} /> Upload & Sync to Drive
                    </button>
                  </div>
                </form>
              )}

              {/* Attachments List */}
              {employee.attachments.length === 0 ? (
                <p className="text-[11px] text-white/40 italic py-1">No separate degree or certificate attachments uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {employee.attachments.map(att => (
                    <div key={att.id} className="p-2.5 bg-[#121212] border border-white/10 rounded-lg flex items-center justify-between">
                      <div className="truncate mr-2">
                        <div className="font-bold text-white text-[11px] truncate">{att.name}</div>
                        <div className="text-[9px] text-white/40 font-mono">{att.uploadDate} • {(att.size / 1024).toFixed(0)} KB</div>
                      </div>
                      <a
                        href={att.driveUrl || getEmployeeDriveSearchUrl(employee.fullName, employee.employeeId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-white/5 hover:bg-[#00d0b0]/20 text-[#00d0b0] font-bold text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1"
                      >
                        View <ExternalLink size={10} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Executive Summary */}
          {employee.summary && (
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#00d0b0] uppercase tracking-[0.15em] text-[11px]">{t.summary}</h3>
              <p className="p-3.5 bg-[#181818] border border-white/10 rounded-xl leading-relaxed text-white/80">
                {employee.summary}
              </p>
            </div>
          )}

          {/* Key Qualifications */}
          {employee.keyQualifications && employee.keyQualifications.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#00d0b0] uppercase tracking-[0.15em] text-[11px]">{t.keyQualifications}</h3>
              <ul className="space-y-1.5 pl-1">
                {employee.keyQualifications.map((q, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-white/90">
                    <CheckCircle2 size={13} className="text-[#00d0b0] shrink-0" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Project History */}
          {employee.projectExperience && employee.projectExperience.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="font-bold text-[#00d0b0] uppercase tracking-[0.15em] text-[11px]">{t.projectHistory}</h3>
              <div className="space-y-2">
                {employee.projectExperience.map((p, idx) => (
                  <div key={idx} className="p-3.5 bg-[#181818] border border-white/10 rounded-xl space-y-1">
                    <div className="flex justify-between items-baseline font-bold text-white uppercase tracking-wider">
                      <span>{p.projectName}</span>
                      <span className="text-[#00d0b0] text-[10px] font-mono">{p.duration}</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/50">
                      Client: {p.client} | Location: {p.location} | Role: {p.role}
                    </div>
                    <p className="text-white/80 pt-1 leading-relaxed">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          </>
          )}

        </div>

        {/* Footer Actions: Share & Download */}
        <div className="p-4 bg-[#181818] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Share Links */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
              <Share2 size={12} /> Share:
            </span>
            <a
              href={`mailto:?subject=Dar-Et%20CV%20Profile%20-${encodeURIComponent(employee.fullName)}&body=${generateShareText()}`}
              className="p-2 rounded bg-white/5 hover:bg-white/10 text-white transition-colors"
              title="Share via Email"
            >
              <Mail size={13} />
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${generateShareText()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
              title="Share via WhatsApp"
            >
              <MessageCircle size={13} />
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${generateShareText()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
              title="Share via Telegram"
            >
              <Send size={13} />
            </a>
          </div>

          {/* Export & Close Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToPdf(employee)}
              className="px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-red-500/20"
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={() => exportToWord(employee)}
              className="px-3.5 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-blue-500/20"
            >
              <FileText size={13} /> Word
            </button>
            <button
              onClick={() => exportToExcel([employee])}
              className="px-3.5 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border border-green-500/20"
            >
              <FileSpreadsheet size={13} /> Excel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#121212] hover:bg-white/10 text-white/70 font-bold text-xs uppercase tracking-wider border border-white/10"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
