import { IEntity } from '../Abstract/entity.interface';

export class Player implements IEntity {
  id: number;
  name: string;
  country: string;
  money: number;
}
