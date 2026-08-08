import React, { useState } from 'react';
import { DriveSyncLog, Language, Employee } from '../types';
import { getTranslation } from '../i18n/translations';
import { getEmployeeDriveSearchUrl, MASTER_DRIVE_FOLDER_URL } from '../utils/driveUtils';
import { HardDrive, RefreshCw, FolderCheck, FileSpreadsheet, ExternalLink, ShieldCheck, CheckCircle2, Folder, FileText, Upload, Search } from 'lucide-react';

interface DriveSyncViewProps {
  logs: DriveSyncLog[];
  employees: Employee[];
  currentLang: Language;
  lastSyncTime: string;
  onManualSync: () => void;
}

export const DriveSyncView: React.FC<DriveSyncViewProps> = ({
  logs,
  employees,
  currentLang,
  lastSyncTime,
  onManualSync
}) => {
  const t = getTranslation(currentLang);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedMsg, setSyncedMsg] = useState('');

  const handleSyncClick = () => {
    setIsSyncing(true);
    setSyncedMsg('');
    setTimeout(() => {
      onManualSync();
      setIsSyncing(false);
      setSyncedMsg('Google Drive master Excel database and individual employee folders synchronized successfully!');
      setTimeout(() => setSyncedMsg(''), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#121212] border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-[#00d0b0]/10 text-[#00d0b0] border border-[#00d0b0]/20 shrink-0 mt-1">
            <HardDrive size={32} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#00d0b0] uppercase tracking-[0.2em]">
                Active Google Drive Connection
              </span>
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-mono font-bold uppercase">
                CONNECTED
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-light text-white">
              {t.driveTitle}
            </h2>
            <p className="text-xs text-white/60 font-mono">
              Folder ID: <strong className="text-white">10idSQEP8yefEYlT5qqF0LcsyCfjXEvMH</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <a
              href={MASTER_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-lg bg-[#181818] hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-white/10 transition-all hover:border-[#00d0b0]/50"
            >
              <ExternalLink size={15} className="text-[#00d0b0]" />
              Open Google Drive Folder
            </a>

            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="px-5 py-3 rounded-lg bg-[#00d0b0] hover:bg-[#00b894] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00d0b0]/10 transition-all transform hover:scale-[1.02] disabled:opacity-50"
            >
              <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing Drive Database...' : t.syncNow}
            </button>
          </div>

          <span className="text-[10px] uppercase tracking-wider text-white/40">
            {t.lastSync} <strong className="text-white font-mono">{lastSyncTime}</strong>
          </span>
        </div>

      </div>

      {syncedMsg && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 size={16} /> {syncedMsg}
        </div>
      )}

      {/* Cloud Architecture Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Master Excel File Card */}
        <div className="bg-[#121212] border border-white/10 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#00d0b0] uppercase tracking-widest flex items-center gap-1.5">
              <FileSpreadsheet size={16} /> Single Master Excel Sheet
            </span>
            <span className="px-2 py-0.5 rounded bg-[#00d0b0]/10 text-[#00d0b0] text-[10px] font-bold uppercase">Auto-Synced</span>
          </div>
          <div className="text-sm font-bold text-white font-mono">
            Dar_Ethiopia_Staff_Master.xlsx
          </div>
          <p className="text-xs text-white/60">
            Contains structured employee details for all {employees.length} staff members (Dar Office, ID No, Title, Qualifications, Languages, Nationality, Email, etc.).
          </p>
        </div>

        {/* Individual Employee Credentials Folders Card */}
        <div className="bg-[#121212] border border-white/10 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#00d0b0] uppercase tracking-widest flex items-center gap-1.5">
              <FolderCheck size={16} /> Individual Employee Folders
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase">{employees.length} Folders</span>
          </div>
          <div className="text-sm font-bold text-white font-mono">
            /Drive/[ID]_[Employee_Name]/
          </div>
          <p className="text-xs text-white/60">
            Every employee has a dedicated subfolder on Google Drive holding unlisted attachments (Degrees, Experience Certificates, CVs) displayed under View Details.
          </p>
        </div>

      </div>

      {/* Individual Employee Folders List */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Folder size={16} className="text-[#00d0b0]" />
            Individual Google Drive Staff Folders ({employees.length})
          </h3>
          <a
            href={MASTER_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#00d0b0] hover:underline flex items-center gap-1 font-semibold"
          >
            Access All Folders on Drive <ExternalLink size={12} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {employees.map(emp => (
            <div key={emp.id} className="p-3.5 bg-[#181818] border border-white/10 rounded-xl flex items-center justify-between hover:border-[#00d0b0]/40 transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                <Folder size={20} className="text-[#00d0b0] shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">
                    [{emp.employeeId}] {emp.fullName}
                  </div>
                  <div className="text-[10px] text-white/40 truncate font-mono">
                    {(emp.attachments?.length || 0)} files • {emp.professionRole || emp.title || 'Staff'}
                  </div>
                </div>
              </div>
              <a
                href={getEmployeeDriveSearchUrl(emp.fullName, emp.employeeId)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded bg-white/5 hover:bg-[#00d0b0]/20 text-[#00d0b0] transition-colors shrink-0 ml-2 flex items-center gap-1 font-bold text-[10px] uppercase"
                title={`Open & Highlight "${emp.fullName}" in Google Drive`}
              >
                <Search size={12} />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Drive Sync Logs */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText size={16} className="text-[#00d0b0]" />
          {t.driveLogs}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-[#181818] text-white/50 uppercase text-[10px] tracking-widest font-bold border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Target File / Folder</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-mono text-[11px]">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white/50">{log.timestamp}</td>
                  <td className="px-4 py-3 text-white font-bold">{log.fileName}</td>
                  <td className="px-4 py-3 uppercase text-[10px] text-white/60">{log.action}</td>
                  <td className="px-4 py-3 text-white/50">{log.fileSize}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-bold uppercase">
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={log.driveUrl || MASTER_DRIVE_FOLDER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00d0b0] hover:underline text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
                    >
                      View <ExternalLink size={10} />
                    </a>
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
