export type Language = 'am' | 'en' | 'ar';

export type AccessLevel = 'admin' | 'delete' | 'edit' | 'view';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: AccessLevel;
  email: string;
  password?: string;
  createdAt: string;
  lastLogin?: string;
}

export type CVStatus = 'active_staff' | 'new_applicant' | 'under_review' | 'promoted' | 'archived';

export interface ProjectExperience {
  id: string;
  projectName: string;
  client: string;
  location: string;
  role: string;
  duration: string;
  projectCost?: string;
  description: string;
}

export interface AttachmentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  driveUrl?: string;
  folderName?: string; // e.g. '1_Academic_Degrees_and_Transcripts'
}

export interface Employee {
  id: string;
  darOffice: string;
  employeeId: string; // Dar ID No.
  fullName: string; // Names
  title: string; // Title / Designation
  currentProjectNo: string; // Current Project No.
  qualifications: string; // Qualifications / University Degree(s)
  degreeType: string; // Degree (MSc / BSC) OTHER Certificates
  nationality: string; // Nationalities
  dob?: string; // Birth Date (d/m/yy)
  graduationYear: number; // Bachelor Grad Year
  email: string; // E-mail
  nationalOrExpat: 'National' | 'Expat'; // National / Expat
  
  // Operational details
  gender?: 'Male' | 'Female';
  phone?: string;
  currentRegion: string;
  professionRole: string;
  experienceYears: number;
  educationLevel: string;
  university: string;
  professionalLicenseNo?: string;
  cvStatus: CVStatus;
  summary: string;
  keyQualifications: string[];
  projectExperience: ProjectExperience[];
  skills: string[];
  languages: string[];
  attachments: AttachmentFile[];
  driveFolderName?: string;
  driveFolderUrl?: string;
  customFolders?: string[]; // Additional subfolder names for CV details
  lastUpdated: string;
}

export interface DriveSyncLog {
  id: string;
  timestamp: string;
  fileName: string;
  status: 'synced' | 'failed' | 'syncing';
  action: 'upload' | 'backup' | 'export' | 'import';
  fileSize: string;
  driveUrl: string;
}
