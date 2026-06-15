import { useState, useEffect, useRef, useMemo, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const STREAK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
import { games } from "../data/gameCatalog";
import { useGameRoom } from "../websocket/useGameRoom";

/* ─────────────── Sidebar SVGs ─────────────── */
const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>;
const IconTrain = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M12 4v16" /><rect x="5" y="4" width="3" height="3" rx="1" /><rect x="16" y="17" width="3" height="3" rx="1" /></svg>;
const IconChallenge = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
const IconRooms = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4" /><circle cx="17" cy="9" r="3" /><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /><path d="M19 21v-1.5a3 3 0 0 0-3-3" /></svg>;
const IconProgress = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const IconLeaderboard = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="4" height="18" rx="1" /><rect x="10" y="9" width="4" height="12" rx="1" /><rect x="2" y="13" width="4" height="8" rx="1" /></svg>;
const IconProfile = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
const IconChat = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IconBrain = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7.58 2 4 5.58 4 10c0 1.8.63 3.45 1.68 4.75C5.07 15.65 4 17.2 4 19c0 .55.45 1 1 1h4c2.21 0 4-1.79 4-4v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 1.1-.9 2-2 2H6.83c.53-1.28 1.82-2.18 3.17-2.18.55 0 1-.45 1-1C11 10.9 8.1 8 12 8s1 .45 1 1c0 .55.45 1 1 1 .55 0 1-.45 1-1 0-3.31-2.69-6-6-6zM18.32 14.75C19.37 13.45 20 11.8 20 10c0-4.42-3.58-8-8-8-.55 0-1 .45-1 1s.45 1 1 1c3.31 0 6 2.69 6 6 0 .55.45 1 1 1s1-.45 1-1c0-1.8-1.46-3.26-3.26-3.26-.55 0-1 .45-1 1s.45 1 1 1c.7 0 1.26.56 1.26 1.26 0 1.07-.87 1.94-1.94 1.94-.55 0-1 .45-1 1v2c0 2.21 1.79 4 4 4h4c.55 0 1-.45 1-1 0-1.8-1.07-3.35-1.68-4.25z"/></svg>;

// Utility to read JSON from localStorage
const readStoredJson = (key, fallback) => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

/* ─────────────── Lobby Sidebar Component ─────────────── */
const LobbySidebar = memo(function LobbySidebar({ username, initials, userLevel, streak, streakDays }) {
    const sidebarItems = [
        { label: "Home", icon: <IconHome />, to: "/dashboard" },
        { label: "Train", icon: <IconTrain />, to: "/games" },
        { label: "AI Assistant", icon: <IconChat />, to: "/chat" },
        { label: "Challenges", icon: <IconChallenge />, to: "/dashboard" },
        { label: "Rooms", icon: <IconRooms />, active: true },
        { label: "Progress", icon: <IconProgress />, to: "/dashboard" },
        { label: "Leaderboard", icon: <IconLeaderboard />, to: "/dashboard" },
        { label: "Profile", icon: <IconProfile />, to: "/dashboard" },
    ];

    return (
        <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "240px", minWidth: "240px", background: "white", borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "24px 16px", zIndex: 45, overflowY: "auto" }} className="scrollbar-hide">
            <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "8px", marginBottom: "32px", textDecoration: "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: "10px", background: "linear-gradient(135deg, #7c6aff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 900 }}>
                    <IconBrain />
                </div>
                <div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1, margin: 0 }}>BrainBoot</p>
                    <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1, marginTop: 4, fontWeight: 500, margin: 0 }}>Train Your Brain</p>
                </div>
            </Link>

            <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflowY: "auto" }} className="scrollbar-hide">
                {sidebarItems.map((item, i) => (
                    <Link key={i} to={item.to || "#"} style={{
                        display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: "12px",
                        background: item.active ? "linear-gradient(135deg, #8b5cf6, #a78bfa)" : "transparent",
                        color: item.active ? "white" : "#64748b", fontWeight: 600, fontSize: 14, textDecoration: "none", transition: "all 0.2s"
                    }}>
                        <span style={{ opacity: item.active ? 1 : 0.7, display: "flex", alignItems: "center" }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div style={{ padding: "0 8px", marginTop: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 24 }}>🔥</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: "#10b981", lineHeight: 1 }}>{streak}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginTop: 4 }}>Day Streak</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
                    {streakDays.map((d, i) => {
                        const isCompleted = i < (streak % 7 || (streak > 0 ? 7 : 0));
                        return (
                            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                                <div style={{
                                    width: 22, height: 22, borderRadius: "50%",
                                    background: isCompleted ? "#10b981" : "#f1f5f9",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    {isCompleted ? <span style={{ color: "white", fontSize: 10, fontWeight: 900 }}>✓</span> : <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 600 }}>{d}</span>}
                                </div>
                                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{d}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
});
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
    },
    memoryrace: {
        label: "MEM RACE",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    trafficcontrol: {
        label: "TRAFFIC",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="6" r="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 2h6v20H9z" />
            </svg>
        )
    },
    wronganswers: {
        label: "WRONG ONLY",
        icon: (
            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        )
    },
    hotpotato: {
        label: "HOT POTATO",
        icon: (
            <svg className="w-5 h-5 animate-bounce text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1014.12 11.88" />
            </svg>
        )
    }
};

// Game covers based on skill categories
const getGameCoverImage = (gameId) => {
    switch (gameId) {
        case "memory":
        case "simon":
        case "numbers":
        case "nback":
        case "memoryrace":
            return "/zone_memory.png";
        case "reaction":
        case "aim":
        case "typing":
        case "speedmath":
        case "trafficcontrol":
            return "/zone_reflex.png";
        case "stroop":
        case "oddcolor":
        case "focusgrid":
        case "schulte":
            return "/zone_focus.png";
        case "sudoku":
        case "wordguess":
        case "lightsout":
        case "slidingtile":
        case "hanoi":
            return "/zone_logic.png";
        case "wronganswers":
        case "hotpotato":
            return "/zone_fun.png";
        default:
            return "/zone_map.png";
    }
};

// Skill labels
const getGameSkill = (gameId) => {
    switch (gameId) {
        case "memory":
        case "simon":
        case "numbers":
        case "nback":
        case "memoryrace":
            return "Memory & Retention";
        case "reaction":
        case "aim":
        case "typing":
        case "speedmath":
        case "trafficcontrol":
            return "Reflexes & Coordination";
        case "stroop":
        case "oddcolor":
        case "focusgrid":
        case "schulte":
            return "Focus & Attention";
        case "sudoku":
        case "wordguess":
        case "lightsout":
        case "slidingtile":
        case "hanoi":
            return "Logic & Deduction";
        case "wronganswers":
        case "hotpotato":
            return "Creative & Fun";
        default:
            return "Cognitive Training";
    }
};

// Game description subtitles matching screenshot
const getGameSubtitle = (game) => {
    if (!game) return "";
    if (game.id === "aim") return "Fast-paced Reflexes";
    if (game.id === "memory") return "Memory match";
    if (game.id === "stroop") return "Cognitive flexibility";
    if (game.id === "reaction") return "Reaction flexibility";
    
    return game.desc || "Cognitive skill challenge";
};

// Recommending player counts matching screenshot
const getGameRecommendedPlayers = (gameId) => {
    switch (gameId) {
        case "aim":
            return "4-8 players";
        case "wronganswers":
        case "hotpotato":
            return "3-8 players";
        default:
            return "2-6 players";
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

    const user = readStoredJson("user", {});
    const storedStats = readStoredJson("brainbootsStats", {});
    const streak = storedStats.streak || 7;
    const totalScore = storedStats.totalScore || 5005;
    const username = user.username || user.email || "Player";
    const initials = username.substring(0, 2).toUpperCase();
    const userLevel = Math.floor(totalScore / 1000) + 1;
    const streakDays = ["M", "T", "W", "T", "F", "S", "S"];

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
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fe", fontFamily: "Inter, system-ui, sans-serif" }}>
            <LobbySidebar 
                username={username}
                initials={initials}
                userLevel={userLevel}
                streak={streak}
                streakDays={streakDays}
            />
            <div style={{
                marginLeft: "240px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                position: "relative",
                backgroundColor: "#f8f9fe",
                overflowX: "hidden"
            }}>
                <main className="flex-1 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
                    {/* Ambient Background Glows */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

                    <header className="text-center mb-8 max-w-md z-10">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors mb-3 gap-1 hover:translate-x-[-2px] duration-200"
                        >
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-violet-700 bg-clip-text text-transparent drop-shadow-sm">
                            Multiplayer Arena
                        </h1>
                        <p className="text-xs font-semibold text-slate-500 mt-2">Challenge your friends in real-time cognitive battles</p>
                    </header>

                    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-md p-8 shadow-2xl shadow-slate-200/40 z-10">
                        {/* Tab buttons */}
                        <div className="flex border-b border-slate-100 mb-6">
                            <button
                                type="button"
                                onClick={() => { setActiveTab("create"); setRoomInputError(""); }}
                                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all duration-300 ${
                                    activeTab === "create"
                                        ? "border-violet-600 text-violet-600"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                Create Lobby
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveTab("join"); setRoomInputError(""); }}
                                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all duration-300 ${
                                    activeTab === "join"
                                        ? "border-violet-600 text-violet-600"
                                        : "border-transparent text-slate-400 hover:text-slate-600"
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
                                    className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3.5 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-98"
                                >
                                    Create New Arena
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleJoinRoomSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="ROOM CODE"
                                    value={roomInput}
                                    onChange={(e) => setRoomInput(e.target.value)}
                                    maxLength={8}
                                    className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3.5 px-4 text-xs font-mono uppercase tracking-widest text-slate-800 placeholder-slate-400 focus:border-violet-600/80 focus:ring-1 focus:ring-violet-500/30 focus:outline-none transition-all"
                                />
                                {roomInputError && (
                                    <p className="text-xs font-semibold text-rose-600 pl-1">
                                        {roomInputError}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3.5 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-98"
                                >
                                    Join Arena
                                </button>
                            </form>
                        )}
                    </div>
                </main>
            </div>
        </div>
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
        resetLobby,
        addBot,
        removeBot,
        sendGameAction
    } = roomState;

    const [chatInput, setChatInput] = useState("");
    const [selectedGameId, setSelectedGameId] = useState("aim");
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

    const [map, setMap] = useState("Neon City");
    const [mode, setMode] = useState("Free For All");
    const [difficulty, setDifficulty] = useState("Hard");
    const [roundLimit, setRoundLimit] = useState(5);
    const [privacy, setPrivacy] = useState("Private");
    const [isEditingSettings, setIsEditingSettings] = useState(false);

    // Sync match settings via custom game actions (transparently broadcasted by backend)
    useEffect(() => {
        const handleGameActionMessage = (event) => {
            const { username: senderUsername, payload } = event.detail;
            if (!payload) return;
            
            if (payload.type === "settings_update") {
                setMap(payload.map);
                setMode(payload.mode);
                setDifficulty(payload.difficulty);
                setRoundLimit(payload.roundLimit);
                setPrivacy(payload.privacy);
                if (payload.selectedGameId) {
                    setSelectedGameId(payload.selectedGameId);
                }
            } else if (payload.type === "selected_game_update") {
                setSelectedGameId(payload.gameId);
            } else if (payload.type === "request_settings" && isHost) {
                sendGameAction({
                    type: "settings_update",
                    map,
                    mode,
                    difficulty,
                    roundLimit,
                    privacy,
                    selectedGameId
                });
            }
        };

        window.addEventListener("brainboots:game-action", handleGameActionMessage);
        return () => {
            window.removeEventListener("brainboots:game-action", handleGameActionMessage);
        };
    }, [isHost, map, mode, difficulty, roundLimit, privacy, selectedGameId, sendGameAction]);

    // Request settings from host when first connecting
    useEffect(() => {
        if (connectionStatus === "CONNECTED" && !isHost) {
            const timer = setTimeout(() => {
                sendGameAction({ type: "request_settings" });
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [connectionStatus, isHost, sendGameAction]);

    // Synchronized starting countdown and match timer
    useEffect(() => {
        if (gameplayStatus !== "playing") {
            setMatchStartCountdown(3);
            return;
        }

        const duration = activeGame.gameId === "wronganswers" ? 180 : (activeGame.gameId === "hotpotato" ? 120 : 30);
        setMatchStartCountdown(3);
        setTimeLeft(duration);
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
            window.brainbootsSendGameAction = sendGameAction;
            window.brainbootsPlayers = players;
        } else {
            window.brainbootsIsMultiplayer = false;
            window.brainbootsScoreUpdate = undefined;
            window.brainbootsSendGameAction = undefined;
            window.brainbootsPlayers = undefined;
        }

        return () => {
            window.brainbootsIsMultiplayer = false;
            window.brainbootsScoreUpdate = undefined;
            window.brainbootsSendGameAction = undefined;
            window.brainbootsPlayers = undefined;
        };
    }, [activeGame.status, updateLiveScore, sendGameAction, players]);

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

    const effectiveIsHost = useMemo(() => {
        if (connectionStatus !== "CONNECTED") return true;
        const playerRecord = players.find(p => p.username === username);
        if (!playerRecord) return true;
        return playerRecord.is_host;
    }, [connectionStatus, players, username]);

    // Fallback players list if empty
    const displayPlayers = useMemo(() => {
        if (players && players.length > 0) return players;
        return [{
            username: username,
            is_host: effectiveIsHost,
            score: 0,
            status: "waiting"
        }];
    }, [players, username, effectiveIsHost]);

    // Dynamic Host Name detection
    const hostPlayer = displayPlayers.find(p => p.is_host);
    const hostName = hostPlayer ? (hostPlayer.username === username ? "You" : hostPlayer.username) : "You";

    // Player slots definition (Exactly 8 Slots)
    const maxPlayers = 8;
    const playerSlots = Array.from({ length: maxPlayers }, (_, idx) => displayPlayers[idx] || null);

    const gameCatalogGrid = useMemo(() => {
        const isSelectionDisabled = connectionStatus === "CONNECTED" && !effectiveIsHost;
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-h-[360px] overflow-y-auto pr-1">
                {filteredGames.map((game) => {
                    const isSelected = selectedGameId === game.id;
                    const meta = GAME_UI_METADATA[game.id] || { label: "COGNITIVE", icon: "🎮" };
                    return (
                        <button
                            key={game.id}
                            type="button"
                            disabled={isSelectionDisabled}
                            onClick={() => {
                                setSelectedGameId(game.id);
                                if (connectionStatus === "CONNECTED") {
                                    sendGameAction({ type: "selected_game_update", gameId: game.id });
                                }
                            }}
                            className={`p-4 rounded-3xl border text-left transition-all ${
                                isSelectionDisabled ? "cursor-default" : "cursor-pointer hover:scale-[1.02] hover:shadow-2xs"
                            } ${
                                isSelected
                                    ? "border-violet-500 bg-violet-50/50 ring-1 ring-violet-200 shadow-sm"
                                    : "border-slate-150 bg-white hover:border-slate-300"
                            }`}
                        >
                            <div className="flex flex-col h-full justify-between gap-4">
                                <div>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors shadow-inner ${
                                        isSelected
                                            ? "bg-violet-100 border-violet-200 text-violet-600"
                                            : "bg-slate-50 border-slate-100 text-slate-400"
                                    }`}>
                                        {meta.icon}
                                    </div>
                                    <h4 className="text-xs font-black text-slate-800 mt-3 leading-snug">{game.name}</h4>
                                    <p className="text-[10px] text-slate-404 mt-1 leading-normal font-semibold line-clamp-2">{getGameSubtitle(game)}</p>
                                </div>
                                <span className="text-[9px] font-black text-violet-500 uppercase tracking-wider font-mono">
                                    {getGameRecommendedPlayers(game.id)}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    }, [filteredGames, selectedGameId, connectionStatus, effectiveIsHost, sendGameAction]);

    const myPlayerRecord = players.find((p) => p.username === username);
    const hasFinishedActiveGame = myPlayerRecord?.status === "finished";    // RENDER: Connecting View
    // RENDER: Connecting View
    if (connectionStatus === "CONNECTING") {
        return (
            <main className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-slate-50 to-violet-50/40 text-slate-800 flex flex-col items-center justify-center p-4 font-sans">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-violet-600 animate-spin shadow-[0_0_15px_rgba(139,92,246,0.1)]" />
                    <p className="text-xs font-black text-slate-500 tracking-wider animate-pulse">Connecting to Arena...</p>
                </div>
            </main>
        );
    }

    // RENDER: Disconnected View
    if (connectionStatus === "DISCONNECTED") {
        return (
            <main className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-slate-50 to-violet-50/40 text-slate-800 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
                <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-md p-8 text-center shadow-2xl z-10">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/50 flex items-center justify-center text-rose-500 text-xl mx-auto mb-4 shadow-xs">
                        ⚠️
                    </div>
                    <h2 className="text-lg font-black text-slate-955 tracking-tight">Disconnected</h2>
                    <p className="text-xs text-slate-500 mt-2">Connection to the arena server was lost.</p>
                    <div className="mt-6 flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3.5 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-98"
                        >
                            Reconnect
                        </button>
                        <Link
                            to="/dashboard"
                            className="w-full rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-slate-600 py-3.5 text-xs font-bold transition text-center hover:scale-[1.02] active:scale-98"
                        >
                            Exit
                        </Link>
                    </div>
                </div>
            </main>
        );
    }
    if (roomResults) {
        const sortedResults = [...roomResults].sort((a, b) => b.score - a.score);
        const podium1st = sortedResults[0];

        const user = readStoredJson("user", {});
        const storedStats = readStoredJson("brainbootsStats", {});
        const streak = storedStats.streak || 7;
        const totalScore = storedStats.totalScore || 5005;
        const initials = username.substring(0, 2).toUpperCase();
        const userLevel = Math.floor(totalScore / 1000) + 1;
        const streakDays = ["M", "T", "W", "T", "F", "S", "S"];

        return (
            <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fe", fontFamily: "Inter, system-ui, sans-serif" }}>
                <LobbySidebar 
                    username={username}
                    initials={initials}
                    userLevel={userLevel}
                    streak={streak}
                    streakDays={STREAK_DAYS}
                />
                <div style={{
                    marginLeft: "240px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                    position: "relative",
                    backgroundColor: "#f8f9fe",
                    overflowX: "hidden"
                }}>
                    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
                        {/* Ambient Background Glows */}
                        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-200/40 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

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
                                <div className="flex items-center justify-center gap-1.5 mt-1">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                    </span>
                                    <span className="text-[10px] font-bold text-violet-600 font-mono tracking-wider uppercase">Arena Battle Complete</span>
                                </div>
                            </div>

                            {/* Featured Winner Spotlight Card */}
                            {podium1st && (
                                <div className="rounded-3xl border border-violet-200 bg-white/80 backdrop-blur-md p-8 text-center shadow-lg shadow-violet-100/50 mb-6 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-violet-100/30 to-transparent pointer-events-none" />
                                    <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-50 border border-violet-150 text-3xl mb-4 shadow-sm">👑</span>
                                    <h2 className="text-[10px] font-black uppercase tracking-wider text-violet-700">Winner</h2>
                                    <p className="mt-2 text-2xl font-black text-slate-950 tracking-tight">{podium1st.username}</p>
                                    <p className="mt-1.5 text-sm font-black text-violet-600 font-mono tracking-wide">Score: {podium1st.score}</p>
                                </div>
                            )}

                            {/* Detailed scoreboard list */}
                            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-md p-6 shadow-xl shadow-slate-100/50">
                                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
                                    Scoreboard
                                </h2>
                                <div className="divide-y divide-slate-100 animate-fade-in">
                                    {sortedResults.map((player, idx) => (
                                        <div key={player.username} className={`py-3.5 px-3 rounded-2xl flex items-center justify-between text-xs transition border ${
                                            player.username === username 
                                                ? 'border-violet-200 bg-violet-50/40 text-violet-700 font-black' 
                                                : 'border-transparent text-slate-600'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <span className="w-5 text-center font-black text-slate-400 font-mono text-[11px]">
                                                    #{idx + 1}
                                                </span>
                                                <div className={`w-8 h-8 rounded-full ${getAvatarColorClass(player.username)} flex items-center justify-center text-white font-black text-xs shadow-md`}>
                                                    {player.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className={`font-black ${player.username === username ? 'text-violet-600' : 'text-slate-700'}`}>
                                                    {player.username} {player.username === username && "(You)"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono font-black text-slate-800 text-sm">{player.score}</span>
                                                {player.is_winner && (
                                                    <span className="text-[9px] bg-violet-50 text-violet-700 font-black px-2.5 py-0.5 rounded-full border border-violet-100 font-mono uppercase tracking-wider">
                                                        WINNER
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex gap-3">
                                    {isHost ? (
                                        <button
                                            type="button"
                                            onClick={resetLobby}
                                            className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3.5 text-xs font-black text-white transition-all transform hover:scale-[1.02] active:scale-98 cursor-pointer shadow-lg shadow-violet-500/20"
                                        >
                                            🔄 Return all to Lobby
                                        </button>
                                    ) : (
                                        <div className="flex-1 inline-flex items-center justify-center rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 py-3.5 text-xs font-black tracking-wide animate-pulse">
                                            Waiting for Host...
                                        </div>
                                    )}
                                    <Link
                                        to="/dashboard"
                                        className="flex-1 inline-flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-slate-600 py-3.5 text-xs font-black transition-all transform hover:scale-[1.02] active:scale-98"
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
                            .lobby-chat-messages::-webkit-scrollbar {
                                width: 6px;
                            }
                            .lobby-chat-messages::-webkit-scrollbar-track {
                                background: #f8fafc;
                                border-radius: 9999px;
                            }
                            .lobby-chat-messages::-webkit-scrollbar-thumb {
                                background: #ddd6fe;
                                border-radius: 9999px;
                            }
                            .lobby-chat-messages::-webkit-scrollbar-thumb:hover {
                                background: #c084fc;
                            }
                            .lobby-chat-messages {
                                scrollbar-width: thin;
                                scrollbar-color: #ddd6fe #f8fafc;
                            }
                        `}</style>
                    </main>
                </div>
            </div>
        );
    }

    // RENDER: In-Game Active play container
    if (activeGame.status === "playing") {
        const gameCatalogRecord = games.find((g) => g.id === activeGame.gameId);
        const ActiveGameComponent = gameCatalogRecord?.component;

        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
                {/* Ambient Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

                {/* Horizontal HUD Leaderboard */}
                <div className="bg-slate-900/80 border-b border-slate-800 py-3 px-4 z-10">
                    <div className="mx-auto max-w-[1720px] w-[95%] flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2">
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
                                                ? "border-violet-500/30 bg-violet-950/40 text-violet-200"
                                                : isSelf
                                                    ? "border-slate-700 bg-slate-800 text-white font-bold animate-pulse"
                                                    : "border-slate-800/80 bg-slate-900/50 text-slate-300"
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
                <div className="flex-1 mx-auto max-w-[1720px] w-[95%] flex flex-col py-6 z-10">
                    <header className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-white">
                                {activeGame.gameName}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-violet-400 font-mono tracking-wider uppercase">LIVE ARENA MATCH</span>
                            </div>
                        </div>

                        {/* Synchronized Timer HUD */}
                        <div className="flex items-center gap-3 bg-rose-950/30 border border-rose-500/20 rounded-2xl px-4 py-2 shadow-lg">
                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Time Left:</span>
                            <span className={`text-xl font-black font-mono transition-colors ${timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-100'}`}>
                                {timeLeft}s
                            </span>
                            <div className="w-24 h-2 bg-rose-950/80 rounded-full overflow-hidden hidden sm:block">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-rose-600'}`}
                                    style={{ width: `${(timeLeft / (activeGame.gameId === "wronganswers" ? 180 : (activeGame.gameId === "hotpotato" ? 120 : 30))) * 100}%` }}
                                />
                            </div>
                        </div>
                    </header>

                    {/* Rendering the active game */}
                    <div ref={gameContainerRef} className="flex-1 flex items-center justify-center bg-slate-900/40 border border-slate-850 p-6 min-h-[55vh] relative overflow-hidden shadow-2xl rounded-3xl backdrop-blur-md">
                        {timeLeft === 0 || hasFinishedActiveGame ? (
                            <div className="text-center max-w-sm p-8 rounded-3xl border border-slate-800 bg-slate-950/60 shadow-xl">
                                <div className="text-3xl mb-3">🏁</div>
                                <h3 className="text-lg font-black text-white">
                                    {timeLeft === 0 ? "Time's Up!" : "Completed"}
                                </h3>
                                <div className="mt-2 text-xs font-semibold text-slate-400">
                                    Your Score: <span className="text-violet-400 font-black font-mono text-lg">{timeLeft === 0 ? currentLiveScore : myPlayerRecord?.score}</span>
                                </div>
                            </div>
                        ) : ActiveGameComponent ? (
                            <div className="w-full flex justify-center">
                                <ActiveGameComponent />
                            </div>
                        ) : (
                            <div className="text-slate-400 font-bold text-xs">Game not found.</div>
                        )}

                        {/* Gameplay Ready Overlay (Lobby Launch state) */}
                        {gameplayStatus === "ready" && (
                            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white p-6 text-center">
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
                                            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] text-sm cursor-pointer hover:scale-105 transform active:scale-95"
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
                            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white">
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



    // RENDER: Active Lobby
    const user = readStoredJson("user", {});
    const storedStats = readStoredJson("brainbootsStats", {});
    const streak = storedStats.streak || 7;
    const totalScore = storedStats.totalScore || 5005;
    const initials = username.substring(0, 2).toUpperCase();
    const userLevel = Math.floor(totalScore / 1000) + 1;



    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fe", fontFamily: "Inter, system-ui, sans-serif" }}>
            <LobbySidebar 
                username={username}
                initials={initials}
                userLevel={userLevel}
                streak={streak}
                streakDays={STREAK_DAYS}
            />
            <div style={{
                marginLeft: "240px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                position: "relative",
                backgroundColor: "#f8f9fe",
                overflowX: "hidden"
            }}>
                <main className="flex-1 flex flex-col font-sans p-6 md:p-8 relative overflow-hidden">
                    {/* Ambient Background Glows */}
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-200/40 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

                    {/* Outer premium lobby card wrapper (matches the mockup style) */}
                    <div className="w-full max-w-[1280px] mx-auto bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-md z-10 flex flex-col gap-6">
                        
                        {/* Header: Multiplayer Lobby, Status, Room Code */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                            <div className="flex flex-wrap items-baseline gap-3">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Multiplayer Lobby</h1>
                                <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                                    connectionStatus === "CONNECTED"
                                        ? "text-emerald-600"
                                        : connectionStatus === "CONNECTING"
                                            ? "text-amber-600"
                                            : "text-rose-600"
                                }`}>
                                    <span>Status: <span className="font-extrabold">{
                                        connectionStatus === "CONNECTED"
                                            ? "Online"
                                            : connectionStatus === "CONNECTING"
                                                ? "Connecting..."
                                                : "Offline"
                                    }</span></span>
                                    <span className={`w-2 h-2 rounded-full inline-block animate-pulse ${
                                        connectionStatus === "CONNECTED"
                                            ? "bg-emerald-500"
                                            : connectionStatus === "CONNECTING"
                                                ? "bg-amber-500"
                                                : "bg-rose-500"
                                    }`} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-violet-100/70 border border-violet-200/50 rounded-2xl py-1.5 px-4 cursor-pointer hover:bg-violet-200/80 transition shadow-2xs" onClick={handleCopyCode}>
                                <span className="text-xs font-black text-violet-800 tracking-wider font-mono uppercase">
                                    ROOM CODE: <span className="font-extrabold text-violet-900">{roomCode}</span>
                                </span>
                                <svg className="w-3.5 h-3.5 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                {copied && <span className="text-[10px] text-emerald-600 font-bold ml-1">Copied!</span>}
                            </div>
                        </div>

                        {/* Split Columns Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            
                            {/* Left Area (7 cols): Selected Game Details & Selection Catalog */}
                            <div className="lg:col-span-7 flex flex-col gap-6">
                                
                                {/* 1. Selected Game showcase card */}
                                <div className="flex flex-col text-left">
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                        </svg>
                                        <span className="text-[10px] font-black tracking-wider text-slate-800 uppercase font-mono">SELECTED GAME: {activeSelectedGame ? activeSelectedGame.name.toUpperCase() : "NONE"}</span>
                                    </div>
                                    
                                    <div className="bg-slate-50/50 border border-slate-200/80 rounded-3xl p-6 shadow-2xs flex flex-col sm:flex-row items-center gap-6">
                                        {activeSelectedGame ? (
                                            <>
                                                <img 
                                                    src={getGameCoverImage(activeSelectedGame.id)} 
                                                    alt={activeSelectedGame.name} 
                                                    className="w-32 h-32 rounded-2xl object-cover shadow-sm border border-slate-200/40 flex-shrink-0"
                                                />
                                                <div className="flex-1 text-left min-w-0 flex flex-col justify-between h-32">
                                                    <div>
                                                        <h2 className="text-xl font-extrabold text-slate-900 leading-tight truncate">{activeSelectedGame.name}</h2>
                                                        <p className="text-xs text-slate-500 font-semibold mt-1">{getGameSubtitle(activeSelectedGame)}</p>
                                                        
                                                        <div className="mt-3 space-y-1 text-xs text-slate-700 font-semibold">
                                                            <p className="flex items-center gap-1.5">
                                                                <span className="text-slate-400 font-normal">Players:</span> 
                                                                <span className="text-slate-900 font-bold">{displayPlayers.length} / 8</span>
                                                            </p>
                                                            <p className="flex items-center gap-1.5">
                                                                <span className="text-slate-400 font-normal">Skill:</span> 
                                                                <span className="text-slate-900 font-bold">{getGameSkill(activeSelectedGame.id)}</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-2">
                                                        {effectiveIsHost ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => startGame(activeSelectedGame.id, activeSelectedGame.name)}
                                                                className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2.5 px-6 rounded-full transition-all shadow-md shadow-violet-500/20 active:scale-95 cursor-pointer"
                                                            >
                                                                START MATCH
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                disabled
                                                                className="bg-violet-100 text-violet-500 font-bold text-xs py-2.5 px-6 rounded-full cursor-not-allowed animate-pulse"
                                                            >
                                                                WAITING FOR HOST
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex-1 py-10 text-center">
                                                <span className="text-3xl block mb-2">🎮</span>
                                                <p className="text-xs font-semibold text-slate-400">No game selected. Please select a game from catalog.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Game Selection Catalog Grid */}
                                <div className="flex flex-col text-left">
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        <span className="text-[10px] font-black tracking-wider text-slate-800 uppercase font-mono">GAME SELECTION</span>
                                    </div>

                                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs">
                                        {/* Search bar inside card */}
                                        <div className="relative mb-4">
                                            <input
                                                type="text"
                                                placeholder="Search games..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none transition shadow-2xs"
                                            />
                                            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>

                                        {/* Grid catalog (3 columns, scrollable) */}
                                        {gameCatalogGrid}
                                    </div>
                                </div>

                            </div>

                            {/* Right Area (5 cols): Match Settings & Chat logs */}
                            <div className="lg:col-span-5 flex flex-col gap-6">
                                
                                {/* 1. Match Settings box */}
                                <div className="flex flex-col text-left">
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        <span className="text-[10px] font-black tracking-wider text-slate-800 uppercase font-mono">MATCH SETTINGS</span>
                                    </div>
                                    
                                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs flex flex-col justify-between min-h-[240px]">
                                        {isEditingSettings ? (
                                            <div className="space-y-3.5 text-left">
                                                <div>
                                                    <label className="text-slate-400 block font-normal text-[10px] mb-1">Map</label>
                                                    <select
                                                        value={map}
                                                        onChange={(e) => setMap(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 font-bold"
                                                    >
                                                        <option value="Neon City">Neon City</option>
                                                        <option value="Retro Arcade">Retro Arcade</option>
                                                        <option value="Cyber Space">Cyber Space</option>
                                                        <option value="Vaporwave Grid">Vaporwave Grid</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-slate-400 block font-normal text-[10px] mb-1">Mode</label>
                                                    <select
                                                        value={mode}
                                                        onChange={(e) => setMode(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 font-bold"
                                                    >
                                                        <option value="Free For All">Free For All</option>
                                                        <option value="Team Battle">Team Battle</option>
                                                        <option value="Survival Mode">Survival Mode</option>
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-slate-400 block font-normal text-[10px] mb-1">Difficulty</label>
                                                        <select
                                                            value={difficulty}
                                                            onChange={(e) => setDifficulty(e.target.value)}
                                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 font-bold"
                                                        >
                                                            <option value="Easy">Easy</option>
                                                            <option value="Medium">Medium</option>
                                                            <option value="Hard">Hard</option>
                                                            <option value="Expert">Expert</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-slate-400 block font-normal text-[10px] mb-1">Round Limit</label>
                                                        <select
                                                            value={roundLimit}
                                                            onChange={(e) => setRoundLimit(Number(e.target.value))}
                                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 font-bold"
                                                        >
                                                            <option value={1}>1 Round</option>
                                                            <option value={3}>3 Rounds</option>
                                                            <option value={5}>5 Rounds</option>
                                                            <option value={10}>10 Rounds</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-slate-400 block font-normal text-[10px] mb-1">Join Visibility</label>
                                                    <select
                                                        value={privacy}
                                                        onChange={(e) => setPrivacy(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500 font-bold"
                                                    >
                                                        <option value="Private">Private</option>
                                                        <option value="Public">Public</option>
                                                    </select>
                                                </div>
                                                
                                                <div className="flex gap-2 mt-4 pt-2 border-t border-slate-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            sendGameAction({
                                                                type: "settings_update",
                                                                map,
                                                                mode,
                                                                difficulty,
                                                                roundLimit,
                                                                privacy,
                                                                selectedGameId
                                                            });
                                                            setIsEditingSettings(false);
                                                        }}
                                                        className="flex-1 bg-violet-650 hover:bg-violet-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition cursor-pointer"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsEditingSettings(false)}
                                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl transition cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-4">
                                                    {/* key-value rows in a grid */}
                                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold text-slate-800">
                                                        <div>
                                                            <span className="text-slate-400 block font-normal text-[10px] mb-0.5">Card</span>
                                                            <span className="truncate block max-w-full font-bold">Host: {hostName}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block font-normal text-[10px] mb-0.5">Map</span>
                                                            <span className="font-bold">{map}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block font-normal text-[10px] mb-0.5">Mode</span>
                                                            <span className="font-bold">{mode}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block font-normal text-[10px] mb-0.5">Join</span>
                                                            <span className="font-bold">{privacy}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block font-normal text-[10px] mb-0.5">Difficulty</span>
                                                            <span className="font-bold">{difficulty}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 block font-normal text-[10px] mb-0.5">Round Limit</span>
                                                            <span className="font-bold">{roundLimit}</span>
                                                        </div>
                                                    </div>

                                                    {/* Bots Control panel inside Settings */}
                                                    {effectiveIsHost && (
                                                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                                                            <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase font-mono">Bots ({displayPlayers.filter(p => p.isBot || p.username.startsWith("Bot_") || p.username.startsWith("Computer Bot")).length})</span>
                                                            <div className="flex gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={addBot}
                                                                    className="text-[9px] font-black px-3 py-1 bg-violet-50 hover:bg-violet-100 text-violet-605 rounded-lg border border-violet-200/50 transition cursor-pointer"
                                                                >
                                                                    + Add
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={removeBot}
                                                                    className="text-[9px] font-black px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-550 rounded-lg border border-slate-200/50 transition cursor-pointer"
                                                                >
                                                                    - Kick
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                                                    {effectiveIsHost ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsEditingSettings(true)}
                                                            className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 transition-all text-center cursor-pointer"
                                                        >
                                                            Edit Settings
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={handleInvitePlayers}
                                                            className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 transition-all text-center cursor-pointer"
                                                        >
                                                            {invited ? "Link Copied!" : "Invite Friends"}
                                                        </button>
                                                    )}
                                                    <Link
                                                        to="/dashboard"
                                                        className="bg-rose-50 hover:bg-rose-100 text-rose-605 font-bold text-xs py-2.5 px-4 rounded-xl border border-rose-100 transition-all text-center inline-flex items-center justify-center cursor-pointer"
                                                    >
                                                        Leave
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Lobby Chat box */}
                                <div className="flex flex-col text-left">
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        <span className="text-[10px] font-black tracking-wider text-slate-800 uppercase font-mono">LOBBY CHAT</span>
                                    </div>

                                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs flex flex-col justify-between h-[390px] min-h-[390px] max-h-[390px] w-full max-w-full overflow-hidden">
                                        
                                        {/* Subheader online players list */}
                                        <div className="border-b border-slate-100 pb-2.5 mb-2.5 text-left">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-relaxed">
                                                {displayPlayers.length} Players Online: <span className="text-slate-700 font-bold">{displayPlayers.map(p => p.username).join(', ')}</span>
                                            </p>
                                        </div>

                                        {/* Messages list area */}
                                        <div className="h-[230px] max-h-[230px] overflow-y-auto space-y-3 pr-1 mb-2 lobby-chat-messages text-left w-full max-w-full">
                                            {chatMessages.length === 0 ? (
                                                <p className="text-slate-400 text-[10px] font-semibold italic text-center mt-8">Lobby chat is active. Say hello!</p>
                                            ) : (
                                                chatMessages.map((msg, idx) => {
                                                    const msgTime = msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                    if (msg.isSystem) {
                                                        return (
                                                            <div key={idx} className="my-1.5 text-[10px] text-slate-400 font-semibold italic pl-1">
                                                                [{msgTime}] [System]: {msg.message}
                                                            </div>
                                                        );
                                                    }

                                                    const isSelf = msg.username === username;
                                                    return (
                                                        <div key={idx} className="flex gap-2.5 items-start">
                                                            <div className={`w-7 h-7 rounded-full flex-shrink-0 ${getAvatarColorClass(msg.username)} flex items-center justify-center text-white font-black text-[9px] shadow-sm`}>
                                                                {msg.username.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-baseline gap-1.5">
                                                                    <span className="text-[8px] font-bold text-slate-400 font-mono">
                                                                        [{msgTime}]
                                                                    </span>
                                                                    <span className={`text-[10px] font-black truncate ${isSelf ? 'text-violet-600' : 'text-slate-700'}`}>
                                                                        {msg.username}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-slate-600 font-semibold leading-relaxed mt-0.5 break-words">
                                                                    {msg.message}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>

                                        {/* Input form */}
                                        <form onSubmit={handleSendChatMessage} className="flex gap-2 items-center">
                                            <div className="relative flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Type your message..."
                                                    value={chatInput}
                                                    onChange={(e) => setChatInput(e.target.value)}
                                                    maxLength={150}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-4 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none transition shadow-2xs"
                                                />
                                                <span 
                                                    className="absolute right-3 top-2.5 text-slate-400 text-xs cursor-pointer select-none hover:scale-110 active:scale-95 transition"
                                                    onClick={() => setChatInput(prev => prev + " 😊")}
                                                >
                                                    😊
                                                </span>
                                            </div>
                                            <button
                                                type="submit"
                                                className="bg-violet-500 hover:bg-violet-600 text-white p-2.5 rounded-full transition cursor-pointer shadow-md flex items-center justify-center w-9 h-9 flex-shrink-0 active:scale-95"
                                            >
                                                <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                                                </svg>
                                            </button>
                                        </form>

                                    </div>
                                </div>

                            </div>

                        </div>

                        {/* Features Footer Section */}
                        <div className="border-t border-slate-100 pt-6 pb-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="flex items-start gap-3 text-left">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0 shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-800">Fair Play</h4>
                                        <p className="text-[10px] font-semibold text-slate-400 leading-normal mt-0.5">All games are fair and unbiased</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3 text-left">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0 shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-800">Real-time</h4>
                                        <p className="text-[10px] font-semibold text-slate-400 leading-normal mt-0.5">Live multiplayer experience</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3 text-left">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0 shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-800">Secure</h4>
                                        <p className="text-[10px] font-semibold text-slate-400 leading-normal mt-0.5">Your data is protected</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3 text-left">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0 shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-800">Cross Platform</h4>
                                        <p className="text-[10px] font-semibold text-slate-400 leading-normal mt-0.5">Play on any device</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
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
