import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from './category.entity';
import { PostTag } from './post-tag.entity';
import { PostImage } from './post-image.entity';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({
    nullable: false,
  })
  title: string;

  @Column({
    nullable: false,
  })
  content: string;

  @OneToMany(() => PostTag, (postTag) => postTag.post)
  tags: PostTag[];

  @OneToMany(() => PostImage, (postImage) => postImage.post)
  images: PostImage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  static of(
    authorId: number,
    categoryId: number,
    title: string,
    content: string,
  ): Post {
    const post = new Post();
    post.author = User.from(authorId);
    post.category = Category.from(categoryId);
    post.title = title;
    post.content = content;
    return post;
  }
}
