import { Body, Controller, Get, Param, Post, Request, UsePipes, ValidationPipe, ParseIntPipe, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { CreateBlindDto, AddCollaboratorDto, DeleteBlindDto, RemoveCollaboratorDto } from 'src/blind/dto/blind.dtos';
import { BlindService } from 'src/blind/services/blind.service';

@Controller('blinds')
export class BlindController {
    constructor(private readonly BlindService: BlindService) {}

    // With auth
    @Post('create')
    @UsePipes(ValidationPipe)
    async createBlind(@Body() createBlindDto: CreateBlindDto, @Request() req) {
      try {
        return this.BlindService.createBlind(req.user.username, createBlindDto.title);
      } catch(e) {
        throw e;
      }
    }

    @Delete('delete/:id')
    @UsePipes(ValidationPipe)
    async deleteBlind(@Param('id', ParseIntPipe) id: number, @Request() req) {
      try {
        return this.BlindService.deleteBlind(req.user.username, id);
      } catch(e) {
        throw e;
      }
    }

    @Get('get')
    @UsePipes(ValidationPipe)
    getBlinds(@Request() req) {
      return this.BlindService.getAllBlinds(req.user.username);
    }

    @Post('addCollaborator')
    @UsePipes(ValidationPipe)
    addCollaborator(@Body() addCollaboratorDto: AddCollaboratorDto, @Request() req) {
      try {
        console.log("ICI OK")
        return this.BlindService.addBlindCollaborator(req.user.username, addCollaboratorDto.id, addCollaboratorDto.username)
      } catch(e) {
        throw e;
      }
    }

    @Delete('removeCollaborator')
    removeCollaborator(@Body() removeCollaboratorDto: RemoveCollaboratorDto, @Request() req) {
      try {
        console.log("ICI OK")
        return this.BlindService.removeBlindCollaborator(req.user.username, removeCollaboratorDto.id, removeCollaboratorDto.username)
      } catch(e) {
        throw e;
      }
    }
}
