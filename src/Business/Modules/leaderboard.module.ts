import { Module } from '@nestjs/common';
import { PrismaService } from 'src/DataAccess/prisma.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { LeaderboardService } from '../Concrete/leaderboard.service';
import { LeaderboardController } from 'src/Http/Controllers/leaderboard.controller';
import { Player } from 'src/Entity/Models/player.entity';

@Module({
  imports: [RedisModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService, PrismaService, Player],
})
export class LeaderboardModule {}
