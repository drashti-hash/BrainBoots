import { useState, useEffect, useCallback } from "react";
import { addSlidingTileScore } from "../services/api";

const SOLVED_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

function SlidingTileGame() {
    const [tiles, setTiles] = useState([]);
    const [moves, setMoves] = useState(0);
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameStatus, setGameStatus] = useState("playing"); // playing, won
    const [message, setMessage] = useState("🧩 Slide tiles to order 1-8!");

    const getValidNeighbors = (emptyIndex) => {
        const row = Math.floor(emptyIndex / 3);
        const col = emptyIndex % 3;
        const neighbors = [];

        if (row > 0) neighbors.push(emptyIndex - 3); // top
        if (row < 2) neighbors.push(emptyIndex + 3); // bottom
        if (col > 0) neighbors.push(emptyIndex - 1); // left
        if (col < 2) neighbors.push(emptyIndex + 1); // right

        return neighbors;
    };

    const startNewRound = useCallback((lvl, curScore) => {
        let currentTiles = [...SOLVED_STATE];
        let emptyIndex = 8;
        const shuffleCount = lvl * 4 + 6;

        for (let i = 0; i < shuffleCount; i++) {
            const neighbors = getValidNeighbors(emptyIndex);
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // Swap
            [currentTiles[emptyIndex], currentTiles[randomNeighbor]] = [currentTiles[randomNeighbor], currentTiles[emptyIndex]];
            emptyIndex = randomNeighbor;
        }

        // Ensure not already solved
        if (currentTiles.every((val, idx) => val === SOLVED_STATE[idx])) {
            [currentTiles[0], currentTiles[1]] = [currentTiles[1], currentTiles[0]];
        }

        setTiles(currentTiles);
        setMoves(0);
        setLevel(lvl);
        setScore(curScore);
        setGameStatus("playing");
        setMessage("🧩 Slide tiles to order 1-8!");
    }, []);

    useEffect(() => {
        startNewRound(1, 0);
    }, [startNewRound]);

    const handleTileClick = async (index) => {
        if (gameStatus !== "playing" || tiles[index] === 0) return;

        const emptyIndex = tiles.indexOf(0);
        const row = Math.floor(index / 3);
        const col = index % 3;
        const emptyRow = Math.floor(emptyIndex / 3);
        const emptyCol = emptyIndex % 3;

        // Check if adjacent
        const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

        if (isAdjacent) {
            const nextTiles = [...tiles];
            [nextTiles[index], nextTiles[emptyIndex]] = [nextTiles[emptyIndex], nextTiles[index]];
            const nextMoves = moves + 1;
            setTiles(nextTiles);
            setMoves(nextMoves);

            // Check win condition
            if (nextTiles.every((val, idx) => val === SOLVED_STATE[idx])) {
                setGameStatus("won");
                const newScore = score + Math.max(10, 100 - nextMoves * 2);
                const nextLevel = level + 1;
                setMessage(`🎉 PUZZLE SOLVED in ${nextMoves} moves! Next level...`);
                
                if (newScore > highScore) setHighScore(newScore);

                try {
                    await addSlidingTileScore({
                        level_reached: nextLevel,
                        score: newScore,
                        moves: nextMoves
                    });
                    console.log("Sliding Tile Score Saved");
                } catch (error) {
                    console.log(error);
                }

                setTimeout(() => startNewRound(nextLevel, newScore), 1500);
            }
        }
    };

    return (
        <div className="bg-slate-50 p-4 md:p-6 font-sans flex items-center justify-center w-full min-h-[80vh]">
            <div className="w-full max-w-xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-slate-800 px-6 py-5">
                        <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
                            🧩 SLIDING TILE PUZZLE
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

                        {/* 3x3 Sliding Grid */}
                        <div className="bg-slate-100 p-6 rounded-3xl shadow-inner border border-slate-200 mb-6">
                            <div className="grid grid-cols-3 gap-3 md:gap-4 w-60 h-60 md:w-72 md:h-72">
                                {tiles.map((tileNumber, index) => {
                                    const isEmpty = tileNumber === 0;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleTileClick(index)}
                                            disabled={gameStatus !== "playing" || isEmpty}
                                            className={`rounded-2xl font-black text-2xl md:text-3xl transition-all duration-150 flex items-center justify-center focus:outline-none ${
                                                isEmpty 
                                                    ? 'bg-slate-200/50 border-2 border-dashed border-slate-300 cursor-default' 
                                                    : 'bg-slate-800 text-white shadow-sm border border-slate-700 hover:bg-slate-700 active:scale-95 cursor-pointer'
                                            }`}
                                        >
                                            {!isEmpty && tileNumber}
                                        </button>
                                    );
                                })}
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

export default SlidingTileGame;
