import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AdvertiserMyPageService } from '../services/advertiser-mypage.service';
import { JobPostFilterDto, ApplicationFilterDto } from '../dto/common.dto';

@ApiTags('Advertiser MyPage')
@Controller('my/advertiser')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADVERTISER')
@ApiBearerAuth()
export class AdvertiserMyPageController {
  private readonly logger = new Logger(AdvertiserMyPageController.name);

  constructor(
    private readonly advertiserMyPageService: AdvertiserMyPageService,
  ) {}

  @Get('overview')
  @ApiOperation({
    summary: '사업자 마이페이지 개요',
    description: '내가 작성한 공고 개수, 진행중/마감 카운트, 최근 지원자 수 등을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '개요 정보 조회 성공',
    schema: {
      type: 'object',
      properties: {
        company: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            industry: { type: 'string' },
            description: { type: 'string', nullable: true },
          },
        },
        jobPosts: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            open: { type: 'number' },
            closed: { type: 'number' },
            completed: { type: 'number' },
            cancelled: { type: 'number' },
          },
        },
        recentStats: {
          type: 'object',
          properties: {
            recentApplications: { type: 'number' },
            activeContracts: { type: 'number' },
            avgRating: { type: 'number' },
          },
        },
      },
    },
  })
  async getOverview(@CurrentUser('id') userId: string) {
    return this.advertiserMyPageService.getOverview(userId);
  }

  @Get('job-posts')
  @ApiOperation({
    summary: '내가 작성한 공고 목록 조회',
    description: '자신이 작성한 공고들을 조회합니다.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['OPEN', 'CLOSED', 'COMPLETED', 'CANCELLED'],
    description: '공고 상태 필터',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: 'string',
    description: '페이지네이션 커서',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: '한 페이지 항목 수 (기본: 20, 최대: 100)',
  })
  @ApiResponse({
    status: 200,
    description: '공고 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              budget: { type: 'number', nullable: true },
              categories: { type: 'array', items: { type: 'string' } },
              platforms: { type: 'array', items: { type: 'string' } },
              deadline: { type: 'string', format: 'date-time', nullable: true },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              stats: {
                type: 'object',
                properties: {
                  applicationCount: { type: 'number' },
                  offerCount: { type: 'number' },
                },
              },
              recentApplicants: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        displayName: { type: 'string' },
                        avatar: { type: 'string', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        hasMore: { type: 'boolean' },
        nextCursor: { type: 'string', nullable: true },
      },
    },
  })
  async getMyJobPosts(
    @CurrentUser('id') userId: string,
    @Query() filters: JobPostFilterDto,
  ) {
    return this.advertiserMyPageService.getMyJobPosts(userId, filters);
  }

  @Get('job-posts/:jobPostId/applicants')
  @ApiOperation({
    summary: '특정 공고의 지원자 목록 조회',
    description: '자신이 작성한 특정 공고에 지원한 인플루언서들을 조회합니다.',
  })
  @ApiParam({
    name: 'jobPostId',
    description: '공고 ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
    description: '지원서 상태 필터',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: 'string',
    description: '페이지네이션 커서',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: '한 페이지 항목 수 (기본: 20, 최대: 100)',
  })
  @ApiResponse({
    status: 200,
    description: '지원자 목록 조회 성공',
    schema: {
      type: 'object',
      properties: {
        jobPost: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
          },
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string' },
              coverLetter: { type: 'string', nullable: true },
              proposedRate: { type: 'number', nullable: true },
              appliedAt: { type: 'string', format: 'date-time' },
              influencer: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  displayName: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                  profile: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      headline: { type: 'string', nullable: true },
                      followers: { type: 'number' },
                      avgEngagement: { type: 'number' },
                      categories: { type: 'array', items: { type: 'string' } },
                      ratePerPost: { type: 'number', nullable: true },
                      channelCount: { type: 'number' },
                      topChannels: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            platform: { type: 'string' },
                            followers: { type: 'number' },
                            url: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        hasMore: { type: 'boolean' },
        nextCursor: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 공고',
  })
  @ApiResponse({
    status: 403,
    description: '해당 공고에 대한 권한이 없음',
  })
  async getJobPostApplicants(
    @CurrentUser('id') userId: string,
    @Param('jobPostId') jobPostId: string,
    @Query() filters: ApplicationFilterDto,
  ) {
    return this.advertiserMyPageService.getJobPostApplicants(userId, jobPostId, filters);
  }
}
