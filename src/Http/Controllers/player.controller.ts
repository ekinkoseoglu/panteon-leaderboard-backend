import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { PlayerService } from 'src/Business/Concrete/player.service';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  create(@Body() body: { name: string; country: string; money?: number }) {
    return this.playerService.create(body.name, body.country, body.money);
  }

  @Get('getall')
  findAll() {
    return this.playerService.getAll();
  }

  @Get(':getById')
  getById(@Param('id') id: number) {
    return this.playerService.getById(id);
  }
}
