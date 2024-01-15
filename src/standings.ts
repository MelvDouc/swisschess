import { Result } from "$src/constants.js";
import { getPlayerColor, getWinner } from "$src/pairing.js";
import { compareData, getPlayerDataRecord } from "$src/player.js";
import type { Pairing, Player, SwissTournament } from "$src/types.js";

export function getStandings(tournament: SwissTournament) {
  const dataRecord = getPlayerDataRecord(tournament);
  return [...tournament.players]
    .sort((a, b) => compareData(dataRecord[b.id], dataRecord[a.id]))
    .map((player, _, arr) => {
      const data = dataRecord[player.id];
      return {
        player,
        points: data.points,
        opponentPoints: data.opponentPoints,
        cumulativeScore: data.cumulativeScore,
        numberOfWins: data.numberOfWins,
        numberOfFirstPlayerGames: data.numberOfFirstPlayerGames,
        results: getPlayerResults(player, data.history).map((item) => ({
          ...item,
          opponentPosition: arr.indexOf(item.opponent) + 1
        }))
      };
    });
}

function getPlayerResults(player: Player, history: Pairing[]) {
  return history.map((pairing) => ({
    opponent: (pairing.whitePlayer === player) ? pairing.blackPlayer : pairing.whitePlayer,
    color: getPlayerColor(pairing, player),
    ownResult: getResultAbbreviation(pairing, player)
  }));
}

function getResultAbbreviation(pairing: Pairing, player: Player) {
  if (getWinner(pairing) === player)
    return "+";
  if (pairing.result === Result.Draw)
    return "=";
  return "-";
}