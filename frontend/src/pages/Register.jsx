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
        <div className="min-h-screen bg-slate-50 text-slate-900 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
            <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                >
                    <div className="mb-8">
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-lg font-black text-sky-700 lg:hidden">
                            B
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-950">
                            Create account
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Start tracking your BrainBoots training progress.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700">
                                Username
                            </span>
                            <input
                                type="text"
                                name="username"
                                placeholder="Choose a username"
                                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700">
                                Email
                            </span>
                            <input
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700">
                                Password
                            </span>
                            <div className="relative mt-2">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create a password"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-800 focus:outline-none"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.6 10.6A2 2 0 0012 14a2 2 0 001.4-.6M9.9 4.3A10.6 10.6 0 0112 4c5 0 9 4.5 10 8a13.6 13.6 0 01-2.1 3.8M6.2 6.2A13.6 13.6 0 002 12c1 3.5 5 8 10 8 1.5 0 2.9-.4 4.1-1" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className="mt-7 w-full rounded-lg bg-sky-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100"
                    >
                        Register
                    </button>

                    <p className="mt-6 text-center text-sm text-slate-600">
                        Already have an account?
                        <Link
                            to="/login"
                            className="ml-2 font-bold text-sky-700 hover:text-sky-800"
                        >
                            Login
                        </Link>
                    </p>
                </form>
            </main>

            <section className="hidden lg:flex flex-col justify-between bg-slate-950 px-12 py-10 text-white">
                <div>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-400 text-xl font-black text-slate-950">
                        B
                    </div>
                    <h1 className="mt-8 text-4xl font-black tracking-tight">
                        BrainBoots
                    </h1>
                    <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
                        Build a sharper routine with memory, speed, focus, and logic games.
                    </p>
                </div>

                <div className="space-y-3 text-sm text-slate-300">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        Track scores across every training session.
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        Return anytime and continue from your dashboard.
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Register;
