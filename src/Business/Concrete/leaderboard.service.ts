import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/DataAccess/prisma.service';
import { ILeaderboardService } from '../Abstract/leaderboard.interface';
import Redis from 'ioredis';
import { log } from 'console';
import { Player } from '@prisma/client';

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
      take: 100,
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

    console.log("Oyuncular Redis'e yüklendi");
  }

  // Redis'teki lider tablosunu temizler
  async clearLeaderboard(): Promise<void> {
    await this.redisClient.del(this.leaderboardKey);
  }

  //Lider tablosunu getirir
  async getLeaderboard(playerId?: number) {
    // İlk 100 oyuncuyu alalım (her durumda dönecek)
    const topPlayers = await this.redisClient.zrevrange(
      this.leaderboardKey,
      0,
      999,
      'WITHSCORES',
    );

    // Eğer spesifik bir playerId gönderilmişse
    if (playerId) {
      const playerRank = await this.redisClient.zrevrank(
        this.leaderboardKey,
        playerId,
      );

      if (playerRank !== null) {
        const start = Math.max(playerRank - 2, 0); // Oyuncunun etrafındaki oyuncuları almak için
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
          playerRank: playerRank + 1, // 0-indexli olduğu için 1 ekleniyor
        };
      } else {
        // Eğer player Redis'te yoksa, MySQL'den direkt çekebiliriz (örnek senaryoda Redis'e eklenmediği için)
        const player = await this.prisma.player.findUnique({
          where: { id: Number(playerId) },
        });

        if (player) {
          const rank = await this.prisma.player.count({
            where: {
              money: {
                gte: player.money,
              },
            },
          });

          const start = Math.max(rank - 3, 0);

          const surroundingPlayers = await this.prisma.player.findMany({
            orderBy: {
              money: 'desc',
            },
            skip: start,
            take: 5,
          });

          surroundingPlayers.push(player, ...surroundingPlayers.splice(2, 3));

          const surroundingPlayersWithRank = surroundingPlayers.map(
            (player, index) => {
              if (index < 2) {
                return {
                  ...player,
                  rank: rank - (2 - index),
                };
              } else if (index === 2) {
                return {
                  ...player,
                  rank: rank,
                };
              } else {
                return {
                  ...player,
                  rank: rank + (index - 2),
                };
              }
            },
          );
          return {
            topPlayers: await this.getPlayerDetails(topPlayers),
            surroundingPlayers: surroundingPlayersWithRank,
            player: {
              ...player,
              rank: rank,
            },
          };
        } else {
          throw new Error('Oyuncu Bulunamadı');
        }
      }
    }

    // Eğer spesifik bir playerId gönderilmemişse sadece ilk 100'ü döndür.
    return {
      data: await this.getPlayerDetails(topPlayers),
      prizePool: await this.getPrizePool(),
    };
  }

  //İlk 100 oyuncuya ödül havuzunu dağıtır
  async distributePrizePool(): Promise<void> {
    await this.loadPlayersIntoRedis();

    const prizePool = await this.getPrizePool();

    const top100 = await this.redisClient.zrevrange(
      this.leaderboardKey,
      0,
      99,
      'WITHSCORES',
    );

    const totalPlayers = top100.length / 2;
    if (totalPlayers === 0) return; // Eğer hiç oyuncu yoksa çıkış yap

    const topPlayerIds = top100
      .filter((_, i) => i % 2 === 0)
      .map((id) => Number(id));

    const players = await this.prisma.player.findMany({
      where: {
        id: {
          in: topPlayerIds,
        },
      },
      orderBy: [
        {
          money: 'desc',
        },
      ],
    });

    // Ödül dağıtım oranları
    const prizeDistribution = {
      1: prizePool * 0.2,
      2: prizePool * 0.15,
      3: prizePool * 0.1,
    };

    const remainingPrize = prizePool * 0.55;

    // SQL ve Redis güncellemeleri için paralel işlemler
    const updatePromises = players.map((player, i) => {
      let prize = 0;

      if (i === 0) prize = prizeDistribution[1];
      else if (i === 1) prize = prizeDistribution[2];
      else if (i === 2) prize = prizeDistribution[3];
      else prize = remainingPrize / 97;

      // SQL Update Promise
      const sqlUpdate = this.prisma.player.update({
        where: { id: player.id },
        data: { money: { increment: prize } },
      });

      // Redis Update komutu
      const redisUpdate = [
        'zadd',
        this.leaderboardKey,
        (player.money + prize).toString(),
        player.id.toString(),
      ];

      return { sqlUpdate, redisUpdate };
    });

    await Promise.all(updatePromises.map((p) => p.sqlUpdate));

    // Redis güncellemelerini toplu olarak çalıştır (multi ile toplu zadd)
    await this.redisClient
      .multi(updatePromises.map((p) => p.redisUpdate))
      .exec();

    //Reset Prize Pool

    // Leaderboard sıfırlama işlemi
    await this.clearLeaderboard();
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

    // console.log('Top player ids:', topPlayerIds);

    const topPlayerDetails: Player[] = [];

    for (let i = 0; i < topPlayerIds.length; i++) {
      const player = await this.prisma.player.findUnique({
        where: { id: topPlayerIds[i] },
      });
      topPlayerDetails.push(player);
    }

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

  async getPrizePool(): Promise<number> {
    const totalMoneySum = await this.prisma.player.aggregate({
      _sum: {
        money: true,
      },
    });

    return Math.floor(totalMoneySum._sum.money * 0.02);
  }
}
