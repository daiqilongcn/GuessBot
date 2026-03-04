import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface LoginPageProps {
    onSuccess?: () => void;
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
    const { signIn, signUp } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (isSignUp) {
                const { error: err } = await signUp(email, password, username);
                if (err) {
                    setError(err.message);
                } else {
                    setSuccessMsg('Sign up successful. Check your email for verification.');
                }
            } else {
                const { error: err } = await signIn(email, password);
                if (err) {
                    setError(err.message);
                } else {
                    onSuccess?.();
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                background:
                    'radial-gradient(ellipse at 15% 20%, #fbc2eb 0%, transparent 55%), radial-gradient(ellipse at 85% 10%, #a18cd1 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #a1c4fd 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, #ffecd2 0%, transparent 45%), linear-gradient(135deg, #fce4ec 0%, #ede7f6 40%, #e3f2fd 100%)',
            }}
        >
            <div className="w-full relative" style={{ maxWidth: '420px' }}>
                <div className="flex flex-col items-center mb-8">
                    <div
                        className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
                        style={{
                            background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)',
                            boxShadow: '0 8px 32px rgba(167,139,250,0.50)',
                        }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M9 3H5C3.9 3 3 3.9 3 5v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 6H5V5h4v4zm10-6h-4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 6h-4V5h4v4zM9 13H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zm0 6H5v-4h4v4zm10-6h-4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zm0 6h-4v-4h4v4z"
                                fill="white"
                            />
                        </svg>
                    </div>
                    <span
                        style={{
                            fontWeight: 900,
                            fontSize: '1.6rem',
                            background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        GuessBot
                    </span>
                    <span
                        style={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            color: '#b8aad8',
                            letterSpacing: '0.08em',
                            marginTop: '2px',
                        }}
                    >
                        AI BLIND TEST ARENA
                    </span>
                </div>

                <div
                    className="rounded-3xl px-8 py-8"
                    style={{
                        background: 'rgba(255, 255, 255, 0.28)',
                        backdropFilter: 'blur(28px)',
                        WebkitBackdropFilter: 'blur(28px)',
                        border: '1.5px solid rgba(255, 255, 255, 0.55)',
                        boxShadow: '0 8px 48px 0 rgba(180, 160, 220, 0.18), 0 2px 16px 0 rgba(180, 160, 220, 0.10)',
                    }}
                >
                    <div
                        className="flex rounded-2xl p-1 mb-6"
                        style={{
                            background: 'rgba(255,255,255,0.35)',
                            border: '1px solid rgba(255,255,255,0.50)',
                        }}
                    >
                        {[
                            { key: false, label: 'Sign In' },
                            { key: true, label: 'Sign Up' },
                        ].map((tab) => (
                            <button
                                key={String(tab.key)}
                                onClick={() => {
                                    setIsSignUp(tab.key);
                                    setError('');
                                    setSuccessMsg('');
                                }}
                                className="flex-1 py-2.5 rounded-xl transition-all duration-200"
                                style={{
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    color: isSignUp === tab.key ? '#fff' : '#6b5fa0',
                                    background:
                                        isSignUp === tab.key
                                            ? 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)'
                                            : 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: isSignUp === tab.key ? '0 4px 16px rgba(167,139,250,0.40)' : 'none',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {isSignUp && (
                            <div className="flex flex-col gap-1.5">
                                <label
                                    style={{
                                        fontFamily: "'Nunito', sans-serif",
                                        fontWeight: 700,
                                        fontSize: '0.82rem',
                                        color: '#6b5fa0',
                                    }}
                                >
                                    👤 Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="w-full px-4 py-3 outline-none rounded-2xl"
                                    style={{
                                        fontFamily: "'Nunito', sans-serif",
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        color: '#4a3f6b',
                                        background: 'rgba(255,255,255,0.60)',
                                        border: '1.5px solid rgba(255,255,255,0.80)',
                                        caretColor: '#a78bfa',
                                    }}
                                />
                            </div>
                        )}
                        <div className="flex flex-col gap-1.5">
                            <label
                                style={{
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    color: '#6b5fa0',
                                }}
                            >
                                📧 Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email address"
                                required
                                className="w-full px-4 py-3 outline-none rounded-2xl"
                                style={{
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    color: '#4a3f6b',
                                    background: 'rgba(255,255,255,0.60)',
                                    border: '1.5px solid rgba(255,255,255,0.80)',
                                    caretColor: '#a78bfa',
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label
                                style={{
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    color: '#6b5fa0',
                                }}
                            >
                                🔐 Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={isSignUp ? 'Set password (at least 6 chars)' : 'Enter password'}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 outline-none rounded-2xl"
                                style={{
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    color: '#4a3f6b',
                                    background: 'rgba(255,255,255,0.60)',
                                    border: '1.5px solid rgba(255,255,255,0.80)',
                                    caretColor: '#a78bfa',
                                }}
                            />
                        </div>

                        {error && (
                            <div
                                className="px-4 py-3 rounded-xl"
                                style={{
                                    background: 'rgba(251,113,133,0.15)',
                                    border: '1px solid rgba(251,113,133,0.3)',
                                    color: '#e11d48',
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 600,
                                    fontSize: '0.82rem',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {successMsg && (
                            <div
                                className="px-4 py-3 rounded-xl"
                                style={{
                                    background: 'rgba(52,211,153,0.15)',
                                    border: '1px solid rgba(52,211,153,0.3)',
                                    color: '#059669',
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 600,
                                    fontSize: '0.82rem',
                                }}
                            >
                                {successMsg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98]"
                            style={{
                                fontFamily: "'Nunito', sans-serif",
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)',
                                color: '#fff',
                                border: 'none',
                                boxShadow: '0 4px 20px rgba(167,139,250,0.45)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? 'Processing...' : isSignUp ? 'Create account 🚀' : 'Sign in ✅'}
                        </button>
                    </form>
                </div>

                <p
                    className="text-center mt-6"
                    style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        color: '#9b8cc4',
                    }}
                >
                    Blind test two hidden AI models and vote for your favorite response.
                </p>
            </div>
        </div>
    );
}
