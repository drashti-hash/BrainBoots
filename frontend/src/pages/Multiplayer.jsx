import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

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

const IconStats = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IconFriends = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;

const sectionTone = {
    "Memory & Retention": { label: "bg-[#ede9ff] text-[#5b21b6]", art: "#eeeaff", accent: "#7c6aff", soft: "#c4b5fd" },
    "Reflex & Speed": { label: "bg-[#fef3c7] text-[#92400e]", art: "#fff9e6", accent: "#f59e0b", soft: "#fde68a" },
    "Perception & Focus": { label: "bg-[#dcfce7] text-[#065f46]", art: "#e8fdf0", accent: "#22c55e", soft: "#bbf7d0" },
    "Logic & Problem Solving": { label: "bg-[#e0f2fe] text-[#0c4a6e]", art: "#e8f5fe", accent: "#3b82f6", soft: "#bfdbfe" },
    "Funny & Playful": { label: "bg-[#fdf4ff] text-[#86198f]", art: "#fdf2ff", accent: "#c026d3", soft: "#f0abfc" },
};

const gameIndividualTone = {
    memory: { art: "#eeeaff", accent: "#7c6aff", soft: "#c4b5fd" },
    simon: { art: "#fdf2ff", accent: "#c026d3", soft: "#f0abfc" },
    numbers: { art: "#eff6ff", accent: "#3b82f6", soft: "#bfdbfe" },
    nback: { art: "#f0fdf4", accent: "#10b981", soft: "#bbf7d0" },
    memoryrace: { art: "#fffbeb", accent: "#f59e0b", soft: "#fde68a" },
    reaction: { art: "#fffdeb", accent: "#f59e0b", soft: "#fde68a" },
    aim: { art: "#fff5f5", accent: "#ef4444", soft: "#fecdd3" },
    typing: { art: "#eff6ff", accent: "#3b82f6", soft: "#bfdbfe" },
    speedmath: { art: "#f0fdf4", accent: "#10b981", soft: "#bbf7d0" },
    trafficcontrol: { art: "#f5f3ff", accent: "#6366f1", soft: "#c7d2fe" },
    stroop: { art: "#fdf2ff", accent: "#c026d3", soft: "#f0abfc" },
    oddcolor: { art: "#faf5ff", accent: "#a855f7", soft: "#e9d5ff" },
    focusgrid: { art: "#f0f9ff", accent: "#0284c7", stroke: "#bae6fd" },
    schulte: { art: "#f0fdf4", accent: "#10b981", soft: "#bbf7d0" },
    wordguess: { art: "#fefdf0", accent: "#eab308", soft: "#fef08a" },
    sudoku: { art: "#eff6ff", accent: "#3b82f6", soft: "#bfdbfe" },
    lightsout: { art: "#f0f9ff", accent: "#3b82f6", soft: "#93c5fd" },
    slidingtile: { art: "#eff6ff", accent: "#3b82f6", soft: "#bfdbfe" },
    hanoi: { art: "#eff6ff", accent: "#3b82f6", soft: "#bfdbfe" },
    wronganswers: { art: "#fff1f2", accent: "#ec4899", soft: "#fecdd3" },
    hotpotato: { art: "#fff7ed", accent: "#f97316", soft: "#fed7aa" },
};

const GAME_EMOJIS = {
    memory: "🧠", simon: "🔁", numbers: "🔢", nback: "⏮️", memoryrace: "🏁",
    reaction: "⚡", aim: "🎯", typing: "⌨️", speedmath: "🧮", trafficcontrol: "🚦",
    stroop: "🎨", oddcolor: "👁️", focusgrid: "🔍", schulte: "🔲",
    sudoku: "🧩", wordguess: "📝", lightsout: "💡", slidingtile: "🔢", hanoi: "🗼",
    wronganswers: "😜", hotpotato: "🥔"
};

const GameIllustration = memo(function GameIllustration({ gameId, sectionTitle }) {
    if (gameId === "memory") {
        return <img src="/rec_memory.png" alt="Memory Match" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
    }
    if (gameId === "reaction") {
        return <img src="/rec_reaction.png" alt="Reaction Test" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
    }
    if (gameId === "aim") {
        return <img src="/rec_focus.png" alt="Aim Trainer" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
    }
    const tone = gameIndividualTone[gameId] || sectionTone[sectionTitle] || sectionTone["Memory & Retention"];
    const emoji = GAME_EMOJIS[gameId] || "🎮";
    const accentColor = tone.accent || "#7c6aff";
    const softColor = tone.soft || tone.stroke || "#c4b5fd";
    const bgColor = tone.art || "#eeeaff";

    const renderBaseSVG = (content) => (
        <svg className="h-full w-full" viewBox="0 0 160 90" fill="none" preserveAspectRatio="xMidYMid slice" style={{ overflow: "hidden" }}>
            <defs>
                <radialGradient id={`sphere-grad-${gameId}`} cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="30%" stopColor={softColor} stopOpacity="0.75" />
                    <stop offset="75%" stopColor={accentColor} stopOpacity="0.85" />
                    <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
                </radialGradient>
                <radialGradient id={`bg-spot-${gameId}`} cx="50%" cy="40%" r="75%">
                    <stop offset="0%" stopColor={softColor} />
                    <stop offset="100%" stopColor={accentColor} />
                </radialGradient>
                <linearGradient id={`star-grad-${gameId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffe066" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <filter id={`shadow-3d-${gameId}`} x="-20%" y="-20%" width="150%" height="150%">
                    <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.12" />
                </filter>
                <filter id={`glow-3d-${gameId}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <rect width="160" height="90" fill={`url(#bg-spot-${gameId})`} />
            <path d="M-10,45 C30,20 60,70 100,35 C130,15 150,55 180,30" stroke="white" strokeWidth="5" opacity="0.18" strokeLinecap="round" fill="none" />
            <path d="M-20,60 C20,35 50,85 90,50 C120,30 140,70 170,45" stroke="white" strokeWidth="3.5" opacity="0.12" strokeLinecap="round" fill="none" />
            <path d="M22,12 L24,15 L27,16 L24,17 L22,20 L20,17 L17,16 L20,15 Z" fill={`url(#star-grad-${gameId})`} opacity="0.85" filter={`url(#shadow-3d-${gameId})`} />
            <path d="M136,18 L138,20 L141,21 L138,22 L136,24 L134,22 L131,21 L134,20 Z" fill="white" opacity="0.95" filter={`url(#shadow-3d-${gameId})`} />
            <path d="M26,62 L27.5,64 L29.5,65 L27.5,66 L26,68 L24.5,66 L22.5,65 L24.5,64 Z" fill="white" opacity="0.8" />
            <path d="M132,60 L133.5,62 L135.5,63 L133.5,64 L132,66 L130.5,64 L128.5,63 L130.5,62 Z" fill={`url(#star-grad-${gameId})`} opacity="0.85" filter={`url(#shadow-3d-${gameId})`} stroke="none" />
            {content}
        </svg>
    );

    switch (gameId) {
        case "simon":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="20" ry="4" fill="#0f172a" opacity="0.1" />
                    <circle cx="80" cy="45" r="23" fill="#1e293b" />
                    <circle cx="80" cy="45" r="21.5" fill="none" stroke="white" strokeWidth="0.8" opacity="0.15" />
                    <path d="M80,45 L58.5,45 A21.5,21.5 0 0,1 80,23.5 Z" fill="url(#simon-green)" />
                    <path d="M80,45 L80,23.5 A21.5,21.5 0 0,1 101.5,45 Z" fill="url(#simon-red)" />
                    <path d="M80,45 L58.5,45 A21.5,21.5 0 0,0 80,66.5 Z" fill="url(#simon-yellow)" />
                    <path d="M80,45 L80,66.5 A21.5,21.5 0 0,0 101.5,45 Z" fill="url(#simon-blue)" />
                    <circle cx="80" cy="45" r="7" fill="#0f172a" />
                    <circle cx="80" cy="45" r="5" fill="#f8fafc" opacity="0.9" />
                    <defs>
                        <radialGradient id="simon-green" cx="70%" cy="70%" r="70%">
                            <stop offset="0%" stopColor="#4ade80" /><stop offset="100%" stopColor="#15803d" />
                        </radialGradient>
                        <radialGradient id="simon-red" cx="30%" cy="70%" r="70%">
                            <stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#b91c1c" />
                        </radialGradient>
                        <radialGradient id="simon-yellow" cx="70%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#facc15" /><stop offset="100%" stopColor="#a16207" />
                        </radialGradient>
                        <radialGradient id="simon-blue" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#1d4ed8" />
                        </radialGradient>
                    </defs>
                </g>
            );
        case "numbers":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="26" ry="5" fill="#0f172a" opacity="0.08" />
                    <g transform="translate(48, 42)">
                        <rect x="0" y="0" width="16" height="24" rx="3" fill="#3b82f6" />
                        <rect x="0" y="0" width="16" height="6" rx="2" fill="#60a5fa" />
                        <text x="8" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="900">1</text>
                    </g>
                    <g transform="translate(72, 30)">
                        <rect x="0" y="0" width="16" height="24" rx="3" fill="#8b5cf6" />
                        <rect x="0" y="0" width="16" height="6" rx="2" fill="#a78bfa" />
                        <text x="8" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="900">2</text>
                    </g>
                    <g transform="translate(96, 46)">
                        <rect x="0" y="0" width="16" height="24" rx="3" fill="#ec4899" />
                        <rect x="0" y="0" width="16" height="6" rx="2" fill="#f472b6" />
                        <text x="8" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="900">3</text>
                    </g>
                </g>
            );
        case "nback":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="22" ry="4" fill="#0f172a" opacity="0.08" />
                    <rect x="58" y="24" width="44" height="38" rx="6" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                    <rect x="62" y="28" width="36" height="30" rx="4" fill="#f0fdf4" />
                    <path d="M86,40 C86,34 74,34 74,42 C74,48 86,48 86,44" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                    <polygon points="82,46 87,43 85,49" fill="#10b981" />
                    <text x="80" y="58" textAnchor="middle" fontSize="10">🧠</text>
                </g>
            );
        case "memoryrace":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <path d="M40,70 L60,35 L100,35 L120,70 Z" fill="#475569" />
                    <path d="M80,70 L80,35" stroke="#facc15" strokeWidth="2.5" strokeDasharray="4 3" />
                    <g transform="translate(62, 18)">
                        <line x1="0" y1="0" x2="0" y2="30" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="0" cy="0" r="2" fill="#f59e0b" />
                        <rect x="0.5" y="2" width="22" height="14" fill="white" stroke="#1e293b" strokeWidth="1" />
                        <rect x="0.5" y="2" width="5.5" height="4.6" fill="#1e293b" />
                        <rect x="11.5" y="2" width="5.5" height="4.6" fill="#1e293b" />
                        <rect x="6" y="6.6" width="5.5" height="4.6" fill="#1e293b" />
                        <rect x="17" y="6.6" width="5.5" height="4.6" fill="#1e293b" />
                        <rect x="0.5" y="11.2" width="5.5" height="4.8" fill="#1e293b" />
                        <rect x="11.5" y="11.2" width="5.5" height="4.8" fill="#1e293b" />
                    </g>
                </g>
            );
        case "typing":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`} transform="rotate(-5, 80, 45)">
                    <ellipse cx="80" cy="74" rx="30" ry="5" fill="#0f172a" opacity="0.08" />
                    <rect x="42" y="26" width="76" height="34" rx="4" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
                    <rect x="44" y="28" width="72" height="30" rx="3" fill="#475569" />
                    <g fill="#f8fafc">
                        <rect x="47" y="31" width="6" height="5" rx="1" />
                        <rect x="55" y="31" width="6" height="5" rx="1" />
                        <rect x="63" y="31" width="6" height="5" rx="1" />
                        <rect x="71" y="31" width="6" height="5" rx="1" fill="#3b82f6" />
                        <rect x="79" y="31" width="6" height="5" rx="1" />
                        <rect x="87" y="31" width="6" height="5" rx="1" />
                        <rect x="95" y="31" width="6" height="5" rx="1" />
                        <rect x="103" y="31" width="10" height="5" rx="1" fill="#1e293b" />
                        <rect x="47" y="38" width="8" height="5" rx="1" fill="#1e293b" />
                        <rect x="57" y="38" width="6" height="5" rx="1" />
                        <rect x="65" y="38" width="6" height="5" rx="1" />
                        <rect x="73" y="38" width="6" height="5" rx="1" />
                        <rect x="81" y="38" width="6" height="5" rx="1" fill="#3b82f6" />
                        <rect x="89" y="38" width="6" height="5" rx="1" />
                        <rect x="97" y="38" width="6" height="5" rx="1" />
                        <rect x="105" y="38" width="8" height="5" rx="1" />
                        <rect x="47" y="45" width="10" height="5" rx="1" />
                        <rect x="59" y="45" width="8" height="5" rx="1" />
                        <rect x="69" y="45" width="26" height="5" rx="1.5" fill="#e2e8f0" />
                        <rect x="97" y="45" width="8" height="5" rx="1" />
                        <rect x="107" y="45" width="6" height="5" rx="1" />
                    </g>
                    <g transform="translate(74, 12)" filter={`url(#shadow-3d-${gameId})`}>
                        <circle cx="6" cy="6" r="8" fill="#3b82f6" />
                        <text x="6" y="10" textAnchor="middle" fill="white" fontSize="10" fontWeight="950">A</text>
                    </g>
                </g>
            );
        case "speedmath":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="26" ry="4.5" fill="#0f172a" opacity="0.08" />
                    <g transform="translate(46, 28) rotate(-10)">
                        <rect x="0" y="0" width="22" height="22" rx="5" fill="#10b981" />
                        <path d="M11,5 L11,17 M5,11 L17,11" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                    </g>
                    <g transform="translate(70, 42) rotate(15)">
                        <rect x="0" y="0" width="20" height="20" rx="4" fill="#f97316" />
                        <path d="M6,6 L14,14 M14,6 L6,14" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </g>
                    <g transform="translate(94, 24) rotate(-5)">
                        <rect x="0" y="0" width="22" height="22" rx="5" fill="#3b82f6" />
                        <path d="M6,8 L16,8 M6,14 L16,14" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                    </g>
                </g>
            );
        case "trafficcontrol":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="14" ry="3.5" fill="#0f172a" opacity="0.1" />
                    <rect x="78" y="52" width="4" height="24" fill="#475569" />
                    <rect x="70" y="16" width="20" height="38" rx="5" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                    <circle cx="80" cy="23" r="4.5" fill="#ef4444" filter={`url(#glow-3d-${gameId})`} stroke="none" />
                    <circle cx="79" cy="22" r="1.5" fill="white" opacity="0.6" />
                    <circle cx="80" cy="35" r="4.5" fill="#eab308" opacity="0.3" />
                    <circle cx="80" cy="47" r="4.5" fill="#22c55e" opacity="0.3" />
                </g>
            );
        case "stroop":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="26" ry="5" fill="#0f172a" opacity="0.08" />
                    <path d="M54,58 C44,52 42,32 58,24 C72,17 96,20 106,32 C114,42 108,60 92,62 C82,63 76,55 70,55 C64,55 60,62 54,58 Z" fill="#f5e0c3" />
                    <circle cx="62" cy="32" r="4" fill={bgColor} />
                    <circle cx="76" cy="26" r="3.5" fill="#ef4444" />
                    <circle cx="90" cy="30" r="3.5" fill="#3b82f6" />
                    <circle cx="98" cy="42" r="3.5" fill="#10b981" />
                    <circle cx="88" cy="52" r="3.5" fill="#eab308" />
                    <g transform="translate(56, 16) rotate(-40)">
                        <rect x="0" y="0" width="3" height="42" rx="1.5" fill="#78350f" />
                        <rect x="0" y="36" width="3" height="6" fill="#94a3b8" />
                        <path d="M-0.5,42 C-0.5,45 3.5,45 3.5,42 Z" fill="#3b82f6" />
                    </g>
                </g>
            );
        case "oddcolor":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="24" ry="4" fill="#0f172a" opacity="0.08" />
                    <rect x="52" y="24" width="14" height="12" rx="2" fill="#a855f7" />
                    <rect x="52" y="40" width="14" height="12" rx="2" fill="#a855f7" />
                    <rect x="52" y="56" width="14" height="12" rx="2" fill="#a855f7" />
                    <rect x="73" y="24" width="14" height="12" rx="2" fill="#a855f7" />
                    <rect x="73" y="40" width="14" height="12" rx="2" fill="#eab308" stroke="#facc15" strokeWidth="1.5" filter={`url(#glow-3d-${gameId})`} />
                    <rect x="73" y="56" width="14" height="12" rx="2" fill="#a855f7" />
                    <rect x="94" y="24" width="14" height="12" rx="2" fill="#a855f7" />
                    <rect x="94" y="40" width="14" height="12" rx="2" fill="#a855f7" />
                    <rect x="94" y="56" width="14" height="12" rx="2" fill="#a855f7" />
                </g>
            );
        case "focusgrid":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <rect x="48" y="22" width="64" height="46" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                    <g stroke="#f1f5f9" strokeWidth="1">
                        <line x1="64" y1="22" x2="64" y2="68" />
                        <line x1="80" y1="22" x2="80" y2="68" />
                        <line x1="96" y1="22" x2="96" y2="68" />
                        <line x1="48" y1="37" x2="112" y2="37" />
                        <line x1="48" y1="52" x2="112" y2="52" />
                    </g>
                    <g transform="translate(68, 25)">
                        <line x1="22" y1="22" x2="36" y2="36" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
                        <line x1="22" y1="22" x2="36" y2="36" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="12" cy="12" r="12" fill="#bae6fd" fillOpacity="0.4" stroke="#475569" strokeWidth="2" />
                        <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1" opacity="0.6" />
                        <path d="M5,6 A7,7 0 0,1 15,6" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" fill="none" />
                        <circle cx="12" cy="12" r="2.5" fill="#e11d48" />
                    </g>
                </g>
            );
        case "schulte":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`} transform="rotate(3, 80, 45)">
                    <ellipse cx="80" cy="74" rx="24" ry="4" fill="#0f172a" opacity="0.08" />
                    <rect x="52" y="20" width="56" height="50" rx="6" fill="#10b981" />
                    <rect x="55" y="23" width="50" height="44" rx="4" fill="white" />
                    <g fill="#10b981" fontSize="9" fontWeight="900" textAnchor="middle">
                        <text x="63" y="34">7</text><text x="80" y="34">1</text><text x="97" y="34">9</text>
                        <text x="63" y="48">4</text><text x="80" y="48" fill="#eab308">5</text><text x="97" y="48">2</text>
                        <text x="63" y="62">8</text><text x="80" y="62">6</text><text x="97" y="62">3</text>
                    </g>
                </g>
            );
        case "sudoku":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="22" ry="4.5" fill="#0f172a" opacity="0.08" />
                    <rect x="53" y="20" width="54" height="50" rx="5" fill="#3b82f6" />
                    <rect x="56" y="23" width="48" height="44" rx="3" fill="white" />
                    <line x1="80" y1="23" x2="80" y2="67" stroke="#3b82f6" strokeWidth="1.5" />
                    <line x1="68" y1="23" x2="68" y2="67" stroke="#bfdbfe" strokeWidth="0.8" />
                    <line x1="92" y1="23" x2="92" y2="67" stroke="#bfdbfe" strokeWidth="0.8" />
                    <line x1="56" y1="45" x2="104" y2="45" stroke="#3b82f6" strokeWidth="1.5" />
                    <line x1="56" y1="34" x2="104" y2="34" stroke="#bfdbfe" strokeWidth="0.8" />
                    <line x1="56" y1="56" x2="104" y2="56" stroke="#bfdbfe" strokeWidth="0.8" />
                    <g fill="#1e293b" fontSize="8" fontWeight="800" textAnchor="middle">
                        <text x="62" y="31">1</text><text x="86" y="31" fill="#3b82f6">3</text>
                        <text x="74" y="42" fill="#3b82f6">4</text><text x="98" y="42">2</text>
                        <text x="62" y="53">2</text><text x="86" y="53">1</text>
                        <text x="74" y="64">3</text><text x="98" y="64" fill="#3b82f6">4</text>
                    </g>
                </g>
            );
        case "wordguess":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="26" ry="4" fill="#0f172a" opacity="0.08" />
                    <g transform="translate(45, 30) rotate(-8)">
                        <rect x="0" y="0" width="22" height="22" rx="4" fill="#eab308" />
                        <rect x="1.5" y="1.5" width="19" height="19" rx="3" fill="#fef08a" />
                        <text x="11" y="15" textAnchor="middle" fill="#854d0e" fontSize="12" fontWeight="950">W</text>
                    </g>
                    <g transform="translate(69, 26) rotate(5)">
                        <rect x="0" y="0" width="22" height="22" rx="4" fill="#eab308" />
                        <rect x="1.5" y="1.5" width="19" height="19" rx="3" fill="#fef08a" />
                        <text x="11" y="15" textAnchor="middle" fill="#854d0e" fontSize="12" fontWeight="950">O</text>
                    </g>
                    <g transform="translate(93, 32) rotate(-3)">
                        <rect x="0" y="0" width="22" height="22" rx="4" fill="#eab308" />
                        <rect x="1.5" y="1.5" width="19" height="19" rx="3" fill="#fef08a" />
                        <text x="11" y="15" textAnchor="middle" fill="#854d0e" fontSize="12" fontWeight="950">R</text>
                    </g>
                </g>
            );
        case "lightsout":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="20" ry="4.5" fill="#0f172a" opacity="0.1" />
                    <g stroke="#fef08a" strokeWidth="2" strokeLinecap="round" opacity="0.6" filter={`url(#glow-3d-${gameId})`}>
                        <line x1="80" y1="14" x2="80" y2="8" />
                        <line x1="60" y1="24" x2="55" y2="20" />
                        <line x1="100" y1="24" x2="105" y2="20" />
                        <line x1="52" y1="40" x2="46" y2="40" />
                        <line x1="108" y1="40" x2="114" y2="40" />
                    </g>
                    <path d="M70,40 C70,28 90,28 90,40 C90,46 85,50 85,55 L75,55 C75,50 70,46 70,40 Z" fill="#facc15" stroke="#eab308" strokeWidth="1" filter={`url(#glow-3d-${gameId})`} />
                    <rect x="76" y="55" width="8" height="4" fill="#94a3b8" rx="1" />
                    <rect x="77" y="59" width="6" height="3" fill="#64748b" rx="1" />
                    <path d="M77,44 L79,35 L81,35 L83,44" stroke="#eab308" strokeWidth="1.2" fill="none" opacity="0.8" />
                </g>
            );
        case "slidingtile":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="22" ry="4" fill="#0f172a" opacity="0.08" />
                    <rect x="52" y="20" width="56" height="50" rx="4" fill="#854d0e" stroke="#451a03" strokeWidth="1.5" />
                    <rect x="55" y="23" width="50" height="44" rx="2" fill="#1e293b" />
                    <g fill="#f8fafc">
                        <rect x="57" y="25" width="14" height="12" rx="1" fill="#bfdbfe" />
                        <text x="64" y="34" textAnchor="middle" fill="#1e3a8a" fontSize="9" fontWeight="900">1</text>
                        <rect x="73" y="25" width="14" height="12" rx="1" fill="#bfdbfe" />
                        <text x="80" y="34" textAnchor="middle" fill="#1e3a8a" fontSize="9" fontWeight="900">2</text>
                        <rect x="89" y="25" width="14" height="12" rx="1" fill="#bfdbfe" />
                        <text x="96" y="34" textAnchor="middle" fill="#1e3a8a" fontSize="9" fontWeight="900">3</text>
                        <rect x="57" y="39" width="14" height="12" rx="1" fill="#bfdbfe" />
                        <text x="64" y="48" textAnchor="middle" fill="#1e3a8a" fontSize="9" fontWeight="900">4</text>
                        <rect x="89" y="39" width="14" height="12" rx="1" fill="#bfdbfe" />
                        <text x="96" y="48" textAnchor="middle" fill="#1e3a8a" fontSize="9" fontWeight="900">5</text>
                        <rect x="57" y="53" width="14" height="12" rx="1" fill="#bfdbfe" />
                        <text x="64" y="62" textAnchor="middle" fill="#1e3a8a" fontSize="9" fontWeight="900">6</text>
                        <rect x="73" y="53" width="14" height="12" rx="1" fill="#bfdbfe" />
                        <text x="80" y="62" textAnchor="middle" fill="#1e3a8a" fontSize="9" fontWeight="900">7</text>
                        <rect x="89" y="53" width="14" height="12" rx="1" fill="#bfdbfe" />
                        <text x="96" y="62" textAnchor="middle" fill="#1e3a8a" fontSize="9" fontWeight="900">8</text>
                    </g>
                </g>
            );
        case "hanoi":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="28" ry="4.5" fill="#0f172a" opacity="0.1" />
                    <rect x="44" y="62" width="72" height="6" rx="2" fill="#7c2d12" stroke="#431407" strokeWidth="1" />
                    <rect x="55" y="30" width="3.5" height="32" rx="1" fill="#9a3412" />
                    <rect x="80" y="30" width="3.5" height="32" rx="1" fill="#9a3412" />
                    <rect x="105" y="30" width="3.5" height="32" rx="1" fill="#9a3412" />
                    <rect x="68" y="56" width="27.5" height="6" rx="2" fill="#e11d48" />
                    <rect x="71" y="50" width="21.5" height="6" rx="2" fill="#f97316" />
                    <rect x="74" y="44" width="15.5" height="6" rx="2" fill="#3b82f6" />
                </g>
            );
        case "wronganswers":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="22" ry="4.5" fill="#0f172a" opacity="0.08" />
                    <circle cx="80" cy="45" r="23" fill="url(#smiley-grad)" />
                    <circle cx="72" cy="37" r="4.5" fill="white" opacity="0.45" />
                    <circle cx="70" cy="35" r="2" fill="white" opacity="0.6" />
                    <path d="M66,40 L72,40" stroke="#701a75" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="90" cy="39" r="3" fill="#701a75" />
                    <circle cx="89" cy="38" r="1" fill="white" />
                    <path d="M68,48 Q80,56 92,48" stroke="#701a75" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M76,51 C76,56 84,56 84,51 Z" fill="#ec4899" />
                    <defs>
                        <radialGradient id="smiley-grad" cx="35%" cy="35%" r="65%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="60%" stopColor="#facc15" />
                            <stop offset="100%" stopColor="#d97706" />
                        </radialGradient>
                    </defs>
                </g>
            );
        case "hotpotato":
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="24" ry="5" fill="#0f172a" opacity="0.1" />
                    <path d="M58,54 C54,42 66,26 68,18 C70,30 76,28 80,22 C84,30 88,28 92,18 C94,28 106,42 102,54 Z" fill="url(#flame-grad)" opacity="0.85" filter={`url(#glow-3d-${gameId})`} />
                    <path d="M62,48 C62,38 70,34 80,34 C90,34 98,38 98,48 C98,58 90,62 80,62 C70,62 62,58 62,48 Z" fill="#b45309" stroke="#78350f" strokeWidth="1" />
                    <path d="M68,42 C68,39 74,38 80,38" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" fill="none" />
                    <circle cx="74" cy="46" r="1.5" fill="white" />
                    <circle cx="86" cy="46" r="1.5" fill="white" />
                    <path d="M78,52 Q80,54 82,52" stroke="white" strokeWidth="1" fill="none" />
                    <defs>
                        <linearGradient id="flame-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#ea580c" />
                            <stop offset="50%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </g>
            );
        default:
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="22" ry="4.5" fill="#0f172a" opacity="0.08" />
                    <circle cx="80" cy="45" r="23" fill={`url(#sphere-grad-${gameId})`} />
                    <circle cx="72" cy="37" r="4.5" fill="white" opacity="0.45" />
                    <circle cx="70" cy="35" r="2" fill="white" opacity="0.6" />
                    <text x="80" y="54.5" textAnchor="middle" fontSize="27" className="notranslate" translate="no" style={{ userSelect: "none" }}>{emoji}</text>
                </g>
            );
    }
});

const getGameStats = (gameId, highScores = []) => {
    const record = highScores.find(h => {
        const tl = (h.table || "").toLowerCase(), gl = (h.game || "").toLowerCase(), id = gameId.toLowerCase();
        if (id === "wronganswers" && (tl.includes("wrong_answer") || gl.includes("wrong answer"))) return true;
        if (id === "hotpotato" && (tl.includes("hot_potato") || gl.includes("hot potato"))) return true;
        if (id === "speedmath" && (tl.includes("speed_math") || gl.includes("speed math"))) return true;
        if (id === "trafficcontrol" && (tl.includes("traffic_control") || gl.includes("traffic control"))) return true;
        if (id === "oddcolor" && (tl.includes("odd_color") || gl.includes("odd color"))) return true;
        if (id === "focusgrid" && (tl.includes("focus_grid") || gl.includes("focus grid"))) return true;
        if (id === "wordguess" && (tl.includes("word_guess") || gl.includes("word guess"))) return true;
        if (id === "lightsout" && (tl.includes("lights_out") || gl.includes("lights out"))) return true;
        if (id === "slidingtile" && (tl.includes("sliding_tile") || gl.includes("sliding tile"))) return true;
        if (id === "memoryrace" && (tl.includes("memory_race") || gl.includes("memory race"))) return true;
        return tl.startsWith(id) || tl.includes(id) || gl.startsWith(id) || id.startsWith(tl);
    });
    return record || { plays: 0, bestScore: 0 };
};

const getDynamicGameBadge = (gameId, highScores = []) => {
    const stats = getGameStats(gameId, highScores);
    const plays = stats.plays;
    if (plays > 15) return { label: "HOT", className: "bg-[#ff6b6b] text-white" };
    if (plays === 0) {
        let hash = 0;
        for (let i = 0; i < gameId.length; i++) hash = gameId.charCodeAt(i) + ((hash << 5) - hash);
        if (Math.abs(hash) % 5 === 0) return { label: "NEW", className: "bg-[#10b981] text-white" };
        if (Math.abs(hash) % 7 === 0) return { label: "BRAIN", className: "bg-[#7c6aff] text-white" };
        return null;
    }
    if (plays <= 5) return { label: "TRIAL", className: "bg-[#3b82f6] text-white" };
    if (plays <= 15) return { label: "PRO", className: "bg-[#fb923c] text-white" };
    return null;
};

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
        { label: "Lobby", icon: <IconRooms />, active: true },
        { label: "Profile", icon: <IconProfile />, to: "/dashboard" },
        { label: "Stats", icon: <IconStats />, to: "/dashboard" },
        { label: "Friends", icon: <IconFriends />, to: "/dashboard" },
        { label: "Leaderboard", icon: <IconLeaderboard />, to: "/dashboard" },
        { label: "Settings", icon: <IconSettings />, to: "/dashboard" },
    ];

    const { roomCode } = useParams();

    const handleInviteClick = () => {
        const inviteUrl = roomCode 
            ? window.location.origin + `/multiplayer/${roomCode}`
            : window.location.origin + `/register`;
        navigator.clipboard.writeText(inviteUrl);
        toast.success("Invite link copied to clipboard!");
    };

    // Calculate dynamic XP progress based on user level
    const storedStats = readStoredJson("brainbootsStats", {});
    const totalScore = storedStats.totalScore || 5005;
    const currentXP = totalScore % 1000;
    const maxXP = 1000;
    const xpPercentage = (currentXP / maxXP) * 100;

    return (
        <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "240px", minWidth: "240px", background: "white", borderRight: "1px solid #f0edff", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "24px 16px", zIndex: 45, overflowY: "auto" }} className="scrollbar-hide">
            
            {/* Branding Logo */}
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: 8, marginBottom: 28 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "#7c6aff", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 4px 12px rgba(124,106,255,0.25)" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>
                    </div>
                    <div>
                        <p style={{ fontSize: 15, fontWeight: 900, color: "#1e1b4b", lineHeight: 1, margin: 0 }}>BrainBoot</p>
                        <p style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1, marginTop: 2, margin: 0 }}>Train Your Brain</p>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {sidebarItems.map((item, i) => (
                        <Link key={i} to={item.to || "#"} style={{
                            display: "flex", 
                            alignItems: "center", 
                            gap: 12, 
                            padding: "10px 16px", 
                            borderRadius: 12,
                            background: item.active ? "#f3f0ff" : "transparent",
                            color: item.active ? "#7c6aff" : "#64748b", 
                            fontWeight: 700, 
                            fontSize: 13.5, 
                            textDecoration: "none", 
                            transition: "all 0.15s"
                        }}
                        onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.color = "#7c6aff"; } }}
                        onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; } }}
                        >
                            <span style={{ display: "flex", alignItems: "center", opacity: item.active ? 1 : 0.8 }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Bottom Widgets Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
                
                {/* Invite Friends Card Widget */}
                <div style={{ background: "#7c6aff", borderRadius: 16, padding: "16px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, position: "relative", overflow: "hidden", boxShadow: "0 8px 24px rgba(124,106,255,0.2)" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", marginBottom: "4px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M12 2v20M2 7h20M7.5 7a2.5 2.5 0 0 1 0-5C9.5 2 12 5 12 7M16.5 7a2.5 2.5 0 0 0 0-5C14.5 2 12 5 12 7" /></svg>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "white", margin: 0 }}>Invite Friends</p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", margin: "0 0 12px 0", lineHeight: 1.4, textAlign: "left" }}>Invite your friends and play together!</p>
                    <button 
                        type="button" 
                        onClick={handleInviteClick}
                        style={{
                            background: "white", 
                            color: "#7c6aff", 
                            border: "none", 
                            borderRadius: "10px", 
                            padding: "8px 0", 
                            width: "100%", 
                            fontSize: "11px", 
                            fontWeight: 800, 
                            cursor: "pointer", 
                            transition: "all 0.15s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
                        Invite Now
                    </button>
                </div>

                {/* Profile Card Widget */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #f0edff", paddingTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #7c6aff, #e879f9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 900 }}>
                            {initials}
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <p style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", margin: 0, lineHeight: 1.2 }}>{username}</p>
                            <p style={{ fontSize: 10, color: "#94a3b8", margin: 0, marginTop: 2, fontWeight: 700 }}>Level {userLevel}</p>
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#94a3b8", fontWeight: 800 }}>
                            <span>{currentXP.toLocaleString()} / 1,000 XP</span>
                        </div>
                        <div style={{ width: "100%", height: 6, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
                            <div style={{ width: `${xpPercentage}%`, height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #7c6aff 0%, #a78bfa 100%)" }} />
                        </div>
                    </div>
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
// Memoized Sub-components for Rendering Performance Optimization
// ----------------------------------------------------------------------
const GameCatalogGrid = memo(function GameCatalogGrid({ 
    filteredGames, 
    selectedGameId, 
    isSelectionDisabled, 
    onSelectGame 
}) {
    const storedStats = readStoredJson("brainbootsStats", {});
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[380px] overflow-y-auto pr-1 select-none">
            {filteredGames.map((game) => {
                const isSelected = selectedGameId === game.id;
                const badge = getDynamicGameBadge(game.id, storedStats.highScores || []);
                return (
                    <button
                        key={game.id}
                        type="button"
                        disabled={isSelectionDisabled}
                        onClick={() => onSelectGame(game.id)}
                        className={`group rounded-2xl bg-white border overflow-hidden flex flex-col text-left transition-all relative ${
                            isSelectionDisabled 
                                ? "cursor-default opacity-85" 
                                : "cursor-pointer hover:scale-[1.02] hover:shadow-xs active:scale-98"
                        } ${
                            isSelected
                                ? "border-violet-500 ring-2 ring-violet-500/20"
                                : "border-slate-200/80 hover:border-slate-300"
                        }`}
                    >
                        {/* Top Illustration container */}
                        <div className="w-full h-[95px] relative overflow-hidden bg-slate-50 flex-shrink-0">
                            <GameIllustration gameId={game.id} sectionTitle={getGameSkill(game.id)} />
                            {badge && (
                                <span className={`absolute top-2 left-2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs ${badge.className}`}>
                                    {badge.label}
                                </span>
                            )}
                        </div>

                        {/* Bottom details */}
                        <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                            <div>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                                    {getGameSkill(game.id)}
                                </span>
                                <h4 className="text-xs font-black text-slate-800 mt-0.5 leading-snug truncate group-hover:text-violet-650 transition-colors">
                                    {game.name}
                                </h4>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                                <span className="text-[8px] font-black text-violet-500 uppercase tracking-wider font-mono">
                                    {getGameRecommendedPlayers(game.id)}
                                </span>
                                {isSelected && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-ping" />
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
});

const ChatMessagesList = memo(function ChatMessagesList({ chatMessages, username, chatEndRef }) {
    return (
        <div className="h-[240px] max-h-[240px] overflow-y-auto space-y-3 pr-1 mb-2 lobby-chat-messages text-left w-full max-w-full">
            {chatMessages.length === 0 ? (
                <p className="text-slate-400 text-[10px] font-semibold italic text-center mt-12">Lobby chat is active. Say hello!</p>
            ) : (
                chatMessages.map((msg, idx) => {
                    const msgTime = msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    if (msg.isSystem) {
                        return (
                            <div key={idx} className="my-1.5 text-[9px] text-violet-500 font-bold italic pl-1 text-center bg-violet-50/50 py-1.5 rounded-lg border border-violet-100/30">
                                [{msgTime}] {msg.message}
                            </div>
                        );
                    }

                    const isSelf = msg.username === username;
                    return (
                        <div key={idx} className={`flex gap-2.5 items-start ${isSelf ? "flex-row-reverse text-right" : "text-left"}`}>
                            <div className={`w-7 h-7 rounded-full flex-shrink-0 ${getAvatarColorClass(msg.username)} flex items-center justify-center text-white font-black text-[9px] shadow-sm`}>
                                {msg.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className={`flex flex-col max-w-[75%] ${isSelf ? "items-end" : "items-start"}`}>
                                <div className="flex items-baseline gap-1.5 mb-0.5">
                                    {!isSelf && <span className="text-[10px] font-black text-slate-700">{msg.username}</span>}
                                    <span className="text-[8px] font-bold text-slate-400 font-mono">[{msgTime}]</span>
                                </div>
                                <div className={`p-2.5 rounded-2xl text-[11px] font-semibold leading-relaxed break-words shadow-2xs ${
                                    isSelf 
                                        ? "bg-violet-600 text-white rounded-tr-none" 
                                        : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none"
                                }`}>
                                    {msg.message}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
            <div ref={chatEndRef} />
        </div>
    );
});

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
    const [categoryFilter, setCategoryFilter] = useState("All");
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
        const storedStats = readStoredJson("brainbootsStats", {});
        const highScores = storedStats.highScores || [];
        
        let list = games;
        if (searchQuery.trim()) {
            list = list.filter((g) =>
                g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.desc.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        if (categoryFilter === "Trending") {
            list = list.filter((g) => {
                const badge = getDynamicGameBadge(g.id, highScores);
                return badge && (badge.label === "HOT" || badge.label === "BRAIN");
            });
            if (list.length === 0) {
                list = games.filter(g => ["aim", "wronganswers", "hotpotato", "reaction"].includes(g.id));
            }
        } else if (categoryFilter === "New") {
            list = list.filter((g) => {
                const badge = getDynamicGameBadge(g.id, highScores);
                return badge && (badge.label === "NEW" || badge.label === "TRIAL");
            });
            if (list.length === 0) {
                list = games.filter(g => ["sudoku", "wordguess", "lightsout"].includes(g.id));
            }
        } else if (categoryFilter === "Pro") {
            list = list.filter((g) => {
                const badge = getDynamicGameBadge(g.id, highScores);
                return badge && (badge.label === "PRO" || badge.label === "HOT");
            });
            if (list.length === 0) {
                list = games.filter(g => ["memory", "simon", "focusgrid"].includes(g.id));
            }
        }
        return list;
    }, [searchQuery, categoryFilter]);

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

    const handleSelectGame = useCallback((gameId) => {
        setSelectedGameId(gameId);
        if (connectionStatus === "CONNECTED") {
            sendGameAction({ type: "selected_game_update", gameId });
        }
    }, [connectionStatus, sendGameAction]);

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
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px", marginBottom: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#1e1b4b", margin: 0, tracking: "-0.5px" }}>Multiplayer Lobby</h1>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#dcfce7", color: "#16a34a", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 800 }}>
                                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                                    <span>Online</span>
                                </div>
                            </div>

                            <div 
                                onClick={handleCopyCode}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    background: "#eff6ff",
                                    border: "1px solid #dbeafe",
                                    borderRadius: "14px",
                                    padding: "6px 14px",
                                    cursor: "pointer",
                                    transition: "all 0.15s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#dbeafe"}
                                onMouseLeave={e => e.currentTarget.style.background = "#eff6ff"}
                            >
                                <span style={{ fontSize: "11px", fontWeight: 800, color: "#1e40af", letterSpacing: "0.5px" }}>
                                    ROOM CODE : <span style={{ fontWeight: 900, color: "#1d4ed8" }}>{roomCode}</span>
                                </span>
                                <svg style={{ width: "13px", height: "13px", color: "#2563eb" }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                {copied && <span style={{ fontSize: "9px", color: "#10b981", fontWeight: 800 }}>Copied!</span>}
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
                                    
                                    <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-md flex flex-col sm:flex-row items-stretch gap-6 relative overflow-hidden">
                                        {activeSelectedGame ? (
                                            <>
                                                <div className="w-full sm:w-[160px] h-[110px] sm:h-auto rounded-2xl overflow-hidden relative shadow-inner border border-slate-100 flex-shrink-0">
                                                    <GameIllustration gameId={activeSelectedGame.id} sectionTitle={getGameSkill(activeSelectedGame.id)} />
                                                    {(() => {
                                                        const storedStats = readStoredJson("brainbootsStats", {});
                                                        const badge = getDynamicGameBadge(activeSelectedGame.id, storedStats.highScores || []);
                                                        return badge ? (
                                                            <span className={`absolute top-2.5 left-2.5 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs ${badge.className}`}>
                                                                {badge.label}
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div>
                                                <div className="flex-1 text-left min-w-0 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                                                            <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-750 border border-violet-100 uppercase tracking-wider font-mono">
                                                                {getGameSkill(activeSelectedGame.id)}
                                                            </span>
                                                            <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-650 border border-slate-100 uppercase tracking-wider font-mono">
                                                                {getGameRecommendedPlayers(activeSelectedGame.id)}
                                                            </span>
                                                        </div>
                                                        <h2 className="text-xl font-extrabold text-slate-900 leading-tight truncate">{activeSelectedGame.name}</h2>
                                                        <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">{getGameSubtitle(activeSelectedGame)}</p>
                                                    </div>

                                                    <div className="flex items-center gap-2.5 mt-4">
                                                        {effectiveIsHost ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => startGame(activeSelectedGame.id, activeSelectedGame.name)}
                                                                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs py-3 px-6 rounded-2xl transition-all shadow-md shadow-violet-500/25 active:scale-95 cursor-pointer text-center uppercase tracking-wider"
                                                            >
                                                                START MATCH
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                disabled
                                                                className="flex-1 bg-slate-100 text-slate-400 font-bold text-xs py-3 px-6 rounded-2xl cursor-not-allowed animate-pulse text-center uppercase tracking-wider"
                                                            >
                                                                WAITING FOR HOST
                                                            </button>
                                                        )}
                                                        {effectiveIsHost && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsEditingSettings(true)}
                                                                className="bg-slate-50 hover:bg-slate-100 text-slate-550 border border-slate-200/80 p-3 rounded-2xl transition shadow-2xs hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
                                                                title="Match Settings"
                                                            >
                                                                <IconSettings />
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
                                        {/* Search bar & filter pills inside card */}
                                        <div className="flex flex-col gap-3 mb-4">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search games..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9.5 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none transition shadow-2xs"
                                                />
                                                <svg className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>

                                            {/* Category pills */}
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {["All", "Trending", "New", "Pro"].map((cat) => {
                                                    const isActive = categoryFilter === cat;
                                                    return (
                                                        <button
                                                            key={cat}
                                                            type="button"
                                                            onClick={() => setCategoryFilter(cat)}
                                                            className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full transition-all cursor-pointer border ${
                                                                isActive
                                                                    ? "bg-violet-600 border-violet-600 text-white shadow-xs"
                                                                    : "bg-slate-50 hover:bg-slate-100 text-slate-655 border-slate-200/80"
                                                            }`}
                                                        >
                                                            {cat}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Grid catalog */}
                                        <GameCatalogGrid
                                            filteredGames={filteredGames}
                                            selectedGameId={selectedGameId}
                                            isSelectionDisabled={connectionStatus === "CONNECTED" && !effectiveIsHost}
                                            onSelectGame={handleSelectGame}
                                        />

                                        {/* Bottom View All Games decorator */}
                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setCategoryFilter("All");
                                                }}
                                                className="text-[10px] font-black text-slate-400 hover:text-violet-600 transition flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                                            >
                                                View All Games
                                                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                </svg>
                                            </button>
                                        </div>
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
                                    
                                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs flex flex-col justify-between min-h-[260px]">
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
                                                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition cursor-pointer"
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
                                                    {/* circular background icons in 3x2 grid */}
                                                    <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-xs font-semibold text-slate-800">
                                                        {/* Host */}
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-9 h-9 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0 shadow-2xs">
                                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.172-.436.782-.436.954 0l1.82 4.616 4.962.721c.47.068.658.647.319.982L15.93 13.3l.886 4.939c.084.469-.404.824-.82.607L12 16.513l-4.416 2.333c-.417.218-.905-.138-.82-.607l.886-4.939L3.583 10.155c-.34-.335-.15-.914.319-.982l4.962-.72 1.82-4.617z" />
                                                                </svg>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="text-slate-400 block font-normal text-[8px] uppercase tracking-wider">Host</span>
                                                                <span className="font-extrabold truncate block text-slate-800">{hostName}</span>
                                                            </div>
                                                        </div>

                                                        {/* Map */}
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-2xs">
                                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.446l-6.002-3.001a1.125 1.125 0 00-1.006 0L3 18.375V6.375l6.002-3.001a1.125 1.125 0 011.006 0l6.002 3.001a1.125 1.125 0 001.006 0L21 6.375v12l-5.497 2.748a1.125 1.125 0 01-1.006 0z" />
                                                                </svg>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="text-slate-400 block font-normal text-[8px] uppercase tracking-wider">Map</span>
                                                                <span className="font-extrabold truncate block text-slate-800">{map}</span>
                                                            </div>
                                                        </div>

                                                        {/* Mode */}
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-2xs">
                                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                                                </svg>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="text-slate-400 block font-normal text-[8px] uppercase tracking-wider">Mode</span>
                                                                <span className="font-extrabold truncate block text-slate-800">{mode}</span>
                                                            </div>
                                                        </div>

                                                        {/* Join / Visibility */}
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-9 h-9 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0 shadow-2xs">
                                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                                </svg>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="text-slate-400 block font-normal text-[8px] uppercase tracking-wider">Join</span>
                                                                <span className="font-extrabold truncate block text-slate-800">{privacy}</span>
                                                            </div>
                                                        </div>

                                                        {/* Difficulty */}
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 shadow-2xs">
                                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                                                                </svg>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="text-slate-400 block font-normal text-[8px] uppercase tracking-wider">Difficulty</span>
                                                                <span className="font-extrabold truncate block text-slate-800">{difficulty}</span>
                                                            </div>
                                                        </div>

                                                        {/* Round Limit */}
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0 shadow-2xs">
                                                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                                </svg>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="text-slate-400 block font-normal text-[8px] uppercase tracking-wider">Round Limit</span>
                                                                <span className="font-extrabold truncate block text-slate-800">{roundLimit} Rounds</span>
                                                            </div>
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
                                                                    className="text-[9px] font-black px-3 py-1 bg-violet-50 hover:bg-violet-100 text-violet-650 rounded-lg border border-violet-200/50 transition cursor-pointer"
                                                                >
                                                                    + Add
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={removeBot}
                                                                    className="text-[9px] font-black px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg border border-slate-200/50 transition cursor-pointer"
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
                                                            className="flex-1 bg-white hover:bg-violet-50 text-violet-605 font-bold text-xs py-2.5 px-4 rounded-xl border border-violet-200 transition-all text-center cursor-pointer shadow-2xs"
                                                        >
                                                            Edit Settings
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={handleInvitePlayers}
                                                            className="flex-1 bg-white hover:bg-violet-50 text-violet-605 font-bold text-xs py-2.5 px-4 rounded-xl border border-violet-200 transition-all text-center cursor-pointer shadow-2xs"
                                                        >
                                                            {invited ? "Link Copied!" : "Invite Friends"}
                                                        </button>
                                                    )}
                                                    <Link
                                                        to="/dashboard"
                                                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs py-2.5 px-4 rounded-xl border border-rose-100 transition-all text-center inline-flex items-center justify-center cursor-pointer shadow-2xs"
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
                                    <div className="flex items-center justify-between mb-2 px-1">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-violet-605" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                            </svg>
                                            <span className="text-[10px] font-black tracking-wider text-slate-800 uppercase font-mono">LOBBY CHAT</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100 text-[9px] font-bold font-mono">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                                            <span>{displayPlayers.length} ONLINE</span>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs flex flex-col justify-between h-[390px] min-h-[390px] max-h-[390px] w-full max-w-full overflow-hidden">
                                        
                                        {/* Subheader online players list */}
                                        <div className="border-b border-slate-100 pb-2 mb-2 text-left">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-relaxed">
                                                Active Players: <span className="text-slate-700 font-bold">{displayPlayers.map(p => p.username).join(', ')}</span>
                                            </p>
                                        </div>

                                        {/* Messages list area */}
                                        <ChatMessagesList
                                            chatMessages={chatMessages}
                                            username={username}
                                            chatEndRef={chatEndRef}
                                        />

                                        {/* Input form */}
                                        <form onSubmit={handleSendChatMessage} className="flex gap-2 items-center border-t border-slate-100 pt-3">
                                            <div className="relative flex-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setChatInput(prev => prev + " 😊")}
                                                    className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-650 transition cursor-pointer select-none active:scale-95 text-sm"
                                                >
                                                    😊
                                                </button>
                                                <input
                                                    type="text"
                                                    placeholder="Type your message..."
                                                    value={chatInput}
                                                    onChange={(e) => setChatInput(e.target.value)}
                                                    maxLength={150}
                                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:outline-none transition shadow-2xs"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="bg-violet-650 hover:bg-violet-750 text-white p-2.5 rounded-full transition cursor-pointer shadow-md flex items-center justify-center w-9 h-9 flex-shrink-0 active:scale-95"
                                            >
                                                <svg className="w-4 h-4 text-white transform rotate-45 -translate-x-[1px] translate-y-[1px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
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
