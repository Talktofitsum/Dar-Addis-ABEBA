import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import mammoth from 'mammoth';
import { Employee } from '../types';

// ==================== EXCEL EXPORT & IMPORT ====================

export function exportToExcel(employees: Employee[], filename = 'Dar_Staff_Database.xlsx') {
  const masterData = employees.map(emp => ({
    'Employee ID': emp.employeeId,
    'Full Name': emp.fullName,
    'Gender': emp.gender,
    'Profession / Title': emp.professionRole,
    'Project Region / Site': emp.currentRegion,
    'Experience (Years)': emp.experienceYears,
    'Education Level': emp.educationLevel,
    'University': emp.university,
    'Graduation Year': emp.graduationYear,
    'License No': emp.professionalLicenseNo,
    'Phone': emp.phone,
    'Email': emp.email,
    'CV Status': emp.cvStatus,
    'Key Qualifications': emp.keyQualifications.join('; '),
    'Skills': emp.skills.join(', '),
    'Languages': emp.languages.join(', '),
    'Last Updated': emp.lastUpdated
  }));

  const projectData: any[] = [];
  employees.forEach(emp => {
    emp.projectExperience.forEach((proj, idx) => {
      projectData.push({
        'Employee ID': emp.employeeId,
        'Employee Name': emp.fullName,
        'Project #': idx + 1,
        'Project Name': proj.projectName,
        'Client': proj.client,
        'Location': proj.location,
        'Role in Project': proj.role,
        'Duration': proj.duration,
        'Project Cost / Budget': proj.projectCost || 'N/A',
        'Description': proj.description
      });
    });
  });

  const wb = XLSX.utils.book_new();
  const wsMaster = XLSX.utils.json_to_sheet(masterData);
  const wsProjects = XLSX.utils.json_to_sheet(projectData);

  XLSX.utils.book_append_sheet(wb, wsMaster, 'Staff Overview');
  XLSX.utils.book_append_sheet(wb, wsProjects, 'Project History');

  XLSX.writeFile(wb, filename);
}

export async function importFromExcel(file: File): Promise<Partial<Employee>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const importedEmployees: Partial<Employee>[] = json.map((row, index) => {
          return {
            id: `emp-imported-${Date.now()}-${index}`,
            employeeId: row['Employee ID'] || row['ID'] || `DAR-IMP-${100 + index}`,
            fullName: row['Full Name'] || row['Name'] || 'New Employee',
            gender: (row['Gender'] === 'Female' ? 'Female' : 'Male'),
            phone: row['Phone'] || '+251 900 000 000',
            email: row['Email'] || 'info@dar-example.com',
            currentRegion: row['Project Region / Site'] || row['Region'] || 'Addis Ababa',
            professionRole: row['Profession / Title'] || row['Profession'] || 'Civil Engineer',
            experienceYears: Number(row['Experience (Years)'] || row['Experience']) || 3,
            educationLevel: row['Education Level'] || 'BSc in Civil Engineering',
            university: row['University'] || 'Addis Ababa University',
            graduationYear: Number(row['Graduation Year']) || 2020,
            professionalLicenseNo: row['License No'] || 'PE-PENDING',
            cvStatus: (row['CV Status'] as any) || 'new_applicant',
            summary: row['Summary'] || `${row['Profession / Title'] || 'Engineer'} with experience in construction supervision and project consultancy.`,
            keyQualifications: row['Key Qualifications'] ? String(row['Key Qualifications']).split(';') : ['Construction Supervision', 'Quality Control'],
            skills: row['Skills'] ? String(row['Skills']).split(',') : ['AutoCAD', 'Site Management'],
            languages: row['Languages'] ? String(row['Languages']).split(',') : ['Amharic', 'English'],
            projectExperience: [],
            attachments: [],
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        });

        resolve(importedEmployees);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

// ==================== WORD EXPORT & IMPORT ====================

export async function exportToWord(employee: Employee) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header Logo text
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: 'dar',
                bold: true,
                size: 48,
                color: '00D0B0', // Teal brand color
                font: 'Arial'
              }),
              new TextRun({
                text: '  BUSINESS DEVELOPMENT & CONSULTANCY',
                bold: true,
                size: 20,
                color: '333333',
                font: 'Arial'
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Construction Consultancy & Supervision Staff Profile',
                italics: true,
                size: 18,
                color: '666666'
              })
            ]
          }),
          new Paragraph({ text: '' }), // Spacer

          // Title
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `CURRICULUM VITAE - ${employee.fullName.toUpperCase()}`,
                bold: true,
                size: 28,
                color: '111827'
              })
            ]
          }),
          new Paragraph({ text: '' }),

          // Personal Details Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Employee ID:', bold: true })] })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: employee.employeeId })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Current Site/Region:', bold: true })] })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: employee.currentRegion })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Profession / Role:', bold: true })] })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: employee.professionRole })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Years Experience:', bold: true })] })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: `${employee.experienceYears} Years` })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Education:', bold: true })] })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: `${employee.educationLevel} (${employee.university}, ${employee.graduationYear})` })],
                    width: { size: 75, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'License No:', bold: true })] })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: employee.professionalLicenseNo })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Contact:', bold: true })] })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: `${employee.phone} | ${employee.email}` })],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                  })
                ]
              })
            ]
          }),
          new Paragraph({ text: '' }),

          // Executive Summary
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '1. EXECUTIVE SUMMARY', bold: true, color: '00D0B0' })]
          }),
          new Paragraph({
            children: [new TextRun({ text: employee.summary })]
          }),
          new Paragraph({ text: '' }),

          // Key Qualifications
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '2. KEY QUALIFICATIONS & COMPETENCIES', bold: true, color: '00D0B0' })]
          }),
          ...employee.keyQualifications.map(q => new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: q })]
          })),
          new Paragraph({ text: '' }),

          // Project History Table
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '3. DETAILED PROJECT EXPERIENCE HISTORY', bold: true, color: '00D0B0' })]
          }),
          ...employee.projectExperience.map((p, i) => [
            new Paragraph({
              children: [
                new TextRun({ text: `Project #${i + 1}: `, bold: true }),
                new TextRun({ text: p.projectName, bold: true, color: '111827' })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Client: ${p.client} | Location: ${p.location} | Role: ${p.role} | Duration: ${p.duration}`, italics: true, size: 18 })
              ]
            }),
            new Paragraph({
              children: [new TextRun({ text: p.description })]
            }),
            new Paragraph({ text: '' })
          ]).flat(),

          // Skills & Languages
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '4. TECHNICAL SKILLS & LANGUAGES', bold: true, color: '00D0B0' })]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Technical Skills: ', bold: true }),
              new TextRun({ text: employee.skills.join(', ') })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Languages Spoken: ', bold: true }),
              new TextRun({ text: employee.languages.join(', ') })
            ]
          }),
          new Paragraph({ text: '' }),

          // Sign-off block
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: 'Verified by Dar Business Development Division\nDate: ' + new Date().toLocaleDateString(), italics: true })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Dar_CV_${employee.fullName.replace(/\s+/g, '_')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importFromWord(file: File): Promise<Partial<Employee>> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;

  // Simple parse heuristic to pre-fill CV form from Word document
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const fullName = lines[0] || file.name.replace(/\.[^/.]+$/, '');
  
  return {
    fullName: fullName,
    summary: text.slice(0, 500),
    keyQualifications: ['Extracted from Word CV file', 'Supervision & Quality Assurance'],
    skills: ['Word File Parsed', 'Engineering Supervision'],
    lastUpdated: new Date().toISOString().split('T')[0]
  };
}

// ==================== PDF EXPORT ====================

export function exportToPdf(employee: Employee) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Dark header bar
  doc.setFillColor(18, 24, 38); // #121826
  doc.rect(0, 0, 210, 32, 'F');

  // 'dar' Logo Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(0, 208, 176); // #00D0B0 Teal
  doc.text('dar', 15, 20);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('BUSINESS DEVELOPMENT & CONSULTANCY DATABASE', 45, 17);
  doc.setFontSize(8);
  doc.setTextColor(160, 174, 192);
  doc.text('Standardized Staff & Recruitment Curriculum Vitae', 45, 23);

  // Employee Header Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text(employee.fullName.toUpperCase(), 15, 42);

  doc.setFontSize(11);
  doc.setTextColor(0, 168, 140);
  doc.text(`${employee.professionRole} — ${employee.currentRegion}`, 15, 48);

  // Info Box Table
  autoTable(doc, {
    startY: 53,
    head: [['Field', 'Details', 'Field', 'Details']],
    body: [
      ['Employee ID', employee.employeeId, 'Years Experience', `${employee.experienceYears} Years`],
      ['Education', employee.educationLevel, 'University/Grad', `${employee.university} (${employee.graduationYear})`],
      ['License No', employee.professionalLicenseNo, 'CV Status', employee.cvStatus.replace('_', ' ').toUpperCase()],
      ['Phone', employee.phone, 'Email', employee.email]
    ],
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2 },
    headStyles: { fillColor: [18, 24, 38], textColor: [255, 255, 255] }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // Executive Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(18, 24, 38);
  doc.text('EXECUTIVE SUMMARY', 15, currentY);
  currentY += 2;
  doc.setDrawColor(0, 208, 176);
  doc.setLineWidth(0.5);
  doc.line(15, currentY, 195, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  const splitSummary = doc.splitTextToSize(employee.summary, 180);
  doc.text(splitSummary, 15, currentY);
  currentY += splitSummary.length * 4.5 + 5;

  // Key Qualifications
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(18, 24, 38);
  doc.text('KEY QUALIFICATIONS', 15, currentY);
  currentY += 2;
  doc.line(15, currentY, 195, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  employee.keyQualifications.forEach(q => {
    doc.text(`• ${q}`, 18, currentY);
    currentY += 4.5;
  });
  currentY += 4;

  // Project History
  if (employee.projectExperience && employee.projectExperience.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(18, 24, 38);
    doc.text('MAJOR PROJECT EXPERIENCE HISTORY', 15, currentY);
    currentY += 2;
    doc.line(15, currentY, 195, currentY);
    currentY += 4;

    const projRows = employee.projectExperience.map(p => [
      p.projectName,
      p.client,
      p.location,
      p.role,
      p.duration,
      p.description
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Project Name', 'Client', 'Location', 'Role', 'Duration', 'Key Tasks & Supervision Scope']],
      body: projRows,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 168, 140], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 22 },
        3: { cellWidth: 25 },
        4: { cellWidth: 18 },
        5: { cellWidth: 55 }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(128, 128, 128);
  doc.text(`Dar Business Development Database — Official Document generated on ${new Date().toLocaleDateString()}`, 15, 285);

  doc.save(`Dar_CV_${employee.fullName.replace(/\s+/g, '_')}.pdf`);
}
