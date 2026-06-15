import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const GamePage = lazy(() => import("./pages/GamePage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Multiplayer = lazy(() => import("./pages/Multiplayer"));
const Games = lazy(() => import("./pages/Games"));
const Chat = lazy(() => import("./components/chatbot/Chat"));

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" reverseOrder={false} />
            <Suspense fallback={
                <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                        <span className="text-sm font-semibold text-slate-600 animate-pulse">Loading BrainBoot...</span>
                    </div>
                </div>
            }>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/games/:gameId" element={<GamePage />} />
                    <Route path="/multiplayer" element={<Multiplayer />} />
                    <Route path="/multiplayer/:roomCode" element={<Multiplayer />} />
                    <Route path="/chat" element={<Chat />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;
