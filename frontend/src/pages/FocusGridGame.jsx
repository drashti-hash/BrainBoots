import { useState, useEffect, useRef } from "react";
import { addFocusGridScore } from "../services/api";

function FocusGridGame() {
    const [grid, setGrid] = useState([]);
    const [targetNumber, setTargetNumber] = useState(null);
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(5);
    const [message, setMessage] = useState("👉 Press START to play!");
    const [isPlaying, setIsPlaying] = useState(false);
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        try {
            const saved = localStorage.getItem("brainbootsResult:add-focus-grid-score/");
            if (saved) return JSON.parse(saved).bestScore || 0;
        } catch {}
        return 0;
    });
    const [foundPosition, setFoundPosition] = useState(null);
    
    const intervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const generateGrid = () => {
        let numbers = [];
        
        for (let i = 0; i < 25; i++) {
            numbers.push(Math.floor(Math.random() * 100));
        }
        
        const randomIndex = Math.floor(Math.random() * 25);
        const target = Math.floor(Math.random() * 100);
        numbers[randomIndex] = target;
        
        setGrid(numbers);
        setTargetNumber(target);
        setFoundPosition(null);
    };

    const startGame = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setLevel(1);
        setScore(0);
        setTimer(5);
        setTotalAttempts(0);
        setMessage("🔍 FIND the target number!");
        setIsPlaying(true);
        generateGrid();
    };

    const gameOver = async () => {
        setIsPlaying(false);
        setMessage("❌ GAME OVER! Wrong number!");
        
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        try {
            await addFocusGridScore({
                level_reached: level,
                score: score,
                total_attempts: totalAttempts
            });
            console.log("Score Saved");
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (isPlaying && timer > 0) {
            intervalRef.current = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0 && isPlaying) {
            gameOver();
        }
        
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [timer, isPlaying]);

    const handleClick = (number, index) => {
        if (!isPlaying) return;
        
        setTotalAttempts(prev => prev + 1);
        
        if (number === targetNumber) {
            setFoundPosition(index);
            const newScore = score + 10;
            const newLevel = level + 1;
            
            setScore(newScore);
            setLevel(newLevel);
            setMessage("✅ CORRECT! +10 points!");
            
            if (newScore > highScore) {
                setHighScore(newScore);
            }
            
            setTimer(5);
            generateGrid();
        } else {
            gameOver();
        }
    };

    const getTimerColor = () => {
        if (timer <= 2) return "text-rose-600 bg-rose-50 border border-rose-200";
        return "text-emerald-700 bg-emerald-50 border border-emerald-200";
    };

    const getDifficulty = () => {
        if (level <= 5) return { text: "Easy", color: "text-emerald-700", bg: "bg-emerald-50" };
        if (level <= 10) return { text: "Medium", color: "text-slate-700", bg: "bg-slate-100" };
        if (level <= 15) return { text: "Hard", color: "text-rose-700", bg: "bg-rose-50" };
        return { text: "Expert", color: "text-rose-800", bg: "bg-rose-100" };
    };

    const difficulty = getDifficulty();

    
    // --- MULTIPLAYER AUTO-START & SCORE SYNC ---
    useEffect(() => {
        if (window.brainbootsIsMultiplayer && window.brainbootsScoreUpdate) {
            window.brainbootsScoreUpdate(score);
        }
    }, [score]);
    useEffect(() => {
        if (window.brainbootsIsMultiplayer) {
            const handleStart = () => {
                if (typeof startGame === 'function') {
                    startGame();
                }
            };
            window.addEventListener("brainboots:start-game", handleStart);
            return () => {
                window.removeEventListener("brainboots:start-game", handleStart);
            };
        }
    }, []);
    // -----------------------------------------

return (
        <div className="bg-slate-50 p-4 md:p-6 font-sans flex items-center justify-center w-full">
            <div className="w-full max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-5">
                        <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
                            🎯 FOCUS GRID CHALLENGE
                        </h1>
                    </div>
                    
                    {/* Stats Panel */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-5 bg-slate-50 border-b border-slate-200">
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Level</div>
                            <div className="text-2xl font-black text-slate-800">{level}</div>
                            <div className={`text-xs mt-1 px-2.5 py-0.5 rounded-full inline-block font-bold border border-slate-200 ${difficulty.bg} ${difficulty.color}`}>
                                {difficulty.text}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Score</div>
                            <div className="text-2xl font-black text-slate-800">{score}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">High Score</div>
                            <div className="text-2xl font-black text-slate-800">{highScore}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Timer</div>
                            <div className={`text-xl font-black px-3 py-1 rounded-xl inline-block mt-1 ${getTimerColor()}`}>
                                {timer}s
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Target</div>
                            <div className="text-2xl font-black text-emerald-600">{targetNumber !== null ? targetNumber : "?"}</div>
                        </div>
                    </div>
                    
                    {/* Game Area */}
                    <div className="p-6 md:p-8">
                        {/* Status Message */}
                        <div className="text-center mb-6">
                            <div className={`
                                inline-block px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm border border-slate-200
                                ${message.includes("FIND") ? 'bg-amber-50 text-amber-800' : 
                                  message.includes("CORRECT") ? 'bg-emerald-50 text-emerald-800' :
                                  message.includes("GAME OVER") ? 'bg-rose-50 text-rose-800' :
                                  'bg-slate-100 text-slate-800'}
                            `}>
                                {message}
                            </div>
                        </div>
                        
                        {/* Target Number Display */}
                        {isPlaying && targetNumber !== null && (
                            <div className="text-center mb-6">
                                <div className="inline-block bg-emerald-50 border border-emerald-200 px-8 py-4 rounded-2xl shadow-sm">
                                    <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-1">🔍 Find this number:</p>
                                    <p className="text-5xl font-black text-slate-800">{targetNumber}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* 5x5 Grid */}
                        {isPlaying && grid.length > 0 && (
                            <div className="flex justify-center">
                                <div className="grid grid-cols-5 gap-2 md:gap-3 bg-slate-100 p-4 md:p-6 rounded-3xl shadow-inner border border-slate-200">
                                    {grid.map((number, index) => {
                                        const isTarget = number === targetNumber;
                                        const isFound = foundPosition === index;
                                        
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleClick(number, index)}
                                                className={`
                                                    w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl
                                                    font-bold text-base md:text-lg
                                                    transition-all duration-200 transform
                                                    flex items-center justify-center
                                                    ${isTarget && isFound 
                                                        ? 'bg-emerald-600 text-white scale-105 shadow-sm' 
                                                        : 'bg-white text-slate-700 hover:bg-slate-50 hover:scale-105 shadow-sm border border-slate-200'
                                                    }
                                                    focus:outline-none cursor-pointer
                                                `}
                                            >
                                                {number}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        {/* Progress Indicator */}
                        {isPlaying && (
                            <div className="mt-6 text-center">
                                <div className="flex justify-center gap-1.5">
                                    {[...Array(5)].map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                timer > (idx + 1) * 1 ? 'bg-emerald-600' : 'bg-slate-200'
                                            }`}
                                            style={{ width: `${100 / 5}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Speed Tip for higher levels */}
                        {isPlaying && level >= 6 && (
                            <div className="mt-4 text-center">
                                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-100 inline-block px-3 py-1 rounded-full font-bold">
                                    ⚡ Getting faster! You have only {timer} seconds!
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Start Button */}
                    {!isPlaying && (
                        <div className="px-5 pb-6 flex gap-4 justify-center">
                            <button
                                onClick={startGame}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm animate-pulse"
                            >
                                🚀 START GAME
                            </button>
                        </div>
                    )}
                    
                    {/* Game Over Results */}
                    {!isPlaying && message.includes("GAME OVER") && (
                        <div className="mx-5 mb-5 p-5 bg-emerald-50 rounded-2xl border border-emerald-200">
                            <h3 className="text-xl font-bold text-slate-800 text-center mb-3">🎮 GAME OVER</h3>
                            <div className="flex flex-wrap justify-center gap-8 text-center">
                                <div>
                                    <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">LEVEL REACHED</div>
                                    <div className="text-4xl font-black text-slate-800">{level}</div>
                                </div>
                                <div>
                                    <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">FINAL SCORE</div>
                                    <div className="text-4xl font-black text-slate-800">{score}</div>
                                </div>
                                <div>
                                    <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">ATTEMPTS</div>
                                    <div className="text-3xl font-black text-slate-800">{totalAttempts}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FocusGridGame;