import { expect, test } from "vitest";
import { miltyeq } from "./config";
import { DraftSettings } from "~/types";
import { getSystemPool } from "~/utils/system";
import { withDeterministicDraftRandomness } from "../testUtils";

const defaultTestSettings = {
  type: "miltyeq",
  draftSpeaker: false,
  allowEmptyTiles: false,
  allowHomePlanetSearch: false,
  numFactions: 2,
  numSlices: 6,
  randomizeMap: false,
  randomizeSlices: false,
  numPreassignedFactions: 0,
  numMinorFactions: 0,
  minorFactionsInSharedPool: false,
} as const;

const BASE_SEEDS = [3, 11] as const;
const DISCORDANT_SEEDS = [5, 17] as const;

function expectValidMap(
  result: ReturnType<NonNullable<typeof miltyeq.generateMap>>,
  sliceCount: number,
) {
  expect(result).toBeDefined();
  expect(result?.valid).toBe(true);
  expect(result?.slices).toHaveLength(sliceCount);
  expect(result?.map.length).toBeGreaterThan(0);
}

function expectDeterministicGeneration(
  seed: number,
  settings: DraftSettings,
  systemPool: ReturnType<typeof getSystemPool>,
) {
  const first = withDeterministicDraftRandomness(seed, () =>
    miltyeq.generateMap?.(settings, [...systemPool]),
  );
  const second = withDeterministicDraftRandomness(seed, () =>
    miltyeq.generateMap?.(settings, [...systemPool]),
  );

  expect(first).toEqual(second);
  expectValidMap(first, settings.numSlices);
}

test.each(BASE_SEEDS)("properly generates maps for seed %i", (seed) => {
  const settings: DraftSettings = {
    factionGameSets: ["base", "pok"],
    tileGameSets: ["base", "pok"],
    ...defaultTestSettings,
  };

  const systemPool = getSystemPool(["base", "pok"]);
  expectDeterministicGeneration(seed, settings, systemPool);
});

test.each(BASE_SEEDS)("properly generates maps with 8 slices for seed %i", (seed) => {
  const settings: DraftSettings = {
    ...defaultTestSettings,
    factionGameSets: ["base", "pok"],
    tileGameSets: ["base", "pok"],
    numSlices: 8,
  };
  const systemPool = getSystemPool(["base", "pok"]);
  expectDeterministicGeneration(seed, settings, systemPool);
});

test.each(DISCORDANT_SEEDS)(
  "Milty-EQ generates with discordant stars for seed %i",
  (seed) => {
  const settings: DraftSettings = {
    factionGameSets: ["base", "pok", "discordant", "discordantexp"],
    tileGameSets: [
      "base",
      "pok",
      "discordant",
      "discordantexp",
      "unchartedstars",
    ],
    ...defaultTestSettings,
  };
  const systemPool = getSystemPool([
    "base",
    "pok",
    "discordant",
    "discordantexp",
    "unchartedstars",
  ]);
    expectDeterministicGeneration(seed, settings, systemPool);
  },
);
