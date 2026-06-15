


// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { gameSections } from "../data/gameCatalog";
// import { getDashboardData } from "../services/api";

// /* ─────────────── Sidebar SVGs ─────────────── */
// const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>;
// const IconTrain = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M12 4v16" /><rect x="5" y="4" width="3" height="3" rx="1" /><rect x="16" y="17" width="3" height="3" rx="1" /></svg>;
// const IconChallenge = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
// const IconRooms = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4" /><circle cx="17" cy="9" r="3" /><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /><path d="M19 21v-1.5a3 3 0 0 0-3-3" /></svg>;
// const IconProgress = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
// const IconLeaderboard = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="4" height="18" rx="1" /><rect x="10" y="9" width="4" height="12" rx="1" /><rect x="2" y="13" width="4" height="8" rx="1" /></svg>;
// const IconProfile = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
// const IconChat = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;

// /* ─────────────── Bottom Nav SVGs ─────────────── */
// const IconFriends = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
// const IconTrophy = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 4h10"></path><path d="M17 4v8a5 5 0 0 1-10 0V4"></path><path d="M7 4H3v3a4 4 0 0 0 4 4h0"></path><path d="M17 4h4v3a4 4 0 0 1-4 4h0"></path></svg>;
// const IconBrain = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7.58 2 4 5.58 4 10c0 1.8.63 3.45 1.68 4.75C5.07 15.65 4 17.2 4 19c0 .55.45 1 1 1h4c2.21 0 4-1.79 4-4v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 1.1-.9 2-2 2H6.83c.53-1.28 1.82-2.18 3.17-2.18.55 0 1-.45 1-1C11 10.9 8.1 8 12 8s1 .45 1 1c0 .55.45 1 1 1 .55 0 1-.45 1-1 0-3.31-2.69-6-6-6zM18.32 14.75C19.37 13.45 20 11.8 20 10c0-4.42-3.58-8-8-8-.55 0-1 .45-1 1s.45 1 1 1c3.31 0 6 2.69 6 6 0 .55.45 1 1 1s1-.45 1-1c0-1.8-1.46-3.26-3.26-3.26-.55 0-1 .45-1 1s.45 1 1 1c.7 0 1.26.56 1.26 1.26 0 1.07-.87 1.94-1.94 1.94-.55 0-1 .45-1 1v2c0 2.21 1.79 4 4 4h4c.55 0 1-.45 1-1 0-1.8-1.07-3.35-1.68-4.25z"/></svg>;
// const IconMedal = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;
// const IconGift = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>;

// /* ─────────────── utility helpers ─────────────── */
// const readStoredJson = (key, fallback) => {
//     try {
//         const value = localStorage.getItem(key);
//         return value ? JSON.parse(value) : fallback;
//     } catch {
//         return fallback;
//     }
// };

// const getInitials = (name) => {
//     const parts = String(name || "Player").trim().split(/\s+/).filter(Boolean);
//     if (!parts.length) return "PL";
//     if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
//     return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// };

// const getGreeting = () => {
//     const h = new Date().getHours();
//     if (h < 12) return "Good Morning";
//     if (h < 17) return "Good Afternoon";
//     return "Good Evening";
// };

// /* ─────────────── Image Overlay Coordinates ─────────────── */
// const ZONES = [
//     { id: "memory", name: "Memory Island", top: "50%", left: "20%" },
//     { id: "focus", name: "Focus Forest", top: "28%", left: "44%" },
//     { id: "logic", name: "Logic Lab", top: "28%", left: "78%" },
//     { id: "reflex", name: "Reflex Mountain", top: "66%", left: "54%" },
//     { id: "fun", name: "Fun Park", top: "66%", left: "84%" },
// ];

// function Dashboard() {
//     const user = readStoredJson("user", {});
//     const storedStats = readStoredJson("brainbootsStats", {});
//     const [dashboardData, setDashboardData] = useState({
//         stats: storedStats,
//         highScores: [],
//         tables: [],
//     });

//     const [isLoading, setIsLoading] = useState(true);
//     const [errorMessage, setErrorMessage] = useState("");

//     const username = user.username || user.email || "Guest Player";
//     const initials = getInitials(username);
//     const greeting = getGreeting();
//     const stats = dashboardData.stats || {};
//     const totalScore = stats.totalScore || 5005; 
//     const streak = stats.streak || 7; 

//     useEffect(() => {
//         const fetchDashboardData = async () => {
//             try {
//                 const response = await getDashboardData();
//                 if (response.data.success) {
//                     setDashboardData({
//                         stats: response.data.stats || {},
//                         highScores: response.data.highScores || [],
//                         tables: response.data.tables || [],
//                     });
//                     localStorage.setItem("brainbootsStats", JSON.stringify(response.data.stats || {}));
//                     setErrorMessage("");
//                 } else {
//                     setErrorMessage(response.data.message || "Unable to fetch dashboard data");
//                 }
//             } catch {
//                 setErrorMessage("Unable to fetch dashboard data");
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchDashboardData();
//     }, []);

//     const userLevel = Math.floor(totalScore / 1000) + 1;

//     // Hardcoded recommended games based on exact image design requirement
//     const recommendedGames = [
//         { title: "Memory Match", icon: "🧠", tag: "Memory", tagColor: "#8b5cf6", tagBg: "#f3e8ff", bgLight: "#f4efff", path: "/games/memory-match" },
//         { title: "Reaction Test", icon: "⚡", tag: "Reflex", tagColor: "#f59e0b", tagBg: "#fef3c7", bgLight: "#fff9e6", path: "/games/reaction-test" },
//         { title: "Focus Grid", icon: "🎯", tag: "Focus", tagColor: "#10b981", tagBg: "#dcfce7", bgLight: "#e6fcf0", path: "/games/focus-grid" }
//     ];

//     const sidebarItems = [
//         { label: "Home", icon: <IconHome />, active: true },
//         { label: "Train", icon: <IconTrain />, to: "/games" },
//         { label: "AI Assistant", icon: <IconChat />, to: "/chat" },
//         { label: "Challenges", icon: <IconChallenge />, to: "/dashboard" },
//         { label: "Rooms", icon: <IconRooms />, to: "/multiplayer" },
//         { label: "Progress", icon: <IconProgress />, to: "/dashboard" },
//         { label: "Leaderboard", icon: <IconLeaderboard />, to: "/dashboard" },
//         { label: "Profile", icon: <IconProfile />, to: "/dashboard" },
//     ];

//     const streakDays = ["M", "T", "W", "T", "F", "S", "S"];

//     return (
//         <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fe", fontFamily: "Inter, system-ui, sans-serif" }}>

//             {/* ════════════════ SIDEBAR ════════════════ */}
//             <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "240px", minWidth: "240px", background: "white", borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "24px 16px", zIndex: 45, overflowY: "auto" }}>

//                 <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "8px", marginBottom: "32px", textDecoration: "none" }}>
//                     <div style={{ width: 34, height: 34, borderRadius: "10px", background: "linear-gradient(135deg, #7c6aff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 900 }}>
//                         <IconBrain />
//                     </div>
//                     <div>
//                         <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>BrainBoot</p>
//                         <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1, marginTop: 4, fontWeight: 500 }}>Train Your Brain</p>
//                     </div>
//                 </Link>

//                 <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflowY: "auto" }} className="scrollbar-hide">
//                     {sidebarItems.map((item, i) => (
//                         <Link key={i} to={item.to || "#"} style={{
//                             display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: "12px",
//                             background: item.active ? "linear-gradient(135deg, #8b5cf6, #a78bfa)" : "transparent",
//                             color: item.active ? "white" : "#64748b", fontWeight: 600, fontSize: 14, textDecoration: "none", transition: "all 0.2s"
//                         }}>
//                             <span style={{ opacity: item.active ? 1 : 0.7 }}>{item.icon}</span>
//                             <span>{item.label}</span>
//                         </Link>
//                     ))}
//                 </nav>


//                 <div style={{ padding: "0 8px" }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
//                         <span style={{ fontSize: 24 }}>🔥</span>
//                         <span style={{ fontSize: 24, fontWeight: 800, color: "#10b981", lineHeight: 1 }}>{streak}</span>
//                         <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginTop: 4 }}>Day Streak</span>
//                     </div>
//                     <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
//                         {streakDays.map((d, i) => {
//                             const isCompleted = i < (streak % 7 || (streak > 0 ? 7 : 0));
//                             return (
//                                 <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
//                                     <div style={{
//                                         width: 22, height: 22, borderRadius: "50%",
//                                         background: isCompleted ? "#10b981" : "#f1f5f9",
//                                         display: "flex", alignItems: "center", justifyContent: "center"
//                                     }}>
//                                         {isCompleted ? <span style={{ color: "white", fontSize: 10, fontWeight: 900 }}>✓</span> : <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 600 }}>{d}</span>}
//                                     </div>
//                                     <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{d}</span>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>
//             </aside>

//             {/* ════════════════ MAIN CONTENT AREA ════════════════ */}
//             <div style={{ 
//                 marginLeft: "240px", 
//                 flex: 1, 
//                 display: "flex", 
//                 flexDirection: "column", 
//                 minHeight: "100vh", 
//                 position: "relative",
//                 backgroundColor: "#f8f9fe",
//                 overflowX: "hidden"
//             }}>
//                 {/* Background Sky Image Layer */}
//                 <div style={{
//                     position: "absolute",
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     height: "580px",
//                     backgroundImage: "url('/sky_bg.png')",
//                     backgroundSize: "cover",
//                     backgroundPosition: "center",
//                     backgroundRepeat: "no-repeat",
//                     zIndex: 0,
//                     pointerEvents: "none"
//                 }} />

//                 <header style={{ background: "transparent", borderBottom: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 40px", flexShrink: 0, zIndex: 10 }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: "24px", padding: "8px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
//                         <span style={{ fontSize: 18 }}>🪙</span>
//                         <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{totalScore.toLocaleString()}</span>
//                         <button style={{ background: "#f8f9fe", border: "none", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", marginLeft: 4, color: "#64748b" }}>+</button>
//                     </div>

//                     <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
//                         <button style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
//                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
//                         </button>
//                         <button style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
//                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
//                         </button>

//                         <div style={{ display: "flex", alignItems: "center", gap: 12, background: "transparent", cursor: "pointer" }}>
//                             <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#f472b6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
//                                 👾
//                             </div>
//                             <div>
//                                 <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{username}</p>
//                                 <p style={{ fontSize: 12, color: "#64748b", marginTop: 2, fontWeight: 500 }}>Level {userLevel}</p>
//                             </div>
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
//                         </div>
//                     </div>
//                 </header>
//                 <main style={{ flex: 1, overflowY: "visible", padding: "0 40px 40px", display: "flex", flexDirection: "column", gap: 32, position: "relative", zIndex: 2 }} className="scrollbar-hide">
//                     {/* HERO SECTION */}
//                     <section style={{ 
//                         position: "relative", 
//                         minHeight: "500px", 
//                         display: "flex", 
//                         flexDirection: "column", 
//                         justifyContent: "flex-end",
//                         padding: "0 0 36px"
//                     }}>
//                         <div style={{ maxWidth: "60%", zIndex: 2, position: "relative", marginTop: "40px" }}>
//                             <p style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Good Morning,</p>
//                             <h1 style={{ fontSize: 48, fontWeight: 900, color: "#1e1b4b", lineHeight: 1.1, marginBottom: 16 }}>{username}!</h1>
//                             <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.5, marginBottom: 24, fontWeight: 500 }}>Ready to boost your brain today?<br/>Let's continue your journey.</p>

//                             <button style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa)", color: "white", border: "none", borderRadius: "12px", padding: "14px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 14px rgba(139,92,246,0.3)" }}>
//                                 Continue Training <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
//                             </button>
//                         </div>

//                         {/* Stats Floating Row */}
//                         <div style={{ display: "flex", gap: 16, marginTop: 40, zIndex: 2, position: "relative" }}>
//                             <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 16, padding: "16px", width: 100, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
//                                 <div style={{ fontSize: 20, marginBottom: 8, color: "#8b5cf6", background: "#f5f3ff", width: 36, height: 36, borderRadius: "50%", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>🛡️</div>
//                                 <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Level</div>
//                                 <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{userLevel}</div>
//                             </div>
//                             <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 16, padding: "16px", width: 140, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
//                                 <div style={{ fontSize: 20, marginBottom: 8, color: "#3b82f6", background: "#eff6ff", width: 36, height: 36, borderRadius: "50%", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>⭐</div>
//                                 <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Brain Score</div>
//                                 <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{totalScore.toLocaleString()}</div>
//                             </div>
//                             <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 16, padding: "16px", width: 100, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
//                                 <div style={{ fontSize: 20, marginBottom: 8, color: "#10b981", background: "#ecfdf5", width: 36, height: 36, borderRadius: "50%", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>🔥</div>
//                                 <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Streak</div>
//                                 <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{streak} <span style={{ fontSize: 12 }}>Days</span></div>
//                             </div>
//                         </div>
//                         <img 
//                             src="/hero_mascot.png" 
//                             alt="Brain Mascot" 
//                             style={{ 
//                                 position: "absolute", 
//                                 bottom: "-2px", 
//                                 right: "-40px", 
//                                 height: "calc(100% + 2px)", 
//                                 maxHeight: "500px",
//                                 objectFit: "contain", 
//                                 objectPosition: "right bottom",
//                                 pointerEvents: "none",
//                                 zIndex: 1,
//                                 WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0) 2%, black 28%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0) 2%, black 12%)",
//                                 WebkitMaskComposite: "source-in",
//                                 maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0) 2%, black 28%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0) 2%, black 12%)",
//                                 maskComposite: "intersect"
//                             }} 
//                         />
//                     </section>

//                     {/* TWO COLUMN ROW */}
//                     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
//                         {/* Today's Challenge */}
//                         <div style={{ background: "white", borderRadius: 24, padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", position: "relative", overflow: "hidden" }}>
//                             <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
//                                 <span style={{ fontSize: 20, color: "#ef4444" }}>🔥</span>
//                                 <h3 style={{ fontSize: 18, fontWeight: 800, color: "#4f46e5" }}>Today's Challenge</h3>
//                             </div>
//                             <p style={{ fontSize: 14, color: "#475569", fontWeight: 600 }}>Complete 3 games</p>
//                             <p style={{ fontSize: 14, color: "#475569", fontWeight: 600, marginBottom: 24 }}>Score 500+ points</p>

//                             <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>1 / 3 Games Completed</p>
//                             <div style={{ background: "#f1f5f9", height: 8, borderRadius: 4, width: "100%", marginBottom: 32, overflow: "hidden" }}>
//                                 <div style={{ background: "#8b5cf6", height: "100%", width: "33%", borderRadius: 4 }}></div>
//                             </div>

//                             <button style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa)", color: "white", border: "none", borderRadius: "12px", padding: "14px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", width: "200px" }}>
//                                 Start Challenge <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
//                             </button>

//                             {/* Challenge Image/Chest */}
//                             <div style={{ position: "absolute", right: 24, top: 40, textAlign: "center" }}>
//                                 <div style={{ fontSize: 80, lineHeight: 1 }}>🧰</div>
//                                 <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
//                                     <span style={{ background: "#f8f9fe", color: "#8b5cf6", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 12 }}>+50 XP</span>
//                                     <span style={{ background: "#fffbeb", color: "#d97706", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 12 }}>+100 🪙</span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Quick Access */}
//                         <div style={{ background: "white", borderRadius: 24, padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
//                             <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>Quick Access</h3>

//                             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
//                                 {[
//                                     { label: "Daily Challenge", icon: "🎯", bg: "#ffe4e6", color: "#e11d48" },
//                                     { label: "Spin Wheel", icon: "🎡", bg: "#e0e7ff", color: "#4f46e5" },
//                                     { label: "Brain Report", icon: "📊", bg: "#f3e8ff", color: "#9333ea" },
//                                     { label: "Invite Friends", icon: "👥", bg: "#f1f5f9", color: "#475569" }
//                                 ].map((item, idx) => (
//                                     <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, cursor: "pointer" }}>
//                                         <div style={{ width: 64, height: 64, borderRadius: "50%", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
//                                             {item.icon}
//                                         </div>
//                                         <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", width: 60, textAlign: "center", lineHeight: 1.2 }}>{item.label}</span>
//                                     </div>
//                                 ))}
//                             </div>

//                             <div style={{ background: "#f8f9fe", borderRadius: 16, padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
//                                 <span style={{ fontSize: 24, color: "#8b5cf6", lineHeight: 1, fontFamily: "serif", fontWeight: 900 }}>"</span>
//                                 <div>
//                                     <p style={{ fontSize: 14, color: "#475569", fontWeight: 500, lineHeight: 1.5, marginBottom: 8 }}>The more you train your brain,<br/>the stronger your future.</p>
//                                     <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>– BrainBoot</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* EXPLORE BY ZONE */}
//                     <section>
//                         <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", marginBottom: 16 }}>Explore by Zone</h3>
//                         <div style={{ borderRadius: 24, overflow: "hidden", position: "relative", width: "100%", height: "380px", background: "#7cd3fc", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>

//                             <img src="/zone_map.png" alt="Zone Map" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />

//                             {ZONES.map((zone, idx) => (
//                                 <Link key={idx} to={`/games?zone=${zone.id}`} style={{ position: "absolute", top: zone.top, left: zone.left, transform: "translate(-50%, -50%)", textDecoration: "none", display: "block", padding: "16px" }}>
//                                     <div style={{ background: "rgba(30, 27, 75, 0.9)", backdropFilter: "blur(4px)", padding: "8px 14px", borderRadius: "12px", color: "white", fontSize: 12, fontWeight: 700, lineHeight: 1, whiteSpace: "nowrap", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", transition: "all 0.2s ease" }}>
//                                         {zone.name}
//                                     </div>
//                                 </Link>
//                             ))}

//                             <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "white", padding: "10px 28px", borderRadius: 100, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", width: "max-content", maxWidth: "90%" }}>
//                                 <span style={{ color: "#a78bfa", fontSize: 16 }}>★</span>
//                                 <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>Each zone has unique games. Explore & master them all!</span>
//                                 <span style={{ color: "#a78bfa", fontSize: 20, lineHeight: 0, position: "relative", top: 2, fontFamily: "serif" }}>”</span>
//                             </div>
//                         </div>
//                     </section>

//                     {/* ════════════════ BOTTOM ROW (PROGRESS & RECOMMENDED) ════════════════ */}
//                     <div style={{ display: "grid", gridTemplateColumns: "1fr 2.5fr", gap: 24 }}>

//                         {/* Radar Chart Component exactly matching the design */}
//                         <div style={{ background: "white", borderRadius: 24, padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column" }}>
//                             <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 32 }}>Your Progress</h3>

//                             <div style={{ position: "relative", width: "100%", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 220 }}>

//                                 {/* Absolute positioned text labels (matches exact styling from image) */}
//                                 <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
//                                     <span style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 2 }}>Memory</span>
//                                     <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>76%</span>
//                                 </div>
//                                 <div style={{ position: "absolute", top: "40%", right: -5, transform: "translateY(-50%)", textAlign: "right" }}>
//                                     <span style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 2 }}>Focus</span>
//                                     <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>66%</span>
//                                 </div>
//                                 <div style={{ position: "absolute", bottom: -10, right: "12%", textAlign: "center" }}>
//                                     <span style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 2 }}>Logic</span>
//                                     <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>72%</span>
//                                 </div>
//                                 <div style={{ position: "absolute", bottom: -10, left: "12%", textAlign: "center" }}>
//                                     <span style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 2 }}>Reflex</span>
//                                     <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>80%</span>
//                                 </div>
//                                 <div style={{ position: "absolute", top: "40%", left: -5, transform: "translateY(-50%)", textAlign: "left" }}>
//                                     <span style={{ fontSize: 11, fontWeight: 700, color: "#334155", display: "block", marginBottom: 2 }}>Problem Solving</span>
//                                     <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>70%</span>
//                                 </div>

//                                 {/* Refined SVG Pentagonal Chart */}
//                                 <svg width="200" height="200" viewBox="0 0 100 100" style={{ overflow: "visible" }}>
//                                     {/* Background Web Lines */}
//                                     <polygon points="50,10 88,38 73.5,86 26.5,86 12,38" fill="none" stroke="#e2e8f0" strokeWidth="0.8"/>
//                                     <polygon points="50,30 69,44 61.7,68 38.3,68 31,44" fill="none" stroke="#e2e8f0" strokeWidth="0.8"/>

//                                     {/* Spoke Lines */}
//                                     <line x1="50" y1="50" x2="50" y2="10" stroke="#e2e8f0" strokeWidth="0.8"/>
//                                     <line x1="50" y1="50" x2="88" y2="38" stroke="#e2e8f0" strokeWidth="0.8"/>
//                                     <line x1="50" y1="50" x2="73.5" y2="86" stroke="#e2e8f0" strokeWidth="0.8"/>
//                                     <line x1="50" y1="50" x2="26.5" y2="86" stroke="#e2e8f0" strokeWidth="0.8"/>
//                                     <line x1="50" y1="50" x2="12" y2="38" stroke="#e2e8f0" strokeWidth="0.8"/>

//                                     {/* Filled Data Polygon (Purple) */}
//                                     {/* Coordinates calculated roughly as: Memory 76%, Focus 66%, Logic 72%, Reflex 80%, Problem Solving 70% */}
//                                     <polygon points="50,19.6 75,42 67,73.3 31.2,75.9 23.4,41.4" fill="#a78bfa" fillOpacity="0.5" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round"/>

//                                     {/* Data Vertex Dots */}
//                                     <circle cx="50" cy="19.6" r="2.5" fill="white" stroke="#8b5cf6" strokeWidth="1.5" />
//                                     <circle cx="75" cy="42" r="2.5" fill="white" stroke="#8b5cf6" strokeWidth="1.5" />
//                                     <circle cx="67" cy="73.3" r="2.5" fill="white" stroke="#8b5cf6" strokeWidth="1.5" />
//                                     <circle cx="31.2" cy="75.9" r="2.5" fill="white" stroke="#8b5cf6" strokeWidth="1.5" />
//                                     <circle cx="23.4" cy="41.4" r="2.5" fill="white" stroke="#8b5cf6" strokeWidth="1.5" />
//                                 </svg>
//                             </div>
//                         </div>

//                         {/* Recommended For You Game Cards matching the design */}
//                         <div style={{ display: "flex", flexDirection: "column" }}>
//                             <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 24 }}>Recommended For You</h3>
//                             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, flex: 1 }}>
//                                 {recommendedGames.map((game, idx) => (
//                                     <div key={idx} style={{ background: "white", borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
//                                         {/* Top Colored Image Area */}
//                                         <div style={{ background: game.bgLight, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
//                                             <span style={{ fontSize: 72, filter: "drop-shadow(0 12px 12px rgba(0,0,0,0.1))" }}>{game.icon}</span>
//                                         </div>

//                                         {/* Bottom White Text/Action Area */}
//                                         <div style={{ padding: "16px 20px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
//                                             <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>{game.title}</h4>

//                                             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                                                 {/* Category Tag */}
//                                                 <span style={{ background: game.tagBg, color: game.tagColor, fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 8 }}>
//                                                     {game.tag}
//                                                 </span>

//                                                 {/* Play Button Outline */}
//                                                 <Link to={game.path} style={{ width: 34, height: 34, borderRadius: "50%", border: `1.5px solid #e2e8f0`, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: game.tagColor, transition: "all 0.2s" }} className="hover:border-violet-400 hover:shadow-sm">
//                                                     <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
//                                                 </Link>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                     </div>

//                     {/* ════════════════ INLINE PILL BOTTOM NAVIGATION ════════════════ */}
//                     <div style={{ 
//                         margin: "40px auto 0", 
//                         background: "white", 
//                         borderRadius: 100, 
//                         padding: "16px 48px", 
//                         display: "flex", 
//                         alignItems: "center", 
//                         justifyContent: "center",
//                         gap: 64,
//                         boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
//                         width: "max-content",
//                         maxWidth: "100%"
//                     }}>
//                         <Link to="/friends" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textDecoration: "none", color: "#64748b" }}>
//                             <IconFriends />
//                             <span style={{ fontSize: 12, fontWeight: 600 }}>Play with Friends</span>
//                         </Link>
//                         <Link to="/leaderboard" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textDecoration: "none", color: "#64748b" }}>
//                             <IconTrophy />
//                             <span style={{ fontSize: 12, fontWeight: 600 }}>Leaderboards</span>
//                         </Link>

//                         <Link to="/dashboard" style={{ position: "relative", top: -20 }}>
//                             <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #a78bfa, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 0 0 8px #f5f3ff, 0 8px 24px rgba(139,92,246,0.3)" }}>
//                                 <IconBrain />
//                             </div>
//                         </Link>

//                         <Link to="/achievements" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textDecoration: "none", color: "#64748b" }}>
//                             <IconMedal />
//                             <span style={{ fontSize: 12, fontWeight: 600 }}>Achievements</span>
//                         </Link>
//                         <Link to="/rewards" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textDecoration: "none", color: "#64748b" }}>
//                             <IconGift />
//                             <span style={{ fontSize: 12, fontWeight: 600 }}>Daily Rewards</span>
//                         </Link>
//                     </div>

//                 </main>

//             </div>

//             <style>{`
//                 .scrollbar-hide::-webkit-scrollbar { display: none; }
//                 .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
//                 * { box-sizing: border-box; }
//             `}</style>
//         </div>
//     );
// }

// export default Dashboard;




import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { gameSections } from "../data/gameCatalog";
import { getDashboardData } from "../services/api";
import toast from "react-hot-toast";

/* ─────────────── Sidebar SVGs ─────────────── */
const IconHome = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>;
const IconTrain = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M12 4v16" /><rect x="5" y="4" width="3" height="3" rx="1" /><rect x="16" y="17" width="3" height="3" rx="1" /></svg>;
const IconChallenge = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
const IconRooms = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4" /><circle cx="17" cy="9" r="3" /><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /><path d="M19 21v-1.5a3 3 0 0 0-3-3" /></svg>;
const IconProgress = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const IconLeaderboard = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="4" height="18" rx="1" /><rect x="10" y="9" width="4" height="12" rx="1" /><rect x="2" y="13" width="4" height="8" rx="1" /></svg>;
const IconProfile = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
const IconChat = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;

/* ─────────────── Bottom Nav SVGs ─────────────── */
const IconFriends = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconTrophy = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 4h10"></path><path d="M17 4v8a5 5 0 0 1-10 0V4"></path><path d="M7 4H3v3a4 4 0 0 0 4 4h0"></path><path d="M17 4h4v3a4 4 0 0 1-4 4h0"></path></svg>;
const IconBrain = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7.58 2 4 5.58 4 10c0 1.8.63 3.45 1.68 4.75C5.07 15.65 4 17.2 4 19c0 .55.45 1 1 1h4c2.21 0 4-1.79 4-4v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 1.1-.9 2-2 2H6.83c.53-1.28 1.82-2.18 3.17-2.18.55 0 1-.45 1-1C11 10.9 8.1 8 12 8s1 .45 1 1c0 .55.45 1 1 1 .55 0 1-.45 1-1 0-3.31-2.69-6-6-6zM18.32 14.75C19.37 13.45 20 11.8 20 10c0-4.42-3.58-8-8-8-.55 0-1 .45-1 1s.45 1 1 1c3.31 0 6 2.69 6 6 0 .55.45 1 1 1s1-.45 1-1c0-1.8-1.46-3.26-3.26-3.26-.55 0-1 .45-1 1s.45 1 1 1c.7 0 1.26.56 1.26 1.26 0 1.07-.87 1.94-1.94 1.94-.55 0-1 .45-1 1v2c0 2.21 1.79 4 4 4h4c.55 0 1-.45 1-1 0-1.8-1.07-3.35-1.68-4.25z" /></svg>;
const IconMedal = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;
const IconGift = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>;

/* ─────────────── utility helpers ─────────────── */
const readStoredJson = (key, fallback) => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch {
        return fallback;
    }
};

const getInitials = (name) => {
    const parts = String(name || "Player").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "PL";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
};

const BRAIN_QUOTES = [
    { text: "The more you train your brain,\nthe stronger your future.", author: "BrainBoot" },
    { text: "Focus is a muscle, and you\nbuild it through daily training.", author: "BrainBoot" },
    { text: "Intelligence is the ability\nto adapt to change.", author: "Stephen Hawking" },
    { text: "Consistency is the key to\nunlocking your brain's potential.", author: "BrainBoot" },
    { text: "Your brain is like a muscle:\nwhen it's in use we feel very good.", author: "Carl Sagan" },
    { text: "Do not let what you cannot do\ninterfere with what you can do.", author: "John Wooden" },
    { text: "The only limit to our realization\nof tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" }
];

/* ─────────────── Explore by Zone Configurations ─────────────── */
const ZONES = [
    { 
        id: "memory", 
        num: 1,
        name: "Memory Island", 
        emoji: "🧠", 
        icon: "🧠",
        image: "/zone_memory.png",
        desc: "Train visual recall, sequence patterns, and speed matching.",
        color: "#8b5cf6", 
        bg: "#f5f3ff", 
        shadowColor: "rgba(139, 92, 246, 0.15)" 
    },
    { 
        id: "focus", 
        num: 2,
        name: "Focus Forest", 
        emoji: "🌲", 
        icon: "🌲",
        image: "/zone_focus.png",
        desc: "Enhance selective attention, scanning speed, and focus grid accuracy.",
        color: "#10b981", 
        bg: "#ecfdf5", 
        shadowColor: "rgba(16, 185, 129, 0.15)" 
    },
    { 
        id: "logic", 
        num: 3,
        name: "Logic Lab", 
        emoji: "🧪", 
        icon: "🧪",
        image: "/zone_logic.png",
        desc: "Boost mathematical deduction, tile sorting, and Sudoku grid logic.",
        color: "#3b82f6", 
        bg: "#eff6ff", 
        shadowColor: "rgba(59, 130, 246, 0.15)" 
    },
    { 
        id: "reflex", 
        num: 4,
        name: "Reflex Mountain", 
        emoji: "⚡", 
        icon: "⚡",
        image: "/zone_reflex.png",
        desc: "Improve motor response times, speed typing, and reflex control.",
        color: "#f59e0b", 
        bg: "#fffbeb", 
        shadowColor: "rgba(245, 158, 11, 0.15)" 
    },
    { 
        id: "fun", 
        num: 5,
        name: "Fun Park", 
        emoji: "🎡", 
        icon: "🎡",
        image: "/zone_fun.png",
        desc: "Interact in playful chat rounds and word guess challenges.",
        color: "#ec4899", 
        bg: "#fdf2f8", 
        shadowColor: "rgba(236, 72, 153, 0.15)" 
    },
];

function Dashboard() {
    const user = readStoredJson("user", {});
    const storedStats = readStoredJson("brainbootsStats", {});
    const [dashboardData, setDashboardData] = useState({
        stats: storedStats,
        highScores: [],
        tables: [],
    });

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [hoveredZone, setHoveredZone] = useState(null);

    const username = user.username || user.email || "Guest Player";
    const initials = getInitials(username);
    const greeting = getGreeting();
    const stats = dashboardData.stats || {};
    const totalScore = stats.totalScore || 0;
    const streak = stats.streak || 0;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await getDashboardData();
                if (response.data.success) {
                    setDashboardData({
                        stats: response.data.stats || {},
                        highScores: response.data.highScores || [],
                        tables: response.data.tables || [],
                    });
                    localStorage.setItem("brainbootsStats", JSON.stringify(response.data.stats || {}));
                    setErrorMessage("");
                } else {
                    setErrorMessage(response.data.message || "Unable to fetch dashboard data");
                }
            } catch {
                setErrorMessage("Unable to fetch dashboard data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const userLevel = Math.floor(totalScore / 1000) + 1;

    // Helper to get best score for a specific database table
    const getBestScore = (tableName) => {
        const record = (dashboardData.highScores || []).find(h => (h.table || "").toLowerCase() === tableName.toLowerCase());
        return record ? record.bestScore : 0;
    };

    // Helper to extract best score from shared 'scores' table by game name
    const getSharedBestScore = (gameName) => {
        const scoresTable = (dashboardData.tables || []).find(t => t.name === "scores");
        if (scoresTable && scoresTable.rows) {
            const rows = scoresTable.rows.filter(r => r.game_name === gameName);
            if (rows.length > 0) {
                return Math.max(...rows.map(r => r.score || 0));
            }
        }
        return 0;
    };

    // Parse games played today across all tables
    const getGamesPlayedTodayCount = () => {
        if (!dashboardData.tables) return 0;
        const localToday = new Date().toLocaleDateString('en-CA');
        let count = 0;
        dashboardData.tables.forEach(table => {
            if (table.rows) {
                table.rows.forEach(row => {
                    for (const key of ["created_at", "created_on", "played_at", "date"]) {
                        const val = row[key];
                        if (val && String(val).includes(localToday)) {
                            count++;
                            break;
                        }
                    }
                });
            }
        });
        return count;
    };

    // Parse scores achieved today across all tables
    const getScoreAchievedToday = () => {
        if (!dashboardData.tables) return 0;
        const localToday = new Date().toLocaleDateString('en-CA');
        let scoreSum = 0;
        dashboardData.tables.forEach(table => {
            if (table.rows) {
                table.rows.forEach(row => {
                    let isToday = false;
                    for (const key of ["created_at", "created_on", "played_at", "date"]) {
                        const val = row[key];
                        if (val && String(val).includes(localToday)) {
                            isToday = true;
                            break;
                        }
                    }
                    if (isToday) {
                        for (const key of ["score", "total_score", "points", "wpm"]) {
                            const val = row[key];
                            if (val !== undefined && val !== null) {
                                scoreSum += Number(val);
                                break;
                            }
                        }
                    }
                });
            }
        });
        return scoreSum;
    };

    const gamesPlayedToday = getGamesPlayedTodayCount();
    const scoreAchievedToday = getScoreAchievedToday();
    const isChallengeCompleted = gamesPlayedToday >= 3 && scoreAchievedToday >= 500;

    const quoteIndex = new Date().getDay() % BRAIN_QUOTES.length;
    const selectedQuote = BRAIN_QUOTES[quoteIndex];

    // Calculate dynamic radar chart coordinates
    const getCategoryScores = () => {
        const memoryScores = [
            getSharedBestScore("Memory Game") > 0 ? (getSharedBestScore("Memory Game") / 200) * 100 : null,
            getBestScore("simon_scores") > 0 ? (getBestScore("simon_scores") / 50) * 100 : null,
            getBestScore("number_sequence_scores") > 0 ? (getBestScore("number_sequence_scores") / 60) * 100 : null,
            getBestScore("memory_race_scores") > 0 ? (getBestScore("memory_race_scores") / 100) * 100 : null,
        ].filter(v => v !== null);
        const memoryVal = memoryScores.length > 0
            ? Math.min(100, Math.max(30, Math.round(memoryScores.reduce((a, b) => a + b, 0) / memoryScores.length)))
            : 76;

        const focusScores = [
            getBestScore("focus_grid_scores") > 0 ? (getBestScore("focus_grid_scores") / 60) * 100 : null,
            getBestScore("odd_color_scores") > 0 ? (getBestScore("odd_color_scores") / 400) * 100 : null,
            getBestScore("stroop_scores") > 0 ? (getBestScore("stroop_scores") / 30) * 100 : null,
        ].filter(v => v !== null);
        const focusVal = focusScores.length > 0
            ? Math.min(100, Math.max(30, Math.round(focusScores.reduce((a, b) => a + b, 0) / focusScores.length)))
            : 66;

        const logicScores = [
            getBestScore("sudoku_scores") > 0 ? (getBestScore("sudoku_scores") / 100) * 100 : null,
        ].filter(v => v !== null);
        const logicVal = logicScores.length > 0
            ? Math.min(100, Math.max(30, Math.round(logicScores.reduce((a, b) => a + b, 0) / logicScores.length)))
            : 72;

        const reflexScores = [
            getSharedBestScore("Reaction Game") > 0 ? (getSharedBestScore("Reaction Game") / 250) * 100 : null,
            getBestScore("aim_scores") > 0 ? (getBestScore("aim_scores") / 50) * 100 : null,
            getBestScore("typing_scores") > 0 ? (getBestScore("typing_scores") / 100) * 100 : null,
            getBestScore("traffic_control_scores") > 0 ? (getBestScore("traffic_control_scores") / 100) * 100 : null,
        ].filter(v => v !== null);
        const reflexVal = reflexScores.length > 0
            ? Math.min(100, Math.max(30, Math.round(reflexScores.reduce((a, b) => a + b, 0) / reflexScores.length)))
            : 80;

        const problemSolvingScores = [
            getBestScore("lights_out_scores") > 0 ? (getBestScore("lights_out_scores") / 100) * 100 : null,
        ].filter(v => v !== null);
        const problemSolvingVal = problemSolvingScores.length > 0
            ? Math.min(100, Math.max(30, Math.round(problemSolvingScores.reduce((a, b) => a + b, 0) / problemSolvingScores.length)))
            : 70;

        return {
            memory: memoryVal,
            focus: focusVal,
            logic: logicVal,
            reflex: reflexVal,
            problemSolving: problemSolvingVal
        };
    };

    const categoryVals = getCategoryScores();

    const getVertexCoords = (val, angleDeg) => {
        const angleRad = (angleDeg * Math.PI) / 180;
        const radius = 40 * (val / 100);
        const x = 50 + radius * Math.cos(angleRad);
        const y = 50 + radius * Math.sin(angleRad);
        return { x: x.toFixed(1), y: y.toFixed(1) };
    };

    const p0 = getVertexCoords(categoryVals.memory, -90);
    const p1 = getVertexCoords(categoryVals.focus, -18);
    const p2 = getVertexCoords(categoryVals.logic, 54);
    const p3 = getVertexCoords(categoryVals.reflex, 126);
    const p4 = getVertexCoords(categoryVals.problemSolving, 198);

    // Hardcoded recommended games based on exact image design requirement
    const recommendedGames = [
        { title: "Memory Match", image: "/rec_memory.png", tag: "Memory", tagColor: "#8b5cf6", tagBg: "#ede9ff", path: "/games/memory" },
        { title: "Reaction Test", image: "/rec_reaction.png", tag: "Reflex", tagColor: "#d97706", tagBg: "#fffbeb", path: "/games/reaction" },
        { title: "Focus Grid", image: "/rec_focus.png", tag: "Focus", tagColor: "#22c55e", tagBg: "#e8fdf0", path: "/games/focusgrid" }
    ];

    const quickAccessItems = [
        {
            label: "Daily Challenge",
            icon: "🎯",
            bg: "#ffe4e6",
            color: "#e11d48",
            onClick: () => {
                const challengeSec = document.getElementById("daily-challenge");
                if (challengeSec) challengeSec.scrollIntoView({ behavior: "smooth" });
            }
        },
        {
            label: "Spin Wheel",
            icon: "🎡",
            bg: "#e0e7ff",
            color: "#4f46e5",
            onClick: () => {
                toast.success("Spin Wheel coming soon! Complete challenges to get free spins.");
            }
        },
        {
            label: "Brain Report",
            icon: "📊",
            bg: "#f3e8ff",
            color: "#9333ea",
            onClick: () => {
                const progressSec = document.getElementById("your-progress");
                if (progressSec) progressSec.scrollIntoView({ behavior: "smooth" });
            }
        },
        {
            label: "Invite Friends",
            icon: "👥",
            bg: "#f1f5f9",
            color: "#475569",
            onClick: () => {
                navigator.clipboard.writeText(window.location.origin + "/register");
                toast.success("Registration link copied! Invite your friends to play.");
            }
        }
    ];

    const sidebarItems = [
        { label: "Home", icon: <IconHome />, active: true },
        { label: "Train", icon: <IconTrain />, to: "/games" },
        { label: "AI Assistant", icon: <IconChat />, to: "/chat" },
        { label: "Challenges", icon: <IconChallenge />, to: "/dashboard" },
        { label: "Rooms", icon: <IconRooms />, to: "/multiplayer" },
        { label: "Progress", icon: <IconProgress />, to: "/dashboard" },
        { label: "Leaderboard", icon: <IconLeaderboard />, to: "/dashboard" },
        { label: "Profile", icon: <IconProfile />, to: "/dashboard" },
    ];

    const streakDays = ["M", "T", "W", "T", "F", "S", "S"];

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fe", fontFamily: "Inter, system-ui, sans-serif" }}>

            {/* ════════════════ SIDEBAR ════════════════ */}
            <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "240px", minWidth: "240px", background: "white", borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "24px 16px", zIndex: 45, overflowY: "auto" }}>

                <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "8px", marginBottom: "32px", textDecoration: "none" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "10px", background: "linear-gradient(135deg, #7c6aff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 900 }}>
                        <IconBrain />
                    </div>
                    <div>
                        <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>BrainBoot</p>
                        <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1, marginTop: 4, fontWeight: 500 }}>Train Your Brain</p>
                    </div>
                </Link>

                <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, overflowY: "auto" }} className="scrollbar-hide">
                    {sidebarItems.map((item, i) => (
                        <Link key={i} to={item.to || "#"} style={{
                            display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: "12px",
                            background: item.active ? "linear-gradient(135deg, #8b5cf6, #a78bfa)" : "transparent",
                            color: item.active ? "white" : "#64748b", fontWeight: 600, fontSize: 14, textDecoration: "none", transition: "all 0.2s"
                        }}>
                            <span style={{ opacity: item.active ? 1 : 0.7 }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>


                <div style={{ padding: "0 8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <span style={{ fontSize: 24 }}>🔥</span>
                        <span style={{ fontSize: 24, fontWeight: 800, color: "#10b981", lineHeight: 1 }}>{streak}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginTop: 4 }}>Day Streak</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
                        {streakDays.map((d, i) => {
                            const isCompleted = i < (streak % 7 || (streak > 0 ? 7 : 0));
                            return (
                                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: "50%",
                                        background: isCompleted ? "#10b981" : "#f1f5f9",
                                        display: "flex", alignItems: "center", justifyContent: "center"
                                    }}>
                                        {isCompleted ? <span style={{ color: "white", fontSize: 10, fontWeight: 900 }}>✓</span> : <span style={{ color: "#94a3b8", fontSize: 10, fontWeight: 600 }}>{d}</span>}
                                    </div>
                                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{d}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* ════════════════ MAIN CONTENT AREA ════════════════ */}
            <div style={{
                marginLeft: "240px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                position: "relative",
                backgroundColor: "#f8f9fe",
                overflowX: "hidden"
            }}>
                {/* Background Sky Image Layer */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "580px",
                    backgroundImage: "url('/sky_bg.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    zIndex: 0,
                    pointerEvents: "none"
                }} />

                <header style={{ background: "transparent", borderBottom: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 40px", flexShrink: 0, zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: "24px", padding: "8px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                        <span style={{ fontSize: 18 }}>🪙</span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{totalScore.toLocaleString()}</span>
                        <button style={{ background: "#f8f9fe", border: "none", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", marginLeft: 4, color: "#64748b" }}>+</button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <button style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                        <button style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "transparent", cursor: "pointer" }}>
                            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#f472b6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                                👾
                            </div>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{username}</p>
                                <p style={{ fontSize: 12, color: "#64748b", marginTop: 2, fontWeight: 500 }}>Level {userLevel}</p>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </header>
                <main style={{ flex: 1, overflowY: "visible", padding: "0 40px 40px", display: "flex", flexDirection: "column", gap: 32, position: "relative", zIndex: 2 }} className="scrollbar-hide">
                    {/* HERO SECTION */}
                    <section style={{
                        position: "relative",
                        minHeight: "500px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "0 0 36px"
                    }}>
                        <div style={{ maxWidth: "60%", zIndex: 2, position: "relative", marginTop: "40px" }}>
                            <p style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{greeting},</p>
                            <h1 style={{ fontSize: 48, fontWeight: 900, color: "#1e1b4b", lineHeight: 1.1, marginBottom: 16 }}>{username}!</h1>
                            <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.5, marginBottom: 24, fontWeight: 500 }}>Ready to boost your brain today?<br />Let's continue your journey.</p>

                            <Link to="/games" style={{ textDecoration: "none" }}>
                                <button style={{ background: "linear-gradient(135deg, #8b5cf6, #a78bfa)", color: "white", border: "none", borderRadius: "12px", padding: "14px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 14px rgba(139,92,246,0.3)" }}>
                                    Continue Training <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </button>
                            </Link>
                        </div>

                        {/* Stats Floating Row */}
                        <div style={{ display: "flex", gap: 16, marginTop: 40, zIndex: 2, position: "relative" }}>
                            <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 16, padding: "16px", width: 100, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
                                <div style={{ fontSize: 20, marginBottom: 8, color: "#8b5cf6", background: "#f5f3ff", width: 36, height: 36, borderRadius: "50%", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>🛡️</div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Level</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{userLevel}</div>
                            </div>
                            <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 16, padding: "16px", width: 140, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
                                <div style={{ fontSize: 20, marginBottom: 8, color: "#3b82f6", background: "#eff6ff", width: 36, height: 36, borderRadius: "50%", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>⭐</div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Brain Score</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{totalScore.toLocaleString()}</div>
                            </div>
                            <div style={{ background: "rgba(255,255,255,0.92)", borderRadius: 16, padding: "16px", width: 100, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
                                <div style={{ fontSize: 20, marginBottom: 8, color: "#10b981", background: "#ecfdf5", width: 36, height: 36, borderRadius: "50%", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>🔥</div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Streak</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{streak} <span style={{ fontSize: 12 }}>Days</span></div>
                            </div>
                        </div>
                        <img
                            src="/hero_mascot.png"
                            alt="Brain Mascot"
                            style={{
                                position: "absolute",
                                bottom: "-2px",
                                right: "-40px",
                                height: "calc(100% + 2px)",
                                maxHeight: "500px",
                                objectFit: "contain",
                                objectPosition: "right bottom",
                                pointerEvents: "none",
                                zIndex: 1,
                                WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0) 2%, black 28%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0) 2%, black 12%)",
                                WebkitMaskComposite: "source-in",
                                maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0) 2%, black 28%), linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0) 2%, black 12%)",
                                maskComposite: "intersect"
                            }}
                        />
                    </section>

                    {/* TWO COLUMN ROW */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        {/* Today's Challenge */}
                        <div id="daily-challenge" style={{
                            background: "white",
                            borderRadius: 24,
                            padding: "28px 24px 24px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "stretch",
                            gap: 20,
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            {/* Left Column */}
                            <div style={{ display: "flex", flexDirection: "column", flex: 1.2, justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                        <span style={{ fontSize: 20 }}>🔥</span>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#8b5cf6" }}>Today's Challenge</h3>
                                    </div>
                                    <p style={{ fontSize: 14, color: "#475569", fontWeight: 600, margin: "0 0 4px 0" }}>Complete 3 games ({gamesPlayedToday} done)</p>
                                    <p style={{ fontSize: 14, color: "#475569", fontWeight: 600, margin: "0 0 20px 0" }}>Score 500+ points ({scoreAchievedToday} achieved)</p>

                                    <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, margin: "0 0 8px 0" }}>{gamesPlayedToday} / 3 Games Completed</p>
                                    <div style={{ background: "#f1f5f9", height: 8, borderRadius: 4, width: "100%", overflow: "hidden", marginBottom: 20 }}>
                                        <div style={{ background: isChallengeCompleted ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #8b5cf6, #a78bfa)", height: "100%", width: `${Math.min(100, Math.round((gamesPlayedToday / 3) * 100))}%`, borderRadius: 4 }}></div>
                                    </div>
                                </div>

                                <Link to={isChallengeCompleted ? "#" : "/games"} style={{ textDecoration: "none" }}>
                                    <button style={{
                                        background: isChallengeCompleted ? "linear-gradient(135deg, #10b981, #34d399)" : "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "14px",
                                        padding: "12px 24px",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        cursor: isChallengeCompleted ? "default" : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 10,
                                        width: "max-content",
                                        boxShadow: isChallengeCompleted ? "0 4px 14px rgba(16,185,129,0.25)" : "0 4px 14px rgba(139,92,246,0.25)",
                                        transition: "all 0.2s"
                                    }}
                                        disabled={isChallengeCompleted}
                                    >
                                        {isChallengeCompleted ? "Challenge Completed!" : "Start Challenge"}
                                        {!isChallengeCompleted && (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                                <polyline points="12 5 19 12 12 19"></polyline>
                                            </svg>
                                        )}
                                    </button>
                                </Link>
                            </div>

                            {/* Right Column (Chest & Rewards) */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", flex: 0.9 }}>
                                <img
                                    src="/treasure_chest.png"
                                    alt="Treasure Chest"
                                    style={{
                                        width: 190,
                                        height: 190,
                                        objectFit: "contain",
                                        transform: "translateY(-10px)",
                                        filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.06))",
                                        mixBlendMode: "multiply"
                                    }}
                                />

                                <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rewards</span>
                                    <div style={{ display: "flex", gap: 8, justifyContent: "center", width: "100%" }}>
                                        <span style={{
                                            background: "#f3e8ff",
                                            color: "#8b5cf6",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            padding: "6px 12px",
                                            borderRadius: 12,
                                            display: "inline-flex",
                                            alignItems: "center"
                                        }}>
                                            +50 XP
                                        </span>
                                        <span style={{
                                            background: "#fffbeb",
                                            color: "#d97706",
                                            fontSize: 12,
                                            fontWeight: 700,
                                            padding: "6px 12px",
                                            borderRadius: 12,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4
                                        }}>
                                            +100 <span style={{ fontSize: 14 }}>🪙</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Access */}
                        <div style={{ background: "white", borderRadius: 24, padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 20 }}>Quick Access</h3>

                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                                {quickAccessItems.map((item, idx) => (
                                    <div key={idx} onClick={item.onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, cursor: "pointer" }}>
                                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                                            {item.icon}
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", width: 60, textAlign: "center", lineHeight: 1.2 }}>{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: "#f8f9fe", borderRadius: 16, padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                                <span style={{ fontSize: 24, color: "#8b5cf6", lineHeight: 1, fontFamily: "serif", fontWeight: 900 }}>"</span>
                                <div>
                                    <p style={{ fontSize: 14, color: "#475569", fontWeight: 500, lineHeight: 1.5, marginBottom: 8 }}>The more you train your brain,<br />the stronger your future.</p>
                                    <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>– BrainBoot</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* EXPLORE BY ZONE */}
                    <section>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px" }}>
                            <h3 style={{ fontSize: "24px", fontWeight: "900", color: "#1e1b4b", margin: 0 }}>Explore by Zone</h3>
                            <p style={{ fontSize: "13px", color: "#94a3b8", fontWeight: "600", margin: 0 }}>
                                Each zone has unique games. Explore & master them all! <span style={{ color: "#a78bfa" }}>✦</span>
                            </p>
                        </div>
                        <div className="zones-grid" style={{ marginBottom: "24px" }}>
                            {ZONES.map((zone, idx) => {
                                const isHovered = hoveredZone === idx;
                                const isHorizontal = idx >= 3;

                                if (isHorizontal) {
                                    return (
                                        <Link 
                                            key={idx} 
                                            to={`/games?zone=${zone.id}`}
                                            onMouseEnter={() => setHoveredZone(idx)}
                                            onMouseLeave={() => setHoveredZone(null)}
                                            className={`zone-card zone-card-${idx + 1}`}
                                            style={{
                                                border: isHovered ? `1.5px solid ${zone.color}` : "1.5px solid #f1f5f9",
                                                boxShadow: isHovered ? `0 12px 32px ${zone.shadowColor}` : "0 4px 12px rgba(0,0,0,0.02)",
                                                transform: isHovered ? "translateY(-6px)" : "translateY(0)"
                                            }}
                                        >
                                            {/* Left Info Area */}
                                            <div style={{
                                                padding: "24px",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "16px",
                                                flex: 1.2,
                                                justifyContent: "center",
                                                position: "relative"
                                            }}>
                                                {/* Number Badge */}
                                                <div style={{
                                                    width: "28px",
                                                    height: "28px",
                                                    borderRadius: "50%",
                                                    background: zone.color,
                                                    color: "white",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    position: "absolute",
                                                    top: "16px",
                                                    left: "16px"
                                                }}>
                                                    {zone.num}
                                                </div>

                                                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginTop: "16px" }}>
                                                    <div style={{
                                                        width: "44px",
                                                        height: "44px",
                                                        borderRadius: "50%",
                                                        background: zone.color,
                                                        color: "white",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexShrink: 0
                                                    }}>
                                                        {zone.icon}
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                        <h4 style={{ fontSize: "17px", fontWeight: "800", color: "#1e1b4b", margin: 0 }}>
                                                            {zone.name}
                                                        </h4>
                                                        <p style={{ fontSize: "13px", color: "#64748b", fontWeight: "500", margin: 0, lineHeight: 1.4 }}>
                                                            {zone.desc}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button style={{
                                                    background: zone.color,
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "10px",
                                                    padding: "8px 16px",
                                                    fontSize: "13px",
                                                    fontWeight: "700",
                                                    cursor: "pointer",
                                                    width: "max-content",
                                                    boxShadow: `0 4px 10px ${zone.shadowColor}`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    marginLeft: "58px",
                                                    transition: "all 0.2s ease"
                                                }}>
                                                    Explore Zone <span style={{ fontSize: "14px" }}>➔</span>
                                                </button>
                                            </div>

                                            {/* Right Image Area */}
                                            <div style={{
                                                flex: 1.4,
                                                background: `linear-gradient(to right, #ffffff 0%, ${zone.bg} 100%)`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                position: "relative",
                                                overflow: "hidden"
                                            }}>
                                                <img 
                                                    src={zone.image} 
                                                    alt={zone.name} 
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        maxHeight: "240px",
                                                        objectFit: "contain",
                                                        display: "block",
                                                        transform: isHovered ? "scale(1.08)" : "scale(1)",
                                                        transition: "transform 0.3s ease-out"
                                                    }}
                                                />
                                            </div>
                                        </Link>
                                    );
                                } else {
                                    return (
                                        <Link 
                                            key={idx} 
                                            to={`/games?zone=${zone.id}`}
                                            onMouseEnter={() => setHoveredZone(idx)}
                                            onMouseLeave={() => setHoveredZone(null)}
                                            className={`zone-card zone-card-${idx + 1}`}
                                            style={{
                                                border: isHovered ? `1.5px solid ${zone.color}` : "1.5px solid #f1f5f9",
                                                boxShadow: isHovered ? `0 12px 32px ${zone.shadowColor}` : "0 4px 12px rgba(0,0,0,0.02)",
                                                transform: isHovered ? "translateY(-6px)" : "translateY(0)"
                                            }}
                                        >
                                            {/* Top Image Area */}
                                            <div style={{
                                                height: "280px",
                                                width: "100%",
                                                position: "relative",
                                                background: `linear-gradient(to bottom, ${zone.bg} 0%, #ffffff 100%)`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                overflow: "hidden"
                                            }}>
                                                {/* Number Badge */}
                                                <div style={{
                                                    width: "28px",
                                                    height: "28px",
                                                    borderRadius: "50%",
                                                    background: zone.color,
                                                    color: "white",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    position: "absolute",
                                                    top: "16px",
                                                    left: "16px"
                                                }}>
                                                    {zone.num}
                                                </div>
                                                
                                                <img 
                                                    src={zone.image} 
                                                    alt={zone.name} 
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        maxHeight: "260px",
                                                        objectFit: "contain",
                                                        display: "block",
                                                        transform: isHovered ? "scale(1.08)" : "scale(1)",
                                                        transition: "transform 0.3s ease-out"
                                                    }}
                                                />
                                            </div>

                                            {/* Content Area */}
                                            <div style={{
                                                padding: "20px 24px 24px",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "16px",
                                                flex: 1
                                            }}>
                                                <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                                                    <div style={{
                                                        width: "44px",
                                                        height: "44px",
                                                        borderRadius: "50%",
                                                        background: zone.color,
                                                        color: "white",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexShrink: 0
                                                    }}>
                                                        {zone.icon}
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                        <h4 style={{ fontSize: "17px", fontWeight: "800", color: "#1e1b4b", margin: 0 }}>
                                                            {zone.name}
                                                        </h4>
                                                        <p style={{ fontSize: "13px", color: "#64748b", fontWeight: "500", margin: 0, lineHeight: 1.4 }}>
                                                            {zone.desc}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button style={{
                                                    background: zone.color,
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "10px",
                                                    padding: "8px 16px",
                                                    fontSize: "13px",
                                                    fontWeight: "700",
                                                    cursor: "pointer",
                                                    width: "max-content",
                                                    boxShadow: `0 4px 10px ${zone.shadowColor}`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    marginTop: "auto",
                                                    marginLeft: "58px",
                                                    transition: "all 0.2s ease"
                                                }}>
                                                    Explore Zone <span style={{ fontSize: "14px" }}>➔</span>
                                                </button>
                                            </div>
                                        </Link>
                                    );
                                }
                            })}
                        </div>
                    </section>

                    {/* ════════════════ BOTTOM ROW (PROGRESS & RECOMMENDED) ════════════════ */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2.5fr", gap: 24 }}>

                        {/* Radar Chart Component exactly matching the design */}
                        <div id="your-progress" style={{ background: "white", borderRadius: 24, padding: "28px 24px", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", border: "1.5px solid #f3f1fa" }}>
                            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1e1b4b", marginBottom: 32 }}>Your Progress</h3>

                            <div style={{ position: "relative", width: "100%", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 220 }}>

                                {/* Absolute positioned text labels (matches exact styling from image) */}
                                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b", display: "block" }}>Memory</span>
                                    <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{categoryVals.memory}%</span>
                                </div>
                                <div style={{ position: "absolute", top: "42%", right: 5, transform: "translateY(-50%)", textAlign: "left" }}>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b", display: "block" }}>Focus</span>
                                    <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{categoryVals.focus}%</span>
                                </div>
                                <div style={{ position: "absolute", bottom: 5, right: "12%", textAlign: "center" }}>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b", display: "block" }}>Logic</span>
                                    <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{categoryVals.logic}%</span>
                                </div>
                                <div style={{ position: "absolute", bottom: 5, left: "12%", textAlign: "center" }}>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b", display: "block" }}>Reflex</span>
                                    <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{categoryVals.reflex}%</span>
                                </div>
                                <div style={{ position: "absolute", top: "42%", left: 5, transform: "translateY(-50%)", textAlign: "right" }}>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: "#1e1b4b", display: "block" }}>Problem Solving</span>
                                    <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>{categoryVals.problemSolving}%</span>
                                </div>

                                {/* Refined SVG Pentagonal Chart */}
                                <svg width="190" height="190" viewBox="0 0 100 100" style={{ overflow: "visible" }}>
                                    {/* 5 Concentric Pentagons */}
                                    <polygon points="50,10 88,37.6 73.5,82.4 26.5,82.4 12,37.6" fill="none" stroke="#ede9fe" strokeWidth="0.8" />
                                    <polygon points="50,18 80.4,40.1 68.8,75.9 31.2,75.9 19.6,40.1" fill="none" stroke="#ede9fe" strokeWidth="0.8" />
                                    <polygon points="50,26 72.8,42.6 64.1,69.4 35.9,69.4 27.2,42.6" fill="none" stroke="#ede9fe" strokeWidth="0.8" />
                                    <polygon points="50,34 65.2,45.1 59.4,62.9 40.6,62.9 34.8,45.1" fill="none" stroke="#ede9fe" strokeWidth="0.8" />
                                    <polygon points="50,42 57.6,47.5 54.7,56.5 45.3,56.5 42.4,47.5" fill="none" stroke="#ede9fe" strokeWidth="0.8" />

                                    {/* Spoke Lines */}
                                    <line x1="50" y1="50" x2="50" y2="10" stroke="#ede9fe" strokeWidth="0.8" />
                                    <line x1="50" y1="50" x2="88" y2="37.6" stroke="#ede9fe" strokeWidth="0.8" />
                                    <line x1="50" y1="50" x2="73.5" y2="82.4" stroke="#ede9fe" strokeWidth="0.8" />
                                    <line x1="50" y1="50" x2="26.5" y2="82.4" stroke="#ede9fe" strokeWidth="0.8" />
                                    <line x1="50" y1="50" x2="12" y2="37.6" stroke="#ede9fe" strokeWidth="0.8" />

                                    {/* Filled Data Polygon (Purple) */}
                                    <polygon points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`} fill="#8c7cf0" fillOpacity="0.45" stroke="#7c6aff" strokeWidth="2" strokeLinejoin="round" />

                                    {/* Data Vertex Dots */}
                                    <circle cx={p0.x} cy={p0.y} r="2.5" fill="white" stroke="#7c6aff" strokeWidth="1.5" />
                                    <circle cx={p1.x} cy={p1.y} r="2.5" fill="white" stroke="#7c6aff" strokeWidth="1.5" />
                                    <circle cx={p2.x} cy={p2.y} r="2.5" fill="white" stroke="#7c6aff" strokeWidth="1.5" />
                                    <circle cx={p3.x} cy={p3.y} r="2.5" fill="white" stroke="#7c6aff" strokeWidth="1.5" />
                                    <circle cx={p4.x} cy={p4.y} r="2.5" fill="white" stroke="#7c6aff" strokeWidth="1.5" />
                                </svg>
                            </div>
                        </div>

                        {/* Recommended For You Game Cards matching the design */}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1e1b4b", marginBottom: 24 }}>Recommended For You</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, flex: 1 }}>
                                {recommendedGames.map((game, idx) => (
                                    <div key={idx} style={{ background: "white", borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.02)", border: "1.5px solid #f3f1fa" }}>
                                        {/* Top Colored Image Area */}
                                        <div style={{ height: 170, overflow: "hidden", position: "relative" }}>
                                            <img src={game.image} alt={game.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        </div>

                                        {/* Bottom White Text/Action Area */}
                                        <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, gap: 16 }}>
                                            <h4 style={{ fontSize: 16, fontWeight: 800, color: "#1e1b4b", margin: 0 }}>{game.title}</h4>

                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                {/* Category Tag */}
                                                <span style={{ background: game.tagBg, color: game.tagColor, fontSize: 11, fontWeight: 800, padding: "6px 16px", borderRadius: 20 }}>
                                                    {game.tag}
                                                </span>

                                                {/* Play Button Outline */}
                                                <Link to={game.path} style={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: "50%",
                                                    border: "2px solid #e5e0ff",
                                                    background: "white", 
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    textDecoration: "none",
                                                    color: "#7c6aff", transition: "all 0.2s ease",
                                                    boxShadow: "0 2px 8px rgba(124,106,255,0.05)"
                                                }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.borderColor = "#7c6aff";
                                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(124,106,255,0.15)";
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.borderColor = "#e5e0ff";
                                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(124,106,255,0.05)";
                                                    }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* ════════════════ INLINE PILL BOTTOM NAVIGATION ════════════════ */}
                    <div style={{
                        margin: "40px auto 0",
                        background: "white",
                        borderRadius: 100,
                        padding: "8px 48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 8px 32px rgba(124,106,255,0.06)",
                        width: "100%",
                        border: "1.5px solid #f3f1fa"
                    }}>
                        <Link
                            to="/friends"
                            style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, textDecoration: "none", color: "#2e2a77", transition: "all 0.2s ease" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#8b5cf6"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "#2e2a77"; }}
                        >
                            <IconFriends />
                            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Play with Friends</span>
                        </Link>

                        <Link
                            to="/leaderboard"
                            style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, textDecoration: "none", color: "#2e2a77", transition: "all 0.2s ease" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#8b5cf6"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "#2e2a77"; }}
                        >
                            <IconTrophy />
                            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Leaderboards</span>
                        </Link>

                        <Link to="/dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                            <div style={{
                                width: 46,
                                height: 46,
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                boxShadow: "0 4px 12px rgba(139,92,246,0.25)",
                                transition: "all 0.2s ease"
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = "scale(1.05)";
                                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(139,92,246,0.35)";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(139,92,246,0.25)";
                                }}>
                                <IconBrain />
                            </div>
                        </Link>

                        <Link
                            to="/achievements"
                            style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, textDecoration: "none", color: "#2e2a77", transition: "all 0.2s ease" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#8b5cf6"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "#2e2a77"; }}
                        >
                            <IconMedal />
                            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Achievements</span>
                        </Link>

                        <Link
                            to="/rewards"
                            style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, textDecoration: "none", color: "#2e2a77", transition: "all 0.2s ease" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#8b5cf6"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "#2e2a77"; }}
                        >
                            <IconGift />
                            <span style={{ fontSize: 13.5, fontWeight: 700 }}>Daily Rewards</span>
                        </Link>
                    </div>

                </main>

            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                * { box-sizing: border-box; }
                .zones-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 24px;
                    width: 100%;
                }
                .zone-card {
                    background: white;
                    border-radius: 24px;
                    border: 1.5px solid #f1f5f9;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    text-decoration: none;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }
                .zone-card:hover {
                    transform: translateY(-6px);
                }
                .zone-card-1, .zone-card-2, .zone-card-3 {
                    grid-column: span 2;
                }
                .zone-card-4, .zone-card-5 {
                    grid-column: span 3;
                    flex-direction: row;
                }
                @media (max-width: 1024px) {
                    .zones-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .zone-card-1, .zone-card-2, .zone-card-3 {
                        grid-column: span 1;
                    }
                    .zone-card-4, .zone-card-5 {
                        grid-column: span 1;
                        flex-direction: column;
                    }
                }
                @media (max-width: 640px) {
                    .zones-grid {
                        grid-template-columns: 1fr;
                    }
                    .zone-card-1, .zone-card-2, .zone-card-3, .zone-card-4, .zone-card-5 {
                        grid-column: span 1;
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
}

export default Dashboard;