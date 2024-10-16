// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Inject, Injectable } from '@nestjs/common';
// import { Cache } from 'cache-manager';
// import { PrismaService } from 'src/DataAccess/prisma.service';

// @Injectable()
// export class LeaderboardService {
//   private leaderboardKey = 'game_leaderboard';
//   private prizePool = 0;

//   constructor(
//     @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
//     private readonly prisma: PrismaService,
//   ) {}

//   async getLeaderboard(playerId?: number): Promise<any> {
//     // Get top 100 players from the leaderboard
//     const topPlayers = await this.cacheManager.store.zRevRangeWithScores(
//       this.leaderboardKey,
//       0,
//       99,
//     );

//     // Fetch surrounding players if playerId is provided
//     if (playerId) {
//       const playerRank = await this.cacheManager.store.zRevRank(
//         this.leaderboardKey,
//         playerId.toString(),
//       );

//       if (playerRank !== null) {
//         // Get 3 players above and 2 players below the searched player
//         const start = Math.max(playerRank - 3, 0);
//         const end = Math.min(
//           playerRank + 2,
//           (await this.cacheManager.store.zCard(this.leaderboardKey)) - 1,
//         );

//         const surroundingPlayers =
//           await this.cacheManager.store.zRevRangeWithScores(
//             this.leaderboardKey,
//             start,
//             end,
//           );
//         return {
//           topPlayers: await this.getPlayerDetails(topPlayers),
//           surroundingPlayers: await this.getPlayerDetails(surroundingPlayers),
//           playerRank: playerRank + 1, // 1-based rank
//         };
//       }
//     }

//     // Return only top 100 players if no playerId is provided
//     return {
//       topPlayers: await this.getPlayerDetails(topPlayers),
//     };
//   }

//   async distributePrizePool(): Promise<void> {
//     const top100 = await this.cacheManager.store.zRevRangeWithScores(
//       this.leaderboardKey,
//       0,
//       99,
//     );

//     if (top100.length === 0) return;

//     const prizeDistribution = {
//       1: 0.2, // 1st player gets 20%
//       2: 0.15, // 2nd player gets 15%
//       3: 0.1, // 3rd player gets 10%
//     };

//     const remainingPrize = this.prizePool * 0.55; // 55% of the pool for players ranked 4th to 100th
//     const totalRemainingPlayers = top100.length - 3;

//     for (let i = 0; i < top100.length; i++) {
//       const playerId = parseInt(top100[i].value);
//       let prize = 0;

//       if (i === 0) {
//         prize = this.prizePool * prizeDistribution[1];
//       } else if (i === 1) {
//         prize = this.prizePool * prizeDistribution[2];
//       } else if (i === 2) {
//         prize = this.prizePool * prizeDistribution[3];
//       } else {
//         prize = remainingPrize / totalRemainingPlayers;
//       }

//       // Update the player's money in the database
//       await this.prisma.player.update({
//         where: { id: playerId },
//         data: { money: { increment: prize } },
//       });
//     }

//     // Reset the prize pool
//     this.prizePool = 0;

//     // Reset the leaderboard after distribution
//     await this.resetLeaderboard();
//   }

//   async resetLeaderboard(): Promise<void> {
//     await this.cacheManager.store.del(this.leaderboardKey);
//   }
// }
