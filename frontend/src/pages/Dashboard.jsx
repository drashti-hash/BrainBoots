import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { gameSections } from "../data/gameCatalog";
import { getDashboardData } from "../services/api";

const readStoredJson = (key, fallback) => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

function Dashboard() {
    const user = readStoredJson("user", {});
    const storedStats = readStoredJson("brainbootsStats", {});
    const [dashboardData, setDashboardData] = useState({
        stats: storedStats,
        highScores: [],
        tables: [],
    });
    const [scoreModalOpen, setScoreModalOpen] = useState(false);
    const [gamesPlayedModalOpen, setGamesPlayedModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    
    const username = user.username || user.email || "Player";
    const totalGames = gameSections.reduce((total, section) => total + section.games.length, 0);
    
    const stats = dashboardData.stats || {};
    const totalScore = stats.totalScore || 0;
    const bestScore = stats.bestScore || 0;
    const streak = stats.streak || 0;
    const gamesPlayed = stats.gamesPlayed || 0;
    const highScores = dashboardData.highScores || [];
    const tables = dashboardData.tables || [];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await getDashboardData();

                if (response.data.success) {
                    setDashboardData({
                        stats: response.data.stats || {},
                        highScores: response.data.highScores || [],
                        tables: response.data.tables || [],
                    });
                    localStorage.setItem(
                        "brainbootsStats",
                        JSON.stringify(response.data.stats || {})
                    );
                    setErrorMessage("");
                } else {
                    setErrorMessage(response.data.message || "Unable to fetch dashboard data");
                }
            } catch {
                setErrorMessage("Unable to fetch dashboard data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Get a random game ID to launch for Play Now button
    const getRandomGameId = () => {
        const allGames = gameSections.flatMap(s => s.games);
        if (allGames.length === 0) return "aim";
        const randomIndex = Math.floor(Math.random() * allGames.length);
        return allGames[randomIndex].id;
    };

    // Calculate level progression dynamically based on totalScore
    const userLevel = Math.floor(totalScore / 1000) + 1;
    const xpProgress = totalScore % 1000;
    const xpPercent = Math.min(100, Math.max(5, Math.round((xpProgress / 1000) * 100)));

    // Generate dynamic chart data from last 7 plays
    const allPlayRows = tables.flatMap(t => 
        (t.rows || []).map(r => ({
            score: r.score ?? r.wpm ?? r.correct_answers ?? r.reaction_time ?? 0,
            date: r.created_at ?? r.played_at ?? r.date ?? ""
        }))
    );
    const lastSevenPlays = allPlayRows
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7);

    const maxVal = Math.max(...lastSevenPlays.map(p => p.score), 10);
    const minVal = Math.min(...lastSevenPlays.map(p => p.score), 0);

    const chartPoints = lastSevenPlays.map((p, i) => {
        const x = (i / Math.max(1, lastSevenPlays.length - 1)) * 300;
        const y = 80 - ((p.score - minVal) / (maxVal - minVal || 1)) * 60;
        return { x, y, score: p.score };
    });

    let pathD = "";
    let fillD = "";
    if (chartPoints.length > 0) {
        pathD = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
        for (let i = 1; i < chartPoints.length; i++) {
            pathD += ` L ${chartPoints[i].x} ${chartPoints[i].y}`;
        }
        fillD = `${pathD} L ${chartPoints[chartPoints.length - 1].x} 100 L ${chartPoints[0].x} 100 Z`;
    }

    // Dynamic Featured Games (Top 4 played games by user, no padding with 0-stat dummy games)
    const sortedFeatured = [...highScores]
        .filter(g => g.plays > 0)
        .sort((a, b) => (b.plays - a.plays) || (b.bestScore - a.bestScore))
        .slice(0, 4);

    const catalogGames = gameSections.flatMap(s => s.games);
    const featuredWithDetails = sortedFeatured.map(fg => {
        const catalogMatch = catalogGames.find(cg => cg.name.toLowerCase() === fg.game.toLowerCase() || cg.id === fg.table);
        return {
            ...fg,
            icon: catalogMatch?.icon || "🎮",
            desc: catalogMatch?.desc || "Cognitive training exercise",
            id: catalogMatch?.id || fg.table
        };
    });

    // Dynamic Leaderboard (Personal Bests: Top 5 games by score)
    const personalBests = [...highScores]
        .sort((a, b) => b.bestScore - a.bestScore)
        .slice(0, 5);

    return (
        <main className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
            
            {/* 1. TOP NAVIGATION BAR */}
            <header className="sticky top-0 z-45 bg-white border-b border-slate-200/60 px-4 md:px-8 py-3.5 shadow-sm">
                <div className="mx-auto flex max-w-[1720px] w-[95%] items-center justify-between gap-4">
                    
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <svg className="w-8 h-8 overflow-visible" viewBox="0 0 100 100" fill="none">
                            <style>{`
                                @keyframes pulse-slow {
                                    0%, 100% { transform: scale(1); }
                                    50% { transform: scale(1.04); }
                                }
                                @keyframes float-left {
                                    0%, 100% { transform: translateY(0px); }
                                    50% { transform: translateY(-1.5px); }
                                }
                                @keyframes float-right {
                                    0%, 100% { transform: translateY(0px); }
                                    50% { transform: translateY(1.5px); }
                                }
                                .animate-brain {
                                    animation: pulse-slow 4s ease-in-out infinite;
                                    transform-origin: center;
                                }
                                .left-hemisphere {
                                    animation: float-left 3.5s ease-in-out infinite;
                                    transform-origin: 50% 50%;
                                }
                                .right-hemisphere {
                                    animation: float-right 3.5s ease-in-out infinite;
                                    transform-origin: 50% 50%;
                                }
                            `}</style>
                            <g className="animate-brain">
                                <defs>
                                    <linearGradient id="nav-logo-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#4f46e5" />
                                    </linearGradient>
                                    <linearGradient id="nav-logo-grad-right" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#a78bfa" />
                                        <stop offset="100%" stopColor="#7c3aed" />
                                    </linearGradient>
                                </defs>

                                {/* Stem / Spine connection line */}
                                <line x1="50" y1="74" x2="50" y2="88" stroke="url(#nav-logo-grad-left)" strokeWidth="10" strokeLinecap="round" />

                                {/* Left Hemisphere Group */}
                                <g className="left-hemisphere">
                                    <g stroke="url(#nav-logo-grad-left)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="28" y1="34" x2="18" y2="50" />
                                        <line x1="18" y1="50" x2="30" y2="66" />
                                        <line x1="30" y1="66" x2="38" y2="58" />
                                        <line x1="38" y1="58" x2="40" y2="46" />
                                        <line x1="40" y1="46" x2="28" y2="34" />
                                        <line x1="28" y1="34" x2="50" y2="30" />
                                        <line x1="38" y1="58" x2="50" y2="74" />
                                    </g>
                                    <circle cx="28" cy="34" r="9.5" fill="#8b5cf6" />
                                    <circle cx="18" cy="50" r="11" fill="#6366f1" />
                                    <circle cx="30" cy="66" r="9.5" fill="#4f46e5" />
                                    <circle cx="40" cy="46" r="8.5" fill="#a78bfa" />
                                    <circle cx="38" cy="58" r="7.5" fill="#6366f1" />
                                </g>

                                {/* Right Hemisphere Group */}
                                <g className="right-hemisphere">
                                    <g stroke="url(#nav-logo-grad-right)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="72" y1="34" x2="82" y2="50" />
                                        <line x1="82" y1="50" x2="70" y2="66" />
                                        <line x1="70" y1="66" x2="62" y2="58" />
                                        <line x1="62" y1="58" x2="60" y2="46" />
                                        <line x1="60" y1="46" x2="72" y2="34" />
                                        <line x1="72" y1="34" x2="50" y2="30" />
                                        <line x1="62" y1="58" x2="50" y2="74" />
                                    </g>
                                    <circle cx="72" cy="34" r="9.5" fill="#a78bfa" />
                                    <circle cx="82" cy="50" r="11" fill="#8b5cf6" />
                                    <circle cx="70" cy="66" r="9.5" fill="#7c3aed" />
                                    <circle cx="60" cy="46" r="8.5" fill="#c084fc" />
                                    <circle cx="62" cy="58" r="7.5" fill="#8b5cf6" />
                                </g>

                                {/* Center and Stem nodes */}
                                <circle cx="50" cy="30" r="8" fill="#c084fc" />
                                <circle cx="50" cy="74" r="9" fill="#4f46e5" />
                                <circle cx="50" cy="88" r="7" fill="#312e81" />
                            </g>
                        </svg>
                        <span className="text-xl font-black tracking-tight text-slate-900">
                            Brain<span className="text-violet-600">Boot</span>
                        </span>
                    </div>

                    {/* Nav Links */}
                    <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                        <Link to="/dashboard" className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-violet-600 font-bold rounded-lg shadow-sm text-xs transition">
                            🏠 Home
                        </Link>
                        <a href="#games-catalog" className="flex items-center gap-1.5 px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-bold rounded-lg text-xs transition">
                            🎮 Games
                        </a>
                        <Link to="/multiplayer" className="flex items-center gap-1.5 px-3.5 py-1.5 text-slate-600 hover:text-slate-900 font-bold rounded-lg text-xs transition">
                            👥 Rooms
                        </Link>
                    </nav>

                    {/* User Info & Actions */}
                    <div className="flex items-center gap-4">
                        {/* User Profile Info */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                {username.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="hidden sm:flex flex-col items-start leading-none text-left">
                                <span className="text-xs font-black text-slate-800">{username}</span>
                                <span className="text-[10px] font-bold text-slate-400 mt-0.5">Level {userLevel}</span>
                            </div>
                        </div>

                        <Link
                            to="/login"
                            className="text-xs font-bold text-slate-500 hover:text-rose-600 transition pl-3 border-l border-slate-200"
                        >
                            Logout
                        </Link>
                    </div>
                </div>
            </header>

            {/* MAIN CONTAINER */}
            <div className="mx-auto max-w-[1720px] w-[95%] px-4 md:px-8 mt-6 space-y-6">
                
                {/* Loader / Errors */}
                {isLoading && (
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs font-bold text-indigo-900 animate-pulse">
                        ⏳ Loading database workout data...
                    </div>
                )}
                {errorMessage && (
                    <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-xs font-bold text-rose-800">
                        ⚠️ {errorMessage}
                    </div>
                )}

                {/* 2. HERO BANNER */}
                <section className="relative rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50/30 to-slate-100 border border-slate-200/60 overflow-hidden px-6 py-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex-1 text-center md:text-left z-10 max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-900">
                            Welcome back, <span className="text-indigo-600">{username}!</span><br />
                            Ready to level up your brain?
                        </h1>
                        <p className="mt-4 text-sm text-slate-500 font-semibold leading-relaxed max-w-2xl">
                            {gamesPlayed > 0 ? (
                                `You've completed ${gamesPlayed} cognitive workouts all-time with a total score of ${totalScore.toLocaleString()}. Your current rank is Level ${userLevel} with a streak of ${streak} day${streak === 1 ? '' : 's'}. Choose a game below to keep your streak going!`
                            ) : (
                                `Welcome to BrainBoot! Choose one of the games below to begin your cognitive training, improve your stats, and establish your first records.`
                            )}
                        </p>
                        
                        <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                            <Link
                                to={`/games/${getRandomGameId()}`}
                                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-6 py-3.5 text-xs font-bold text-white transition transform hover:scale-105 active:scale-95 shadow-md shadow-indigo-100 cursor-pointer"
                            >
                                <span className="text-xs">▶</span> Play Now
                            </Link>
                            <Link
                                to="/multiplayer"
                                className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white hover:border-violet-500 px-6 py-3.5 text-xs font-bold text-violet-600 hover:text-violet-700 transition transform hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Join Room
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 flex justify-center z-10 relative">
                        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                            <div className="absolute inset-4 rounded-full bg-violet-400/10 blur-3xl animate-pulse" />
                            <img
                                src="/3d_brain_character.png"
                                alt="3D Weightlifter Brain"
                                className="w-full h-full object-contain drop-shadow-xl animate-float"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                }}
                            />
                            <div className="hidden w-full h-full flex-col items-center justify-center text-8xl bg-indigo-50 rounded-full border border-indigo-200">
                                🧠
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. THREE-COLUMN GAP-FREE PROGRESS GRID */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Your Progress Panel (6 cols) */}
                    <div className="md:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">Your Progress</h2>
                                <span className="bg-slate-50 rounded-lg border border-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-500">All Time</span>
                            </div>

                            {/* Scores & Count indicators */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setScoreModalOpen(true)}
                                    className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-left shadow-sm hover:border-violet-300 hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
                                >
                                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Total Score</p>
                                    <p className="mt-1 text-2xl font-black text-slate-800">{totalScore.toLocaleString()}</p>
                                    <p className="mt-0.5 text-[9px] font-bold text-slate-400">Best: {bestScore.toLocaleString()}</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGamesPlayedModalOpen(true)}
                                    className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-left shadow-sm hover:border-violet-300 hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
                                >
                                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Workouts</p>
                                    <p className="mt-1 text-2xl font-black text-slate-800">{gamesPlayed}</p>
                                    <p className="mt-0.5 text-[9px] font-bold text-slate-400">Streak: {streak} days</p>
                                </button>
                            </div>
                        </div>

                        {/* Sparkline Graph */}
                        <div className="h-32 bg-slate-50/50 rounded-2xl border border-slate-100 p-3.5 relative flex items-center justify-center overflow-hidden">
                            {chartPoints.length === 0 ? (
                                <span className="text-[10px] font-bold text-slate-400 italic">No play rows recorded yet. Complete a game to see your graph!</span>
                            ) : (
                                <>
                                    <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                                        <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeDasharray="3" />
                                        <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" strokeDasharray="3" />
                                        <line x1="0" y1="80" x2="300" y2="80" stroke="#f1f5f9" strokeDasharray="3" />
                                        
                                        <path d={fillD} fill="url(#chart-grad)" />
                                        <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="3.5" strokeLinecap="round" />
                                        
                                        {chartPoints.map((p, i) => (
                                            <g key={i}>
                                                <circle cx={p.x} cy={p.y} r="4" fill="#8b5cf6" stroke="#ffffff" strokeWidth="1.5" />
                                            </g>
                                        ))}
                                    </svg>
                                    <div className="absolute bottom-1 inset-x-4 flex justify-between text-[7px] font-black text-slate-400 font-mono">
                                        <span>PLAY 1</span>
                                        <span>PLAY 2</span>
                                        <span>PLAY 3</span>
                                        <span>PLAY 4</span>
                                        <span>PLAY 5</span>
                                        <span>PLAY 6</span>
                                        <span>LAST</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Level Status Panel (3 cols) */}
                    <div className="md:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Level Status</h2>
                            
                            <div className="flex flex-col items-center py-4">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 text-white flex flex-col items-center justify-center shadow-md relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/10 opacity-30 rotate-12 transform scale-150" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200">LVL</span>
                                    <span className="text-3xl font-black font-mono mt-0.5">{userLevel}</span>
                                </div>
                                <span className="text-xs font-black text-slate-800 mt-4">Rank Level</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-1.5">
                                <span className="text-[9px] font-black uppercase text-slate-400">XP Progress</span>
                                <span className="text-[9px] font-bold text-slate-500 font-mono">{xpProgress} / 1000 XP</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: `${xpPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard/Personal Bests (3 cols) */}
                    <div className="md:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">🏆 High Records</h2>
                            
                            {personalBests.length === 0 ? (
                                <div className="text-center py-10 text-[10px] font-bold text-slate-400 italic">No scores recorded yet. Complete a game to see your personal bests!</div>
                            ) : (
                                <div className="space-y-2.5">
                                    {personalBests.map((pb, idx) => (
                                        <div key={pb.table} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 border border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 w-3">{idx + 1}</span>
                                                <span className="text-xs font-black text-slate-700 truncate max-w-28">{pb.game}</span>
                                            </div>
                                            <span className="text-xs font-black text-violet-600 font-mono">{pb.bestScore.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="text-center border-t border-slate-100 pt-3">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Your Top Game Records</span>
                        </div>
                    </div>

                </section>

                {/* 4. DYNAMIC FEATURED GAMES SECTION */}
                {featuredWithDetails.length > 0 && (
                    <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-black tracking-tight text-slate-800">Your Recent Workouts</h2>
                            <a href="#games-catalog" className="text-xs font-bold text-violet-600 hover:text-violet-700 transition">
                                View All
                            </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {featuredWithDetails.map(game => (
                                <Link
                                    key={game.table}
                                    to={`/games/${game.id}`}
                                    className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-sm hover:shadow-md hover:border-violet-300 transition-all duration-300 flex flex-col justify-between h-48 hover:-translate-y-1"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-lg shadow-inner">
                                        {game.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-slate-800 mt-4 group-hover:text-violet-600 transition truncate">{game.game}</h3>
                                        <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-snug line-clamp-2">{game.desc}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 border-t border-slate-100/60 pt-2 text-[9px] font-bold text-slate-400 font-mono">
                                        <span>Played: {game.plays}</span>
                                        <span className="text-violet-600">Best: {game.bestScore}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* 5. CHOOSE A GAME CATALOG SECTION */}
                <section id="games-catalog" className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
                    <div className="mb-6 border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-black tracking-tight text-slate-900">Choose a game</h2>
                        <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Select any exercise to start training your skills</p>
                    </div>

                    <div className="space-y-8">
                        {gameSections.map(section => {
                            let themeColor = "text-violet-600 bg-violet-50 border-violet-100";
                            let cardHoverBorder = "hover:border-violet-300";
                            if (section.title.includes("Reflex")) {
                                themeColor = "text-rose-600 bg-rose-50 border-rose-100";
                                cardHoverBorder = "hover:border-rose-300";
                            } else if (section.title.includes("Perception")) {
                                themeColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
                                cardHoverBorder = "hover:border-emerald-300";
                            } else if (section.title.includes("Logic")) {
                                themeColor = "text-amber-600 bg-amber-50 border-amber-100";
                                cardHoverBorder = "hover:border-amber-300";
                            }

                            return (
                                <div key={section.title} className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${themeColor}`}>
                                            {section.title}
                                        </span>
                                    </div>
                                    
                                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                        {section.games.map(game => (
                                            <Link
                                                key={game.id}
                                                to={`/games/${game.id}`}
                                                className={`group rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col justify-between h-36 ${cardHoverBorder}`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">{game.icon}</span>
                                                            <h4 className="text-sm font-black text-slate-800 truncate group-hover:text-violet-600 transition">
                                                                {game.name}
                                                            </h4>
                                                        </div>
                                                        <p className="mt-2 text-[11px] leading-relaxed text-slate-400 font-medium line-clamp-2">
                                                            {game.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Cognitive</span>
                                                    <span className="text-[10px] font-bold text-violet-600 group-hover:translate-x-1 transform transition">Play →</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

            </div>

            {/* MODALS */}
            {scoreModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4 py-6">
                    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-fade-in">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 bg-slate-50">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-violet-600">Scores Summary</p>
                                <h2 className="mt-1 text-2xl font-black text-slate-800 tracking-tight">
                                    Total Score: {totalScore.toLocaleString()}
                                </h2>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Highest recorded score for each mental exercise.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setScoreModalOpen(false)}
                                className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition cursor-pointer"
                                aria-label="Close scores modal"
                            >
                                Close
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-3">
                            {highScores.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 p-6 text-center text-xs font-bold text-slate-400 border border-slate-100">
                                    No game scores registered yet. Start playing to track scores!
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {highScores.map(item => (
                                        <div
                                            key={item.table}
                                            className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 hover:border-violet-300 transition"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-xs font-black text-slate-800">
                                                        {item.game}
                                                    </h3>
                                                    <p className="mt-1 text-[10px] font-bold text-slate-400 font-mono">
                                                        Total Rounds: {item.plays}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black uppercase tracking-wider text-violet-600">
                                                        Record
                                                    </p>
                                                    <p className="mt-0.5 text-xl font-black text-slate-900 font-mono">
                                                        {item.bestScore}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {gamesPlayedModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4 py-6">
                    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-fade-in">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6 bg-slate-50">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-violet-600">Workout Counts</p>
                                <h2 className="mt-1 text-2xl font-black text-slate-800 tracking-tight">
                                    Total Mental Workouts: {gamesPlayed}
                                </h2>
                                <p className="text-xs font-semibold text-slate-400 mt-1">Number of plays grouped by mental exercise.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setGamesPlayedModalOpen(false)}
                                className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition cursor-pointer"
                                aria-label="Close games played modal"
                            >
                                Close
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-3">
                            {highScores.length === 0 ? (
                                <div className="rounded-2xl bg-slate-50 p-6 text-center text-xs font-bold text-slate-400 border border-slate-100">
                                    No completed workouts found yet.
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {highScores
                                        .filter(item => item.plays > 0)
                                        .map(item => (
                                            <div
                                                key={item.table}
                                                className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 hover:border-violet-300 transition"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-xs font-black text-slate-800">
                                                            {item.game}
                                                        </h3>
                                                        <p className="mt-1 text-[10px] font-bold text-slate-400">
                                                            Best score: <span className="font-mono">{item.bestScore}</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black uppercase tracking-wider text-violet-600">
                                                            Played
                                                        </p>
                                                        <p className="mt-0.5 text-xl font-black text-slate-900 font-mono">
                                                            {item.plays}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Embedded CSS animations */}
            <style>{`
                @keyframes float-animation {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float-animation 4s ease-in-out infinite;
                }
                #chart-grad stop {
                    stop-color: #8b5cf6;
                }
            `}</style>

        </main>
    );
}

export default Dashboard;
