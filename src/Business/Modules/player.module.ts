import { Module } from '@nestjs/common';
import { PlayerController } from 'src/Http/Controllers/player.controller';
import { PlayerService } from '../Concrete/player.service';
import { Player } from 'src/Entity/Models/player.entity';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService, Player],
})
export class PlayerModule {}
