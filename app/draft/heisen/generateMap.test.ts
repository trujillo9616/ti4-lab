import { expect, test } from "vitest";
import { DraftSettings } from "~/types";
import { getSystemPool } from "~/utils/system";
import { generateMap } from "./generateMap";
import { withDeterministicDraftRandomness } from "../testUtils";

const defaultTestSettings = {
  type: "heisen",
  draftSpeaker: false,
  allowEmptyTiles: false,
  allowHomePlanetSearch: false,
  numFactions: 6,
  numSlices: 6,
  randomizeMap: false,
  randomizeSlices: false,
  numPreassignedFactions: 0,
  numMinorFactions: 0,
  minorFactionsInSharedPool: false,
} as const;

const TEST_SEEDS = [7, 19] as const;

function expectValidMap(result: ReturnType<typeof generateMap>, sliceCount: number) {
  expect(result).toBeDefined();
  expect(result?.valid).toBe(true);
  expect(result?.slices).toHaveLength(sliceCount);
  expect(result?.map.length).toBeGreaterThan(0);
}

test.each(TEST_SEEDS)("Heisen generates deterministically for seed %i", (seed) => {
  const settings: DraftSettings = {
    factionGameSets: ["base", "pok"],
    tileGameSets: ["base", "pok"],
    ...defaultTestSettings,
  };

  const systemPool = getSystemPool(["base", "pok"]);
  const first = withDeterministicDraftRandomness(seed, () =>
    generateMap(settings, [...systemPool]),
  );
  const second = withDeterministicDraftRandomness(seed, () =>
    generateMap(settings, [...systemPool]),
  );

  expect(first).toEqual(second);
  expectValidMap(first, settings.numSlices);
});
