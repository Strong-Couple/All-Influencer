import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

export interface OAuthUser {
  provider: 'GOOGLE' | 'KAKAO' | 'NAVER';
  providerId: string;
  email?: string;
  name?: string;
  avatar?: string;
  rawProfile: any;
}

/**
 * Google OAuth2.0 전략
 * 사용자를 Google로 리다이렉트하고 콜백에서 프로필 정보를 수신
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_REDIRECT_URI'),
      scope: ['profile', 'email'], // 프로필과 이메일 정보 요청
    });
  }

  /**
   * Google 인증 완료 후 호출되는 검증 함수
   * @param accessToken Google 액세스 토큰
   * @param refreshToken Google 리프레시 토큰  
   * @param profile Google 프로필 정보
   * @param done 콜백 함수
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      // Google 프로필에서 필요한 정보 추출
      const { id, emails, name, photos } = profile;
      
      const email = emails?.[0]?.value;
      const displayName = name ? `${name.givenName} ${name.familyName}`.trim() : undefined;
      const avatar = photos?.[0]?.value;

      // 이메일 인증 확인
      const verifiedEmail = emails?.[0]?.verified;
      if (email && !verifiedEmail) {
        // Google에서 이메일이 인증되지 않은 경우 경고 로그
        console.warn(`Google email not verified for user ${id}`);
      }

      const user: OAuthUser = {
        provider: 'GOOGLE',
        providerId: id,
        email: email,
        name: displayName,
        avatar: avatar,
        rawProfile: {
          id,
          email,
          verified_email: verifiedEmail,
          name: displayName,
          given_name: name?.givenName,
          family_name: name?.familyName,
          picture: avatar,
          locale: profile.locale,
          accessToken, // 필요시 저장용
          refreshToken, // 필요시 저장용
        },
      };

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
