import parseResumeFromPdf from '@/shared/resume-parser';
import { Injectable } from '@nestjs/common';
import { ProfessionalOnboardingDto } from './dto/professional-onboarding.dto';
import { newId } from '@/shared/utils/unique-id';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { UploadService } from '@/shared/upload/upload.service';
import { ProfessionalEducationDto } from './dto/professional-education.dto';
import { JsonValue } from '@prisma/client/runtime/library';
import { ProfessionalUpdateValidation } from './dto/professional-update.validation';
import { pagination } from 'prisma-extension-pagination';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@Injectable()
export class ProfessionalsService {
  constructor(
    private readonly prisma: PostgresPrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async listProfessionals(query: PaginationDto) {
    return await this.prisma
      .$extends(pagination())
      .userProfile.paginate({
        where: { User: { onboarded: true, suspended: false } },
        include: {
          User: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          education: true,
          experience: true,
        },
      })
      .withPages({
        limit: query.limit,
        page: query.page,
      });
  }

  async parseResume(file: Express.Multer.File) {
    const resumeUrl = await this.uploadService.uploadFile(file);
    const parsedResume = await parseResumeFromPdf(file.buffer);
    return { ...parsedResume, url: resumeUrl };
  }

  async onboarding(
    professionalId: string,
    onboardingData: ProfessionalOnboardingDto,
  ) {
    const profile = await this.createUserProfile(
      professionalId,
      onboardingData,
    );
    return profile;
  }

  async getProfile(professionalId: string) {
    return await this.prisma.userProfile.findFirst({
      where: { userId: professionalId },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            name: true,
            verified: true,
            username: true,
          },
        },
        education: true,
        experience: true,
      },
    });
  }

  async getCurrentUser(userId: string) {
    return await this.prisma.user.findFirst({
      where: { id: userId },
      include: {
        UserProfile: {
          include: { education: true, experience: true },
        },
      },
    });
  }

  async updateProfile(
    professionalId: string,
    onboardingData: ProfessionalUpdateValidation,
  ) {
    const profile = await this.prisma.userProfile.findFirst({
      where: { userId: professionalId },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    const { education, experience, meta, ...rest } = onboardingData;
    await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        ...rest,
        meta: meta as unknown as JsonValue,
        // Delete all existing education and experience and create new ones
        education: {
          deleteMany: {},
          create: this.mapEducationData(education),
        },
        experience: {
          deleteMany: {},
          create: this.mapExperienceData(experience),
        },
      },
    });

    return await this.getProfile(professionalId);
  }

  private async createUserProfile(
    professionalId: string,
    onboardingData: ProfessionalOnboardingDto,
  ) {
    const profile = await this.prisma.userProfile.create({
      data: {
        User: { connect: { id: professionalId } },
        ...onboardingData,
        id: newId('professionalProfile'),
        meta: onboardingData.meta as unknown as JsonValue,
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
      id: newId('professionalEducation'),
    }));
  }

  private mapExperienceData(experience: any[]) {
    return experience?.map((exp) => ({
      ...exp,
      id: newId('professionalExperience'),
      meta: exp.meta as unknown as JsonValue,
    }));
  }
}
