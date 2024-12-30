import { Injectable } from '@nestjs/common';
import { Post } from './entities/post.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostCreateRequestDto } from './dto/post-create.request.dto';
import { PostTag } from './entities/post-tag.entity';
import { PostsGetRequestDto } from './dto/posts-get.request.dto';
import { PostsGetResponseDto } from './dto/posts-get.response.dto';
import { PostImageService } from './post-image.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(PostTag)
    private readonly postTagRepository: Repository<PostTag>,
    private readonly postImageService: PostImageService,
  ) {}

  /**
   * 게시글 목록 조회
   */
  async write(
    requestUserId: number,
    request: PostCreateRequestDto,
    images: Express.Multer.File[],
  ): Promise<number> {
    const savedPost = await this._savePost(requestUserId, request);

    this._saveTags(savedPost, request.tags);
    this.postImageService.save(savedPost, images);

    return savedPost.id;
  }

  /**
   * 게시글 목록 조회
   */
  async getPosts(request: PostsGetRequestDto): Promise<PostsGetResponseDto> {
    const queryBuilder = this._buildPostQuery(request);
    const [posts, total] = await queryBuilder.getManyAndCount();

    return this._mapPostsResponse(posts, total, request.page, request.limit);
  }

  /**
   * 게시글 생성 및 저장
   */
  private async _savePost(
    requestUserId: number,
    request: PostCreateRequestDto,
  ): Promise<Post> {
    const post = Post.of(
      requestUserId,
      request.categoryId,
      request.title,
      request.content,
    );

    return await this.postRepository.save(post);
  }

  /**
   * 태그 저장
   */
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

  /**
   * 게시글 쿼리 빌더 생성
   */
  private _buildPostQuery(
    request: PostsGetRequestDto,
  ): SelectQueryBuilder<Post> {
    const { page, limit, categoryId, tag } = request;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .innerJoin('post.category', 'category')
      .innerJoin('post.author', 'author')
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.createdAt',
        'category.id',
        'category.name',
        'author.id',
        'author.name',
      ]);

    if (tag) {
      queryBuilder.innerJoin('post.tags', 'tag', 'tag.name = :tag', { tag });
    }

    if (categoryId) {
      queryBuilder.andWhere('post.category.id = :categoryId', { categoryId });
    }

    return queryBuilder;
  }

  /**
   * 게시글 목록 조회 응답 매핑
   */
  private _mapPostsResponse(
    posts: Post[],
    total: number,
    page: number,
    limit: number,
  ): PostsGetResponseDto {
    return {
      content: posts,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      page: page,
      limit: limit,
    };
  }
}
