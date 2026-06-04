import { useState, useEffect } from "react";
import { addStroopScore } from "../services/api";

const colors = [
    { name: "red", bg: "bg-red-500", hover: "hover:bg-red-600", text: "text-red-600" },
    { name: "teal", bg: "bg-teal-500", hover: "hover:bg-teal-600", text: "text-teal-600" },
    { name: "green", bg: "bg-green-500", hover: "hover:bg-green-600", text: "text-green-600" },
    { name: "yellow", bg: "bg-yellow-500", hover: "hover:bg-yellow-600", text: "text-yellow-600" }
];

function StroopGame() {
    const [word, setWord] = useState("");
    const [textColor, setTextColor] = useState("");
    const [score, setScore] = useState(0);
    const [questionCount, setQuestionCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameStarted, setGameStarted] = useState(false);
    const [accuracy, setAccuracy] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);

    const generateQuestion = () => {
        const colorNames = colors.map(c => c.name);
        const randomWord = colorNames[Math.floor(Math.random() * colorNames.length)];
        const randomColor = colorNames[Math.floor(Math.random() * colorNames.length)];
        
        setWord(randomWord);
        setTextColor(randomColor);
    };

    const startGame = () => {
        setScore(0);
        setQuestionCount(0);
        setTimeLeft(30);
        setAccuracy(0);
        setGameStarted(true);
        setLastAnswerCorrect(null);
        generateQuestion();
    };

    const finishGame = async () => {
        setGameStarted(false);
        
        const calculatedAccuracy = questionCount === 0 ? 0 : ((score / questionCount) * 100).toFixed(1);
        setAccuracy(calculatedAccuracy);
        
        if (score > highScore) {
            setHighScore(score);
        }
        
        try {
            await addStroopScore({
                score: score,
                accuracy: parseFloat(calculatedAccuracy),
                total_questions: questionCount
            });
            console.log("Stroop Score Saved");
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

    const handleAnswer = (selectedColor) => {
        if (!gameStarted) return;
        
        const isCorrect = selectedColor === textColor;
        
        if (isCorrect) {
            setScore((prev) => prev + 1);
        }
        
        setLastAnswerCorrect(isCorrect);
        setQuestionCount((prev) => prev + 1);
        generateQuestion();
        
        setTimeout(() => {
            setLastAnswerCorrect(null);
        }, 500);
    };

    const getTextColorClass = () => {
        switch(textColor) {
            case "red": return "text-red-600";
            case "teal": return "text-teal-600";
            case "green": return "text-green-600";
            case "yellow": return "text-yellow-600";
            default: return "text-gray-800";
        }
    };

    
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
            <div className="w-full max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-5">
                        <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
                            🎨 STROOP TEST
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
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Questions</div>
                            <div className="text-2xl font-black text-slate-800">{questionCount}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">High Score</div>
                            <div className="text-2xl font-black text-slate-800">{highScore}</div>
                        </div>
                    </div>
                    
                    {/* Game Area */}
                    <div className="p-6 md:p-8">
                        {!gameStarted ? (
                            <div className="text-center py-12">
                                <div className="text-7xl mb-4">🎨</div>
                                <h3 className="text-xl font-bold text-slate-800 mb-6">Ready for the Stroop Test?</h3>
                                <button
                                    onClick={startGame}
                                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 mx-auto text-sm animate-pulse"
                                >
                                    🚀 Start Game
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="mb-8 transform transition-all duration-200">
                                    <div className="relative inline-block">
                                        <h1 className={`text-6xl md:text-8xl font-black ${getTextColorClass()} tracking-wide`}>
                                            {word.toUpperCase()}
                                        </h1>
                                        {lastAnswerCorrect !== null && (
                                            <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 text-3xl animate-bounce`}>
                                                {lastAnswerCorrect ? "✅" : "❌"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                                    {colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => handleAnswer(color.name)}
                                            className={`
                                                px-6 md:px-8 py-3 md:py-4 
                                                ${color.bg} ${color.hover}
                                                text-white font-bold rounded-xl 
                                                transition-all transform hover:scale-105 
                                                shadow-sm capitalize text-base md:text-lg
                                                focus:outline-none
                                            `}
                                        >
                                            {color.name}
                                        </button>
                                    ))}
                                </div>
                                
                                {questionCount > 0 && (
                                    <div className="mt-6 text-xs text-slate-500 font-bold">
                                        Current Accuracy: {((score / questionCount) * 100).toFixed(0)}%
                                    </div>
                                )}
                            </div>
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
                                    <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">QUESTIONS</div>
                                    <div className="text-3xl font-black text-slate-800">{questionCount}</div>
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
            
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateX(-50%) translateY(0); }
                    50% { transform: translateX(-50%) translateY(-10px); }
                }
                .animate-bounce {
                    animation: bounce 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}

export default StroopGame;