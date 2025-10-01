import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { JobPostFilterDto, ApplicationFilterDto } from '../dto/common.dto';
import { JobPostStatus, ApplicationStatus } from '@prisma/client';

@Injectable()
export class AdvertiserMyPageService {
  private readonly logger = new Logger(AdvertiserMyPageService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 사업자 개요 정보 조회
   */
  async getOverview(userId: string) {
    try {
      // 사업자 프로필 확인
      const advertiserCompany = await this.prisma.advertiserCompany.findUnique({
        where: { userId },
      });

      if (!advertiserCompany) {
        throw new NotFoundException('사업자 프로필을 찾을 수 없습니다.');
      }

      // 공고 현황 카운트
      const jobPostCounts = await this.prisma.jobPost.groupBy({
        by: ['status'],
        where: { userId },
        _count: { _all: true },
      });

      const statusCounts = {
        total: 0,
        open: 0,
        closed: 0,
        completed: 0,
        cancelled: 0,
      };

      jobPostCounts.forEach((count) => {
        statusCounts.total += count._count._all;
        switch (count.status) {
          case JobPostStatus.OPEN:
            statusCounts.open = count._count._all;
            break;
          case JobPostStatus.CLOSED:
            statusCounts.closed = count._count._all;
            break;
          case JobPostStatus.COMPLETED:
            statusCounts.completed = count._count._all;
            break;
          case JobPostStatus.CANCELLED:
            statusCounts.cancelled = count._count._all;
            break;
        }
      });

      // 최근 30일 지원자 수
      const recentApplicationCount = await this.prisma.application.count({
        where: {
          jobPost: { userId },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });

      // 진행 중인 계약 수
      const activeContractCount = await this.prisma.contract.count({
        where: {
          offer: {
            jobPost: { userId },
          },
          status: 'ACTIVE',
        },
      });

      // 완료된 캠페인 평균 평점
      const avgRating = await this.getAverageRating(userId);

      return {
        company: {
          name: advertiserCompany.companyName,
          industry: advertiserCompany.industry,
          description: advertiserCompany.description,
        },
        jobPosts: statusCounts,
        recentStats: {
          recentApplications: recentApplicationCount,
          activeContracts: activeContractCount,
          avgRating,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get advertiser overview: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * 내가 작성한 공고 목록 조회
   */
  async getMyJobPosts(userId: string, filters: JobPostFilterDto) {
    try {
      const { cursor, limit = 20, status } = filters;

      const whereClause: any = { userId };
      if (status) {
        whereClause.status = status as JobPostStatus;
      }

      if (cursor) {
        whereClause.id = { lt: cursor };
      }

      const jobPosts = await this.prisma.jobPost.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              applications: true,
              offers: true,
            },
          },
          applications: {
            where: { status: ApplicationStatus.PENDING },
            take: 3,
            select: {
              id: true,
              user: {
                select: {
                  displayName: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
      });

      const hasMore = jobPosts.length > limit;
      const items = hasMore ? jobPosts.slice(0, limit) : jobPosts;
      const nextCursor = hasMore ? items[items.length - 1].id : null;

      return {
        items: items.map(post => ({
          id: post.id,
          title: post.title,
          description: post.description,
          budget: post.budget,
          categories: post.categories,
          platforms: post.platforms,
          deadline: post.deadline,
          status: post.status,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          stats: {
            applicationCount: post._count.applications,
            offerCount: post._count.offers,
          },
          recentApplicants: post.applications.map(app => ({
            id: app.id,
            user: {
              displayName: app.user.displayName,
              avatar: app.user.avatar,
            },
          })),
        })),
        hasMore,
        nextCursor,
      };
    } catch (error) {
      this.logger.error(`Failed to get advertiser job posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * 특정 공고의 지원자 목록 조회
   */
  async getJobPostApplicants(userId: string, jobPostId: string, filters: ApplicationFilterDto) {
    try {
      // 공고 소유권 확인
      const jobPost = await this.prisma.jobPost.findUnique({
        where: { id: jobPostId },
        select: { userId: true, title: true },
      });

      if (!jobPost) {
        throw new NotFoundException('존재하지 않는 공고입니다.');
      }

      if (jobPost.userId !== userId) {
        throw new ForbiddenException('해당 공고에 대한 권한이 없습니다.');
      }

      const { cursor, limit = 20, status } = filters;

      const whereClause: any = { jobPostId };
      if (status) {
        whereClause.status = status as ApplicationStatus;
      }

      if (cursor) {
        whereClause.id = { lt: cursor };
      }

      const applications = await this.prisma.application.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatar: true,
              role: true,
              influencerProfile: {
                select: {
                  headline: true,
                  followers: true,
                  avgEngagement: true,
                  categories: true,
                  ratePerPost: true,
                  channels: {
                    select: {
                      platform: true,
                      followers: true,
                      channelUrl: true,
                    },
                  },
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
        jobPost: {
          id: jobPostId,
          title: jobPost.title,
        },
        items: items.map(app => ({
          id: app.id,
          status: app.status,
          coverLetter: app.coverLetter,
          proposedRate: app.proposedRate,
          appliedAt: app.createdAt,
          influencer: {
            id: app.user.id,
            displayName: app.user.displayName,
            avatar: app.user.avatar,
            profile: app.user.influencerProfile ? {
              headline: app.user.influencerProfile.headline,
              followers: app.user.influencerProfile.followers,
              avgEngagement: app.user.influencerProfile.avgEngagement,
              categories: app.user.influencerProfile.categories,
              ratePerPost: app.user.influencerProfile.ratePerPost,
              channelCount: app.user.influencerProfile.channels.length,
              topChannels: app.user.influencerProfile.channels
                .sort((a, b) => b.followers - a.followers)
                .slice(0, 3)
                .map(ch => ({
                  platform: ch.platform,
                  followers: ch.followers,
                  url: ch.channelUrl,
                })),
            } : null,
          },
        })),
        hasMore,
        nextCursor,
      };
    } catch (error) {
      this.logger.error(`Failed to get job post applicants: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * 평균 평점 계산 (내가 받은 리뷰들의 평균)
   */
  private async getAverageRating(userId: string): Promise<number> {
    const result = await this.prisma.review.aggregate({
      where: { receiverId: userId },
      _avg: { rating: true },
    });

    return result._avg.rating || 0;
  }
}
