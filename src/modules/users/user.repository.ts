import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

export class UserRepository extends Repository<User> {
  async existsByEmail(email: string): Promise<boolean> {
    return await this.exists({
      where: {
        email: email,
      },
    });
  }
}
