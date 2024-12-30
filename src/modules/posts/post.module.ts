import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostTag } from './entities/post-tag.entity';
import { PostImage } from './entities/post-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostTag, PostImage])],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
