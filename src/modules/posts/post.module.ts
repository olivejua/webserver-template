import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostTag } from './entities/post-tag.entity';
import { PostImage } from './entities/post-image.entity';
import { FileModule } from '../files/file.module';
import { PostImageService } from './post-image.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostTag, PostImage]), FileModule],
  providers: [PostService, PostImageService],
  controllers: [PostController],
})
export class PostModule {}
