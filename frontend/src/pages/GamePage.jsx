import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { games } from "../data/gameCatalog";

function GamePage() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [gameInstanceKey, setGameInstanceKey] = useState(0);
    const [result, setResult] = useState(null);
    const game = games.find(item => item.id === gameId);

    useEffect(() => {
        const handleGameResult = (event) => {
            setResult(event.detail);
        };

        window.addEventListener("brainboots:game-result", handleGameResult);

        return () => {
            window.removeEventListener("brainboots:game-result", handleGameResult);
        };
    }, []);

    if (!game) {
        return <Navigate to="/dashboard" replace />;
    }

    const ActiveGame = game.component;
    const currentGameIndex = games.findIndex(item => item.id === game.id);
    const nextGame = games[(currentGameIndex + 1) % games.length];

    const handlePlayAgain = () => {
        setResult(null);
        setGameInstanceKey(prev => prev + 1);
    };

    const handleNextRecommendedGame = () => {
        setResult(null);
        navigate(`/games/${nextGame.id}`);
    };

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur md:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            to="/dashboard"
                            className="text-sm font-bold text-emerald-700 hover:text-emerald-800"
                        >
                            Back to dashboard
                        </Link>
                        <h1 className="mt-1 text-2xl font-black tracking-tight">
                            {game.name}
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            {game.section}
                        </p>
                    </div>
                    <span className="inline-flex w-fit rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">
                        {game.icon}
                    </span>
                </div>
            </header>

            <section className="mx-auto flex w-full max-w-6xl justify-center px-4 py-6 md:px-8">
                <div className="w-full animate-fadeIn">
                    <ActiveGame key={gameInstanceKey} />
                </div>
            </section>

            {result && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
                    <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-xl">
                        <div className="border-b border-slate-200 p-6">
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                                Game Result
                            </p>
                            <h2 className="mt-1 text-2xl font-black tracking-tight">
                                {result.gameName || game.name}
                            </h2>
                            <p className="mt-2 text-sm font-semibold text-slate-500">
                                {result.performance}
                            </p>
                        </div>

                        <div className="grid gap-3 p-6 sm:grid-cols-2">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Score
                                </p>
                                <p className="mt-2 text-3xl font-black text-slate-950">
                                    {result.score}
                                </p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Best Score
                                </p>
                                <p className="mt-2 text-3xl font-black text-slate-950">
                                    {result.bestScore}
                                </p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Accuracy
                                </p>
                                <p className="mt-2 text-3xl font-black text-slate-950">
                                    {result.accuracy}
                                </p>
                            </div>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                    Time
                                </p>
                                <p className="mt-2 text-3xl font-black text-slate-950">
                                    {result.time}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 border-t border-slate-200 p-6 sm:grid-cols-3">
                            <button
                                type="button"
                                onClick={handlePlayAgain}
                                className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                            >
                                Play Again
                            </button>
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200"
                            >
                                Back to Dashboard
                            </Link>
                            <button
                                type="button"
                                onClick={handleNextRecommendedGame}
                                className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200"
                            >
                                Next Game
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </main>
    );
}

export default GamePage;
