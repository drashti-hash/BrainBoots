import { useState, useEffect, useRef, useCallback } from "react";
import { addSchulteScore } from "../services/api";

function SchulteGame() {
    const [grid, setGrid] = useState([]);
    const [expectedNumber, setExpectedNumber] = useState(1);
    const [timer, setTimer] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [bestTime, setBestTime] = useState(null);
    const [message, setMessage] = useState("👉 Press START to scan Schulte Table!");

    const intervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const startNewRound = useCallback((currentLvl, currentScore) => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Generate numbers 1-25 shuffled
        const numbers = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

        setGrid(numbers);
        setExpectedNumber(1);
        setTimer(0);
        setLevel(currentLvl);
        setScore(currentScore);
        setIsPlaying(true);
        setMessage("👁️ Scan and click numbers in order 1 to 25!");

        intervalRef.current = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
    }, []);

    const startGame = () => {
        startNewRound(1, 0);
    };

    const handleNumberClick = async (num) => {
        if (!isPlaying || num !== expectedNumber) return;

        if (num === 25) {
            // Level cleared!
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsPlaying(false);

            const nextLevel = level + 1;
            const newScore = score + Math.max(20, 150 - timer * 2);
            setMessage(`🎉 TABLE CLEARED in ${timer} seconds! Next level...`);

            if (bestTime === null || timer < bestTime) {
                setBestTime(timer);
            }

            try {
                await addSchulteScore({
                    level_reached: nextLevel,
                    score: newScore,
                    completed_time: timer
                });
                console.log("Schulte Score Saved");
            } catch (error) {
                console.log(error);
            }

            setTimeout(() => startNewRound(nextLevel, newScore), 1500);
        } else {
            setExpectedNumber(expectedNumber + 1);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-slate-50 p-4 md:p-6 font-sans flex items-center justify-center w-full min-h-[80vh]">
            <div className="w-full max-w-xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-5">
                        <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
                            👁️ SCHULTE TABLE SCAN
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
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Best Time</div>
                            <div className="text-xl font-black text-slate-800 font-mono mt-1">
                                {bestTime !== null ? formatTime(bestTime) : "--:--"}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Timer</div>
                            <div className="text-xl font-black text-slate-800 font-mono mt-1">
                                {formatTime(timer)}
                            </div>
                        </div>
                    </div>
                    
                    {/* Game Area */}
                    <div className="p-6 md:p-8 flex flex-col items-center">
                        {/* Status Message */}
                        <div className="text-center mb-6 w-full">
                            <div className={`
                                inline-block px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm border border-slate-200
                                ${message.includes("CLEARED") ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-800'}
                            `}>
                                {message}
                            </div>
                        </div>

                        {/* Expected Number Indicator */}
                        {isPlaying && (
                            <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-6 py-3 rounded-2xl shadow-sm">
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Next Target:</span>
                                <span className="text-3xl font-black text-slate-800">{expectedNumber}</span>
                            </div>
                        )}

                        {/* 5x5 Schulte Grid */}
                        {isPlaying && (
                            <div className="bg-slate-100 p-6 rounded-3xl shadow-inner border border-slate-200 mb-6">
                                <div className="grid grid-cols-5 gap-3 md:gap-4 w-64 h-64 md:w-80 md:h-80">
                                    {grid.map((num, index) => {
                                        const isClicked = num < expectedNumber;

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleNumberClick(num)}
                                                disabled={isClicked}
                                                className={`rounded-2xl font-black text-xl md:text-2xl transition-all duration-150 flex items-center justify-center focus:outline-none ${
                                                    isClicked 
                                                        ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-default shadow-none scale-95' 
                                                        : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 active:scale-95 shadow-sm cursor-pointer'
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Start / Restart Button */}
                        {!isPlaying && (
                            <button
                                onClick={startGame}
                                className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm animate-pulse mt-4"
                            >
                                🚀 START SCANNING
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SchulteGame;
