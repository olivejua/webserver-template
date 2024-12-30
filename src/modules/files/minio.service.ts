import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { FileService } from './file.service';
import { FileUploadRequestDto } from './file-upload.request.dto';

@Injectable()
export class MinioService implements FileService {
  private readonly bucket: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly s3Client: S3Client,
  ) {
    this.bucket = this.configService.get('MINIO_BUCKET');
  }

  async upload(requests: FileUploadRequestDto[]): Promise<void> {
    const uploadPromises = requests.map(async (request) => {
      const { file, filename } = request;

      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: filename,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );

        return;
      } catch (error) {
        throw error;
      }
    });

    await Promise.all(uploadPromises);
  }
}
