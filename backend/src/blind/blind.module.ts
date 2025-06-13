import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../users/constants';
import { BlindEntry, BlindNode } from 'src/typeorm/blind.entity';
import { UsersService } from 'src/users/services/users/users.service';
import { BlindController } from './controllers/blind.controller';
import { BlindService } from './services/blind.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, BlindEntry, BlindNode]), PassportModule, JwtModule.register({
    secret: jwtConstants.secret,
    signOptions: { expiresIn: '3600s' },
  })],
  controllers: [BlindController],
  providers: [BlindService, UsersService],
  exports: [BlindService]
})
export class BlindModule {}