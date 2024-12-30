import { Inject, Injectable } from '@nestjs/common';
import { PostImage } from './entities/post-image.entity';
import { Repository } from 'typeorm';
import { FileService } from '../files/file.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { FileUploadRequestDto } from '../files/file-upload.request.dto';

@Injectable()
export class PostImageService {
  constructor(
    @InjectRepository(PostImage)
    private readonly postImageRepository: Repository<PostImage>,
    @Inject('FileService') private readonly fileService: FileService,
  ) {}

  async save(post: Post, images: Express.Multer.File[]): Promise<void> {
    if (!images || images.length === 0) {
      return;
    }

    const pathPrefix: string = `/posts/${post.id}/images`;
    const uploadRequests: FileUploadRequestDto[] = [];
    const entities: PostImage[] = [];
    for (const image of images) {
      const filenameParts: string[] = image.originalname.split('.');
      const extension: string = filenameParts[filenameParts.length - 1];
      const filename: string = `${pathPrefix}/${crypto.randomUUID()}.${extension}`;

      const entity: PostImage = this.postImageRepository.create({
        post: post,
        path: filename,
      });

      uploadRequests.push({
        file: image,
        filename: filename,
      });

      entities.push(entity);
    }

    await this.fileService.upload(uploadRequests);
    await this.postImageRepository.save(entities);
  }
}
