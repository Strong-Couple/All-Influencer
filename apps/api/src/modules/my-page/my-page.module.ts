import { Module } from '@nestjs/common';

// Core Modules
import { PrismaModule } from '../../common/database/prisma.module';
import { AuthModule } from '../auth/auth.module';

// Controllers
import { MyPageController } from './controllers/my-page.controller';
import { InfluencerMyPageController } from './controllers/influencer-mypage.controller';
import { AdvertiserMyPageController } from './controllers/advertiser-mypage.controller';

// Services
import { InfluencerMyPageService } from './services/influencer-mypage.service';
import { AdvertiserMyPageService } from './services/advertiser-mypage.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule, // JwtAuthGuard, RolesGuard, CurrentUser 데코레이터 사용을 위해
  ],
  controllers: [
    MyPageController,
    InfluencerMyPageController,
    AdvertiserMyPageController,
  ],
  providers: [
    InfluencerMyPageService,
    AdvertiserMyPageService,
  ],
  exports: [
    InfluencerMyPageService,
    AdvertiserMyPageService,
  ],
})
export class MyPageModule {}
