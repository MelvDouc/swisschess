import { Color, Result, nullPlayer } from "$src/constants.js";
import { getPlayerColor, getWinner } from "$src/pairing.js";
import { getHistoryRecord } from "$src/tournament.js";
import type { Pairing, Player, PlayerData, SwissTournament } from "$src/types.js";

function getPlayerData(tournament: SwissTournament, player: Player, history: Pairing[]) {
  const opponentIds = new Set<Player["id"]>();
  let points = 0;
  let cumulativeScore = 0;
  let numberOfFirstPlayerGames = 0;
  let numberOfWins = 0;
  let wonByForfeit = false;

  for (const pairing of history) {
    if (pairing.whitePlayer === player) {
      opponentIds.add(pairing.blackPlayer.id);
      numberOfFirstPlayerGames++;
    } else {
      opponentIds.add(pairing.whitePlayer.id);
    }

    if (pairing.result === Result.FirstPlayerWinByForfeit || pairing.result === Result.SecondPlayerWinByForfeit)
      wonByForfeit = true;

    if (getWinner(pairing) === player) {
      points += tournament.points.win;
      numberOfWins++;
    } else if (pairing.result === Result.Draw) {
      points += tournament.points.draw;
    }

    cumulativeScore += points;
  }

  const lastPairing = history.at(-1);
  const nextToLastPairing = history.at(-2);
  const previousColor = lastPairing ? getPlayerColor(lastPairing, player) : Color.None;
  const antePreviousColor = nextToLastPairing ? getPlayerColor(nextToLastPairing, player) : Color.None;
  const numberOfSecondPlayerGames = history.length - numberOfFirstPlayerGames;
  return {
    player,
    history,
    opponentIds,
    points,
    cumulativeScore,
    numberOfFirstPlayerGames,
    numberOfWins,
    previousColor,
    mustAlternate: previousColor !== Color.None && previousColor === antePreviousColor
      || Math.abs(numberOfFirstPlayerGames - numberOfSecondPlayerGames) >= 2,
    canBeBye: !opponentIds.has(nullPlayer.id) && !wonByForfeit
  };
}

export function getPlayerDataRecord(tournament: SwissTournament) {
  const historyRecord = getHistoryRecord(tournament);
  const record = tournament.players.reduce((acc, player) => {
    acc[player.id] = {
      ...getPlayerData(tournament, player, historyRecord[player.id]),
      opponentPoints: 0
    };
    return acc;
  }, {} as Record<number, PlayerData>);

  for (const id in record) {
    const data = record[id];
    data.opponentIds.forEach((id) => {
      if (id !== nullPlayer.id)
        data.opponentPoints += record[id].points;
    });
    Object.freeze(data);
  }

  return Object.freeze(record);
}

export function compareData(data1: PlayerData, data2: PlayerData) {
  return data1.points - data2.points
    || data1.opponentPoints - data2.opponentPoints
    || data1.cumulativeScore - data2.cumulativeScore
    || compareEncounter(data1, data2)
    || data1.numberOfWins - data2.numberOfWins;
}

function compareEncounter(data1: PlayerData, { player: player2 }: PlayerData) {
  for (const pairing of data1.history) {
    if (pairing.whitePlayer.id !== player2.id && pairing.blackPlayer.id !== player2.id)
      continue;
    if (getWinner(pairing)?.id === data1.player.id)
      return 1;
    return (pairing.result === Result.Draw) ? 0 : -1;
  }

  return 0;
}