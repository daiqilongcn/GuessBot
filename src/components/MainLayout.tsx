import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { user, profile, signOut, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Battle', emoji: '⚔️' },
        { path: '/leaderboard', label: 'Leaderboard', emoji: '🏅' },
    ];

    if (isAdmin) {
        navItems.push({ path: '/admin', label: 'Admin', emoji: '⚙️' });
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <div
                className="fixed inset-0 -z-10"
                style={{
                    background:
                        'radial-gradient(ellipse at 15% 20%, #fbc2eb 0%, transparent 55%), radial-gradient(ellipse at 85% 10%, #a18cd1 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #a1c4fd 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, #ffecd2 0%, transparent 45%), linear-gradient(135deg, #fce4ec 0%, #ede7f6 40%, #e3f2fd 100%)',
                }}
            />

            <div
                className="fixed -z-10 pointer-events-none"
                style={{
                    width: 420,
                    height: 420,
                    borderRadius: '50%',
                    background: 'rgba(247, 185, 230, 0.38)',
                    filter: 'blur(90px)',
                    top: -80,
                    left: -80,
                }}
            />
            <div
                className="fixed -z-10 pointer-events-none"
                style={{
                    width: 380,
                    height: 380,
                    borderRadius: '50%',
                    background: 'rgba(167, 139, 250, 0.28)',
                    filter: 'blur(80px)',
                    top: 100,
                    right: -60,
                }}
            />
            <div
                className="fixed -z-10 pointer-events-none"
                style={{
                    width: 500,
                    height: 340,
                    borderRadius: '50%',
                    background: 'rgba(147, 197, 253, 0.32)',
                    filter: 'blur(100px)',
                    bottom: 60,
                    left: '20%',
                }}
            />

            <header
                className="sticky top-0 z-40 flex items-center justify-between px-8 py-4"
                style={{
                    background: 'rgba(255,255,255,0.28)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.50)',
                    boxShadow: '0 2px 24px 0 rgba(180,160,220,0.10)',
                }}
            >
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)',
                            boxShadow: '0 4px 18px rgba(167,139,250,0.50)',
                        }}
                    >
                        <svg viewBox="0 0 32 32" width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                            <line x1="16" y1="4" x2="16" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="16" cy="3.5" r="1.5" fill="white" opacity="0.9" />
                            <rect x="7" y="7" width="18" height="14" rx="4" fill="white" opacity="0.18" />
                            <rect x="7" y="7" width="18" height="14" rx="4" fill="none" stroke="white" strokeWidth="1.2" opacity="0.75" />
                            <circle cx="12" cy="13" r="2" fill="white" opacity="0.95" />
                            <circle cx="20" cy="13" r="2" fill="white" opacity="0.95" />
                            <circle cx="12.7" cy="12.3" r="0.6" fill="white" />
                            <circle cx="20.7" cy="12.3" r="0.6" fill="white" />
                            <text x="16" y="20" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="5.5" fontWeight="900" fill="white" opacity="0.95">?</text>
                            <rect x="13" y="21" width="6" height="2" rx="1" fill="white" opacity="0.5" />
                        </svg>
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span
                            style={{
                                fontWeight: 900,
                                fontSize: '1.15rem',
                                background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            GuessBot
                        </span>
                        <span
                            style={{
                                fontWeight: 600,
                                fontSize: '0.65rem',
                                color: '#b8aad8',
                                letterSpacing: '0.06em',
                                marginTop: '-2px',
                            }}
                        >
                            BLIND TEST · BETA
                        </span>
                    </div>
                </div>

                <nav className="flex items-center gap-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="px-5 py-2.5 rounded-2xl transition-all duration-200"
                                style={{
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    fontFamily: "'Nunito', sans-serif",
                                    color: isActive ? '#fff' : '#6b5fa0',
                                    background: isActive
                                        ? 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)'
                                        : 'rgba(255,255,255,0.50)',
                                    border: '1.5px solid rgba(255,255,255,0.70)',
                                    boxShadow: isActive ? '0 4px 18px rgba(167,139,250,0.40)' : 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                {item.emoji} {item.label}
                            </button>
                        );
                    })}

                    <div className="relative ml-2 flex items-center gap-2">
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#6b5fa0' }}>
                            {profile?.username || user?.email?.split('@')[0]}
                        </span>
                        <button
                            onClick={signOut}
                            className="px-3 py-2 rounded-xl transition-all duration-200"
                            style={{
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                color: '#9b8cc4',
                                background: 'rgba(255,255,255,0.40)',
                                border: '1px solid rgba(255,255,255,0.60)',
                                cursor: 'pointer',
                            }}
                        >
                            Sign out
                        </button>
                    </div>
                </nav>
            </header>

            {children}

            <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(180,160,220,0.30); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(167,139,250,0.50); }
      `}</style>
        </div>
    );
}
