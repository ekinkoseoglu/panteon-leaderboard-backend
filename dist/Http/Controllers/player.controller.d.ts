import { PlayerService } from 'src/Business/Concrete/player.service';
export declare class PlayerController {
    private readonly playerService;
    constructor(playerService: PlayerService);
    create(body: {
        name: string;
        country: string;
        money?: number;
    }): Promise<{
        name: string;
        id: number;
        country: string;
        money: number;
    }>;
    findAll(): Promise<{
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
}
