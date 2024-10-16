// import { Controller, Get, Param, Query, Post } from '@nestjs/common';
// import { LeaderboardService } from 'src/Business/Concrete/leaderboard.service';

// @Controller('leaderboard')
// export class LeaderboardController {
//   constructor(private readonly leaderboardService: LeaderboardService) {}

//   @Get()
//   getLeaderboard(@Query('playerId') playerId?: number) {
//     return this.leaderboardService.getLeaderboard(playerId);
//   }

//   @Post('distribute')
//   distributePrizePool() {
//     return this.leaderboardService.distributePrizePool();
//   }
// }
