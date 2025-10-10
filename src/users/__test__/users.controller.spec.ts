import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { UserEntity } from '../dto/user.entity';
import { PaginationQueryDto } from 'src/shared/dtos';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { MOCK_LIST_USER, MOCK_USER } from 'src/mocks';

describe('UsersController', () => {
  let controller: UsersController;

  const mockGetUserById = jest.fn();
  const mockFindAll = jest.fn();
  const mockCreate = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  const mockUsersService = {
    getUserById: mockGetUserById,
    findAll: mockFindAll,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return a user entity', async () => {
      mockUsersService.getUserById.mockResolvedValue(MOCK_USER);

      const result = await controller.getUser('123');

      expect(mockGetUserById).toHaveBeenCalledWith('123');
      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe(MOCK_USER.id);
      expect(result.email).toBe(MOCK_USER.email);
    });
  });

  describe('getUsers', () => {
    it('should return paginated list of users', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };

      mockUsersService.findAll.mockResolvedValue(MOCK_LIST_USER);

      const result = await controller.getUsers(query);

      expect(mockFindAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(MOCK_LIST_USER);
    });
  });

  describe('createUser', () => {
    it('should create a user and return UserEntity', async () => {
      const dto: CreateUserDto = {
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        password: 'password123',
      };

      const mockCreatedUser = {
        ...dto,
        id: 'uuid-123',
        createdAt: new Date('2025-10-09T00:00:00.000Z'),
        updatedAt: new Date('2025-10-09T00:00:00.000Z'),
      };

      mockUsersService.create.mockResolvedValue(mockCreatedUser);

      const result = await controller.createUser(dto);

      expect(mockCreate).toHaveBeenCalledWith(dto);
      expect(result).toBeInstanceOf(UserEntity);
      expect(result.email).toBe(dto.email);
    });
  });

  describe('updateUser', () => {
    it('should update a user and return updated object', async () => {
      const dto: UpdateUserDto = { firstName: 'Updated', lastName: 'Name' };
      const mockUpdatedUser = {
        id: 'uuid-1',
        email: 'test@example.com',
        ...dto,
        createdAt: new Date('2025-10-09T00:00:00.000Z'),
        updatedAt: new Date('2025-10-09T00:00:00.000Z'),
      };

      mockUsersService.update.mockResolvedValue(mockUpdatedUser);

      const result = await controller.updateUser('uuid-1', dto);

      expect(mockUpdate).toHaveBeenCalledWith('uuid-1', dto);
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return UserEntity', async () => {
      const mockDeletedUser = {
        id: 'uuid-1',
        email: 'deleted@example.com',
        firstName: 'Del',
        lastName: 'User',
        password: 'hashed',
        createdAt: new Date('2025-10-09T00:00:00.000Z'),
        updatedAt: new Date('2025-10-09T00:00:00.000Z'),
      };

      mockUsersService.delete.mockResolvedValue(mockDeletedUser);

      const result = await controller.deleteUser('uuid-1');

      expect(mockDelete).toHaveBeenCalledWith('uuid-1');
      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe('uuid-1');
    });
  });
});
