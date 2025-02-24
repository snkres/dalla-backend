import parseResumeFromPdf from '@/shared/resume-parser';
import { Injectable } from '@nestjs/common';
import { ProfessionalOnboardingDto } from './dto/professional-onboarding.dto';
import { newId } from '@/shared/utils/unique-id';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { UploadService } from '@/shared/upload/upload.service';
import { ProfessionalEducationDto } from './dto/professional-education.dto';

@Injectable()
export class ProfessionalsService {
  constructor(
    private readonly prisma: PostgresPrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async parseResume(fileBuffer: Buffer) {
    const parsedResume = await parseResumeFromPdf(fileBuffer);
    return parsedResume;
  }

  async onboarding(
    professionalId: string,
    onboardingData: ProfessionalOnboardingDto,
  ) {
    const avatarUrl = await this.handleAvatarUpload(onboardingData.avatar);
    const profile = await this.createUserProfile(
      professionalId,
      onboardingData,
      avatarUrl,
    );
    return profile;
  }

  private async handleAvatarUpload(avatarFile: any): Promise<string | null> {
    return avatarFile ? await this.uploadService.uploadFile(avatarFile) : null;
  }

  private async createUserProfile(
    professionalId: string,
    onboardingData: ProfessionalOnboardingDto,
    avatarUrl: string | null,
  ) {
    const profile = await this.prisma.userProfile.create({
      data: {
        User: { connect: { id: professionalId } },
        ...onboardingData,
        id: newId('professionalProfile'),
        avatar: avatarUrl,
        meta: JSON.parse(JSON.stringify(onboardingData.meta)),
        education: { create: this.mapEducationData(onboardingData.education) },
        experience: {
          create: this.mapExperienceData(onboardingData.experience),
        },
      },
      include: { education: true, experience: true, User: true },
    });

    await this.prisma.user.update({
      where: { id: professionalId },
      data: { onboarded: true },
    });

    profile.User.onboarded = true;
    return profile;
  }

  private mapEducationData(education: ProfessionalEducationDto[]) {
    return education?.map((edu) => ({
      ...edu,
      startDate: new Date(edu.startDate),
      endDate: new Date(edu.endDate),
      id: newId('professionalEducation'),
    }));
  }

  private mapExperienceData(experience: any[]) {
    return experience?.map((exp) => ({
      ...exp,
      startDate: new Date(exp.startDate),
      endDate: new Date(exp.endDate),
      id: newId('professionalExperience'),
      meta: JSON.parse(JSON.stringify(exp.meta)),
    }));
  }
}
