import { lazy } from "react";

const MemoryGame = lazy(() => import("../pages/MemoryGame"));
const ReactionGame = lazy(() => import("../pages/ReactionGame"));
const TypingGame = lazy(() => import("../pages/TypingGame"));
const AimTrainer = lazy(() => import("../pages/AimTrainer"));
const StroopGame = lazy(() => import("../pages/StroopGame"));
const SimonGame = lazy(() => import("../pages/SimonGame"));
const NumberSequenceGame = lazy(() => import("../pages/NumberSequenceGame"));
const OddColorGame = lazy(() => import("../pages/OddColorGame"));
const FocusGridGame = lazy(() => import("../pages/FocusGridGame"));
const SudokuGame = lazy(() => import("../pages/SudokuGame"));
const WordGuessGame = lazy(() => import("../pages/WordGuessGame"));
const LightsOutGame = lazy(() => import("../pages/LightsOutGame"));
const SlidingTileGame = lazy(() => import("../pages/SlidingTileGame"));
const NBackGame = lazy(() => import("../pages/NBackGame"));
const SpeedMathGame = lazy(() => import("../pages/SpeedMathGame"));
const SchulteGame = lazy(() => import("../pages/SchulteGame"));
const HanoiGame = lazy(() => import("../pages/HanoiGame"));
const MemoryRace = lazy(() => import("../pages/MemoryRace"));
const TrafficControl = lazy(() => import("../pages/TrafficControl"));
const WrongAnswersGame = lazy(() => import("../pages/WrongAnswersGame"));
const HotPotatoGame = lazy(() => import("../pages/HotPotatoGame"));

export const gameSections = [
    {
        title: "Memory & Retention",
        icon: "Brain",
        games: [
            { id: "memory", name: "Memory Match", component: MemoryGame, icon: "Memory", desc: "Match pairs of cards" },
            { id: "simon", name: "Simon Memory", component: SimonGame, icon: "Sequence", desc: "Repeat color sequence" },
            { id: "numbers", name: "Number Sequence", component: NumberSequenceGame, icon: "Numbers", desc: "Remember number sequence" },
            { id: "nback", name: "N-Back Memory", component: NBackGame, icon: "N-Back", desc: "Match N steps back" },
            { id: "memoryrace", name: "Memory Race", component: MemoryRace, icon: "Race", desc: "Memorize item sequence quickly" }
        ]
    },
    {
        title: "Reflex & Speed",
        icon: "Speed",
        games: [
            { id: "reaction", name: "Reaction Test", component: ReactionGame, icon: "Reflex", desc: "Click when color changes" },
            { id: "aim", name: "Aim Trainer", component: AimTrainer, icon: "Aim", desc: "Click the red target" },
            { id: "typing", name: "Typing Mastery", component: TypingGame, icon: "Typing", desc: "Type the sentence fast" },
            { id: "speedmath", name: "Speed Math", component: SpeedMathGame, icon: "Math", desc: "Solve math sprint fast" },
            { id: "trafficcontrol", name: "Traffic Control", component: TrafficControl, icon: "Traffic", desc: "Control traffic lights to prevent crashes" }
        ]
    },
    {
        title: "Perception & Focus",
        icon: "Focus",
        games: [
            { id: "stroop", name: "Stroop Test", component: StroopGame, icon: "Color", desc: "Choose the text color" },
            { id: "oddcolor", name: "Odd Color", component: OddColorGame, icon: "Odd", desc: "Find the different color" },
            { id: "focusgrid", name: "Focus Grid", component: FocusGridGame, icon: "Grid", desc: "Find target number fast" },
            { id: "schulte", name: "Schulte Table", component: SchulteGame, icon: "Scan", desc: "Scan numbers 1 to 25" }
        ]
    },
    {
        title: "Logic & Problem Solving",
        icon: "Logic",
        games: [
            { id: "sudoku", name: "Sudoku Mini", component: SudokuGame, icon: "Sudoku", desc: "Solve 4x4 Sudoku puzzle" },
            { id: "wordguess", name: "Word Deduction", component: WordGuessGame, icon: "Word", desc: "Guess the 5-letter word" },
            { id: "lightsout", name: "Lights Out Grid", component: LightsOutGame, icon: "Lights", desc: "Turn off all lights" },
            { id: "slidingtile", name: "Sliding Tile", component: SlidingTileGame, icon: "Tiles", desc: "Slide tiles to order 1-8" },
            { id: "hanoi", name: "Tower of Hanoi", component: HanoiGame, icon: "Hanoi", desc: "Solve 3-peg disk tower" }
        ]
    },
    {
        title: "Funny & Playful",
        icon: "Play",
        games: [
            { id: "wronganswers", name: "Wrong Answers Only", component: WrongAnswersGame, icon: "Funny", desc: "Absurd answers and anonymous player voting" },
            { id: "hotpotato", name: "Hot Potato Chat", component: HotPotatoGame, icon: "Potato", desc: "Type sentences fast to pass the ticking potato" }
        ]
    }
];

export const games = gameSections.flatMap(section =>
    section.games.map(game => ({
        ...game,
        section: section.title
    }))
);
