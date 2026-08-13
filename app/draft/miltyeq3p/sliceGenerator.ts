import { DEFAULT_SLICE_SETTINGS } from "~/components/SliceSettingsModal";
import { miltySystemTiers } from "~/data/miltyTileTiers";
import { systemData } from "~/data/systemData";
import { SystemId, SystemIds } from "~/types";
import { calculateSliceValue, getSliceValueConfig } from "~/stats";
import { filterTieredSystems, isAlpha, isBeta, isLegendary } from "../helpers/sliceGeneration";
import { shuffle, weightedChoice } from "../helpers/randomization";
import { coreGenerateSlices } from "../common/sliceGenerator";
import { SLICE_SHAPES } from "../sliceShapes";
import { SliceChoice, SliceGenerationConfig, TieredSystems } from "../types";

const SLICE_CHOICES: SliceChoice[] = [
  { weight: 1, value: ["red", "high", "high"] },
  { weight: 2, value: ["red", "high", "med"] },
  { weight: 2, value: ["red", "med", "med"] },
  { weight: 2, value: ["red", "med", "low"] },
  { weight: 1, value: ["red", "low", "low"] },
  { weight: 1, value: ["red", "low", "high"] },
];

const DEFAULT_CONFIG = DEFAULT_SLICE_SETTINGS.miltyeq;

const validateSlice = (slice: SystemIds, config: SliceGenerationConfig) => {
  const systems = slice.map((systemId: SystemId) => systemData[systemId]);
  const validSpecialTiles =
    systems.filter(isAlpha).length <= 1 &&
    systems.filter(isBeta).length <= 1 &&
    systems.filter(isLegendary).length <= 1;
  if (!validSpecialTiles) return false;

  const totalOptimal = calculateSliceValue(
    systems,
    getSliceValueConfig(
      config.sliceValueModifiers,
      [],
      config.mecatolPathSystemIndices!,
    ),
  );

  const minSliceValue = config.minSliceValue ?? DEFAULT_CONFIG.minSliceValue;
  const maxSliceValue = config.maxSliceValue ?? DEFAULT_CONFIG.maxSliceValue;
  const rawOptimal = systems.reduce(
    (acc, s) => ({
      resources: acc.resources + s.optimalSpend.resources,
      influence: acc.influence + s.optimalSpend.influence,
      flex: acc.flex + s.optimalSpend.flex,
    }),
    { resources: 0, influence: 0, flex: 0 },
  );
  const infOptimal = rawOptimal.influence + rawOptimal.flex;
  const resOptimal = rawOptimal.resources + rawOptimal.flex;

  if (config.minOptimalInfluence && infOptimal < config.minOptimalInfluence)
    return false;
  if (config.minOptimalResources && resOptimal < config.minOptimalResources)
    return false;
  if (maxSliceValue !== undefined && totalOptimal > maxSliceValue) return false;
  if (minSliceValue !== undefined && totalOptimal < minSliceValue) return false;

  return true;
};

export const generateSlices = (
  sliceCount: number,
  availableSystems: SystemId[],
  config?: SliceGenerationConfig,
) =>
  coreGenerateSlices({
    mecatolPath: config!.mecatolPathSystemIndices!,
    centerTile: 1,
    sliceCount,
    availableSystems,
    config: config ?? DEFAULT_CONFIG,
    sliceShape: SLICE_SHAPES.milty_eq.slice(0, 4),
    systemTiers: miltySystemTiers,
    getSliceTiers: () => shuffle(weightedChoice(SLICE_CHOICES)),
    validateSystems: (
      systems: TieredSystems,
      config: SliceGenerationConfig,
    ) => {
      const alphas = filterTieredSystems(systems, isAlpha).length;
      const betas = filterTieredSystems(systems, isBeta).length;
      const legendaries = filterTieredSystems(systems, isLegendary).length;

      const minAlphas = config.numAlphas ?? DEFAULT_CONFIG.minAlphaWormholes;
      const minBetas = config.numBetas ?? DEFAULT_CONFIG.minBetaWormholes;
      const minLegendaries =
        config.minLegendaries ?? DEFAULT_CONFIG.minLegendaries;
      const maxLegendaries = config.maxLegendaries;

      const meetsMinLegendaries = legendaries >= minLegendaries;
      const meetsMaxLegendaries =
        maxLegendaries === undefined || legendaries <= maxLegendaries;

      return (
        alphas >= minAlphas &&
        betas >= minBetas &&
        meetsMinLegendaries &&
        meetsMaxLegendaries
      );
    },
    validateSlice,
  });