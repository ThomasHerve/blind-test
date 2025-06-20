import { Module } from '@nestjs/common';
import { SessionService } from './services/session.service';
import { SessionGateway } from './controllers/session.gateway';

@Module({
  controllers: [],
  providers: [SessionService, SessionGateway],
  imports: []
})
export class LobbyModule {}