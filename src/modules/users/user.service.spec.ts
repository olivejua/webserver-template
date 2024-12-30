import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { matchPassword } from '../../common/utils/password.util';

jest.mock('../../common/utils/password.util'); // matchPassword 모킹

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            exists: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<jest.Mocked<Repository<User>>>(
      getRepositoryToken(User),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * 모든 사용자 조회
   */
  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          email: 'John@example.com',
          name: 'John',
          password: 'hashedPass',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: 'Jane@example.com',
          name: 'Jane',
          password: 'hashedPass',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      userRepository.find.mockResolvedValue(mockUsers);

      const result = await userService.findAll();

      expect(result).toEqual(mockUsers);
      expect(userRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * 이메일 중복 검증
   */
  describe('validateIfEmailIsUnique', () => {
    it('should throw ConflictException if email already exists', async () => {
      userRepository.exists.mockResolvedValue(true);

      await expect(
        userService.validateIfEmailIsUnique('test@example.com'),
      ).rejects.toThrow(ConflictException);

      expect(userRepository.exists).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should not throw any error if email does not exist', async () => {
      userRepository.exists.mockResolvedValue(false);

      await expect(
        userService.validateIfEmailIsUnique('test@example.com'),
      ).resolves.toBeUndefined();

      expect(userRepository.exists).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  /**
   * 사용자 생성
   */
  describe('create', () => {
    it('should create and save a new user', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPass',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const savedUser = { id: 1, ...mockUser };

      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(savedUser);

      const result = await userService.create(
        mockUser.email,
        mockUser.password,
        mockUser.name,
      );

      expect(result).toEqual(savedUser);
      expect(userRepository.create).toHaveBeenCalledWith(
        User.of(mockUser.email, mockUser.password, mockUser.name),
      );
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  /**
   * 이메일과 비밀번호로 사용자 조회
   */
  describe('findByEmailAndPassword', () => {
    it('should return user if email and password match', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPass',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      (matchPassword as jest.Mock).mockResolvedValue(true);

      const result = await userService.findByEmailAndPassword(
        'test@example.com',
        'plainPass',
      );

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(matchPassword).toHaveBeenCalledWith(
        'plainPass',
        mockUser.password,
      );
    });

    it('should return null if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await userService.findByEmailAndPassword(
        'test@example.com',
        'plainPass',
      );

      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if password does not match', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPass',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      (matchPassword as jest.Mock).mockResolvedValue(false);

      const result = await userService.findByEmailAndPassword(
        'test@example.com',
        'plainPass',
      );

      expect(result).toBeNull();
      expect(matchPassword).toHaveBeenCalledWith(
        'plainPass',
        mockUser.password,
      );
    });
  });

  /**
   * 사용자 ID로 조회
   */
  describe('findById', () => {
    it('should return user by ID', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPass',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await userService.findById(1);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return null if user is not found', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      const result = await userService.findById(1);

      expect(result).toBeNull();
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
