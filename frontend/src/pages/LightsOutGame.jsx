import { useState, useEffect, useCallback } from "react";
import { addLightsOutScore } from "../services/api";

function LightsOutGame() {
    // --- MULTIPLAYER AUTO-START & SCORE SYNC ---
    useEffect(() => {
        if (window.brainbootsIsMultiplayer && window.brainbootsScoreUpdate) {
            window.brainbootsScoreUpdate(score);
        }
    }, [score]);
    // -----------------------------------------

    const [grid, setGrid] = useState([]);
    const [moves, setMoves] = useState(0);
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameStatus, setGameStatus] = useState("playing"); // playing, won
    const [message, setMessage] = useState("💡 Turn OFF all the lights!");

    const toggleCells = (currentGrid, index) => {
        const newGrid = [...currentGrid];
        const row = Math.floor(index / 5);
        const col = index % 5;

        // Toggle self
        newGrid[index] = !newGrid[index];

        // Toggle top
        if (row > 0) newGrid[index - 5] = !newGrid[index - 5];
        // Toggle bottom
        if (row < 4) newGrid[index + 5] = !newGrid[index + 5];
        // Toggle left
        if (col > 0) newGrid[index - 1] = !newGrid[index - 1];
        // Toggle right
        if (col < 4) newGrid[index + 1] = !newGrid[index + 1];

        return newGrid;
    };

    const startNewRound = useCallback((lvl, curScore) => {
        let initialGrid = Array(25).fill(false);
        // Simulate random clicks to guarantee a solvable puzzle
        const shuffleCount = lvl + 2;
        for (let i = 0; i < shuffleCount; i++) {
            const randomIndex = Math.floor(Math.random() * 25);
            initialGrid = toggleCells(initialGrid, randomIndex);
        }

        // Ensure it's not already solved
        if (initialGrid.every(cell => !cell)) {
            initialGrid[0] = true;
            initialGrid[1] = true;
            initialGrid[5] = true;
        }

        setGrid(initialGrid);
        setMoves(0);
        setLevel(lvl);
        setScore(curScore);
        setGameStatus("playing");
        setMessage("💡 Turn OFF all the lights!");
    }, []);

    useEffect(() => {
        startNewRound(1, 0);
    }, [startNewRound]);

    const handleCellClick = async (index) => {
        if (gameStatus !== "playing") return;

        const nextGrid = toggleCells(grid, index);
        const nextMoves = moves + 1;
        setGrid(nextGrid);
        setMoves(nextMoves);

        // Check win condition (all lights off)
        if (nextGrid.every(cell => !cell)) {
            setGameStatus("won");
            const newScore = score + Math.max(10, 50 - nextMoves * 2);
            const nextLevel = level + 1;
            setMessage(`🎉 LEVEL CLEARED in ${nextMoves} moves! Next level...`);
            
            if (newScore > highScore) setHighScore(newScore);

            try {
                await addLightsOutScore({
                    level_reached: nextLevel,
                    score: newScore,
                    moves: nextMoves
                });
                console.log("Lights Out Score Saved");
            } catch (error) {
                console.log(error);
            }

            setTimeout(() => startNewRound(nextLevel, newScore), 1500);
        }
    };

    return (
        <div className="bg-slate-50 p-4 md:p-6 font-sans flex items-center justify-center w-full min-h-[80vh]">
            <div className="w-full max-w-xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-5">
                        <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
                            💡 LIGHTS OUT GRID
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
                        <div className="text-center mb-6 w-full">
                            <div className={`
                                inline-block px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm border border-slate-200
                                ${gameStatus === "won" ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-800'}
                            `}>
                                {message}
                            </div>
                        </div>

                        {/* 5x5 Lights Grid */}
                        <div className="bg-slate-100 p-6 rounded-3xl shadow-inner border border-slate-200 mb-6">
                            <div className="grid grid-cols-5 gap-3 md:gap-4">
                                {grid.map((isLightOn, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleCellClick(index)}
                                        disabled={gameStatus !== "playing"}
                                        className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl transition-all duration-200 transform active:scale-95 shadow-sm border focus:outline-none ${
                                            isLightOn 
                                                ? 'bg-emerald-500 border-emerald-400 shadow-emerald-100 shadow-md ring-4 ring-emerald-200' 
                                                : 'bg-slate-200 border-slate-300 hover:bg-slate-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Reset Button */}
                        <div className="flex gap-4 mt-2">
                            <button
                                onClick={() => startNewRound(1, 0)}
                                className="px-8 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all shadow-sm text-sm"
                            >
                                🔄 RESTART GAME
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LightsOutGame;
