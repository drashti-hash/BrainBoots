import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

const scoreEndpointNames = {
    "add-memory-score/": "Memory Match",
    "add-reaction-score/": "Reaction Test",
    "add-typing-score/": "Typing Mastery",
    "add-aim-score/": "Aim Trainer",
    "add-stroop-score/": "Stroop Test",
    "add-simon-score/": "Simon Memory",
    "add-number-sequence-score/": "Number Sequence",
    "add-odd-color-score/": "Odd Color",
    "add-focus-grid-score/": "Focus Grid",
    "add-sudoku-score/": "Sudoku Mini",
    "add-word-guess-score/": "Word Deduction",
    "add-lights-out-score/": "Lights Out Grid",
    "add-sliding-tile-score/": "Sliding Tile",
    "add-nback-score/": "N-Back Memory",
    "add-speed-math-score/": "Speed Math",
    "add-schulte-score/": "Schulte Table",
    "add-hanoi-score/": "Tower of Hanoi",
};

const parseRequestData = (data) => {
    if (!data) {
        return {};
    }

    if (typeof data === "string") {
        try {
            return JSON.parse(data);
        } catch {
            return {};
        }
    }

    return data;
};

const getScoreValue = (data) => {
    const value = data.score ?? data.wpm ?? data.correct_answers ?? 0;
    const numericValue = Number(value);

    return Number.isFinite(numericValue) ? numericValue : 0;
};

const getTimeValue = (data) => {
    const value = data.total_time ?? data.reaction_time ?? data.completed_time;

    if (value === undefined || value === null || value === "") {
        return "N/A";
    }

    return `${value}s`;
};

const getAccuracyValue = (data) => {
    const value = data.accuracy;

    if (value === undefined || value === null || value === "") {
        return "N/A";
    }

    return `${value}%`;
};

api.interceptors.response.use((response) => {
    const url = response.config.url || "";
    const endpoint = Object.keys(scoreEndpointNames).find(item => url.endsWith(item));

    if (endpoint) {
        const requestData = parseRequestData(response.config.data);
        const score = getScoreValue(requestData);
        const storageKey = `brainbootsResult:${endpoint}`;
        const previousResult = parseRequestData(localStorage.getItem(storageKey));
        const previousScore = Number(previousResult.lastScore || 0);
        const previousBest = Number(previousResult.bestScore || 0);
        const bestScore = Math.max(previousBest, score);
        const performance = previousScore === 0
            ? "First recorded attempt"
            : score > previousScore
                ? "Better than last attempt"
                : score === previousScore
                    ? "Matched last attempt"
                    : "Below last attempt";

        localStorage.setItem(
            storageKey,
            JSON.stringify({
                lastScore: score,
                bestScore,
            })
        );

        window.dispatchEvent(new CustomEvent("brainboots:game-result", {
            detail: {
                gameName: scoreEndpointNames[endpoint],
                score,
                bestScore,
                accuracy: getAccuracyValue(requestData),
                time: getTimeValue(requestData),
                performance,
            },
        }));
    }

    return response;
});

export default api;

export const registerUserApi = async (data) => {
    return api.post("register/", data);
};

export const loginUserApi = async (data) => {
    return api.post("login/", data);
};

export const getDashboardData = async () => {
    return api.get("dashboard-data/");
};

export const addMemoryScore = async (data) => {
    return api.post("add-memory-score/", data);
};

export const addReactionScore = async (data) => {
    return api.post("add-reaction-score/", data);
};

export const addTypingScore = async (data) => {
    return api.post("add-typing-score/", data);
};

export const addAimScore = async (data) => {
    return api.post("add-aim-score/", data);
};

export const addStroopScore = async (data) => {
    return api.post("add-stroop-score/", data);
};

export const addSimonScore = async (data) => {
    return api.post("add-simon-score/", data);
};

export const addNumberSequenceScore = async (data) => {
    return api.post("add-number-sequence-score/", data);
};

export const addOddColorScore = async (data) => {
    return api.post("add-odd-color-score/", data);
};

export const addFocusGridScore = async (data) => {
    return api.post("add-focus-grid-score/", data);
};

export const addSudokuScore = async (data) => {
    return api.post("add-sudoku-score/", data);
};

export const addWordGuessScore = async (data) => {
    return api.post("add-word-guess-score/", data);
};

export const addLightsOutScore = async (data) => {
    return api.post("add-lights-out-score/", data);
};

export const addSlidingTileScore = async (data) => {
    return api.post("add-sliding-tile-score/", data);
};

export const addNBackScore = async (data) => {
    return api.post("add-nback-score/", data);
};

export const addSpeedMathScore = async (data) => {
    return api.post("add-speed-math-score/", data);
};

export const addSchulteScore = async (data) => {
    return api.post("add-schulte-score/", data);
};

export const addHanoiScore = async (data) => {
    return api.post("add-hanoi-score/", data);
};
