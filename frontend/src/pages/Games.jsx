import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { gameSections } from "../data/gameCatalog";
import { getDashboardData } from "../services/api";

/* ─────────────── utility helpers ─────────────── */
const readStoredJson = (key, fallback) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const getInitials = (name) => {
    const parts = String(name || "Player").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "PL";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};
const getCategoryEmoji = (title) => {
    let emoji = "🎮";
    switch (title) {
        case "Memory & Retention": emoji = "🧠"; break;
        case "Reflex & Speed": emoji = "⚡"; break;
        case "Perception & Focus": emoji = "🎯"; break;
        case "Logic & Problem Solving": emoji = "🧩"; break;
        case "Funny & Playful": emoji = "🎈"; break;
    }
    return <span className="notranslate" translate="no">{emoji}</span>;
};

/* ─────────────── game stat helpers ─────────────── */
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

/* ─────────────── constants ─────────────── */

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

/* ─────────────── GameIllustration ─────────────── */
const GAME_EMOJIS = {
    // Memory & Retention
    memory: "🧠",       // Memory Match
    simon: "🔁",        // Simon Memory
    numbers: "🔢",      // Number Sequence
    nback: "⏮️",        // N-Back Memory
    memoryrace: "🏁",   // Memory Race

    // Reflex & Speed
    reaction: "⚡",     // Reaction Test
    aim: "🎯",          // Aim Trainer
    typing: "⌨️",       // Typing Mastery
    speedmath: "🧮",    // Speed Math
    trafficcontrol: "🚦", // Traffic Control

    // Perception & Focus
    stroop: "🎨",       // Stroop Test
    oddcolor: "👁️",     // Odd Color
    focusgrid: "🔍",    // Focus Grid
    schulte: "🔲",      // Schulte Table

    // Logic & Problem Solving
    sudoku: "🧩",       // Sudoku Mini
    wordguess: "📝",    // Word Deduction
    lightsout: "💡",    // Lights Out Grid
    slidingtile: "🔢",  // Sliding Tile
    hanoi: "🗼",        // Tower of Hanoi

    // Funny & Playful
    wronganswers: "😜",  // Wrong Answers Only
    hotpotato: "🥔",    // Hot Potato Chat
};

const GameIllustration = ({ gameId, sectionTitle }) => {
    // Dedicated premium 3D PNG assets for specific games
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

    // Setup base wrapper that handles background spotlight, wavy lines and floating stars/dots consistently
    const renderBaseSVG = (content) => (
        <svg className="h-full w-full" viewBox="0 0 160 90" fill="none" preserveAspectRatio="xMidYMid slice" style={{ overflow: "hidden" }}>
            <defs>
                {/* 3D Sphere Shading (fallback) */}
                <radialGradient id={`sphere-grad-${gameId}`} cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="30%" stopColor={softColor} stopOpacity="0.75" />
                    <stop offset="75%" stopColor={accentColor} stopOpacity="0.85" />
                    <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
                </radialGradient>
                
                {/* Background soft spotlight */}
                <radialGradient id={`bg-spot-${gameId}`} cx="50%" cy="40%" r="75%">
                    <stop offset="0%" stopColor={softColor} />
                    <stop offset="100%" stopColor={accentColor} />
                </radialGradient>

                {/* Star Gradient */}
                <linearGradient id={`star-grad-${gameId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffe066" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>

                {/* Drop shadow for 3D elements */}
                <filter id={`shadow-3d-${gameId}`} x="-20%" y="-20%" width="150%" height="150%">
                    <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.12" />
                </filter>
                
                {/* Glow filter */}
                <filter id={`glow-3d-${gameId}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Background with spotlight */}
            <rect width="160" height="90" fill={`url(#bg-spot-${gameId})`} />

            {/* Wavy background decor lines */}
            <path d="M-10,45 C30,20 60,70 100,35 C130,15 150,55 180,30" stroke="white" strokeWidth="5" opacity="0.18" strokeLinecap="round" fill="none" />
            <path d="M-20,60 C20,35 50,85 90,50 C120,30 140,70 170,45" stroke="white" strokeWidth="3.5" opacity="0.12" strokeLinecap="round" fill="none" />

            {/* Floating 3D Sparkles / Stars */}
            <path d="M22,12 L24,15 L27,16 L24,17 L22,20 L20,17 L17,16 L20,15 Z" fill={`url(#star-grad-${gameId})`} opacity="0.85" filter={`url(#shadow-3d-${gameId})`} />
            <path d="M136,18 L138,20 L141,21 L138,22 L136,24 L134,22 L131,21 L134,20 Z" fill="white" opacity="0.95" filter={`url(#shadow-3d-${gameId})`} />
            <path d="M26,62 L27.5,64 L29.5,65 L27.5,66 L26,68 L24.5,66 L22.5,65 L24.5,64 Z" fill="white" opacity="0.8" />
            <path d="M132,60 L133.5,62 L135.5,63 L133.5,64 L132,66 L130.5,64 L128.5,63 L130.5,62 Z" fill={`url(#star-grad-${gameId})`} opacity="0.85" filter={`url(#shadow-3d-${gameId})`} />

            {/* Content graphic containing specific 3D drawings */}
            {content}
        </svg>
    );

    // Dynamic rendering of 3D objects for each game
    switch (gameId) {
        case "simon": // Glossy 3D Simon Memory Game Controller
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    {/* Shadow ellipse */}
                    <ellipse cx="80" cy="74" rx="20" ry="4" fill="#0f172a" opacity="0.1" />
                    {/* Main console body */}
                    <circle cx="80" cy="45" r="23" fill="#1e293b" />
                    {/* Highlight rim */}
                    <circle cx="80" cy="45" r="21.5" fill="none" stroke="white" strokeWidth="0.8" opacity="0.15" />
                    {/* Colored segments */}
                    <path d="M80,45 L58.5,45 A21.5,21.5 0 0,1 80,23.5 Z" fill="url(#simon-green)" />
                    <path d="M80,45 L80,23.5 A21.5,21.5 0 0,1 101.5,45 Z" fill="url(#simon-red)" />
                    <path d="M80,45 L58.5,45 A21.5,21.5 0 0,0 80,66.5 Z" fill="url(#simon-yellow)" />
                    <path d="M80,45 L80,66.5 A21.5,21.5 0 0,0 101.5,45 Z" fill="url(#simon-blue)" />
                    {/* Center piece */}
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

        case "numbers": // 3D floating blocks showing "1 2 3"
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="26" ry="5" fill="#0f172a" opacity="0.08" />
                    
                    {/* Floating number "1" */}
                    <g transform="translate(48, 42)">
                        <rect x="0" y="0" width="16" height="24" rx="3" fill="#3b82f6" />
                        <rect x="0" y="0" width="16" height="6" rx="2" fill="#60a5fa" />
                        <text x="8" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="900">1</text>
                    </g>
                    {/* Floating number "2" */}
                    <g transform="translate(72, 30)">
                        <rect x="0" y="0" width="16" height="24" rx="3" fill="#8b5cf6" />
                        <rect x="0" y="0" width="16" height="6" rx="2" fill="#a78bfa" />
                        <text x="8" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="900">2</text>
                    </g>
                    {/* Floating number "3" */}
                    <g transform="translate(96, 46)">
                        <rect x="0" y="0" width="16" height="24" rx="3" fill="#ec4899" />
                        <rect x="0" y="0" width="16" height="6" rx="2" fill="#f472b6" />
                        <text x="8" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="900">3</text>
                    </g>
                </g>
            );

        case "nback": // 3D Brain card with looping back arrow
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

        case "memoryrace": // 3D Flag & racing road
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

        case "typing": // 3D Keyboard tilted deck
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

        case "speedmath": // 3D Math operations blocks
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

        case "trafficcontrol": // 3D Traffic light pole
            return renderBaseSVG(
                <g filter={`url(#shadow-3d-${gameId})`}>
                    <ellipse cx="80" cy="74" rx="14" ry="3.5" fill="#0f172a" opacity="0.1" />
                    
                    <rect x="78" y="52" width="4" height="24" fill="#475569" />
                    <rect x="70" y="16" width="20" height="38" rx="5" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                    
                    <circle cx="80" cy="23" r="4.5" fill="#ef4444" filter={`url(#glow-3d-${gameId})`} />
                    <circle cx="79" cy="22" r="1.5" fill="white" opacity="0.6" />
                    <circle cx="80" cy="35" r="4.5" fill="#eab308" opacity="0.3" />
                    <circle cx="80" cy="47" r="4.5" fill="#22c55e" opacity="0.3" />
                </g>
            );

        case "stroop": // 3D Artist palette and brush
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

        case "oddcolor": // 3D blocks grid highlighting one block
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

        case "focusgrid": // 3D magnifying glass floating over grid
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

        case "schulte": // Schulte board
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

        case "sudoku": // 3D Sudoku board block
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

        case "wordguess": // 3D Word Tile Blocks
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

        case "lightsout": // 3D Bulb and toggle switch
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

        case "slidingtile": // 3D Sliding tile grid
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

        case "hanoi": // 3D Tower of Hanoi
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

        case "wronganswers": // 3D Smiley Face 😜
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

        case "hotpotato": // 3D Hot Potato
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

        default: // Fallback generic 3D Sphere layout
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
};



/* ─────────────── Sidebar SVGs ─────────────── */
const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>;
const IconTrain = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M12 4v16" /><rect x="5" y="4" width="3" height="3" rx="1" /><rect x="16" y="17" width="3" height="3" rx="1" /></svg>;
const IconChallenge = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
const IconRooms = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4" /><circle cx="17" cy="9" r="3" /><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /><path d="M19 21v-1.5a3 3 0 0 0-3-3" /></svg>;
const IconProgress = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const IconLeaderboard = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="4" height="18" rx="1" /><rect x="10" y="9" width="4" height="12" rx="1" /><rect x="2" y="13" width="4" height="8" rx="1" /></svg>;
const IconProfile = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;

/* ─────────────── Games Page Component ─────────────── */
function Games() {
    const user = readStoredJson("user", {});
    const storedStats = readStoredJson("brainbootsStats", {});
    const [dashboardData, setDashboardData] = useState({ stats: storedStats, highScores: [], tables: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const location = useLocation();
    const username = user.username || user.email || "Player";
    const initials = getInitials(username);
    const stats = dashboardData.stats || {};
    const totalScore = stats.totalScore || 0;
    const userLevel = Math.floor(totalScore / 1000) + 1;
    const streak = stats.streak || 0;
    const highScores = dashboardData.highScores || [];

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getDashboardData();
                if (res.data.success) {
                    setDashboardData({ stats: res.data.stats || {}, highScores: res.data.highScores || [], tables: res.data.tables || [] });
                }
            } catch { /* silent */ } finally { setIsLoading(false); }
        };
        fetch();
    }, []);

    // Set default category filter based on query parameter from zone maps
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const zone = params.get("zone");
        if (zone) {
            const mapping = {
                memory: "Memory & Retention",
                focus: "Perception & Focus",
                logic: "Logic & Problem Solving",
                reflex: "Reflex & Speed",
                fun: "Funny & Playful",
            };
            if (mapping[zone]) {
                setSelectedTab(mapping[zone]);
            }
        }
    }, [location.search]);

    const categories = ["All", "Memory & Retention", "Reflex & Speed", "Perception & Focus", "Logic & Problem Solving", "Funny & Playful"];

    const filteredGames = useMemo(() => {
        return gameSections.flatMap(section => {
            if (selectedTab !== "All" && section.title !== selectedTab) return [];
            return section.games.map(game => ({
                ...game,
                sectionTitle: section.title
            }));
        }).filter(game => 
            game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            game.desc.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [selectedTab, searchQuery]);

    const sidebarItems = [
        { label: "Home", icon: <IconHome />, to: "/dashboard" },
        { label: "Train", icon: <IconTrain />, active: true },
        { label: "Challenges", icon: <IconChallenge />, to: "/dashboard" },
        { label: "Rooms", icon: <IconRooms />, to: "/multiplayer" },
        { label: "Progress", icon: <IconProgress />, to: "/dashboard" },
        { label: "Leaderboard", icon: <IconLeaderboard />, to: "/dashboard" },
        { label: "Profile", icon: <IconProfile />, to: "/dashboard" },
    ];

    const streakDays = ["M", "T", "W", "T", "F", "S", "S"];

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f5f6fc", fontFamily: "Inter, system-ui, sans-serif" }}>

            {/* ════════════════ SIDEBAR ════════════════ */}
            <aside style={{ width: "240px", minWidth: "240px", background: "white", borderRight: "1px solid #f0edff", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", padding: "24px 16px", zIndex: 45, boxShadow: "2px 0 12px rgba(124,106,255,0.02)" }}>
                {/* Logo and Brand */}
                <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", paddingLeft: 8, marginBottom: 28, textDecoration: "none" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #7c6aff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 900, boxShadow: "0 4px 12px rgba(124,106,255,0.3)" }}>BB</div>
                    <div>
                        <p style={{ fontSize: 15, fontWeight: 900, color: "#1e1b4b", lineHeight: 1 }}>BrainBoot</p>
                        <p style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1, marginTop: 2 }}>Train Your Brain</p>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, overflowY: "auto" }} className="scrollbar-hide">
                    {sidebarItems.map((item, i) => {
                        const itemStyle = {
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 16px",
                            borderRadius: 12,
                            background: item.active ? "linear-gradient(135deg, #7c6aff 0%, #a78bfa 100%)" : "transparent",
                            color: item.active ? "white" : "#64748b",
                            fontWeight: 700,
                            fontSize: 13.5,
                            border: "none",
                            textAlign: "left",
                            width: "100%",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            boxShadow: item.active ? "0 4px 12px rgba(124,106,255,0.2)" : "none"
                        };
                        const inner = (
                            <>
                                <span style={{ display: "flex", alignItems: "center", opacity: item.active ? 1 : 0.8 }}>{item.icon}</span>
                                <span>{item.label}</span>
                            </>
                        );

                        return (
                            <Link key={i} to={item.to || "#"} style={{ ...itemStyle, textDecoration: "none" }}
                                onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.color = "#7c6aff"; } }}
                                onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; } }}>
                                {inner}
                            </Link>
                        );
                    })}
                </nav>

                {/* Go Premium Violet Widget */}
                <div style={{ background: "#f3f0ff", borderRadius: 16, padding: "16px", border: "1px solid #e8e4ff", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10, margin: "20px 0" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
                        <span className="notranslate" translate="no" style={{ fontSize: 18 }}>💎</span>
                    </div>
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 900, color: "#1e1b4b", margin: 0 }}>Go Premium</p>
                        <p style={{ fontSize: 9, color: "#64748b", margin: "4px 0 0 0", lineHeight: 1.4 }}>Unlock all games, stats, reports and more.</p>
                    </div>
                    <button type="button" style={{ background: "linear-gradient(135deg, #7c6aff, #a78bfa)", color: "white", border: "none", borderRadius: 10, padding: "8px 0", width: "100%", fontSize: 11, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 10px rgba(124,106,255,0.15)" }}>Upgrade Now</button>
                </div>

                {/* Streak widget at the bottom */}
                <div style={{ background: "white", borderRadius: 16, border: "1px solid #f0edff", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="notranslate" translate="no" style={{ fontSize: 20 }}>🔥</span>
                        <span style={{ fontSize: 22, fontWeight: 900, color: "#e67e22", lineHeight: 1 }}>{streak}</span>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Day Streak</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 4, marginTop: 10 }}>
                        {streakDays.map((d, i) => {
                            const isCompleted = i < (streak % 7 || (streak > 0 ? 7 : 0));
                            return (
                                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                    <div style={{ 
                                        width: 18, 
                                        height: 18, 
                                        borderRadius: "50%", 
                                        background: isCompleted ? "#22c55e" : "transparent", 
                                        border: "1.5px solid", 
                                        borderColor: isCompleted ? "#22c55e" : "#e2e8f0", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center" 
                                    }}>
                                        {isCompleted && <span className="notranslate" translate="no" style={{ color: "white", fontSize: 9, fontWeight: 900 }}>✓</span>}
                                    </div>
                                    <span style={{ fontSize: 8, color: "#94a3b8", fontWeight: 700 }}>{d}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* ════════════════ MAIN CONTENT AREA ════════════════ */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                
                {/* Scrollable content container */}
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }} className="scrollbar-hide">
                    
                    <main style={{ maxWidth: "1340px", width: "100%", margin: "0 auto", padding: "24px 32px 80px", display: "flex", flexDirection: "column", gap: 24 }}>
                        
                        {/* ── HEADER ── */}
                        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", flexShrink: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1.5px solid #fde68a", background: "#fffbeb", borderRadius: 20, padding: "6px 14px", cursor: "pointer", boxShadow: "0 2px 8px rgba(253,230,138,0.15)" }}>
                                <span className="notranslate" translate="no" style={{ fontSize: 16 }}>🪙</span>
                                <span style={{ fontSize: 14, fontWeight: 900, color: "#d97706" }}>{totalScore.toLocaleString()}</span>
                                <span style={{ fontSize: 12, fontWeight: 900, color: "#d97706", marginLeft: 4 }}>+</span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <button type="button" style={{ width: 38, height: 38, borderRadius: "50%", border: "1.5px solid #f0edff", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}><span className="notranslate" translate="no">🔍</span></button>
                                <button type="button" style={{ width: 38, height: 38, borderRadius: "50%", border: "1.5px solid #f0edff", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, boxShadow: "0 2px 6px rgba(0,0,0,0.02)" }}><span className="notranslate" translate="no">🔔</span></button>

                                <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #f0edff", background: "white", borderRadius: 24, padding: "4px 16px 4px 4px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #7c6aff, #e879f9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 900 }}>{initials}</div>
                                    <div style={{ textAlign: "left" }}>
                                        <p style={{ fontSize: 11, fontWeight: 900, color: "#1e1b4b", lineHeight: 1.1 }}>{username}</p>
                                        <p style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.1, marginTop: 1 }}>Level {userLevel}</p>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Title & Search row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                            <div>
                                <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1e1b4b", margin: 0 }}>All Training Games</h1>
                                <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0 0" }}>Improve memory, speed, focus, and logic skills daily.</p>
                            </div>
                            <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
                                <input
                                    type="text"
                                    placeholder="Search games..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{ width: "100%", padding: "10px 16px 10px 38px", borderRadius: 14, border: "1px solid #f0edff", outline: "none", fontSize: 13, background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}
                                />
                                <span className="notranslate" translate="no" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#94a3b8" }}>🔍</span>
                            </div>
                        </div>

                        {/* Tabs category filter */}
                        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }} className="scrollbar-hide">
                            {categories.map(cat => {
                                const isActive = selectedTab === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedTab(cat)}
                                        style={{
                                            padding: "8px 16px",
                                            borderRadius: 12,
                                            background: isActive ? "#7c6aff" : "white",
                                            color: isActive ? "white" : "#64748b",
                                            fontWeight: 700,
                                            fontSize: 13,
                                            border: "1px solid",
                                            borderColor: isActive ? "#7c6aff" : "#f0edff",
                                            cursor: "pointer",
                                            whiteSpace: "nowrap",
                                            transition: "all 0.15s",
                                            boxShadow: isActive ? "0 4px 12px rgba(124,106,255,0.2)" : "0 2px 6px rgba(0,0,0,0.02)"
                                        }}
                                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f5f3ff"; }}
                                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "white"; }}
                                    >
                                        {cat === "All" ? <><span className="notranslate" translate="no">⭐</span> All Zones</> : <>{getCategoryEmoji(cat)} {cat.split(" ")[0]}</>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Grid of Games */}
                        {filteredGames.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "60px 0", background: "white", borderRadius: 24, border: "1px solid #f0edff" }}>
                                <span className="notranslate" translate="no" style={{ fontSize: 40 }}>🔎</span>
                                <p style={{ fontSize: 16, fontWeight: 700, color: "#1e1b4b", marginTop: 12, marginBottom: 4 }}>No games found</p>
                                <p style={{ fontSize: 13, color: "#64748b" }}>Try searching for a different term or change filters.</p>
                            </div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                                {filteredGames.map(game => {
                                    const tone = gameIndividualTone[game.id] || sectionTone[game.sectionTitle] || sectionTone["Memory & Retention"];
                                    const badge = getDynamicGameBadge(game.id, highScores);
                                    const gameStats = getGameStats(game.id, highScores);
                                    return (
                                        <Link
                                            key={game.id}
                                            to={`/games/${game.id}`}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                borderRadius: 20,
                                                overflow: "hidden",
                                                background: "white",
                                                border: "1.5px solid #f0edff",
                                                textDecoration: "none",
                                                transition: "all 0.2s",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(124,106,255,0.08)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.02)"; }}
                                        >
                                            <div style={{ height: 110, background: tone.art, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                                                <GameIllustration gameId={game.id} sectionTitle={game.sectionTitle} />
                                                {badge && (
                                                    <span style={{
                                                        position: "absolute",
                                                        right: 8,
                                                        top: 8,
                                                        borderRadius: 10,
                                                        padding: "2px 8px",
                                                        fontSize: 8,
                                                        fontWeight: 900,
                                                        letterSpacing: "0.5px",
                                                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                                                    }} className={badge.className}>
                                                        {badge.label === "HOT" && <span className="notranslate" translate="no">🔥 </span>}{badge.label}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12 }}>
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 900, color: "#1e1b4b", margin: 0 }}>{game.name}</p>
                                                    <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0 0", lineHeight: 1.4 }}>{game.desc}</p>
                                                </div>

                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1.5px solid #f8f7ff", paddingTop: 10 }}>
                                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                                        <span style={{ fontSize: 10, fontWeight: 800, color: "#374151" }}>{gameStats.plays} {gameStats.plays === 1 ? "play" : "plays"}</span>
                                                        <span style={{ fontSize: 8, color: "#94a3b8" }}>{gameStats.plays > 0 ? `Best: ${gameStats.bestScore}` : "Not played yet"}</span>
                                                    </div>
                                                    <span style={{
                                                        fontSize: 10,
                                                        fontWeight: 800,
                                                        padding: "4px 12px",
                                                        borderRadius: 8,
                                                        background: "#f0f0ff",
                                                        color: "#7c6aff",
                                                        transition: "all 0.15s"
                                                    }}>Play <span className="notranslate" translate="no">▶</span></span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </div>
            
            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                * { box-sizing: border-box; }
            `}</style>
        </div>
    );
}

export default Games;
