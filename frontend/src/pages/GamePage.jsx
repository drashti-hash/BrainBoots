import { useEffect, useState, Suspense } from "react";
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
        <main className="min-h-screen bg-[#f5f5fa] text-[#1e1b4b]">
            <header className="sticky top-0 z-30 border-b border-[#c4c2f0]/20 bg-white/95 px-4 py-2 shadow-xs backdrop-blur md:px-8">
                <div className="mx-auto flex max-w-[1720px] w-full items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-1 text-xs font-extrabold text-[#6c5ce7] hover:text-[#a29bfe] transition-colors"
                            style={{ textDecoration: "none" }}
                        >
                            <span style={{ fontSize: "14px" }}>←</span> Back
                        </Link>
                        <div className="h-4 w-[1px] bg-[#c4c2f0]/40"></div>
                        <div>
                            <h1 className="text-base font-black tracking-tight text-[#6c5ce7] m-0 leading-tight">
                                {game.name}
                            </h1>
                            <p className="text-[10px] font-semibold text-[#6c5ce7]/50 m-0 leading-none">
                                {game.section}
                            </p>
                        </div>
                    </div>
                    <span className="rounded-md bg-[#ede9ff]/30 px-2.5 py-1 text-[11px] font-black text-[#6c5ce7]">
                        {game.icon}
                    </span>
                </div>
            </header>

            <section className="mx-auto flex w-full max-w-[1720px] w-full justify-center px-4 py-3 md:px-8">
                <div className="w-full animate-fadeIn">
                    <Suspense fallback={
                        <div className="flex h-64 items-center justify-center rounded-2xl border border-indigo-100 bg-white p-6 font-sans text-sm font-semibold text-indigo-500 shadow-sm animate-pulse">
                            ⏳ Preparing your workout...
                        </div>
                    }>
                        <ActiveGame key={gameInstanceKey} />
                    </Suspense>
                </div>
            </section>

            {result && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1b4b]/40 px-4 py-6 backdrop-blur-xs">
                    <div className="w-full max-w-xl rounded-2xl border border-[#c4c2f0]/30 bg-white shadow-2xl">
                        <div className="border-b border-[#c4c2f0]/25 p-6">
                            <p className="text-xs font-bold uppercase tracking-wide text-[#a29bfe]">
                                Game Result
                            </p>
                            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#6c5ce7]">
                                {result.gameName || game.name}
                            </h2>
                            <p className="mt-2 text-sm font-semibold text-[#6c5ce7]/60">
                                {result.performance}
                            </p>
                        </div>

                        <div className="grid gap-3 p-6 sm:grid-cols-2">
                            <div className="rounded-lg border border-[#c4c2f0]/20 bg-[#f5f5fa] p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-[#6c5ce7]/60">
                                    Score
                                </p>
                                <p className="mt-2 text-3xl font-black text-[#1e1b4b] font-mono">
                                    {result.score}
                                </p>
                            </div>
                            <div className="rounded-lg border border-[#c4c2f0]/20 bg-[#f5f5fa] p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-[#6c5ce7]/60">
                                    Best Score
                                </p>
                                <p className="mt-2 text-3xl font-black text-[#1e1b4b] font-mono">
                                    {result.bestScore}
                                </p>
                            </div>
                            <div className="rounded-lg border border-[#c4c2f0]/20 bg-[#f5f5fa] p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-[#6c5ce7]/60">
                                    Accuracy
                                </p>
                                <p className="mt-2 text-3xl font-black text-[#1e1b4b] font-mono">
                                    {result.accuracy}
                                </p>
                            </div>
                            <div className="rounded-lg border border-[#c4c2f0]/20 bg-[#f5f5fa] p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-[#6c5ce7]/60">
                                    Time
                                </p>
                                <p className="mt-2 text-3xl font-black text-[#1e1b4b] font-mono">
                                    {result.time}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 border-t border-[#c4c2f0]/20 p-6 sm:grid-cols-3">
                            <button
                                type="button"
                                onClick={handlePlayAgain}
                                className="rounded-lg bg-[#6c5ce7] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#6c5ce7]/90 focus:outline-none focus:ring-4 focus:ring-[#a29bfe]/25 cursor-pointer"
                            >
                                Play Again
                            </button>
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center justify-center rounded-lg border border-[#c4c2f0]/55 bg-white px-4 py-3 text-sm font-bold text-[#6c5ce7] transition hover:bg-[#ede9ff]/20 focus:outline-none focus:ring-4 focus:ring-[#c4c2f0]/20"
                            >
                                Back to Dashboard
                            </Link>
                            <button
                                type="button"
                                onClick={handleNextRecommendedGame}
                                className="rounded-lg bg-[#a29bfe] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#a29bfe]/90 focus:outline-none focus:ring-4 focus:ring-[#a29bfe]/25 cursor-pointer"
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
