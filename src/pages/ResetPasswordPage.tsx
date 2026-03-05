import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    useEffect(() => {
        // Supabase will automatically pick up the token from the URL hash
        // and establish a session. We listen for that event.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event) => {
                if (event === 'PASSWORD_RECOVERY') {
                    setSessionReady(true);
                }
            }
        );

        // Also check if session already exists (e.g. user navigated here manually)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSessionReady(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) {
                setError(updateError.message);
            } else {
                setSuccess(true);
                setTimeout(() => navigate('/'), 2000);
            }
        } finally {
            setLoading(false);
        }
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
                    <p
                        style={{
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            color: '#4a3f6b',
                            marginBottom: '4px',
                        }}
                    >
                        🔑 Set New Password
                    </p>
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: '0.80rem', color: '#9b8cc4', marginBottom: '20px' }}>
                        Enter your new password below.
                    </p>

                    {success ? (
                        <div
                            className="px-4 py-4 rounded-xl text-center"
                            style={{
                                background: 'rgba(52,211,153,0.15)',
                                border: '1px solid rgba(52,211,153,0.3)',
                                color: '#059669',
                                fontFamily: "'Nunito', sans-serif",
                                fontWeight: 700,
                                fontSize: '0.9rem',
                            }}
                        >
                            ✅ Password updated successfully! Redirecting...
                        </div>
                    ) : !sessionReady ? (
                        <div
                            className="px-4 py-4 rounded-xl text-center"
                            style={{
                                background: 'rgba(167,139,250,0.08)',
                                border: '1px solid rgba(167,139,250,0.15)',
                                color: '#6b5fa0',
                                fontFamily: "'Nunito', sans-serif",
                                fontWeight: 600,
                                fontSize: '0.85rem',
                            }}
                        >
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <div
                                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                                    style={{ borderColor: '#a78bfa', borderTopColor: 'transparent' }}
                                />
                                Verifying reset link...
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#9b8cc4' }}>
                                If this takes too long, the link may have expired.{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    style={{ color: '#a78bfa', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                                >
                                    Request a new one →
                                </button>
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label style={labelStyle}>🔐 New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password (at least 6 chars)"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 outline-none rounded-2xl"
                                    style={inputStyle}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label style={labelStyle}>🔐 Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 outline-none rounded-2xl"
                                    style={inputStyle}
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
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
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
                    <button
                        onClick={() => navigate('/login')}
                        style={{ color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
                    >
                        ← Back to Sign In
                    </button>
                </p>
            </div>
        </div>
    );
}
