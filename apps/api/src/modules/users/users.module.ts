import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
// import { UsersRepository } from './repositories/users.repository'; // 임시 비활성화
import {
  // CreateUserUseCase, // 임시 비활성화
  GetUsersUseCase,
  GetUserByIdUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
} from './use-cases';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    // UsersRepository, // 임시 비활성화
    // CreateUserUseCase, // 임시 비활성화
    GetUsersUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [UsersService], // UsersRepository 제거
})
export class UsersModule {}
