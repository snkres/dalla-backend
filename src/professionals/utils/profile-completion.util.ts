import { UserProfile } from 'prisma/client/postgres';
import { MetaDto } from '../dto/professional-onboarding.dto';
import { ProfessionalEducationDto } from '../dto/professional-education.dto';
import { ProfessionalExperienceDto } from '../dto/professional-experience.dto';
import { ProfessionalProjectDto } from '../dto/professional-project.dto';

const BASE_PERCENTAGE = 20;

const EXPERIENCE_MIN_NUMBER = 1;
const EDUCATION_MIN_NUMBER = 1;
export const PROJECTS_MIN_NUMBER = 1;

const completionAttributes = [
  {
    key: 'headline',
    weight: 20,
    check: (profile: UserProfile) => !!profile.headline,
  },
  {
    key: 'avatar',
    weight: 15,
    check: (profile: UserProfile) => !!profile.avatar,
  },
  {
    key: 'bio',
    weight: 10,
    check: (profile: UserProfile) => !!profile.bio,
  },
  {
    key: 'phoneAndSkillsMeta',
    weight: 10,
    check: (profile: UserProfile) => {
      const meta = profile.meta as MetaDto;
      return !!(meta?.phone?.trim() && meta?.skills?.length > 0);
    },
  },
  {
    key: 'resume',
    weight: 10,
    check: (profile: UserProfile) => !!profile.resume,
  },
  {
    key: 'experience',
    weight: 5,
    check: (
      profile: UserProfile & { experience: ProfessionalExperienceDto[] },
    ) => profile.experience.length >= EXPERIENCE_MIN_NUMBER,
  },
  {
    key: 'education',
    weight: 5,
    check: (profile: UserProfile & { education: ProfessionalEducationDto[] }) =>
      profile.education.length >= EDUCATION_MIN_NUMBER,
  },
  {
    key: 'projects',
    weight: 5,
    check: (profile: UserProfile & { projects: ProfessionalProjectDto[] }) =>
      profile.projects.length >= PROJECTS_MIN_NUMBER,
  },
];

export const calculateProfileCompletion = (profile: UserProfile): number => {
  let percentage = BASE_PERCENTAGE;

  for (const attribute of completionAttributes) {
    if (attribute.check(profile)) {
      percentage += attribute.weight;
    }
  }

  return percentage;
};
