import { useState, useEffect, useRef } from "react";
import { addTrafficControlScore } from "../services/api";

function TrafficControl() {
    const [gameState, setGameState] = useState("start"); // "start", "playing", "finished"
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [carsCrossed, setCarsCrossed] = useState(0);
    const [timer, setTimer] = useState(30);

    // Traffic light states: true = GREEN, false = RED
    const [lights, setLights] = useState({
        north: false,
        south: false,
        east: true,
        west: true
    });
    
    const [cars, setCars] = useState([]);
    const [explosions, setExplosions] = useState([]);

    const gameLoopRef = useRef(null);
    const spawnTimerRef = useRef(null);
    const countdownTimerRef = useRef(null);
    
    const carsRef = useRef([]);
    const lightsRef = useRef(lights);
    const scoreRef = useRef(0);
    const livesRef = useRef(3);
    const crossedRef = useRef(0);

    // Sync refs to avoid stale closures in game loop
    useEffect(() => {
        carsRef.current = cars;
    }, [cars]);

    useEffect(() => {
        lightsRef.current = lights;
    }, [lights]);

    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    useEffect(() => {
        livesRef.current = lives;
    }, [lives]);

    useEffect(() => {
        crossedRef.current = carsCrossed;
    }, [carsCrossed]);

    useEffect(() => {
        return () => {
            stopGame();
        };
    }, []);

    const toggleLight = (direction) => {
        if (gameState !== "playing") return;
        setLights(prev => ({
            ...prev,
            [direction]: !prev[direction]
        }));
    };

    const startGame = () => {
        setScore(0);
        setLives(3);
        setCarsCrossed(0);
        setTimer(30);
        setCars([]);
        setExplosions([]);
        setLights({
            north: false,
            south: false,
            east: true,
            west: true
        });
        setGameState("playing");

        scoreRef.current = 0;
        livesRef.current = 3;
        crossedRef.current = 0;
        carsRef.current = [];

        // Game Loop - 60fps approx
        let lastTime = performance.now();
        const loop = (time) => {
            const dt = (time - lastTime) / 1000;
            lastTime = time;
            updatePhysics(dt);
            gameLoopRef.current = requestAnimationFrame(loop);
        };
        gameLoopRef.current = requestAnimationFrame(loop);

        // Countdown Timer
        countdownTimerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(countdownTimerRef.current);
                    finishGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Dynamically Spawn Cars
        spawnCarLoop(2000);
    };

    const spawnCarLoop = (delay) => {
        spawnTimerRef.current = setTimeout(() => {
            if (gameState === "playing" || livesRef.current > 0) {
                spawnCar();
                
                // Make spawning faster as time runs out
                const nextDelay = Math.max(800, delay - 100);
                spawnCarLoop(nextDelay);
            }
        }, delay);
    };

    const spawnCar = () => {
        const directions = ["north", "south", "east", "west"];
        const spawnDir = directions[Math.floor(Math.random() * directions.length)];
        
        let newCar = {
            id: Math.random(),
            direction: spawnDir,
            crossed: false,
            state: "approaching", // "approaching", "stopped", "crossing", "crossed"
            color: getRandomCarColor()
        };

        if (spawnDir === "north") {
            newCar.x = 47;
            newCar.y = -10;
            newCar.dx = 0;
            newCar.dy = 30; // speed in % per second
        } else if (spawnDir === "south") {
            newCar.x = 53;
            newCar.y = 110;
            newCar.dx = 0;
            newCar.dy = -30;
        } else if (spawnDir === "west") {
            newCar.x = -10;
            newCar.y = 53;
            newCar.dx = 30;
            newCar.dy = 0;
        } else if (spawnDir === "east") {
            newCar.x = 110;
            newCar.y = 47;
            newCar.dx = -30;
            newCar.dy = 0;
        }

        setCars(prev => [...prev, newCar]);
    };

    const getRandomCarColor = () => {
        const colors = [
            "bg-blue-500", "bg-red-500", "bg-yellow-500", 
            "bg-orange-500", "bg-indigo-500", "bg-pink-500", 
            "bg-cyan-500", "bg-purple-500"
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const updatePhysics = (dt) => {
        let currentCars = [...carsRef.current];
        let currentLights = lightsRef.current;
        let crashedIndices = new Set();
        let updatedCars = [];

        // 1. Move cars & Check Stop Lines
        for (let i = 0; i < currentCars.length; i++) {
            let car = { ...currentCars[i] };

            if (car.state === "approaching") {
                // Check stop line if light is RED
                const lightIsGreen = currentLights[car.direction];
                
                if (!lightIsGreen) {
                    if (car.direction === "north" && car.y >= 32) {
                        car.y = 32;
                        car.state = "stopped";
                    } else if (car.direction === "south" && car.y <= 68) {
                        car.y = 68;
                        car.state = "stopped";
                    } else if (car.direction === "west" && car.x >= 32) {
                        car.x = 32;
                        car.state = "stopped";
                    } else if (car.direction === "east" && car.x <= 68) {
                        car.x = 68;
                        car.state = "stopped";
                    }
                }
            } else if (car.state === "stopped") {
                // If light is GREEN, resume moving
                const lightIsGreen = currentLights[car.direction];
                if (lightIsGreen) {
                    car.state = "crossing";
                }
            }

            // Move if not stopped
            if (car.state !== "stopped") {
                car.x += car.dx * dt;
                car.y += car.dy * dt;
            }

            // Update state to crossing
            if (car.state === "approaching") {
                if (car.direction === "north" && car.y > 32) car.state = "crossing";
                if (car.direction === "south" && car.y < 68) car.state = "crossing";
                if (car.direction === "west" && car.x > 32) car.state = "crossing";
                if (car.direction === "east" && car.x < 68) car.state = "crossing";
            }

            // Check if successfully crossed intersection
            if (!car.crossed) {
                if (
                    (car.direction === "north" && car.y > 68) ||
                    (car.direction === "south" && car.y < 32) ||
                    (car.direction === "west" && car.x > 68) ||
                    (car.direction === "east" && car.x < 32)
                ) {
                    car.crossed = true;
                    car.state = "crossed";
                    handleSafeCrossing();
                }
            }

            // Keep if on-screen
            if (car.x >= -15 && car.x <= 115 && car.y >= -15 && car.y <= 115) {
                updatedCars.push(car);
            }
        }

        // 2. Collision Detection
        for (let i = 0; i < updatedCars.length; i++) {
            for (let j = i + 1; j < updatedCars.length; j++) {
                const c1 = updatedCars[i];
                const c2 = updatedCars[j];

                // Only check for crashes in/near the intersection box
                const inIntersection = (c) => c.x > 30 && c.x < 70 && c.y > 30 && c.y < 70;
                
                if (inIntersection(c1) && inIntersection(c2)) {
                    const dist = Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
                    if (dist < 7) {
                        crashedIndices.add(i);
                        crashedIndices.add(j);
                        triggerCrash(c1.x + (c2.x - c1.x)/2, c1.y + (c2.y - c1.y)/2);
                    }
                }
            }
        }

        // Remove crashed cars
        if (crashedIndices.size > 0) {
            updatedCars = updatedCars.filter((_, idx) => !crashedIndices.has(idx));
        }

        setCars(updatedCars);
    };

    const handleSafeCrossing = () => {
        setCarsCrossed(prev => {
            const newVal = prev + 1;
            const newScore = newVal * 10;
            setScore(newScore);

            // Sync live score for multiplayer
            if (window.brainbootsIsMultiplayer && window.brainbootsScoreUpdate) {
                window.brainbootsScoreUpdate(newScore);
            }

            return newVal;
        });
    };

    const triggerCrash = (x, y) => {
        // Explode
        const explosionId = Math.random();
        setExplosions(prev => [...prev, { id: explosionId, x, y }]);
        
        // Remove explosion after 600ms
        setTimeout(() => {
            setExplosions(prev => prev.filter(e => e.id !== explosionId));
        }, 600);

        setLives(prev => {
            const nextLives = prev - 1;
            if (nextLives <= 0) {
                setTimeout(() => finishGame(), 50);
            }
            return nextLives;
        });
    };

    const stopGame = () => {
        cancelAnimationFrame(gameLoopRef.current);
        clearTimeout(spawnTimerRef.current);
        clearInterval(countdownTimerRef.current);
    };

    const finishGame = async () => {
        stopGame();
        setGameState("finished");
        
        try {
            await addTrafficControlScore({
                score: scoreRef.current,
                crashes_avoided: crossedRef.current
            });
        } catch (error) {
            console.error("Failed to save Traffic Control score:", error);
        }
    };

    // --- MULTIPLAYER AUTO-START & SCORE SYNC ---
    useEffect(() => {
        if (window.brainbootsIsMultiplayer) {
            const handleStart = () => {
                startGame();
            };
            window.addEventListener("brainboots:start-game", handleStart);
            return () => {
                window.removeEventListener("brainboots:start-game", handleStart);
            };
        }
    }, []);
    // -----------------------------------------

    return (
        <div className="flex flex-col items-center mt-4 font-sans max-w-xl mx-auto text-center w-full px-4 select-none">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Traffic Control</h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Reflex & Speed</p>

            {gameState === "start" && (
                <div className="mt-8 p-8 border border-slate-200 bg-white rounded-3xl shadow-sm w-full">
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        Avoid crashes at the intersection! Cars spawn from all directions. 
                        <strong> Click on the traffic lights</strong> to toggle them between Red and Green. 
                        Keep traffic flowing and survive for 30 seconds!
                    </p>
                    <div className="w-48 h-48 mx-auto relative bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center mb-6">
                        {/* Static visual roads */}
                        <div className="absolute inset-y-0 w-12 bg-slate-700" />
                        <div className="absolute inset-x-0 h-12 bg-slate-700" />
                        <div className="absolute w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    </div>
                    <button
                        onClick={startGame}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition text-white font-bold rounded-2xl shadow-md text-sm cursor-pointer"
                    >
                        Start Game
                    </button>
                </div>
            )}

            {gameState === "playing" && (
                <div className="mt-6 p-4 border border-slate-200 bg-white rounded-3xl shadow-sm w-full">
                    {/* HUD metrics */}
                    <div className="flex justify-between items-center mb-4 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-1">
                            <span className="uppercase">Lives:</span>
                            <div className="flex gap-1 text-rose-500 text-sm">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <span key={i}>{i < lives ? "❤️" : "🖤"}</span>
                                ))}
                            </div>
                        </div>
                        <div className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-bold font-mono">
                            Time Left: {timer}s
                        </div>
                        <div className="text-emerald-600 text-sm font-mono font-black">
                            Score: {score}
                        </div>
                    </div>

                    {/* Intersection Grid Area */}
                    <div className="w-full aspect-square max-w-[400px] mx-auto bg-emerald-100 border-4 border-slate-800 rounded-3xl relative overflow-hidden shadow-inner">
                        
                        {/* Road Lines & Asphalt */}
                        {/* Vertical Road */}
                        <div className="absolute top-0 bottom-0 left-[38%] right-[38%] bg-slate-700 flex flex-col justify-between py-2 items-center">
                            <div className="w-0.5 h-[30%] border-l border-dashed border-white opacity-40" />
                            <div className="w-0.5 h-[30%] border-l border-dashed border-white opacity-40" />
                        </div>

                        {/* Horizontal Road */}
                        <div className="absolute left-0 right-0 top-[38%] bottom-[38%] bg-slate-700 flex justify-between px-2 items-center">
                            <div className="h-0.5 w-[30%] border-t border-dashed border-white opacity-40" />
                            <div className="h-0.5 w-[30%] border-t border-dashed border-white opacity-40" />
                        </div>

                        {/* Intersection Center Box */}
                        <div className="absolute top-[38%] bottom-[38%] left-[38%] right-[38%] bg-slate-600 border border-slate-500" />

                        {/* White Stop Lines */}
                        <div className="absolute top-[38%] left-[38%] right-[38%] h-0.5 bg-white opacity-90" /> {/* North stop */}
                        <div className="absolute bottom-[38%] left-[38%] right-[38%] h-0.5 bg-white opacity-90" /> {/* South stop */}
                        <div className="absolute left-[38%] top-[38%] bottom-[38%] w-0.5 bg-white opacity-90" /> {/* West stop */}
                        <div className="absolute right-[38%] top-[38%] bottom-[38%] w-0.5 bg-white opacity-90" /> {/* East stop */}

                        {/* Traffic Lights Controls (Interactive Buttons) */}
                        {/* North Light (Controls North moving South) */}
                        <button 
                            onClick={() => toggleLight("north")}
                            className={`absolute top-[22%] left-[55%] w-8 h-8 rounded-full border border-slate-700 shadow-md flex items-center justify-center cursor-pointer transition ${lights.north ? "bg-green-500" : "bg-red-500"}`}
                        >
                            <span className="w-2.5 h-2.5 rounded-full bg-white opacity-40 animate-ping" />
                        </button>

                        {/* South Light (Controls South moving North) */}
                        <button 
                            onClick={() => toggleLight("south")}
                            className={`absolute bottom-[22%] left-[37%] w-8 h-8 rounded-full border border-slate-700 shadow-md flex items-center justify-center cursor-pointer transition ${lights.south ? "bg-green-500" : "bg-red-500"}`}
                        >
                            <span className="w-2.5 h-2.5 rounded-full bg-white opacity-40 animate-ping" />
                        </button>

                        {/* West Light (Controls West moving East) */}
                        <button 
                            onClick={() => toggleLight("west")}
                            className={`absolute top-[37%] left-[22%] w-8 h-8 rounded-full border border-slate-700 shadow-md flex items-center justify-center cursor-pointer transition ${lights.west ? "bg-green-500" : "bg-red-500"}`}
                        >
                            <span className="w-2.5 h-2.5 rounded-full bg-white opacity-40 animate-ping" />
                        </button>

                        {/* East Light (Controls East moving West) */}
                        <button 
                            onClick={() => toggleLight("east")}
                            className={`absolute bottom-[37%] right-[22%] w-8 h-8 rounded-full border border-slate-700 shadow-md flex items-center justify-center cursor-pointer transition ${lights.east ? "bg-green-500" : "bg-red-500"}`}
                        >
                            <span className="w-2.5 h-2.5 rounded-full bg-white opacity-40 animate-ping" />
                        </button>

                        {/* Rendering Cars */}
                        {cars.map((car) => {
                            let sizeClass = "w-6 h-6";
                            
                            // Align rotation of car based on direction
                            let rotClass = "rotate-0";
                            if (car.direction === "south") rotClass = "rotate-180";
                            if (car.direction === "west") rotClass = "rotate-90";
                            if (car.direction === "east") rotClass = "-rotate-90";

                            return (
                                <div
                                    key={car.id}
                                    className={`absolute ${car.color} ${sizeClass} ${rotClass} rounded-lg border-2 border-slate-800 transition-all duration-75 flex flex-col justify-between p-0.5 shadow-sm`}
                                    style={{
                                        left: `${car.x}%`,
                                        top: `${car.y}%`,
                                        transform: "translate(-50%, -50%)"
                                    }}
                                >
                                    {/* Car details (windshield & headlights) */}
                                    <div className="flex justify-between w-full">
                                        <div className="w-1 h-1 bg-yellow-200 rounded-full" />
                                        <div className="w-1 h-1 bg-yellow-200 rounded-full" />
                                    </div>
                                    <div className="w-full h-1 bg-slate-900/30 rounded-xs" />
                                </div>
                            );
                        })}

                        {/* Rendering Explosions */}
                        {explosions.map((exp) => (
                            <div
                                key={exp.id}
                                className="absolute bg-orange-500 w-16 h-16 rounded-full border-4 border-yellow-400 opacity-90 animate-explode"
                                style={{
                                    left: `${exp.x}%`,
                                    top: `${exp.y}%`,
                                    transform: "translate(-50%, -50%)"
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {gameState === "finished" && (
                <div className="mt-8 p-8 border border-slate-200 bg-white rounded-3xl shadow-sm w-full">
                    <div className="text-4xl mb-4">🏁</div>
                    <h2 className="text-2xl font-black text-slate-800">Traffic Simulation Ended</h2>
                    <p className="text-sm font-semibold text-slate-500 mt-1">Excellent reflexes! Check your statistics below:</p>

                    <div className="my-8 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Cars Safely Cross</p>
                            <p className="text-2xl font-black text-slate-800 mt-1">{carsCrossed}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Score</p>
                            <p className="text-2xl font-black text-emerald-600 mt-1">{score}</p>
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition text-white font-bold rounded-2xl shadow-md text-sm cursor-pointer"
                    >
                        Play Again
                    </button>
                </div>
            )}

            <style>{`
                @keyframes explode {
                    0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; filter: hue-rotate(0deg); }
                    50% { transform: translate(-50%, -50%) scale(1.4); opacity: 0.9; filter: hue-rotate(30deg); }
                    100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; filter: hue-rotate(60deg); }
                }
                .animate-explode {
                    animation: explode 0.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}

export default TrafficControl;
