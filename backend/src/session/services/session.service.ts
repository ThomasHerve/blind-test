import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlindEntry, BlindNode } from 'src/typeorm/blind.entity';
import { UsersService } from 'src/users/services/users/users.service';

@Injectable()
export class SessionService {
    constructor(
        @InjectRepository(BlindEntry) private readonly BlindEntriesRepository: Repository<BlindEntry>,
        @InjectRepository(BlindNode) private readonly NodeRepository: Repository<BlindNode>,
        private readonly userService: UsersService
      ) {}
    


}
