import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { LeaderboardService } from 'src/Business/Concrete/leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Post('addPlayerToLeaderboard')
  async addPlayerToLeaderboard(
    @Body() body: { playerId: number; money: number },
  ) {
    await this.leaderboardService.addPlayerToLeaderboard(
      body.playerId,
      body.money,
    );
  }

  @Post('distributePrizePool')
  async distributePrizePool() {
    await this.leaderboardService.distributePrizePool();
    return { message: 'Prize pool distributed successfully.' };
  }

  @Get()
  async getLeaderboard(@Query('playerId') playerId?: number) {
    // loadPlayersIntoRedis sadece gerekli olduğunda veri yükler.
    await this.leaderboardService.loadPlayersIntoRedis();
    return this.leaderboardService.getLeaderboard(playerId);
  }

  @Post('clear-leaderboard')
  async clearLeaderboard() {
    await this.leaderboardService.clearLeaderboard();
    return { message: 'Leaderboard cleared successfully.' };
  }
}
