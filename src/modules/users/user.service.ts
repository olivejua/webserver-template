import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async validateIfEmailIsUnique(email: string): Promise<void> {
    const emailExists = await this.userRepository.exists({
      where: { email: email },
    });
    if (emailExists) {
      throw new ConflictException('Email already exists');
    }
  }

  async create(email: string, password: string, name: string): Promise<User> {
    const createdUser: User = User.from(email, password, name);

    const savedUser: User = this.userRepository.create(createdUser);
    return this.userRepository.save(savedUser);
  }

  async findByEmailAndPassword(email: string, password: string): Promise<User> {
    const user: User = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }

    const isPasswordCorrect: boolean = await bcrypt.compare(password, user.password);

    return isPasswordCorrect ? user : null;
  }
}
