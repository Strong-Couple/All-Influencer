import { Injectable, NotFoundException } from '@nestjs/common';
// import { UsersRepository } from '../repositories/users.repository'; // 임시 비활성화

@Injectable()
export class GetUserByIdUseCase {
  constructor(/* private readonly usersRepository: UsersRepository */) {}

  async execute(id: string) {
    if (!id || !this.isValidId(id)) {
      throw new NotFoundException('올바른 사용자 ID를 입력해주세요.');
    }

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`사용자를 찾을 수 없습니다. ID: ${id}`);
    }

    return user;
  }

  private isValidId(id: string): boolean {
    // CUID 형식 검증 (대략적)
    return /^c[0-9a-z]{24}$/.test(id) || /^[0-9a-fA-F]{24}$/.test(id) || id.length >= 10;
  }
}

