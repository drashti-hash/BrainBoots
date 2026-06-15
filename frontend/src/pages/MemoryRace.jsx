import { useState, useRef, useEffect } from "react";
import { addMemoryRaceScore } from "../services/api";

const EMOJI_POOL = [
    "🍎", "🍌", "🚗", "🌙", "📚", "🐱", "🐶", "🍕", "🎮", "⚽", 
    "🚀", "🎸", "⌚", "🍦", "🎈", "🔑", "💡", "✈️", "🍀", "🍓", 
    "🎩", "🍩", "🔋", "🧸", "🦉", "🎨", "🌮", "🍉", "🦁", "🐬"
];

const POSITION_NAMES = ["1st", "2nd", "3rd", "4th", "5th"];

function MemoryRace() {
    const [gameState, setGameState] = useState("start"); // "start", "memorize", "question", "feedback", "finished"
    const [round, setRound] = useState(1);
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [currentSequence, setCurrentSequence] = useState([]);
    const [targetIndex, setTargetIndex] = useState(0);
    const [options, setOptions] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [timeLeft, setTimeLeft] = useState(3.0);

    const timerRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    const totalRounds = 5;

    useEffect(() => {
        return () => {
            clearTimeout(timerRef.current);
            clearInterval(countdownIntervalRef.current);
        };
    }, []);

    // Helper to shuffle array
    const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

    const startNewRound = (currentRound) => {
        // Generate a random sequence of 5 distinct emojis
        const shuffledPool = shuffleArray(EMOJI_POOL);
        const sequence = shuffledPool.slice(0, 5);
        setCurrentSequence(sequence);

        // Select a target position to test (0 to 4)
        const targetIdx = Math.floor(Math.random() * 5);
        setTargetIndex(targetIdx);

        // Generate multiple-choice options (1 correct, 3 wrong from the pool)
        const correctEmoji = sequence[targetIdx];
        const distractorPool = EMOJI_POOL.filter(item => !sequence.includes(item));
        const shuffledDistractors = shuffleArray(distractorPool);
        const roundOptions = shuffleArray([correctEmoji, ...shuffledDistractors.slice(0, 3)]);
        setOptions(roundOptions);

        setSelectedAnswer(null);
        setIsCorrect(null);
        setTimeLeft(3.0);
        setGameState("memorize");

        // Start 3 second memory timer
        let start = performance.now();
        countdownIntervalRef.current = setInterval(() => {
            const elapsed = (performance.now() - start) / 1000;
            const remaining = Math.max(0, (3.0 - elapsed)).toFixed(1);
            setTimeLeft(parseFloat(remaining));
            if (remaining <= 0) {
                clearInterval(countdownIntervalRef.current);
            }
        }, 100);

        timerRef.current = setTimeout(() => {
            clearInterval(countdownIntervalRef.current);
            setGameState("question");
        }, 3000);
    };

    const startGame = () => {
        setRound(1);
        setScore(0);
        setCorrectAnswers(0);
        startNewRound(1);
    };

    const handleAnswerClick = (option) => {
        if (selectedAnswer !== null) return; // Prevent double clicking

        setSelectedAnswer(option);
        const correctEmoji = currentSequence[targetIndex];
        const correct = option === correctEmoji;
        setIsCorrect(correct);

        let points = 0;
        if (correct) {
            setCorrectAnswers(prev => prev + 1);
            points = 20; // 20 points per correct answer
            setScore(prev => prev + points);
        }

        setGameState("feedback");

        // Sync live score for multiplayer
        if (window.brainbootsIsMultiplayer && window.brainbootsScoreUpdate) {
            window.brainbootsScoreUpdate(score + points);
        }

        // Wait 1.5s then go to next round or finish
        timerRef.current = setTimeout(() => {
            if (round < totalRounds) {
                setRound(prev => prev + 1);
                startNewRound(round + 1);
            } else {
                finishGame(score + points);
            }
        }, 1500);
    };

    const finishGame = async (finalScore) => {
        setGameState("finished");
        try {
            await addMemoryRaceScore({
                score: finalScore,
                correct_answers: correctAnswers + (isCorrect ? 1 : 0),
                total_questions: totalRounds
            });
        } catch (error) {
            console.error("Failed to save Memory Race score:", error);
        }
    };

    // --- MULTIPLAYER AUTO-START & SCORE SYNC ---
    useEffect(() => {
        if (window.brainbootsIsMultiplayer) {
            const handleStart = () => {
                startGame();
            };
            window.addEventListener("brainboots:start-game", handleStart);
            return () => {
                window.removeEventListener("brainboots:start-game", handleStart);
            };
        }
    }, []);
    // -----------------------------------------

    return (
        <div className="flex flex-col items-center mt-8 font-sans max-w-lg mx-auto text-center w-full px-4">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Memory Race</h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Memory & Retention</p>

            {gameState === "start" && (
                <div className="mt-10 p-8 border border-slate-200 bg-white rounded-3xl shadow-sm w-full">
                    <p className="text-slate-600 text-sm leading-relaxed">
                        A sequence of 5 emojis will be displayed for exactly <strong>3 seconds</strong>. 
                        Memorize their order, then answer which emoji was in the specified position!
                    </p>
                    <div className="flex justify-center gap-4 my-8 text-3xl animate-pulse">
                        <span>🍎</span>
                        <span>🍌</span>
                        <span>🚗</span>
                        <span>🌙</span>
                        <span>📚</span>
                    </div>
                    <button
                        onClick={startGame}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition text-white font-bold rounded-2xl shadow-md text-sm cursor-pointer"
                    >
                        Start Memory Race
                    </button>
                </div>
            )}

            {(gameState === "memorize" || gameState === "question" || gameState === "feedback") && (
                <div className="mt-8 p-6 border border-slate-200 bg-white rounded-3xl shadow-sm w-full relative overflow-hidden">
                    {/* Header info */}
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3 text-xs">
                        <span className="font-bold text-slate-500 uppercase">Round {round} / {totalRounds}</span>
                        <span className="font-mono font-black text-emerald-600 text-sm">Score: {score}</span>
                    </div>

                    {/* Memorize Phase */}
                    {gameState === "memorize" && (
                        <div className="py-8">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Memorize this sequence!</p>
                            <div className="flex justify-center gap-4 text-4xl select-none mb-8">
                                {currentSequence.map((emoji, index) => (
                                    <div 
                                        key={index}
                                        className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-xs animate-scaleUp"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {emoji}
                                    </div>
                                ))}
                            </div>
                            {/* Visual Progress Countdown */}
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div 
                                    className="bg-emerald-500 h-full transition-all duration-100"
                                    style={{ width: `${(timeLeft / 3.0) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-500 mt-2 block">{timeLeft}s remaining</span>
                        </div>
                    )}

                    {/* Question Phase */}
                    {(gameState === "question" || gameState === "feedback") && (
                        <div className="py-4">
                            <h3 className="text-lg font-black text-slate-800 mb-6">
                                What was the <span className="text-emerald-600 font-extrabold underline">{POSITION_NAMES[targetIndex]}</span> item?
                            </h3>

                            {/* Hidden Items Row */}
                            <div className="flex justify-center gap-4 mb-8">
                                {[0, 1, 2, 3, 4].map((idx) => (
                                    <div 
                                        key={idx}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border transition-all ${
                                            idx === targetIndex 
                                                ? "border-emerald-300 bg-emerald-50 text-emerald-600" 
                                                : "border-slate-200 bg-slate-50 text-slate-400"
                                        }`}
                                    >
                                        {gameState === "feedback" && idx === targetIndex ? (
                                            currentSequence[targetIndex]
                                        ) : (
                                            idx === targetIndex ? "?" : idx + 1
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Choices Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {options.map((option, idx) => {
                                    const isSelected = selectedAnswer === option;
                                    const isCorrectChoice = option === currentSequence[targetIndex];
                                    let btnClass = "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700";
                                    
                                    if (gameState === "feedback") {
                                        if (isCorrectChoice) {
                                            btnClass = "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold scale-102";
                                        } else if (isSelected) {
                                            btnClass = "border-rose-500 bg-rose-50 text-rose-700 font-bold";
                                        } else {
                                            btnClass = "border-slate-100 bg-slate-50/50 text-slate-400 opacity-60";
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={gameState === "feedback"}
                                            onClick={() => handleAnswerClick(option)}
                                            className={`py-4 rounded-2xl border text-3xl transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-xs ${btnClass}`}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback Toast */}
                            {gameState === "feedback" && (
                                <div className="mt-6 animate-fadeIn">
                                    {isCorrect ? (
                                        <p className="text-emerald-600 font-bold text-sm">🎉 Correct! +20 Points</p>
                                    ) : (
                                        <p className="text-rose-600 font-bold text-sm">❌ Incorrect! The correct item was {currentSequence[targetIndex]}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {gameState === "finished" && (
                <div className="mt-10 p-8 border border-slate-200 bg-white rounded-3xl shadow-sm w-full">
                    <div className="text-4xl mb-4">🏁</div>
                    <h2 className="text-2xl font-black text-slate-800">Memory Race Completed!</h2>
                    <p className="text-sm font-semibold text-slate-500 mt-1">Well done exercising your retention speed!</p>
                    
                    <div className="my-8 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Correct</p>
                            <p className="text-2xl font-black text-slate-800 mt-1">{correctAnswers} / {totalRounds}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Final Score</p>
                            <p className="text-2xl font-black text-emerald-600 mt-1">{score}</p>
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition text-white font-bold rounded-2xl shadow-md text-sm cursor-pointer"
                    >
                        Play Again
                    </button>
                </div>
            )}

            <style>{`
                @keyframes scaleUp {
                    from { transform: scale(0.85); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scaleUp {
                    animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}

export default MemoryRace;
