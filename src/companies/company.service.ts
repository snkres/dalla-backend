import { Injectable } from '@nestjs/common';
import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import { Prisma } from '@/prisma/postgres';
import { newId } from '@/shared/utils/unique-id';
import { UpdateCompanyAndProfileDto } from '@/companies/dto/UpdateCompanyAndProfile.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PostgresPrismaService) {}

  async onboarding(
    companyId: string,
    onboardingData: Omit<Prisma.CompanyProfileCreateWithoutCompanyInput, 'id'>,
  ) {
    const id = newId('companyProfile');
    await this.prisma.companyProfile.create({
      data: {
        id,
        companyId,
        ...onboardingData,
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
          },
        },
      },
    });
  }

  async updateCompanyProfile(
    companyId: string,
    updateData: UpdateCompanyAndProfileDto,
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
