import { getHistoryRecord, getNextRound, getStandings } from "$src/index.js";
import type { SwissTournament } from "$src/types.js";
import { getRandomPlayers, getRandomResult } from "$src/utils.js";
import { expect } from "chai";
import { test } from "node:test";

test("No two players should be paired together twice.", () => {
  const tournament: SwissTournament = {
    numberOfRounds: 7,
    players: getRandomPlayers(60),
    rounds: [],
    points: {
      win: 1,
      draw: 0.5
    }
  };
  for (let i = 0; i < tournament.numberOfRounds; i++) {
    const pairings = getNextRound(tournament);
    if (!pairings) {
      expect(i).to.eq(tournament.numberOfRounds);
      break;
    }
    pairings.forEach((pairing) => {
      pairing.result = getRandomResult();
    });
    tournament.rounds.push(pairings);
  }

  console.table(
    getStandings(tournament).map(({ player, points, opponentPoints, cumulativeScore, results }) => {
      return {
        player: player.name,
        points,
        opponentPoints,
        cumulativeScore,
        results: results.map(({ opponentPosition, color, ownResult }) => opponentPosition + color + ownResult).join(" ")
      };
    })
  );

  const histories = getHistoryRecord(tournament);
  Object.values(histories).forEach((pairing) => {
    expect(pairing).to.have.length(tournament.numberOfRounds);
  });
});