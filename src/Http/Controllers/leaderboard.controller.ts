import { Controller, Post, Get, Query } from '@nestjs/common';
import { LeaderboardService } from 'src/Business/Concrete/leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(
    @Query('playerId') playerId?: number,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 100,
  ) {
    await this.leaderboardService.loadPlayersIntoRedis();
    return this.leaderboardService.getLeaderboard(playerId, page, pageSize);
  }

  @Get('nextWeek')
  async nextWeek() {
    return this.leaderboardService.getPrizePool();
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
