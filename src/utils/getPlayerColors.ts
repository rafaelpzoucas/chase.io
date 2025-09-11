import type { Player } from "@/types/player";
import { PLAYER_COLORS } from "@/utils/constants";

export function getPlayerColor(
  player: Player,
  isCurrentPlayer: boolean,
): string {
  if (player.isIt) return PLAYER_COLORS.PIQUE;

  if (player.isImmune) {
    return PLAYER_COLORS.IMMUNE;
  }

  if (isCurrentPlayer) return PLAYER_COLORS.SELECTED;

  return PLAYER_COLORS.NORMAL;
}
