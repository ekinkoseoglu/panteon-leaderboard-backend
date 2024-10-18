import { Controller, Post, Get, Query } from '@nestjs/common';
import { LeaderboardService } from 'src/Business/Concrete/leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(@Query('playerId') playerId?: number) {
    // await this.leaderboardService.loadPlayersIntoRedis();
    return this.leaderboardService.getLeaderboard(playerId);
  }

  @Post('distributePrizePool')
  async distributePrizePool() {
    await this.leaderboardService.distributePrizePool();
    return { message: 'Prize pool distributed successfully.' };
  }

  @Post('clear-leaderboard')
  async clearLeaderboard() {
    await this.leaderboardService.clearLeaderboard();
    return { message: 'Leaderboard cleared successfully.' };
  }
}
