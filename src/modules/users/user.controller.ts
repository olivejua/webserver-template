import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { AuthenticatedUser } from '../../common/decorators/authenticated-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  getUserByID(
    @Param('id') userId: number,
    @AuthenticatedUser() requestUser,
  ): Promise<User> {
    console.log(requestUser);

    return this.userService.findById(userId);
  }
}
