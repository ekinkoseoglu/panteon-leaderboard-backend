import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { PrismaModule } from './DataAccess/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LeaderboardModule } from './Business/Modules/leaderboard.module';
import { PlayerModule } from './Business/Modules/player.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PlayerModule,
    PrismaModule,
    LeaderboardModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: process.env.REDIS_URL,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
