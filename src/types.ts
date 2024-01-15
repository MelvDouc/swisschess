import type { Color, Result } from "$src/constants.js";

export interface Player {
  readonly id: number;
  readonly name: string;
  readonly rating: number;
}

export interface Pairing {
  roundIndex: number;
  whitePlayer: Player;
  blackPlayer: Player;
  result: Result;
}

export type BasicPairing = Pick<Pairing, "whitePlayer" | "blackPlayer">;

export interface PlayerData {
  player: Player;
  history: Pairing[];
  points: number;
  opponentPoints: number;
  cumulativeScore: number;
  numberOfFirstPlayerGames: number;
  numberOfWins: number;
  previousColor: Color;
  mustAlternate: boolean;
  opponentIds: Set<Player["id"]>;
  canBeBye: boolean;
}

export interface SwissTournament {
  players: Player[];
  readonly numberOfRounds: number;
  rounds: Pairing[][];
  readonly points: {
    win: number;
    draw: number;
  };
}