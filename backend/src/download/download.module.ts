import { Module } from '@nestjs/common';
import { DownloadController } from './controllers/download.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlindEntry, BlindNode } from 'src/typeorm/blind.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlindEntry, BlindNode]),
  ],
  controllers: [DownloadController],
})
export class DownloadModule {}