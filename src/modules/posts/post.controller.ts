import { Controller, Get } from '@nestjs/common';
import { AuthenticatedUser } from '../../common/decorators/authenticated-user.decorator';

@Controller('posts')
export class PostController {
  @Get()
  getPosts(@AuthenticatedUser('id') requestUser): Promise<string> {
    console.log(requestUser);
    return Promise.resolve('posts');
  }
}
