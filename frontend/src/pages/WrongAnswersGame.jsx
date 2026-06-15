import { useState, useEffect, useRef, useMemo } from "react";
import { addWrongAnswerScore } from "../services/api";

const QUESTIONS = [
    {
        id: 1,
        question: "What is water used for?",
        seriousKeywords: ["drink", "wash", "cleaning", "hydrate", "bath", "cooking", "plant", "liquid", "chemical", "h2o", "ocean", "river", "shower", "irrigation", "clean", "watering"]
    },
    {
        id: 2,
        question: "Why do birds fly?",
        seriousKeywords: ["migrate", "wings", "travel", "wings", "gravity", "air", "sky", "predators", "nest", "warm", "hunt", "feather", "fly", "wind", "escape", "reproduce"]
    },
    {
        id: 3,
        question: "What is the Sun made of?",
        seriousKeywords: ["gas", "hydrogen", "helium", "plasma", "star", "fire", "heat", "light", "energy", "fusion", "sunlight", "core"]
    },
    {
        id: 4,
        question: "What is a computer?",
        seriousKeywords: ["machine", "electronic", "device", "code", "internet", "software", "hardware", "cpu", "calculate", "program", "data", "screen", "compute", "tech"]
    },
    {
        id: 5,
        question: "What is the purpose of sleep?",
        seriousKeywords: ["rest", "energy", "recover", "brain", "health", "dream", "tired", "sleepy", "charge", "body", "memory", "healing"]
    },
    {
        id: 6,
        question: "Why does it rain?",
        seriousKeywords: ["water", "clouds", "condensation", "evaporation", "cycle", "weather", "atmosphere", "moisture", "precipitation", "storm"]
    },
    {
        id: 7,
        question: "What are books used for?",
        seriousKeywords: ["read", "learn", "information", "study", "knowledge", "story", "write", "pages", "words", "education", "school"]
    }
];

const BOT_SILLY_ANSWERS = [
    "To recharge my invisible phone.",
    "For watering my plastic trees.",
    "To make the dust wet so it doesn't fly.",
    "To wash my pet rock.",
    "As hot chocolate sauce.",
    "For inflating tires on my bicycle.",
    "To paint my ceiling blue.",
    "To keep the ocean from drying up.",
    "As glue for sticking clouds together.",
    "To clean my clean clothes again.",
    "To practice swimming in my sleep.",
    "As an emergency hat during a storm.",
    "To feed the monsters under my bed.",
    "For cooling down my spicy thoughts.",
    "To make the grass ticklish."
];

const BOT_NAMES = ["Computer Bot 1", "Computer Bot 2", "Computer Bot 3"];

export default function WrongAnswersGame() {
    // Determine authenticated player
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
    const [phase, setPhase] = useState("start"); // "start", "writing", "voting", "results", "finished"
    const [questionIndices, setQuestionIndices] = useState([0, 1, 2]); // indices of QUESTIONS to play
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [myScore, setMyScore] = useState(0);

    // Round collections
    const [answers, setAnswers] = useState({}); // { username: answerText }
    const [votes, setVotes] = useState({}); // { voterUsername: { votedFunniest, votedCreative } }
    const [roundScores, setRoundScores] = useState({}); // { username: scoreGained }
    const [roundFeedback, setRoundFeedback] = useState({}); // { username: { isSerious, funniestVotes, creativeVotes } }

    const isHost = useMemo(() => {
        if (!isMultiplayer) return true;
        const hostRecord = players.find(p => p.is_host);
        return hostRecord ? hostRecord.username === myUsername : false;
    }, [isMultiplayer, players, myUsername]);

    // Keep players updated in multiplayer
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

    // Current question definition
    const currentQuestion = useMemo(() => {
        const qIdx = questionIndices[round - 1] ?? 0;
        return QUESTIONS[qIdx] || QUESTIONS[0];
    }, [round, questionIndices]);

    // Send game actions in multiplayer helper
    const broadcastAction = (payload) => {
        if (isMultiplayer && window.brainbootsSendGameAction) {
            window.brainbootsSendGameAction(payload);
        }
    };

    // --- MULTIPLAYER WS INCOMING HANDLER ---
    useEffect(() => {
        if (!isMultiplayer) return;

        const handleGameAction = (event) => {
            const { username, payload } = event.detail || {};
            if (!payload || !payload.action) return;

            console.log(`WrongAnswersGame received action: ${payload.action} from ${username}`, payload);

            switch (payload.action) {
                case "start_game_config":
                    if (payload.questionIndices) {
                        setQuestionIndices(payload.questionIndices);
                        setPhase("writing");
                        setRound(1);
                        setMyScore(0);
                        setAnswers({});
                        setVotes({});
                    }
                    break;

                case "submit_answer":
                    if (payload.round === round) {
                        setAnswers(prev => ({
                            ...prev,
                            [username]: payload.answer
                        }));
                    }
                    break;

                case "submit_vote":
                    if (payload.round === round) {
                        setVotes(prev => ({
                            ...prev,
                            [username]: {
                                votedFunniest: payload.votedFunniest,
                                votedCreative: payload.votedCreative
                            }
                        }));
                    }
                    break;

                case "next_round":
                    if (payload.round === round) {
                        setRound(prev => prev + 1);
                        setAnswers({});
                        setVotes({});
                        setPhase("writing");
                        setCurrentAnswer("");
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
    }, [isMultiplayer, round, myScore]);

    // --- AUTOMATIC TRANSITION LOGIC (MULTIPLAYER) ---
    // Transition to Voting when all answers are in
    useEffect(() => {
        if (!isMultiplayer || phase !== "writing" || players.length === 0) return;

        const totalExpected = players.length;
        const submittedCount = Object.keys(answers).length;

        if (submittedCount >= totalExpected && submittedCount > 0) {
            // Auto transition to voting phase
            setPhase("voting");
        }
    }, [isMultiplayer, phase, answers, players]);

    // Transition to Results when all votes are in
    useEffect(() => {
        if (!isMultiplayer || phase !== "voting" || players.length === 0) return;

        const totalExpected = players.length;
        const submittedVotesCount = Object.keys(votes).length;

        if (submittedVotesCount >= totalExpected && submittedVotesCount > 0) {
            // Calculate round points
            calculateScoresAndFeedback();
            setPhase("results");
        }
    }, [isMultiplayer, phase, votes, players]);

    // --- GAME ENGINE FUNCTIONS ---

    const calculateScoresAndFeedback = () => {
        const scoresGained = {};
        const feedback = {};

        // Initialize records for everyone
        const allParticipants = isMultiplayer 
            ? players.map(p => p.username)
            : [myUsername, ...BOT_NAMES];

        allParticipants.forEach(uname => {
            scoresGained[uname] = 0;
            feedback[uname] = {
                isSerious: false,
                funniestVotes: 0,
                creativeVotes: 0,
                answer: answers[uname] || ""
            };
        });

        // 1. Check serious answers
        allParticipants.forEach(uname => {
            const answer = (answers[uname] || "").toLowerCase().trim();
            const isSerious = currentQuestion.seriousKeywords.some(keyword => 
                answer.includes(keyword)
            );
            if (isSerious) {
                scoresGained[uname] -= 30;
                feedback[uname].isSerious = true;
            }
        });

        // 2. Count votes
        Object.keys(votes).forEach(voter => {
            const { votedFunniest, votedCreative } = votes[voter];
            if (votedFunniest && feedback[votedFunniest]) {
                scoresGained[votedFunniest] += 20;
                feedback[votedFunniest].funniestVotes += 1;
            }
            if (votedCreative && feedback[votedCreative]) {
                scoresGained[votedCreative] += 10;
                feedback[votedCreative].creativeVotes += 1;
            }
        });

        setRoundScores(scoresGained);
        setRoundFeedback(feedback);

        // Update current player's accumulated score
        const myGain = scoresGained[myUsername] || 0;
        const newScore = myScore + myGain;
        setMyScore(newScore);

        // Sync score with Multiplayer podium
        if (isMultiplayer && window.brainbootsScoreUpdate) {
            window.brainbootsScoreUpdate(newScore);
        }
    };

    const startGame = () => {
        // Generate random sequence of 3 questions
        const indices = [];
        while (indices.length < 3) {
            const rand = Math.floor(Math.random() * QUESTIONS.length);
            if (!indices.includes(rand)) {
                indices.push(rand);
            }
        }

        if (isMultiplayer) {
            broadcastAction({
                action: "start_game_config",
                questionIndices: indices
            });
        } else {
            setQuestionIndices(indices);
            setPhase("writing");
            setRound(1);
            setMyScore(0);
            setAnswers({});
            setVotes({});
            setCurrentAnswer("");
        }
    };

    const handleSubmitAnswer = () => {
        if (!currentAnswer.trim()) return;

        if (isMultiplayer) {
            broadcastAction({
                action: "submit_answer",
                round,
                answer: currentAnswer.trim()
            });
            // Also store locally to prevent waiting
            setAnswers(prev => ({
                ...prev,
                [myUsername]: currentAnswer.trim()
            }));
        } else {
            // Single Player - generate bot answers instantly
            const newAnswers = {
                [myUsername]: currentAnswer.trim()
            };
            // Pick 3 distinct silly bot answers
            const shuffledSilly = [...BOT_SILLY_ANSWERS].sort(() => Math.random() - 0.5);
            BOT_NAMES.forEach((botName, index) => {
                newAnswers[botName] = shuffledSilly[index];
            });

            setAnswers(newAnswers);
            setPhase("voting");
        }
    };

    const handleVoteSubmit = (votedFunniest, votedCreative) => {
        if (isMultiplayer) {
            broadcastAction({
                action: "submit_vote",
                round,
                votedFunniest,
                votedCreative
            });
            setVotes(prev => ({
                ...prev,
                [myUsername]: { votedFunniest, votedCreative }
            }));
        } else {
            // Single Player - generate bot votes
            const newVotes = {
                [myUsername]: { votedFunniest, votedCreative }
            };

            // Bots vote randomly for other participants (excluding themselves)
            const participants = [myUsername, ...BOT_NAMES];
            BOT_NAMES.forEach(botName => {
                const choices = participants.filter(name => name !== botName);
                newVotes[botName] = {
                    votedFunniest: choices[Math.floor(Math.random() * choices.length)],
                    votedCreative: choices[Math.floor(Math.random() * choices.length)]
                };
            });

            setVotes(newVotes);
            // In single player, transition immediately to results
            // Temporarily set votes state then calculate
            setTimeout(() => {
                setVotes(newVotes);
                // We calculate score using the parameter directly to avoid state batching delay
                const scoresGained = {};
                const feedback = {};

                participants.forEach(uname => {
                    scoresGained[uname] = 0;
                    const ansText = uname === myUsername ? currentAnswer.trim() : answers[uname] || "";
                    feedback[uname] = {
                        isSerious: false,
                        funniestVotes: 0,
                        creativeVotes: 0,
                        answer: ansText
                    };
                });

                // Check serious check
                participants.forEach(uname => {
                    const ans = (feedback[uname].answer || "").toLowerCase().trim();
                    const isSerious = currentQuestion.seriousKeywords.some(kw => ans.includes(kw));
                    if (isSerious) {
                        scoresGained[uname] -= 30;
                        feedback[uname].isSerious = true;
                    }
                });

                // Count votes
                Object.keys(newVotes).forEach(voter => {
                    const { votedFunniest: vf, votedCreative: vc } = newVotes[voter];
                    if (vf && feedback[vf]) {
                        scoresGained[vf] += 20;
                        feedback[vf].funniestVotes += 1;
                    }
                    if (vc && feedback[vc]) {
                        scoresGained[vc] += 10;
                        feedback[vc].creativeVotes += 1;
                    }
                });

                setRoundScores(scoresGained);
                setRoundFeedback(feedback);

                const myGain = scoresGained[myUsername] || 0;
                setMyScore(prev => prev + myGain);
                setPhase("results");
            }, 0);
        }
    };



    const handleNextRound = () => {
        if (round < 3) {
            if (isMultiplayer) {
                broadcastAction({
                    action: "next_round",
                    round
                });
            } else {
                setRound(prev => prev + 1);
                setAnswers({});
                setVotes({});
                setPhase("writing");
                setCurrentAnswer("");
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
            await addWrongAnswerScore({
                score: finalScore
            });

            // Dispatch global event for scoreboard
            window.dispatchEvent(new CustomEvent("brainboots:game-result", {
                detail: {
                    gameName: "Wrong Answers Only",
                    score: finalScore,
                    accuracy: "100%",
                    time: "3 Rounds",
                    performance: finalScore > 0 ? "Hilarious!" : "Too serious!"
                }
            }));
        } catch (error) {
            console.error("Failed to save Wrong Answer score:", error);
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

    // Local Voting states
    const [selectedFunniest, setSelectedFunniest] = useState(null);
    const [selectedCreative, setSelectedCreative] = useState(null);

    const otherAnswers = useMemo(() => {
        return Object.keys(answers)
            .filter(name => name !== myUsername)
            .map(name => ({ username: name, answer: answers[name] }));
    }, [answers, myUsername]);

    const handleVoteClick = () => {
        if (!selectedFunniest || !selectedCreative) return;
        handleVoteSubmit(selectedFunniest, selectedCreative);
    };

    // Styling configurations
    const themeColor = "pink";
    const bgGradient = "from-pink-500 to-rose-600 font-sans";

    return (
        <div className="flex flex-col items-center mt-6 w-full max-w-xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-extrabold text-pink-600 tracking-tight flex items-center gap-2">
                🧠 Wrong Answers Only
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                The Hilarious Party Game of Absurdity
            </p>

            {phase === "start" && (
                <div className="mt-8 p-8 border border-pink-100 bg-white rounded-3xl shadow-md w-full animate-scaleUp">
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        A question will be shown. You MUST write the **wrong answer**. 
                        Serious or correct answers get a <strong>-30 points</strong> penalty! 
                        Everyone votes on the funniest and most creative answers!
                    </p>
                    <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 text-left mb-8">
                        <span className="text-[10px] font-black text-pink-700 uppercase tracking-wider block">Example:</span>
                        <p className="text-xs font-bold text-slate-800 mt-1">Q: What is water used for?</p>
                        <p className="text-xs text-rose-600 mt-1">❌ Drink (Serious Answer Penalty: -30)</p>
                        <p className="text-xs text-emerald-600 mt-0.5">✅ Recharging my pet potato (Funniest Answer: +20)</p>
                    </div>

                    {!isMultiplayer ? (
                        <button
                            onClick={startGame}
                            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:scale-98 transition text-white font-bold rounded-2xl shadow-md text-sm cursor-pointer"
                        >
                            Play Single Player
                        </button>
                    ) : (
                        <div className="p-4 border border-violet-100 bg-violet-50 rounded-2xl text-violet-700 text-xs font-bold animate-pulse">
                            Waiting for the host to prepare the game config...
                        </div>
                    )}
                </div>
            )}

            {phase === "writing" && (
                <div className="mt-6 p-8 border border-pink-100 bg-white rounded-3xl shadow-md w-full text-left relative overflow-hidden animate-scaleUp">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3 text-xs">
                        <span className="font-bold text-pink-500 uppercase">Round {round} / 3</span>
                        <span className="font-mono font-black text-pink-600 text-sm">Score: {myScore}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question:</p>
                    <h2 className="text-xl font-extrabold text-slate-800 leading-snug mb-8">
                        {currentQuestion.question}
                    </h2>

                    {answers[myUsername] ? (
                        <div className="space-y-4">
                            <div className="p-4 border border-emerald-100 bg-emerald-50 rounded-2xl text-emerald-700 text-xs font-bold">
                                Got it! Answer submitted successfully. Waiting for other players...
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Your Answer:</span>
                                <p className="text-sm font-bold text-slate-800 mt-1">{answers[myUsername]}</p>
                            </div>
                            {isMultiplayer && (
                                <div className="text-xs text-slate-400 font-semibold">
                                    Submissions: {Object.keys(answers).length} / {players.length}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <textarea
                                placeholder="Type the funniest wrong answer you can think of..."
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                maxLength={80}
                                rows={3}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-xs font-bold placeholder-slate-400 focus:border-pink-500 focus:bg-white focus:outline-none transition-all"
                            />
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={!currentAnswer.trim()}
                                className={`w-full mt-4 py-4 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-98 ${
                                    currentAnswer.trim()
                                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white cursor-pointer hover:from-pink-600 hover:to-rose-600"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                }`}
                            >
                                Submit Answer
                            </button>
                        </div>
                    )}
                </div>
            )}

            {phase === "voting" && (
                <div className="mt-6 p-8 border border-pink-100 bg-white rounded-3xl shadow-md w-full text-left animate-scaleUp">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3 text-xs">
                        <span className="font-bold text-pink-500 uppercase">Round {round} / 3 • VOTING</span>
                        <span className="font-mono font-black text-pink-600 text-sm">Score: {myScore}</span>
                    </div>

                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question:</p>
                    <h2 className="text-lg font-black text-slate-800 leading-snug mb-6">
                        {currentQuestion.question}
                    </h2>

                    {votes[myUsername] ? (
                        <div className="space-y-4">
                            <div className="p-4 border border-emerald-100 bg-emerald-50 rounded-2xl text-emerald-700 text-xs font-bold">
                                Votes submitted! Waiting for other votes to be cast...
                            </div>
                            {isMultiplayer && (
                                <div className="text-xs text-slate-400 font-semibold">
                                    Votes cast: {Object.keys(votes).length} / {players.length}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {otherAnswers.length === 0 ? (
                                <div className="p-4 text-slate-400 text-xs font-bold text-center border border-slate-100 rounded-2xl">
                                    No other answers to vote on yet!
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs font-extrabold text-pink-700 uppercase tracking-wider mb-3">
                                        Select the Funniest Answer:
                                    </p>
                                    <div className="space-y-2 mb-6">
                                        {otherAnswers.map(ans => (
                                            <button
                                                key={`funniest-${ans.username}`}
                                                type="button"
                                                onClick={() => setSelectedFunniest(ans.username)}
                                                className={`w-full p-4 text-xs font-bold text-left rounded-2xl border transition-all ${
                                                    selectedFunniest === ans.username
                                                        ? "border-pink-500 bg-pink-50/70 text-pink-800"
                                                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                                                }`}
                                            >
                                                {ans.answer}
                                            </button>
                                        ))}
                                    </div>

                                    <p className="text-xs font-extrabold text-violet-700 uppercase tracking-wider mb-3">
                                        Select the Most Creative Answer:
                                    </p>
                                    <div className="space-y-2">
                                        {otherAnswers.map(ans => (
                                            <button
                                                key={`creative-${ans.username}`}
                                                type="button"
                                                onClick={() => setSelectedCreative(ans.username)}
                                                className={`w-full p-4 text-xs font-bold text-left rounded-2xl border transition-all ${
                                                    selectedCreative === ans.username
                                                        ? "border-violet-500 bg-violet-50/70 text-violet-800"
                                                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                                                }`}
                                            >
                                                {ans.answer}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleVoteClick}
                                disabled={!selectedFunniest || !selectedCreative}
                                className={`w-full py-4 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-98 ${
                                    selectedFunniest && selectedCreative
                                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white cursor-pointer hover:from-pink-600 hover:to-rose-600"
                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                }`}
                            >
                                Submit Votes
                            </button>
                        </div>
                    )}
                </div>
            )}

            {phase === "results" && (
                <div className="mt-6 p-8 border border-pink-100 bg-white rounded-3xl shadow-md w-full text-left animate-scaleUp">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3 text-xs">
                        <span className="font-bold text-pink-500 uppercase">Round {round} Results</span>
                        <span className="font-mono font-black text-pink-600 text-sm">Score: {myScore}</span>
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Question:</p>
                    <h3 className="text-base font-black text-slate-800 leading-snug mb-6">
                        {currentQuestion.question}
                    </h3>

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
                                            ? "border-pink-200 bg-pink-50/50" 
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
                                        "{details.answer}"
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2.5 text-[9px] font-black uppercase">
                                        {details.isSerious && (
                                            <span className="bg-rose-50 border border-rose-100 text-rose-700 px-2 py-0.5 rounded-md">
                                                ❌ Serious Penalty (-30)
                                            </span>
                                        )}
                                        {details.funniestVotes > 0 && (
                                            <span className="bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-md">
                                                🏆 Funniest ×{details.funniestVotes} (+{details.funniestVotes * 20})
                                            </span>
                                        )}
                                        {details.creativeVotes > 0 && (
                                            <span className="bg-violet-50 border border-violet-100 text-violet-700 px-2 py-0.5 rounded-md">
                                                💡 Creative ×{details.creativeVotes} (+{details.creativeVotes * 10})
                                            </span>
                                        )}
                                        {!details.isSerious && details.funniestVotes === 0 && details.creativeVotes === 0 && (
                                            <span className="text-slate-400 font-bold px-2 py-0.5">
                                                No votes received
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
                            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:scale-98 transition text-white font-bold rounded-2xl shadow-md text-sm cursor-pointer text-center"
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
                <div className="mt-8 p-8 border border-pink-100 bg-white rounded-3xl shadow-md w-full animate-scaleUp">
                    <span className="text-5xl mb-4 block">🏆</span>
                    <h2 className="text-2xl font-black text-slate-800">Final Results!</h2>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">
                        Wrong Answers Only
                    </p>

                    <div className="my-8 p-6 bg-pink-50 border border-pink-100 rounded-3xl max-w-sm mx-auto">
                        <span className="text-[10px] font-black text-pink-700 uppercase tracking-widest block">Your Total Score</span>
                        <span className="text-5xl font-black text-pink-600 font-mono tracking-tight block mt-2">{myScore}</span>
                    </div>

                    <p className="text-xs text-slate-500 font-semibold mb-6">
                        Your high score has been saved in the database!
                    </p>
                    
                    {!isMultiplayer && (
                        <button
                            onClick={startGame}
                            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:scale-98 transition text-white font-bold rounded-2xl shadow-md text-sm cursor-pointer"
                        >
                            Play Again
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
