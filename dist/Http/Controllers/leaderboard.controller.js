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
exports.LeaderboardController = void 0;
const common_1 = require("@nestjs/common");
const leaderboard_service_1 = require("src/Business/Concrete/leaderboard.service");
let LeaderboardController = class LeaderboardController {
    constructor(leaderboardService) {
        this.leaderboardService = leaderboardService;
    }
    async getLeaderboard(playerId) {
        await this.leaderboardService.loadPlayersIntoRedis();
        return this.leaderboardService.getLeaderboard(playerId);
    }
    async nextWeek() {
        return this.leaderboardService.getPrizePool();
    }
    async distributePrizePool() {
        await this.leaderboardService.distributePrizePool();
        return { message: 'Prize pool distributed successfully.' };
    }
    async clearLeaderboard() {
        await this.leaderboardService.clearLeaderboard();
        return { message: 'Leaderboard cleared successfully.' };
    }
};
exports.LeaderboardController = LeaderboardController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('playerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('nextWeek'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "nextWeek", null);
__decorate([
    (0, common_1.Post)('distributePrizePool'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "distributePrizePool", null);
__decorate([
    (0, common_1.Post)('clear-leaderboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "clearLeaderboard", null);
exports.LeaderboardController = LeaderboardController = __decorate([
    (0, common_1.Controller)('leaderboard'),
    __metadata("design:paramtypes", [leaderboard_service_1.LeaderboardService])
], LeaderboardController);
//# sourceMappingURL=leaderboard.controller.js.map