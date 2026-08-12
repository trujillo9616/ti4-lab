import { useCallback, useEffect, useRef, useState } from "react";

export function useArrowFocus<T>(
  data: T[],
  onSelectItem: (idx: number) => void,
) {
  const [selectedIdx, selectIdx] = useState(0);
  const itemRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (itemRefs.current[selectedIdx]) itemRefs.current[selectedIdx].focus();
  }, [selectedIdx]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          selectIdx((prevIndex) => (prevIndex > -1 ? prevIndex - 1 : prevIndex));
          break;
        case "ArrowDown":
          selectIdx((prevIndex) =>
            prevIndex < data.length - 1 ? prevIndex + 1 : prevIndex,
          );
          break;
        case "Enter":
          if (selectedIdx > -1) onSelectItem(selectedIdx);
          break;
        default:
          break;
      }
    },
    [data.length, onSelectItem, selectedIdx],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const resetFocus = () => {
    selectIdx(0);
    if (itemRefs.current[0]) itemRefs.current[0].focus();
  };

  return {
    itemRefs,
    selectedIdx,
    resetFocus,
  };
}
