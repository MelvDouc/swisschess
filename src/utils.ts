import { Result } from "$src/constants.js";
import type { Player } from "$src/types.js";
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

const results = Object.values(Result);

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomPlayers(count: number) {
  return Array.from<unknown, Player>({ length: count }, (_, i) => {
    return {
      id: i + 1,
      name: faker.person.fullName(),
      rating: randomInt(1199, 2900)
    };
  });
}

export function getRandomResult() {
  return results[randomInt(0, results.length - 1)];
}