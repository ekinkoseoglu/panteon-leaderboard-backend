import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/DataAccess/prisma.service';
import { ILeaderboardService } from '../Abstract/leaderboard.interface';
import Redis from 'ioredis';

@Injectable()
export class LeaderboardService implements ILeaderboardService, OnModuleInit {
  private leaderboardKey = 'game_leaderboard';
  private cacheExpiration = 60 * 60; // 1 saat

  constructor(
    @InjectRedis() private readonly redisClient: Redis,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.loadPlayersIntoRedis();
  }

  // Redis'e oyuncuları yükler
  async loadPlayersIntoRedis(): Promise<void> {
    console.log('Loading players into Redis');

    // Veri cache'de mevcutsa, yeniden yüklemeyi geç.
    const isCacheValid = await this.redisClient.exists(this.leaderboardKey);

    if (isCacheValid) {
      return;
    }

    // Mevcut cache'i temizle
    await this.clearLeaderboard();

    const topPlayers = await this.prisma.player.findMany({
      orderBy: {
        money: 'desc',
      },
    });

    // Redis'e oyuncuları ekle
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

  // Redis'teki lider tablosunu temizler
  async clearLeaderboard(): Promise<void> {
    await this.redisClient.del(this.leaderboardKey);
  }

  //Lider tablosunu getirir
  async getLeaderboard(playerId?: number) {
    console.log('Getting leaderboard');

    //Get All players, not just top 100
    const topPlayers = await this.redisClient.zrevrange(
      this.leaderboardKey,
      0,
      -1,
      'WITHSCORES',
    );

    if (playerId) {
      const playerRank = await this.redisClient.zrevrank(
        this.leaderboardKey,
        playerId,
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

  //İlk 100 oyuncuya ödül havuzunu dağıtır
  async distributePrizePool(): Promise<void> {
    //Ödül havuzunun hesaplanışı
    const totalMoney = await this.prisma.player.findMany({
      select: { money: true },
    });

    const totalMoneySum = totalMoney.reduce(
      (acc, player) => acc + player.money,
      0,
    );
    const prizePool = totalMoneySum * 0.02;
    const top100 = await this.redisClient.zrevrange(
      this.leaderboardKey,
      0,
      99,
      'WITHSCORES',
    );
    const totalPlayers = top100.length / 2;

    if (totalPlayers === 0) return;

    const topPlayerIds = await this.prisma.player.findMany({
      orderBy: [
        {
          money: 'desc',
        },
      ],
    });

    const prizeDistribution = {
      1: prizePool * 0.2,
      2: prizePool * 0.15,
      3: prizePool * 0.1,
    };

    const remainingPrize = prizePool * 0.55;

    // Dağıtma algoritması
    for (let i = 0; i < topPlayerIds.length; i++) {
      let prize = 0;

      if (i === 0) prize = prizeDistribution[1];
      else if (i === 1) prize = prizeDistribution[2];
      else if (i === 2) prize = prizeDistribution[3];
      else prize = remainingPrize / 97;

      //SQL Update
      await this.prisma.player.update({
        where: { id: topPlayerIds[i].id },
        data: { money: { increment: prize } },
      });

      //Redis Update
      await this.redisClient.zadd(
        this.leaderboardKey,
        (topPlayerIds[i].money + prize).toString(),
        topPlayerIds[i].id.toString(),
      );

      //Kim ne kadar kazandı
      // console.log(
      //   `${topPlayerIds[i].name} won ${prize} and now has ${
      //     topPlayerIds[i].money + prize
      //   }`,
      // );
    }

    await this.resetLeaderboard();
  }

  //Lider tablosunu sıfırlar
  async resetLeaderboard(): Promise<void> {
    await this.redisClient.del(this.leaderboardKey);
  }

  //Oyuncu detaylarını getirir.
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
