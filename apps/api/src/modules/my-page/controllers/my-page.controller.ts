import {
  Controller,
  Get,
  UseGuards,
  Redirect,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('MyPage')
@Controller('my')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MyPageController {
  private readonly logger = new Logger(MyPageController.name);

  @Get('')
  @ApiOperation({
    summary: '마이페이지 메인 (리다이렉트)',
    description: '사용자의 역할에 따라 적절한 마이페이지로 리다이렉트합니다.',
  })
  @ApiResponse({
    status: 302,
    description: '역할별 마이페이지로 리다이렉트',
    headers: {
      Location: {
        description: '리다이렉트될 URL (/my/influencer 또는 /my/advertiser)',
        schema: { type: 'string' },
      },
    },
  })
  async redirectToRolePage(@CurrentUser() user: any) {
    const { role } = user;

    this.logger.log(`MyPage redirect for user ${user.sub} with role ${role}`);

    if (role === 'INFLUENCER') {
      return { url: '/my/influencer' };
    } else if (role === 'ADVERTISER') {
      return { url: '/my/advertiser' };
    } else {
      // ADMIN이거나 기타 역할의 경우 기본적으로 인플루언서로
      return { url: '/my/influencer' };
    }
  }
}
