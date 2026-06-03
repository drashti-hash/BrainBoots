import { useState, useRef, useEffect } from "react";
import { addNumberSequenceScore } from "../services/api";

function NumberSequenceGame() {
    const [sequence, setSequence] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState("👉 Press START to play!");
    const [showSequence, setShowSequence] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [highScore, setHighScore] = useState(0);
    
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const startGame = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setLevel(1);
        setScore(0);
        setTotalAttempts(0);
        setUserInput("");
        setMessage("🔢 REMEMBER the numbers!");
        setIsPlaying(true);
        generateSequence(1);
    };

    const generateSequence = (currentLevel) => {
        const numDigits = currentLevel + 1;
        let newSequence = [];
        
        for (let i = 0; i < numDigits; i++) {
            newSequence.push(Math.floor(Math.random() * 10));
        }
        
        setSequence(newSequence);
        setShowSequence(true);
        setMessage("👁️ WATCH the numbers carefully...");
        
        timeoutRef.current = setTimeout(() => {
            setShowSequence(false);
            setMessage("✏️ TYPE the numbers you saw!");
        }, 3000);
    };

    const checkAnswer = async () => {
        setTotalAttempts(prev => prev + 1);
        const correctAnswer = sequence.join("");
        
        if (userInput === correctAnswer) {
            const newScore = score + 10;
            const nextLevel = level + 1;
            
            setScore(newScore);
            setLevel(nextLevel);
            setUserInput("");
            setMessage("✅ CORRECT! +10 points!");
            
            if (newScore > highScore) {
                setHighScore(newScore);
            }
            
            generateSequence(nextLevel);
        } else {
            setMessage("❌ GAME OVER! Wrong sequence!");
            setIsPlaying(false);
            
            try {
                await addNumberSequenceScore({
                    level_reached: level,
                    score: score,
                    total_attempts: totalAttempts + 1
                });
                console.log("Score Saved");
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && isPlaying && !showSequence && userInput) {
            checkAnswer();
        }
    };

    const getDifficultyDesc = () => {
        if (level <= 3) return "Easy";
        if (level <= 7) return "Medium";
        if (level <= 12) return "Hard";
        return "Master";
    };

    return (
        <div className="bg-slate-50 p-4 md:p-6 font-sans flex items-center justify-center w-full">
            <div className="w-full max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-5">
                        <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
                            🔢 NUMBER SEQUENCE
                        </h1>
                    </div>
                    
                    {/* Stats Panel */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200">
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Level</div>
                            <div className="text-2xl font-black text-slate-800">{level}</div>
                            <div className="text-xs text-slate-400 mt-1">{getDifficultyDesc()}</div>
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
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Digits</div>
                            <div className="text-2xl font-black text-slate-800">{level + 1}</div>
                            <div className="text-xs text-slate-400 mt-1">to remember</div>
                        </div>
                    </div>
                    
                    {/* Game Area */}
                    <div className="p-6 md:p-8">
                        {/* Status Message */}
                        <div className="text-center mb-6">
                            <div className={`
                                inline-block px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm border border-slate-200
                                ${message.includes("REMEMBER") || message.includes("WATCH") ? 'bg-amber-50 text-amber-800' : 
                                  message.includes("TYPE") ? 'bg-emerald-50 text-emerald-800' :
                                  message.includes("CORRECT") ? 'bg-emerald-100 text-emerald-900' :
                                  message.includes("GAME OVER") ? 'bg-rose-50 text-rose-800' :
                                  'bg-slate-100 text-slate-800'}
                            `}>
                                {message}
                            </div>
                        </div>
                        
                        {/* Number Display Area */}
                        <div className="flex justify-center items-center min-h-[200px] bg-slate-100 rounded-2xl mb-6 shadow-inner border border-slate-200">
                            {showSequence ? (
                                <div className="text-center p-6">
                                    <p className="text-xs text-slate-500 font-bold mb-4 uppercase tracking-wider">📋 Memorize this sequence:</p>
                                    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                                        {sequence.map((num, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-block w-16 h-16 md:w-20 md:h-20 bg-slate-800 text-white text-3xl md:text-4xl font-black rounded-2xl flex items-center justify-center shadow-sm"
                                            >
                                                {num}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : isPlaying ? (
                                <div className="text-center w-full p-6">
                                    <p className="text-xs text-slate-500 font-bold mb-4 uppercase tracking-wider">✏️ Type the sequence you remember:</p>
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
                                        onKeyPress={handleKeyPress}
                                        placeholder="e.g., 1234"
                                        className="w-full max-w-xs mx-auto px-5 py-4 text-2xl text-center font-mono font-bold rounded-2xl border border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 bg-white transition-all shadow-sm"
                                        autoFocus
                                    />
                                    <p className="text-xs text-slate-400 mt-3 font-bold">
                                        📝 Need to type {level + 1} number{level !== 0 ? 's' : ''}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center text-slate-400 p-6">
                                    <span className="text-5xl">🎮</span>
                                    <p className="mt-2 font-bold text-sm">Press START to begin!</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Submit Button */}
                        {isPlaying && !showSequence && (
                            <div className="flex justify-center">
                                <button
                                    onClick={checkAnswer}
                                    disabled={!userInput}
                                    className={`
                                        px-8 py-3 rounded-xl font-bold text-white transition-all shadow-sm text-sm
                                        ${userInput 
                                            ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer' 
                                            : 'bg-slate-300 cursor-not-allowed opacity-50 text-slate-600'}
                                    `}
                                >
                                    🎯 SUBMIT ANSWER
                                </button>
                            </div>
                        )}
                        
                        {/* Sequence Length Indicator */}
                        {isPlaying && !showSequence && (
                            <div className="mt-6 text-center">
                                <div className="flex justify-center gap-1.5 flex-wrap">
                                    {Array(level + 1).fill(0).map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${userInput.length > idx ? 'bg-emerald-600' : 'bg-slate-200'}`}
                                        />
                                    ))}
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
                                    <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">DIGITS TO REMEMBER</div>
                                    <div className="text-3xl font-black text-slate-800">{level + 1}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NumberSequenceGame;