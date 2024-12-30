import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostCreateRequestDto } from './dto/post-create.request.dto';
import { AuthenticatedUser } from '../../common/decorators/authenticated-user.decorator';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async createPost(
    @AuthenticatedUser('id') requestUserId: number,
    @Body() request: PostCreateRequestDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<number> {
    return await this.postService.write(requestUserId, request, images);
  }
}
