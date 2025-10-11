import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { hashPassword } from 'src/shared/utils';
import { PaginationQueryDto } from 'src/shared/dtos';
import { User } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserByEmail(email: string): Promise<User | null> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      throw new NotFoundException('Email still not registered');
    }

    return existingUser;
  }

  async getUserById(id: string) {
    return await this.checkUserExists(id);
  }

  async findAll({
    page,
    limit,
    orderBy = 'createdAt',
    sort = 'desc',
  }: PaginationQueryDto) {
    const skip = (page - 1) * limit;

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { [orderBy]: sort },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const lastPage = Math.ceil(total / limit);
    const nextPage = page + 1 > lastPage ? null : page + 1;

    return {
      data: users,
      meta: {
        currentPage: page,
        totalPages: lastPage,
        itemsPerPage: limit,
        totalItems: total,
        lastPage,
        nextPage,
      },
    };
  }

  async create(dto: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hassedPassword = await hashPassword(dto.password);

    return this.prisma.user.create({
      data: {
        ...dto,
        password: hassedPassword,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.checkUserExists(id);

    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });
  }

  async delete(id: string) {
    await this.checkUserExists(id);

    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async checkUserExists(id: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });

    if (!existingUser) throw new NotFoundException('User not found');

    return existingUser;
  }
}
