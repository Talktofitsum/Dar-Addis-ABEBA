import React, { useState } from 'react';
import { Employee, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { DataMigrationModal } from './DataMigrationModal';
import { FileSpreadsheet, FileText, Download, UploadCloud, CheckCircle2, AlertCircle, FileCheck, Database, FolderCheck, RefreshCw, HardDrive } from 'lucide-react';
import { importFromExcel, importFromWord, exportToExcel } from '../utils/fileExportImport';

interface ImportExportViewProps {
  currentLang: Language;
  onEmployeesImported: (newEmployees: Employee[]) => void;
  employees: Employee[];
  onUpdateEmployees?: (migrated: Employee[]) => void;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({
  currentLang,
  onEmployeesImported,
  employees,
  onUpdateEmployees
}) => {
  const t = getTranslation(currentLang);

  const [isHovered, setIsHovered] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importedPreview, setImportedPreview] = useState<Partial<Employee>[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  const handleFileUpload = async (file: File) => {
    setImporting(true);
    setSuccessMessage('');
    try {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        const parsed = await importFromExcel(file);
        setImportedPreview(parsed);
      } else if (file.name.endsWith('.docx')) {
        const parsed = await importFromWord(file);
        setImportedPreview([parsed]);
      } else {
        alert('Please upload an Excel (.xlsx, .csv) or Word (.docx) file.');
      }
    } catch (error) {
      console.error(error);
      alert('Error parsing uploaded file. Please verify format.');
    } finally {
      setImporting(false);
    }
  };

  const handleCommitImport = () => {
    if (importedPreview.length === 0) return;

    const formatted: Employee[] = importedPreview.map((p, i) => ({
      id: `emp-imp-${Date.now()}-${i}`,
      employeeId: p.employeeId || `DAR-IMP-${100 + i}`,
      fullName: p.fullName || 'Imported Employee',
      gender: p.gender || 'Male',
      phone: p.phone || '+251 900 000 000',
      email: p.email || 'imported@dar-example.com',
      currentRegion: p.currentRegion || 'Addis Ababa',
      professionRole: p.professionRole || 'Civil Engineer',
      experienceYears: p.experienceYears || 5,
      educationLevel: p.educationLevel || 'BSc in Civil Engineering',
      university: p.university || 'Addis Ababa University',
      graduationYear: p.graduationYear || 2020,
      professionalLicenseNo: p.professionalLicenseNo || 'PE-PENDING',
      cvStatus: p.cvStatus || 'new_applicant',
      summary: p.summary || 'Imported employee profile.',
      keyQualifications: p.keyQualifications || ['Construction Supervision'],
      projectExperience: p.projectExperience || [],
      skills: p.skills || ['Site Management'],
      languages: p.languages || ['Amharic', 'English'],
      attachments: [],
      lastUpdated: new Date().toISOString().split('T')[0]
    }));

    onEmployeesImported(formatted);
    setSuccessMessage(`Successfully imported ${formatted.length} employee record(s) into database!`);
    setImportedPreview([]);
  };

  return (
    <div className="space-y-8">
      
      {/* Dedicated Data Migration Banner */}
      <div className="bg-[#181818] border border-[#00d0b0]/30 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-[#00d0b0]/10 pointer-events-none">
          <Database size={160} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#00d0b0]/20 text-[#00d0b0] font-mono font-bold text-[10px] uppercase border border-[#00d0b0]/30">
                Data Migration Suite V3
              </span>
              <span className="text-xs text-white/50 font-mono">Master Drive ID: 10idSQEP8yefEYlT...</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Database className="text-[#00d0b0]" size={24} />
              Full Database & Google Drive Directory Migration
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Migrate, restructure, and backup CV detailed information into standardized Google Drive named folder structures with subfolders for degrees, licenses, service letters, project references, and passports.
            </p>
          </div>

          <button
            onClick={() => setShowMigrationModal(true)}
            className="px-6 py-3.5 rounded-xl bg-[#00d0b0] hover:bg-[#00b894] text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#00d0b0]/20 transition-all shrink-0 hover:scale-105"
          >
            <FolderCheck size={18} /> Open Data Migration Wizard
          </button>
        </div>
      </div>

      {showMigrationModal && (
        <DataMigrationModal
          employees={employees}
          onUpdateEmployees={(migrated) => {
            if (onUpdateEmployees) onUpdateEmployees(migrated);
            else onEmployeesImported(migrated);
          }}
          onClose={() => setShowMigrationModal(false)}
        />
      )}
      
      {/* Import Section */}
      <div className="bg-[#141414] border border-white/5 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
        
        <div>
          <h2 className="text-xl font-light text-white flex items-center gap-2">
            <UploadCloud className="text-[#C5A059]" size={22} />
            {t.importTitle}
          </h2>
          <p className="text-xs text-white/50 mt-1">{t.importDesc}</p>
        </div>

        {/* Drag & Drop File Target */}
        <div
          onDragOver={e => { e.preventDefault(); setIsHovered(true); }}
          onDragLeave={() => setIsHovered(false)}
          onDrop={e => {
            e.preventDefault();
            setIsHovered(false);
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            isHovered ? 'border-[#C5A059] bg-[#C5A059]/10' : 'border-white/10 bg-[#0F0F0F] hover:border-white/20'
          }`}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xlsx, .xls, .csv, .docx';
            input.onchange = (e: any) => {
              if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
            };
            input.click();
          }}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 text-[#C5A059]">
              <UploadCloud size={36} />
            </div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">{t.dragDropFile}</div>
            <div className="text-xs text-white/40 font-mono">{t.supportedFormats}</div>
          </div>
        </div>

        {/* Success Message Banner */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={18} /> {successMessage}
          </div>
        )}

        {/* Preview of Parsed File Data before committing */}
        {importedPreview.length > 0 && (
          <div className="p-5 bg-[#0F0F0F] border border-white/10 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="text-[#C5A059]" size={16} />
                Parsed Records Preview ({importedPreview.length} item(s)):
              </span>

              <button
                onClick={handleCommitImport}
                className="px-4 py-2 rounded-lg bg-[#C5A059] hover:bg-[#d8b26a] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
              >
                <CheckCircle2 size={15} /> Save Records to Database
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {importedPreview.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#141414] border border-white/5 rounded-lg text-xs flex justify-between items-center text-white/70">
                  <div>
                    <strong className="text-white">{item.fullName}</strong> ({item.professionRole})
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">{item.currentRegion} • {item.experienceYears} Years Exp</div>
                  </div>
                  <span className="text-[10px] bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Export Center */}
      <div className="bg-[#141414] border border-white/5 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
        <div>
          <h2 className="text-xl font-light text-white flex items-center gap-2">
            <Download className="text-[#C5A059]" size={22} />
            Multiple Format Export Center
          </h2>
          <p className="text-xs text-white/50 mt-1">{t.exportDesc}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Excel Export Card */}
          <div className="p-5 bg-[#0F0F0F] border border-white/5 rounded-xl space-y-3 hover:border-[#C5A059]/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Full Excel Database</h3>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Multi-tab .xlsx workbook</span>
              </div>
            </div>
            <button
              onClick={() => exportToExcel(employees)}
              className="w-full py-2.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 text-xs font-bold uppercase tracking-wider border border-green-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={14} /> Download Excel (.xlsx)
            </button>
          </div>

          {/* PDF Summary Export Card */}
          <div className="p-5 bg-[#0F0F0F] border border-white/5 rounded-xl space-y-3 hover:border-red-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Official Dar PDF CVs</h3>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Printable branded PDF format</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (employees.length > 0) exportToExcel(employees, 'Dar_Staff_PDF_Export_Summary.xlsx');
              }}
              className="w-full py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider border border-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={14} /> Batch Export PDF Summary
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
