export interface ILeaderboardService {
    loadPlayersIntoRedis(): Promise<void>;
    clearLeaderboard(): Promise<void>;
    getLeaderboard(playerId?: number): Promise<any>;
    distributePrizePool(): Promise<void>;
}
