import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { IpfsService } from './ipfs.service';

@ApiTags('ipfs')
@Controller('ipfs')
export class IpfsController {
  constructor(private readonly service: IpfsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload evidence file to IPFS via Pinata' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return this.service.uploadFile(file.buffer, file.originalname);
  }
}
