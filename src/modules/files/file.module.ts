import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioService } from './minio.service';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'FileService',
      useClass: MinioService,
    },
    {
      provide: S3Client,
      useFactory: (configService: ConfigService): S3Client => {
        return new S3Client({
          region: configService.get<string>('MINIO_REGION'),
          endpoint: configService.get<string>('MINIO_ENDPOINT'),
          credentials: {
            accessKeyId: configService.get<string>('MINIO_ROOT_USER'),
            secretAccessKey: configService.get<string>('MINIO_ROOT_PASSWORD'),
          },
          forcePathStyle: true,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['FileService'],
})
export class FileModule {}
