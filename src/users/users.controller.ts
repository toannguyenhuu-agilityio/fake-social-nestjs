import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Public } from 'src/shared/decorators/public.decorator';
import { UserEntity } from './dto/user.entity';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiCreateUserDocs,
  ApiDeleteUserDocs,
  ApiGetUserDocs,
  ApiGetUsersDocs,
  ApiUpdateUserDocs,
} from './decorators';
import { PaginationQueryDto } from 'src/shared/dtos';
import { CacheContext } from 'src/caching/cache.context';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private cache: CacheContext,
  ) {}

  @ApiGetUserDocs()
  @Get(':id')
  async getUser(@Param('id', new ParseUUIDPipe()) id: string) {
    const cacheKey = `user_${id}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const user = await this.usersService.getUserById(id);

    const transformedUser = new UserEntity(user);

    await this.cache.set(cacheKey, transformedUser, 300000);

    return transformedUser;
  }

  @ApiGetUsersDocs()
  @Get()
  async getUsers(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  @Public()
  @ApiCreateUserDocs()
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);

    return new UserEntity(user);
  }

  @ApiUpdateUserDocs()
  @Patch(':id')
  async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @ApiDeleteUserDocs()
  @Delete(':id')
  async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.usersService.delete(id);

    return new UserEntity(user);
  }
}
