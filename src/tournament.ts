import type { Pairing, Player, SwissTournament } from "$src/types.js";

export function getHistoryRecord(tournament: SwissTournament) {
  const histories = tournament.players.reduce((acc, player) => {
    acc[player.id] = [];
    return acc;
  }, {} as Record<Player["id"], Pairing[]>);
  tournament.rounds.forEach((pairings) => {
    pairings.forEach((pairing) => {
      histories[pairing.whitePlayer.id].push(pairing);
      histories[pairing.blackPlayer.id].push(pairing);
    });
  });
  return histories;
}