import { Injectable, Delete } from '@nestjs/common';
import { PrismaService } from 'src/DataAccess/prisma.service';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.player.findMany();
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
