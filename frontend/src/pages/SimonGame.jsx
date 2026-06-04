import { useState, useRef, useEffect } from "react";
import { addSimonScore } from "../services/api";

const colors = [
    { name: "red", bg: "bg-red-500", activeBg: "bg-red-400", text: "RED" },
    { name: "green", bg: "bg-green-500", activeBg: "bg-green-400", text: "GREEN" },
    { name: "teal", bg: "bg-teal-500", activeBg: "bg-teal-400", text: "TEAL" },
    { name: "yellow", bg: "bg-yellow-500", activeBg: "bg-yellow-400", text: "YELLOW" }
];

function SimonGame() {
    const [gameSequence, setGameSequence] = useState([]);
    const [userSequence, setUserSequence] = useState([]);
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeColor, setActiveColor] = useState("");
    const [message, setMessage] = useState("👉 Press START to play!");
    const [highScore, setHighScore] = useState(0);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const startGame = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setGameSequence([]);
        setUserSequence([]);
        setLevel(1);
        setScore(0);
        setMessage("🎵 Watch the sequence...");
        setIsPlaying(true);
        startNewRound([]);
    };

    const startNewRound = (currentSequence) => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)].name;
        const newSequence = [...currentSequence, randomColor];
        setGameSequence(newSequence);
        playSequenceForUser(newSequence);
    };

    const playSequenceForUser = (sequence) => {
        setIsShowingSequence(true);
        setMessage("👁️ WATCH the colors flash...");
        
        let index = 0;
        
        intervalRef.current = setInterval(() => {
            setActiveColor(sequence[index]);
            
            setTimeout(() => {
                setActiveColor("");
            }, 400);
            
            index++;
            
            if (index >= sequence.length) {
                clearInterval(intervalRef.current);
                setIsShowingSequence(false);
                setMessage("🎯 YOUR TURN! Repeat the sequence");
                setUserSequence([]);
            }
        }, 700);
    };

    const handleColorClick = (color) => {
        if (!isPlaying || isShowingSequence) return;
        
        setActiveColor(color);
        setTimeout(() => setActiveColor(""), 200);
        
        const updatedUserSequence = [...userSequence, color];
        setUserSequence(updatedUserSequence);
        
        const expectedColor = gameSequence[updatedUserSequence.length - 1];
        
        if (color !== expectedColor) {
            gameOver();
            return;
        }
        
        if (updatedUserSequence.length === gameSequence.length) {
            const newScore = score + 10;
            const newLevel = level + 1;
            
            setScore(newScore);
            setLevel(newLevel);
            setMessage("✨ CORRECT! Next level... ✨");
            
            if (newScore > highScore) {
                setHighScore(newScore);
            }
            
            timeoutRef.current = setTimeout(() => {
                if (isPlaying) {
                    startNewRound(gameSequence);
                }
            }, 1200);
        }
    };

    const gameOver = async () => {
        setIsPlaying(false);
        setMessage("💀 GAME OVER! Press START to play again");
        if (intervalRef.current) clearInterval(intervalRef.current);

        try {
            await addSimonScore({
                level_reached: level,
                score: score,
                total_moves: gameSequence.length
            });
            console.log("Simon Score Saved");
        } catch (error) {
            console.log(error);
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
            <div className="w-full max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-5">
                        <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
                            🔷 SIMON MEMORY
                        </h1>
                    </div>
                    
                    {/* Stats Panel */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200">
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Level</div>
                            <div className="text-2xl font-black text-slate-800">{level}</div>
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
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Sequence</div>
                            <div className="text-2xl font-black text-slate-800">{gameSequence.length}</div>
                        </div>
                    </div>
                    
                    {/* Game Area */}
                    <div className="p-6 md:p-8">
                        {/* Status Message */}
                        <div className="text-center mb-6">
                            <div className={`
                                inline-block px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm border border-slate-200
                                ${message.includes("WATCH") ? 'bg-amber-50 text-amber-800' : 
                                  message.includes("YOUR TURN") ? 'bg-emerald-50 text-emerald-800' :
                                  message.includes("CORRECT") ? 'bg-emerald-100 text-emerald-900' :
                                  message.includes("GAME OVER") ? 'bg-rose-50 text-rose-800' :
                                  'bg-slate-100 text-slate-800'}
                            `}>
                                {message}
                            </div>
                        </div>
                        
                        {/* Simon Game Board - Color Buttons */}
                        <div className="flex justify-center items-center">
                            <div className="grid grid-cols-2 gap-4 md:gap-6 bg-slate-100 p-6 rounded-3xl shadow-inner border border-slate-200">
                                {colors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => handleColorClick(color.name)}
                                        disabled={!isPlaying || isShowingSequence}
                                        className={`
                                            w-32 h-32 md:w-44 md:h-44 rounded-2xl 
                                            transition-all duration-100 transform
                                            font-bold text-xl text-white shadow-sm
                                            ${activeColor === color.name 
                                                ? `${color.activeBg} scale-95 ring-4 ring-white` 
                                                : `${color.bg} hover:brightness-110`
                                            }
                                            ${(!isPlaying || isShowingSequence) && 'opacity-60 cursor-not-allowed'}
                                            focus:outline-none
                                        `}
                                    >
                                        {color.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Sequence Length Indicator */}
                        {isPlaying && !isShowingSequence && gameSequence.length > 0 && (
                            <div className="mt-6 text-center">
                                <p className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-wider">Sequence to remember:</p>
                                <div className="flex justify-center gap-2 flex-wrap">
                                    {gameSequence.map((colorName, idx) => {
                                        const colorStyle = colors.find(c => c.name === colorName);
                                        return (
                                            <div
                                                key={idx}
                                                className={`w-3 h-3 rounded-full ${colorStyle?.bg} opacity-70`}
                                                title={`Position ${idx + 1}`}
                                            />
                                        );
                                    })}
                                </div>
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
                </div>
            </div>
        </div>
    );
}

export default SimonGame;