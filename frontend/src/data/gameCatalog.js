import MemoryGame from "../pages/MemoryGame";
import ReactionGame from "../pages/ReactionGame";
import TypingGame from "../pages/TypingGame";
import AimTrainer from "../pages/AimTrainer";
import StroopGame from "../pages/StroopGame";
import SimonGame from "../pages/SimonGame";
import NumberSequenceGame from "../pages/NumberSequenceGame";
import OddColorGame from "../pages/OddColorGame";
import FocusGridGame from "../pages/FocusGridGame";
import SudokuGame from "../pages/SudokuGame";
import WordGuessGame from "../pages/WordGuessGame";
import LightsOutGame from "../pages/LightsOutGame";
import SlidingTileGame from "../pages/SlidingTileGame";
import NBackGame from "../pages/NBackGame";
import SpeedMathGame from "../pages/SpeedMathGame";
import SchulteGame from "../pages/SchulteGame";
import HanoiGame from "../pages/HanoiGame";

export const gameSections = [
    {
        title: "Memory & Retention",
        icon: "Brain",
        games: [
            { id: "memory", name: "Memory Match", component: MemoryGame, icon: "Memory", desc: "Match pairs of cards" },
            { id: "simon", name: "Simon Memory", component: SimonGame, icon: "Sequence", desc: "Repeat color sequence" },
            { id: "numbers", name: "Number Sequence", component: NumberSequenceGame, icon: "Numbers", desc: "Remember number sequence" },
            { id: "nback", name: "N-Back Memory", component: NBackGame, icon: "N-Back", desc: "Match N steps back" }
        ]
    },
    {
        title: "Reflex & Speed",
        icon: "Speed",
        games: [
            { id: "reaction", name: "Reaction Test", component: ReactionGame, icon: "Reflex", desc: "Click when color changes" },
            { id: "aim", name: "Aim Trainer", component: AimTrainer, icon: "Aim", desc: "Click the red target" },
            { id: "typing", name: "Typing Mastery", component: TypingGame, icon: "Typing", desc: "Type the sentence fast" },
            { id: "speedmath", name: "Speed Math", component: SpeedMathGame, icon: "Math", desc: "Solve math sprint fast" }
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
    }
];

export const games = gameSections.flatMap(section =>
    section.games.map(game => ({
        ...game,
        section: section.title
    }))
);
