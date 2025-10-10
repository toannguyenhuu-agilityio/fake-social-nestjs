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

  const mockFindUnique = jest.fn();
  const mockFindMany = jest.fn();
  const mockCount = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();
  const mockTransaction = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: mockFindUnique,
              findMany: mockFindMany,
              count: mockCount,
              create: mockCreate,
              update: mockUpdate,
              delete: mockDelete,
            },
            $transaction: mockTransaction,
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('should return a user by email', async () => {
      mockFindUnique.mockResolvedValue(MOCK_USER);

      const result = await service.getUserByEmail(MOCK_USER.email);

      expect(result).toEqual(MOCK_USER);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: MOCK_USER.email },
      });
    });
  });

  it('should throw NotFoundException if email not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(service.getUserByEmail('nope@example.com')).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      mockFindUnique.mockResolvedValue(MOCK_USER);

      const result = await service.getUserById(MOCK_USER.id);
      expect(result).toEqual(MOCK_USER);
    });

    it('should throw NotFoundException when not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(service.getUserById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockFindMany.mockResolvedValue(MOCK_LIST_USER);

      mockCount.mockResolvedValue(2);

      mockTransaction.mockImplementation(async (actions) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const count = await actions[0];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const list = await actions[1];

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return [count, list];
      });

      const result = await service.findAll({ page: 1, limit: 2 });

      expect(result.data).toEqual(MOCK_LIST_USER);
      expect(result.meta.totalItems).toBe(2);
      expect(mockTransaction).toHaveBeenCalled();
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

      mockFindUnique.mockResolvedValue(null);

      (hashPassword as jest.Mock).mockResolvedValue('hashed123');

      mockCreate.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);

      expect(hashPassword).toHaveBeenCalledWith(dto.password);

      expect(result).toEqual({ id: '1', ...dto });
    });

    it('should throw ConflictException if email already registered', async () => {
      mockFindUnique.mockResolvedValue({
        id: '1',
        email: 'exists@example.com',
      });

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

      mockFindUnique.mockResolvedValue({ id });

      mockUpdate.mockResolvedValue({ id, ...dto });

      const result = await service.update(id, dto);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id },
        data: dto,
      });
      expect(result).toEqual({ id, ...dto });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        service.update('123', { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete user if exists', async () => {
      const id = '1';
      const user = { id, email: 'x@example.com' };

      mockFindUnique.mockResolvedValue(user);

      mockDelete.mockResolvedValue(user);

      const result = await service.delete(id);

      expect(mockDelete).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(service.delete('not-exist')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
