import { Module } from '@nestjs/common';

import { RedisModule } from '@nestjs-modules/ioredis';
// import { LeaderboardModule } from './Business/Modules/leaderboard.module';
import { PlayerModule } from './Business/Modules/player.module';
import { PrismaModule } from './DataAccess/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    PrismaModule,
    // LeaderboardModule,
    PlayerModule,
    CacheModule.register({
      ttl: 5,
      max: 150,
      isGlobal: true,
    }),
    // RedisModule.forRoot({
    //   config: {
    //     host: process.env.REDIS_HOST,
    //     port: +process.env.REDIS_PORT,
    //     password: process.env.REDIS_PASSWORD,
    //   },
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
