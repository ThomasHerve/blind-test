import { Body, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { Repository } from 'typeorm';
import { BlindEntry, BlindNode } from 'src/typeorm/blind.entity';
import { UsersService } from 'src/users/services/users/users.service';
import { CreateBlindDto, DeleteBlindDto, AddCollaboratorDto } from 'src/blind/dto/blind.dtos';

@Injectable()
export class BlindService {
    constructor(
        @InjectRepository(BlindEntry) private readonly BlindEntriesRepository: Repository<BlindEntry>,
        @InjectRepository(BlindNode) private readonly NodeRepository: Repository<BlindNode>,
        private readonly userService: UsersService
      ) {}
    


    async createBlind(username: string, blind_title) {
        const user = await this.userService.getUser(username);

        if (!user) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }

        const newBlind = this.BlindEntriesRepository.create({
            title: blind_title,
            user: user,
            collaborators: [], // vide par défaut
        });

        const savedBlind = await this.BlindEntriesRepository.save(newBlind);

        return savedBlind;
    }

    // Public
    async getAllBlinds(username: string) {
        const user: User | null = await this.userService.getUser(username)
        let res : any = undefined;
        if(user) {
        const entries = await this.BlindEntriesRepository.createQueryBuilder("entry")
            .leftJoin("entry.collaborators", "collaborator")
            .leftJoin("entry.user", "owner")
            .where("owner.id = :userId", { userId: user.id })
            .orWhere("collaborator.id = :userId", { userId: user.id })
            .select(["entry.id", "entry.title", "owner.id"])
            .getMany();
            res = entries.map(entry => ({
                id: entry.id,
                title: entry.title,
                isOwner: entry.user.id === user.id
            }));
        }
        return res
    }

    async getAllBlindsFiltered(filter: string, username: string) {
        const user: User | null = await this.userService.getUser(username)
        let res : any = undefined;
        if(user) {
            res = await this.BlindEntriesRepository.createQueryBuilder("entry")
                .leftJoin("entry.collaborators", "collaborator")
                .where("entry.userId = :userId", { userId: user.id })
                .orWhere("collaborator.id = :userId", { userId: user.id })
                .select(["entry.id", "entry.title"])
                .getMany();
            res = res.filter((element)=>{
                return element.title.includes(filter)
            })
        }
        return res
    }

    async getBlindNodes(id: number) {
        const Blind = await this.BlindEntriesRepository.findOne({
            where: {
                id
            }, relations: {
                entries: true,
            },
        });
        if(Blind) {
            return await this.NodeRepository.find({
                where: {
                    blind: Blind
                }, select: ["id", "name", "url", "childrens", "parent", "prof", "videoId", "type"]
            })
        }
        throw new HttpException("Blind test doesn't exist", HttpStatus.FORBIDDEN)
    }

    async getBlindCollaborators(id: number) {
        const Blind = await this.BlindEntriesRepository.findOne({
            where: {
                id
            }, relations: {
                entries: true,
            },
        });
        if(Blind) {
            const collaborators: Array<string> = []
            Blind.collaborators.forEach((element)=>{
                collaborators.push(element.username)
            })
            return collaborators
        }
        throw new HttpException("Blind test doesn't exist", HttpStatus.FORBIDDEN)
    }

    async addBlindCollaborator(username: string, id: number, collaborator: string) {
        const owner = await this.userService.getUser(username);
        const collaboratorUser = await this.userService.getUser(collaborator);

        if (!owner || !collaboratorUser) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }

        const blind = await this.BlindEntriesRepository.findOne({
            where: { id, user: { id: owner.id } },
            relations: ['collaborators']
        });

        if (!blind) {
            throw new HttpException("Blind entry not found or not owned by user", HttpStatus.FORBIDDEN);
        }

        // Éviter les doublons
        const alreadyCollaborator = blind.collaborators.find(u => u.id === collaboratorUser.id);
        if (!alreadyCollaborator) {
            blind.collaborators.push(collaboratorUser);
            await this.BlindEntriesRepository.save(blind);
        }

        return true;
    }

    async removeBlindCollaborator(username: string, id: number, collaborator: string) {
        const owner = await this.userService.getUser(username);
        const collaboratorUser = await this.userService.getUser(collaborator);

        if (!owner || !collaboratorUser) {
            throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        }

        const blind = await this.BlindEntriesRepository.findOne({
            where: { id, user: { id: owner.id } },
            relations: ['collaborators']
        });

        if (!blind) {
            throw new HttpException("Blind entry not found or not owned by user", HttpStatus.FORBIDDEN);
        }

        // Supprimer le collaborateur s'il est présent
        blind.collaborators = blind.collaborators.filter(u => u.id !== collaboratorUser.id);
        await this.BlindEntriesRepository.save(blind);

        return true;
    }

    async deleteBlind(username: string, id: number) {
        const user: User | null= await this.userService.getUser(username)
        if(user) {
            let Blind = user.blindEntries.find((element)=>element.id == id);
            if(Blind){
                this.BlindEntriesRepository.delete(Blind);
                return true
            }
            Blind = user.sharedBlindEntries.find((element)=>element.id == id);
            if(Blind) {
                Blind.collaborators = Blind.collaborators.filter(collab => collab.id !== user.id);
                await this.BlindEntriesRepository.save(Blind);
                return true;
            }
            
        }
        throw new HttpException("Blind doesn't exist", HttpStatus.FORBIDDEN)
    } 

}
