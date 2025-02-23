import { Injectable } from '@nestjs/common';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { newId } from '@/shared/utils/unique-id';
import { OnboardingValidation } from './validation/onboarding.validation';
import { InputJsonValue } from '@prisma/client/runtime/library';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PostgresPrismaService) {}

  async onboarding(companyId: string, onboardingData: OnboardingValidation) {
    const id = newId('companyProfile');
    await this.prisma.companyProfile.create({
      data: {
        id,
        Company: {
          connect: {
            id: companyId,
            onboarded: true,
          },
        },
        ...onboardingData,
        meta: onboardingData.meta as unknown as InputJsonValue,
      },
      include: {
        Company: true,
      },
    });
    return this.prisma.company.update({
      where: {
        id: companyId,
      },
      data: {
        onboarded: true,
      },
      include: {
        CompanyProfile: true,
      },
    });
  }

  async getCompanyProfile(companyId: string) {
    return this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        domain: true,
        // industry: true,
        // size: true,
        onboarded: true,
        suspended: true,
        verified: true,
        CompanyProfile: {
          select: {
            location: true,
            areas: true,
            goals: true,
            targetIndustries: true,
            website: true,
            headline: true,
            bio: true,
            logo: true,
            meta: true,
          },
        },
      },
    });
  }

  async updateCompanyProfile(
    companyId: string,
    updateData: OnboardingValidation,
  ) {
    const {
      location,
      areas,
      goals,
      targetIndustries,
      website,
      headline,
      bio,
      logo,
      ...companyData
    } = updateData;

    // Update Company
    const updatedCompany = await this.prisma.company.update({
      where: { id: companyId },
      data: companyData,
    });

    // Update CompanyProfile
    const updatedCompanyProfile = await this.prisma.companyProfile.update({
      where: { companyId },
      data: {
        location,
        areas,
        goals,
        targetIndustries,
        website,
        headline,
        bio,
        logo,
      },
    });

    return {
      company: updatedCompany,
      profile: updatedCompanyProfile,
    };
  }
}
