import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { OAuthUser } from './google.strategy';

/**
 * Kakao OAuth 전략
 * 카카오 로그인을 통한 사용자 인증
 */
@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'), // 선택적
      callbackURL: configService.get<string>('KAKAO_REDIRECT_URI'),
      scope: ['profile_nickname', 'profile_image', 'account_email'], // 이메일은 별도 동의 필요
    });
  }

  /**
   * Kakao 인증 완료 후 호출되는 검증 함수
   * @param accessToken Kakao 액세스 토큰
   * @param refreshToken Kakao 리프레시 토큰
   * @param profile Kakao 프로필 정보
   * @param done 콜백 함수
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<void> {
    try {
      // Kakao 프로필 구조: profile._json
      const kakaoProfile = profile._json;
      const kakaoAccount = kakaoProfile.kakao_account;
      const kakaoProfileInfo = kakaoAccount?.profile;

      // 카카오 고유 ID
      const providerId = kakaoProfile.id.toString();
      
      // 이메일 (동의한 경우에만)
      let email: string | undefined;
      if (kakaoAccount?.has_email && kakaoAccount?.is_email_verified) {
        email = kakaoAccount.email;
      }

      // 프로필 정보
      const nickname = kakaoProfileInfo?.nickname;
      const profileImage = kakaoProfileInfo?.profile_image_url;
      const thumbnailImage = kakaoProfileInfo?.thumbnail_image_url;

      const user: OAuthUser = {
        provider: 'KAKAO',
        providerId,
        email,
        name: nickname,
        avatar: profileImage || thumbnailImage,
        rawProfile: {
          id: providerId,
          nickname,
          profile_image: profileImage,
          thumbnail_image: thumbnailImage,
          email,
          has_email: kakaoAccount?.has_email,
          is_email_verified: kakaoAccount?.is_email_verified,
          connected_at: kakaoProfile.connected_at,
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
