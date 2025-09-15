import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver-v2';
import { ConfigService } from '@nestjs/config';
import { OAuthUser } from './google.strategy';

/**
 * Naver OAuth 전략
 * 네이버 아이디로 로그인을 통한 사용자 인증
 */
@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('NAVER_CLIENT_ID'),
      clientSecret: configService.get<string>('NAVER_CLIENT_SECRET'),
      callbackURL: configService.get<string>('NAVER_REDIRECT_URI'),
    });
  }

  /**
   * Naver 인증 완료 후 호출되는 검증 함수
   * @param accessToken Naver 액세스 토큰
   * @param refreshToken Naver 리프레시 토큰
   * @param profile Naver 프로필 정보
   * @param done 콜백 함수
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<void> {
    try {
      // Naver 프로필 구조: profile._json.response
      const naverProfile = profile._json?.response;
      
      if (!naverProfile) {
        throw new Error('Naver profile response is missing');
      }

      const {
        id,
        email,
        name,
        nickname,
        profile_image,
        age,
        gender,
        birthday,
        birthyear,
      } = naverProfile;

      // 네이버는 대부분 실명을 제공하므로 name을 우선 사용
      const displayName = name || nickname;

      const user: OAuthUser = {
        provider: 'NAVER',
        providerId: id,
        email,
        name: displayName,
        avatar: profile_image,
        rawProfile: {
          id,
          email,
          name,
          nickname,
          profile_image,
          age,
          gender,
          birthday,
          birthyear,
          accessToken,
          refreshToken,
        },
      };

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
