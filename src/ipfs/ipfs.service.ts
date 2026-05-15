import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PinataClient from '@pinata/sdk';
import { Readable } from 'stream';

@Injectable()
export class IpfsService {
  private pinata: PinataClient;

  constructor(private config: ConfigService) {
    this.pinata = new PinataClient({
      pinataApiKey: this.config.get<string>('PINATA_API_KEY'),
      pinataSecretApiKey: this.config.get<string>('PINATA_SECRET_KEY'),
    });
  }

  async uploadFile(buffer: Buffer, filename: string): Promise<{ cid: string; url: string }> {
    try {
      const stream = Readable.from(buffer);
      (stream as any).path = filename;
      const result = await this.pinata.pinFileToIPFS(stream, {
        pinataMetadata: { name: filename },
      });
      return {
        cid: result.IpfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      };
    } catch (err) {
      throw new InternalServerErrorException(`IPFS upload failed: ${err.message}`);
    }
  }
}
