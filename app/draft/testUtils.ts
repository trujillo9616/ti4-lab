import { vi } from "vitest";

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function withDeterministicDraftRandomness<T>(
  seed: number,
  callback: () => T,
): T {
  const randomSpy = vi
    .spyOn(Math, "random")
    .mockImplementation(createSeededRandom(seed));
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  try {
    return callback();
  } finally {
    logSpy.mockRestore();
    randomSpy.mockRestore();
  }
}