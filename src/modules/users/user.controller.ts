import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { SignupRequestDto } from './dto/signup.request.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Post()
  createUser(@Body() request: SignupRequestDto): Promise<User> {
    return this.userService.create(request);
  }
}
