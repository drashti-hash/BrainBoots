import { useState, useEffect } from "react";
import { addOddColorScore } from "../services/api";

function OddColorGame() {
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [oddIndex, setOddIndex] = useState(null);
    const [boxes, setBoxes] = useState([]);
    const [message, setMessage] = useState("👉 Press START to play!");
    const [isPlaying, setIsPlaying] = useState(false);
    const [totalClicks, setTotalClicks] = useState(0);
    const [highScore, setHighScore] = useState(() => {
        try {
            const saved = localStorage.getItem("brainbootsResult:add-odd-color-score/");
            if (saved) return JSON.parse(saved).bestScore || 0;
        } catch {}
        return 0;
    });
    const [showHint, setShowHint] = useState(false);

    const generateGrid = () => {
        const totalBoxes = 9; 
        const randomOddIndex = Math.floor(Math.random() * totalBoxes);
        setOddIndex(randomOddIndex);
        
        const newBoxes = [];
        for (let i = 0; i < totalBoxes; i++) {
            newBoxes.push(i);
        }
        setBoxes(newBoxes);
    };

    const startGame = () => {
        setLevel(1);
        setScore(0);
        setTotalClicks(0);
        setMessage("🔍 FIND the different color!");
        setIsPlaying(true);
        setShowHint(false);
        generateGrid();
    };

    const handleBoxClick = async (index) => {
        if (!isPlaying) return;
        
        setTotalClicks(prev => prev + 1);
        
        if (index === oddIndex) {
            const newScore = score + 10;
            const newLevel = level + 1;
            
            setScore(newScore);
            setLevel(newLevel);
            setMessage("✅ CORRECT! +10 points!");
            
            if (newScore > highScore) {
                setHighScore(newScore);
            }
            
            setShowHint(true);
            setTimeout(() => setShowHint(false), 500);
            
            generateGrid();
        } else {
            setMessage("❌ GAME OVER! Wrong box!");
            setIsPlaying(false);
            
            try {
                await addOddColorScore({
                    level_reached: level,
                    score: score,
                    total_clicks: totalClicks + 1
                });
                console.log("Score Saved");
            } catch (error) {
                console.log(error);
            }
        }
    };

    const getDifficulty = () => {
        if (level <= 5) return { text: "Easy", color: "text-emerald-700", bg: "bg-emerald-50" };
        if (level <= 10) return { text: "Medium", color: "text-slate-700", bg: "bg-slate-100" };
        if (level <= 15) return { text: "Hard", color: "text-rose-700", bg: "bg-rose-50" };
        return { text: "Expert", color: "text-rose-800", bg: "bg-rose-100" };
    };

    const getBoxColors = () => {
        const levelDiff = Math.min(level, 20);
        
        if (levelDiff <= 5) {
            return { normal: "bg-emerald-500", odd: "bg-teal-500" };
        } else if (levelDiff <= 10) {
            return { normal: "bg-emerald-500", odd: "bg-emerald-600" };
        } else if (levelDiff <= 15) {
            return { normal: "bg-emerald-600", odd: "bg-emerald-700" };
        } else {
            return { normal: "bg-emerald-700", odd: "bg-emerald-800" };
        }
    };
    
    const colors = getBoxColors();
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
            <div className="w-full max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-5">
                        <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
                            👁️ FIND THE ODD COLOR
                        </h1>
                    </div>
                    
                    {/* Stats Panel */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200">
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
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Clicks</div>
                            <div className="text-2xl font-black text-slate-800">{totalClicks}</div>
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
                        
                        {/* Game Grid - 3x3 Boxes */}
                        {isPlaying && (
                            <div className="flex justify-center">
                                <div className="grid grid-cols-3 gap-3 md:gap-4 bg-slate-100 p-6 rounded-3xl shadow-inner border border-slate-200">
                                    {boxes.map((box, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleBoxClick(index)}
                                            className={`
                                                w-24 h-24 md:w-28 md:h-28 rounded-xl md:rounded-2xl
                                                transition-all duration-200 transform
                                                ${index === oddIndex ? colors.odd : colors.normal}
                                                hover:scale-105 hover:shadow-md active:scale-95
                                                focus:outline-none shadow-sm border border-white/20
                                            `}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Visual Hint Animation when correct */}
                        {showHint && (
                            <div className="mt-4 text-center animate-bounce">
                                <span className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-bold shadow-sm">
                                    🎉 +10 Points!
                                </span>
                            </div>
                        )}
                        
                        {/* Level Progress Indicator */}
                        {isPlaying && (
                            <div className="mt-6 text-center">
                                <p className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-wider">Find the odd one out</p>
                                <div className="flex justify-center gap-1.5">
                                    {[...Array(9)].map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                                idx === oddIndex ? 'bg-emerald-600 scale-125' : 'bg-slate-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Difficulty Tip */}
                        {isPlaying && level >= 6 && (
                            <div className="mt-4 text-center">
                                <p className="text-xs text-rose-700 bg-rose-50 border border-rose-100 inline-block px-3 py-1 rounded-full font-bold">
                                    ⚡ Getting harder! Colors are more similar now!
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
                                    <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">TOTAL CLICKS</div>
                                    <div className="text-3xl font-black text-slate-800">{totalClicks}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce {
                    animation: bounce 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}

export default OddColorGame;