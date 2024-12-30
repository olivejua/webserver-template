import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostCreateRequestDto } from './dto/post-create.request.dto';
import { AuthenticatedUser } from '../../common/decorators/authenticated-user.decorator';
import { PostService } from './post.service';
import { PostsGetRequestDto } from './dto/posts-get.request.dto';
import { PostsGetResponseDto } from './dto/posts-get.response.dto';

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

  @Get()
  async getPosts(
    @Query() request: PostsGetRequestDto,
  ): Promise<PostsGetResponseDto> {
    return await this.postService.getPosts(request);
  }

  @Get(':id')
  async getPost(@Param() id: number): Promise<void> {
    return;
  }
}
