import { useState, useEffect, useRef } from "react";
import { addTypingScore } from "../services/api";

const levels = {
  easy: {
    name: "🌱 Easy",
    time: 45,
    sentences: [
      "The quick brown fox jumps over the lazy dog near the river bank.",
      "Coding is fun and creative when you build amazing projects daily.",
      "A bright sunny day makes everyone feel happy and energetic outside.",
      "She sells sea shells by the seashore on sunny summer afternoons.",
      "Learning new skills opens many doors for future opportunities ahead."
    ]
  },
  medium: {
    name: "⚡ Medium",
    time: 35,
    sentences: [
      "React components efficiently manage state and props for dynamic user interfaces.",
      "Django provides a robust framework for building scalable web applications quickly.",
      "JavaScript promises enable elegant handling of asynchronous operations and callbacks.",
      "CSS Flexbox creates responsive layouts that adapt seamlessly to screen sizes.",
      "Python decorators allow modifying function behavior without changing its core code."
    ]
  },
  hard: {
    name: "🔥 Hard",
    time: 25,
    sentences: [
      "Asynchronous programming in JavaScript utilizes Promises and async await syntax for non-blocking operations.",
      "Django REST framework serializers convert complex data types like querysets into JSON format seamlessly.",
      "React's virtual DOM minimizes direct manipulations by batching updates and diffing efficiently.",
      "TypeScript adds static typing to JavaScript, catching errors early during development phases.",
      "WebSockets enable full-duplex communication channels over a single TCP connection persistently."
    ]
  }
};

function TypingGame() {
  const [difficulty, setDifficulty] = useState("easy");
  const [currentSentence, setCurrentSentence] = useState("");
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(45);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [charStats, setCharStats] = useState({ correct: 0, total: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  
  const inputRef = useRef(null);

  const loadRandomSentence = () => {
    const sentences = levels[difficulty].sentences;
    const randomIndex = Math.floor(Math.random() * sentences.length);
    setCurrentSentence(sentences[randomIndex]);
  };

  useEffect(() => {
    loadRandomSentence();
    setInput("");
    setTimeLeft(levels[difficulty].time);
    setIsRunning(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(0);
    setCharStats({ correct: 0, total: 0 });
    setGameStarted(false);
  }, [difficulty]);

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0 && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            calculateFinalScore();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isFinished]);

  const calculateLiveStats = (typedText) => {
    let correct = 0;
    const maxLength = Math.min(typedText.length, currentSentence.length);
    for (let i = 0; i < maxLength; i++) {
      if (typedText[i] === currentSentence[i]) {
        correct++;
      }
    }
    setCharStats({ correct, total: typedText.length });
    
    if (typedText === currentSentence && !isFinished && isRunning) {
      setIsRunning(false);
      setIsFinished(true);
      calculateFinalScore(typedText);
    }
  };

  const handleChange = (e) => {
    const typedValue = e.target.value;
    
    if (!isRunning && !isFinished && timeLeft > 0) {
      setIsRunning(true);
      setGameStarted(true);
    }
    
    setInput(typedValue);
    calculateLiveStats(typedValue);
  };

  const calculateFinalScore = (finalInput = null) => {
    const typedText = finalInput !== null ? finalInput : input;
    
    const timeElapsed = levels[difficulty].time - timeLeft;
    const minutesElapsed = Math.max(0.1, timeElapsed / 60);
    const totalCharacters = typedText.length;
    const rawWords = totalCharacters / 5;
    let calculatedWpm = Math.floor(rawWords / minutesElapsed);
    calculatedWpm = Math.min(calculatedWpm, 200);
    
    let correctChars = 0;
    const minLength = Math.min(typedText.length, currentSentence.length);
    for (let i = 0; i < minLength; i++) {
      if (typedText[i] === currentSentence[i]) {
        correctChars++;
      }
    }
    const extraChars = Math.max(0, typedText.length - currentSentence.length);
    const maxPossible = currentSentence.length;
    const effectiveCorrect = Math.max(0, correctChars - extraChars * 0.5);
    const calculatedAccuracy = ((effectiveCorrect / maxPossible) * 100).toFixed(1);
    
    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);
    
    const saveScore = async () => {
      try {
        await addTypingScore({
          wpm: calculatedWpm,
          accuracy: parseFloat(calculatedAccuracy),
          total_time: levels[difficulty].time,
          difficulty: difficulty,
          sentence_length: currentSentence.length
        });
        console.log("Typing score saved successfully");
      } catch (error) {
        console.error("Failed to save score:", error);
      }
    };
    saveScore();
  };

  const restartGame = () => {
    loadRandomSentence();
    setInput("");
    setTimeLeft(levels[difficulty].time);
    setIsRunning(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(0);
    setCharStats({ correct: 0, total: 0 });
    setGameStarted(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const changeDifficulty = (newDiff) => {
    if (isRunning) return;
    setDifficulty(newDiff);
  };

  const progressPercent = currentSentence.length > 0 
    ? (charStats.total / currentSentence.length) * 100 
    : 0;
  
  const accuracyPercent = charStats.total > 0 
    ? ((charStats.correct / charStats.total) * 100).toFixed(0) 
    : 100;

  
    // --- MULTIPLAYER AUTO-START & SCORE SYNC ---
    useEffect(() => {
        if (window.brainbootsIsMultiplayer && window.brainbootsScoreUpdate) {
            window.brainbootsScoreUpdate(wpm);
        }
    }, [wpm]);
    useEffect(() => {
        if (window.brainbootsIsMultiplayer) {
            const handleStart = () => {
                restartGame();
            };
            window.addEventListener("brainboots:start-game", handleStart);
            return () => {
                window.removeEventListener("brainboots:start-game", handleStart);
            };
        }
    }, []);
    // -----------------------------------------

return (
    <div className="bg-slate-50 p-4 md:p-6 font-sans flex items-center justify-center w-full">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-800 px-6 py-5">
            <h1 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight">
              ⌨️ TYPING MASTERY
            </h1>
          </div>
          
          {/* Difficulty Selector */}
          <div className="flex flex-wrap gap-3 justify-center p-5 bg-slate-50 border-b border-slate-200">
            {Object.entries(levels).map(([key, data]) => (
              <button
                key={key}
                onClick={() => changeDifficulty(key)}
                disabled={isRunning}
                className={`
                  px-5 py-2 rounded-xl font-bold transition-all duration-200 shadow-sm text-sm
                  ${difficulty === key 
                    ? 'bg-emerald-600 text-white scale-105' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }
                  ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {data.name}
              </button>
            ))}
          </div>
          
          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-slate-50">
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
              <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Time Left</div>
              <div className={`text-2xl font-black ${timeLeft <= 5 && isRunning ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                {timeLeft}s
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
              <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">WPM</div>
              <div className="text-2xl font-black text-slate-800">{isFinished ? wpm : '-'}</div>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
              <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Accuracy</div>
              <div className="text-2xl font-black text-slate-800">
                {isFinished ? `${accuracy}%` : (charStats.total > 0 ? `${accuracyPercent}%` : '-')}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
              <div className="text-slate-500 text-xs uppercase tracking-wider font-bold">Progress</div>
              <div className="text-2xl font-black text-slate-800">
                {charStats.correct}/{currentSentence.length}
              </div>
            </div>
          </div>
          
          {/* Sentence Display Card */}
          <div className="p-5">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-inner">
              <p className="text-slate-500 text-xs mb-2 font-mono font-bold">📝 SENTENCE TO TYPE:</p>
              <p className="text-slate-800 text-lg md:text-xl leading-relaxed font-mono tracking-wide">
                {currentSentence.split('').map((char, idx) => {
                  let charColor = "text-slate-400";
                  if (idx < input.length) {
                    charColor = input[idx] === char ? "text-emerald-600 font-bold" : "text-rose-600 font-bold bg-rose-50";
                  } else if (idx === input.length && isRunning) {
                    charColor = "text-emerald-700 bg-emerald-100 font-bold border-b-2 border-emerald-600";
                  }
                  return (
                    <span key={idx} className={charColor}>
                      {char}
                    </span>
                  );
                })}
              </p>
              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Text Input Area */}
          <div className="px-5 pb-5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleChange}
              disabled={isFinished || (!isRunning && gameStarted && timeLeft === 0)}
              placeholder={isFinished ? "Game finished! Click restart to play again." : "Start typing here..."}
              className={`
                w-full h-36 p-4 rounded-2xl bg-white text-slate-800 text-lg font-mono
                border focus:outline-none focus:ring-2 transition-all resize-none shadow-sm
                ${isFinished 
                  ? 'border-slate-300 bg-slate-100 opacity-70 cursor-not-allowed' 
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-100'
                }
              `}
            />
            
            {/* Live feedback while typing */}
            {isRunning && !isFinished && (
              <div className="mt-3 flex justify-between text-xs text-slate-500 font-bold">
                <span className="text-emerald-600">✓ {charStats.correct} correct chars</span>
                <span>{Math.floor((charStats.correct / currentSentence.length) * 100)}% complete</span>
              </div>
            )}
          </div>
          
          {/* Results Display */}
          {isFinished && (
            <div className="mx-5 mb-5 p-5 bg-emerald-50 rounded-2xl border border-emerald-200">
              <h3 className="text-xl font-bold text-slate-800 text-center mb-3">🎯 GAME COMPLETE</h3>
              <div className="flex flex-wrap justify-center gap-8 text-center">
                <div>
                  <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">YOUR WPM</div>
                  <div className="text-4xl font-black text-slate-800">{wpm}</div>
                </div>
                <div>
                  <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">ACCURACY</div>
                  <div className="text-4xl font-black text-slate-800">{accuracy}%</div>
                </div>
                <div>
                  <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">DIFFICULTY</div>
                  <div className="text-2xl font-black text-slate-800 capitalize mt-1">{difficulty}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="px-5 pb-6 flex gap-4 justify-center">
            <button
              onClick={restartGame}
              className="px-8 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all shadow-sm text-sm"
            >
              🔄 Restart Game
            </button>
            {!isFinished && timeLeft > 0 && !gameStarted && (
              <button
                onClick={() => {
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm text-sm animate-pulse"
              >
                🚀 Start Typing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypingGame;