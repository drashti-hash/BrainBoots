/**
 * Production-level WebSocket Service to manage live socket connection,
 * auto-reconnections, event subscribers, and cleanups.
 */
class WebSocketService {
    constructor() {
        this.ws = null;
        this.listeners = {};
        this.roomCode = null;
        this.username = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 25; // Try reconnecting for ~5.5 minutes
        this.reconnectDelay = 2000; // Start with 2 seconds
        this.isIntentionalClose = false;
        this.connectionStatusCallbacks = [];
    }

    /**
     * Subscribe to connection status changes (CONNECTING, CONNECTED, CLOSING, DISCONNECTED)
     */
    onStatusChange(callback) {
        this.connectionStatusCallbacks.push(callback);
        // Call immediately with the current status
        callback(this.getStatus());
    }

    /**
     * Unsubscribe from status changes
     */
    offStatusChange(callback) {
        this.connectionStatusCallbacks = this.connectionStatusCallbacks.filter(cb => cb !== callback);
    }

    /**
     * Notify all status subscribers of a change
     */
    notifyStatusChange() {
        const status = this.getStatus();
        this.connectionStatusCallbacks.forEach(cb => cb(status));
    }

    /**
     * Get the current text state of the WebSocket
     */
    getStatus() {
        if (!this.ws) return "DISCONNECTED";
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return "CONNECTING";
            case WebSocket.OPEN:
                return "CONNECTED";
            case WebSocket.CLOSING:
                return "CLOSING";
            case WebSocket.CLOSED:
            default:
                return "DISCONNECTED";
        }
    }

    /**
     * Initialize connection to the ASGI server
     */
    connect(roomCode, username) {
        const incomingRoomCode = roomCode.toUpperCase();

        // Close existing connection if switching to a different room
        if (this.ws && this.roomCode !== incomingRoomCode) {
            console.log(`Room code changed from ${this.roomCode} to ${incomingRoomCode}. Closing old connection.`);
            this.close();
        }

        // Avoid opening duplicate connections if already connected
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            console.log("WebSocket is already active. ReadyState:", this.ws.readyState);
            return;
        }

        this.roomCode = incomingRoomCode;
        this.username = username;
        this.isIntentionalClose = false;

        const baseWsUrl = import.meta.env.VITE_WS_BASE_URL || "ws://127.0.0.1:8000";
        const url = `${baseWsUrl}/ws/multiplayer/${this.roomCode}/`;

        console.log(`Connecting to WebSocket: ${url}`);
        this.notifyStatusChange();

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log("WebSocket connection established.");
                this.reconnectAttempts = 0;
                this.notifyStatusChange();
                // Send join_room payload automatically on open
                this.send("join_room", { username: this.username });
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const eventName = data.event;
                    if (eventName && this.listeners[eventName]) {
                        this.listeners[eventName].forEach((callback) => callback(data));
                    }
                } catch (err) {
                    console.error("Error parsing incoming WebSocket message:", err);
                }
            };

            this.ws.onclose = (event) => {
                console.log("WebSocket connection closed:", event);
                this.notifyStatusChange();
                if (!this.isIntentionalClose) {
                    this.attemptReconnect();
                }
            };

            this.ws.onerror = (err) => {
                console.error("WebSocket error:", err);
                this.notifyStatusChange();
            };
        } catch (error) {
            console.error("Failed to construct WebSocket:", error);
            this.notifyStatusChange();
            this.attemptReconnect();
        }
    }

    /**
     * Reconnection retry logic with exponential backoff capped at 15s
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn("Max WebSocket reconnect attempts reached. Stopping reconnects.");
            return;
        }

        this.reconnectAttempts++;
        // Capping backoff delay at 15 seconds (15000ms)
        const delay = Math.min(15000, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
        console.log(`Attempting reconnect in ${delay}ms (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            if (!this.isIntentionalClose) {
                this.connect(this.roomCode, this.username);
            }
        }, delay);
    }

    /**
     * Send structured JSON packet to the ASGI backend
     */
    send(event, data = {}) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn("Cannot send message. WebSocket is not open. State:", this.ws ? this.ws.readyState : "null");
            return false;
        }
        this.ws.send(JSON.stringify({ event, ...data }));
        return true;
    }

    /**
     * Listen to a specific WebSocket event
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Stop listening to a specific WebSocket event
     */
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }

    /**
     * Terminate connection intentionally
     */
    close() {
        this.isIntentionalClose = true;
        if (this.ws) {
            // Nullify event handlers of the old socket to prevent callbacks firing after close
            this.ws.onopen = null;
            this.ws.onmessage = null;
            this.ws.onclose = null;
            this.ws.onerror = null;
            this.ws.close();
            this.ws = null;
        }
        this.notifyStatusChange();
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
