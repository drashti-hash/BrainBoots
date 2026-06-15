import { useState, useEffect, useRef, useMemo } from "react";
import { addHotPotatoScore } from "../services/api";

const WORDS_POOL = [
    { word: "banana", emoji: "🍌" },
    { word: "pickle", emoji: "🥒" },
    { word: "wombat", emoji: "🐻" },
    { word: "underwear", emoji: "🩲" },
    { word: "socks", emoji: "🧦" },
    { word: "noodle", emoji: "🍜" },
    { word: "potato", emoji: "🥔" },
    { word: "toilet", emoji: "🚽" },
    { word: "chicken", emoji: "🐔" },
    { word: "diaper", emoji: "🧷" },
    { word: "octopus", emoji: "🐙" },
    { word: "balloon", emoji: "🎈" }
];

const BOT_TEMPLATES = [
    "I was wearing my favorite {word} on my head today.",
    "Never bring a wet {word} to a fancy dinner party.",
    "My grandmother trained a wild {word} to fetch her coffee.",
    "A shiny {word} is the secret to passing all examinations.",
    "I accidentally stepped on a soft {word} and flew to Mars.",
    "Legend says a golden {word} is buried under the playground.",
    "Please do not feed the angry {word} after midnight.",
    "I traded my homework for a half-eaten {word}.",
    "The prime minister declared that every citizen deserves a {word}.",
    "My dog barked at a {word} until it started singing opera.",
    "I got stuck inside a giant {word} at the shopping mall."
];

const BOT_NAMES = ["Computer Bot 1", "Computer Bot 2", "Computer Bot 3"];

export default function HotPotatoGame() {
    // Authenticated user credentials
    const user = useMemo(() => {
        try {
            const val = localStorage.getItem("user");
            return val ? JSON.parse(val) : {};
        } catch {
            return {};
        }
    }, []);
    const myUsername = user.username || user.email || "Player";

    const isMultiplayer = !!window.brainbootsIsMultiplayer;

    // Room state (for multiplayer)
    const [players, setPlayers] = useState([]);
    
    // Game loops
    const [round, setRound] = useState(1);
    const [phase, setPhase] = useState("start"); // "start", "playing", "voting", "results", "finished"
    const [wordIndices, setWordIndices] = useState([0, 1, 2]); // indices of WORDS_POOL
    const [currentHolder, setCurrentHolder] = useState("");
    const [lastPasser, setLastPasser] = useState("");
    const [roundSentences, setRoundSentences] = useState([]); // Array of { username, sentence }
    const [votes, setVotes] = useState({}); // { voterUsername: votedUsername }
    const [myScore, setMyScore] = useState(0);
    const [roundTimer, setRoundTimer] = useState(30);

    const [currentInput, setCurrentInput] = useState("");
    const [inputError, setInputError] = useState("");

    // Round summaries
    const [explodedPlayer, setExplodedPlayer] = useState("");
    const [roundScores, setRoundScores] = useState({}); // { username: scoreGained }
    const [roundFeedback, setRoundFeedback] = useState({}); // { username: { sentence, votesReceived, isExploded, isSafePass } }

    const isHost = useMemo(() => {
        if (!isMultiplayer) return true;
        const hostRecord = players.find(p => p.is_host);
        return hostRecord ? hostRecord.username === myUsername : false;
    }, [isMultiplayer, players, myUsername]);

    // Keep players list updated in multiplayer
    useEffect(() => {
        if (isMultiplayer) {
            const interval = setInterval(() => {
                if (window.brainbootsPlayers) {
                    setPlayers(window.brainbootsPlayers);
                }
            }, 500);
            return () => clearInterval(interval);
        }
    }, [isMultiplayer]);

    // Get current target word
    const currentWordInfo = useMemo(() => {
        const wIdx = wordIndices[round - 1] ?? 0;
        return WORDS_POOL[wIdx] || WORDS_POOL[0];
    }, [round, wordIndices]);

    // Send generic game actions
    const broadcastAction = (payload) => {
        if (isMultiplayer && window.brainbootsSendGameAction) {
            window.brainbootsSendGameAction(payload);
        }
    };

    // --- REALTIME WEBSOCKET INCOMING ROUTER ---
    useEffect(() => {
        if (!isMultiplayer) return;

        const handleGameAction = (event) => {
            const { username, payload } = event.detail || {};
            if (!payload || !payload.action) return;

            switch (payload.action) {
                case "start_game_config":
                    if (payload.wordIndices) {
                        setWordIndices(payload.wordIndices);
                        setRound(1);
                        setMyScore(0);
                        setRoundSentences([]);
                        setVotes({});
                        setCurrentHolder(payload.startingHolder);
                        setLastPasser("");
                        setRoundTimer(30);
                        setPhase("playing");
                        setInputError("");
                        setCurrentInput("");
                    }
                    break;

                case "pass_potato":
                    if (payload.round === round) {
                        setRoundSentences(prev => [
                            ...prev,
                            { username: payload.sender, sentence: payload.sentence }
                        ]);
                        setCurrentHolder(payload.nextHolder);
                        setLastPasser(payload.sender);
                    }
                    break;

                case "explode_potato":
                    if (payload.round === round) {
                        setExplodedPlayer(payload.explodedPlayer);
                        calculateRoundPoints(payload.explodedPlayer, payload.lastPasser, payload.sentences);
                        setPhase("voting");
                        setVotes({});
                    }
                    break;

                case "submit_vote":
                    if (payload.round === round) {
                        setVotes(prev => ({
                            ...prev,
                            [username]: payload.votedFor
                        }));
                    }
                    break;

                case "next_round":
                    if (payload.round === round) {
                        setRound(prev => prev + 1);
                        setRoundSentences([]);
                        setVotes({});
                        setCurrentHolder(payload.startingHolder);
                        setLastPasser("");
                        setRoundTimer(30);
                        setPhase("playing");
                        setCurrentInput("");
                        setInputError("");
                    }
                    break;

                case "finish_game":
                    finishGame(myScore);
                    break;

                default:
                    break;
            }
        };

        window.addEventListener("brainboots:game-action", handleGameAction);
        return () => {
            window.removeEventListener("brainboots:game-action", handleGameAction);
        };
    }, [isMultiplayer, round, myScore, players, currentWordInfo]);

    // --- GAME REAL-TIME MULTIPLAYER BOT SIMULATION (RUN BY HOST) ---
    useEffect(() => {
        if (!isMultiplayer || !isHost || phase !== "playing") return;

        // If the current holder is a bot, the Host's client will simulate it
        if (currentHolder.startsWith("Computer Bot")) {
            const delay = Math.random() * 2000 + 2000; // 2-4 seconds delay
            const timer = setTimeout(() => {
                // Generate bot sentence
                const template = BOT_TEMPLATES[Math.floor(Math.random() * BOT_TEMPLATES.length)];
                const sentence = template.replace("{word}", currentWordInfo.word);

                // Choose next holder (prefer humans, else pick next random bot/player)
                const candidates = players.map(p => p.username).filter(uname => uname !== currentHolder);
                const nextHolder = candidates[Math.floor(Math.random() * candidates.length)] || myUsername;

                broadcastAction({
                    action: "pass_potato",
                    round,
                    sentence,
                    sender: currentHolder,
                    nextHolder
                });

                // Update local Host state immediately to keep moving
                setRoundSentences(prev => [
                    ...prev,
                    { username: currentHolder, sentence }
                ]);
                setCurrentHolder(nextHolder);
                setLastPasser(currentHolder);
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [isMultiplayer, isHost, phase, currentHolder, currentWordInfo, players]);

    // --- AUTOMATIC TRANSITION TO RESULTS (MULTIPLAYER) ---
    useEffect(() => {
        if (!isMultiplayer || phase !== "voting" || players.length === 0) return;

        const totalExpected = players.length;
        const votesCount = Object.keys(votes).length;

        if (votesCount >= totalExpected && votesCount > 0) {
            calculateVotesAndTransition();
        }
    }, [isMultiplayer, phase, votes, players]);

    // --- ROUND TIMER EFFECT ---
    useEffect(() => {
        if (phase !== "playing") return;

        const interval = setInterval(() => {
            setRoundTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    if (!isMultiplayer || isHost) {
                        // Explode the holder!
                        handleExplosion();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [phase, currentHolder, roundSentences, lastPasser, isMultiplayer, isHost]);

    // --- CORE GAME ACTIONS ---

    const handleExplosion = () => {
        const targetLoser = currentHolder;
        if (isMultiplayer) {
            broadcastAction({
                action: "explode_potato",
                round,
                explodedPlayer: targetLoser,
                lastPasser,
                sentences: roundSentences
            });
        } else {
            setExplodedPlayer(targetLoser);
            calculateRoundPoints(targetLoser, lastPasser, roundSentences);
            setPhase("voting");
            setVotes({});
        }
    };

    const calculateRoundPoints = (exploded, passer, sentencesList) => {
        const scoresGained = {};
        const feedback = {};

        const participants = isMultiplayer 
            ? players.map(p => p.username)
            : [myUsername, ...BOT_NAMES];

        participants.forEach(uname => {
            scoresGained[uname] = 0;
            const matchSentence = sentencesList.find(s => s.username === uname);
            feedback[uname] = {
                sentence: matchSentence ? matchSentence.sentence : "(No sentence written)",
                votesReceived: 0,
                isExploded: uname === exploded,
                isSafePass: uname === passer
            };

            // Exploded penalty
            if (uname === exploded) {
                scoresGained[uname] -= 20;
            }
            // Safe pass bonus
            if (uname === passer) {
                scoresGained[uname] += 10;
            }
        });

        setRoundScores(scoresGained);
        setRoundFeedback(feedback);
    };

    const calculateVotesAndTransition = () => {
        const scoreUpdates = { ...roundScores };
        const updatedFeedback = { ...roundFeedback };

        // Count votes
        Object.keys(votes).forEach(voter => {
            const votedFor = votes[voter];
            if (votedFor && updatedFeedback[votedFor]) {
                updatedFeedback[votedFor].votesReceived += 1;
                scoreUpdates[votedFor] += 30; // +30 for funniest vote!
            }
        });

        setRoundScores(scoreUpdates);
        setRoundFeedback(updatedFeedback);

        // Update score
        const gain = scoreUpdates[myUsername] || 0;
        const newTotal = myScore + gain;
        setMyScore(newTotal);

        if (isMultiplayer && window.brainbootsScoreUpdate) {
            window.brainbootsScoreUpdate(newTotal);
        }

        setPhase("results");
    };

    const startGame = () => {
        const indices = [];
        while (indices.length < 3) {
            const rand = Math.floor(Math.random() * WORDS_POOL.length);
            if (!indices.includes(rand)) {
                indices.push(rand);
            }
        }

        const participants = isMultiplayer 
            ? players.map(p => p.username)
            : [myUsername, ...BOT_NAMES];

        const startingHolder = participants[Math.floor(Math.random() * participants.length)];

        if (isMultiplayer) {
            broadcastAction({
                action: "start_game_config",
                wordIndices: indices,
                startingHolder
            });
        } else {
            setWordIndices(indices);
            setRound(1);
            setMyScore(0);
            setRoundSentences([]);
            setVotes({});
            setCurrentHolder(startingHolder);
            setLastPasser("");
            setRoundTimer(30);
            setPhase("playing");
            setInputError("");
            setCurrentInput("");
        }
    };

    const handlePassPotato = () => {
        const text = currentInput.trim();
        const targetWord = currentWordInfo.word.toLowerCase();

        if (!text) return;
        if (!text.toLowerCase().includes(targetWord)) {
            setInputError(`Your sentence must contain the word "${targetWord}"!`);
            return;
        }

        setInputError("");

        const participants = isMultiplayer 
            ? players.map(p => p.username)
            : [myUsername, ...BOT_NAMES];

        // Pick next random holder (not myself)
        const choices = participants.filter(uname => uname !== myUsername);
        const nextHolder = choices[Math.floor(Math.random() * choices.length)] || myUsername;

        if (isMultiplayer) {
            broadcastAction({
                action: "pass_potato",
                round,
                sentence: text,
                sender: myUsername,
                nextHolder
            });
            // Update local state immediately
            setRoundSentences(prev => [
                ...prev,
                { username: myUsername, sentence: text }
            ]);
            setCurrentHolder(nextHolder);
            setLastPasser(myUsername);
        } else {
            // Single Player - handle local loops
            const updatedSentences = [
                ...roundSentences,
                { username: myUsername, sentence: text }
            ];
            setRoundSentences(updatedSentences);
            setCurrentHolder(nextHolder);
            setLastPasser(myUsername);
            setCurrentInput("");

            // bot triggers passing in single player
            runBotPasses(nextHolder, updatedSentences);
        }

        setCurrentInput("");
    };

    // --- OFFLINE BOT REAL-TIME TYPING LOOPS ---
    const runBotPasses = (activeHolder, currentList) => {
        if (phase !== "playing" || !activeHolder.startsWith("Computer Bot")) return;

        const delay = Math.random() * 2000 + 2000; // 2-4 seconds
        setTimeout(() => {
            // Double check round state
            setRoundTimer(t => {
                if (t <= 0) return 0;
                
                // Bot types sentence
                const template = BOT_TEMPLATES[Math.floor(Math.random() * BOT_TEMPLATES.length)];
                const sentence = template.replace("{word}", currentWordInfo.word);

                const participants = [myUsername, ...BOT_NAMES];
                const choices = participants.filter(name => name !== activeHolder);
                const next = choices[Math.floor(Math.random() * choices.length)] || myUsername;

                setRoundSentences(prev => {
                    const newList = [...prev, { username: activeHolder, sentence }];
                    setCurrentHolder(next);
                    setLastPasser(activeHolder);

                    // If the next holder is another bot, keep passing!
                    if (next.startsWith("Computer Bot")) {
                        runBotPasses(next, newList);
                    }
                    return newList;
                });

                return t;
            });
        }, delay);
    };

    const handleVoteSubmit = (votedFor) => {
        if (isMultiplayer) {
            broadcastAction({
                action: "submit_vote",
                round,
                votedFor
            });
            setVotes(prev => ({
                ...prev,
                [myUsername]: votedFor
            }));
        } else {
            // Single Player - generate bot votes
            const newVotes = {
                [myUsername]: votedFor
            };

            BOT_NAMES.forEach(botName => {
                // Bots vote for any sentence written, excluding their own
                const candidates = roundSentences.filter(s => s.username !== botName);
                if (candidates.length > 0) {
                    const picked = candidates[Math.floor(Math.random() * candidates.length)].username;
                    newVotes[botName] = picked;
                }
            });

            setVotes(newVotes);

            // Calculate score locally in single player
            setTimeout(() => {
                const scoreUpdates = { ...roundScores };
                const updatedFeedback = { ...roundFeedback };

                Object.keys(newVotes).forEach(voter => {
                    const vf = newVotes[voter];
                    if (vf && updatedFeedback[vf]) {
                        updatedFeedback[vf].votesReceived += 1;
                        scoreUpdates[vf] += 30;
                    }
                });

                setRoundScores(scoreUpdates);
                setRoundFeedback(updatedFeedback);

                const gain = scoreUpdates[myUsername] || 0;
                setMyScore(prev => prev + gain);
                setPhase("results");
            }, 0);
        }
    };

    const handleNextRound = () => {
        if (round < 3) {
            const participants = isMultiplayer 
                ? players.map(p => p.username)
                : [myUsername, ...BOT_NAMES];
            const startingHolder = participants[Math.floor(Math.random() * participants.length)];

            if (isMultiplayer) {
                broadcastAction({
                    action: "next_round",
                    round,
                    startingHolder
                });
            } else {
                setRound(prev => prev + 1);
                setRoundSentences([]);
                setVotes({});
                setCurrentHolder(startingHolder);
                setLastPasser("");
                setRoundTimer(30);
                setPhase("playing");
                setCurrentInput("");
                setInputError("");
            }
        } else {
            if (isMultiplayer) {
                broadcastAction({
                    action: "finish_game"
                });
            } else {
                finishGame(myScore);
            }
        }
    };

    const finishGame = async (finalScore) => {
        setPhase("finished");
        try {
            await addHotPotatoScore({
                score: finalScore
            });

            window.dispatchEvent(new CustomEvent("brainboots:game-result", {
                detail: {
                    gameName: "Hot Potato Chat",
                    score: finalScore,
                    accuracy: "100%",
                    time: "3 Rounds",
                    performance: finalScore > 0 ? "Fast Fingers!" : "Exploded!"
                }
            }));
        } catch (error) {
            console.error("Failed to save Hot Potato score:", error);
        }
    };

    // --- MULTIPLAYER AUTO-START ---
    useEffect(() => {
        if (isMultiplayer) {
            const handleStart = () => {
                startGame();
            };
            window.addEventListener("brainboots:start-game", handleStart);
            return () => {
                window.removeEventListener("brainboots:start-game", handleStart);
            };
        }
    }, [isMultiplayer]);

    // Filtering votes and sentences
    const otherSentences = useMemo(() => {
        return roundSentences.filter(s => s.username !== myUsername);
    }, [roundSentences, myUsername]);

    const [votedFunniest, setVotedFunniest] = useState(null);

    const handleVoteClick = () => {
        if (!votedFunniest) return;
        handleVoteSubmit(votedFunniest);
    };

    const holdingMe = currentHolder === myUsername;

    return (
        <div className="flex flex-col items-center mt-6 w-full max-w-xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight flex items-center gap-2 animate-bounce">
                🥔 Hot Potato Chat
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Type fast to pass the potato!
            </p>

            {phase === "start" && (
                <div className="mt-8 p-8 border border-orange-100 bg-white rounded-3xl shadow-md w-full animate-scaleUp">
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        One random word is given (e.g. <strong>"banana" 🍌</strong>). 
                        If you have the potato, you must write a funny sentence containing the word to pass it! 
                        Don't get caught holding the potato when the timer runs out, or you will explode!
                    </p>
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-left mb-8">
                        <span className="text-[10px] font-black text-orange-700 uppercase tracking-wider block">Rules:</span>
                        <p className="text-xs font-bold text-slate-800 mt-1">1. Holder must type a sentence using the target word.</p>
                        <p className="text-xs text-slate-600 mt-0.5">2. Explosion loses <strong>-20 points</strong>.</p>
                        <p className="text-xs text-slate-600 mt-0.5">3. Vote on the funniest sentence (+30 points!).</p>
                    </div>

                    {!isMultiplayer ? (
                        <button
                            onClick={startGame}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98 transition text-white font-bold rounded-2xl shadow-md text-sm cursor-pointer"
                        >
                            Play Single Player
                        </button>
                    ) : (
                        <div className="p-4 border border-violet-100 bg-violet-50 rounded-2xl text-violet-700 text-xs font-bold animate-pulse">
                            Waiting for the host to start the hot potato match...
                        </div>
                    )}
                </div>
            )}

            {phase === "playing" && (
                <div className={`mt-6 p-8 border rounded-3xl shadow-md w-full text-left relative overflow-hidden transition-all duration-300 animate-scaleUp ${
                    holdingMe 
                        ? "border-red-300 bg-red-50/20 shadow-red-100 shadow-lg" 
                        : "border-orange-100 bg-white"
                }`}>
                    {/* Header bar */}
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3 text-xs">
                        <span className="font-bold text-orange-500 uppercase">Round {round} / 3</span>
                        <div className="flex items-center gap-4">
                            <span className="font-mono font-black text-red-600 text-sm animate-pulse">{roundTimer}s</span>
                            <span className="font-mono font-black text-orange-600 text-sm">Score: {myScore}</span>
                        </div>
                    </div>

                    {/* Word indicator */}
                    <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6">
                        <span className="text-3xl">{currentWordInfo.emoji}</span>
                        <div>
                            <span className="text-[10px] font-black text-orange-700 uppercase tracking-wider block">Target Word:</span>
                            <span className="text-xl font-black text-slate-800 tracking-tight uppercase underline decoration-wavy decoration-orange-500">{currentWordInfo.word}</span>
                        </div>
                    </div>

                    {/* Holder Status Display */}
                    <div className={`p-4 rounded-2xl border text-center mb-6 ${
                        holdingMe 
                            ? "bg-red-500 text-white border-red-600 animate-pulse" 
                            : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}>
                        <p className="text-xs font-bold uppercase tracking-wider">
                            {holdingMe ? "🥔 YOU HOLD THE POTATO! TYPE QUICK!" : `🥔 ${currentHolder} holds the potato!`}
                        </p>
                    </div>

                    {holdingMe ? (
                        <div>
                            <textarea
                                placeholder={`Type a funny sentence using the word "${currentWordInfo.word}"...`}
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handlePassPotato();
                                    }
                                }}
                                maxLength={80}
                                rows={2}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-xs font-bold placeholder-slate-400 focus:border-red-500 focus:bg-white focus:outline-none transition-all"
                            />
                            {inputError && (
                                <p className="mt-2 text-xs font-bold text-red-600">
                                    {inputError}
                                </p>
                            )}
                            <button
                                onClick={handlePassPotato}
                                disabled={!currentInput.trim()}
                                className={`w-full mt-4 py-4 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-98 ${
                                    currentInput.trim()
                                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white cursor-pointer hover:from-red-600 hover:to-orange-600"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                }`}
                            >
                                Pass Potato! ➔
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-center py-4 text-slate-400 text-xs font-bold italic animate-pulse">
                                Awaiting potato pass...
                            </div>
                            <div className="space-y-2 max-h-36 overflow-y-auto border border-slate-100 rounded-2xl p-3 bg-slate-50/50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Chat Log:</span>
                                {roundSentences.slice(-3).map((item, idx) => (
                                    <div key={idx} className="text-xs text-slate-600 leading-normal">
                                        <strong className="text-slate-800">{item.username}:</strong> "{item.sentence}"
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {phase === "voting" && (
                <div className="mt-6 p-8 border border-orange-100 bg-white rounded-3xl shadow-md w-full text-left animate-scaleUp">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3 text-xs">
                        <span className="font-bold text-orange-500 uppercase">Round {round} / 3 • VOTING</span>
                        <span className="font-mono font-black text-orange-600 text-sm">Score: {myScore}</span>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-bold text-center mb-6">
                        💥 Boom! Time ran out. <strong>{explodedPlayer}</strong> exploded!
                    </div>

                    {votes[myUsername] ? (
                        <div className="space-y-4 text-center">
                            <div className="p-4 border border-emerald-100 bg-emerald-50 rounded-2xl text-emerald-700 text-xs font-bold">
                                Vote recorded! waiting for other votes to be cast...
                            </div>
                            {isMultiplayer && (
                                <div className="text-xs text-slate-400 font-semibold">
                                    Votes cast: {Object.keys(votes).length} / {players.length}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="text-xs font-extrabold text-orange-700 uppercase tracking-wider mb-3">
                                Vote for the Funniest sentence of the round:
                            </p>
                            
                            {otherSentences.length === 0 ? (
                                <div className="p-4 border border-slate-100 bg-slate-50 rounded-2xl text-slate-400 text-xs font-bold text-center mb-6">
                                    No other sentences were typed this round!
                                </div>
                            ) : (
                                <div className="space-y-2 mb-6">
                                    {otherSentences.map(item => (
                                        <button
                                            key={`vote-${item.username}`}
                                            type="button"
                                            onClick={() => setVotedFunniest(item.username)}
                                            className={`w-full p-4 text-xs font-bold text-left rounded-2xl border transition-all ${
                                                votedFunniest === item.username
                                                    ? "border-orange-500 bg-orange-50/70 text-orange-850"
                                                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                                            }`}
                                        >
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Written by someone:</span>
                                            "{item.sentence}"
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handleVoteClick}
                                disabled={otherSentences.length > 0 && !votedFunniest}
                                className={`w-full py-4 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-98 ${
                                    (otherSentences.length === 0 || votedFunniest)
                                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white cursor-pointer hover:from-orange-600 hover:to-amber-600"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                }`}
                            >
                                Submit Vote
                            </button>
                        </div>
                    )}
                </div>
            )}

            {phase === "results" && (
                <div className="mt-6 p-8 border border-orange-100 bg-white rounded-3xl shadow-md w-full text-left animate-scaleUp">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3 text-xs">
                        <span className="font-bold text-orange-500 uppercase">Round {round} Results</span>
                        <span className="font-mono font-black text-orange-600 text-sm">Score: {myScore}</span>
                    </div>

                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Round Summary:</p>
                    <div className="space-y-4 mb-8">
                        {Object.keys(roundFeedback).map(uname => {
                            const details = roundFeedback[uname];
                            const pointsGained = roundScores[uname] || 0;
                            const isMe = uname === myUsername;

                            return (
                                <div 
                                    key={uname}
                                    className={`p-4 rounded-2xl border ${
                                        isMe 
                                            ? "border-orange-200 bg-orange-50/30" 
                                            : "border-slate-100 bg-slate-50/50"
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-black text-slate-800">
                                            {uname} {isMe && "(You)"}
                                        </span>
                                        <span className={`text-xs font-bold font-mono ${pointsGained >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                            {pointsGained >= 0 ? `+${pointsGained}` : pointsGained} pts
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 italic bg-white border border-slate-100 rounded-xl p-2.5">
                                        "{details.sentence}"
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2.5 text-[9px] font-black uppercase">
                                        {details.isExploded && (
                                            <span className="bg-red-50 border border-red-100 text-red-705 px-2 py-0.5 rounded-md animate-pulse">
                                                💥 Exploded (-20)
                                            </span>
                                        )}
                                        {details.isSafePass && (
                                            <span className="bg-emerald-50 border border-emerald-100 text-emerald-750 px-2 py-0.5 rounded-md">
                                                🛡️ Safe Pass (+10)
                                            </span>
                                        )}
                                        {details.votesReceived > 0 && (
                                            <span className="bg-amber-50 border border-amber-100 text-amber-705 px-2 py-0.5 rounded-md animate-bounce">
                                                🏆 Funny ×{details.votesReceived} (+{details.votesReceived * 30})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {(!isMultiplayer || isHost) ? (
                        <button
                            onClick={handleNextRound}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98 transition text-white font-bold rounded-2xl shadow-md text-sm cursor-pointer text-center"
                        >
                            {round < 3 ? "Next Round ➔" : "Finish Game 🏁"}
                        </button>
                    ) : (
                        <div className="p-4 border border-violet-100 bg-violet-50 rounded-2xl text-violet-700 text-xs font-bold animate-pulse text-center">
                            Waiting for the Host to transition to the next round...
                        </div>
                    )}
                </div>
            )}

            {phase === "finished" && (
                <div className="mt-8 p-8 border border-orange-100 bg-white rounded-3xl shadow-md w-full animate-scaleUp">
                    <span className="text-5xl mb-4 block animate-bounce">🏆</span>
                    <h2 className="text-2xl font-black text-slate-800">Final Results!</h2>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">
                        Hot Potato Chat
                    </p>

                    <div className="my-8 p-6 bg-orange-50 border border-orange-100 rounded-3xl max-w-sm mx-auto">
                        <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest block">Your Total Score</span>
                        <span className="text-5xl font-black text-orange-600 font-mono tracking-tight block mt-2">{myScore}</span>
                    </div>

                    <p className="text-xs text-slate-500 font-semibold mb-6">
                        Your high score has been saved in the database!
                    </p>
                    
                    {!isMultiplayer && (
                        <button
                            onClick={startGame}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98 transition text-white font-bold rounded-2xl shadow-md text-sm cursor-pointer"
                        >
                            Play Again
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
