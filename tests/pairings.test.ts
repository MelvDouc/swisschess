import { Player, SwissTournament } from "$src/index.js";
import { getRandomPlayers, getRandomResult } from "$src/utils.js";
import { expect } from "chai";
import { test } from "node:test";

test("No two players should be paired together twice.", () => {
  const tournament = playRandomTournament(60, 7);

  Object.values(tournament.historyRecord).forEach((pairing) => {
    expect(pairing).to.have.length(tournament.numberOfRounds);
  });
});

test("A tournament should work with many rounds.", () => {
  const tournament = playRandomTournament(49, 20);

  logStandings(tournament);

  Object.values(tournament.historyRecord).forEach((pairing) => {
    expect(pairing).to.have.length(tournament.numberOfRounds);
  });
});

// ===== ===== ===== ===== =====
// HELPERS
// ===== ===== ===== ===== =====

function playRandomTournament(numberOfPlayers: number, numberOfRounds: number) {
  const tournament = new SwissTournament({
    players: getRandomPlayers(numberOfPlayers),
    numberOfRounds
  });

  for (let i = 0; i < tournament.numberOfRounds; i++) {
    const pairings = tournament.getNextRound(tournament);
    if (!pairings) {
      expect(i).to.eq(tournament.numberOfRounds);
      break;
    }
    pairings.forEach((pairing) => {
      if (pairing.blackPlayer.id !== Player.nullPlayer.id)
        pairing.result = getRandomResult();
    });
    tournament.rounds.push(pairings);
  }

  return tournament;
}

function logStandings(tournament: SwissTournament) {
  console.table(
    tournament.standings.map(({ player, points, opponentPoints, cumulativeScore, results }) => {
      return {
        player: player.name,
        points,
        opponentPoints,
        cumulativeScore,
        results: results.map(({ opponentPosition, color, ownResult }) => opponentPosition + color + ownResult).join(" ")
      };
    })
  );
}