import { Injectable } from '@nestjs/common';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostCreateRequestDto } from './dto/post-create.request.dto';
import { PostTag } from './entities/post-tag.entity';
import { PostImage } from './entities/post-image.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(PostTag)
    private readonly postTagRepository: Repository<PostTag>,
    @InjectRepository(PostImage)
    private readonly postImageRepository: Repository<PostImage>,
  ) {}

  async write(
    requestUserId: number,
    postCreate: PostCreateRequestDto,
    images: Express.Multer.File[],
  ): Promise<number> {
    const createdPost: Post = this.postRepository.create({
      author: { id: requestUserId },
      category: { id: postCreate.categoryId },
      title: postCreate.title,
      content: postCreate.content,
    });
    const post: Post = await this.postRepository.save(createdPost);

    this._saveTags(post, postCreate.tags);
    this._saveImages(post, images);

    return post.id;
  }

  async _saveTags(post: Post, tags: string[]) {
    if (!tags || tags.length === 0) {
      return;
    }

    const entities: PostTag[] = [];
    for (const name of tags) {
      const tag: PostTag = PostTag.of(post, name);
      entities.push(tag);
    }

    await this.postTagRepository.save(entities);
  }

  async _saveImages(post: Post, images: Express.Multer.File[]) {
    if (!images || images.length === 0) {
      return;
    }

    const pathPrefix: string = `/posts/${post.id}/images`;
    const entities: PostImage[] = [];
    for (const image of images) {
      const path: string = `${pathPrefix}/${image.originalname}`;
      const entity: PostImage = this.postImageRepository.create({ post, path });
      entities.push(entity);
    }

    //cloud에  저장

    await this.postImageRepository.save(entities);
  }
}
