import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from 'src/DataAccess/prisma.service';

@Injectable()
export class LeaderboardService implements OnModuleInit {
  private prizePool = 0;
  private leaderboardKey = 'game_leaderboard';
  private cacheExpiration = 60 * 60; // 1 saat

  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.loadPlayersIntoRedis();
  }

  async loadPlayersIntoRedis(): Promise<void> {
    // Veri cache'de mevcutsa, yeniden yüklemeyi geç.
    const isCacheValid = await this.redisClient.exists(this.leaderboardKey);

    if (isCacheValid) {
      console.log('Cache is valid, skipping data load.');
      return;
    }

    // Mevcut cache'i temizle
    await this.clearLeaderboard();

    // Fetch the top 100 players from the database ordered by money, descending
    const topPlayers = await this.prisma.player.findMany({
      orderBy: {
        money: 'desc',
      },
      take: 150,
    });

    //console.log('Top players:', topPlayers);

    // Load each player into the leaderboard (Redis)
    for (const player of topPlayers) {
      await this.redisClient.zadd(
        this.leaderboardKey,
        player.money.toString(),
        player.id.toString(),
      );
    }

    // Cache süresini ayarla
    await this.redisClient.expire(this.leaderboardKey, this.cacheExpiration);
  }

  async clearLeaderboard(): Promise<void> {
    await this.redisClient.del(this.leaderboardKey);
  }

  async addPlayerToLeaderboard(playerId: number, money: number): Promise<void> {
    await this.redisClient.zadd(
      this.leaderboardKey,
      money.toString(),
      playerId.toString(),
    );
    this.prizePool += money * 0.02;
  }

  async getLeaderboard(playerId?: number) {
    const topPlayers = await this.redisClient.zrevrange(
      this.leaderboardKey,
      0,
      99,
      'WITHSCORES',
    );

    //console.log('Top players:', topPlayers);

    if (playerId) {
      const playerRank = await this.redisClient.zrevrank(
        this.leaderboardKey,
        playerId.toString(),
      );

      if (playerRank !== null) {
        const start = Math.max(playerRank - 3, 0);
        const end = Math.min(
          playerRank + 2,
          (await this.redisClient.zcard(this.leaderboardKey)) - 1,
        );

        const surroundingPlayers = await this.redisClient.zrevrange(
          this.leaderboardKey,
          start,
          end,
          'WITHSCORES',
        );
        return {
          topPlayers: await this.getPlayerDetails(topPlayers),
          surroundingPlayers: await this.getPlayerDetails(surroundingPlayers),
          playerRank: playerRank + 1,
        };
      }
    }

    return {
      topPlayers: await this.getPlayerDetails(topPlayers),
    };
  }

  async distributePrizePool(): Promise<void> {
    const top100 = await this.redisClient.zrevrange(
      this.leaderboardKey,
      0,
      99,
      'WITHSCORES',
    );
    const totalPlayers = top100.length / 2;

    if (totalPlayers === 0) return;

    const topPlayerIds = top100
      .filter((_, i) => i % 2 === 0)
      .map((id) => parseInt(id));
    const topPlayers = await this.prisma.player.findMany({
      where: { id: { in: topPlayerIds } },
    });

    console.log('Top players:', topPlayers);

    const prizeDistribution = {
      1: 0.2,
      2: 0.15,
      3: 0.1,
    };

    const remainingPrize = this.prizePool * 0.55;

    for (let i = 0; i < topPlayers.length; i++) {
      let prize =
        i === 0
          ? this.prizePool * prizeDistribution[1]
          : i === 1
            ? this.prizePool * prizeDistribution[2]
            : i === 2
              ? this.prizePool * prizeDistribution[3]
              : remainingPrize / (totalPlayers - 3);

      await this.prisma.player.update({
        where: { id: topPlayers[i].id },
        data: { money: topPlayers[i].money + prize },
      });

      //      console.log(topPlayers[0].name, 'won', prize);
    }

    this.prizePool = 0;
    await this.resetLeaderboard();
  }

  async resetLeaderboard(): Promise<void> {
    await this.redisClient.del(this.leaderboardKey);
  }

  private async getPlayerDetails(
    players: string[],
    surroundingPlayers: string[] = [],
  ) {
    const topPlayerIds = players
      .filter((_, i) => i % 2 === 0)
      .map((id) => parseInt(id));
    const surroundingPlayerIds = surroundingPlayers
      .filter((_, i) => i % 2 === 0)
      .map((id) => parseInt(id));

    console.log('Top player ids:', topPlayerIds);
    // console.log('Surrounding player ids:', surroundingPlayerIds);

    const topPlayerDetails: any[] = [];

    for (let i = 0; i < topPlayerIds.length; i++) {
      const player = await this.prisma.player.findUnique({
        where: { id: topPlayerIds[i] },
      });
      topPlayerDetails.push(player);
    }

    // console.log(topPlayerDetails);

    const surroundingPlayerDetails =
      surroundingPlayerIds.length > 0
        ? await this.prisma.player.findMany({
            where: { id: { in: surroundingPlayerIds } },
          })
        : [];

    return {
      topPlayers: topPlayerDetails.map((player, index) => ({
        ...player,
        rank: index + 1,
        money: players[index * 2 + 1],
      })),
      surroundingPlayers: surroundingPlayerDetails.map((player, index) => ({
        ...player,
        rank: topPlayerIds.length + index + 1,
        money: surroundingPlayers[index * 2 + 1],
      })),
    };
  }
}
