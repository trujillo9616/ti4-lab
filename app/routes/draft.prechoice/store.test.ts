import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@mantine/notifications", () => ({
  notifications: { show: vi.fn() },
}));

import { MAPS } from "./maps";
import { useDraftSetup } from "./store";

const makePlayers = (count: number) =>
  Array.from({ length: count }, (_, id) => ({ id, name: "" }));

describe("draft prechoice 3-player setup", () => {
  beforeEach(() => {
    useDraftSetup.setState(useDraftSetup.getInitialState(), true);
  });

  test("catalog exposes the six 3-player map options", () => {
    const threePlayerMaps = Object.entries(MAPS)
      .filter(([, map]) => map.playerCount === 3)
      .map(([key]) => key);

    expect(threePlayerMaps).toEqual([
      "milty3p",
      "milty3phyperlane",
      "miltyeq3p",
      "miltyeq3phyperlane",
      "heisen3p",
      "heisen3phyperlane",
    ]);
  });

  test.each(["miltyeq3p", "miltyeq3phyperlane"] as const)(
    "%s preview highlights the full 4-system EQ speaker slice",
    (mapType) => {
      const speakerTiles = MAPS[mapType].map
        .filter((tile) => tile.type === "PLAYER_DEMO" && tile.playerNumber === 0)
        .map((tile) => tile.idx)
        .sort((a, b) => a - b);

      expect(speakerTiles).toEqual([1, 7, 19, 20, 36]);
      expect(MAPS[mapType].map.find((tile) => tile.idx === 1)?.type).toBe(
        "PLAYER_DEMO",
      );
    },
  );

  test.each(["heisen3p", "heisen3phyperlane"] as const)(
    "%s preview shows the live 3-system nucleus slice",
    (mapType) => {
      const speakerTiles = MAPS[mapType].map
        .filter((tile) => tile.type === "PLAYER_DEMO" && tile.playerNumber === 0)
        .map((tile) => tile.idx)
        .sort((a, b) => a - b);

      expect(speakerTiles).toEqual([7, 19, 20, 36]);
      expect(MAPS[mapType].map.find((tile) => tile.idx === 1)?.type).toBe("OPEN");
    },
  );

  test("switching to 3 players forces base mode", () => {
    const store = useDraftSetup.getState();

    store.setDraftMode("twilightFalls");
    store.player.setPlayers(makePlayers(3));

    const nextState = useDraftSetup.getState();
    expect(nextState.player.players).toHaveLength(3);
    expect(nextState.draftMode).toBe("base");
  });

  test("3-player setup rejects non-base mode changes", () => {
    const store = useDraftSetup.getState();

    store.player.setPlayers(makePlayers(3));
    store.setDraftMode("texasStyle");

    expect(useDraftSetup.getState().draftMode).toBe("base");
  });

  test("switching to 3 players falls back to the default 3-player map", () => {
    const store = useDraftSetup.getState();

    store.map.setSelectedMapType("miltyeq4p");
    store.player.setPlayers(makePlayers(3));

    const nextState = useDraftSetup.getState();
    expect(nextState.map.selectedMapType).toBe("milty3p");
    expect(MAPS[nextState.map.selectedMapType].playerCount).toBe(3);
  });
});