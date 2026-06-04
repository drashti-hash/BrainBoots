import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { registerUser } from "../services/authService";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await registerUser(formData);
            alert(result.message);
            if (result.success) {
                navigate("/login");
            }
        } catch {
            alert("Registration failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f7fb] text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            
            {/* Embedded styles for background animations */}
            <style>{`
                @keyframes float-blob-1 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(40px, -60px) scale(1.1); }
                    66% { transform: translate(-20px, 30px) scale(0.9); }
                }
                @keyframes float-blob-2 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(-50px, 40px) scale(1.05); }
                }
                @keyframes float-blob-3 {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    50% { transform: translate(30px, 50px) scale(0.95); }
                }
                @keyframes float-pattern-1 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-12px) rotate(4deg); }
                }
                @keyframes float-pattern-2 {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(12px) rotate(-4deg); }
                }
                .bg-blob-1 {
                    animation: float-blob-1 18s ease-in-out infinite;
                }
                .bg-blob-2 {
                    animation: float-blob-2 22s ease-in-out infinite;
                }
                .bg-blob-3 {
                    animation: float-blob-3 15s ease-in-out infinite;
                }
                .bg-pattern-1 {
                    animation: float-pattern-1 14s ease-in-out infinite;
                    transform-origin: top right;
                }
                .bg-pattern-2 {
                    animation: float-pattern-2 16s ease-in-out infinite;
                    transform-origin: bottom left;
                }
            `}</style>

            {/* Glowing floating orbs in background */}
            <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-violet-400/15 blur-[90px] pointer-events-none bg-blob-1" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full bg-indigo-400/15 blur-[110px] pointer-events-none bg-blob-2" />
            <div className="absolute top-[40%] left-[30%] w-[350px] h-[350px] rounded-full bg-fuchsia-300/10 blur-[80px] pointer-events-none bg-blob-3" />

            {/* Background Geometric Abstract Pattern - Top Right */}
            <div className="absolute top-0 right-0 w-80 h-80 opacity-20 pointer-events-none bg-pattern-1">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polygon points="50,0 100,0 100,50" fill="#8b5cf6" />
                    <polygon points="70,-10 110,-10 110,30" fill="#6366f1" />
                    <rect x="75" y="10" width="30" height="30" rx="6" transform="rotate(45)" fill="#a78bfa" />
                </svg>
            </div>

            {/* Background Geometric Abstract Pattern - Bottom Left */}
            <div className="absolute bottom-0 left-0 w-80 h-80 opacity-20 pointer-events-none bg-pattern-2">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polygon points="0,50 0,100 50,100" fill="#8b5cf6" />
                    <polygon points="-10,70 -10,110 30,110" fill="#6366f1" />
                    <rect x="-10" y="75" width="30" height="30" rx="6" transform="rotate(15)" fill="#a78bfa" />
                </svg>
            </div>

            {/* Centered Register Card */}
            <div className="w-full max-w-[420px] rounded-[28px] border border-slate-200/80 bg-white p-7 sm:p-9 shadow-[0_20px_50px_rgba(139,92,246,0.12)] relative z-10 flex flex-col">
                
                {/* Neural network brain logo matching mockup */}
                <div className="flex flex-row items-center justify-center gap-3.5 mb-8">
                    <svg className="w-14 h-14 overflow-visible" viewBox="0 0 100 100" fill="none">
                        <style>{`
                            @keyframes pulse-slow {
                                0%, 100% { transform: scale(1); }
                                50% { transform: scale(1.04); }
                            }
                            @keyframes float-left {
                                0%, 100% { transform: translateY(0px); }
                                50% { transform: translateY(-1.5px); }
                            }
                            @keyframes float-right {
                                0%, 100% { transform: translateY(0px); }
                                50% { transform: translateY(1.5px); }
                            }
                            .animate-brain {
                                animation: pulse-slow 4s ease-in-out infinite;
                                transform-origin: center;
                            }
                            .left-hemisphere {
                                animation: float-left 3.5s ease-in-out infinite;
                                transform-origin: 50% 50%;
                            }
                            .right-hemisphere {
                                animation: float-right 3.5s ease-in-out infinite;
                                transform-origin: 50% 50%;
                            }
                        `}</style>
                        <g className="animate-brain">
                            <defs>
                                <linearGradient id="logo-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#4f46e5" />
                                </linearGradient>
                                <linearGradient id="logo-grad-right" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#a78bfa" />
                                    <stop offset="100%" stopColor="#7c3aed" />
                                </linearGradient>
                            </defs>

                            {/* Stem / Spine connection line */}
                            <line x1="50" y1="74" x2="50" y2="88" stroke="url(#logo-grad-left)" strokeWidth="10" strokeLinecap="round" />

                            {/* Left Hemisphere Group */}
                            <g className="left-hemisphere">
                                <g stroke="url(#logo-grad-left)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="28" y1="34" x2="18" y2="50" />
                                    <line x1="18" y1="50" x2="30" y2="66" />
                                    <line x1="30" y1="66" x2="38" y2="58" />
                                    <line x1="38" y1="58" x2="40" y2="46" />
                                    <line x1="40" y1="46" x2="28" y2="34" />
                                    <line x1="28" y1="34" x2="50" y2="30" />
                                    <line x1="38" y1="58" x2="50" y2="74" />
                                </g>
                                <circle cx="28" cy="34" r="9.5" fill="#8b5cf6" />
                                <circle cx="18" cy="50" r="11" fill="#6366f1" />
                                <circle cx="30" cy="66" r="9.5" fill="#4f46e5" />
                                <circle cx="40" cy="46" r="8.5" fill="#a78bfa" />
                                <circle cx="38" cy="58" r="7.5" fill="#6366f1" />
                            </g>

                            {/* Right Hemisphere Group */}
                            <g className="right-hemisphere">
                                <g stroke="url(#logo-grad-right)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="72" y1="34" x2="82" y2="50" />
                                    <line x1="82" y1="50" x2="70" y2="66" />
                                    <line x1="70" y1="66" x2="62" y2="58" />
                                    <line x1="62" y1="58" x2="60" y2="46" />
                                    <line x1="60" y1="46" x2="72" y2="34" />
                                    <line x1="72" y1="34" x2="50" y2="30" />
                                    <line x1="62" y1="58" x2="50" y2="74" />
                                </g>
                                <circle cx="72" cy="34" r="9.5" fill="#a78bfa" />
                                <circle cx="82" cy="50" r="11" fill="#8b5cf6" />
                                <circle cx="70" cy="66" r="9.5" fill="#7c3aed" />
                                <circle cx="60" cy="46" r="8.5" fill="#c084fc" />
                                <circle cx="62" cy="58" r="7.5" fill="#8b5cf6" />
                            </g>

                            {/* Center and Stem nodes */}
                            <circle cx="50" cy="30" r="8" fill="#c084fc" />
                            <circle cx="50" cy="74" r="9" fill="#4f46e5" />
                            <circle cx="50" cy="88" r="7" fill="#312e81" />
                        </g>
                    </svg>
                    <span className="text-4xl font-black tracking-tight text-slate-800">
                        Brain<span className="text-violet-600">Boot</span>
                    </span>
                </div>

                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        Create Account
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4 text-left">
                        <label className="block">
                            <span className="text-xs font-bold text-slate-700">
                                Username
                            </span>
                            <input
                                type="text"
                                name="username"
                                placeholder="Choose a username"
                                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:bg-white"
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-bold text-slate-700">
                                Email Address
                            </span>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@email.com"
                                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:bg-white"
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-bold text-slate-700">
                                Password
                            </span>
                            <div className="relative mt-1.5">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 pr-12 text-xs text-slate-800 outline-none transition focus:border-violet-500 focus:bg-white"
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 transition hover:text-slate-700 focus:outline-none cursor-pointer"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.6 10.6A2 2 0 0012 14a2 2 0 001.4-.6M9.9 4.3A10.6 10.6 0 0112 4c5 0 9 4.5 10 8a13.6 13.6 0 01-2.1 3.8M6.2 6.2A13.6 13.6 0 002 12c1 3.5 5 8 10 8 1.5 0 2.9-.4 4.1-1" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 py-3 text-xs font-bold text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)] transition cursor-pointer"
                    >
                        Register
                    </button>

                    <p className="mt-4 text-center text-xs font-semibold text-slate-500">
                        Already have an account?
                        <Link
                            to="/login"
                            className="ml-1.5 font-bold text-violet-600 hover:text-violet-700"
                        >
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;
