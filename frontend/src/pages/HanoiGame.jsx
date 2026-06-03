import { useState, useEffect, useCallback } from "react";
import { addHanoiScore } from "../services/api";

function HanoiGame() {
    const [level, setLevel] = useState(1); // Level 1 = 3 disks, Level 2 = 4 disks, Level 3 = 5 disks, Level 4 = 6 disks
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [pegs, setPegs] = useState([[], [], []]);
    const [selectedPeg, setSelectedPeg] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [message, setMessage] = useState("👉 Press START to solve Tower of Hanoi!");

    const startNewRound = useCallback((currentLvl, currentScore) => {
        const diskCount = Math.min(currentLvl + 2, 6); // Level 1->3 disks, Level 2->4 disks, Level 3->5 disks, Level 4->6 disks
        const initialDisks = Array.from({ length: diskCount }, (_, i) => i + 1); // [1, 2, 3] (1 is smallest)

        setPegs([initialDisks, [], []]);
        setSelectedPeg(null);
        setMoves(0);
        setLevel(currentLvl);
        setScore(currentScore);
        setIsPlaying(true);
        setMessage(`🧩 Level ${currentLvl}: Move all ${diskCount} disks to the rightmost peg!`);
    }, []);

    useEffect(() => {
        startNewRound(1, 0);
    }, [startNewRound]);

    const handlePegClick = async (pegIndex) => {
        if (!isPlaying) return;

        if (selectedPeg === null) {
            // Select peg if it has disks
            if (pegs[pegIndex].length > 0) {
                setSelectedPeg(pegIndex);
            }
        } else {
            if (selectedPeg === pegIndex) {
                // Deselect
                setSelectedPeg(null);
                return;
            }

            const sourcePeg = [...pegs[selectedPeg]];
            const targetPeg = [...pegs[pegIndex]];
            const topDisk = sourcePeg[0];
            const targetTop = targetPeg[0];

            // Valid move check: target is empty or target top is larger than moving disk
            if (targetPeg.length === 0 || targetTop > topDisk) {
                sourcePeg.shift(); // remove top
                targetPeg.unshift(topDisk); // add to target

                const nextPegs = [...pegs];
                nextPegs[selectedPeg] = sourcePeg;
                nextPegs[pegIndex] = targetPeg;
                const nextMoves = moves + 1;

                setPegs(nextPegs);
                setSelectedPeg(null);
                setMoves(nextMoves);

                const diskCount = Math.min(level + 2, 6);

                // Check win condition (all disks on peg 2)
                if (nextPegs[2].length === diskCount) {
                    setIsPlaying(false);
                    const nextLevel = level + 1;
                    const minMoves = Math.pow(2, diskCount) - 1;
                    const bonus = Math.max(20, 200 - (nextMoves - minMoves) * 5);
                    const newScore = score + bonus;

                    setMessage(`🎉 LEVEL ${level} SOLVED in ${nextMoves} moves! (Perfect: ${minMoves}). Advancing to Level ${nextLevel}...`);
                    if (newScore > highScore) setHighScore(newScore);

                    try {
                        await addHanoiScore({
                            level_reached: nextLevel,
                            score: newScore,
                            moves: nextMoves
                        });
                        console.log("Hanoi Score Saved");
                    } catch (error) {
                        console.log(error);
                    }

                    // Automatically advance to the next level after 2 seconds
                    setTimeout(() => startNewRound(nextLevel, newScore), 2000);
                }
            } else {
                setMessage("❌ Invalid Move! Cannot place larger disk on smaller disk.");
                setSelectedPeg(null);
            }
        }
    };

    const getDiskWidth = (diskSize) => {
        const widths = ["w-12", "w-16", "w-20", "w-24", "w-28", "w-32"];
        return widths[diskSize - 1] || "w-20";
    };

    const getDiskColor = (diskSize) => {
        const colors = [
            "bg-slate-800 text-white",
            "bg-emerald-600 text-white",
            "bg-teal-600 text-white",
            "bg-slate-600 text-white",
            "bg-emerald-700 text-white",
            "bg-slate-700 text-white"
        ];
        return colors[diskSize - 1] || "bg-slate-800 text-white";
    };

    return (
        <div className="bg-slate-50 p-4 md:p-6 font-sans flex items-center justify-center w-full min-h-[80vh]">
            <div className="w-full max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-5">
                        <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
                            🧩 TOWER OF HANOI
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
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Moves</div>
                            <div className="text-2xl font-black text-slate-800">{moves}</div>
                        </div>
                    </div>
                    
                    {/* Game Area */}
                    <div className="p-6 md:p-8 flex flex-col items-center">
                        {/* Status Message */}
                        <div className="text-center mb-8 w-full">
                            <div className={`
                                inline-block px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm border border-slate-200
                                ${message.includes("SOLVED") ? 'bg-emerald-50 text-emerald-800' :
                                  message.includes("Invalid") ? 'bg-rose-50 text-rose-800' :
                                  'bg-slate-100 text-slate-800'}
                            `}>
                                {message}
                            </div>
                        </div>

                        {/* Hanoi Pegs / Disks Display */}
                        {isPlaying && (
                            <div className="bg-slate-100 p-6 rounded-3xl shadow-inner border border-slate-200 w-full mb-8 flex justify-around items-end h-64 md:h-72 relative">
                                {pegs.map((pegDisks, pegIdx) => (
                                    <div
                                        key={pegIdx}
                                        onClick={() => handlePegClick(pegIdx)}
                                        className={`flex flex-col items-center justify-end w-28 h-full relative cursor-pointer group rounded-2xl transition-all ${
                                            selectedPeg === pegIdx ? 'bg-slate-200/60 shadow-inner' : 'hover:bg-slate-200/40'
                                        }`}
                                    >
                                        {/* Peg Rod */}
                                        <div className="absolute inset-y-10 w-3.5 bg-slate-300 rounded-t-full z-0 group-hover:bg-slate-400 transition-colors" />

                                        {/* Peg Base */}
                                        <div className="absolute bottom-0 w-24 h-4 bg-slate-400 rounded-full z-0" />

                                        {/* Disks Stack */}
                                        <div className="flex flex-col items-center justify-end z-10 w-full pb-3 space-y-1">
                                            {pegDisks.map((diskSize, dIdx) => (
                                                <div
                                                    key={diskSize}
                                                    className={`h-7 rounded-xl font-black text-xs flex items-center justify-center shadow-sm border border-white/20 transition-transform ${getDiskWidth(diskSize)} ${getDiskColor(diskSize)} ${
                                                        selectedPeg === pegIdx && dIdx === 0 ? 'transform -translate-y-4 shadow-md ring-4 ring-emerald-300 animate-pulse' : ''
                                                    }`}
                                                >
                                                    {diskSize}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Start / Restart Button */}
                        {!isPlaying ? (
                            <button
                                onClick={() => startNewRound(1, 0)}
                                className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm animate-pulse"
                            >
                                🚀 START GAME
                            </button>
                        ) : (
                            <button
                                onClick={() => startNewRound(1, 0)}
                                className="px-8 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all shadow-sm text-sm mt-2"
                            >
                                🔄 RESTART GAME
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HanoiGame;
