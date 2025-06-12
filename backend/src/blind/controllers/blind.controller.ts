import { Body, Controller, Get, Param, Post, Request, UsePipes, ValidationPipe, ParseIntPipe, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { CreateBlindDto, AddCollaboratorDto, DeleteBlindDto } from 'src/blind/dto/blind.dtos';
import { BlindService } from 'src/blind/services/blind.service';
import { Public } from 'src/users/services/users/public.decorator';

@Controller('blinds')
export class BlindController {
    constructor(private readonly BlindService: BlindService) {}

    // With auth
    @Post('create')
    @UsePipes(ValidationPipe)
    async createBlind(@Body() createBlindDto: CreateBlindDto, @Request() req) {
      try {
        return this.BlindService.createBlind(createBlindDto.title, req.user.username);
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

    
}
