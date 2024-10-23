import { PrismaService } from 'src/DataAccess/prisma.service';
export declare class PlayerService {
    private prisma;
    constructor(prisma: PrismaService);
    getAll(): Promise<{
        name: string;
        id: number;
        country: string;
        money: number;
    }[]>;
    getById(id: number): Promise<{
        name: string;
        id: number;
        country: string;
        money: number;
    }>;
    create(name: string, country: string, money?: number): Promise<{
        name: string;
        id: number;
        country: string;
        money: number;
    }>;
    delete(id: number): Promise<{
        name: string;
        id: number;
        country: string;
        money: number;
    }>;
    update(id: number, name: string, country: string): Promise<{
        name: string;
        id: number;
        country: string;
        money: number;
    }>;
}
