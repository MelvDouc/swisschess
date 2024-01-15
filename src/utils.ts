import { Result } from "$src/constants.js";
import Player from "$src/Player.js";
import { faker } from "@faker-js/faker";

// ===== ===== ===== ===== =====
// ARRAY
// ===== ===== ===== ===== =====

export function findLastIndex<T>(arr: T[], predicate: (element: T, index: number, arr: T[]) => boolean) {
  for (let i = arr.length - 1; i >= 0; i--)
    if (predicate(arr[i], i, arr))
      return i;

  return -1;
}

// ===== ===== ===== ===== =====
// TESTING
// ===== ===== ===== ===== =====

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomPlayers(count: number) {
  return Array.from({ length: count }, (_, i) => {
    return new Player({
      id: i + 1,
      name: faker.person.fullName(),
      rating: randomInt(1199, 2900)
    });
  });
}

export function getRandomResult() {
  switch (randomInt(1, 3)) {
    case 1:
      return Result.FirstPlayerWin;
    case 2:
      return Result.Draw;
    default:
      return Result.SecondPlayerWin;
  }
}