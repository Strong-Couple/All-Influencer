import { Injectable, NotFoundException } from '@nestjs/common';
// import { UsersRepository } from '../repositories/users.repository'; // 임시 비활성화

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string) {
    // 사용자 존재 확인
    const userExists = await this.usersRepository.exists(id);
    if (!userExists) {
      throw new NotFoundException(`사용자를 찾을 수 없습니다. ID: ${id}`);
    }

    // 사용자 삭제 (Cascade로 관련 데이터도 함께 삭제됨)
    await this.usersRepository.delete(id);
    
    return { message: '사용자가 성공적으로 삭제되었습니다.' };
  }
}

