import { useState, useEffect, useCallback } from "react";
import { addWordGuessScore } from "../services/api";

const WORD_LIST = [
    "BRAIN", "LOGIC", "SMART", "FOCUS", "THINK", 
    "SOLVE", "LEARN", "TRAIN", "SPEED", "MATCH", 
    "VALID", "POWER", "QUICK", "CLEAN", "MINDS",
    "SHARP", "CRISP", "CLEAR", "LIGHT", "PROVE"
];

function WordGuessGame() {
    // --- MULTIPLAYER AUTO-START & SCORE SYNC ---
    useEffect(() => {
        if (window.brainbootsIsMultiplayer && window.brainbootsScoreUpdate) {
            window.brainbootsScoreUpdate(score);
        }
    }, [score]);
    // -----------------------------------------

    const [secretWord, setSecretWord] = useState("");
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState("");
    const [gameStatus, setGameStatus] = useState("playing"); // playing, won, lost
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [message, setMessage] = useState("👉 Guess the 5-letter word!");

    const startNewRound = useCallback((lvl, curScore) => {
        const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
        setSecretWord(WORD_LIST[randomIndex]);
        setGuesses([]);
        setCurrentGuess("");
        setGameStatus("playing");
        setLevel(lvl);
        setScore(curScore);
        setMessage("👉 Guess the 5-letter word!");
    }, []);

    useEffect(() => {
        startNewRound(1, 0);
    }, [startNewRound]);

    const handleGameOver = useCallback(async (hasWon, finalAttempts, newLvl, newScore) => {
        setGameStatus(hasWon ? "won" : "lost");
        if (hasWon) {
            setMessage(`🎉 CORRECT! The word was ${secretWord}! Next level...`);
            if (newScore > highScore) setHighScore(newScore);
            setTimeout(() => startNewRound(newLvl, newScore), 1500);
        } else {
            setMessage(`❌ GAME OVER! The word was ${secretWord}.`);
        }

        try {
            await addWordGuessScore({
                level_reached: hasWon ? newLvl : level,
                score: hasWon ? newScore : score,
                attempts: finalAttempts
            });
            console.log("Word Guess Score Saved");
        } catch (error) {
            console.log(error);
        }
    }, [secretWord, highScore, level, score, startNewRound]);

    const submitGuess = useCallback(() => {
        if (gameStatus !== "playing" || currentGuess.length !== 5) return;

        const newGuesses = [...guesses, currentGuess.toUpperCase()];
        setGuesses(newGuesses);
        setCurrentGuess("");

        if (currentGuess.toUpperCase() === secretWord) {
            const nextLevel = level + 1;
            const newScore = score + (7 - newGuesses.length) * 10;
            handleGameOver(true, newGuesses.length, nextLevel, newScore);
        } else if (newGuesses.length >= 6) {
            handleGameOver(false, 6, level, score);
        } else {
            setMessage(`Attempt ${newGuesses.length} / 6. Keep trying!`);
        }
    }, [gameStatus, currentGuess, guesses, secretWord, level, score, handleGameOver]);

    const handleKeyDown = useCallback((e) => {
        if (gameStatus !== "playing") return;

        if (e.key === "Enter") {
            submitGuess();
        } else if (e.key === "Backspace") {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
            setCurrentGuess(prev => (prev + e.key).toUpperCase());
        }
    }, [gameStatus, currentGuess, submitGuess]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    const handleKeyClick = (char) => {
        if (gameStatus !== "playing") return;
        if (char === "ENTER") {
            submitGuess();
        } else if (char === "⌫") {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (currentGuess.length < 5) {
            setCurrentGuess(prev => (prev + char).toUpperCase());
        }
    };

    const getLetterStatus = (letter, index, guessWord) => {
        if (secretWord[index] === letter) return "exact";
        if (secretWord.includes(letter)) return "exists";
        return "wrong";
    };

    const keys = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
    ];

    const getKeyboardKeyStyle = (char) => {
        if (char === "ENTER" || char === "⌫") return "bg-slate-200 text-slate-800 px-4 py-3";
        
        let status = "bg-slate-100 text-slate-800";
        for (const g of guesses) {
            for (let i = 0; i < g.length; i++) {
                if (g[i] === char) {
                    if (secretWord[i] === char) return "bg-emerald-600 text-white";
                    if (secretWord.includes(char)) status = "bg-teal-500 text-white";
                    else if (status === "bg-slate-100 text-slate-800") status = "bg-slate-300 text-slate-600";
                }
            }
        }
        return status;
    };

    return (
        <div className="bg-slate-50 p-4 md:p-6 font-sans flex items-center justify-center w-full min-h-[80vh]">
            <div className="w-full max-w-xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-5">
                        <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
                            📝 WORD DEDUCTION
                        </h1>
                    </div>
                    
                    {/* Stats Panel */}
                    <div className="grid grid-cols-3 gap-3 p-5 bg-slate-50 border-b border-slate-200">
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
                    </div>
                    
                    {/* Game Area */}
                    <div className="p-6 md:p-8 flex flex-col items-center">
                        {/* Status Message */}
                        <div className="text-center mb-6 w-full">
                            <div className={`
                                inline-block px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm border border-slate-200
                                ${gameStatus === "won" ? 'bg-emerald-50 text-emerald-800' :
                                  gameStatus === "lost" ? 'bg-rose-50 text-rose-800' :
                                  'bg-slate-100 text-slate-800'}
                            `}>
                                {message}
                            </div>
                        </div>

                        {/* 6x5 Word Grid */}
                        <div className="grid grid-rows-6 gap-2 mb-8">
                            {Array(6).fill(0).map((_, rowIdx) => {
                                const isSubmitted = rowIdx < guesses.length;
                                const isCurrent = rowIdx === guesses.length;
                                const word = isSubmitted ? guesses[rowIdx] : isCurrent ? currentGuess.padEnd(5, " ") : "     ";

                                return (
                                    <div key={rowIdx} className="grid grid-cols-5 gap-2">
                                        {word.split("").map((char, colIdx) => {
                                            let cellStyle = "border-slate-300 bg-white text-slate-800";
                                            if (isSubmitted) {
                                                const status = getLetterStatus(char, colIdx, word);
                                                if (status === "exact") cellStyle = "bg-emerald-600 border-emerald-600 text-white shadow-sm";
                                                else if (status === "exists") cellStyle = "bg-teal-500 border-teal-500 text-white shadow-sm";
                                                else cellStyle = "bg-slate-200 border-slate-200 text-slate-600";
                                            } else if (isCurrent && char !== " ") {
                                                cellStyle = "border-slate-600 bg-slate-50 text-slate-900 shadow-sm";
                                            }

                                            return (
                                                <div
                                                    key={colIdx}
                                                    className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-xl md:text-2xl font-black rounded-2xl border-2 transition-all duration-200 ${cellStyle}`}
                                                >
                                                    {char !== " " ? char : ""}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>

                        {/* On-Screen Keyboard */}
                        <div className="w-full flex flex-col gap-2 max-w-lg">
                            {keys.map((row, rowIdx) => (
                                <div key={rowIdx} className="flex justify-center gap-1.5 md:gap-2">
                                    {row.map((char) => (
                                        <button
                                            key={char}
                                            onClick={() => handleKeyClick(char)}
                                            className={`rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center ${getKeyboardKeyStyle(char)} ${char.length > 1 ? 'px-3 py-3' : 'w-8 h-11 md:w-10 md:h-12'}`}
                                        >
                                            {char}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Reset Button when Game Over */}
                        {gameStatus !== "playing" && (
                            <div className="mt-8">
                                <button
                                    onClick={() => startNewRound(1, 0)}
                                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm"
                                >
                                    🔄 PLAY AGAIN
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WordGuessGame;
