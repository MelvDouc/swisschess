import type Player from "$src/Player.js";
import { Color, Result } from "$src/constants.js";
import type { BasicPairing, PlayerData } from "$src/types.js";

export default class Pairing {
  public static tryPairings(players: Player[], dataRecord: Record<number, PlayerData>, pairingSet: Set<BasicPairing>) {
    if (players.length === 0)
      return true;

    const topSeed = players[0];

    for (let i = 1; i < players.length; i++) {
      const opponent = players[i];
      const color = this.getIdealColor(dataRecord[topSeed.id], dataRecord[opponent.id]);

      if (color === Color.None)
        continue;

      const otherPlayers = players.slice(1);
      otherPlayers.splice(i - 1, 1);
      const pairing = {
        whitePlayer: color === Color.White ? topSeed : opponent,
        blackPlayer: color === Color.White ? opponent : topSeed
      };
      pairingSet.add(pairing);

      if (this.tryPairings(otherPlayers, dataRecord, pairingSet))
        return true;

      pairingSet.delete(pairing);
    }

    return false;
  }

  public static getIdealColor(data1: PlayerData, data2: PlayerData) {
    if (data1.opponentIds.has(data2.player.id))
      return Color.None;

    if (data1.mustAlternate) {
      if (data2.mustAlternate && data2.previousColor === data1.previousColor)
        return Color.None;
      return data1.previousColor === Color.Black
        ? Color.White
        : Color.Black;
    }

    if (
      data2.mustAlternate && data2.previousColor === Color.White
      || data1.numberOfWhiteGames < data2.numberOfWhiteGames
      || data1.points < data2.points
    )
      return Color.White;

    return Color.Black;
  }

  public readonly roundIndex: number;
  public readonly whitePlayer: Player;
  public readonly blackPlayer: Player;
  result: Result;

  public constructor(roundIndex: number, whitePlayer: Player, blackPlayer: Player, result = Result.None) {
    this.roundIndex = roundIndex;
    this.whitePlayer = whitePlayer;
    this.blackPlayer = blackPlayer;
    this.result = result;
  }

  public get winner() {
    switch (this.result) {
      case Result.FirstPlayerWin:
      case Result.FirstPlayerWinByForfeit:
        return this.whitePlayer;
      case Result.SecondPlayerWin:
      case Result.SecondPlayerWinByForfeit:
        return this.blackPlayer;
      default:
        return null;
    }
  }

  public getPlayerColor(player: Player) {
    switch (player.id) {
      case this.whitePlayer.id:
        return Color.White;
      case this.blackPlayer.id:
        return Color.Black;
      default:
        return Color.None;
    }
  }

  public getResultAbbreviation(player: Player) {
    if (this.winner?.id === player.id)
      return "+";
    if (this.isDraw())
      return "=";
    return "-";
  }

  public isWinByForfeit() {
    return this.result === Result.FirstPlayerWinByForfeit || this.result === Result.SecondPlayerWinByForfeit;
  }

  public isDraw() {
    return this.result === Result.Draw;
  }
}