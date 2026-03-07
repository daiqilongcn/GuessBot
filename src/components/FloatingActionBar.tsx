import React, { useState } from 'react';

interface FloatingActionBarProps {
    onSend: (text: string) => void;
    onVote: (vote: 'a' | 'b' | 'tie' | 'both_bad') => void;
    voted: string | null;
    onNewRound?: () => void;
    disabled?: boolean;
    voteDisabled?: boolean;
}

export function FloatingActionBar({ onSend, onVote, voted, onNewRound, disabled, voteDisabled }: FloatingActionBarProps) {
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (inputValue.trim() && !disabled) {
            onSend(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const voteButtons = [
        {
            key: 'a' as const,
            label: 'Model A',
            emoji: '🏆',
            color: 'rgba(167,139,250,1)',
            hoverBg: 'rgba(167,139,250,0.18)',
        },
        {
            key: 'b' as const,
            label: 'Model B',
            emoji: '🏆',
            color: 'rgba(96,165,250,1)',
            hoverBg: 'rgba(96,165,250,0.18)',
        },
        {
            key: 'tie' as const,
            label: 'Tie',
            emoji: '🤝',
            color: 'rgba(52,211,153,1)',
            hoverBg: 'rgba(52,211,153,0.18)',
        },
        {
            key: 'both_bad' as const,
            label: 'Both Bad',
            emoji: '👎',
            color: 'rgba(251,113,133,1)',
            hoverBg: 'rgba(251,113,133,0.18)',
        },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full px-4" style={{ maxWidth: '820px', zIndex: 50 }}>
            <div
                className="rounded-3xl px-5 py-4 flex flex-col gap-4"
                style={{
                    background: 'rgba(255, 255, 255, 0.30)',
                    backdropFilter: 'blur(32px)',
                    WebkitBackdropFilter: 'blur(32px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.60)',
                    boxShadow: '0 12px 56px 0 rgba(160, 120, 220, 0.18), 0 2px 16px 0 rgba(180, 160, 240, 0.12)',
                }}
            >
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Ask something to both models…"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={disabled}
                            className="w-full px-5 py-3 pr-12 outline-none"
                            style={{
                                fontFamily: "'Nunito', sans-serif",
                                fontWeight: 600,
                                fontSize: '0.93rem',
                                color: '#4a3f6b',
                                background: 'rgba(255,255,255,0.60)',
                                border: '1.5px solid rgba(255,255,255,0.80)',
                                borderRadius: '16px',
                                caretColor: '#a78bfa',
                                opacity: disabled ? 0.6 : 1,
                            }}
                        />
                        <span
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none"
                            style={{ opacity: 0.4 }}
                        >
                            💬
                        </span>
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={disabled}
                        className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-200 active:scale-95"
                        style={{
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)',
                            color: '#fff',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(167,139,250,0.45)',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.6 : 1,
                        }}
                    >
                        Send
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div style={{ flex: 1, height: '1px', background: 'rgba(180,160,230,0.25)' }} />
                    <span
                        style={{
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: '#b8aad8',
                            letterSpacing: '0.04em',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {voted ? '✅ VOTE CAST' : 'CAST YOUR VOTE'}
                    </span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(180,160,230,0.25)' }} />
                </div>

                {voted && onNewRound ? (
                    <button
                        onClick={onNewRound}
                        className="w-full py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98]"
                        style={{
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            background: 'linear-gradient(135deg, #34d399 0%, #60a5fa 100%)',
                            color: '#fff',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(52,211,153,0.40)',
                            cursor: 'pointer',
                        }}
                    >
                        🎯 New Round — Next Battle!
                    </button>
                ) : (
                    <div className="grid grid-cols-4 gap-3">
                        {voteButtons.map((btn) => {
                            const isVoted = voted === btn.key;
                            const isDisabled = Boolean(voted || voteDisabled);
                            return (
                                <button
                                    key={btn.key}
                                    onClick={() => !isDisabled && onVote(btn.key)}
                                    disabled={isDisabled}
                                    className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition-all duration-200 active:scale-95"
                                    style={{
                                        fontFamily: "'Nunito', sans-serif",
                                        fontWeight: 800,
                                        fontSize: '0.8rem',
                                        color: isVoted ? '#fff' : '#6b5fa0',
                                        background: isVoted ? btn.color : 'rgba(255,255,255,0.48)',
                                        border: isVoted
                                            ? `1.5px solid ${btn.color}`
                                            : '1.5px solid rgba(255,255,255,0.70)',
                                        boxShadow: isVoted ? `0 4px 18px 0 ${btn.color}55` : 'none',
                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        opacity: isDisabled && !isVoted ? 0.5 : 1,
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isDisabled && !isVoted) {
                                            const target = e.currentTarget as HTMLButtonElement;
                                            target.style.background = btn.hoverBg;
                                            target.style.transform = 'translateY(-2px)';
                                            target.style.boxShadow = `0 6px 20px 0 ${btn.color}33`;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isDisabled && !isVoted) {
                                            const target = e.currentTarget as HTMLButtonElement;
                                            target.style.background = 'rgba(255,255,255,0.48)';
                                            target.style.transform = 'translateY(0px)';
                                            target.style.boxShadow = 'none';
                                        }
                                    }}
                                >
                                    <span style={{ fontSize: '1.4rem' }}>{btn.emoji}</span>
                                    <span>{btn.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
