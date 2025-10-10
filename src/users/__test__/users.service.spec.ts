import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from '../users.service';
import { MOCK_LIST_USER, MOCK_USER } from 'src/mocks';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { hashPassword } from 'src/shared/utils';

jest.mock('src/shared/utils', () => ({
  hashPassword: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      const spy = jest.fn().mockResolvedValue(MOCK_USER);
      prisma.user.findUnique = spy;

      const result = await service.getUserByEmail(MOCK_USER.email);

      expect(result).toEqual(MOCK_USER);
      expect(spy).toHaveBeenCalledWith({
        where: { email: MOCK_USER.email },
      });
    });
  });

  it('should throw NotFoundException if email not found', async () => {
    const spy = jest.fn().mockResolvedValue(null);
    prisma.user.findUnique = spy;

    await expect(service.getUserByEmail('nope@example.com')).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const spy = jest.fn().mockResolvedValue(MOCK_USER);
      prisma.user.findUnique = spy;

      const result = await service.getUserById(MOCK_USER.id);
      expect(result).toEqual(MOCK_USER);
    });

    it('should throw NotFoundException when not found', async () => {
      const spy = jest.fn().mockResolvedValue(null);
      prisma.user.findUnique = spy;

      await expect(service.getUserById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const spyFindMany = jest.fn().mockResolvedValue(MOCK_LIST_USER);
      prisma.user.findMany = spyFindMany;

      const spyCount = jest.fn().mockResolvedValue(2);
      prisma.user.count = spyCount;

      const spyTransaction = jest.fn().mockImplementation(async (actions) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const count = await actions[0];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const list = await actions[1];

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return [count, list];
      });
      prisma.$transaction = spyTransaction;

      const result = await service.findAll({ page: 1, limit: 2 });

      expect(result.data).toEqual(MOCK_LIST_USER);
      expect(result.meta.totalItems).toBe(2);
      expect(spyTransaction).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new user if email not registered', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'plain',
        firstName: 'John',
        lastName: 'Doe',
      };

      const spy = jest.fn().mockResolvedValue(null);
      prisma.user.findUnique = spy;

      (hashPassword as jest.Mock).mockResolvedValue('hashed123');

      const spyCreate = jest.fn().mockResolvedValue({ id: '1', ...dto });
      prisma.user.create = spyCreate;

      const result = await service.create(dto);

      expect(hashPassword).toHaveBeenCalledWith(dto.password);

      expect(result).toEqual({ id: '1', ...dto });
    });

    it('should throw ConflictException if email already registered', async () => {
      const spyFindUnique = jest.fn().mockResolvedValue({
        id: '1',
        email: 'exists@example.com',
      });
      prisma.user.findUnique = spyFindUnique;

      await expect(
        service.create({
          email: 'exists@example.com',
          password: '123',
          firstName: '',
          lastName: '',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update user if exists', async () => {
      const id = '1';
      const dto = { firstName: 'New' };

      const spyFindUnique = jest.fn().mockResolvedValue({ id });
      prisma.user.findUnique = spyFindUnique;

      const spyUpdate = jest.fn().mockResolvedValue({ id, ...dto });
      prisma.user.update = spyUpdate;

      const result = await service.update(id, dto);

      expect(spyUpdate).toHaveBeenCalledWith({
        where: { id },
        data: dto,
      });
      expect(result).toEqual({ id, ...dto });
    });

    it('should throw NotFoundException if user not found', async () => {
      const spyFindUnique = jest.fn().mockResolvedValue(null);
      prisma.user.findUnique = spyFindUnique;

      await expect(
        service.update('123', { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete user if exists', async () => {
      const id = '1';
      const user = { id, email: 'x@example.com' };

      const spyFindUnique = jest.fn().mockResolvedValue(user);
      prisma.user.findUnique = spyFindUnique;

      const spyDelete = jest.fn().mockResolvedValue(user);
      prisma.user.delete = spyDelete;

      const result = await service.delete(id);

      expect(spyDelete).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      const spyFindUnique = jest.fn().mockResolvedValue(null);
      prisma.user.findUnique = spyFindUnique;

      await expect(service.delete('not-exist')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
