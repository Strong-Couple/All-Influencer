import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../common/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { LocalSignupDto } from './dto/signup.dto';
import { LocalLoginDto } from './dto/login.dto';

@Injectable()
export class LocalAuthService {
  private readonly logger = new Logger(LocalAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 플랫폼 자체 회원가입
   */
  async signup(signupDto: LocalSignupDto) {
    const { email, password, role, displayName } = signupDto;

    try {
      // 1. 이메일 중복 검사
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      // 2-1. 기존 OAuth 사용자가 있는 경우 (패스워드가 없는 경우) - 계정 통합
      if (existingUser && !existingUser.passwordHash) {
        this.logger.log(`Integrating OAuth user with local auth: ${email}`);
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const updatedUser = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash: hashedPassword,
            displayName: displayName || existingUser.displayName,
            role: role as UserRole,
          },
        });

        // 역할별 프로필 생성
        await this.createRoleProfile(updatedUser.id, role);

        return {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            displayName: updatedUser.displayName,
            role: updatedUser.role,
          },
        };
      }

      // 2-2. 이미 Local 계정이 있는 경우 - 중복 에러
      if (existingUser && existingUser.passwordHash) {
        throw new ConflictException('이미 가입된 이메일입니다.');
      }

      // 3. 새 사용자 생성
      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = await this.prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          displayName,
          role: role as UserRole,
        },
      });

      // 역할별 프로필 생성
      await this.createRoleProfile(newUser.id, role);

      this.logger.log(`New local user created: ${email}`);

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          displayName: newUser.displayName,
          role: newUser.role,
        },
      };
    } catch (error) {
      this.logger.error(`Local signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      
      if (error instanceof ConflictException) {
        throw error;
      }
      
      throw new BadRequestException('회원가입 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 플랫폼 자체 로그인
   */
  async login(loginDto: LocalLoginDto) {
    const { email, password } = loginDto;

    try {
      // 1. 사용자 조회
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          influencerProfile: true,
          advertiserCompany: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
      }

      // 2. Local 계정 확인 (OAuth 전용 계정이면 로그인 불가)
      if (!user.passwordHash) {
        throw new UnauthorizedException(
          '소셜 로그인 계정입니다. 소셜 로그인을 이용해 주세요.'
        );
      }

      // 3. 비밀번호 검증
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
      }

      // 4. 마지막 로그인 시간 업데이트
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      this.logger.log(`Local login successful: ${email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          avatar: user.avatar,
          influencerProfile: user.influencerProfile,
          advertiserCompany: user.advertiserCompany,
        },
      };
    } catch (error) {
      this.logger.warn(`Local login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new BadRequestException('로그인 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 역할별 프로필 생성
   */
  private async createRoleProfile(userId: string, role: 'INFLUENCER' | 'ADVERTISER') {
    try {
      if (role === 'INFLUENCER') {
        await this.prisma.influencerProfile.create({
          data: {
            userId,
            categories: [],
            followers: 0,
            avgEngagement: 0.0,
            languages: ['ko'],
            skills: [],
            portfolioUrls: [],
          },
        });
      } else if (role === 'ADVERTISER') {
        await this.prisma.advertiserCompany.create({
          data: {
            userId,
            companyName: '미설정',
            industry: '미분류',
          },
        });
      }
    } catch (error) {
      this.logger.warn(`Failed to create profile for role ${role}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // 프로필 생성 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  /**
   * JWT 페이로드 생성
   */
  createJwtPayload(user: any) {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    };
  }
}
