import { useState, useEffect } from "react";
import { addSudokuScore } from "../services/api";

function SudokuGame() {
    const [initialBoard, setInitialBoard] = useState([
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""]
    ]);
    const [solution, setSolution] = useState([
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""]
    ]);
    const [board, setBoard] = useState([
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""]
    ]);
    const [message, setMessage] = useState("🧩 Fill in the empty cells!");
    const [score, setScore] = useState(0);
    const [completedTime, setCompletedTime] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [bestTime, setBestTime] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Dynamic 4x4 Sudoku board generator
    const generateNewPuzzle = () => {
        const seed = [
            [1, 2, 3, 4],
            [3, 4, 1, 2],
            [2, 3, 4, 1],
            [4, 1, 2, 3]
        ];

        // Shuffle numbers 1..4
        const numbers = [1, 2, 3, 4];
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        // Apply number mapping
        let grid = seed.map(row => row.map(val => numbers[val - 1]));

        // Shuffle rows within block 1 (0-1) and block 2 (2-3)
        if (Math.random() < 0.5) {
            [grid[0], grid[1]] = [grid[1], grid[0]];
        }
        if (Math.random() < 0.5) {
            [grid[2], grid[3]] = [grid[3], grid[2]];
        }

        // Shuffle columns within block 1 (0-1) and block 2 (2-3)
        if (Math.random() < 0.5) {
            grid = grid.map(row => {
                const newRow = [...row];
                [newRow[0], newRow[1]] = [newRow[1], newRow[0]];
                return newRow;
            });
        }
        if (Math.random() < 0.5) {
            grid = grid.map(row => {
                const newRow = [...row];
                [newRow[2], newRow[3]] = [newRow[3], newRow[2]];
                return newRow;
            });
        }

        // Transpose matrix (50% chance)
        if (Math.random() < 0.5) {
            const transposed = [[], [], [], []];
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    transposed[c][r] = grid[r][c];
                }
            }
            grid = transposed;
        }

        const sol = grid.map(row => [...row]);

        // Remove 6 or 7 cells randomly (out of 16) to create puzzle
        const cellsToRemove = 6 + Math.floor(Math.random() * 2);
        let removed = 0;
        while (removed < cellsToRemove) {
            const r = Math.floor(Math.random() * 4);
            const c = Math.floor(Math.random() * 4);
            if (grid[r][c] !== "") {
                grid[r][c] = "";
                removed++;
            }
        }

        setInitialBoard(grid);
        setSolution(sol);
        setBoard(grid.map(row => [...row]));
    };

    // Initialize puzzle on mount
    useEffect(() => {
        generateNewPuzzle();
    }, []);

    useEffect(() => {
        let interval;
        if (isActive) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    const startTimer = () => {
        if (!isActive && !showSuccess) {
            setIsActive(true);
        }
    };

    const handleChange = (row, col, value) => {
        startTimer();
        
        const numValue = value === "" ? "" : Number(value);
        if (value !== "" && (numValue < 1 || numValue > 4)) {
            return;
        }
        
        const updatedBoard = [...board];
        updatedBoard[row][col] = numValue === "" ? "" : numValue;
        setBoard(updatedBoard);
        
        if (message.includes("Wrong")) {
            setMessage("🧩 Fill in the empty cells!");
        }
    };

    const isPrefilled = (row, col) => {
        return initialBoard[row][col] !== "";
    };

    const checkSudoku = async () => {
        let correct = true;
        let emptyCells = 0;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (board[row][col] === "") {
                    emptyCells++;
                    correct = false;
                } else if (board[row][col] !== solution[row][col]) {
                    correct = false;
                }
            }
        }
        
        if (emptyCells > 0) {
            setMessage(`⚠️ You have ${emptyCells} empty cell${emptyCells !== 1 ? 's' : ''}! Fill all cells first.`);
            return;
        }
        
        if (correct) {
            setIsActive(false);
            setShowSuccess(true);
            setMessage("🎉 PERFECT! Sudoku Solved!");
            setScore(100);
            setCompletedTime(timer);
            
            if (bestTime === null || timer < bestTime) {
                setBestTime(timer);
            }
            
            try {
                await addSudokuScore({
                    level_reached: 1,
                    score: 100,
                    completed_time: timer
                });
                console.log("Sudoku Score Saved");
            } catch (error) {
                console.log(error);
            }
        } else {
            setMessage("❌ Wrong Solution! Check your answers and try again.");
        }
    };

    const resetGame = () => {
        setBoard(initialBoard.map(row => [...row]));
        setMessage("🧩 Fill in the empty cells!");
        setScore(0);
        setTimer(0);
        setIsActive(false);
        setShowSuccess(false);
    };

    const startNewGame = () => {
        generateNewPuzzle();
        setMessage("🧩 Fill in the empty cells!");
        setScore(0);
        setTimer(0);
        setIsActive(false);
        setShowSuccess(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    
    // --- MULTIPLAYER AUTO-START & SCORE SYNC ---
    useEffect(() => {
        if (window.brainbootsIsMultiplayer && window.brainbootsScoreUpdate) {
            window.brainbootsScoreUpdate(score);
        }
    }, [score]);
    // -----------------------------------------

return (
        <div className="bg-slate-50 p-4 md:p-6 font-sans flex items-center justify-center w-full">
            <div className="w-full max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-5">
                        <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
                            🧩 SUDOKU MINI
                        </h1>
                    </div>
                    
                    {/* Stats Panel */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200">
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Time</div>
                            <div className="text-2xl font-black text-slate-800 font-mono mt-1">
                                {formatTime(timer)}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Score</div>
                            <div className="text-2xl font-black text-slate-800 mt-1">{score}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Best Time</div>
                            <div className="text-xl font-black text-slate-800 font-mono mt-1">
                                {bestTime !== null ? formatTime(bestTime) : "--:--"}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                            <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Grid</div>
                            <div className="text-2xl font-black text-slate-800 mt-1">4x4</div>
                        </div>
                    </div>
                    
                    {/* Game Area */}
                    <div className="p-6 md:p-8">
                        {/* Status Message */}
                        <div className="text-center mb-6">
                            <div className={`
                                inline-block px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm border border-slate-200
                                ${message.includes("Fill") ? 'bg-slate-100 text-slate-700' : 
                                  message.includes("PERFECT") ? 'bg-emerald-50 text-emerald-800' :
                                  message.includes("Wrong") ? 'bg-rose-50 text-rose-800' :
                                  message.includes("empty") ? 'bg-amber-50 text-amber-800' :
                                  'bg-slate-100 text-slate-800'}
                            `}>
                                {message}
                            </div>
                        </div>
                        
                        {/* Sudoku Grid - 4x4 */}
                        <div className="flex justify-center">
                            <div className="bg-slate-100 p-4 md:p-6 rounded-3xl shadow-inner border border-slate-200">
                                <div className="grid grid-cols-4 gap-2 md:gap-3">
                                    {board.map((row, rowIndex) => 
                                        row.map((cell, colIndex) => {
                                            const isPrefilledCell = isPrefilled(rowIndex, colIndex);
                                            const isEmpty = cell === "";
                                            const isWrong = !isPrefilledCell && !isEmpty && cell !== solution[rowIndex][colIndex];
                                            
                                            return (
                                                <input
                                                    key={`${rowIndex}-${colIndex}`}
                                                    type="number"
                                                    value={cell === "" ? "" : cell}
                                                    onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                                                    disabled={isPrefilledCell}
                                                    className={`
                                                        w-14 h-14 md:w-16 md:h-16
                                                        text-center text-xl md:text-2xl font-bold
                                                        rounded-xl md:rounded-2xl shadow-sm
                                                        transition-all duration-200 border border-slate-200
                                                        focus:outline-none focus:ring-2 focus:ring-emerald-500
                                                        ${isPrefilledCell 
                                                            ? 'bg-slate-200 text-slate-800' 
                                                            : isWrong
                                                                ? 'bg-rose-50 text-rose-700 border-rose-300'
                                                                : isEmpty
                                                                    ? 'bg-white text-slate-400 hover:bg-slate-50'
                                                                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                                        }
                                                        ${!isPrefilledCell && 'cursor-pointer'}
                                                    `}
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Grid Labels */}
                        <div className="mt-6 text-center">
                            <div className="flex justify-center gap-6 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-slate-200 border border-slate-300"></div>
                                    <span>Fixed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300"></div>
                                    <span>Correct</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-white border border-slate-300"></div>
                                    <span>Empty</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-rose-50 border border-rose-300"></div>
                                    <span>Wrong</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Success Animation */}
                        {showSuccess && (
                            <div className="mt-6 text-center animate-bounce">
                                <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-sm">
                                    <p className="text-xl font-bold">🎉 CONGRATULATIONS!</p>
                                    <p className="text-xs mt-1 font-bold">You solved the puzzle in {formatTime(timer)}!</p>
                                    <p className="text-sm font-black mt-2 uppercase tracking-wider">Score: 100 points!</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="px-5 pb-6 flex flex-wrap gap-4 justify-center">
                        <button
                            onClick={checkSudoku}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm animate-pulse"
                        >
                            ✅ CHECK SOLUTION
                        </button>
                        <button
                            onClick={startNewGame}
                            className="px-8 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all shadow-sm text-sm"
                        >
                            🔄 NEW GAME
                        </button>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce {
                    animation: bounce 0.5s ease-out;
                }
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button {
                    opacity: 0.5;
                }
            `}</style>
        </div>
    );
}

export default SudokuGame;