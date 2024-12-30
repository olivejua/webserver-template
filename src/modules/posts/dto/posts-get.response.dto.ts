import { Post } from '../entities/post.entity';

export class PostsGetResponseDto {
  content: Post[];
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
}
