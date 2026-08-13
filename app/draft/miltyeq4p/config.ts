import { DraftConfig } from "../types";
import { generateMapForConfig, generateSlices } from "../miltyeq/sliceGenerator";
import { rotateSlice } from "~/utils/hexagonal";

const generateMiltyeq4pMap: NonNullable<DraftConfig["generateMap"]> = (
  settings,
  systemPool,
  minorFactionPool,
) => {
  return generateMapForConfig(
    miltyeq4p,
    generateSlices,
    settings,
    systemPool,
    minorFactionPool,
  );
};

const slice: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 1],

  [0, 2],
];

export const miltyeq4p: DraftConfig = {
  numPlayers: 4,
  type: "miltyeq4p",
  numSystemsInSlice: 4,
  mecatolPathSystemIndices: [1, 3],
  sliceHeight: 3,
  sliceConcentricCircles: 1,
  homeIdxInMapString: [25, 31, 34, 22],
  modifiableMapTiles: [13, 16, 7, 10],
  minorFactionsEqPositions: [13, 16, 7, 10],
  presetTiles: {
    1: { systemId: "85A", rotation: 180 },
    4: { systemId: "85A", rotation: 0 },
    8: {
      systemId: "87A",
      rotation: 180,
    },
    12: {
      systemId: "87A",
      rotation: 120,
    },
    14: {
      systemId: "87A",
      rotation: 0,
    },
    18: {
      systemId: "87A",
      rotation: 300,
    },
    19: { systemId: "85A", rotation: 180 },
    20: {
      systemId: "84A",
      rotation: 0,
    },
    27: {
      systemId: "84A",
      rotation: 120,
    },
    28: {
      systemId: "85A",
      rotation: 0,
    },
    29: {
      systemId: "84A",
      rotation: 0,
    },
    36: {
      systemId: "84A",
      rotation: 120,
    },
  },
  closedMapTiles: [],
  seatTilePositions: [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    //   { x: -1, y: -1 },
    { x: 0, y: -2 },
  ],
  seatTilePlacement: {
    0: [
      [-1, 1],
      [-1, -0],
      [0, -1],
      //   [-3, 2],
      [-2, -0],
    ],
    1: rotateSlice(slice, 4),
    2: [
      [1, -1],
      [1, 0],
      [0, 1],
      //   [3, -2],
      [2, 0],
    ],
    3: rotateSlice(slice, 1),
  } as Record<number, [number, number][]>,
  generateMap: generateMiltyeq4pMap,
  generateSlices,
};
