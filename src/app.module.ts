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
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        console.log('Connecting to Redis with URL:', redisUrl);
        return {
          type: 'single',
          url: redisUrl,
          options: {
            // host: 'redis-15964.c311.eu-central-1-1.ec2.redns.redis-cloud.com',
            // port: 15964,
            password: redisPassword,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
