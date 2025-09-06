import type { Player } from "./player";

export interface GameInitData {
  playerId: string;
  player: Player;
  players: Player[];
}
