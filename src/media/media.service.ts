import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import * as AWS from 'aws-sdk';
import * as uuid from 'uuid';
import pdfParse from 'pdf-parse';
import { paginate } from '../core/common/paginate.service';
import { CommonService } from '../core/common/common.service';

@Injectable()
export class MediaService {
  private s3 = new AWS.S3();

  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    private readonly commonService: CommonService
  ) {}

  // Method to upload file to AWS S3
  private async uploadToS3(fileBuffer: Buffer, fileName: string) {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET_NAME as string,
      Key: fileName,
      Body: fileBuffer,
    };

    return this.s3.upload(params).promise();
  }

  // Extract metadata based on file type
  private async extractMetadata(fileBuffer: Buffer, mimeType: string) {
    let metadata = {};

    if (mimeType === 'application/pdf') {
      const pdfMetadata = await pdfParse(fileBuffer);
      metadata = {
        title: pdfMetadata.info.Title,
        author: pdfMetadata.info.Author,
        numPages: pdfMetadata.numpages,
      };
    }
    return metadata;
  }

  // Method to handle the upload and metadata extraction
  async create(files: { files: Express.Multer.File[] }) {
    const uploadedFiles: Media[] = [];
    for (const file of files.files) {
      const uniqueFileId = uuid.v4();

      // Upload file to S3
      const fileBuffer = file.buffer;
      const fileName = `${uniqueFileId}-${file.originalname}`;
      await this.uploadToS3(fileBuffer, fileName);

      // Call axios to know python server file is uploaded
      await this.commonService.triggerIngestionMockAPI(fileName);

      // Extract metadata (can vary based on file type)
      const metadata = await this.extractMetadata(fileBuffer, file.mimetype);

      // Create a new Media entry in the database
      const media = this.mediaRepository.create({
        file_name: file.originalname,
        unique_file_name: fileName,
        meta_data: metadata,
      });
      const savedMedia = await this.mediaRepository.save(media);
      uploadedFiles.push(savedMedia);
    }

    return uploadedFiles;
  }

  async update(id: string, files: { files: Express.Multer.File[] }) {
    await this.remove(id);
    const createNewFile = await this.create(files);
    return createNewFile;
  }

  async findAll(page: number, limit: number) {
    const where = { is_deleted: false };
    const orderBy = { created_at: 'desc' };

    // Plug in the paginate function
    const medias = await paginate(this.mediaRepository, {
      page,
      limit,
      where,
      orderBy,
    });
    return medias;
  }

  findOne(id) {
    return this.mediaRepository.findOne(id);
  }

  async remove(id: string) {
    const media = await this.findOne(id);
    if (media) {
      // Delete from S3
      const fileName = media.unique_file_name;
      const params: AWS.S3.PutObjectRequest = {
        Bucket: process.env.AWS_S3_BUCKET_NAME as string,
        Key: fileName,
      };
      await this.s3.deleteObject(params).promise();

      // Delete from DB
      await this.mediaRepository.delete(id);
    }
  }
}
