import type Pairing from "$src/Pairing.js";
import type SwissTournament from "$src/SwissTournament.js";
import { Color } from "$src/constants.js";
import type { PlayerData } from "$src/types.js";

export default class Player {
  public static readonly nullPlayer = new this({
    id: 0,
    name: "NULL PLAYER",
    rating: 0
  });

  public static compareData(data1: PlayerData, data2: PlayerData) {
    return data1.points - data2.points
      || data1.opponentPoints - data2.opponentPoints
      || data1.cumulativeScore - data2.cumulativeScore
      || this.compareEncounter(data1, data2)
      || data1.numberOfWins - data2.numberOfWins;
  }

  public static compareEncounter(data1: PlayerData, { player: player2 }: PlayerData) {
    for (const pairing of data1.history) {
      if (pairing.whitePlayer.id !== player2.id && pairing.blackPlayer.id !== player2.id)
        continue;
      if (pairing.winner?.id === data1.player.id)
        return 1;
      return (pairing.isDraw()) ? 0 : -1;
    }

    return 0;
  }

  public readonly id: number;
  public readonly name: string;
  public readonly rating: number;

  public constructor({ id, name, rating }: {
    id: number;
    name: string;
    rating?: number;
  }) {
    this.id = id;
    this.name = name;
    this.rating = rating ?? 0;
  }

  public getIndividualResults(history: Pairing[]) {
    return history.map((pairing) => ({
      opponent: (pairing.whitePlayer.id === this.id) ? pairing.blackPlayer : pairing.whitePlayer,
      color: pairing.getPlayerColor(this),
      ownResult: pairing.getResultAbbreviation(this)
    }));
  }

  public getData(tournament: SwissTournament, history: Pairing[]): Omit<PlayerData, "opponentPoints"> {
    const opponentIds = new Set<Player["id"]>();
    let points = 0;
    let cumulativeScore = 0;
    let numberOfWhiteGames = 0;
    let numberOfWins = 0;
    let wonByForfeit = false;

    for (const pairing of history) {
      if (pairing.whitePlayer.id === this.id) {
        opponentIds.add(pairing.blackPlayer.id);
        numberOfWhiteGames++;
      } else {
        opponentIds.add(pairing.whitePlayer.id);
      }

      if (pairing.winner?.id === this.id) {
        points += tournament.points.win;
        numberOfWins++;
        if (pairing.isWinByForfeit())
          wonByForfeit = true;
      } else if (pairing.isDraw()) {
        points += tournament.points.draw;
      }

      cumulativeScore += points;
    }

    const previousColor = history.at(-1)?.getPlayerColor(this) ?? Color.None;
    const antePreviousColor = history.at(-2)?.getPlayerColor(this) ?? Color.None;
    const numberOfBlackGames = history.length - numberOfWhiteGames;
    return {
      player: this,
      history,
      opponentIds,
      points,
      cumulativeScore,
      numberOfWhiteGames,
      numberOfWins,
      previousColor,
      mustAlternate: previousColor !== Color.None && previousColor === antePreviousColor
        || Math.abs(numberOfWhiteGames - numberOfBlackGames) >= 2,
      canBeBye: !opponentIds.has(Player.nullPlayer.id) && !wonByForfeit
    };
  }
}