import { Color, Result, nullPlayer } from "$src/constants.js";
import { compareData, getPlayerDataRecord } from "$src/player.js";
import type {
  BasicPairing,
  Pairing,
  Player,
  PlayerData,
  SwissTournament
} from "$src/types.js";
import { findLastIndex } from "$src/utils.js";

export function getPlayerColor(pairing: Pairing, player: Player) {
  switch (player) {
    case pairing.whitePlayer:
      return Color.White;
    case pairing.blackPlayer:
      return Color.Black;
    default:
      return Color.None;
  }
}

export function getWinner(pairing: Pairing) {
  switch (pairing.result) {
    case Result.FirstPlayerWin:
    case Result.FirstPlayerWinByForfeit:
      return pairing.whitePlayer;
    case Result.SecondPlayerWin:
    case Result.SecondPlayerWinByForfeit:
      return pairing.blackPlayer;
    default:
      return null;
  }
}

function getIdealColor(data1: PlayerData, data2: PlayerData) {
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
    || data1.numberOfFirstPlayerGames < data2.numberOfFirstPlayerGames
    || data1.points < data2.points
  )
    return Color.White;

  return Color.Black;
}

export function getNextRound(tournament: SwissTournament) {
  const roundIndex = tournament.rounds.length;
  const attempt = (roundIndex === 0)
    ? getFirstRoundPairings(tournament)
    : getSubsequentRoundPairings(tournament);

  if (!attempt.pairings)
    return null;

  const pairings = attempt.pairings.map(({ whitePlayer, blackPlayer }) => ({
    roundIndex,
    whitePlayer,
    blackPlayer,
    result: Result.None
  }));

  if (attempt.bye)
    pairings.push({
      roundIndex,
      whitePlayer: attempt.bye,
      blackPlayer: nullPlayer,
      result: Result.FirstPlayerWin
    });

  return pairings;
}

function getFirstRoundPairings(tournament: SwissTournament) {
  const players = [...tournament.players].sort((a, b) => b.rating - a.rating);
  const bye = (players.length % 2 === 1)
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

function getSubsequentRoundPairings(tournament: SwissTournament) {
  const dataRecord = getPlayerDataRecord(tournament);
  const players = [...tournament.players].sort((a, b) => {
    return compareData(dataRecord[b.id], dataRecord[a.id]);
  });
  let bye: Player | null = null;

  if (players.length % 2 === 1) {
    const byeIndex = findLastIndex(players, ({ id }) => dataRecord[id].canBeBye);
    if (byeIndex !== -1)
      bye = players.splice(byeIndex, 1)[0];
  }

  const pairingSet = new Set<BasicPairing>();
  const success = tryPairings(players, dataRecord, pairingSet);
  return {
    pairings: success ? [...pairingSet] : null,
    bye
  };
}

function tryPairings(players: Player[], dataRecord: Record<number, PlayerData>, pairingSet: Set<BasicPairing>) {
  if (players.length === 0)
    return true;

  const topSeed = players[0];

  for (let i = 1; i < players.length; i++) {
    const opponent = players[i];
    const color = getIdealColor(dataRecord[topSeed.id], dataRecord[opponent.id]);

    if (color === Color.None)
      continue;

    const otherPlayers = players.slice(1);
    otherPlayers.splice(i - 1, 1);
    const pairing = {
      whitePlayer: color === Color.White ? topSeed : opponent,
      blackPlayer: color === Color.White ? opponent : topSeed
    };
    pairingSet.add(pairing);

    if (tryPairings(otherPlayers, dataRecord, pairingSet))
      return true;

    pairingSet.delete(pairing);
  }

  return false;
}