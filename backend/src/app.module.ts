import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import entities from './typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './users/services/users/jwt-auth.guard';
import { BlindModule } from './blind/blind.module';
import { SessionModule } from './session/session.module';
import { DownloadModule } from './download/download.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: entities,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    BlindModule,
    DownloadModule,
    SessionModule  
  ],
  controllers: [AppController],
  providers: [{
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },AppService],
})
export class AppModule {}