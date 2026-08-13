import { rotateSlice } from "~/utils/hexagonal";
import { DraftConfig } from "../types";
import { generateMapForConfig, generateSlices } from "../miltyeq/sliceGenerator";
import {
  THREE_PLAYER_CLOSED_POSITIONS,
  THREE_PLAYER_EQ_MINOR_FACTION_POSITIONS,
  THREE_PLAYER_HOME_POSITIONS,
  THREE_PLAYER_HYPERLANE_EQ_MAP_TILES,
  THREE_PLAYER_HYPERLANE_PRESET_TILES,
  THREE_PLAYER_MILTY_EQ_SLICE,
} from "../common/threePlayer";

const generateMiltyeq3pHyperlaneMap: NonNullable<DraftConfig["generateMap"]> = (
  settings,
  systemPool,
  minorFactionPool,
) => {
  return generateMapForConfig(
    miltyeq3phyperlane,
    generateSlices,
    settings,
    systemPool,
    minorFactionPool,
  );
};

export const miltyeq3phyperlane: DraftConfig = {
  numPlayers: 3,
  type: "miltyeq3phyperlane",
  minorFactionsEqPositions: [...THREE_PLAYER_EQ_MINOR_FACTION_POSITIONS],
  numSystemsInSlice: 4,
  mecatolPathSystemIndices: [1, 3],
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [...THREE_PLAYER_HOME_POSITIONS],
  modifiableMapTiles: THREE_PLAYER_HYPERLANE_EQ_MAP_TILES,
  presetTiles: THREE_PLAYER_HYPERLANE_PRESET_TILES,
  closedMapTiles: THREE_PLAYER_CLOSED_POSITIONS,
  seatTilePositions: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: 0, y: -2 },
  ],
  seatTilePlacement: {
    0: THREE_PLAYER_MILTY_EQ_SLICE,
    1: rotateSlice(THREE_PLAYER_MILTY_EQ_SLICE, 2),
    2: rotateSlice(THREE_PLAYER_MILTY_EQ_SLICE, 4),
  } as Record<number, [number, number][]>,
  generateMap: generateMiltyeq3pHyperlaneMap,
  generateSlices,
};