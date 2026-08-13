import { rotateSlice } from "~/utils/hexagonal";
import { DraftConfig } from "../types";
import { generateSlices } from "../milty/sliceGenerator";
import { coreGenerateMap } from "../common/sliceGenerator";
import {
  THREE_PLAYER_CLOSED_POSITIONS,
  THREE_PLAYER_HYPERLANE_MILTY_SLICE,
  THREE_PLAYER_HOME_POSITIONS,
  THREE_PLAYER_HYPERLANE_MAP_TILES,
  THREE_PLAYER_HYPERLANE_PRESET_TILES,
} from "../common/threePlayer";

export const milty3phyperlane: DraftConfig = {
  numPlayers: 3,
  type: "milty3phyperlane",
  numSystemsInSlice: 5,
  mecatolPathSystemIndices: [1, 4],
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [...THREE_PLAYER_HOME_POSITIONS],
  modifiableMapTiles: THREE_PLAYER_HYPERLANE_MAP_TILES,
  presetTiles: THREE_PLAYER_HYPERLANE_PRESET_TILES,
  closedMapTiles: THREE_PLAYER_CLOSED_POSITIONS,
  seatTilePositions: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: -1 },
    { x: 0, y: -2 },
  ],
  seatTilePlacement: {
    0: THREE_PLAYER_HYPERLANE_MILTY_SLICE,
    1: rotateSlice(THREE_PLAYER_HYPERLANE_MILTY_SLICE, 2),
    2: rotateSlice(THREE_PLAYER_HYPERLANE_MILTY_SLICE, 4),
  } as Record<number, [number, number][]>,
  generateMap: (settings, systemPool, minorFactionPool) =>
    coreGenerateMap(settings, systemPool, 0, generateSlices, minorFactionPool),
  generateSlices,
};