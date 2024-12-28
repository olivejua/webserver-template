import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SignupRequestDto } from './dto/signup.request.dto';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async create(request: SignupRequestDto): Promise<User> {
    await this._validateUserEmailUnique(request);

    const encryptedPassword = await this.hashPassword(request.password);

    const createdUser = User.from(
      request.email,
      encryptedPassword,
      request.name,
    );

    const savedUser = this.userRepository.create(createdUser);
    return this.userRepository.save(savedUser);
  }

  private async _validateUserEmailUnique(request: SignupRequestDto) {
    const emailExists = await this.userRepository.exists({
      where: { email: request.email },
    });
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  async validateUser(email: string, password: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return false;

    return bcrypt.compare(password, user.password);
  }
}
