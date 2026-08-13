import { rotateSlice } from "~/utils/hexagonal";
import { generateMap, generateSlices } from "../heisen/generateMap";
import { DraftConfig } from "../types";
import {
  THREE_PLAYER_CLOSED_POSITIONS,
  THREE_PLAYER_HOME_POSITIONS,
  THREE_PLAYER_NUCLEUS_MAP_TILES,
  THREE_PLAYER_NUCLEUS_SLICE,
} from "../common/threePlayer";

export const heisen3p: DraftConfig = {
  numPlayers: 3,
  type: "heisen3p",
  numSystemsInSlice: 3,
  sliceHeight: 2,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [...THREE_PLAYER_HOME_POSITIONS],
  modifiableMapTiles: THREE_PLAYER_NUCLEUS_MAP_TILES,
  presetTiles: {},
  closedMapTiles: THREE_PLAYER_CLOSED_POSITIONS,
  mecatolPathSystemIndices: [1],
  seatTilePositions: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
  ],
  seatTilePlacement: {
    0: THREE_PLAYER_NUCLEUS_SLICE,
    1: rotateSlice(THREE_PLAYER_NUCLEUS_SLICE, 2),
    2: rotateSlice(THREE_PLAYER_NUCLEUS_SLICE, 4),
  } as Record<number, [number, number][]>,
  generateMap,
  generateSlices,
};