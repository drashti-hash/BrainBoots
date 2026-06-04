import { useState, useEffect, useRef, useMemo } from "react";
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

// Generates a hash-based color code from a username for avatar backgrounds (violet/indigo focused)
const getAvatarColorClass = (username) => {
    const colors = [
        "bg-violet-500", "bg-indigo-500", "bg-purple-500", "bg-fuchsia-500",
        "bg-blue-500", "bg-slate-500", "bg-violet-600", "bg-indigo-600"
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

// Game UI metadata mapping for mockup icons and labels
const GAME_UI_METADATA = {
    memory: {
        label: "MEMORY",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
        )
    },
    simon: {
        label: "SEQUENCE",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6.56M12 8v4l3 3" />
            </svg>
        )
    },
    numbers: {
        label: "NUMBERS",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
        )
    },
    nback: {
        label: "N-BACK",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        )
    },
    reaction: {
        label: "REFLEX",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        )
    },
    aim: {
        label: "AIM",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
            </svg>
        )
    },
    typing: {
        label: "TYPING",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
        )
    },
    speedmath: {
        label: "MATH",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        )
    },
    stroop: {
        label: "COLOR",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="8" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" />
            </svg>
        )
    },
    oddcolor: {
        label: "ODD",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                <rect x="7" y="7" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="2" />
                <rect x="13" y="7" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="2" />
                <rect x="7" y="13" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="2" />
                <rect x="13" y="13" width="4" height="4" rx="0.5" fill="currentColor" />
            </svg>
        )
    },
    focusgrid: {
        label: "GRID",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        )
    },
    schulte: {
        label: "SCAN",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        )
    },
    sudoku: {
        label: "SUDOKU",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4zM4 12h16M12 4v16" />
            </svg>
        )
    },
    wordguess: {
        label: "WORD",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        )
    },
    lightsout: {
        label: "LIGHTS",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        )
    },
    slidingtile: {
        label: "TILES",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4v16M15 4v16M4 9h16M4 15h16" />
            </svg>
        )
    },
    hanoi: {
        label: "HANOI",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 15h16M12 4v11m-4 0h8m-6-3h4m-3-3h2" />
            </svg>
        )
    }
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
                    className="inline-flex items-center text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors mb-3 gap-1"
                >
                    ← Back to Dashboard
                </Link>
                <h1 className="text-3xl font-black tracking-tight">
                    Multiplayer Arena
                </h1>
            </header>

            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                {/* Tab buttons */}
                <div className="flex border-b border-slate-200 mb-6">
                    <button
                        type="button"
                        onClick={() => { setActiveTab("create"); setRoomInputError(""); }}
                        className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                            activeTab === "create"
                                ? "border-violet-600 text-violet-700"
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
                                ? "border-violet-600 text-violet-700"
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
                            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 py-3.5 text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-violet-100"
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
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs font-mono uppercase tracking-wider focus:border-violet-500 focus:outline-none"
                        />
                        {roomInputError && (
                            <p className="mt-2 text-xs font-semibold text-rose-600">
                                {roomInputError}
                            </p>
                        )}
                        <button
                            type="submit"
                            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 py-3.5 text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-violet-100"
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
    // Call room hook unconditionally
    const roomState = useGameRoom(roomCode, username);

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

    const [chatInput, setChatInput] = useState("");
    const [selectedGameId, setSelectedGameId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const chatEndRef = useRef(null);
    const gameContainerRef = useRef(null);

    const [matchStartCountdown, setMatchStartCountdown] = useState(3);
    const [timeLeft, setTimeLeft] = useState(30);
    const [currentLiveScore, setCurrentLiveScore] = useState(0);

    const [copied, setCopied] = useState(false);
    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const [invited, setInvited] = useState(false);
    const handleInvitePlayers = () => {
        const inviteUrl = window.location.origin + `/multiplayer/${roomCode}`;
        navigator.clipboard.writeText(inviteUrl);
        setInvited(true);
        setTimeout(() => setInvited(false), 2000);
    };

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
        if (activeGame.status === "playing" && timeLeft === 0) {
            console.log(`Time is up! Submitting final live score: ${currentLiveScore}`);
            submitFinalScore(currentLiveScore);
        }
    }, [timeLeft, activeGame.status, currentLiveScore, submitFinalScore]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Capture score submission from game completions (if they complete early)
    useEffect(() => {
        if (activeGame.status !== "playing") return;

        const handleGameResult = (event) => {
            const finalScore = event.detail?.score || 0;
            console.log(`Captured early score: ${finalScore}. Submitting...`);
            setCurrentLiveScore(finalScore);
            submitFinalScore(finalScore);
        };

        window.addEventListener("brainboots:game-result", handleGameResult);
        return () => {
            window.removeEventListener("brainboots:game-result", handleGameResult);
        };
    }, [activeGame.status, submitFinalScore]);

    // Configure multiplayer global hook overrides for the active game instance
    useEffect(() => {
        if (activeGame.status === "playing") {
            window.brainbootsIsMultiplayer = true;
            window.brainbootsScoreUpdate = (score) => {
                const numericScore = Number(score) || 0;
                setCurrentLiveScore(numericScore);
                updateLiveScore(numericScore);
            };
        } else {
            window.brainbootsIsMultiplayer = false;
            window.brainbootsScoreUpdate = undefined;
        }

        return () => {
            window.brainbootsIsMultiplayer = false;
            window.brainbootsScoreUpdate = undefined;
        };
    }, [activeGame.status, updateLiveScore]);

    // Chat form submit
    const handleSendChatMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        sendMessage(chatInput.trim());
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

    // CSS Confetti generator for results screen (violet/indigo themed)
    const confettiParticles = useMemo(() => {
        const particles = [];
        const colors = ["#8b5cf6", "#a78bfa", "#6366f1", "#f472b6", "#94a3b8", "#cbd5e1"];
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
    }, [roomResults]);

    const myPlayerRecord = players.find((p) => p.username === username);
    const hasFinishedActiveGame = myPlayerRecord?.status === "finished";

    // RENDER: Connecting View
    if (connectionStatus === "CONNECTING") {
        return (
            <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 font-sans">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-violet-600 animate-spin" />
                    <p className="text-xs font-bold text-slate-700">Connecting...</p>
                </div>
            </main>
        );
    }

    // RENDER: Disconnected View
    if (connectionStatus === "DISCONNECTED") {
        return (
            <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 font-sans">
                <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                    <h2 className="text-base font-bold text-slate-900">Disconnected</h2>
                    <div className="mt-6 flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 py-3 text-xs font-bold text-white transition cursor-pointer shadow-md shadow-violet-100"
                        >
                            Reconnect
                        </button>
                        <Link
                            to="/dashboard"
                            className="w-full rounded-2xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold text-slate-700 transition text-center"
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
                        <div className="rounded-3xl border border-violet-200 bg-white p-6 text-center shadow-sm mb-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-violet-50/50 to-transparent pointer-events-none" />
                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-50 text-2xl mb-3 border border-violet-100">👑</span>
                            <h2 className="text-[10px] font-bold uppercase tracking-wider text-violet-700">Winner</h2>
                            <p className="mt-2 text-xl font-black text-slate-900">{podium1st.username}</p>
                            <p className="mt-1 text-sm font-bold text-violet-700 font-mono">Score: {podium1st.score}</p>
                        </div>
                    )}

                    {/* Detailed scoreboard list */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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
                                        <span className={`font-semibold ${player.username === username ? 'text-violet-700 font-bold' : 'text-slate-700'}`}>
                                            {player.username} {player.username === username && "(You)"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-bold text-slate-900 text-sm">{player.score}</span>
                                        {player.is_winner && <span className="text-[10px] bg-violet-50 text-violet-700 font-bold px-2 py-0.5 rounded-full border border-violet-100">WINNER</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={clearRoomResults}
                                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 py-3 text-xs font-bold text-white transition cursor-pointer shadow-md shadow-violet-100"
                            >
                                Return to Lobby
                            </button>
                            <Link
                                to="/dashboard"
                                className="flex-1 inline-flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 py-3 text-xs font-bold text-slate-700 transition"
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
                <div className="bg-white border-b border-slate-200 py-3 px-4">
                    <div className="mx-auto max-w-[1720px] w-[95%] flex flex-wrap items-center gap-3">
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
                                                ? "border-violet-200 bg-violet-50 text-violet-900"
                                                : isSelf
                                                    ? "border-slate-300 bg-slate-100 text-slate-950 font-bold animate-pulse"
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
                                            <span className="inline-flex w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Game Area taking full width */}
                <div className="flex-1 mx-auto max-w-[1720px] w-[95%] flex flex-col py-6">
                    <header className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-slate-900">
                                {activeGame.gameName}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-violet-700 font-mono tracking-wider uppercase">LIVE ARENA MATCH</span>
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
                    <div ref={gameContainerRef} className="flex-1 flex items-center justify-center bg-white rounded-3xl border border-slate-200 p-6 min-h-[55vh] relative overflow-hidden shadow-sm">
                        {timeLeft === 0 || hasFinishedActiveGame ? (
                            <div className="text-center max-w-sm p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
                                <div className="text-3xl mb-3">🏁</div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {timeLeft === 0 ? "Time's Up!" : "Completed"}
                                </h3>
                                <div className="mt-2 text-xs font-semibold text-slate-500">
                                    Your Score: <span className="text-violet-700 font-black font-mono text-sm">{timeLeft === 0 ? currentLiveScore : myPlayerRecord?.score}</span>
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
                                <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-1">Match Prepared</p>
                                <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-white">
                                    {activeGame.gameName}
                                </h2>
                                
                                {isHost ? (
                                    <div className="flex flex-col items-center space-y-4">
                                        <button
                                            type="button"
                                            onClick={startGameplay}
                                            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] text-sm cursor-pointer hover:scale-105 transform active:scale-95"
                                        >
                                            🚀 START MATCH FOR ALL
                                        </button>
                                        <p className="text-[10px] text-slate-400 max-w-xs font-semibold">
                                            As the Host/Admin, you control when the match begins. Starting it will sync both players.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="w-8 h-8 rounded-full border-4 border-slate-700 border-t-violet-500 animate-spin" />
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
                                <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">Prepare Yourself</p>
                                <h2 className="text-lg font-black tracking-wider mb-6">MATCH STARTING IN</h2>
                                <div key={matchStartCountdown} className="text-8xl font-black text-violet-500 animate-ping-once">
                                    {matchStartCountdown}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        );
    }

    // Dynamic Host Name detection
    const hostPlayer = players.find(p => p.is_host);
    const hostName = hostPlayer ? (hostPlayer.username === username ? "You" : hostPlayer.username) : "None";

    // Player slots definition (Exactly 8 Slots)
    const maxPlayers = 8;
    const playerSlots = Array.from({ length: maxPlayers }, (_, idx) => players[idx] || null);

    // RENDER: Active Lobby / Waiting Room View
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-12">
            {/* Top Header Navigation */}
            <header className="border-b border-slate-200/60 bg-white sticky top-0 z-35 px-4 md:px-8 py-4 shadow-xs">
                <div className="mx-auto flex max-w-[1720px] w-[95%] flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex flex-col text-left">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Multiplayer Lobby</h1>
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-1">Host: {hostName}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 self-start md:self-auto">
                        {/* Room Code Display */}
                        <div className="flex flex-col items-start md:items-end gap-1">
                            <span className="text-[9px] font-black tracking-wider text-slate-400">ROOM CODE</span>
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 shadow-xs">
                                <span className="text-base font-black font-mono text-slate-900 tracking-widest px-2 uppercase">{roomCode}</span>
                                <button
                                    type="button"
                                    onClick={handleCopyCode}
                                    className="flex items-center gap-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    {copied ? "Copied" : "Copy"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: 'Join BrainBoot Lobby',
                                                text: `Join my BrainBoot multiplayer game room code: ${roomCode}`,
                                                url: window.location.origin + `/multiplayer/${roomCode}`
                                            }).catch(console.error);
                                        } else {
                                            handleInvitePlayers();
                                        }
                                    }}
                                    className="flex items-center gap-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                                >
                                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.636-2.53m0 7.576l-4.636-2.53m5.024-4.815A3.25 3.25 0 1111.25 6c0 .487-.107.947-.298 1.36l4.636 2.53c.413-.19.873-.298 1.36-.298A3.25 3.25 0 1115 12c0-.487.107-.947.298-1.36l-4.636-2.53a3.25 3.25 0 01-1.36.298 3.25 3.25 0 01-3.25-3.25 3.25 3.25 0 013.25-3.25z" />
                                    </svg>
                                    Share
                                </button>
                            </div>
                        </div>

                        {/* Leave Room Button */}
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 transition shadow-xs self-end md:self-center"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Leave Room
                        </Link>
                    </div>
                </div>
            </header>

            {/* MAIN CONTAINER */}
            <div className="mx-auto max-w-[1720px] w-[95%] px-4 md:px-8 mt-6 space-y-6 flex flex-col flex-1">
                {/* Summary Cards Row Panel */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center gap-6">
                    {/* Card 1: Players */}
                    <div className="flex items-center gap-4 px-4 py-1.5 border-r border-slate-100 last:border-0">
                        <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-400">Players</span>
                            <p className="text-lg font-black text-slate-800 leading-none mt-1">{players.length} / 8</p>
                        </div>
                    </div>
                    
                    {/* Card 2: Game Mode */}
                    <div className="flex items-center gap-4 px-4 py-1.5 border-r border-slate-100 last:border-0">
                        <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-400">Game Mode</span>
                            <p className="text-lg font-black text-slate-800 leading-none mt-1">Standard</p>
                        </div>
                    </div>
                    
                    {/* Card 3: Status */}
                    <div className="flex items-center gap-4 px-4 py-1.5 border-r border-slate-100 last:border-0">
                        <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase text-slate-400">Status</span>
                            <p className="text-xs font-black text-violet-600 leading-none mt-1.5 animate-pulse">Waiting for players</p>
                        </div>
                    </div>
                    
                    {/* Launch/Start Button card */}
                    <div className="flex items-center justify-center px-4 w-full">
                        {isHost ? (
                            <button
                                type="button"
                                disabled={!selectedGameId}
                                onClick={() => startGame(activeSelectedGame.id, activeSelectedGame.name)}
                                className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-6 text-xs font-black text-white transition transform hover:scale-[1.02] active:scale-98 shadow-md ${
                                    selectedGameId
                                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 cursor-pointer shadow-violet-100"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                                }`}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Start Game
                            </button>
                        ) : (
                            <div className="w-full flex items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-violet-50/50 py-3 px-6 text-xs font-black text-violet-600">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                </span>
                                Waiting for Host...
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Interactive 3-Column Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
                    
                    {/* Left Column (3 cols): Players List Panel */}
                    <section className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between h-full">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                                    Players ({players.length}/8)
                                </h2>
                                {isHost && (
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={addBot}
                                            className="text-[9px] font-black px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg border border-violet-200 transition cursor-pointer"
                                        >
                                            + Bot
                                        </button>
                                        <button
                                            type="button"
                                            onClick={removeBot}
                                            className="text-[9px] font-black px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg border border-slate-200 transition cursor-pointer"
                                        >
                                            - Kick
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Player Slots */}
                            <div className="space-y-2">
                                {playerSlots.map((player, idx) => {
                                    if (player) {
                                        const isSelf = player.username === username;
                                        const isPlayerHost = player.is_host;
                                        return (
                                            <div
                                                key={player.username || idx}
                                                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                                                    isSelf
                                                        ? "border-violet-200 bg-violet-50/20"
                                                        : "border-slate-100 bg-slate-50/10"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-8 h-8 rounded-full ${getAvatarColorClass(player.username)} flex-shrink-0 flex items-center justify-center text-white font-black text-xs shadow-xs`}>
                                                        {player.username.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`text-xs font-black truncate max-w-[100px] ${isSelf ? 'text-violet-700' : 'text-slate-800'}`}>
                                                            {player.username} {isSelf && "(You)"}
                                                        </span>
                                                        {isPlayerHost && (
                                                            <span className="inline-flex items-center gap-1 text-[8px] font-black text-violet-600 mt-0.5">
                                                                <span className="w-1 h-1 rounded-full bg-violet-500" />
                                                                Host
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                    Ready
                                                </span>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div
                                                key={`empty-${idx}`}
                                                className="flex items-center justify-between p-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/10"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full border border-dashed border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-300 bg-white">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-400 italic">
                                                        Waiting for player...
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleInvitePlayers}
                            className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-600 py-3.5 text-xs font-bold text-slate-600 transition shadow-xs cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            {invited ? "Link Copied!" : "Invite Players"}
                        </button>
                    </section>

                    {/* Middle Column (6 cols): Selected Games Selection Panel */}
                    <section className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between h-full">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-black text-slate-855 uppercase tracking-wider">
                                        Selected Games
                                    </h2>
                                    <span className="bg-violet-50 text-violet-700 border border-violet-100 rounded-full px-2 py-0.5 text-[10px] font-black font-mono">
                                        {games.length} Games
                                    </span>
                                </div>
                                {isHost && (
                                    <div className="relative w-full sm:w-48">
                                        <input
                                            type="text"
                                            placeholder="Search games..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs placeholder-slate-400 focus:border-violet-500 focus:outline-none shadow-xs transition"
                                        />
                                        <svg className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Grid list of catalog games (4-column layout) */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
                                {filteredGames.map((game) => {
                                    const isSelected = selectedGameId === game.id;
                                    const meta = GAME_UI_METADATA[game.id] || { label: "COGNITIVE", icon: "🎮" };
                                    return (
                                        <button
                                            key={game.id}
                                            type="button"
                                            disabled={!isHost}
                                            onClick={() => setSelectedGameId(game.id)}
                                            className={`p-3.5 rounded-2xl border flex flex-col items-center justify-between text-center min-h-[110px] transition-all relative ${
                                                !isHost ? "cursor-default" : "cursor-pointer"
                                            } ${
                                                isSelected
                                                    ? "border-violet-500 bg-violet-50/10 ring-1 ring-violet-500 shadow-xs"
                                                    : "border-slate-200 bg-slate-50/20 hover:border-slate-350 shadow-2xs"
                                            }`}
                                        >
                                            <div className="flex flex-col items-center w-full">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors shadow-inner ${
                                                    isSelected
                                                        ? "bg-violet-500/20 border-violet-500/30 text-violet-700"
                                                        : "bg-violet-500/10 border-violet-500/20 text-violet-600"
                                                }`}>
                                                    {meta.icon}
                                                </div>
                                                <h4 className="text-xs font-black text-slate-800 mt-2.5 leading-tight line-clamp-2 w-full">{game.name}</h4>
                                            </div>
                                            <span className="text-[8px] font-black tracking-widest text-violet-600 uppercase mt-2.5 font-mono">
                                                {meta.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Right Column (3 cols): Lobby Chat & Tip Banner */}
                    <section className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between h-full">
                        <div className="flex flex-col flex-1 min-h-0">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                                    Lobby Chat
                                </h2>
                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {players.length} online
                                </span>
                            </div>

                            {/* Messages container */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 h-[300px] border border-slate-100 bg-slate-50/20 rounded-2xl p-3.5">
                                {chatMessages.length === 0 ? (
                                    <p className="text-slate-400 text-xs italic text-center mt-6">
                                        Chat active.
                                    </p>
                                ) : (
                                    chatMessages.map((msg, idx) => {
                                        if (msg.isSystem) {
                                            return (
                                                <div key={idx} className="text-center my-2.5">
                                                    <span className="inline-block bg-slate-100 border border-slate-200/40 rounded-full px-3 py-1.5 text-[8.5px] text-slate-500 font-bold italic shadow-3xs">
                                                        {msg.message}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        const isSelf = msg.username === username;
                                        return (
                                            <div key={idx} className="flex gap-2.5 items-start text-left">
                                                <div className={`w-7.5 h-7.5 rounded-full flex-shrink-0 ${getAvatarColorClass(msg.username)} flex items-center justify-center text-white font-black text-[9px] shadow-xs`}>
                                                    {msg.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className={`text-[10px] font-black truncate ${isSelf ? 'text-violet-700' : 'text-slate-800'}`}>
                                                            {msg.username}
                                                        </span>
                                                        <span className="text-[8px] font-bold text-slate-400 font-mono">
                                                            {msg.timestamp || "12:00 PM"}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5 break-words">
                                                        {msg.message}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>
                        </div>

                        {/* Chat Form Input */}
                        <div className="space-y-4">
                            <form onSubmit={handleSendChatMessage} className="flex gap-2 relative">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        maxLength={150}
                                        className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-xs placeholder-slate-400 focus:border-violet-500 focus:outline-none shadow-xs transition"
                                    />
                                    <span 
                                        className="absolute right-3 top-2 text-slate-400 text-xs cursor-pointer select-none hover:scale-110 active:scale-95 transition"
                                        onClick={() => setChatInput(prev => prev + " 😊")}
                                    >
                                        😊
                                    </span>
                                </div>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white p-2.5 rounded-2xl transition cursor-pointer shadow-xs flex items-center justify-center w-9.5 h-9.5 flex-shrink-0"
                                >
                                    <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                                    </svg>
                                </button>
                            </form>

                            {/* bottom tip badge */}
                            <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-2xl p-3 text-[10px] font-black text-violet-700 shadow-3xs">
                                <svg className="w-4 h-4 text-violet-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span>Tip: Be respectful and have fun!</span>
                            </div>
                        </div>
                    </section>

                </div>

                {/* Features Footer Section */}
                <footer className="border-t border-slate-200/60 pt-6 pb-2 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-start gap-3 text-left">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0 shadow-3xs">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800">Fair Play</h4>
                                <p className="text-[10px] font-bold text-slate-400 leading-normal mt-0.5">All games are fair and unbiased</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3 text-left">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0 shadow-3xs">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800">Real-time</h4>
                                <p className="text-[10px] font-bold text-slate-400 leading-normal mt-0.5">Live multiplayer experience</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3 text-left">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0 shadow-3xs">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800">Secure</h4>
                                <p className="text-[10px] font-bold text-slate-400 leading-normal mt-0.5">Your data is protected</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3 text-left">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0 shadow-3xs">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-800">Cross Platform</h4>
                                <p className="text-[10px] font-bold text-slate-400 leading-normal mt-0.5">Play on any device</p>
                            </div>
                        </div>
                    </div>
                </footer>
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
