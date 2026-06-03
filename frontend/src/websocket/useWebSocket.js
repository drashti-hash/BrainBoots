import { useEffect, useState, useCallback } from "react";
import webSocketService from "./websocketService";

/**
 * A React hook that provides access to the shared WebSocketService connection state
 * and action emitters/listeners.
 */
export function useWebSocket() {
    const [status, setStatus] = useState(() => webSocketService.getStatus());

    useEffect(() => {
        const handleStatusChange = (newStatus) => {
            setStatus(newStatus);
        };

        // Subscribe to WebSocket status changes
        webSocketService.onStatusChange(handleStatusChange);

        return () => {
            // Cleanup on unmount
            webSocketService.offStatusChange(handleStatusChange);
        };
    }, []);

    const connect = useCallback((roomCode, username) => {
        webSocketService.connect(roomCode, username);
    }, []);

    const send = useCallback((event, data) => {
        return webSocketService.send(event, data);
    }, []);

    const close = useCallback(() => {
        webSocketService.close();
    }, []);

    const on = useCallback((event, callback) => {
        webSocketService.on(event, callback);
    }, []);

    const off = useCallback((event, callback) => {
        webSocketService.off(event, callback);
    }, []);

    return {
        status,
        connect,
        send,
        close,
        on,
        off,
    };
}
export default useWebSocket;
