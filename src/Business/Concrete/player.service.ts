import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Delete, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/DataAccess/prisma.service';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.player.findMany({
      orderBy: {
        money: 'desc',
      },
    });
  }

  async getById(id: number) {
    return this.prisma.player.findUnique({
      where: { id },
    });
  }

  async create(name: string, country: string) {
    return this.prisma.player.create({
      data: {
        name,
        country,
        money: 0,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.player.delete({
      where: { id },
    });
  }

  async update(id: number, name: string, country: string) {
    return this.prisma.player.update({
      where: { id },
      data: {
        name,
        country,
      },
    });
  }
}
