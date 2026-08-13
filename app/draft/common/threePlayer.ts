import { SystemId } from "~/types";

export const THREE_PLAYER_HOME_POSITIONS = [19, 25, 31] as const;

export const THREE_PLAYER_CLOSED_POSITIONS = [
  21, 22, 23, 27, 28, 29, 33, 34, 35,
];

export const THREE_PLAYER_STANDARD_MILTY_SLICE: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 1],
  [1, 1],
  [0, 2],
];

export const THREE_PLAYER_HYPERLANE_MILTY_SLICE: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 1],
  [2, 1],
  [0, 2],
];

export const THREE_PLAYER_NUCLEUS_SLICE: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 1],
];

export const THREE_PLAYER_MILTY_EQ_SLICE: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 1],
  [0, 2],
];

export const THREE_PLAYER_STANDARD_MAP_TILES = [2, 4, 6, 9, 10, 13, 14, 17, 18];

export const THREE_PLAYER_NUCLEUS_MAP_TILES = [
  1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18,
];

export const THREE_PLAYER_STANDARD_EQ_MAP_TILES = [
  2, 4, 6, 8, 9, 10, 12, 13, 14, 16, 17, 18,
];

export const THREE_PLAYER_EQ_MINOR_FACTION_POSITIONS = [2, 4, 6] as const;

export const THREE_PLAYER_HYPERLANE_MAP_TILES = [2, 4, 6];

export const THREE_PLAYER_HYPERLANE_NUCLEUS_MAP_TILES = [1, 2, 3, 4, 5, 6, 9, 13, 17];

export const THREE_PLAYER_HYPERLANE_EQ_MAP_TILES = [2, 4, 6, 9, 13, 17];

export const THREE_PLAYER_HYPERLANE_PRESET_TILES: Record<
  number,
  { systemId: SystemId; rotation?: number }
> = {
  8: { systemId: "85B" },
  10: { systemId: "91A", rotation: 120 },
  12: { systemId: "88B", rotation: 120 },
  14: { systemId: "84B", rotation: 60 },
  16: { systemId: "83B", rotation: 60 },
  18: { systemId: "86B" },
};