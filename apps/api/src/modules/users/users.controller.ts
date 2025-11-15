import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { Public } from '../auth/decorators/public.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '사용자 생성', description: '새로운 사용자를 생성합니다.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '사용자가 성공적으로 생성되었습니다.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '잘못된 요청 데이터입니다.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: '이미 존재하는 사용자입니다.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: '사용자 목록 조회', description: '페이지네이션과 필터링을 지원하는 사용자 목록을 조회합니다. (공개 API)' })
  @ApiResponse({ status: HttpStatus.OK, description: '사용자 목록이 성공적으로 조회되었습니다.' })
  findAll(@Query() query: QueryUsersDto) {
    const { page = 1, limit = 10, ...filters } = query;
    return this.usersService.findAll({ page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: '사용자 상세 조회', description: '특정 사용자의 상세 정보를 조회합니다.' })
  @ApiParam({ name: 'id', description: '사용자 UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: HttpStatus.OK, description: '사용자 정보가 성공적으로 조회되었습니다.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '사용자를 찾을 수 없습니다.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '사용자 정보 수정', description: '특정 사용자의 정보를 수정합니다.' })
  @ApiParam({ name: 'id', description: '사용자 UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: HttpStatus.OK, description: '사용자 정보가 성공적으로 수정되었습니다.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '사용자를 찾을 수 없습니다.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '잘못된 요청 데이터입니다.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '사용자 삭제', description: '특정 사용자를 삭제합니다.' })
  @ApiParam({ name: 'id', description: '사용자 UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: '사용자가 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '사용자를 찾을 수 없습니다.' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

