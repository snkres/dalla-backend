export interface ProfessionalProfileMeta {
  phone: string;
  location: string;
  yearsOfExperience: number;
  skills: string[];
  socialLinks: Record<string, string>;
}

export interface ProfessionalExperience {
  skills: string[];
  achievements: string;
  responsibilities: string;
  typeOfEmployment: string;
}
