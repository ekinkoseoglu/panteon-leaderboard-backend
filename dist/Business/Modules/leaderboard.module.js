"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/DataAccess/prisma.service");
const ioredis_1 = require("@nestjs-modules/ioredis");
const leaderboard_service_1 = require("../Concrete/leaderboard.service");
const leaderboard_controller_1 = require("src/Http/Controllers/leaderboard.controller");
const player_entity_1 = require("src/Entity/Models/player.entity");
let LeaderboardModule = class LeaderboardModule {
};
exports.LeaderboardModule = LeaderboardModule;
exports.LeaderboardModule = LeaderboardModule = __decorate([
    (0, common_1.Module)({
        imports: [ioredis_1.RedisModule],
        controllers: [leaderboard_controller_1.LeaderboardController],
        providers: [leaderboard_service_1.LeaderboardService, prisma_service_1.PrismaService, player_entity_1.Player],
    })
], LeaderboardModule);
//# sourceMappingURL=leaderboard.module.js.map