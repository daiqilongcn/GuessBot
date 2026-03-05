import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface LoginPageProps {
    onSuccess?: () => void;
}

type PageMode = 'signin' | 'signup' | 'forgot';

// Google "G" logo SVG
function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 48 48" style={{ display: 'block', flexShrink: 0 }}>
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.6h12.7c-.6 3-2.3 5.5-4.8 7.2v6h7.7c4.5-4.1 7-10.2 7-17.3z" />
            <path fill="#34A853" d="M24 47c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.2 1.5-5 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-9.9H2.5v6.2C6.5 41.8 14.7 47 24 47z" />
            <path fill="#FBBC05" d="M10.5 27.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6v-6.2H2.5C.9 15.5 0 19.6 0 24s.9 8.5 2.5 11.8l8-6.2z" />
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.5 30.5 0 24 0 14.7 0 6.5 5.2 2.5 12.8l8 6.2c1.9-5.7 7.2-9.5 13.5-9.5z" />
        </svg>
    );
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
    const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
    const [mode, setMode] = useState<PageMode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const resetForm = (nextMode: PageMode) => {
        setMode(nextMode);
        setError('');
        setSuccessMsg('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (mode === 'signup') {
                const { error: err } = await signUp(email, password, username);
                if (err) setError(err.message);
                else setSuccessMsg('✅ Account created! Please check your email to verify, then sign in.');
            } else if (mode === 'signin') {
                const { error: err } = await signIn(email, password);
                if (err) setError(err.message);
                else onSuccess?.();
            } else if (mode === 'forgot') {
                const { error: err } = await resetPassword(email);
                if (err) setError(err.message);
                else setSuccessMsg('📬 Reset link sent! Please check your email inbox (and spam folder).');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError('');
        const { error: err } = await signInWithGoogle();
        if (err) {
            setError(err.message);
            setGoogleLoading(false);
        }
        // If no error, Supabase will redirect the browser — no need to setLoading(false)
    };

    const inputStyle: React.CSSProperties = {
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 600,
        fontSize: '0.9rem',
        color: '#4a3f6b',
        background: 'rgba(255,255,255,0.60)',
        border: '1.5px solid rgba(255,255,255,0.80)',
        caretColor: '#a78bfa',
    };

    const labelStyle: React.CSSProperties = {
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 700,
        fontSize: '0.82rem',
        color: '#6b5fa0',
    };

    const modeTitle =
        mode === 'signup' ? 'Create Account 🚀' :
            mode === 'forgot' ? 'Reset Password 🔑' :
                'Welcome Back 👋';

    const submitLabel =
        mode === 'signup' ? (loading ? 'Creating...' : 'Create Account') :
            mode === 'forgot' ? (loading ? 'Sending...' : 'Send Reset Link') :
                (loading ? 'Signing in...' : 'Sign In');

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                background:
                    'radial-gradient(ellipse at 15% 20%, #fbc2eb 0%, transparent 55%), radial-gradient(ellipse at 85% 10%, #a18cd1 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #a1c4fd 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, #ffecd2 0%, transparent 45%), linear-gradient(135deg, #fce4ec 0%, #ede7f6 40%, #e3f2fd 100%)',
            }}
        >
            <div className="w-full relative" style={{ maxWidth: '420px' }}>
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div
                        className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)',
                            boxShadow: '0 8px 32px rgba(167,139,250,0.50)',
                        }}
                    >
                        <svg viewBox="0 0 32 32" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                            {/* Antenna */}
                            <line x1="16" y1="4" x2="16" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="16" cy="3.5" r="1.5" fill="white" opacity="0.9" />
                            {/* Head */}
                            <rect x="7" y="7" width="18" height="14" rx="4" fill="white" opacity="0.18" />
                            <rect x="7" y="7" width="18" height="14" rx="4" fill="none" stroke="white" strokeWidth="1.2" opacity="0.75" />
                            {/* Eyes */}
                            <circle cx="12" cy="13" r="2" fill="white" opacity="0.95" />
                            <circle cx="20" cy="13" r="2" fill="white" opacity="0.95" />
                            <circle cx="12.7" cy="12.3" r="0.6" fill="white" />
                            <circle cx="20.7" cy="12.3" r="0.6" fill="white" />
                            {/* Question mark mouth */}
                            <text x="16" y="20" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="5.5" fontWeight="900" fill="white" opacity="0.95">?</text>
                            {/* Neck */}
                            <rect x="13" y="21" width="6" height="2" rx="1" fill="white" opacity="0.5" />
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

                {/* Card */}
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
                    {/* Tab switcher — only for signin / signup */}
                    {mode !== 'forgot' && (
                        <div
                            className="flex rounded-2xl p-1 mb-6"
                            style={{
                                background: 'rgba(255,255,255,0.35)',
                                border: '1px solid rgba(255,255,255,0.50)',
                            }}
                        >
                            {([
                                { key: 'signin', label: 'Sign In' },
                                { key: 'signup', label: 'Sign Up' },
                            ] as const).map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => resetForm(tab.key)}
                                    className="flex-1 py-2.5 rounded-xl transition-all duration-200"
                                    style={{
                                        fontFamily: "'Nunito', sans-serif",
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        color: mode === tab.key ? '#fff' : '#6b5fa0',
                                        background:
                                            mode === tab.key
                                                ? 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)'
                                                : 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: mode === tab.key ? '0 4px 16px rgba(167,139,250,0.40)' : 'none',
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Forgot password header */}
                    {mode === 'forgot' && (
                        <div className="mb-5">
                            <button
                                onClick={() => resetForm('signin')}
                                style={{
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    color: '#9b8cc4',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    marginBottom: '12px',
                                    padding: 0,
                                }}
                            >
                                ← Back to Sign In
                            </button>
                            <p
                                style={{
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 800,
                                    fontSize: '1.1rem',
                                    color: '#4a3f6b',
                                    marginBottom: '4px',
                                }}
                            >
                                {modeTitle}
                            </p>
                            <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: '0.80rem', color: '#9b8cc4' }}>
                                Enter your email and we'll send you a password reset link.
                            </p>
                        </div>
                    )}

                    {/* Google OAuth button — hidden until Google provider is configured in Supabase */}
                    {/* To re-enable: change false to (mode !== 'forgot') */}
                    {false && mode !== 'forgot' && (
                        <>
                            <button
                                id="google-signin-btn"
                                onClick={handleGoogleSignIn}
                                disabled={googleLoading}
                                className="w-full py-3 rounded-2xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3"
                                style={{
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 700,
                                    fontSize: '0.92rem',
                                    color: '#3c3558',
                                    background: 'rgba(255,255,255,0.82)',
                                    border: '1.5px solid rgba(200,180,240,0.50)',
                                    boxShadow: '0 2px 12px rgba(167,139,250,0.12)',
                                    cursor: googleLoading ? 'not-allowed' : 'pointer',
                                    opacity: googleLoading ? 0.7 : 1,
                                    marginBottom: '4px',
                                }}
                            >
                                {googleLoading ? (
                                    <div
                                        className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                                        style={{ borderColor: '#a78bfa', borderTopColor: 'transparent' }}
                                    />
                                ) : (
                                    <GoogleIcon />
                                )}
                                {googleLoading ? 'Redirecting...' : 'Continue with Google'}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 my-4">
                                <div style={{ flex: 1, height: '1px', background: 'rgba(167,139,250,0.20)' }} />
                                <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#b8aad8' }}>
                                    or continue with email
                                </span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(167,139,250,0.20)' }} />
                            </div>
                        </>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {mode === 'signup' && (
                            <div className="flex flex-col gap-1.5">
                                <label style={labelStyle}>👤 Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="w-full px-4 py-3 outline-none rounded-2xl"
                                    style={inputStyle}
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label style={labelStyle}>📧 Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email address"
                                required
                                className="w-full px-4 py-3 outline-none rounded-2xl"
                                style={inputStyle}
                            />
                        </div>

                        {mode !== 'forgot' && (
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label style={labelStyle}>🔐 Password</label>
                                    {mode === 'signin' && (
                                        <button
                                            type="button"
                                            onClick={() => resetForm('forgot')}
                                            style={{
                                                fontFamily: "'Nunito', sans-serif",
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                color: '#a78bfa',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: 0,
                                                textDecoration: 'underline',
                                                textUnderlineOffset: '2px',
                                            }}
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={mode === 'signup' ? 'Set password (at least 6 chars)' : 'Enter password'}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 outline-none rounded-2xl"
                                    style={inputStyle}
                                />
                            </div>
                        )}

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
                            id="email-submit-btn"
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
                            {submitLabel}
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
