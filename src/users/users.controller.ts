import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDTO } from './dto';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.usersService.getUserById(id);
  }

  @Get()
  async getUsers(@Query('page') page: number, @Query('limit') limit: number) {
    return this.usersService.findAll({ page, limit });
  }

  @Public()
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDTO) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
