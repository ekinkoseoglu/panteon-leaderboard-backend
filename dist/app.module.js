"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("@nestjs-modules/ioredis");
const prisma_module_1 = require("./DataAccess/prisma.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const leaderboard_module_1 = require("./Business/Modules/leaderboard.module");
const player_module_1 = require("./Business/Modules/player.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            player_module_1.PlayerModule,
            prisma_module_1.PrismaModule,
            leaderboard_module_1.LeaderboardModule,
            ioredis_1.RedisModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const redisUrl = configService.get('REDIS_URL');
                    const redisPassword = configService.get('REDIS_PASSWORD');
                    console.log('Connecting to Redis with URL:', redisUrl);
                    return {
                        type: 'single',
                        url: redisUrl,
                        options: {
                            password: redisPassword,
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map