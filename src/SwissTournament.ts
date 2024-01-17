import Pairing from "$src/Pairing.js";
import Player from "$src/Player.js";
import { Result } from "$src/constants.js";
import type { BasicPairing, PlayerData } from "$src/types.js";
import { findLastIndex } from "$src/utils.js";

export default class SwissTournament {
  public readonly players: Player[];
  public readonly numberOfRounds: number;
  public readonly rounds: Pairing[][] = [];
  public readonly points: {
    win: number;
    draw: number;
  };
  public readonly extraInfo: Record<string | number | symbol, any> = {};

  public constructor({ players, numberOfRounds, points }: {
    players: Player[];
    numberOfRounds: number;
    points?: {
      win: number;
      draw: number;
    };
  }) {
    this.players = players;
    this.numberOfRounds = numberOfRounds;
    this.points = points ?? {
      win: 1,
      draw: 0.5
    };
  }

  public get historyRecord() {
    const historyRecord = this.players.reduce((acc, player) => {
      acc[player.id] = [];
      return acc;
    }, {} as Record<Player["id"], Pairing[]>);

    this.rounds.forEach((pairings) => {
      pairings.forEach((pairing) => {
        historyRecord[pairing.whitePlayer.id].push(pairing);
        if (pairing.blackPlayer.id !== Player.nullPlayer.id)
          historyRecord[pairing.blackPlayer.id].push(pairing);
      });
    });
    return historyRecord;
  }

  public get standings() {
    const dataRecord = this.getPlayerDataRecord();
    const players = [...this.players].sort((a, b) => Player.compareData(dataRecord[b.id], dataRecord[a.id]));
    return players.map((player) => {
      const data = dataRecord[player.id];
      return {
        player,
        points: data.points,
        opponentPoints: data.opponentPoints,
        cumulativeScore: data.cumulativeScore,
        numberOfWins: data.numberOfWins,
        numberOfWhiteGames: data.numberOfWhiteGames,
        results: player.getIndividualResults(data.history).map((item) => {
          const opponentPosition = (item.opponent.id === Player.nullPlayer.id)
            ? players.length + 1
            : players.indexOf(item.opponent) + 1;
          return { ...item, opponentPosition };
        })
      };
    });
  }

  public hasBye() {
    return this.players.length % 2 === 1;
  }

  public getNextRound(tournament: SwissTournament) {
    const roundIndex = tournament.rounds.length;
    const attempt = (roundIndex === 0)
      ? this.getFirstRoundPairings()
      : this.getSubsequentRoundPairings();

    if (!attempt.pairings)
      return null;

    const pairings = attempt.pairings.map(({ whitePlayer, blackPlayer }) => {
      return new Pairing(roundIndex, whitePlayer, blackPlayer);
    });

    if (attempt.bye)
      pairings.push(new Pairing(roundIndex, attempt.bye, Player.nullPlayer, Result.FirstPlayerWin));

    return pairings;
  }

  protected getPlayerDataRecord() {
    const { historyRecord } = this;
    const dataRecord = this.players.reduce((acc, player) => {
      acc[player.id] = {
        ...player.getData(this, historyRecord[player.id]),
        opponentPoints: 0
      };
      return acc;
    }, {} as Record<Player["id"], PlayerData>);

    for (const id in dataRecord) {
      const data = dataRecord[id];
      data.opponentIds.forEach((id) => {
        if (id !== Player.nullPlayer.id)
          data.opponentPoints += dataRecord[id].points;
      });
      Object.freeze(data);
    }

    return Object.freeze(dataRecord);
  }

  protected getFirstRoundPairings() {
    const players = [...this.players].sort((a, b) => b.rating - a.rating);
    const bye = this.hasBye()
      ? players.pop() as Player
      : null;

    const halfLength = players.length / 2;
    const pairings = Array.from({ length: halfLength }, (_, i) => {
      const player1 = players[i];
      const player2 = players[i + halfLength];
      return (i % 2 === 0)
        ? { whitePlayer: player1, blackPlayer: player2 }
        : { whitePlayer: player2, blackPlayer: player1 };
    });

    return {
      pairings,
      bye
    };
  }

  protected getSubsequentRoundPairings() {
    const dataRecord = this.getPlayerDataRecord();
    const players = [...this.players].sort((a, b) => {
      return Player.compareData(dataRecord[b.id], dataRecord[a.id]);
    });
    let bye: Player | null = null;

    if (this.hasBye()) {
      const byeIndex = findLastIndex(players, ({ id }) => dataRecord[id].canBeBye);
      // Works even if byeIndex === -1.
      bye = players.splice(byeIndex, 1)[0];
    }

    const pairingSet = new Set<BasicPairing>();
    const success = Pairing.tryPairings(players, dataRecord, pairingSet);
    return {
      pairings: success ? [...pairingSet] : null,
      bye
    };
  }
}