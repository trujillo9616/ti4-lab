import { describe, expect, test } from "vitest";
import { DraftSettings } from "~/types";
import { getSystemPool } from "~/utils/system";
import { hydrateDemoMap } from "~/utils/map";
import { draftConfig } from "./draftConfig";
import { withDeterministicDraftRandomness } from "./testUtils";
import {
  THREE_PLAYER_CLOSED_POSITIONS,
  THREE_PLAYER_HOME_POSITIONS,
  THREE_PLAYER_HYPERLANE_PRESET_TILES,
} from "./common/threePlayer";

const THREE_PLAYER_TYPES = [
  "heisen3p",
  "heisen3phyperlane",
  "milty3p",
  "milty3phyperlane",
  "miltyeq3p",
  "miltyeq3phyperlane",
] as const;

const defaultTestSettings = {
  draftSpeaker: false,
  allowEmptyTiles: false,
  allowHomePlanetSearch: false,
  numFactions: 3,
  numSlices: 3,
  randomizeMap: false,
  randomizeSlices: false,
  numPreassignedFactions: 0,
  numMinorFactions: 0,
  minorFactionsInSharedPool: false,
} as const;

const THREE_PLAYER_TEST_SEEDS = {
  heisen3p: 2,
  heisen3phyperlane: 5,
  milty3p: 7,
  milty3phyperlane: 11,
  miltyeq3p: 13,
  miltyeq3phyperlane: 17,
} as const;

describe("3-player draft configs", () => {
  test.each(THREE_PLAYER_TYPES)("%s generates valid maps deterministically", (type) => {
    const config = draftConfig[type];
    const settings: DraftSettings = {
      ...defaultTestSettings,
      type,
      factionGameSets: ["base", "pok"],
      tileGameSets: ["base", "pok"],
      sliceGenerationConfig: {
        mecatolPathSystemIndices: config.mecatolPathSystemIndices,
      },
    };

    const generateMap = config.generateMap;
    const systemPool = getSystemPool(["base", "pok"]);
    const seed = THREE_PLAYER_TEST_SEEDS[type];

    expect(generateMap).toBeDefined();

    const first = withDeterministicDraftRandomness(seed, () =>
      generateMap!(settings, [...systemPool]),
    );
    const second = withDeterministicDraftRandomness(seed, () =>
      generateMap!(settings, [...systemPool]),
    );

    expect(first).toEqual(second);
    expect(first).toBeDefined();
    expect(first?.valid).toBe(true);
    expect(first?.slices).toHaveLength(3);
    expect(first?.map).toHaveLength(37);
  });

  test.each(THREE_PLAYER_TYPES)("%s uses the shared 3-player shell", (type) => {
    const config = draftConfig[type];

    expect(config.numPlayers).toBe(3);
    expect(config.homeIdxInMapString).toEqual([...THREE_PLAYER_HOME_POSITIONS]);
    expect(config.closedMapTiles).toEqual(THREE_PLAYER_CLOSED_POSITIONS);
  });

  test.each(["heisen3p", "heisen3phyperlane"] as const)(
    "%s uses 3 live slice systems and the nucleus-style shared map",
    (type) => {
      const config = draftConfig[type];

      expect(config.numSystemsInSlice).toBe(3);
      expect(config.seatTilePlacement[0]).toHaveLength(3);
      expect(config.modifiableMapTiles).toContain(1);
      expect(config.modifiableMapTiles).toContain(3);
      expect(config.modifiableMapTiles).toContain(5);
      expect(config.minorFactionsEqPositions).toBeUndefined();
    },
  );

  test.each(["miltyeq3p", "miltyeq3phyperlane"] as const)(
    "%s keeps the 4-system live EQ slice",
    (type) => {
      const config = draftConfig[type];

      expect(config.numSystemsInSlice).toBe(4);
      expect(config.seatTilePlacement[0]).toHaveLength(4);
      expect(config.minorFactionsEqPositions).toEqual([2, 4, 6]);
    },
  );

  test("milty3p speaker preview uses the hyperlane-left spot", () => {
    const speakerTiles = hydrateDemoMap(draftConfig.milty3p)
      .filter((tile) => tile.type === "PLAYER_DEMO" && tile.playerNumber === 0)
      .map((tile) => tile.idx)
      .sort((a, b) => a - b);

    expect(speakerTiles).toEqual([1, 7, 8, 19, 20, 36]);
  });

  test("hyperlane variants use the provided preset tiles", () => {
    expect(draftConfig.milty3phyperlane.presetTiles).toEqual(
      THREE_PLAYER_HYPERLANE_PRESET_TILES,
    );
    expect(draftConfig.heisen3phyperlane.presetTiles).toEqual(
      THREE_PLAYER_HYPERLANE_PRESET_TILES,
    );
    expect(draftConfig.miltyeq3phyperlane.presetTiles).toEqual(
      THREE_PLAYER_HYPERLANE_PRESET_TILES,
    );

    const config = draftConfig.heisen3phyperlane;
    const generated = withDeterministicDraftRandomness(
      THREE_PLAYER_TEST_SEEDS.heisen3phyperlane,
      () =>
        config.generateMap!(
          {
            ...defaultTestSettings,
            type: "heisen3phyperlane",
            factionGameSets: ["base", "pok"],
            tileGameSets: ["base", "pok"],
            sliceGenerationConfig: {
              mecatolPathSystemIndices: config.mecatolPathSystemIndices,
            },
          },
          getSystemPool(["base", "pok"]),
        ),
    );

    expect(generated?.valid).toBe(true);
    Object.entries(THREE_PLAYER_HYPERLANE_PRESET_TILES).forEach(
      ([idx, preset]) => {
        const tile = generated?.map[Number(idx)];
        expect(tile?.type).toBe("SYSTEM");
        if (tile?.type === "SYSTEM") {
          expect(tile.systemId).toBe(preset.systemId);
        }
      },
    );
  });
});