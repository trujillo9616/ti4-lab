import { useEffect, useRef, useState } from "react";
import { useSocket } from "./socketContext";

type Props = {
  onConnect?: () => void;
};

export function useSocketConnection({ onConnect }: Props) {
  const socket = useSocket();
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const onConnectRef = useRef(onConnect);

  useEffect(() => {
    onConnectRef.current = onConnect;
  }, [onConnect]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      onConnectRef.current?.();
      setIsDisconnected(false);
    };
    const handleDisconnect = () => {
      setIsDisconnected(true);
    };
    const handleReconnecting = () => {
      setIsReconnecting(true);
    };
    const handleReconnectFailed = () => {
      setIsReconnecting(false);
    };

    // join draft on every connect
    // this way if there's a disconnection, a reconnection will rejoin the draft
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("reconnecting", handleReconnecting);
    socket.on("reconnect_failed", handleReconnectFailed);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnecting", handleReconnecting);
      socket.off("reconnect_failed", handleReconnectFailed);
    };
  }, [socket]);

  const reconnect = () => {
    setIsReconnecting(true);
    socket?.disconnect();
    socket?.connect();
  };

  return { socket, isDisconnected, isReconnecting, reconnect };
}
