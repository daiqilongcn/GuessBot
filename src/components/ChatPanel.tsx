import React, { useEffect, useRef } from 'react';

export interface Message {
    id: number;
    role: 'user' | 'ai';
    text: string;
    time: string;
}

interface ChatPanelProps {
    label: string;
    badge?: string;
    messages: Message[];
    accentColor: string;
    accentShadow?: string;
    revealedModel?: string | null;
    isStreaming?: boolean;
}

export function ChatPanel({
    label,
    badge,
    messages,
    accentColor,
    accentShadow = 'rgba(167,139,250,0.4)',
    revealedModel,
    isStreaming,
}: ChatPanelProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div
            className="flex flex-col h-full rounded-3xl overflow-hidden relative"
            style={{
                background: 'rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: '1.5px solid rgba(255, 255, 255, 0.55)',
                boxShadow: '0 8px 48px 0 rgba(180, 160, 220, 0.13), 0 2px 16px 0 rgba(180, 160, 220, 0.10)',
            }}
        >
            <div
                className="flex items-center gap-3 px-6 py-4 shrink-0"
                style={{
                    background: 'rgba(255,255,255,0.30)',
                    borderBottom: '1px solid rgba(255,255,255,0.45)',
                }}
            >
                <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0"
                    style={{
                        background: accentColor,
                        boxShadow: `0 4px 16px 0 ${accentShadow}`,
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#4a3f6b' }}>
                        {revealedModel ? `✅ ${revealedModel}` : label}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.72rem', color: '#9b8cc4' }}>
                        {revealedModel ? 'Identity revealed' : badge || 'Identity hidden'}
                    </span>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: '#7ee8a2', boxShadow: '0 0 6px #7ee8a2cc' }}
                    />
                    <span style={{ fontWeight: 600, fontSize: '0.75rem', color: '#7ee8a2' }}>Online</span>
                </div>
            </div>

            <div
                className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(180,160,220,0.25) transparent' }}
            >
                {messages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#b8aad8', textAlign: 'center' }}>
                            💬 Send a prompt to start the battle
                        </p>
                    </div>
                )}
                {messages.map((msg) =>
                    msg.role === 'user' ? (
                        <div key={msg.id} className="flex flex-col items-end gap-1">
                            <div
                                className="max-w-[78%] px-4 py-3 rounded-[20px] rounded-tr-[6px]"
                                style={{
                                    background: accentColor,
                                    boxShadow: `0 4px 16px 0 ${accentShadow}`,
                                    color: '#fff',
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    lineHeight: 1.55,
                                }}
                            >
                                {msg.text}
                            </div>
                            <span
                                style={{
                                    fontSize: '0.68rem',
                                    color: '#b8aad8',
                                    fontWeight: 500,
                                    paddingRight: '4px',
                                }}
                            >
                                {msg.time} · You
                            </span>
                        </div>
                    ) : (
                        <div key={msg.id} className="flex flex-col items-start gap-1">
                            <div
                                className="max-w-[78%] px-4 py-3 rounded-[20px] rounded-tl-[6px]"
                                style={{
                                    background: 'rgba(255,255,255,0.72)',
                                    border: '1px solid rgba(255,255,255,0.85)',
                                    color: '#4a3f6b',
                                    fontFamily: "'Nunito', sans-serif",
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    lineHeight: 1.55,
                                }}
                            >
                                {msg.text}
                            </div>
                            <span
                                style={{
                                    fontSize: '0.68rem',
                                    color: '#b8aad8',
                                    fontWeight: 500,
                                    paddingLeft: '4px',
                                }}
                            >
                                {msg.time} · AI
                            </span>
                        </div>
                    )
                )}

                {isStreaming && (
                    <div className="flex items-start gap-1.5 pl-1">
                        <div
                            className="px-4 py-3 rounded-[20px] rounded-tl-[6px] flex items-center gap-1.5"
                            style={{
                                background: 'rgba(255,255,255,0.72)',
                                border: '1px solid rgba(255,255,255,0.85)',
                            }}
                        >
                            {[0, 1, 2].map((i) => (
                                <span
                                    key={i}
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                        background: '#c4b5e8',
                                        animation: `typing-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                                        display: 'inline-block',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
