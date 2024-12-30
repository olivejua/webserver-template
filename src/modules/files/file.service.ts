import { FileUploadRequestDto } from './file-upload.request.dto';

export interface FileService {
  upload(requests: FileUploadRequestDto[]): Promise<void>;
}
