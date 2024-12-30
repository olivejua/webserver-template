import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { matchPassword } from '../../common/utils/password.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 모든 사용자 조회
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  /**
   * 이메일 중복 검증
   */
  async validateIfEmailIsUnique(email: string): Promise<void> {
    const emailExists = await this._doesEmailExist(email);
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }
  }

  /**
   * 이메일 존재 여부 확인
   */
  private async _doesEmailExist(email: string): Promise<boolean> {
    return await this.userRepository.exists({ where: { email } });
  }

  /**
   * 사용자 생성
   */
  async create(email: string, password: string, name: string): Promise<User> {
    const createdUser: User = User.of(email, password, name);

    const savedUser: User = this.userRepository.create(createdUser);
    return this.userRepository.save(savedUser);
  }

  /**
   * 이메일과 비밀번호로 사용자 조회
   */
  async findByEmailAndPassword(email: string, password: string): Promise<User> {
    const user: User = await this._findUserByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordCorrect: boolean = await matchPassword(
      password,
      user.password,
    );

    return isPasswordCorrect ? user : null;
  }

  /**
   * 이메일로 사용자 조회
   */
  private async _findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  /**
   * 사용자 ID로 조회
   */
  async findById(userId: number): Promise<User> {
    return await this.userRepository.findOneBy({ id: userId });
  }
}
