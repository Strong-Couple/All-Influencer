import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
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
import { InfluencerMyPageService } from '../services/influencer-mypage.service';
import { UpdateInfluencerResumeDto, CreateScrapDto } from '../dto/influencer.dto';
import { ApplicationFilterDto, PaginationDto } from '../dto/common.dto';

@ApiTags('Influencer MyPage')
@Controller('my/influencer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('INFLUENCER')
@ApiBearerAuth()
export class InfluencerMyPageController {
  private readonly logger = new Logger(InfluencerMyPageController.name);

  constructor(
    private readonly influencerMyPageService: InfluencerMyPageService,
  ) {}

  @Get('overview')
  @ApiOperation({
    summary: '인플루언서 마이페이지 개요',
    description: '프로필 요약, 지원 현황 카운트, 스크랩 수 등을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '개요 정보 조회 성공',
    schema: {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: {
            headline: { type: 'string', nullable: true },
            totalFollowers: { type: 'number' },
            avgEngagement: { type: 'number' },
            ratePerPost: { type: 'number', nullable: true },
            channelCount: { type: 'number' },
          },
        },
        applications: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            pending: { type: 'number' },
            accepted: { type: 'number' },
            rejected: { type: 'number' },
            withdrawn: { type: 'number' },
          },
        },
        scrapCount: { type: 'number' },
        stats: {
          type: 'object',
          properties: {
            completedContracts: { type: 'number' },
            avgRating: { type: 'number' },
          },
        },
      },
    },
  })
  async getOverview(@CurrentUser('id') userId: string) {
    return this.influencerMyPageService.getOverview(userId);
  }

  @Get('resume')
  @ApiOperation({
    summary: '인플루언서 이력서 조회',
    description: '자신의 이력서 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '이력서 정보 조회 성공',
  })
  async getResume(@CurrentUser('id') userId: string) {
    return this.influencerMyPageService.getResume(userId);
  }

  @Put('resume')
  @ApiOperation({
    summary: '인플루언서 이력서 수정',
    description: '자신의 이력서 정보를 수정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '이력서 수정 성공',
  })
  async updateResume(
    @CurrentUser('id') userId: string,
    @Body() updateData: UpdateInfluencerResumeDto,
  ) {
    return this.influencerMyPageService.updateResume(userId, updateData);
  }

  @Get('applications')
  @ApiOperation({
    summary: '내 지원 현황 조회',
    description: '자신이 지원한 공고들의 현황을 조회합니다.',
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
    description: '지원 현황 조회 성공',
  })
  async getMyApplications(
    @CurrentUser('id') userId: string,
    @Query() filters: ApplicationFilterDto,
  ) {
    return this.influencerMyPageService.getMyApplications(userId, filters);
  }

  @Get('scraps')
  @ApiOperation({
    summary: '내 스크랩 목록 조회',
    description: '자신이 스크랩한 공고들을 조회합니다.',
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
    description: '스크랩 목록 조회 성공',
  })
  async getMyScraps(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.influencerMyPageService.getMyScraps(userId, pagination);
  }

  @Post('scraps')
  @ApiOperation({
    summary: '공고 스크랩 생성',
    description: '관심 있는 공고를 스크랩합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '스크랩 생성 성공',
  })
  @ApiResponse({
    status: 409,
    description: '이미 스크랩한 공고',
  })
  async createScrap(
    @CurrentUser('id') userId: string,
    @Body() createScrapDto: CreateScrapDto,
  ) {
    return this.influencerMyPageService.createScrap(userId, createScrapDto.jobPostId);
  }

  @Delete('scraps/:jobPostId')
  @ApiOperation({
    summary: '스크랩 삭제',
    description: '스크랩한 공고를 제거합니다.',
  })
  @ApiParam({
    name: 'jobPostId',
    description: '공고 ID',
  })
  @ApiResponse({
    status: 200,
    description: '스크랩 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '스크랩을 찾을 수 없음',
  })
  async deleteScrap(
    @CurrentUser('id') userId: string,
    @Param('jobPostId') jobPostId: string,
  ) {
    return this.influencerMyPageService.deleteScrap(userId, jobPostId);
  }
}
