import { LeaderboardService } from 'src/Business/Concrete/leaderboard.service';
export declare class LeaderboardController {
    private readonly leaderboardService;
    constructor(leaderboardService: LeaderboardService);
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
    nextWeek(): Promise<number>;
    distributePrizePool(): Promise<{
        message: string;
    }>;
    clearLeaderboard(): Promise<{
        message: string;
    }>;
}
