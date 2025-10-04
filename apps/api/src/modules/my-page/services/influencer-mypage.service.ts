import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { UpdateInfluencerResumeDto } from '../dto/influencer.dto';
import { ApplicationFilterDto, PaginationDto } from '../dto/common.dto';
import { ApplicationStatus, JobPostStatus } from '@prisma/client';

@Injectable()
export class InfluencerMyPageService {
  private readonly logger = new Logger(InfluencerMyPageService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 인플루언서 개요 정보 조회
   */
  async getOverview(userId: string) {
    try {
      // 인플루언서 프로필 확인
      const influencerProfile = await this.prisma.influencerProfile.findUnique({
        where: { userId },
        include: {
          channels: true,
        },
      });

      if (!influencerProfile) {
        throw new NotFoundException('인플루언서 프로필을 찾을 수 없습니다.');
      }

      // 지원 현황 카운트
      const applicationCounts = await this.prisma.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: { _all: true },
      });

      const statusCounts = {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0,
      };

      applicationCounts.forEach((count) => {
        statusCounts.total += count._count._all;
        switch (count.status) {
          case ApplicationStatus.PENDING:
            statusCounts.pending = count._count._all;
            break;
          case ApplicationStatus.ACCEPTED:
            statusCounts.accepted = count._count._all;
            break;
          case ApplicationStatus.REJECTED:
            statusCounts.rejected = count._count._all;
            break;
          case ApplicationStatus.WITHDRAWN:
            statusCounts.withdrawn = count._count._all;
            break;
        }
      });

      // 스크랩 수
      const scrapCount = await this.prisma.scrap.count({
        where: { userId },
      });

      // 총 팔로워 수 (모든 채널 합계)
      const totalFollowers = influencerProfile.channels.reduce(
        (sum, channel) => sum + channel.followers,
        0
      );

      return {
        profile: {
          headline: influencerProfile.headline,
          totalFollowers,
          avgEngagement: influencerProfile.avgEngagement,
          ratePerPost: influencerProfile.ratePerPost,
          channelCount: influencerProfile.channels.length,
        },
        applications: statusCounts,
        scrapCount,
        stats: {
          completedContracts: await this.prisma.contract.count({
            where: {
              userId,
              status: 'COMPLETED',
            },
          }),
          avgRating: await this.getAverageRating(userId),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get influencer overview: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * 인플루언서 이력서 조회
   */
  async getResume(userId: string) {
    try {
      const influencerProfile = await this.prisma.influencerProfile.findUnique({
        where: { userId },
      });

      if (!influencerProfile) {
        throw new NotFoundException('인플루언서 프로필을 찾을 수 없습니다.');
      }

      return {
        headline: influencerProfile.headline,
        bio: influencerProfile.bio,
        skills: influencerProfile.skills,
        portfolioUrls: influencerProfile.portfolioUrls,
        resumeJson: influencerProfile.resumeJson,
        categories: influencerProfile.categories,
        location: influencerProfile.location,
        languages: influencerProfile.languages,
        ratePerPost: influencerProfile.ratePerPost,
        updatedAt: influencerProfile.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to get influencer resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * 인플루언서 이력서 수정
   */
  async updateResume(userId: string, updateData: UpdateInfluencerResumeDto) {
    try {
      const influencerProfile = await this.prisma.influencerProfile.findUnique({
        where: { userId },
      });

      if (!influencerProfile) {
        throw new NotFoundException('인플루언서 프로필을 찾을 수 없습니다.');
      }

      const updatedProfile = await this.prisma.influencerProfile.update({
        where: { userId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Influencer resume updated: ${userId}`);

      return {
        headline: updatedProfile.headline,
        bio: updatedProfile.bio,
        skills: updatedProfile.skills,
        portfolioUrls: updatedProfile.portfolioUrls,
        resumeJson: updatedProfile.resumeJson,
        updatedAt: updatedProfile.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to update influencer resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * 내 지원 현황 조회
   */
  async getMyApplications(userId: string, filters: ApplicationFilterDto) {
    try {
      const { cursor, limit = 20, status } = filters;

      const whereClause: any = { userId };
      if (status) {
        whereClause.status = status as ApplicationStatus;
      }

      if (cursor) {
        whereClause.id = { lt: cursor };
      }

      const applications = await this.prisma.application.findMany({
        where: whereClause,
        include: {
          jobPost: {
            select: {
              id: true,
              title: true,
              description: true,
              budget: true,
              categories: true,
              platforms: true,
              deadline: true,
              status: true,
              user: {
                select: {
                  displayName: true,
                  avatar: true,
                },
              },
              company: {
                select: {
                  companyName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
      });

      const hasMore = applications.length > limit;
      const items = hasMore ? applications.slice(0, limit) : applications;
      const nextCursor = hasMore ? items[items.length - 1].id : null;

      return {
        items: items.map(app => ({
          id: app.id,
          status: app.status,
          coverLetter: app.coverLetter,
          proposedRate: app.proposedRate,
          appliedAt: app.createdAt,
          jobPost: {
            id: app.jobPost.id,
            title: app.jobPost.title,
            budget: app.jobPost.budget,
            categories: app.jobPost.categories,
            platforms: app.jobPost.platforms,
            deadline: app.jobPost.deadline,
            status: app.jobPost.status,
            company: app.jobPost.company?.companyName || app.jobPost.user.displayName,
          },
        })),
        hasMore,
        nextCursor,
      };
    } catch (error) {
      this.logger.error(`Failed to get influencer applications: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * 내 스크랩 목록 조회
   */
  async getMyScraps(userId: string, pagination: PaginationDto) {
    try {
      const { cursor, limit = 20 } = pagination;

      const whereClause: any = { userId };
      if (cursor) {
        whereClause.id = { lt: cursor };
      }

      const scraps = await this.prisma.scrap.findMany({
        where: whereClause,
        include: {
          jobPost: {
            include: {
              user: {
                select: {
                  displayName: true,
                  avatar: true,
                },
              },
              company: {
                select: {
                  companyName: true,
                },
              },
              _count: {
                select: {
                  applications: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
      });

      const hasMore = scraps.length > limit;
      const items = hasMore ? scraps.slice(0, limit) : scraps;
      const nextCursor = hasMore ? items[items.length - 1].id : null;

      return {
        items: items.map(scrap => ({
          id: scrap.id,
          scrapedAt: scrap.createdAt,
          jobPost: {
            id: scrap.jobPost.id,
            title: scrap.jobPost.title,
            description: scrap.jobPost.description,
            budget: scrap.jobPost.budget,
            categories: scrap.jobPost.categories,
            platforms: scrap.jobPost.platforms,
            deadline: scrap.jobPost.deadline,
            status: scrap.jobPost.status,
            company: scrap.jobPost.company?.companyName || scrap.jobPost.user.displayName,
            applicationCount: scrap.jobPost._count.applications,
          },
        })),
        hasMore,
        nextCursor,
      };
    } catch (error) {
      this.logger.error(`Failed to get influencer scraps: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * 스크랩 생성
   */
  async createScrap(userId: string, jobPostId: string) {
    try {
      // 공고 존재 확인
      const jobPost = await this.prisma.jobPost.findUnique({
        where: { id: jobPostId },
      });

      if (!jobPost) {
        throw new NotFoundException('존재하지 않는 공고입니다.');
      }

      // 자신의 공고는 스크랩할 수 없음
      if (jobPost.userId === userId) {
        throw new BadRequestException('자신의 공고는 스크랩할 수 없습니다.');
      }

      // 이미 스크랩한 경우
      const existingScrap = await this.prisma.scrap.findUnique({
        where: { userId_jobPostId: { userId, jobPostId } },
      });

      if (existingScrap) {
        throw new ConflictException('이미 스크랩한 공고입니다.');
      }

      const newScrap = await this.prisma.scrap.create({
        data: {
          userId,
          jobPostId,
        },
        include: {
          jobPost: {
            select: {
              title: true,
            },
          },
        },
      });

      this.logger.log(`Scrap created: ${userId} -> ${jobPostId}`);

      return {
        id: newScrap.id,
        jobPostId: newScrap.jobPostId,
        jobPostTitle: newScrap.jobPost.title,
        createdAt: newScrap.createdAt,
      };
    } catch (error) {
      this.logger.error(`Failed to create scrap: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * 스크랩 삭제
   */
  async deleteScrap(userId: string, jobPostId: string) {
    try {
      const scrap = await this.prisma.scrap.findUnique({
        where: { userId_jobPostId: { userId, jobPostId } },
      });

      if (!scrap) {
        throw new NotFoundException('스크랩을 찾을 수 없습니다.');
      }

      await this.prisma.scrap.delete({
        where: { id: scrap.id },
      });

      this.logger.log(`Scrap deleted: ${userId} -> ${jobPostId}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete scrap: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * 평균 평점 계산
   */
  private async getAverageRating(userId: string): Promise<number> {
    const result = await this.prisma.review.aggregate({
      where: { receiverId: userId },
      _avg: { rating: true },
    });

    return result._avg.rating || 0;
  }
}
