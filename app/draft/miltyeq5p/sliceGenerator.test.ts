import { expect, test } from "vitest";
import { DraftSettings } from "~/types";
import { getSystemPool } from "~/utils/system";
import { miltyeq5p } from "./config";
import { withDeterministicDraftRandomness } from "../testUtils";

const defaultTestSettings = {
  type: "miltyeq5p",
  draftSpeaker: false,
  allowEmptyTiles: false,
  allowHomePlanetSearch: false,
  numFactions: 2,
  numSlices: 10,
  randomizeMap: false,
  randomizeSlices: false,
  numPreassignedFactions: 0,
  numMinorFactions: 0,
  minorFactionsInSharedPool: false,
} as const;

const BASE_SEEDS = [13, 29] as const;
const DISCORDANT_SEEDS = [31, 43] as const;

function expectValidMap(
  result: ReturnType<NonNullable<typeof miltyeq5p.generateMap>>,
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
    miltyeq5p.generateMap?.(settings, [...systemPool]),
  );
  const second = withDeterministicDraftRandomness(seed, () =>
    miltyeq5p.generateMap?.(settings, [...systemPool]),
  );

  expect(first).toEqual(second);
  expectValidMap(first, settings.numSlices);
}

test.each(BASE_SEEDS)("Milty-EQ 5p generates deterministically for seed %i", (seed) => {
  const settings: DraftSettings = {
    factionGameSets: ["base", "pok"],
    tileGameSets: ["base", "pok"],
    ...defaultTestSettings,
  };

  const systemPool = getSystemPool(["base", "pok"]);
  expectDeterministicGeneration(seed, settings, systemPool);
});

test.each(DISCORDANT_SEEDS)(
  "Milty-EQ 5p generates with discordant stars for seed %i",
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
