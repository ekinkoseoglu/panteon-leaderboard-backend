import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/DataAccess/prisma.service';
import { ILeaderboardService } from '../Abstract/leaderboard.interface';
import Redis from 'ioredis';
import { Player } from '@prisma/client';

@Injectable()
export class LeaderboardService implements ILeaderboardService, OnModuleInit {
  private leaderboardKey = 'game_leaderboard';
  private cacheExpiration = 60 * 60; // 1 hour

  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.loadPlayersIntoRedis();
  }

  // Load players into Redis
  async loadPlayersIntoRedis(): Promise<void> {
    const isCacheValid = await this.redisClient.exists(this.leaderboardKey);
    if (isCacheValid) return;

    await this.clearLeaderboard();

    const topPlayers = await this.prisma.player.findMany({
      orderBy: { money: 'desc' },
      take: 1000,
    });

    const pipeline = this.redisClient.pipeline();
    topPlayers.forEach((player) => {
      pipeline.zadd(this.leaderboardKey, player.money, player.id.toString());
    });

    await pipeline.exec();
    await this.redisClient.expire(this.leaderboardKey, this.cacheExpiration);
    console.log('Players loaded into Redis');
  }

  // Clear leaderboard in Redis
  async clearLeaderboard(): Promise<void> {
    await this.redisClient.del(this.leaderboardKey);
  }

  // Get leaderboard with optional pagination
  async getLeaderboard(
    playerId?: number,
    page: number = 1,
    pageSize: number = 100,
  ) {
    const start = (page - 1) * pageSize;
    const end = Number(start) + Number(pageSize) - 1;

    const topPlayers = await this.redisClient.zrevrange(
      this.leaderboardKey,
      start,
      end,
      'WITHSCORES',
    );

    if (playerId) {
      const playerRank = await this.redisClient.zrevrank(
        this.leaderboardKey,
        playerId.toString(),
      );
      if (playerRank !== null) {
        const surroundingPlayers = await this.redisClient.zrevrange(
          this.leaderboardKey,
          Math.max(playerRank - 2, 0),
          Math.min(
            playerRank + 2,
            (await this.redisClient.zcard(this.leaderboardKey)) - 2,
          ),
          'WITHSCORES',
        );

        return {
          topPlayers: await this.getPlayerDetails(topPlayers, start),
          surroundingPlayers: await this.getPlayerDetails(
            surroundingPlayers,
            0,
          ),
          playerRank: playerRank + 1, // 0-indexed adjusted to 1-indexed
        };
      } else {
        const player = await this.prisma.player.findUnique({
          where: { id: Number(playerId) },
        });
        if (player) {
          const rank = await this.prisma.player.count({
            where: { money: { gte: player.money } },
          });
          const surroundingPlayers = await this.prisma.player.findMany({
            orderBy: { money: 'desc' },
            skip: Math.max(rank - 5, 0),
            take: 6,
          });
          const playerRankInfo = surroundingPlayers.map((player, index) => ({
            ...player,
            rank: rank + index - 2,
          }));
          return {
            topPlayers: await this.getPlayerDetails(topPlayers, start),
            surroundingPlayers: playerRankInfo,
            player: { ...player, rank },
          };
        } else {
          throw new Error('Player Not Found');
        }
      }
    }

    return {
      data: await this.getPlayerDetails(topPlayers, start),
      prizePool: await this.getPrizePool(),
      page,
      pageSize,
    };
  }

  // Distribute prize pool to top 100 players
  async distributePrizePool(): Promise<void> {
    await this.loadPlayersIntoRedis();

    const prizePool = await this.getPrizePool();
    const top100 = await this.redisClient.zrevrange(
      this.leaderboardKey,
      0,
      99,
      'WITHSCORES',
    );

    if (top100.length === 0) return;

    const topPlayerIds = top100
      .filter((_, i) => i % 2 === 0)
      .map((id) => Number(id));
    const players = await this.prisma.player.findMany({
      where: { id: { in: topPlayerIds } },
    });

    const prizeDistribution = {
      1: prizePool * 0.2,
      2: prizePool * 0.15,
      3: prizePool * 0.1,
    };
    const remainingPrize = (prizePool * 0.55) / 97;

    const updatePromises = players.map((player, i) => {
      const prize = prizeDistribution[i + 1] || remainingPrize;
      return this.prisma.player.update({
        where: { id: player.id },
        data: { money: { increment: prize } },
      });
    });

    await Promise.all(updatePromises);

    const pipeline = this.redisClient.pipeline();
    players.forEach((player) => {
      const prize = prizeDistribution[player.id] || remainingPrize;
      pipeline.zadd(
        this.leaderboardKey,
        player.money + prize,
        player.id.toString(),
      );
    });

    await pipeline.exec();
    await this.clearLeaderboard();
  }

  private async getPlayerDetails(players: string[], startRank: number) {
    const ids = players.filter((_, i) => i % 2 === 0).map((id) => parseInt(id));
    const details = await this.prisma.player.findMany({
      where: { id: { in: ids } },
    });

    return details.map((player, index) => ({
      ...player,
      rank: startRank + index + 1, // calculate the correct rank
      money: players[index * 2 + 1],
    }));
  }

  async getPrizePool(): Promise<number> {
    const totalMoneySum = await this.prisma.player.aggregate({
      _sum: { money: true },
    });
    return Math.floor(totalMoneySum._sum.money * 0.02);
  }
}
