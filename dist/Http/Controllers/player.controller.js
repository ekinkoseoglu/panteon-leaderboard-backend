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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerController = void 0;
const common_1 = require("@nestjs/common");
const player_service_1 = require("src/Business/Concrete/player.service");
let PlayerController = class PlayerController {
    constructor(playerService) {
        this.playerService = playerService;
    }
    create(body) {
        return this.playerService.create(body.name, body.country, body.money);
    }
    findAll() {
        return this.playerService.getAll();
    }
    getById(id) {
        return this.playerService.getById(id);
    }
};
exports.PlayerController = PlayerController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PlayerController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('getall'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlayerController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':getById'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PlayerController.prototype, "getById", null);
exports.PlayerController = PlayerController = __decorate([
    (0, common_1.Controller)('players'),
    __metadata("design:paramtypes", [player_service_1.PlayerService])
], PlayerController);
//# sourceMappingURL=player.controller.js.map