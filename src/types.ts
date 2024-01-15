import type Pairing from "$src/Pairing.js";
import type Player from "$src/Player.js";
import type { Color } from "$src/constants.js";

export type BasicPairing = Pick<Pairing, "whitePlayer" | "blackPlayer">;

export interface PlayerData {
  player: Player;
  history: Pairing[];
  points: number;
  opponentPoints: number;
  cumulativeScore: number;
  numberOfWhiteGames: number;
  numberOfWins: number;
  previousColor: Color;
  mustAlternate: boolean;
  opponentIds: Set<Player["id"]>;
  canBeBye: boolean;
}