import { useEffect } from "react";
import {
  playNotificationSound,
  requestNotificationPermission,
  showNotification,
} from "~/utils/notifications";
import { useHydratedDraft } from "./useHydratedDraft";
import { useDraft } from "~/draftStore";

export function useNotifyActivePlayer() {
  const { activePlayer } = useHydratedDraft();
  const activePlayerId = activePlayer?.id;
  const selectedPlayer = useDraft((state) => state.selectedPlayer);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (activePlayerId === undefined || selectedPlayer === undefined) return;
    if (activePlayerId !== selectedPlayer) return;

    showNotification("It's your turn to draft!", {
      icon: "/icon.png",
      badge: "/badge.png",
    });
    playNotificationSound();
  }, [activePlayerId, selectedPlayer]);
}
