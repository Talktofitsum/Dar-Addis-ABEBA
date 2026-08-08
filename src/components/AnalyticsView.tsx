import React from 'react';
import { Employee, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { MapPin, Briefcase, Award, Users, CheckCircle2, TrendingUp, PieChart, Layers } from 'lucide-react';

interface AnalyticsViewProps {
  employees: Employee[];
  currentLang: Language;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ employees, currentLang }) => {
  const t = getTranslation(currentLang);

  // Group by Region
  const regionCounts = employees.reduce((acc, curr) => {
    acc[curr.currentRegion] = (acc[curr.currentRegion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by Profession
  const professionCounts = employees.reduce((acc, curr) => {
    acc[curr.professionRole] = (acc[curr.professionRole] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Active vs Applicant
  const activeCount = employees.filter(e => e.cvStatus === 'active_staff').length;
  const applicantCount = employees.filter(e => e.cvStatus === 'new_applicant').length;
  const reviewCount = employees.filter(e => e.cvStatus === 'under_review').length;

  const avgExp = (employees.reduce((acc, curr) => acc + curr.experienceYears, 0) / (employees.length || 1)).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-6 bg-[#141414] border border-white/5 rounded-2xl shadow-2xl space-y-2">
          <div className="flex items-center justify-between text-white/40 text-[10px] font-bold uppercase tracking-widest">
            <span>Total Staff Registered</span>
            <Users size={16} className="text-[#00d0b0]" />
          </div>
          <div className="text-3xl font-light text-white font-mono">{employees.length}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Dar Business Development Database</div>
        </div>

        <div className="p-6 bg-[#141414] border border-white/5 rounded-2xl shadow-2xl space-y-2">
          <div className="flex items-center justify-between text-white/40 text-[10px] font-bold uppercase tracking-widest">
            <span>Active Site Staff</span>
            <CheckCircle2 size={16} className="text-green-500" />
          </div>
          <div className="text-3xl font-light text-green-500 font-mono">{activeCount}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Assigned to Active Projects</div>
        </div>

        <div className="p-6 bg-[#141414] border border-white/5 rounded-2xl shadow-2xl space-y-2">
          <div className="flex items-center justify-between text-white/40 text-[10px] font-bold uppercase tracking-widest">
            <span>New Recruitment CVs</span>
            <Layers size={16} className="text-[#00d0b0]" />
          </div>
          <div className="text-3xl font-light text-[#00d0b0] font-mono">{applicantCount + reviewCount}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Applicants & Under Review</div>
        </div>

        <div className="p-6 bg-[#141414] border border-white/5 rounded-2xl shadow-2xl space-y-2">
          <div className="flex items-center justify-between text-white/40 text-[10px] font-bold uppercase tracking-widest">
            <span>Avg. Years Experience</span>
            <Award size={16} className="text-blue-400" />
          </div>
          <div className="text-3xl font-light text-blue-400 font-mono">{avgExp} yrs</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Senior Technical Standard</div>
        </div>

      </div>

      {/* Region & Project Sites Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Regional Breakdown */}
        <div className="p-6 bg-[#141414] border border-white/5 rounded-2xl shadow-2xl space-y-4">
          <h3 className="text-xs font-bold text-[#00d0b0] uppercase tracking-[0.15em] flex items-center gap-2">
            <MapPin size={15} />
            Regional & Project Site Deployment
          </h3>

          <div className="space-y-3.5">
            {Object.entries(regionCounts).map(([reg, count]) => {
              const pct = Math.round(((count as number) / (employees.length || 1)) * 100);
              return (
                <div key={reg} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-white/80">
                    <span>📍 {reg}</span>
                    <span className="font-mono text-white/40 text-[11px]">{count} staff ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#0F0F0F] rounded-full h-1.5 overflow-hidden border border-white/5">
                    <div
                      className="bg-[#00d0b0] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profession Breakdown */}
        <div className="p-6 bg-[#141414] border border-white/5 rounded-2xl shadow-2xl space-y-4">
          <h3 className="text-xs font-bold text-[#00d0b0] uppercase tracking-[0.15em] flex items-center gap-2">
            <Briefcase size={15} />
            Technical Profession Disciplines
          </h3>

          <div className="space-y-3.5">
            {Object.entries(professionCounts).map(([prof, count]) => {
              const pct = Math.round(((count as number) / (employees.length || 1)) * 100);
              return (
                <div key={prof} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-white/80">
                    <span>{prof}</span>
                    <span className="font-mono text-white/40 text-[11px]">{count} staff</span>
                  </div>
                  <div className="w-full bg-[#0F0F0F] rounded-full h-1.5 overflow-hidden border border-white/5">
                    <div
                      className="bg-white/40 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
