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
    const dashboardStats = dashboardData.stats || {};
    const totalScore = dashboardStats.totalScore || 0;
    const bestScore = dashboardStats.bestScore || 0;
    const streak = dashboardStats.streak || 0;
    const gamesPlayed = dashboardStats.gamesPlayed || 0;
    const highScores = dashboardData.highScores || [];
    const analytics = gameSections.map(section => ({
        title: section.title,
        count: section.games.length,
        percent: Math.round((section.games.length / totalGames) * 100)
    }));

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await getDashboardData();

                if (response.data.success) {
                    setDashboardData({
                        stats: response.data.stats || {},
                        highScores: response.data.highScores || [],
                        tables: [],
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

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white px-4 py-5 shadow-sm md:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
                            BrainBoots Dashboard
                        </p>
                        <h1 className="mt-1 text-3xl font-black tracking-tight">
                            Welcome, {username}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/multiplayer"
                            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 shadow-sm"
                        >
                            🎮 Multiplayer Arena
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                        >
                            Logout
                        </Link>
                    </div>

                </div>
            </header>

            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-8">
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Total Games
                        </p>
                        <p className="mt-3 text-3xl font-black">
                            {totalGames}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setScoreModalOpen(true)}
                        className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-100"
                    >
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Scores
                        </p>
                        <p className="mt-3 text-3xl font-black">
                            {totalScore}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                            Best: {bestScore}
                        </p>
                    </button>
                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Streak
                        </p>
                        <p className="mt-3 text-3xl font-black">
                            {streak} days
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setGamesPlayedModalOpen(true)}
                        className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-100"
                    >
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Games Played
                        </p>
                        <p className="mt-3 text-3xl font-black">
                            {gamesPlayed}
                        </p>
                    </button>
                </section>

                {isLoading && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                        Fetching dashboard data...
                    </div>
                )}

                {errorMessage && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                        {errorMessage}
                    </div>
                )}

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-lg font-black tracking-tight">
                                Analytics
                            </h2>
                            <p className="text-sm text-slate-500">
                                Game category coverage across your training library.
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {analytics.map(item => (
                            <div key={item.title}>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="font-bold text-slate-700">
                                        {item.title}
                                    </span>
                                    <span className="font-semibold text-slate-500">
                                        {item.count} games
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-200">
                                    <div
                                        className="h-2 rounded-full bg-emerald-500"
                                        style={{ width: `${item.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid gap-6">
                    <div>
                        <h2 className="text-xl font-black tracking-tight">
                            Choose a game
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Click any game to open it on its own page.
                        </p>
                    </div>

                    {gameSections.map(section => (
                        <div key={section.title} className="grid gap-3">
                            <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">
                                {section.title}
                            </h3>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {section.games.map(game => (
                                    <Link
                                        key={game.id}
                                        to={`/games/${game.id}`}
                                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                                                    {game.icon}
                                                </p>
                                                <h4 className="mt-2 text-base font-black text-slate-950">
                                                    {game.name}
                                                </h4>
                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                    {game.desc}
                                                </p>
                                            </div>
                                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                                                Play
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            </div>

            {scoreModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
                    <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                                    Scores
                                </p>
                                <h2 className="mt-1 text-2xl font-black tracking-tight">
                                    Total Score: {totalScore}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Highest score by game
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setScoreModalOpen(false)}
                                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200"
                                aria-label="Close scores modal"
                            >
                                Close
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-5">
                            {highScores.length === 0 ? (
                                <div className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                                    No scores found yet.
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {highScores.map(item => (
                                        <div
                                            key={item.table}
                                            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-sm font-black text-slate-900">
                                                        {item.game}
                                                    </h3>
                                                    <p className="mt-1 text-xs font-semibold text-slate-500">
                                                        Plays: {item.plays}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                                                        Highest
                                                    </p>
                                                    <p className="mt-1 text-2xl font-black text-slate-950">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
                    <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                                    Games Played
                                </p>
                                <h2 className="mt-1 text-2xl font-black tracking-tight">
                                    Total Played: {gamesPlayed}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Played games grouped by game
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setGamesPlayedModalOpen(false)}
                                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200"
                                aria-label="Close games played modal"
                            >
                                Close
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-5">
                            {highScores.length === 0 ? (
                                <div className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                                    No played games found yet.
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {highScores
                                        .filter(item => item.plays > 0)
                                        .map(item => (
                                            <div
                                                key={item.table}
                                                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-sm font-black text-slate-900">
                                                            {item.game}
                                                        </h3>
                                                        <p className="mt-1 text-xs font-semibold text-slate-500">
                                                            Highest score: {item.bestScore}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                                                            Played
                                                        </p>
                                                        <p className="mt-1 text-2xl font-black text-slate-950">
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
        </main>
    );
}

export default Dashboard;
