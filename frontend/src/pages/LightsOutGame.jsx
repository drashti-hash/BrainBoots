import { useState, useEffect, useRef, useCallback } from "react";
import { addLightsOutScore } from "../services/api";

function LightsOutGame() {
    const [level, setLevel] = useState(1);
    const [gridSize, setGridSize] = useState(3); // 3x3 for lvl 1-2, 4x4 for lvl 3-4, 5x5 for lvl 5+
    const [grid, setGrid] = useState([]);
    const [moves, setMoves] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [highScore, setHighScore] = useState(() => {
        try {
            const saved = localStorage.getItem("brainbootsResult:add-lights-out-score/");
            if (saved) return JSON.parse(saved).bestScore || 0;
        } catch {}
        return 0;
    });

    const timerRef = useRef(null);
    const savedLevelRef = useRef(null);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Generate a solvable grid by scrambling an all-OFF board
    const generateSolvableGrid = useCallback((size, lvl) => {
        // Create size x size grid filled with false (OFF)
        const initialGrid = Array(size).fill(null).map(() => Array(size).fill(false));
        
        // Helper to toggle a single cell and its neighbors
        const toggleCell = (g, r, c) => {
            const directions = [
                [0, 0],   // Self
                [-1, 0],  // Up
                [1, 0],   // Down
                [0, -1],  // Left
                [0, 1]    // Right
            ];
            
            directions.forEach(([dr, dc]) => {
                const newRow = r + dr;
                const newCol = c + dc;
                if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
                    g[newRow][newCol] = !g[newRow][newCol];
                }
            });
        };

        // Determine number of scramble steps based on level
        const scrambleSteps = lvl * 2 + 3;
        const newGrid = initialGrid.map(row => [...row]);
        
        let scrambledCount = 0;
        // Keep track of cells toggled to avoid generating an already solved board
        while (scrambledCount < scrambleSteps) {
            const randRow = Math.floor(Math.random() * size);
            const randCol = Math.floor(Math.random() * size);
            toggleCell(newGrid, randRow, randCol);
            scrambledCount++;
        }

        // Corner case: if the scramble somehow results in an all-OFF board, force one toggle
        const isAllOff = newGrid.every(row => row.every(cell => !cell));
        if (isAllOff) {
            toggleCell(newGrid, 0, 0);
        }

        return newGrid;
    }, []);

    const startLevel = useCallback((lvl) => {
        stopTimer();
        
        // Determine grid size based on level
        let size = 3;
        if (lvl >= 5) {
            size = 5;
        } else if (lvl >= 3) {
            size = 4;
        }

        setGridSize(size);
        setLevel(lvl);
        setSeconds(0);
        setTimerActive(false);
        setGrid(generateSolvableGrid(size, lvl));
        setMoves(0);
        setGameComplete(false);
        savedLevelRef.current = null;
    }, [stopTimer, generateSolvableGrid]);

    // Timer logic
    useEffect(() => {
        if (timerActive && !gameComplete) {
            timerRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        } else {
            stopTimer();
        }
        return () => stopTimer();
    }, [timerActive, gameComplete, stopTimer]);

    // Handle score saving when level completes
    useEffect(() => {
        const saveScore = async () => {
            if (!gameComplete || savedLevelRef.current === level) return;
            
            savedLevelRef.current = level;
            
            // Score calculation: higher level yields more points, penalize moves and seconds
            const rawScore = (level * 200) - (moves * 10) - seconds;
            const finalScore = Math.max(10, rawScore);

            try {
                await addLightsOutScore({
                    level_reached: level,
                    score: finalScore,
                    moves: moves
                });
                
                if (finalScore > highScore) {
                    setHighScore(finalScore);
                }
            } catch (err) {
                console.error("Failed to save Lights Out score:", err);
            }
        };

        saveScore();
    }, [gameComplete, level, moves, seconds, highScore]);

    // Toggle cells around the clicked cell
    const handleCellClick = (row, col) => {
        if (gameComplete) return;

        if (!timerActive) {
            setTimerActive(true);
        }

        setMoves(prev => prev + 1);

        const newGrid = grid.map((r, ri) => 
            r.map((val, ci) => {
                // Check if cell is clicked or adjacent
                const isClicked = ri === row && ci === col;
                const isAdjacent = 
                    (Math.abs(ri - row) === 1 && ci === col) || 
                    (ri === row && Math.abs(ci - col) === 1);
                
                return (isClicked || isAdjacent) ? !val : val;
            })
        );

        setGrid(newGrid);

        // Check if all lights are off
        const isSolved = newGrid.every(r => r.every(cell => !cell));
        if (isSolved) {
            setGameComplete(true);
            setTimerActive(false);
        }
    };

    // --- MULTIPLAYER AUTO-START & SCORE SYNC ---
    useEffect(() => {
        if (window.brainbootsIsMultiplayer && window.brainbootsScoreUpdate) {
            const rawScore = (level * 200) - (moves * 10) - seconds;
            const finalScore = Math.max(10, rawScore);
            window.brainbootsScoreUpdate(finalScore);
        }
    }, [level, moves, seconds]);

    useEffect(() => {
        if (window.brainbootsIsMultiplayer) {
            const handleStart = () => {
                if (typeof startLevel === 'function') {
                    startLevel(1);
                }
            };
            window.addEventListener("brainboots:start-game", handleStart);
            return () => {
                window.removeEventListener("brainboots:start-game", handleStart);
            };
        }
    }, [startLevel]);

    // Auto-start game on load
    useEffect(() => {
        startLevel(1);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="bg-slate-50 p-4 md:p-6 font-sans flex items-center justify-center w-full min-h-[80vh]">
            <div className="w-full max-w-xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-indigo-950 px-6 py-5 flex items-center justify-between border-b border-indigo-900/10">
                        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            <span className="notranslate" translate="no">💡</span> LIGHTS OUT GRID
                        </h1>
                        <span className="bg-indigo-900 text-indigo-200 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                            Level-based Puzzle
                        </span>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200/60">
                        <div className="bg-white rounded-2xl p-2.5 text-center shadow-xs border border-slate-100">
                            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Level</span>
                            <span className="text-xl font-black text-slate-800">{level}</span>
                        </div>
                        <div className="bg-white rounded-2xl p-2.5 text-center shadow-xs border border-slate-100">
                            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Moves</span>
                            <span className="text-xl font-black text-indigo-600 font-mono">{moves}</span>
                        </div>
                        <div className="bg-white rounded-2xl p-2.5 text-center shadow-xs border border-slate-100">
                            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Time</span>
                            <span className="text-xl font-black text-slate-800 font-mono">{seconds}s</span>
                        </div>
                        <div className="bg-white rounded-2xl p-2.5 text-center shadow-xs border border-slate-100">
                            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Best Score</span>
                            <span className="text-xl font-black text-emerald-600 font-mono">{highScore}</span>
                        </div>
                    </div>

                    {/* Instruction / Help Text */}
                    <div className="px-6 py-4 bg-indigo-50/45 border-b border-indigo-100 text-center">
                        <p className="text-xs text-indigo-950/70 font-semibold leading-relaxed">
                            {gameComplete 
                                ? <><span className="notranslate" translate="no">🎉</span> Level Completed! Excellent logic recall.</> 
                                : `Turn off all the lights! Clicking a square toggles it and its adjacent neighbors.`
                            }
                        </p>
                    </div>

                    {/* Interactive Grid Area */}
                    <div className="p-6 md:p-8 flex flex-col items-center bg-slate-50/50 justify-center">
                        <div 
                            className="grid gap-3 p-4 rounded-3xl bg-slate-900/95 shadow-xl border border-slate-800 w-full max-w-sm aspect-square"
                            style={{
                                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
                            }}
                        >
                            {grid.map((row, rIdx) => 
                                row.map((cellState, cIdx) => (
                                    <button
                                        key={`${rIdx}-${cIdx}`}
                                        onClick={() => handleCellClick(rIdx, cIdx)}
                                        disabled={gameComplete}
                                        className={`
                                            w-full aspect-square rounded-2xl transition-all duration-300 transform active:scale-95 focus:outline-none cursor-pointer
                                            ${cellState 
                                                ? "bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.7)] border-2 border-amber-200 scale-102" 
                                                : "bg-slate-800 hover:bg-slate-700/80 border-2 border-slate-700/40"
                                            }
                                        `}
                                        aria-label={`Toggle cell at row ${rIdx + 1}, column ${cIdx + 1}`}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-6 bg-white border-t border-slate-100 flex flex-col items-center gap-3">
                        {gameComplete ? (
                            <button
                                onClick={() => startLevel(level + 1)}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-sm transition-all active:scale-98 text-sm uppercase tracking-wider animate-pulse cursor-pointer"
                            >
                                Next Level <span className="notranslate" translate="no">🚀</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => startLevel(level)}
                                className="w-full py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-2xl transition-all active:scale-98 text-sm cursor-pointer"
                            >
                                <span className="notranslate" translate="no">🔄</span> Reset Puzzle
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default LightsOutGame;
