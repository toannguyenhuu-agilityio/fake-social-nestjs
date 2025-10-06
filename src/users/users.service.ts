import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdateUserDTO } from './dto';
import { hashPassword } from 'src/shared/utils';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(identifier: string) {
    const isEmail = identifier.includes('@');

    return await this.prisma.user.findUnique({
      where: isEmail ? { email: identifier } : { id: identifier },
    });
  }

  async getUserByEmail(email: string) {
    return await this.findOne(email);
  }

  async getUserById(id: string) {
    return await this.findOne(id);
  }

  async findAll({ page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;

    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
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

  async update(id: string, dto: UpdateUserDTO) {
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
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
