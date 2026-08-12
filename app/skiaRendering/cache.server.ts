import { loadImage, FontLibrary } from "skia-canvas";
import path from "path";
import { TechSpecialty, Anomaly } from "~/types";
import {
  TECH_ICON_PATHS,
  ANOMALY_IMAGE_PATHS,
  LEGENDARY_IMAGE_PATHS,
} from "./constants";
import { factions } from "~/data/factionData";

type CachedImage = CanvasImageSource;

// Cache for loaded tech icons
let techIconCache: Partial<Record<TechSpecialty, CachedImage>> | null = null;
// Cache for loaded anomaly images
let anomalyImageCache: Partial<Record<Anomaly, CachedImage>> | null = null;
// Cache for loaded legendary planet images
let legendaryImageCache: Record<string, CachedImage> | null = null;
// Cache for legendary icon
let legendaryIconCache: CachedImage | null = null;
// Cache for faction icons
let factionIconCache: Record<string, CachedImage> | null = null;
// Cache for background tile image
let backgroundTileCache: CachedImage | null = null;
// Cache for logo image
let logoCache: CachedImage | null = null;
// Cache for trade station image
let tradeStationCache: CachedImage | null = null;

export function initializeFonts(): void {
  const orbitronPath = path.join(process.cwd(), "public", "orbitron.ttf");
  const quanticoBoldPath = path.join(
    process.cwd(),
    "public",
    "Quantico-Bold.ttf",
  );
  FontLibrary.use(orbitronPath);
  FontLibrary.use(quanticoBoldPath);
}

export async function loadAllAssets(): Promise<void> {
  // Load tech icons if not cached
  if (!techIconCache) {
    techIconCache = {} as Partial<Record<TechSpecialty, CachedImage>>;
    for (const [tech, filename] of Object.entries(TECH_ICON_PATHS)) {
      const iconPath = path.join(process.cwd(), "public", filename);
      try {
        techIconCache[tech as TechSpecialty] =
          (await loadImage(iconPath)) as unknown as CachedImage;
      } catch (error) {
        console.error(`Failed to load tech icon ${tech}:`, error);
      }
    }
  }

  // Load anomaly images if not cached
  if (!anomalyImageCache) {
    anomalyImageCache = {} as Partial<Record<Anomaly, CachedImage>>;
    for (const [anomaly, filename] of Object.entries(ANOMALY_IMAGE_PATHS)) {
      if (filename) {
        const imagePath = path.join(process.cwd(), "public", filename);
        try {
          anomalyImageCache[anomaly as Anomaly] =
            (await loadImage(imagePath)) as unknown as CachedImage;
        } catch (error) {
          console.error(`Failed to load anomaly image ${anomaly}:`, error);
        }
      }
    }
  }

  // Load legendary planet images if not cached
  if (!legendaryImageCache) {
    legendaryImageCache = {} as Record<string, CachedImage>;
    for (const [systemId, config] of Object.entries(LEGENDARY_IMAGE_PATHS)) {
      const imagePath = path.join(process.cwd(), "public", config.path);
      try {
        legendaryImageCache[systemId] =
          (await loadImage(imagePath)) as unknown as CachedImage;
      } catch (error) {
        console.error(
          `Failed to load legendary image for system ${systemId}:`,
          error,
        );
      }
    }
  }

  // Load legendary icon if not cached
  if (!legendaryIconCache) {
    const legendaryIconPath = path.join(
      process.cwd(),
      "public",
      "legendary.webp",
    );
    try {
      legendaryIconCache =
        (await loadImage(legendaryIconPath)) as unknown as CachedImage;
    } catch (error) {
      console.error("Failed to load legendary icon:", error);
    }
  }

  // Load faction icons if not cached
  if (!factionIconCache) {
    factionIconCache = {} as Record<string, CachedImage>;
    for (const [factionId, factionData] of Object.entries(factions)) {
      const iconPath = path.join(process.cwd(), "public", factionData.iconPath);
      try {
        factionIconCache[factionId] =
          (await loadImage(iconPath)) as unknown as CachedImage;
      } catch (error) {
        console.error(`Failed to load faction icon ${factionId}:`, error);
      }
    }
  }

  // Load background tile if not cached
  if (!backgroundTileCache) {
    const bgTilePath = path.join(process.cwd(), "public", "tilebg.jpg");
    try {
      backgroundTileCache =
        (await loadImage(bgTilePath)) as unknown as CachedImage;
    } catch (error) {
      console.error("Failed to load background tile:", error);
    }
  }

  // Load logo if not cached
  if (!logoCache) {
    const logoPath = path.join(process.cwd(), "public", "logo.webp");
    try {
      logoCache = (await loadImage(logoPath)) as unknown as CachedImage;
    } catch (error) {
      console.error("Failed to load logo:", error);
    }
  }

  // Load trade station image if not cached
  if (!tradeStationCache) {
    const tradeStationPath = path.join(
      process.cwd(),
      "public",
      "tradestation.png",
    );
    try {
      tradeStationCache =
        (await loadImage(tradeStationPath)) as unknown as CachedImage;
    } catch (error) {
      console.error("Failed to load trade station image:", error);
    }
  }
}

// Export cache getters
export function getTechIconCache() {
  return techIconCache;
}

export function getAnomalyImageCache() {
  return anomalyImageCache;
}

export function getLegendaryImageCache() {
  return legendaryImageCache;
}

export function getLegendaryIconCache() {
  return legendaryIconCache;
}

export function getFactionIconCache() {
  return factionIconCache;
}

export function getBackgroundTileCache() {
  return backgroundTileCache;
}

export function getLogoCache() {
  return logoCache;
}

export function getTradeStationCache() {
  return tradeStationCache;
}
