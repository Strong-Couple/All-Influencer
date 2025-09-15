import { Injectable, ConflictException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database';
import { TokenService } from './services/token.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto, LoginDto, AuthResponseDto, RefreshResponseDto } from './dto';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * 회원가입
   */
  async signUp(signUpDto: SignUpDto): Promise<AuthResponseDto> {
    const { email, username, password, role, displayName, avatar, bio, website } = signUpDto;

    // 이메일 중복 확인
    const existingUserByEmail = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('이미 사용중인 이메일입니다.');
    }

    // 사용자명 중복 확인
    const existingUserByUsername = await this.prismaService.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      throw new ConflictException('이미 사용중인 사용자명입니다.');
    }

    // 비밀번호 해시화
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // 웹사이트 URL 검증
    if (website && !this.isValidUrl(website)) {
      throw new BadRequestException('올바른 웹사이트 URL을 입력해주세요.');
    }

    try {
      // 사용자 생성
      const user = await this.prismaService.user.create({
        data: {
          email,
          username,
          passwordHash,
          displayName,
          role,
          status: UserStatus.ACTIVE,
          avatar,
          bio,
          website,
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          role: true,
          status: true,
          bio: true,
          website: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // 역할에 따른 프로필 생성
      await this.createUserProfile(user.id, role);

      // 토큰 생성
      const accessToken = this.tokenService.generateAccessToken(user.id, user.email, user.role);
      const refreshToken = await this.tokenService.generateRefreshToken(user.id);

      this.logger.log(`New user registered: ${user.email} (${user.role})`);

      return {
        user,
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15분
      };
    } catch (error) {
      this.logger.error(`Sign up failed: ${error.message}`, error.stack);
      throw new BadRequestException('회원가입에 실패했습니다.');
    }
  }

  /**
   * 로그인
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // 사용자 조회
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        displayName: true,
        avatar: true,
        role: true,
        status: true,
        bio: true,
        website: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 계정 상태 확인
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('비활성화된 계정입니다. 고객센터에 문의해주세요.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 마지막 로그인 시간 업데이트
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 토큰 생성
    const accessToken = this.tokenService.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = await this.tokenService.generateRefreshToken(user.id);

    this.logger.log(`User logged in: ${user.email}`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15분
    };
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponseDto> {
    try {
      return await this.tokenService.rotateTokens(refreshToken);
    } catch (error) {
      this.logger.warn(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('토큰 갱신에 실패했습니다. 다시 로그인해주세요.');
    }
  }

  /**
   * 로그아웃
   */
  async logout(refreshToken: string): Promise<{ message: string }> {
    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);
      await this.tokenService.revokeRefreshToken(payload.jti);
      
      this.logger.log(`User logged out: ${payload.sub}`);
      
      return { message: '성공적으로 로그아웃되었습니다.' };
    } catch (error) {
      this.logger.warn(`Logout failed: ${error.message}`);
      // 로그아웃은 실패해도 성공으로 처리
      return { message: '로그아웃되었습니다.' };
    }
  }

  /**
   * 모든 기기에서 로그아웃
   */
  async logoutAll(userId: string): Promise<{ message: string }> {
    try {
      await this.tokenService.revokeAllUserRefreshTokens(userId);
      
      this.logger.log(`User logged out from all devices: ${userId}`);
      
      return { message: '모든 기기에서 로그아웃되었습니다.' };
    } catch (error) {
      this.logger.warn(`Logout all failed: ${error.message}`);
      return { message: '로그아웃되었습니다.' };
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getMe(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        status: true,
        bio: true,
        website: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        influencerProfile: {
          include: {
            channels: true,
          },
        },
        advertiserCompany: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  /**
   * 사용자 역할에 따른 프로필 생성
   */
  private async createUserProfile(userId: string, role: UserRole) {
    try {
      if (role === UserRole.INFLUENCER) {
        await this.prismaService.influencerProfile.create({
          data: {
            userId,
            categories: [],
            followers: 0,
            avgEngagement: 0.0,
            location: null,
            languages: ['ko'],
          },
        });
      } else if (role === UserRole.ADVERTISER) {
        // 광고주는 별도로 회사 정보를 등록해야 함
        // 여기서는 기본 프로필만 생성하지 않음
      }
    } catch (error) {
      this.logger.warn(`Failed to create user profile: ${error.message}`);
      // 프로필 생성 실패는 사용자 생성을 막지 않음
    }
  }

  /**
   * OAuth 계정 정보를 포함한 사용자 조회
   */
  async getUserWithIdentities(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        status: true,
        bio: true,
        website: true,
        createdAt: true,
        lastLoginAt: true,
        passwordHash: true, // 패스워드 계정 여부 확인용
        identities: {
          select: {
            provider: true,
            email: true,
            linkedAt: true,
            updatedAt: true,
          },
          orderBy: { linkedAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    // OAuth 계정 정보 포맷팅
    const linkedAccounts = user.identities?.map(identity => ({
      provider: identity.provider.toLowerCase(),
      email: identity.email,
      linkedAt: identity.linkedAt,
      lastUpdated: identity.updatedAt,
    })) || [];

    const { passwordHash, identities, ...userWithoutSensitive } = user;

    return {
      ...userWithoutSensitive,
      linkedAccounts,
      hasPassword: !!passwordHash,
      authMethods: {
        password: !!passwordHash,
        oauth: linkedAccounts.length > 0,
        providers: linkedAccounts.map(acc => acc.provider),
      },
    };
  }

  /**
   * 마지막 로그인 시간 업데이트
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * URL 유효성 검사
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

