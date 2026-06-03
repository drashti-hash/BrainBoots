import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import GamePage from "./pages/GamePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Multiplayer from "./pages/Multiplayer";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/games/:gameId" element={<GamePage />} />
                <Route path="/multiplayer" element={<Multiplayer />} />
                <Route path="/multiplayer/:roomCode" element={<Multiplayer />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

