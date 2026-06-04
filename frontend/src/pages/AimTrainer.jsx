import { useState, useEffect, useRef } from "react";
import { addAimScore } from "../services/api";

function AimTrainer() {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameStarted, setGameStarted] = useState(false);
    const [targetPosition, setTargetPosition] = useState({ top: 150, left: 250 });
    const [totalClicks, setTotalClicks] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [highScore, setHighScore] = useState(0);
    
    const gameAreaRef = useRef(null);
    const [areaDimensions, setAreaDimensions] = useState({ width: 800, height: 500 });

    useEffect(() => {
        if (gameAreaRef.current) {
            const rect = gameAreaRef.current.getBoundingClientRect();
            setAreaDimensions({ width: rect.width, height: rect.height });
        }
    }, [gameStarted]);

    const moveTarget = () => {
        if (!gameAreaRef.current) return;
        
        const rect = gameAreaRef.current.getBoundingClientRect();
        const targetSize = 70;
        const maxTop = Math.max(0, rect.height - targetSize - 20);
        const maxLeft = Math.max(0, rect.width - targetSize - 20);
        
        const top = Math.random() * maxTop;
        const left = Math.random() * maxLeft;
        
        setTargetPosition({ top, left });
    };

    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setTotalClicks(0);
        setAccuracy(0);
        setGameStarted(true);
        
        setTimeout(() => {
            moveTarget();
        }, 50);
    };

    const finishGame = async () => {
        setGameStarted(false);
        
        const calculatedAccuracy = totalClicks === 0 ? 0 : ((score / totalClicks) * 100).toFixed(1);
        setAccuracy(calculatedAccuracy);
        
        if (score > highScore) {
            setHighScore(score);
        }
        
        try {
            await addAimScore({
                score: score,
                total_clicks: totalClicks,
                accuracy: parseFloat(calculatedAccuracy)
            });
            console.log("Aim Score Saved");
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        let timer;
        if (gameStarted && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameStarted) {
            finishGame();
        }
        return () => clearInterval(timer);
    }, [gameStarted, timeLeft]);

    const handleTargetClick = (e) => {
        e.stopPropagation();
        setScore((prev) => prev + 1);
        setTotalClicks((prev) => prev + 1);
        moveTarget();
    };

    const handleMissClick = () => {
        if (gameStarted) {
            setTotalClicks((prev) => prev + 1);
        }
    };

    
    // --- MULTIPLAYER AUTO-START & SCORE SYNC ---
    useEffect(() => {
        if (window.brainbootsIsMultiplayer && window.brainbootsScoreUpdate) {
            window.brainbootsScoreUpdate(score);
        }
    }, [score]);
    useEffect(() => {
        if (window.brainbootsIsMultiplayer && typeof startGame === 'function') {
            startGame();
        }
    }, []);
    // -----------------------------------------

return (
        <div className="bg-slate-50 p-4 md:p-6 font-sans flex items-center justify-center w-full">
            <div className="w-full max-w-5xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-5">
                        <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
                            🎯 AIM TRAINER
                        </h1>
                    </div>
                    
                    {/* Stats Panel */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200">
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Time Left</div>
                            <div className={`text-2xl font-black ${timeLeft <= 5 && gameStarted ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                                {timeLeft}s
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Score</div>
                            <div className="text-2xl font-black text-slate-800">{score}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Accuracy</div>
                            <div className="text-2xl font-black text-slate-800">
                                {!gameStarted && timeLeft === 0 ? `${accuracy}%` : totalClicks > 0 ? `${((score / totalClicks) * 100).toFixed(0)}%` : '-'}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">High Score</div>
                            <div className="text-2xl font-black text-slate-800">{highScore}</div>
                        </div>
                    </div>
                    
                    {/* Game Area */}
                    <div 
                        ref={gameAreaRef}
                        onClick={handleMissClick}
                        className="relative bg-slate-100 m-5 rounded-2xl overflow-hidden shadow-inner border border-slate-200"
                        style={{ height: "500px", cursor: "crosshair" }}
                    >
                        {!gameStarted ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🎯</div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-6">Ready to Test Your Aim?</h3>
                                    <button
                                        onClick={startGame}
                                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 mx-auto text-sm animate-pulse"
                                    >
                                        🚀 Start Game
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Target */}
                                <div
                                    onClick={handleTargetClick}
                                    className="absolute cursor-pointer transition-all duration-100 hover:scale-110 active:scale-95"
                                    style={{
                                        top: targetPosition.top,
                                        left: targetPosition.left,
                                        width: "70px",
                                        height: "70px"
                                    }}
                                >
                                    <div className="relative w-full h-full">
                                        <div className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-75"></div>
                                        <div className="absolute inset-0 rounded-full bg-rose-600 shadow-md flex items-center justify-center border-2 border-white">
                                            <div className="w-4 h-4 rounded-full bg-white"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Live stats during game */}
                                <div className="absolute top-3 right-3 bg-white px-4 py-1.5 rounded-xl text-slate-700 text-xs font-bold shadow-sm border border-slate-200">
                                    Hits: {score} | Misses: {totalClicks - score}
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* Game Finished Results */}
                    {!gameStarted && timeLeft === 0 && (
                        <div className="mx-5 mb-5 p-5 bg-emerald-50 rounded-2xl border border-emerald-200">
                            <h3 className="text-xl font-bold text-slate-800 text-center mb-3">🎉 GAME FINISHED!</h3>
                            <div className="flex flex-wrap justify-center gap-8 text-center">
                                <div>
                                    <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">FINAL SCORE</div>
                                    <div className="text-4xl font-black text-slate-800">{score}</div>
                                </div>
                                <div>
                                    <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">ACCURACY</div>
                                    <div className="text-4xl font-black text-slate-800">{accuracy}%</div>
                                </div>
                                <div>
                                    <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">TOTAL CLICKS</div>
                                    <div className="text-3xl font-black text-slate-800">{totalClicks}</div>
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <button
                                    onClick={startGame}
                                    className="px-8 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all shadow-sm text-sm"
                                >
                                    🔄 Play Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AimTrainer;