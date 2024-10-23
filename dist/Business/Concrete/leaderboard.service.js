"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardService = void 0;
const ioredis_1 = require("@nestjs-modules/ioredis");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/DataAccess/prisma.service");
const ioredis_2 = require("ioredis");
let LeaderboardService = class LeaderboardService {
    constructor(redisClient, prisma) {
        this.redisClient = redisClient;
        this.prisma = prisma;
        this.leaderboardKey = 'game_leaderboard';
        this.cacheExpiration = 60 * 60;
    }
    async onModuleInit() {
        await this.loadPlayersIntoRedis();
    }
    async loadPlayersIntoRedis() {
        const isCacheValid = await this.redisClient.exists(this.leaderboardKey);
        if (isCacheValid) {
            return;
        }
        await this.clearLeaderboard();
        const topPlayers = await this.prisma.player.findMany({
            orderBy: {
                money: 'desc',
            },
            take: 100,
        });
        for (const player of topPlayers) {
            await this.redisClient.zadd(this.leaderboardKey, player.money.toString(), player.id.toString());
        }
        await this.redisClient.expire(this.leaderboardKey, this.cacheExpiration);
        console.log("Oyuncular Redis'e yüklendi");
    }
    async clearLeaderboard() {
        await this.redisClient.del(this.leaderboardKey);
    }
    async getLeaderboard(playerId) {
        const topPlayers = await this.redisClient.zrevrange(this.leaderboardKey, 0, 999, 'WITHSCORES');
        if (playerId) {
            const playerRank = await this.redisClient.zrevrank(this.leaderboardKey, playerId);
            if (playerRank !== null) {
                const start = Math.max(playerRank - 2, 0);
                const end = Math.min(playerRank + 2, (await this.redisClient.zcard(this.leaderboardKey)) - 1);
                const surroundingPlayers = await this.redisClient.zrevrange(this.leaderboardKey, start, end, 'WITHSCORES');
                return {
                    topPlayers: await this.getPlayerDetails(topPlayers),
                    surroundingPlayers: await this.getPlayerDetails(surroundingPlayers),
                    playerRank: playerRank + 1,
                };
            }
            else {
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
                    const surroundingPlayersWithRank = surroundingPlayers.map((player, index) => {
                        if (index < 2) {
                            return {
                                ...player,
                                rank: rank - (2 - index),
                            };
                        }
                        else if (index === 2) {
                            return {
                                ...player,
                                rank: rank,
                            };
                        }
                        else {
                            return {
                                ...player,
                                rank: rank + (index - 2),
                            };
                        }
                    });
                    return {
                        topPlayers: await this.getPlayerDetails(topPlayers),
                        surroundingPlayers: surroundingPlayersWithRank,
                        player: {
                            ...player,
                            rank: rank,
                        },
                    };
                }
                else {
                    throw new Error('Oyuncu Bulunamadı');
                }
            }
        }
        return {
            data: await this.getPlayerDetails(topPlayers),
            prizePool: await this.getPrizePool(),
        };
    }
    async distributePrizePool() {
        await this.loadPlayersIntoRedis();
        const prizePool = await this.getPrizePool();
        const top100 = await this.redisClient.zrevrange(this.leaderboardKey, 0, 99, 'WITHSCORES');
        const totalPlayers = top100.length / 2;
        if (totalPlayers === 0)
            return;
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
        const prizeDistribution = {
            1: prizePool * 0.2,
            2: prizePool * 0.15,
            3: prizePool * 0.1,
        };
        const remainingPrize = prizePool * 0.55;
        const updatePromises = players.map((player, i) => {
            let prize = 0;
            if (i === 0)
                prize = prizeDistribution[1];
            else if (i === 1)
                prize = prizeDistribution[2];
            else if (i === 2)
                prize = prizeDistribution[3];
            else
                prize = remainingPrize / 97;
            const sqlUpdate = this.prisma.player.update({
                where: { id: player.id },
                data: { money: { increment: prize } },
            });
            const redisUpdate = [
                'zadd',
                this.leaderboardKey,
                (player.money + prize).toString(),
                player.id.toString(),
            ];
            return { sqlUpdate, redisUpdate };
        });
        await Promise.all(updatePromises.map((p) => p.sqlUpdate));
        await this.redisClient
            .multi(updatePromises.map((p) => p.redisUpdate))
            .exec();
        await this.clearLeaderboard();
    }
    async getPlayerDetails(players, surroundingPlayers = []) {
        const topPlayerIds = players
            .filter((_, i) => i % 2 === 0)
            .map((id) => parseInt(id));
        const surroundingPlayerIds = surroundingPlayers
            .filter((_, i) => i % 2 === 0)
            .map((id) => parseInt(id));
        const topPlayerDetails = [];
        for (let i = 0; i < topPlayerIds.length; i++) {
            const player = await this.prisma.player.findUnique({
                where: { id: topPlayerIds[i] },
            });
            topPlayerDetails.push(player);
        }
        const surroundingPlayerDetails = surroundingPlayerIds.length > 0
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
    async getPrizePool() {
        const totalMoneySum = await this.prisma.player.aggregate({
            _sum: {
                money: true,
            },
        });
        return Math.floor(totalMoneySum._sum.money * 0.02);
    }
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, ioredis_1.InjectRedis)()),
    __metadata("design:paramtypes", [ioredis_2.default,
        prisma_service_1.PrismaService])
], LeaderboardService);
//# sourceMappingURL=leaderboard.service.js.map