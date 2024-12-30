import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity({ name: 'post_tags' })
export class PostTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({
    nullable: false,
  })
  name: string;

  static of(post: Post, name: string) {
    const postTag = new PostTag();
    postTag.post = post;
    postTag.name = name;
    return postTag;
  }
}
