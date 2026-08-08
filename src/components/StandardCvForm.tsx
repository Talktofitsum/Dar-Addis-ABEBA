import React, { useState } from 'react';
import { Employee, Language, ProjectExperience, CVStatus } from '../types';
import { getTranslation } from '../i18n/translations';
import { Plus, Trash2, Sparkles, Save, CheckCircle2, User, Building, Award, Briefcase, FileText } from 'lucide-react';

interface StandardCvFormProps {
  initialEmployee?: Employee | null;
  currentLang: Language;
  onSave: (employeeData: Employee) => void;
  onCancel?: () => void;
}

export const StandardCvForm: React.FC<StandardCvFormProps> = ({
  initialEmployee,
  currentLang,
  onSave,
  onCancel
}) => {
  const t = getTranslation(currentLang);

  const [formData, setFormData] = useState<Employee>(
    initialEmployee || {
      id: `emp-${Date.now()}`,
      darOffice: 'ETHIOPIA AREA OFFICE',
      employeeId: `DAR-ETH-${Math.floor(100 + Math.random() * 900)}`,
      fullName: '',
      title: 'Civil Engineer',
      currentProjectNo: 'PRJ-2026-ETH-101',
      qualifications: 'BSc in Civil Engineering',
      degreeType: 'BSc',
      nationality: 'Ethiopian',
      dob: '1990-01-01',
      graduationYear: 2015,
      email: 'staff@dar.com',
      nationalOrExpat: 'National',
      gender: 'Male',
      phone: '',
      currentRegion: 'Addis Ababa',
      professionRole: 'Civil Engineer',
      experienceYears: 5,
      educationLevel: 'BSc in Civil Engineering',
      university: 'Addis Ababa University',
      professionalLicenseNo: '',
      cvStatus: 'new_applicant',
      summary: '',
      keyQualifications: ['Construction Supervision', 'Contract Quality Control', 'FIDIC Standards'],
      projectExperience: [
        {
          id: `p-${Date.now()}-1`,
          projectName: '',
          client: '',
          location: '',
          role: '',
          duration: '',
          projectCost: '',
          description: ''
        }
      ],
      skills: ['AutoCAD', 'Structural Supervision', 'BOQ Auditing'],
      languages: ['Amharic', 'English'],
      attachments: [],
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  );

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [qualInput, setQualInput] = useState('');
  const [skillInput, setSkillInput] = useState('');

  // Handle simple input change
  const handleChange = (field: keyof Employee, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add Project
  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projectExperience: [
        ...prev.projectExperience,
        {
          id: `p-${Date.now()}-${prev.projectExperience.length + 1}`,
          projectName: '',
          client: '',
          location: prev.currentRegion,
          role: prev.professionRole,
          duration: '',
          projectCost: '',
          description: ''
        }
      ]
    }));
  };

  // Update Project
  const updateProject = (index: number, field: keyof ProjectExperience, value: string) => {
    setFormData(prev => {
      const updated = [...prev.projectExperience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projectExperience: updated };
    });
  };

  // Remove Project
  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projectExperience: prev.projectExperience.filter((_, i) => i !== index)
    }));
  };

  // Add Key Qualification
  const addQual = () => {
    if (qualInput.trim()) {
      setFormData(prev => ({ ...prev, keyQualifications: [...prev.keyQualifications, qualInput.trim()] }));
      setQualInput('');
    }
  };

  const removeQual = (index: number) => {
    setFormData(prev => ({ ...prev, keyQualifications: prev.keyQualifications.filter((_, i) => i !== index) }));
  };

  // Add Skill
  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  // AI Enhance summary or project description via Gemini API
  const handleAiEnhanceSummary = async () => {
    if (!formData.summary && formData.projectExperience.length === 0) return;
    setIsEnhancing(true);

    try {
      const rawContent = `Name: ${formData.fullName}\nRole: ${formData.professionRole}\nYears Experience: ${formData.experienceYears}\nRaw Summary/Duties: ${formData.summary || formData.projectExperience[0]?.description || 'Senior civil supervision engineer.'}`;

      const res = await fetch('/api/gemini/enhance-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawContent, action: 'enhance' })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setFormData(prev => ({ ...prev, summary: data.result }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-[#141414] border border-white/5 p-6 sm:p-8 rounded-2xl shadow-2xl text-white">
      
      {/* Form Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#C5A059] tracking-[0.2em] uppercase block">
            {t.brandTagline}
          </span>
          <h2 className="text-xl sm:text-2xl font-light text-white mt-1">
            {initialEmployee ? `${t.edit}: ${formData.fullName}` : t.navAddCv}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wider border border-white/10"
            >
              {t.cancel}
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#C5A059] hover:bg-[#d8b26a] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#C5A059]/10"
          >
            <Save size={15} />
            {t.save}
          </button>
        </div>
      </div>

      {/* Section 1: Personal & Professional Identity (Master Excel Credentials) */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-[#C5A059] flex items-center gap-2 uppercase tracking-[0.15em]">
          <User size={15} /> 1. Master Staff Credentials & Personal Info (A - I)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* A. Dar Office */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mb-1 block">A. Dar Office *</label>
            <input
              type="text"
              required
              value={formData.darOffice || 'ETHIOPIA AREA OFFICE'}
              onChange={e => handleChange('darOffice', e.target.value)}
              placeholder="e.g. ETHIOPIA AREA OFFICE"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#C5A059]"
            />
          </div>

          {/* B. Dar ID No */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mb-1 block">B. Dar ID No. *</label>
            <input
              type="text"
              required
              value={formData.employeeId}
              onChange={e => handleChange('employeeId', e.target.value)}
              placeholder="e.g. DAR-ETH-102"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:border-[#C5A059]"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Staff Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
              placeholder="e.g. Yonas Tadesse Wolde"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#C5A059]"
            />
          </div>

          {/* C. Title and Designation */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mb-1 block">C. Title & Designation *</label>
            <input
              type="text"
              required
              value={formData.title || formData.professionRole}
              onChange={e => {
                handleChange('title', e.target.value);
                handleChange('professionRole', e.target.value);
              }}
              placeholder="e.g. Senior Resident Engineer"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#C5A059]"
            />
          </div>

          {/* E. Current Project Number */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mb-1 block">E. Current Project No. *</label>
            <input
              type="text"
              required
              value={formData.currentProjectNo || ''}
              onChange={e => handleChange('currentProjectNo', e.target.value)}
              placeholder="e.g. PRJ-2026-ETH-882"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:border-[#C5A059]"
            />
          </div>

          {/* F. Qualifications & Degree */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mb-1 block">F. Qualification & Degree *</label>
            <input
              type="text"
              required
              value={formData.qualifications || formData.educationLevel}
              onChange={e => {
                handleChange('qualifications', e.target.value);
                handleChange('educationLevel', e.target.value);
              }}
              placeholder="e.g. BSc in Civil Engineering, PMP"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#C5A059]"
            />
          </div>

          {/* G. Degree Type */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mb-1 block">G. Degree Type (BSc/MSc/PhD)</label>
            <input
              type="text"
              value={formData.degreeType || 'BSc'}
              onChange={e => handleChange('degreeType', e.target.value)}
              placeholder="e.g. MSc / BSc"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#C5A059]"
            />
          </div>

          {/* H. Email */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mb-1 block">H. E-mail Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="engineer@dar.com"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:border-[#C5A059]"
            />
          </div>

          {/* I. Total Experience */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mb-1 block">I. Total Experience (Years) *</label>
            <input
              type="number"
              min={0}
              max={60}
              required
              value={formData.experienceYears}
              onChange={e => handleChange('experienceYears', Number(e.target.value))}
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:border-[#C5A059]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">National or Expat</label>
            <select
              value={formData.nationalOrExpat || 'National'}
              onChange={e => handleChange('nationalOrExpat', e.target.value as any)}
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#C5A059]"
            >
              <option value="National">National</option>
              <option value="Expat">Expat</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">{t.phone}</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => handleChange('phone', e.target.value)}
              placeholder="+251 911 000 000"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#C5A059]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">{t.currentRegion}</label>
            <select
              value={formData.currentRegion}
              onChange={e => handleChange('currentRegion', e.target.value)}
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#C5A059]"
            >
              <option value="Addis Ababa">Addis Ababa</option>
              <option value="Hawassa">Hawassa (Sidama)</option>
              <option value="Bahir Dar">Bahir Dar (Amhara)</option>
              <option value="Mekelle">Mekelle (Tigray)</option>
              <option value="Dire Dawa">Dire Dawa</option>
              <option value="Semera">Semera (Afar)</option>
              <option value="Jimma">Jimma (Oromia)</option>
              <option value="Adama">Adama</option>
              <option value="Jigjiga">Jigjiga (Somali)</option>
              <option value="Gambela">Gambela</option>
              <option value="Assosa">Assosa (Benishangul)</option>
              <option value="Project Site">On-Site Camp</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">{t.filterStatus}</label>
            <select
              value={formData.cvStatus}
              onChange={e => handleChange('cvStatus', e.target.value as CVStatus)}
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#C5A059]"
            >
              <option value="active_staff">{t.statusActiveStaff}</option>
              <option value="new_applicant">{t.statusNewApplicant}</option>
              <option value="under_review">{t.statusUnderReview}</option>
              <option value="archived">{t.statusArchived}</option>
            </select>
          </div>

        </div>
      </div>

      {/* Section 2: Education & License */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-[#C5A059] flex items-center gap-2 uppercase tracking-[0.15em]">
          <Award size={15} /> 2. Education & Professional Registration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">{t.university}</label>
            <input
              type="text"
              value={formData.university}
              onChange={e => handleChange('university', e.target.value)}
              placeholder="e.g. Addis Ababa University (AAiT)"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#C5A059]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">Bachelor Graduation Year</label>
            <input
              type="number"
              value={formData.graduationYear || 2015}
              onChange={e => handleChange('graduationYear', Number(e.target.value))}
              placeholder="e.g. 2015"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:border-[#C5A059]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">{t.professionalLicenseNo}</label>
            <input
              type="text"
              value={formData.professionalLicenseNo}
              onChange={e => handleChange('professionalLicenseNo', e.target.value)}
              placeholder="PE-CIVIL-2024-XXXX"
              className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white font-mono focus:border-[#C5A059]"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Executive Summary with AI Polish */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
            <FileText size={14} className="text-[#C5A059]" />
            {t.summary}
          </label>
          
          <button
            type="button"
            onClick={handleAiEnhanceSummary}
            disabled={isEnhancing}
            className="px-3 py-1 rounded-lg bg-[#C5A059]/10 hover:bg-[#C5A059]/20 text-[#C5A059] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-[#C5A059]/20 transition-all"
          >
            <Sparkles size={12} className={isEnhancing ? 'animate-spin' : ''} />
            {isEnhancing ? 'Gemini Enhancing...' : 'በ AI አሻሽል (Polish Summary)'}
          </button>
        </div>

        <textarea
          rows={3}
          value={formData.summary}
          onChange={e => handleChange('summary', e.target.value)}
          placeholder="Brief executive summary highlighting years of supervision experience, major projects, and key technical capabilities..."
          className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#C5A059] leading-relaxed"
        />
      </div>

      {/* Section 4: Key Qualifications */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-white/80 block">{t.keyQualifications}</label>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={qualInput}
            onChange={e => setQualInput(e.target.value)}
            placeholder="Add qualification (e.g. FIDIC Red Book Contract Administration)..."
            className="flex-1 bg-[#0F0F0F] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#C5A059]"
          />
          <button
            type="button"
            onClick={addQual}
            className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-white/10"
          >
            {t.save}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {formData.keyQualifications.map((q, idx) => (
            <span key={idx} className="bg-[#0F0F0F] border border-white/10 text-white/80 px-3 py-1 rounded-lg text-xs flex items-center gap-2">
              • {q}
              <button type="button" onClick={() => removeQual(idx)} className="text-red-400 hover:text-red-300">
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Section 5: Major Project History */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#C5A059] flex items-center gap-2 uppercase tracking-[0.15em]">
            <Briefcase size={15} /> {t.projectHistory}
          </h3>

          <button
            type="button"
            onClick={addProject}
            className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] hover:bg-white/10 text-[#C5A059] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/10"
          >
            <Plus size={13} />
            {t.addProject}
          </button>
        </div>

        {formData.projectExperience.map((proj, idx) => (
          <div key={proj.id} className="p-4 bg-[#0F0F0F] border border-white/5 rounded-xl space-y-3 relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-bold text-[#C5A059] font-mono uppercase tracking-widest">Project #{idx + 1}</span>
              {formData.projectExperience.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProject(idx)}
                  className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                >
                  <Trash2 size={13} /> {t.delete}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">{t.projectName}</label>
                <input
                  type="text"
                  value={proj.projectName}
                  onChange={e => updateProject(idx, 'projectName', e.target.value)}
                  placeholder="e.g. Addis Commercial Tower"
                  className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">{t.clientName}</label>
                <input
                  type="text"
                  value={proj.client}
                  onChange={e => updateProject(idx, 'client', e.target.value)}
                  placeholder="e.g. Ethiopian Roads Admin"
                  className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">{t.projectLocation}</label>
                <input
                  type="text"
                  value={proj.location}
                  onChange={e => updateProject(idx, 'location', e.target.value)}
                  placeholder="e.g. Bahir Dar"
                  className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">{t.projectRole}</label>
                <input
                  type="text"
                  value={proj.role}
                  onChange={e => updateProject(idx, 'role', e.target.value)}
                  placeholder="e.g. Resident Engineer"
                  className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">{t.projectDuration}</label>
                <input
                  type="text"
                  value={proj.duration}
                  onChange={e => updateProject(idx, 'duration', e.target.value)}
                  placeholder="e.g. 24 Months"
                  className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">{t.projectCost}</label>
                <input
                  type="text"
                  value={proj.projectCost}
                  onChange={e => updateProject(idx, 'projectCost', e.target.value)}
                  placeholder="e.g. 500 Million ETB"
                  className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 block">{t.projectDesc}</label>
              <textarea
                rows={2}
                value={proj.description}
                onChange={e => updateProject(idx, 'description', e.target.value)}
                placeholder="Supervision scope, materials testing, structural inspection, variation logs..."
                className="w-full bg-[#141414] border border-white/10 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Form Submit Footer */}
      <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wider border border-white/10"
          >
            {t.cancel}
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-[#C5A059] hover:bg-[#d8b26a] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#C5A059]/10"
        >
          <CheckCircle2 size={15} />
          {t.save}
        </button>
      </div>

    </form>
  );
};
