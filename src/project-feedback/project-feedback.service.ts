import { PostgresPrismaService } from '@/config/prisma/postgres.services';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubmitFeedbackForCompanyDto } from './dto/submit-feedback-for-company.dto';
import { SubmitFeedbackForProfessionalDto } from './dto/submit-feedback-for-professional.dto';
import { newId } from '@/shared/utils/unique-id';
import { JsonValue } from '@prisma/client/runtime/library';

@Injectable()
export class ProjectFeedbackService {
  constructor(private readonly postgresService: PostgresPrismaService) {}

  // Feedback submitted by professional
  async submitFeedbackForCompany(
    feedback: SubmitFeedbackForCompanyDto,
    projectId: string,
    userId: string,
  ) {
    return this.postgresService.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: {
          id: projectId,
          professional: {
            id: userId,
          },
        },
        select: {
          companyId: true,
          status: true,
          company: {
            select: {
              CompanyProfile: {
                select: {
                  feedbackCount: true,
                  totalRating: true,
                },
              },
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      } else if (project.status !== 'Completed') {
        throw new BadRequestException(
          'Feedback can only be submitted for completed projects',
        );
      }
      const {
        companyId,
        company: { CompanyProfile: companyProfile },
      } = project;

      let createdFeedback;
      try {
        createdFeedback = await tx.projectFeedback.create({
          data: {
            ...feedback,
            id: newId('professionalFeedback'),
            projectId,
            receiverType: 'COMPANY',
            receiverId: companyId,
          },
        });
      } catch (error) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Feedback already exists');
        }
        throw error;
      }

      // Update the company rating
      const { feedbackCount, totalRating } = companyProfile;
      const newTotalRating = this.calculateNewTotalRating(
        totalRating,
        feedback.stars,
        feedbackCount,
      );
      await tx.companyProfile.update({
        where: {
          companyId,
        },
        data: {
          feedbackCount: feedbackCount + 1,
          totalRating: newTotalRating,
        },
      });

      return createdFeedback;
    });
  }

  // Feedback submitted by company
  async submitFeedbackForProfessional(
    feedback: SubmitFeedbackForProfessionalDto,
    projectId: string,
    companyId: string,
  ) {
    return this.postgresService.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: {
          id: projectId,
          companyId,
        },
        select: {
          professional: {
            select: {
              id: true,
              UserProfile: {
                select: {
                  feedbackCount: true,
                  totalRating: true,
                  skillRatings: true,
                },
              },
            },
          },
          status: true,
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      } else if (project.status !== 'Completed') {
        throw new BadRequestException(
          'Feedback can only be submitted for completed projects',
        );
      }

      const stars = this.calculateProfessionalFeedbackStars(
        feedback.skillRatings,
      );
      const {
        professional: { id: userId, UserProfile: userProfile },
      } = project;

      let createdFeedback;
      try {
        createdFeedback = await tx.projectFeedback.create({
          data: {
            id: newId('companyFeedback'),
            comment: feedback.comment,
            meta: { skillRatings: feedback.skillRatings },
            stars,
            projectId,
            receiverType: 'USER',
            receiverId: userId,
          },
        });
      } catch (error) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Feedback already exists');
        }
        throw error;
      }

      const { feedbackCount, totalRating, skillRatings } = userProfile;
      const newTotalRating = this.calculateNewTotalRating(
        totalRating,
        stars,
        feedbackCount,
      );
      const updatedSkillRatings = this.calculateProfessionalSkillsRatings(
        feedback.skillRatings,
        skillRatings as Record<string, { rating: number; count: number }>,
      );

      await tx.userProfile.update({
        where: {
          userId,
        },
        data: {
          totalRating: newTotalRating,
          feedbackCount: feedbackCount + 1,
          skillRatings: updatedSkillRatings as unknown as JsonValue,
        },
      });

      return createdFeedback;
    });
  }

  private calculateNewTotalRating(
    prevRating: number,
    newRating: number,
    ratingCount: number,
  ) {
    return (prevRating * ratingCount + newRating) / (ratingCount + 1);
  }

  private calculateProfessionalSkillsRatings(
    newSkillRatings: Record<string, number>,
    prevSkillRatings: Record<string, { rating: number; count: number }>,
  ) {
    const updatedSkillRatings: Record<
      string,
      { rating: number; count: number }
    > = {};

    for (const [key, newRating] of Object.entries(newSkillRatings)) {
      // If the skill was previously rated, update the rating
      if (prevSkillRatings[key]) {
        const prev = prevSkillRatings[key];
        const calculatedRating =
          (prev.rating * prev.count + newRating) / (prev.count + 1);

        updatedSkillRatings[key] = {
          rating: calculatedRating,
          count: prev.count + 1,
        };
      }
      // If this is a new skill rating, add its rating
      else {
        updatedSkillRatings[key] = {
          rating: newRating,
          count: 1,
        };
      }
    }

    return {
      ...prevSkillRatings,
      ...updatedSkillRatings,
    };
  }

  private calculateProfessionalFeedbackStars(
    skillRatings: Record<string, number>,
  ) {
    const numOfSkills = Object.keys(skillRatings).length;
    const totalRatings = Object.values(skillRatings).reduce(
      (prev, curr) => prev + curr,
      0,
    );

    return totalRatings / numOfSkills;
  }
}
