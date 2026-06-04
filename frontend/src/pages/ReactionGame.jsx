import { useState, useRef, useEffect } from "react";
import { addReactionScore } from "../services/api";

function ReactionGame() {
    const [colorClass, setColorClass] = useState("bg-slate-700"); 
    const [message, setMessage] = useState("Press Start to Begin");
    const [reactionTime, setReactionTime] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const startTimeRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    const startGame = () => {
        setIsPlaying(true);
        setReactionTime(null);
        setColorClass("bg-red-600");
        setMessage("Wait for Green...");

        const randomDelay = Math.floor(Math.random() * 3000) + 2000; 

        timerRef.current = setTimeout(() => {
            setColorClass("bg-green-500");
            setMessage("CLICK NOW!");
            startTimeRef.current = performance.now();
        }, randomDelay);
    };

    const handleClick = async () => {
        if (!isPlaying) return;

        if (colorClass === "bg-red-600") {
            clearTimeout(timerRef.current);
            setIsPlaying(false);
            setColorClass("bg-red-800");
            setMessage("Too Early! Try again.");
            return;
        }

        if (colorClass === "bg-green-500") {
            const endTime = performance.now();
            const totalReaction = ((endTime - startTimeRef.current) / 1000).toFixed(3);
            
            setReactionTime(totalReaction);
            setMessage(`Success!`);
            setIsPlaying(false);
            setColorClass("bg-emerald-600");

            try {
                await addReactionScore({
                    score: 100,
                    reaction_time: parseFloat(totalReaction)
                });
            } catch (error) {
                console.error("Failed to save score:", error);
            }
        }
    };

    
    // --- MULTIPLAYER AUTO-START & SCORE SYNC ---
    useEffect(() => {
        if (window.brainbootsIsMultiplayer && window.brainbootsScoreUpdate && reactionTime) {
            window.brainbootsScoreUpdate(100);
        }
    }, [reactionTime]);
    useEffect(() => {
        if (window.brainbootsIsMultiplayer) {
            const handleStart = () => {
                if (typeof startGame === 'function') {
                    startGame();
                }
            };
            window.addEventListener("brainboots:start-game", handleStart);
            return () => {
                window.removeEventListener("brainboots:start-game", handleStart);
            };
        }
    }, []);
    // -----------------------------------------

return (
        <div className="flex flex-col items-center mt-12 font-sans text-center w-full">
            <h1 className="text-3xl font-black text-slate-800">Reaction Brain Test</h1>

            {/* Game Box */}
            <div
                onClick={handleClick}
                className={`
                    ${colorClass} 
                    w-72 h-72 my-6 flex items-center justify-center 
                    rounded-2xl text-white text-2xl font-bold 
                    transition-colors duration-100 cursor-pointer select-none shadow-sm border border-slate-200
                    ${!isPlaying && "cursor-default"}
                `}
            >
                {message}
            </div>

            {/* Action Button */}
            <button 
                onClick={startGame} 
                disabled={isPlaying}
                className={`
                    px-8 py-3 rounded-xl font-bold text-white shadow-sm transition-all text-sm
                    ${isPlaying 
                        ? "bg-slate-300 cursor-not-allowed text-slate-600" 
                        : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"}
                `}
            >
                {isPlaying ? "Game in Progress..." : "Start Game"}
            </button>

            {/* Results Display */}
            {reactionTime && (
                <h2 className="mt-6 text-xl font-bold text-slate-700">
                    Last Reaction Time: <span className="text-emerald-600">{reactionTime}s</span>
                </h2>
            )}
        </div>
    );
}

export default ReactionGame;