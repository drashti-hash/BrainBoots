import { useEffect, useState, useCallback, useRef } from "react";
import useWebSocket from "./useWebSocket";

/**
 * A stateful hook that handles the complete lifecycle of a multiplayer game room,
 * including player lists, chat messaging, starting games, and syncing live score status.
 */
export function useGameRoom(roomCode, username) {
    const { status, connect, send, close, on, off } = useWebSocket();
    const [players, setPlayers] = useState([]);
    const [activeGame, setActiveGame] = useState({ gameId: null, gameName: null, status: "waiting" });
    const [roomResults, setRoomResults] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const currentUsernameRef = useRef(username);

    useEffect(() => {
        currentUsernameRef.current = username;
    }, [username]);

    useEffect(() => {
        if (!roomCode || !username) return;

        // Establish the socket connection
        connect(roomCode, username);

        // --- WebSocket Event Handlers ---

        const handlePlayerJoined = (data) => {
            setPlayers(data.players);
            setChatMessages((prev) => [
                ...prev,
                {
                    username: "System",
                    message: `${data.username} has joined the lobby.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isSystem: true
                }
            ]);
            if (data.room_status) {
                setActiveGame((prev) => ({
                    ...prev,
                    status: data.room_status
                }));
            }
        };

        const handlePlayerLeft = (data) => {
            setPlayers(data.players);
            setChatMessages((prev) => [
                ...prev,
                {
                    username: "System",
                    message: `${data.username} has left the lobby.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isSystem: true
                }
            ]);
        };

        const handleChatBroadcast = (data) => {
            setChatMessages((prev) => [
                ...prev,
                {
                    username: data.username,
                    message: data.message,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isSystem: false
                }
            ]);
        };

        const handleGameStarted = (data) => {
            setActiveGame({
                gameId: data.game_id,
                gameName: data.game_name,
                status: "playing"
            });
            setRoomResults(null);
            setPlayers(data.players);
            setChatMessages((prev) => [
                ...prev,
                {
                    username: "System",
                    message: `🏆 Competition started! Game: ${data.game_name}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isSystem: true
                }
            ]);
        };

        const handleScoreUpdated = (data) => {
            setPlayers((prevPlayers) =>
                prevPlayers.map((p) =>
                    p.username === data.username ? { ...p, score: data.score } : p
                )
            );
        };

        const handlePlayerFinished = (data) => {
            setPlayers(data.players);
            setChatMessages((prev) => [
                ...prev,
                {
                    username: "System",
                    message: `🏁 ${data.username} finished playing! Score: ${data.score}`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isSystem: true
                }
            ]);
        };

        const handleGameFinished = (data) => {
            setRoomResults(data.results);
            setActiveGame({
                gameId: null,
                gameName: null,
                status: "waiting"
            });
            setChatMessages((prev) => [
                ...prev,
                {
                    username: "System",
                    message: `🎮 Round finished. Check the podium results!`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isSystem: true
                }
            ]);
        };

        // Register handlers
        on("player_joined", handlePlayerJoined);
        on("player_left", handlePlayerLeft);
        on("chat_message", handleChatBroadcast);
        on("game_started", handleGameStarted);
        on("score_updated", handleScoreUpdated);
        on("player_finished", handlePlayerFinished);
        on("game_finished", handleGameFinished);

        return () => {
            // Cleanup: remove listeners and close connection on component unmount
            off("player_joined", handlePlayerJoined);
            off("player_left", handlePlayerLeft);
            off("chat_message", handleChatBroadcast);
            off("game_started", handleGameStarted);
            off("score_updated", handleScoreUpdated);
            off("player_finished", handlePlayerFinished);
            off("game_finished", handleGameFinished);
            close();
        };
    }, [roomCode, username, connect, on, off, close]);

    // --- Action Emitters ---

    const sendMessage = useCallback((message) => {
        send("chat_message", { message });
    }, [send]);

    const startGame = useCallback((gameId, gameName) => {
        send("start_game", { game_id: gameId, game_name: gameName });
    }, [send]);

    const updateLiveScore = useCallback((score) => {
        send("score_update", { score });
    }, [send]);

    const submitFinalScore = useCallback((score) => {
        send("submit_score", { score });
    }, [send]);

    const playerRecord = players.find(p => p.username === username);
    const isHost = playerRecord?.is_host || false;

    const clearRoomResults = useCallback(() => {
        setRoomResults(null);
    }, []);

    const addBot = useCallback(() => {
        send("add_bot");
    }, [send]);

    const removeBot = useCallback(() => {
        send("remove_bot");
    }, [send]);

    return {
        connectionStatus: status,
        players,
        activeGame,
        roomResults,
        chatMessages,
        isHost,
        sendMessage,
        startGame,
        updateLiveScore,
        submitFinalScore,
        clearRoomResults,
        addBot,
        removeBot
    };
}
export default useGameRoom;
