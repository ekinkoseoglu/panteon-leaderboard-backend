import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { PlayerService } from 'src/Business/Concrete/player.service';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  create(@Body() body: { name: string; country: string }) {
    return this.playerService.create(body.name, body.country);
  }

  @Get('getall')
  findAll() {
    return this.playerService.getAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.playerService.getById(id);
  }
}
