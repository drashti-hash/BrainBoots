import { useEffect, useRef, useState } from "react";
import { addMemoryScore } from "../services/api";

const symbolPool = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"];

const getPairsCount = (lvl) => Math.min(1 + lvl, symbolPool.length);

const generateLevelCards = (lvl) => {
    const numPairs = getPairsCount(lvl);
    const selectedSymbols = symbolPool.slice(0, numPairs);
    const gameSet = [...selectedSymbols, ...selectedSymbols];

    return gameSet
        .sort(() => Math.random() - 0.5)
        .map((value, index) => ({
            id: index,
            value,
            flipped: false,
            matched: false,
        }));
};

function MemoryGame() {
    const [level, setLevel] = useState(1);
    const [cards, setCards] = useState(() => generateLevelCards(1));
    const [firstCard, setFirstCard] = useState(null);
    const [moves, setMoves] = useState(0);
    const [disableClick, setDisableClick] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const timerRef = useRef(null);
    const savedLevelRef = useRef(null);

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startLevel = (lvl) => {
        stopTimer();
        setLevel(lvl);
        setSeconds(0);
        setTimerActive(false);
        setCards(generateLevelCards(lvl));
        setFirstCard(null);
        setMoves(0);
        setGameComplete(false);
        setDisableClick(false);
        savedLevelRef.current = null;
    };

    useEffect(() => {
        if (timerActive && !gameComplete) {
            timerRef.current = setInterval(() => setSeconds(prev => prev + 1), 1000);
        } else {
            stopTimer();
        }

        return () => stopTimer();
    }, [timerActive, gameComplete]);

    useEffect(() => {
        const saveCompletedLevel = async () => {
            if (!gameComplete || savedLevelRef.current === level) {
                return;
            }

            savedLevelRef.current = level;

            const finalScore = Math.max(0, (level * 100) - (moves * 5) - seconds);

            try {
                await addMemoryScore({
                    score: finalScore
                });
            } catch (error) {
                console.error("Failed to save memory score:", error);
            }
        };

        saveCompletedLevel();
    }, [gameComplete, level, moves, seconds]);

    const handleCardClick = (clickedCard) => {
        if (disableClick || clickedCard.flipped || clickedCard.matched) {
            return;
        }

        if (!timerActive) {
            setTimerActive(true);
        }

        const updatedCards = cards.map(card =>
            card.id === clickedCard.id ? { ...card, flipped: true } : card
        );

        setCards(updatedCards);

        if (!firstCard) {
            setFirstCard(clickedCard);
            return;
        }

        setMoves(prev => prev + 1);

        if (firstCard.value === clickedCard.value) {
            const matchedCards = updatedCards.map(card =>
                card.value === firstCard.value ? { ...card, matched: true } : card
            );

            setCards(matchedCards);
            setFirstCard(null);

            if (matchedCards.every(card => card.matched)) {
                setGameComplete(true);
                setTimerActive(false);
            }

            return;
        }

        setDisableClick(true);

        setTimeout(() => {
            setCards(currentCards =>
                currentCards.map(card =>
                    card.id === firstCard.id || card.id === clickedCard.id
                        ? { ...card, flipped: false }
                        : card
                )
            );
            setFirstCard(null);
            setDisableClick(false);
        }, 800);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-50 p-4 font-sans text-slate-900 w-full">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-black text-slate-800 mb-3">Memory Match</h1>
                <div className="flex gap-4 bg-white px-6 py-2.5 rounded-2xl shadow-sm border border-slate-200 font-bold text-sm">
                    <span className="text-slate-700">Lv. {level}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-700">{seconds}s</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-emerald-600">{moves} Moves</span>
                </div>
            </div>

            <div className={`grid gap-4 w-full max-w-md 
                ${cards.length <= 4 ? "grid-cols-2" : 
                  cards.length <= 9 ? "grid-cols-3" : "grid-cols-4"}`}
            >
                {cards.map((card) => (
                    <div
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        className={`
                            aspect-square w-full flex items-center justify-center 
                            text-4xl rounded-2xl cursor-pointer shadow-sm border
                            transition-all duration-300 transform select-none
                            ${card.flipped || card.matched 
                                ? "bg-white border-slate-200 rotate-0 shadow-md" 
                                : "bg-slate-700 border-slate-600 text-transparent -rotate-2 hover:rotate-0 hover:bg-slate-800"}
                        `}
                    >
                        {(card.flipped || card.matched) ? card.value : ""}
                    </div>
                ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-4 w-full max-w-xs">
                {gameComplete ? (
                    <button 
                        onClick={() => startLevel(level + 1)}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-md transition-all animate-pulse uppercase tracking-wider text-sm"
                    >
                        Next Level
                    </button>
                ) : (
                    <button 
                        onClick={() => startLevel(level)}
                        className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all text-sm"
                    >
                        Reset Level
                    </button>
                )}
                
                {gameComplete && (
                    <p className="text-emerald-600 font-bold text-sm animate-bounce">
                        Level {level} Cleared!
                    </p>
                )}
            </div>
        </div>
    );
}

export default MemoryGame;
