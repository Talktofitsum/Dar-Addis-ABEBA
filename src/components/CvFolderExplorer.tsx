import React, { useState } from 'react';
import { Employee, AttachmentFile } from '../types';
import { getEmployeeDriveSearchUrl } from '../utils/driveUtils';
import { 
  Folder, 
  FolderPlus, 
  FileText, 
  Upload, 
  Download, 
  ExternalLink, 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Paperclip, 
  FolderCheck, 
  Search, 
  CheckCircle2, 
  RefreshCw, 
  FileCheck,
  ShieldCheck
} from 'lucide-react';

interface CvFolderExplorerProps {
  employee: Employee;
  onUpdateEmployee: (updated: Employee) => void;
  onSyncDrive?: (emp: Employee) => void;
}

export const DEFAULT_SUBFOLDERS = [
  '1. Academic Degrees & Transcripts',
  '2. Professional Certificates & Licenses',
  '3. Work Experience & Service Letters',
  '4. Project References & Reports',
  '5. ID Documents, Passport & Work Permits'
];

export const CvFolderExplorer: React.FC<CvFolderExplorerProps> = ({
  employee,
  onUpdateEmployee,
  onSyncDrive
}) => {
  const [activeFolder, setActiveFolder] = useState<string | null>(DEFAULT_SUBFOLDERS[0]);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [newFolderNameInput, setNewFolderNameInput] = useState('');
  const [showUploadFormFolder, setShowUploadFormFolder] = useState<string | null>(null);

  // New File Form State
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('application/pdf');
  const [notice, setNotice] = useState('');

  const allSubfolders = [
    ...DEFAULT_SUBFOLDERS,
    ...(employee.customFolders || [])
  ];

  const rootFolderName = `Folder_[${employee.employeeId || 'ID'}]_${(employee.fullName || 'Staff').replace(/\s+/g, '_')}`;
  const driveSearchUrl = getEmployeeDriveSearchUrl(employee.fullName, employee.employeeId);

  // Helper to get files for a given folder
  const getFilesInFolder = (folderName: string) => {
    return employee.attachments.filter(att => {
      if (att.folderName) return att.folderName === folderName;
      // Default fallback for legacy attachments without folderName
      if (folderName === DEFAULT_SUBFOLDERS[0] && att.name.toLowerCase().includes('degree')) return true;
      if (folderName === DEFAULT_SUBFOLDERS[1] && (att.name.toLowerCase().includes('license') || att.name.toLowerCase().includes('cert'))) return true;
      if (folderName === DEFAULT_SUBFOLDERS[0] && !att.folderName) return true; // Default fallback to first folder
      return false;
    });
  };

  const handleAddCustomFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderNameInput.trim()) return;

    const trimmed = newFolderNameInput.trim();
    if (allSubfolders.includes(trimmed)) {
      alert('This subfolder already exists!');
      return;
    }

    const updatedCustomFolders = [...(employee.customFolders || []), trimmed];
    const updatedEmployee: Employee = {
      ...employee,
      customFolders: updatedCustomFolders,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onUpdateEmployee(updatedEmployee);
    setActiveFolder(trimmed);
    setNewFolderNameInput('');
    setShowAddFolderModal(false);
    setNotice(`📁 Created new subfolder: "${trimmed}"`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleUploadToFileFolder = (e: React.FormEvent, targetFolderName: string) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const newAtt: AttachmentFile = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newFileName.trim(),
      type: newFileType,
      size: Math.floor(Math.random() * 600 + 150) * 1024,
      uploadDate: new Date().toISOString().split('T')[0],
      driveUrl: driveSearchUrl,
      folderName: targetFolderName
    };

    const updatedEmployee: Employee = {
      ...employee,
      attachments: [newAtt, ...employee.attachments],
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onUpdateEmployee(updatedEmployee);
    if (onSyncDrive) onSyncDrive(updatedEmployee);

    setNotice(`✅ File "${newFileName}" uploaded & saved in subfolder "${targetFolderName}"!`);
    setNewFileName('');
    setShowUploadFormFolder(null);
    setTimeout(() => setNotice(''), 5000);
  };

  const handleDeleteFile = (fileId: string) => {
    if (!confirm('Are you sure you want to remove this attachment?')) return;
    const updatedAttachments = employee.attachments.filter(att => att.id !== fileId);
    const updatedEmployee: Employee = {
      ...employee,
      attachments: updatedAttachments,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    onUpdateEmployee(updatedEmployee);
    setNotice(`File removed from subfolder.`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleMoveFile = (fileId: string, newFolderName: string) => {
    const updatedAttachments = employee.attachments.map(att => {
      if (att.id === fileId) {
        return { ...att, folderName: newFolderName };
      }
      return att;
    });

    const updatedEmployee: Employee = {
      ...employee,
      attachments: updatedAttachments,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onUpdateEmployee(updatedEmployee);
    setNotice(`File moved to "${newFolderName}".`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleMigrateAndAutoOrganize = () => {
    // Migration logic: assign explicit subfolders to any unmapped attachment
    let migratedCount = 0;
    const updatedAttachments = employee.attachments.map(att => {
      if (!att.folderName) {
        migratedCount++;
        const lower = att.name.toLowerCase();
        let target = DEFAULT_SUBFOLDERS[0];
        if (lower.includes('cert') || lower.includes('license') || lower.includes('pmp')) {
          target = DEFAULT_SUBFOLDERS[1];
        } else if (lower.includes('exp') || lower.includes('service') || lower.includes('letter')) {
          target = DEFAULT_SUBFOLDERS[2];
        } else if (lower.includes('ref') || lower.includes('report') || lower.includes('project')) {
          target = DEFAULT_SUBFOLDERS[3];
        } else if (lower.includes('id') || lower.includes('passport') || lower.includes('permit')) {
          target = DEFAULT_SUBFOLDERS[4];
        }
        return { ...att, folderName: target };
      }
      return att;
    });

    const updatedEmployee: Employee = {
      ...employee,
      attachments: updatedAttachments,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onUpdateEmployee(updatedEmployee);
    if (onSyncDrive) onSyncDrive(updatedEmployee);
    setNotice(`🚀 Migrated & auto-categorized ${migratedCount} file(s) into subfolder tree!`);
    setTimeout(() => setNotice(''), 6000);
  };

  return (
    <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-5 shadow-xl">
      
      {/* Root Folder Banner */}
      <div className="bg-[#1A1A1A] border border-[#00d0b0]/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#00d0b0] uppercase tracking-wider">
            <FolderCheck size={16} /> CV Detailed Information Storage Space
          </div>
          <h3 className="text-sm font-extrabold text-white font-mono mt-1 flex items-center gap-2">
            <Folder className="text-[#00d0b0]" size={16} />
            {rootFolderName}
          </h3>
          <p className="text-[11px] text-white/50 mt-0.5">
            Dedicated Google Drive directory containing organized subfolders for degrees, certificates & service records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleMigrateAndAutoOrganize}
            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            title="Auto-organize uncategorized files into subfolders"
          >
            <RefreshCw size={13} className="text-[#00d0b0]" /> Auto-Organize Files
          </button>

          <a
            href={driveSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-lg bg-[#00d0b0] hover:bg-[#00b894] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#00d0b0]/10 transition-all"
          >
            <Search size={13} /> Open Folder in Google Drive
          </a>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}

      {/* Subfolder Navigation & Create Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Paperclip size={14} className="text-[#00d0b0]" /> Staff Directory Subfolders ({allSubfolders.length})
        </div>

        <button
          onClick={() => setShowAddFolderModal(true)}
          className="px-3 py-1.5 rounded-lg bg-[#00d0b0]/10 hover:bg-[#00d0b0]/20 text-[#00d0b0] border border-[#00d0b0]/30 font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors self-start sm:self-auto"
        >
          <FolderPlus size={14} /> Create Custom Subfolder
        </button>
      </div>

      {/* Modal for Creating Custom Subfolder */}
      {showAddFolderModal && (
        <form onSubmit={handleAddCustomFolder} className="p-4 bg-[#1A1A1A] border border-[#00d0b0]/40 rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <FolderPlus size={15} className="text-[#00d0b0]" /> Add New Subfolder inside {employee.fullName}'s Directory
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. 6. Continuing Education & Training"
              value={newFolderNameInput}
              onChange={e => setNewFolderNameInput(e.target.value)}
              className="flex-1 bg-[#121212] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#00d0b0] hover:bg-[#00b894] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider rounded-lg shrink-0"
            >
              Create Folder
            </button>
            <button
              type="button"
              onClick={() => setShowAddFolderModal(false)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-xs uppercase font-bold rounded-lg shrink-0"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Subfolder Accordions / File Tree */}
      <div className="space-y-3">
        {allSubfolders.map((fName, idx) => {
          const filesInThis = getFilesInFolder(fName);
          const isOpen = activeFolder === fName;

          return (
            <div 
              key={idx} 
              className={`border rounded-xl transition-all overflow-hidden ${
                isOpen ? 'bg-[#181818] border-[#00d0b0]/40 shadow-lg' : 'bg-[#121212] border-white/5 hover:border-white/20'
              }`}
            >
              {/* Folder Header Row */}
              <div 
                onClick={() => setActiveFolder(isOpen ? null : fName)}
                className="p-3.5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <div className={`p-2 rounded-lg ${isOpen ? 'bg-[#00d0b0]/20 text-[#00d0b0]' : 'bg-white/5 text-white/50'}`}>
                    <Folder size={18} />
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider truncate ${isOpen ? 'text-white' : 'text-white/80'}`}>
                      {fName}
                    </h4>
                    <span className="text-[10px] text-white/40 font-mono">
                      {filesInThis.length} file(s) stored • Synced to Drive
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFolder(fName);
                      setShowUploadFormFolder(showUploadFormFolder === fName ? null : fName);
                    }}
                    className="px-2.5 py-1 rounded bg-[#00d0b0]/10 hover:bg-[#00d0b0]/20 text-[#00d0b0] font-bold text-[10px] uppercase tracking-wider border border-[#00d0b0]/20 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add File
                  </button>

                  <div className="text-white/40">
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>
              </div>

              {/* Upload Form inside this specific folder */}
              {showUploadFormFolder === fName && (
                <form 
                  onSubmit={(e) => handleUploadToFileFolder(e, fName)} 
                  className="p-3.5 bg-[#0F0F0F] border-t border-b border-[#00d0b0]/20 space-y-3"
                >
                  <div className="text-xs font-bold text-[#00d0b0] uppercase tracking-wider flex items-center gap-1.5">
                    <Upload size={14} /> Upload New File into "{fName}"
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Master_Degree_Transcript_Official.pdf"
                      value={newFileName}
                      onChange={e => setNewFileName(e.target.value)}
                      className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
                    />
                    <select
                      value={newFileType}
                      onChange={e => setNewFileType(e.target.value)}
                      className="bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#00d0b0] focus:outline-none"
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
                      onClick={() => setShowUploadFormFolder(null)}
                      className="px-3 py-1.5 bg-white/5 text-white/60 text-[10px] font-bold uppercase rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#00d0b0] hover:bg-[#00b894] text-[#0A0A0A] text-[10px] font-bold uppercase rounded-lg flex items-center gap-1"
                    >
                      <Upload size={12} /> Save to Subfolder & Sync Drive
                    </button>
                  </div>
                </form>
              )}

              {/* Folder Content (Files List) */}
              {isOpen && (
                <div className="p-3.5 bg-[#0F0F0F] border-t border-white/5 space-y-2">
                  {filesInThis.length === 0 ? (
                    <div className="py-4 text-center text-white/30 text-xs italic">
                      No files stored in this subfolder yet. Click "+ Add File" above to attach a document.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filesInThis.map((att) => (
                        <div key={att.id} className="p-3 bg-[#141414] border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-colors">
                          <div className="flex items-center gap-3 truncate">
                            <div className="p-2 rounded-lg bg-white/5 text-[#00d0b0]">
                              <FileText size={18} />
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-white text-xs truncate flex items-center gap-2">
                                {att.name}
                                <span className="px-1.5 py-0.5 rounded text-[8px] uppercase font-bold bg-[#00d0b0]/10 text-[#00d0b0] border border-[#00d0b0]/20">
                                  Drive Synced
                                </span>
                              </div>
                              <div className="text-[10px] text-white/40 font-mono mt-0.5">
                                Uploaded: {att.uploadDate} • {(att.size / 1024).toFixed(0)} KB
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            {/* Move File Dropdown */}
                            <select
                              value={att.folderName || fName}
                              onChange={(e) => handleMoveFile(att.id, e.target.value)}
                              className="bg-[#181818] border border-white/10 text-white/70 text-[10px] rounded px-2 py-1 focus:border-[#00d0b0] focus:outline-none"
                              title="Move file to another subfolder"
                            >
                              {allSubfolders.map((sf, i) => (
                                <option key={i} value={sf}>
                                  Move to: {sf.substring(0, 20)}...
                                </option>
                              ))}
                            </select>

                            <a
                              href={att.driveUrl || driveSearchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded bg-[#00d0b0]/20 hover:bg-[#00d0b0]/30 text-[#00d0b0] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 border border-[#00d0b0]/30 transition-colors"
                            >
                              <ExternalLink size={10} /> View in Drive
                            </a>

                            <button
                              onClick={() => handleDeleteFile(att.id)}
                              className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              title="Delete File"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
