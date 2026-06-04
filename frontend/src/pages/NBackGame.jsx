import { useState, useEffect, useRef, useCallback } from "react";
import { addNBackScore } from "../services/api";

function NBackGame() {
    const [nBack, setNBack] = useState(1); // 1-back, 2-back, etc.
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sequence, setSequence] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [activeCell, setActiveCell] = useState(null);
    const [matchesCount, setMatchesCount] = useState(0);
    const [userMatched, setUserMatched] = useState(false);
    const [message, setMessage] = useState("👉 Press START to begin N-Back training!");

    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleRoundEnd = useCallback(async (finalScore, finalMatches, currentLvl) => {
        setIsPlaying(false);
        setMessage(`🎯 Round Complete! You found ${finalMatches} matches.`);
        if (intervalRef.current) clearInterval(intervalRef.current);

        try {
            await addNBackScore({
                level_reached: currentLvl,
                score: finalScore,
                matches: finalMatches
            });
            console.log("N-Back Score Saved");
        } catch (error) {
            console.log(error);
        }
    }, []);

    const startGame = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Generate a sequence of 15 positions (0-8) with guaranteed matches
        const newSeq = [];
        const currentN = nBack;
        for (let i = 0; i < 15; i++) {
            if (i >= currentN && Math.random() < 0.4) {
                // Create a match
                newSeq.push(newSeq[i - currentN]);
            } else {
                newSeq.push(Math.floor(Math.random() * 9));
            }
        }

        setSequence(newSeq);
        setCurrentIndex(0);
        setMatchesCount(0);
        setUserMatched(false);
        setIsPlaying(true);
        setMessage(`👁️ Watch the grid! Match if same as ${currentN} step${currentN > 1 ? 's' : ''} back.`);

        let idx = 0;
        intervalRef.current = setInterval(() => {
            if (idx >= newSeq.length) {
                clearInterval(intervalRef.current);
                handleRoundEnd(score, matchesCount, level);
                return;
            }

            setCurrentIndex(idx);
            setActiveCell(newSeq[idx]);
            setUserMatched(false);

            timeoutRef.current = setTimeout(() => {
                setActiveCell(null);
            }, 1000);

            idx++;
        }, 2200);
    };

    const handleMatchClick = () => {
        if (!isPlaying || currentIndex < nBack || userMatched) return;

        setUserMatched(true);
        const currentPos = sequence[currentIndex];
        const targetPos = sequence[currentIndex - nBack];

        if (currentPos === targetPos) {
            const newScore = score + 20;
            const newMatches = matchesCount + 1;
            setScore(newScore);
            setMatchesCount(newMatches);
            setMessage("✅ CORRECT MATCH!");
            if (newScore > highScore) setHighScore(newScore);

            // Level up condition
            if (newMatches >= 3 && nBack === level) {
                setLevel(level + 1);
                setNBack(nBack + 1);
            }
        } else {
            setMessage("❌ Incorrect Match!");
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
                            🧠 N-BACK MEMORY
                        </h1>
                    </div>
                    
                    {/* Stats Panel */}
                    <div className="grid grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200">
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">N-Back</div>
                            <div className="text-2xl font-black text-slate-800">{nBack}-Back</div>
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
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Matches</div>
                            <div className="text-2xl font-black text-slate-800">{matchesCount}</div>
                        </div>
                    </div>
                    
                    {/* Game Area */}
                    <div className="p-6 md:p-8 flex flex-col items-center">
                        {/* Status Message */}
                        <div className="text-center mb-6 w-full">
                            <div className={`
                                inline-block px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm border border-slate-200
                                ${message.includes("CORRECT") ? 'bg-emerald-50 text-emerald-800' :
                                  message.includes("Incorrect") ? 'bg-rose-50 text-rose-800' :
                                  'bg-slate-100 text-slate-800'}
                            `}>
                                {message}
                            </div>
                        </div>

                        {/* 3x3 Stimulus Grid */}
                        <div className="bg-slate-100 p-6 rounded-3xl shadow-inner border border-slate-200 mb-8">
                            <div className="grid grid-cols-3 gap-4 w-60 h-60 md:w-72 md:h-72">
                                {Array(9).fill(0).map((_, index) => (
                                    <div
                                        key={index}
                                        className={`rounded-2xl transition-all duration-200 border ${
                                            activeCell === index 
                                                ? 'bg-emerald-600 border-emerald-500 shadow-md scale-105' 
                                                : 'bg-white border-slate-200 shadow-sm'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Controls / Actions */}
                        {isPlaying ? (
                            <button
                                onClick={handleMatchClick}
                                disabled={userMatched}
                                className={`px-12 py-4 rounded-2xl font-bold text-lg text-white shadow-sm transition-all transform active:scale-95 ${
                                    userMatched ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 shadow-md animate-pulse'
                                }`}
                            >
                                🎯 POSITION MATCH!
                            </button>
                        ) : (
                            <button
                                onClick={startGame}
                                className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm animate-pulse"
                            >
                                🚀 START TRAINING
                            </button>
                        )}

                        {/* N-Back Selector (when not playing) */}
                        {!isPlaying && (
                            <div className="mt-6 flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mode:</span>
                                {[1, 2, 3].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => setNBack(n)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                            nBack === n 
                                                ? 'bg-slate-800 text-white border-slate-800 shadow-sm' 
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {n}-Back
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NBackGame;
