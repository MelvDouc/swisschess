import type { Player } from "$src/types.js";

export const nullPlayer: Player = {
  id: 0,
  name: "",
  rating: 0
};

export enum Result {
  None = "*",
  FirstPlayerWin = "1-0",
  FirstPlayerWinByForfeit = "1-F",
  SecondPlayerWin = "0-1",
  SecondPlayerWinByForfeit = "F-1",
  Draw = "1/2-1/2"
}

export enum Color {
  None,
  White,
  Black
}