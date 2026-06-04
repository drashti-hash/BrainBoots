import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { games } from "../data/gameCatalog";
import { useGameRoom } from "../websocket/useGameRoom";

// Utility to read JSON from localStorage
const readStoredJson = (key, fallback) => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

// Generates a hash-based color code from a username for avatar backgrounds (emerald/slate focused)
const getAvatarColorClass = (username) => {
    const colors = [
        "bg-emerald-500", "bg-teal-500", "bg-emerald-600", "bg-slate-400",
        "bg-zinc-505", "bg-zinc-500", "bg-teal-600"
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

// ----------------------------------------------------------------------
// 1. Multiplayer Setup View (Lobby Creation or Joining)
// ----------------------------------------------------------------------
function MultiplayerSetup() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("create"); // "create" or "join"
    const [roomInput, setRoomInput] = useState("");
    const [roomInputError, setRoomInputError] = useState("");

    const handleJoinRoomSubmit = (e) => {
        e.preventDefault();
        const code = roomInput.trim().toUpperCase();
        if (!code) {
            setRoomInputError("Enter room code.");
            return;
        }
        if (code.length < 4 || code.length > 8) {
            setRoomInputError("Invalid room code.");
            return;
        }
        setRoomInputError("");
        navigate(`/multiplayer/${code}`);
    };

    const handleCreateRoom = () => {
        const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let generatedCode = "";
        for (let i = 0; i < 6; i++) {
            generatedCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        navigate(`/multiplayer/${generatedCode}`);
    };

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
            <header className="text-center mb-8 max-w-md">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors mb-3 gap-1"
                >
                    ← Back to Dashboard
                </Link>
                <h1 className="text-3xl font-black tracking-tight">
                    Multiplayer Arena
                </h1>
            </header>

            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {/* Tab buttons */}
                <div className="flex border-b border-slate-200 mb-6">
                    <button
                        type="button"
                        onClick={() => { setActiveTab("create"); setRoomInputError(""); }}
                        className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                            activeTab === "create"
                                ? "border-emerald-600 text-emerald-700"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        Create Lobby
                    </button>
                    <button
                        type="button"
                        onClick={() => { setActiveTab("join"); setRoomInputError(""); }}
                        className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                            activeTab === "join"
                                ? "border-emerald-600 text-emerald-700"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        Join Arena
                    </button>
                </div>

                {activeTab === "create" ? (
                    <div>
                        <button
                            type="button"
                            onClick={handleCreateRoom}
                            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                        >
                            Create New Arena
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleJoinRoomSubmit}>
                        <input
                            type="text"
                            placeholder="Room Code"
                            value={roomInput}
                            onChange={(e) => setRoomInput(e.target.value)}
                            maxLength={8}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs font-mono uppercase tracking-wider focus:border-emerald-500 focus:outline-none"
                        />
                        {roomInputError && (
                            <p className="mt-2 text-xs font-semibold text-amber-600">
                                {roomInputError}
                            </p>
                        )}
                        <button
                            type="submit"
                            className="mt-4 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
                        >
                            Join Arena
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}

// ----------------------------------------------------------------------
// 2. Multiplayer Arena View (Connected Room & Active Matches)
// ----------------------------------------------------------------------
function MultiplayerArena({ roomCode, username }) {
    const navigate = useNavigate();

    // Call room hook unconditionally
    const roomState = useGameRoom(roomCode, username);

    const [chatInput, setChatInput] = useState("");
    const [selectedGameId, setSelectedGameId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const chatEndRef = useRef(null);
    const gameContainerRef = useRef(null);

    const [matchStartCountdown, setMatchStartCountdown] = useState(3);
    const [timeLeft, setTimeLeft] = useState(30);
    const [currentLiveScore, setCurrentLiveScore] = useState(0);

    // Synchronized starting countdown and match timer
    useEffect(() => {
        if (gameplayStatus !== "playing") {
            setMatchStartCountdown(3);
            return;
        }

        setMatchStartCountdown(3);
        setTimeLeft(30);
        setCurrentLiveScore(0);

        let startTimer;
        let playInterval;

        startTimer = setInterval(() => {
            setMatchStartCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(startTimer);
                    
                    // Dispatch game start event
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("brainboots:start-game"));
                    }, 0);

                    // Start match timer
                    playInterval = setInterval(() => {
                        setTimeLeft((tPrev) => {
                            if (tPrev <= 1) {
                                clearInterval(playInterval);
                                return 0;
                            }
                            return tPrev - 1;
                        });
                    }, 1000);

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(startTimer);
            clearInterval(playInterval);
        };
    }, [gameplayStatus]);

    // Handle countdown complete (Time's Up)
    useEffect(() => {
        if (roomState.activeGame.status === "playing" && timeLeft === 0) {
            console.log(`Time is up! Submitting final live score: ${currentLiveScore}`);
            roomState.submitFinalScore(currentLiveScore);
        }
    }, [timeLeft, roomState.activeGame.status, currentLiveScore, roomState]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [roomState.chatMessages]);

    // Capture score submission from game completions (if they complete early)
    useEffect(() => {
        if (roomState.activeGame.status !== "playing") return;

        const handleGameResult = (event) => {
            const finalScore = event.detail?.score || 0;
            console.log(`Captured early score: ${finalScore}. Submitting...`);
            setCurrentLiveScore(finalScore);
            roomState.submitFinalScore(finalScore);
        };

        window.addEventListener("brainboots:game-result", handleGameResult);
        return () => {
            window.removeEventListener("brainboots:game-result", handleGameResult);
        };
    }, [roomState.activeGame.status, roomState]);

    // Configure multiplayer global hook overrides for the active game instance
    useEffect(() => {
        if (roomState.activeGame.status === "playing") {
            window.brainbootsIsMultiplayer = true;
            window.brainbootsScoreUpdate = (score) => {
                const numericScore = Number(score) || 0;
                setCurrentLiveScore(numericScore);
                roomState.updateLiveScore(numericScore);
            };
        } else {
            window.brainbootsIsMultiplayer = false;
            window.brainbootsScoreUpdate = undefined;
        }

        return () => {
            window.brainbootsIsMultiplayer = false;
            window.brainbootsScoreUpdate = undefined;
        };
    }, [roomState.activeGame.status, roomState]);

    // Handle copying room code
    const [copied, setCopied] = useState(false);
    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Chat form submit
    const handleSendChatMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        roomState.sendMessage(chatInput.trim());
        setChatInput("");
    };

    // Selected game
    const activeSelectedGame = useMemo(() => {
        if (!selectedGameId) return null;
        return games.find((g) => g.id === selectedGameId);
    }, [selectedGameId]);

    // Filtered games
    const filteredGames = useMemo(() => {
        if (!searchQuery.trim()) return games;
        return games.filter((g) =>
            g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.desc.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    // CSS Confetti generator for results screen (emerald/mint and slate tones)
    const confettiParticles = useMemo(() => {
        const particles = [];
        const colors = ["#10b981", "#34d399", "#059669", "#6ee7b7", "#94a3b8", "#cbd5e1"];
        for (let i = 0; i < 60; i++) {
            particles.push({
                id: i,
                left: Math.random() * 100,
                delay: Math.random() * 5,
                duration: Math.random() * 3 + 2.5,
                size: Math.random() * 8 + 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: Math.random() > 0.5 ? "rounded-full" : "rotate-45"
            });
        }
        return particles;
    }, [roomState.roomResults]);

    const {
        connectionStatus,
        players,
        activeGame,
        gameplayStatus,
        roomResults,
        chatMessages,
        isHost,
        sendMessage,
        startGame,
        startGameplay,
        updateLiveScore,
        submitFinalScore,
        clearRoomResults,
        addBot,
        removeBot
    } = roomState;

    const myPlayerRecord = players.find((p) => p.username === username);
    const hasFinishedActiveGame = myPlayerRecord?.status === "finished";

    // RENDER: Connecting View
    if (connectionStatus === "CONNECTING") {
        return (
            <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 font-sans">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin" />
                    <p className="text-xs font-bold text-slate-700">Connecting...</p>
                </div>
            </main>
        );
    }

    // RENDER: Disconnected View
    if (connectionStatus === "DISCONNECTED") {
        return (
            <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 font-sans">
                <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                    <h2 className="text-base font-bold text-slate-900">Disconnected</h2>
                    <div className="mt-6 flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white transition cursor-pointer shadow-sm"
                        >
                            Reconnect
                        </button>
                        <Link
                            to="/dashboard"
                            className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold text-slate-700 transition text-center"
                        >
                            Exit
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // RENDER: Podium / Results Screen
    if (roomResults) {
        const sortedResults = [...roomResults].sort((a, b) => b.score - a.score);
        const podium1st = sortedResults[0];

        return (
            <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    {confettiParticles.map((p) => (
                        <div
                            key={p.id}
                            className={`absolute ${p.shape} animate-confetti-particle`}
                            style={{
                                left: `${p.left}%`,
                                backgroundColor: p.color,
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                                top: `-20px`,
                                animationDelay: `${p.delay}s`,
                                animationDuration: `${p.duration}s`,
                                opacity: 0.8
                            }}
                        />
                    ))}
                </div>

                <div className="w-full max-w-xl z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Match Results
                        </h1>
                    </div>

                    {/* Featured Winner Spotlight Card */}
                    {podium1st && (
                        <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm mb-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-2xl mb-3 border border-emerald-100">👑</span>
                            <h2 className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Winner</h2>
                            <p className="mt-2 text-xl font-black text-slate-900">{podium1st.username}</p>
                            <p className="mt-1 text-sm font-bold text-emerald-700 font-mono">Score: {podium1st.score}</p>
                        </div>
                    )}

                    {/* Detailed scoreboard list */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                            Scoreboard
                        </h2>
                        <div className="divide-y divide-slate-100">
                            {sortedResults.map((player, idx) => (
                                <div key={player.username} className="py-3 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3">
                                        <span className="w-4 text-center font-bold text-slate-500">
                                            #{idx + 1}
                                        </span>
                                        <div className={`w-7 h-7 rounded-full ${getAvatarColorClass(player.username)} flex items-center justify-center text-white font-bold text-[10px]`}>
                                            {player.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className={`font-semibold ${player.username === username ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}>
                                            {player.username} {player.username === username && "(You)"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-bold text-slate-900 text-sm">{player.score}</span>
                                        {player.is_winner && <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100">WINNER</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={clearRoomResults}
                                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white transition cursor-pointer shadow-sm"
                            >
                                Return to Lobby
                            </button>
                            <Link
                                to="/dashboard"
                                className="flex-1 inline-flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold text-slate-700 transition"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes confetti-fall {
                        0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                        100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
                    }
                    .animate-confetti-particle {
                        animation: confetti-fall linear infinite;
                    }
                    @keyframes pulse-zoom {
                        0% { transform: scale(0.3); opacity: 0; }
                        50% { transform: scale(1.2); opacity: 0.9; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .animate-ping-once {
                        animation: pulse-zoom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                    }
                `}</style>
            </main>
        );
    }

    // RENDER: In-Game Active play container
    if (activeGame.status === "playing") {
        const gameCatalogRecord = games.find((g) => g.id === activeGame.gameId);
        const ActiveGameComponent = gameCatalogRecord?.component;

        return (
            <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
                {/* Horizontal HUD Leaderboard */}
                <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-2">
                        Leaderboard:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        {players.map((p) => {
                            const isSelf = p.username === username;
                            const finished = p.status === "finished";
                            return (
                                <div
                                    key={p.username}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-medium transition-all ${
                                        finished
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                            : isSelf
                                                ? "border-slate-300 bg-slate-100 text-slate-955 font-bold animate-pulse"
                                                : "border-slate-200 bg-white text-slate-600"
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded-full ${getAvatarColorClass(p.username)} flex items-center justify-center text-white font-bold text-[8px]`}>
                                        {p.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span>
                                        {p.username} {isSelf && "(You)"}: <span className="font-mono font-bold">{p.score}</span>
                                    </span>
                                    {finished && (
                                        <span className="inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Game Area taking full width */}
                <div className="flex-1 flex flex-col p-4 md:p-6">
                    <header className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-slate-900">
                                {activeGame.gameName}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 font-mono tracking-wider uppercase">LIVE ARENA MATCH</span>
                            </div>
                        </div>

                        {/* Synchronized 30-Second Timer HUD */}
                        <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-2 shadow-sm">
                            <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider">Time Left:</span>
                            <span className={`text-xl font-black font-mono transition-colors ${timeLeft <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                                {timeLeft}s
                            </span>
                            <div className="w-24 h-2 bg-rose-100 rounded-full overflow-hidden hidden sm:block">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-rose-600' : 'bg-rose-500'}`}
                                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                                />
                            </div>
                        </div>
                    </header>

                    {/* Rendering the active game */}
                    <div ref={gameContainerRef} className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-slate-200 p-6 min-h-[55vh] relative overflow-hidden shadow-sm">
                        {timeLeft === 0 || hasFinishedActiveGame ? (
                            <div className="text-center max-w-sm p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                                <div className="text-3xl mb-3">🏁</div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {timeLeft === 0 ? "Time's Up!" : "Completed"}
                                </h3>
                                <div className="mt-2 text-xs font-semibold text-slate-500">
                                    Your Score: <span className="text-emerald-700 font-black font-mono text-sm">{timeLeft === 0 ? currentLiveScore : myPlayerRecord?.score}</span>
                                </div>
                            </div>
                        ) : ActiveGameComponent ? (
                            <div className="w-full flex justify-center">
                                <ActiveGameComponent />
                            </div>
                        ) : (
                            <div className="text-slate-500 font-bold text-xs">Game not found.</div>
                        )}

                        {/* Gameplay Ready Overlay (Lobby Launch state) */}
                        {gameplayStatus === "ready" && (
                            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white p-6 text-center">
                                <span className="text-5xl mb-4 animate-bounce">🎮</span>
                                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Match Prepared</p>
                                <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-white">
                                    {activeGame.gameName}
                                </h2>
                                
                                {isHost ? (
                                    <div className="flex flex-col items-center space-y-4">
                                        <button
                                            type="button"
                                            onClick={startGameplay}
                                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] text-sm cursor-pointer hover:scale-105 transform active:scale-95"
                                        >
                                            🚀 START MATCH FOR ALL
                                        </button>
                                        <p className="text-[10px] text-slate-400 max-w-xs font-semibold">
                                            As the Host/Admin, you control when the match begins. Starting it will sync both players.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="w-8 h-8 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin" />
                                        <p className="text-xs text-slate-300 font-bold tracking-wide animate-pulse">
                                            Waiting for Host to start the match...
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Starting countdown overlay */}
                        {gameplayStatus === "playing" && matchStartCountdown > 0 && (
                            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white">
                                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Prepare Yourself</p>
                                <h2 className="text-lg font-black tracking-wider mb-6">MATCH STARTING IN</h2>
                                <div key={matchStartCountdown} className="text-8xl font-black text-emerald-500 animate-ping-once">
                                    {matchStartCountdown}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        );
    }

    // RENDER: Active Lobby / Waiting Room View
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            {/* Top Header Navigation */}
            <header className="border-b border-slate-200 bg-white sticky top-0 z-30 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        to="/dashboard"
                        className="rounded-lg bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition"
                    >
                        ← Dashboard
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-md font-bold text-slate-900">Multiplayer</h1>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${connectionStatus === 'CONNECTED' ? 'animate-pulse' : ''}`} />
                                Connected
                            </span>
                        </div>
                    </div>
                </div>

                {/* Room Code Display */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                    <span className="text-xs text-slate-500 font-bold uppercase">Code:</span>
                    <span className="text-xs font-mono font-black text-emerald-700 uppercase tracking-widest">{roomCode}</span>
                    <button
                        type="button"
                        onClick={handleCopyCode}
                        className="ml-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-700 transition"
                    >
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>
            </header>

            {/* Main Interactive 2-Column Split Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 relative">
                
                {/* Left Area (8 cols): Players & Game Catalog */}
                <section className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-slate-200 p-6 flex flex-col bg-slate-50/50 justify-between overflow-y-auto">
                    <div>
                        {/* Players Row Panel */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Players ({players.length})
                                </h2>
                                {isHost && (
                                    <div className="flex gap-1.5">
                                        <button
                                            type="button"
                                            onClick={addBot}
                                            className="text-[9px] font-bold px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 transition cursor-pointer animate-pulse"
                                        >
                                            + Add Bot
                                        </button>
                                        <button
                                            type="button"
                                            onClick={removeBot}
                                            className="text-[9px] font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg border border-slate-200 transition cursor-pointer"
                                        >
                                            - Kick Bot
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {players.map((p) => {
                                    const isSelf = p.username === username;
                                    return (
                                        <div
                                            key={p.username}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm"
                                        >
                                            <div className={`w-5 h-5 rounded-full ${getAvatarColorClass(p.username)} flex items-center justify-center text-white font-bold text-[9px]`}>
                                                {p.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className={`text-xs font-semibold ${isSelf ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}>
                                                {p.username} {isSelf && "(You)"}
                                            </span>
                                            {p.is_host && <span className="text-[10px]" title="Host">👑</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Game Selector Area */}
                        <div className="border-t border-slate-200 pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    {isHost ? "Select Game" : "Selected Game"}
                                </h2>
                                {isHost && (
                                    <input
                                        type="text"
                                        placeholder="Search games..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs placeholder-slate-400 focus:border-emerald-500 focus:outline-none shadow-sm w-full sm:w-48"
                                    />
                                )}
                            </div>

                            {/* Grid list of catalog games - compact with no descriptions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {filteredGames.map((game) => {
                                    const isSelected = selectedGameId === game.id;
                                    return (
                                        <button
                                            key={game.id}
                                            type="button"
                                            disabled={!isHost}
                                            onClick={() => setSelectedGameId(game.id)}
                                            className={`p-4 rounded-xl border text-left flex flex-col justify-between h-20 transition-all ${
                                                !isHost ? "cursor-default" : "cursor-pointer"
                                            } ${
                                                isSelected
                                                    ? "border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500"
                                                    : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                                            }`}
                                        >
                                            <div className="w-full">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                        {game.icon}
                                                    </span>
                                                    <h4 className="text-xs font-bold text-slate-800 truncate">{game.name}</h4>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right Area (4 cols): Lobby Chat & Action Launcher */}
                <section className="lg:col-span-4 p-6 flex flex-col justify-between bg-white overflow-y-auto">
                    <div className="flex flex-col flex-1 min-h-0">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                            Lobby Chat
                        </h2>

                        {/* Messages container */}
                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4 h-[280px] border border-slate-200 rounded-xl bg-slate-50/50 p-3 shadow-inner">
                            {chatMessages.length === 0 ? (
                                <p className="text-slate-400 text-xs italic text-center mt-4">
                                    Chat active.
                                </p>
                            ) : (
                                chatMessages.map((msg, idx) => {
                                    if (msg.isSystem) {
                                        return (
                                            <div key={idx} className="text-center">
                                                <span className="inline-block bg-slate-100 rounded px-2 py-0.5 text-[9px] text-slate-500 font-bold italic">
                                                    {msg.message}
                                                </span>
                                            </div>
                                        );
                                    }

                                    const isSelf = msg.username === username;
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                                        >
                                            <span className="text-[9px] text-slate-400 font-bold mb-0.5">
                                                {msg.username}
                                            </span>
                                            <div
                                                className={`rounded-xl px-3 py-1.5 text-xs max-w-[85%] shadow-sm ${
                                                    isSelf
                                                        ? "bg-emerald-600 text-white rounded-tr-none"
                                                        : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                                                }`}
                                            >
                                                <p className="break-all font-medium">{msg.message}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>
                    </div>

                    {/* Chat Input & Launch Action panel */}
                    <div className="space-y-4">
                        {/* Chat sending form */}
                        <form onSubmit={handleSendChatMessage} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Send message..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                maxLength={150}
                                className="flex-1 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs placeholder-slate-400 focus:border-emerald-500 focus:outline-none shadow-sm"
                            />
                            <button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
                            >
                                Send
                            </button>
                        </form>

                        {/* Match launcher action bar */}
                        <div className="border-t border-slate-200 pt-4">
                            {isHost ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Game Selected:</p>
                                        <p className="text-xs font-bold text-slate-800 truncate">
                                            {activeSelectedGame ? activeSelectedGame.name : "None"}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!selectedGameId}
                                        onClick={() => startGame(activeSelectedGame.id, activeSelectedGame.name)}
                                        className={`rounded-xl px-4 py-3 text-xs font-bold transition-all shadow-sm ${
                                            selectedGameId
                                                ? "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                                        }`}
                                    >
                                        Launch Match
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center p-3 bg-emerald-50/20 border border-emerald-100 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-xs text-emerald-750 font-bold">
                                            Waiting for Host...
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

            </div>
        </main>
    );
}

// ----------------------------------------------------------------------
// 3. Main Wrapper Component (Resolves URL Routing & Credentials)
// ----------------------------------------------------------------------
export default function Multiplayer() {
    const { roomCode } = useParams();
    
    // Retrieve authenticated user
    const user = readStoredJson("user", {});
    const username = user.username || user.email || "Player";

    if (!roomCode) {
        return <MultiplayerSetup />;
    }

    return <MultiplayerArena roomCode={roomCode} username={username} />;
}
