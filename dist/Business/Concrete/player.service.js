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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("src/DataAccess/prisma.service");
let PlayerService = class PlayerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAll() {
        return this.prisma.player.findMany({
            orderBy: {
                money: 'desc',
            },
        });
    }
    async getById(id) {
        return this.prisma.player.findUnique({
            where: { id },
        });
    }
    async create(name, country, money) {
        return this.prisma.player.create({
            data: {
                name,
                country,
                money,
            },
        });
    }
    async delete(id) {
        return this.prisma.player.delete({
            where: { id },
        });
    }
    async update(id, name, country) {
        return this.prisma.player.update({
            where: { id },
            data: {
                name,
                country,
            },
        });
    }
};
exports.PlayerService = PlayerService;
exports.PlayerService = PlayerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlayerService);
//# sourceMappingURL=player.service.js.map