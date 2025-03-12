import { ProjectStatus } from '@/prisma/postgres';

export interface ProfessionalProfileMeta {
  phone: string;
  location: string;
  yearsOfExperience: number;
  skills: string[];
  socialLinks: Map<string, string>;
  languages: Map<string, string>;
  hourlyRate: number;
  successRate: string;
  totalEarned: string;
  availability: string;
  projectCompletion: string;
  projectsCompleted: number;
  weeklyAvailability: number;
}

export interface ProfessionalExperience {
  skills: string[];
  achievements: string;
  responsibilities: string;
  typeOfEmployment: string;
}

export interface FilterProjectsOptions {
  professionalId?: string;
  status?: ProjectStatus;
}
