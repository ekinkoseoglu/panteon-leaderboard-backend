import { Module } from '@nestjs/common';
import { PlayerService } from '../Concrete/player.service';
import { Player } from 'src/Entity/Models/player.entity';
import { PlayerController } from 'src/Http/Controllers/player.controller';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService, Player],
})
export class PlayerModule {}
