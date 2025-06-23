import { Module } from '@nestjs/common';
import { SessionService } from './services/session.service';
import { SessionGateway } from './controllers/session.gateway';
import { BlindModule } from 'src/blind/blind.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlindEntry, BlindNode } from 'src/typeorm/blind.entity';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/typeorm';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [],
  providers: [SessionService, SessionGateway],
  exports: [SessionService],
  imports: [
    TypeOrmModule.forFeature([BlindEntry, BlindNode, User]),
    UsersModule,
    HttpModule.register({
      baseURL: 'https://www.googleapis.com/youtube/v3',
      timeout: 5000,
    }),
  ],
})
export class SessionModule {}