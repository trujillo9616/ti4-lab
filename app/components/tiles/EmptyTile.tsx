import { Hex } from "../Hex";
import { OpenTile } from "~/types";
import { useContext, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { MapContext } from "~/contexts/MapContext";

import classes from "./Tiles.module.css";

type Props = {
  mapId: string;
  tile: OpenTile;
  modifiable?: boolean;
  droppable?: boolean;
  ringHighlight?: boolean;
  isOver?: boolean;
  hoverEffects?: boolean;
  onSelect?: () => void;
};

export function EmptyTile({
  mapId,
  modifiable = false,
  droppable = false,
  ringHighlight = false,
  isOver = false,
  hoverEffects = true,
  onSelect,
}: Props) {
  const { radius } = useContext(MapContext);

  const handleKeyUp = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!onSelect || event.currentTarget !== event.target) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  const droppableClass = droppable
    ? hoverEffects
      ? classes.droppable
      : classes.droppableStatic
    : "";
  const ringHighlightClass =
    ringHighlight && !droppable
      ? hoverEffects
        ? classes.ringHighlight
        : classes.ringHighlightStatic
      : "";

  const colorClasses = [
    classes.empty,
    modifiable ? classes.modifiable : "",
    droppableClass,
    ringHighlightClass,
    isOver ? classes.droppableHover : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      onClick={onSelect}
      onKeyUp={handleKeyUp}
      role={onSelect ? "button" : undefined}
      style={{ cursor: onSelect ? "pointer" : undefined }}
      tabIndex={onSelect ? 0 : undefined}
    >
      <Hex
        id={`${mapId}-empty`}
        radius={radius}
        colorClass={colorClasses}
        showBorder={!modifiable}
        borderClass={droppable ? classes.droppableBorder : undefined}
      />
    </div>
  );
}
