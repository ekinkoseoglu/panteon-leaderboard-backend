import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/DataAccess/prisma.service';
import { ILeaderboardService } from '../Abstract/leaderboard.interface';
import Redis from 'ioredis';
export declare class LeaderboardService implements ILeaderboardService, OnModuleInit {
    private readonly redisClient;
    private readonly prisma;
    private leaderboardKey;
    private cacheExpiration;
    constructor(redisClient: Redis, prisma: PrismaService);
    onModuleInit(): Promise<void>;
    loadPlayersIntoRedis(): Promise<void>;
    clearLeaderboard(): Promise<void>;
    getLeaderboard(playerId?: number): Promise<{
        topPlayers: {
            topPlayers: {
                rank: number;
                money: string;
                name: string;
                id: number;
                country: string;
            }[];
            surroundingPlayers: {
                rank: number;
                money: string;
                name: string;
                id: number;
                country: string;
            }[];
        };
        surroundingPlayers: {
            topPlayers: {
                rank: number;
                money: string;
                name: string;
                id: number;
                country: string;
            }[];
            surroundingPlayers: {
                rank: number;
                money: string;
                name: string;
                id: number;
                country: string;
            }[];
        };
        playerRank: number;
        player?: undefined;
        data?: undefined;
        prizePool?: undefined;
    } | {
        topPlayers: {
            topPlayers: {
                rank: number;
                money: string;
                name: string;
                id: number;
                country: string;
            }[];
            surroundingPlayers: {
                rank: number;
                money: string;
                name: string;
                id: number;
                country: string;
            }[];
        };
        surroundingPlayers: {
            rank: number;
            name: string;
            id: number;
            country: string;
            money: number;
        }[];
        player: {
            rank: number;
            name: string;
            id: number;
            country: string;
            money: number;
        };
        playerRank?: undefined;
        data?: undefined;
        prizePool?: undefined;
    } | {
        data: {
            topPlayers: {
                rank: number;
                money: string;
                name: string;
                id: number;
                country: string;
            }[];
            surroundingPlayers: {
                rank: number;
                money: string;
                name: string;
                id: number;
                country: string;
            }[];
        };
        prizePool: number;
        topPlayers?: undefined;
        surroundingPlayers?: undefined;
        playerRank?: undefined;
        player?: undefined;
    }>;
    distributePrizePool(): Promise<void>;
    private getPlayerDetails;
    getPrizePool(): Promise<number>;
}
