export interface Player {
  id: string;
  socketId: string;
  position: { x: number; y: number };
  color: string;
  width: number;
  height: number;
  nickname?: string;
  velocity?: { x: number; y: number };
  caughtCount: number;
  isIt: boolean;
  isImmune: boolean;
}
