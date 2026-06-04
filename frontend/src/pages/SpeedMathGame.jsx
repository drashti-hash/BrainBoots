import { useState, useEffect, useRef, useCallback } from "react";
import { addSpeedMathScore } from "../services/api";

function SpeedMathGame() {
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [question, setQuestion] = useState({ text: "", answer: 0, options: [] });
    const [timeLeft, setTimeLeft] = useState(30); // 3 seconds per question (30 tenths)
    const [message, setMessage] = useState("👉 Press START for Speed Math Sprint!");

    const intervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleGameOver = useCallback(async (finalScore, finalCorrect, currentLvl) => {
        setIsPlaying(false);
        setMessage(`❌ GAME OVER! You solved ${finalCorrect} equations.`);
        if (intervalRef.current) clearInterval(intervalRef.current);

        try {
            await addSpeedMathScore({
                level_reached: currentLvl,
                score: finalScore,
                correct_answers: finalCorrect
            });
            console.log("Speed Math Score Saved");
        } catch (error) {
            console.log(error);
        }
    }, []);

    const generateQuestion = useCallback((currentLvl) => {
        let num1, num2, op, ans, text;

        if (currentLvl === 1) {
            // Addition / Subtraction
            op = Math.random() < 0.5 ? "+" : "-";
            if (op === "+") {
                num1 = Math.floor(Math.random() * 15) + 1;
                num2 = Math.floor(Math.random() * 15) + 1;
                ans = num1 + num2;
            } else {
                num1 = Math.floor(Math.random() * 20) + 5;
                num2 = Math.floor(Math.random() * num1) + 1;
                ans = num1 - num2;
            }
            text = `${num1} ${op} ${num2}`;
        } else if (currentLvl === 2) {
            // Multiplication / Simple Div
            op = Math.random() < 0.7 ? "×" : "÷";
            if (op === "×") {
                num1 = Math.floor(Math.random() * 9) + 2;
                num2 = Math.floor(Math.random() * 9) + 2;
                ans = num1 * num2;
            } else {
                num2 = Math.floor(Math.random() * 8) + 2;
                ans = Math.floor(Math.random() * 9) + 2;
                num1 = num2 * ans;
            }
            text = `${num1} ${op} ${num2}`;
        } else {
            // Advanced Mixed
            const ops = ["+", "-", "×"];
            op = ops[Math.floor(Math.random() * ops.length)];
            if (op === "×") {
                num1 = Math.floor(Math.random() * 12) + 2;
                num2 = Math.floor(Math.random() * 12) + 2;
                ans = num1 * num2;
            } else if (op === "+") {
                num1 = Math.floor(Math.random() * 50) + 10;
                num2 = Math.floor(Math.random() * 50) + 10;
                ans = num1 + num2;
            } else {
                num1 = Math.floor(Math.random() * 80) + 20;
                num2 = Math.floor(Math.random() * 50) + 10;
                ans = num1 - num2;
            }
            text = `${num1} ${op} ${num2}`;
        }

        // Generate 3 wrong options
        const opts = new Set([ans]);
        while (opts.size < 4) {
            const offset = Math.floor(Math.random() * 11) - 5;
            const wrong = ans + (offset === 0 ? 1 : offset);
            if (wrong >= 0) opts.add(wrong);
        }

        const shuffledOptions = Array.from(opts).sort(() => Math.random() - 0.5);
        setQuestion({ text, answer: ans, options: shuffledOptions });
        setTimeLeft(30); // reset 3 second timer
    }, []);

    const startGame = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setLevel(1);
        setScore(0);
        setCorrectAnswers(0);
        setIsPlaying(true);
        setMessage("⚡ Solve as fast as possible!");
        generateQuestion(1);

        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    handleGameOver(score, correctAnswers, level);
                    return 0;
                }
                return prev - 1;
            });
        }, 100);
    };

    const handleOptionClick = (selectedAnswer) => {
        if (!isPlaying) return;

        if (selectedAnswer === question.answer) {
            const nextCorrect = correctAnswers + 1;
            const nextScore = score + 10 + Math.floor(timeLeft / 3);
            const nextLevel = Math.floor(nextCorrect / 5) + 1;

            setCorrectAnswers(nextCorrect);
            setScore(nextScore);
            setLevel(nextLevel);
            if (nextScore > highScore) setHighScore(nextScore);

            generateQuestion(nextLevel);
        } else {
            handleGameOver(score, correctAnswers, level);
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
        <div className="bg-slate-50 p-4 md:p-6 font-sans flex items-center justify-center w-full min-h-[80vh]">
            <div className="w-full max-w-xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-5">
                        <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
                            ⚡ SPEED MATH SPRINT
                        </h1>
                    </div>
                    
                    {/* Stats Panel */}
                    <div className="grid grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200">
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
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Solved</div>
                            <div className="text-2xl font-black text-slate-800">{correctAnswers}</div>
                        </div>
                    </div>
                    
                    {/* Game Area */}
                    <div className="p-6 md:p-8 flex flex-col items-center">
                        {/* Status Message */}
                        <div className="text-center mb-6 w-full">
                            <div className={`
                                inline-block px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm border border-slate-200
                                ${message.includes("GAME OVER") ? 'bg-rose-50 text-rose-800' : 'bg-slate-100 text-slate-800'}
                            `}>
                                {message}
                            </div>
                        </div>

                        {/* Equation Display */}
                        {isPlaying && (
                            <div className="w-full flex flex-col items-center mb-8">
                                <div className="bg-slate-100 border border-slate-200 px-12 py-8 rounded-3xl shadow-inner w-full text-center mb-6">
                                    <span className="text-5xl md:text-6xl font-black text-slate-800 tracking-tight">
                                        {question.text} = ?
                                    </span>
                                </div>

                                {/* Timer Countdown Bar */}
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-6">
                                    <div 
                                        className={`h-full transition-all duration-100 ${
                                            timeLeft > 15 ? 'bg-emerald-500' : timeLeft > 8 ? 'bg-amber-500' : 'bg-rose-500'
                                        }`}
                                        style={{ width: `${(timeLeft / 30) * 100}%` }}
                                    />
                                </div>

                                {/* 4 Options Grid */}
                                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                    {question.options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionClick(option)}
                                            className="bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-800 font-black text-2xl py-5 rounded-2xl shadow-sm transition-all active:scale-95 focus:outline-none"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Start / Restart Button */}
                        {!isPlaying && (
                            <button
                                onClick={startGame}
                                className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm animate-pulse mt-4"
                            >
                                🚀 START SPRINT
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SpeedMathGame;
