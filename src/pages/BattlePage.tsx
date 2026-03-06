import React, { useCallback, useEffect, useState } from 'react';
import { ChatPanel, Message } from '../components/ChatPanel';
import { FloatingActionBar } from '../components/FloatingActionBar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Json } from '../lib/types';

interface ModelInfo {
    id: string;
    model_id: string;
    display_name: string;
    provider_id: string;
}

interface ChatRequestMessage {
    role: 'user' | 'assistant';
    content: string;
}

function serializeMessages(messages: Message[]): Json[] {
    return messages.map((message) => ({
        id: message.id,
        role: message.role,
        text: message.text,
        time: message.time,
    }));
}

export default function BattlePage() {
    const { user } = useAuth();
    const [messagesA, setMessagesA] = useState<Message[]>([]);
    const [messagesB, setMessagesB] = useState<Message[]>([]);
    const [voted, setVoted] = useState<string | null>(null);
    const [showVoteToast, setShowVoteToast] = useState(false);
    const [voteLabel, setVoteLabel] = useState('');
    const [modelA, setModelA] = useState<ModelInfo | null>(null);
    const [modelB, setModelB] = useState<ModelInfo | null>(null);
    const [battleId, setBattleId] = useState<string | null>(null);
    const [round, setRound] = useState(1);
    const [isStreaming, setIsStreaming] = useState(false);
    const [noModels, setNoModels] = useState(false);

    const initBattle = useCallback(async () => {
        const { data: models, error } = await supabase
            .from('models')
            .select('id, model_id, display_name, provider_id')
            .eq('is_active', true);

        if (error) {
            console.error('Failed to load models:', error);
            setNoModels(true);
            return;
        }

        if (!models || models.length < 2) {
            setNoModels(true);
            return;
        }

        setNoModels(false);
        const shuffled = [...models].sort(() => Math.random() - 0.5);
        const first = shuffled[0];
        const second = shuffled[1];

        if (Math.random() > 0.5) {
            setModelA(first);
            setModelB(second);
        } else {
            setModelA(second);
            setModelB(first);
        }

        setMessagesA([]);
        setMessagesB([]);
        setVoted(null);
        setBattleId(null);
    }, []);

    useEffect(() => {
        initBattle();
    }, [initBattle]);

    const callAI = async (modelId: string, messages: ChatRequestMessage[]): Promise<string> => {
        const { data, error } = await supabase.functions.invoke('chat-proxy', {
            body: { model_id: modelId, messages },
        });

        if (error) {
            const errorText = error.context ? await error.context.text() : '';
            throw new Error(errorText || error.message || 'Failed to invoke chat-proxy');
        }

        if (typeof data?.content !== 'string' || data.content.length === 0) {
            throw new Error('Invalid AI response payload');
        }

        return data.content;
    };

    const handleSend = async (text: string) => {
        if (!modelA || !modelB || !user || isStreaming) return;

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timestamp = now.getTime();

        const userMsg: Message = {
            id: timestamp,
            role: 'user',
            text,
            time: timeStr,
        };

        const newMessagesA = [...messagesA, userMsg];
        const newMessagesB = [...messagesB, userMsg];
        setMessagesA(newMessagesA);
        setMessagesB(newMessagesB);
        setIsStreaming(true);

        let currentBattleId = battleId;
        if (!currentBattleId) {
            const { data: battle, error: battleError } = await supabase
                .from('battles')
                .insert({
                    user_id: user.id,
                    model_a_id: modelA.id,
                    model_b_id: modelB.id,
                    messages: [],
                })
                .select()
                .single();

            if (battleError) {
                console.error('Failed to create battle:', battleError);
            } else if (battle) {
                currentBattleId = battle.id;
                setBattleId(battle.id);
            }
        }

        // Build full conversation history for each model (both user and AI messages)
        const historyA: ChatRequestMessage[] = newMessagesA.map((msg) => ({
            role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.text,
        }));
        const historyB: ChatRequestMessage[] = newMessagesB.map((msg) => ({
            role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.text,
        }));

        try {
            const [resultA, resultB] = await Promise.allSettled([
                callAI(modelA.model_id, historyA),
                callAI(modelB.model_id, historyB),
            ]);

            const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const defaultErrorText = 'Request failed. Please retry later and check provider configuration.';

            const msgA: Message = {
                id: timestamp + 1,
                role: 'ai',
                text: resultA.status === 'fulfilled' ? resultA.value : defaultErrorText,
                time: responseTime,
            };

            const msgB: Message = {
                id: timestamp + 2,
                role: 'ai',
                text: resultB.status === 'fulfilled' ? resultB.value : defaultErrorText,
                time: responseTime,
            };

            if (resultA.status === 'rejected') {
                console.error('AI call failed for model A:', resultA.reason);
            }

            if (resultB.status === 'rejected') {
                console.error('AI call failed for model B:', resultB.reason);
            }

            const nextMessagesA = [...newMessagesA, msgA];
            const nextMessagesB = [...newMessagesB, msgB];
            setMessagesA(nextMessagesA);
            setMessagesB(nextMessagesB);

            if (currentBattleId) {
                const allMessages: Json = {
                    a: serializeMessages(nextMessagesA),
                    b: serializeMessages(nextMessagesB),
                };
                const { error: updateError } = await supabase
                    .from('battles')
                    .update({ messages: allMessages })
                    .eq('id', currentBattleId);
                if (updateError) {
                    console.error('Failed to save battle messages:', updateError);
                }
            }
        } catch (error) {
            console.error('Unexpected AI call failure:', error);
            const errorTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const errorText = 'Request failed. Please retry later and check provider configuration.';
            setMessagesA((prev) => [...prev, { id: timestamp + 3, role: 'ai', text: errorText, time: errorTime }]);
            setMessagesB((prev) => [...prev, { id: timestamp + 4, role: 'ai', text: errorText, time: errorTime }]);
        } finally {
            setIsStreaming(false);
        }
    };

    const voteLabels: Record<string, string> = {
        a: 'Model A',
        b: 'Model B',
        tie: 'Tie',
        both_bad: 'Both Bad',
    };

    const handleVote = async (vote: 'a' | 'b' | 'tie' | 'both_bad') => {
        if (!battleId || !user || voted) return;

        setVoted(vote);
        setVoteLabel(voteLabels[vote]);
        setShowVoteToast(true);
        setTimeout(() => setShowVoteToast(false), 2800);

        const { error } = await supabase.from('votes').insert({
            battle_id: battleId,
            user_id: user.id,
            winner: vote,
        });

        if (error) {
            console.error('Failed to save vote:', error);
            setVoted(null);
            setShowVoteToast(false);
        }
    };

    const handleNewRound = () => {
        setRound((currentRound) => currentRound + 1);
        void initBattle();
    };

    if (noModels) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
                <div
                    className="px-8 py-8 rounded-3xl text-center"
                    style={{
                        background: 'rgba(255,255,255,0.28)',
                        backdropFilter: 'blur(28px)',
                        border: '1.5px solid rgba(255,255,255,0.55)',
                        boxShadow: '0 8px 48px rgba(180,160,220,0.13)',
                        maxWidth: '420px',
                    }}
                >
                    <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#4a3f6b', margin: '12px 0 8px' }}>
                        No available models
                    </h2>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#9b8cc4', lineHeight: 1.6 }}>
                        Add and enable at least two models in the Admin page to start blind battles.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-center pt-5 pb-2 px-4 gap-4">
                <div
                    className="flex items-center gap-3 px-5 py-2.5 rounded-2xl"
                    style={{
                        background: 'rgba(255,255,255,0.35)',
                        backdropFilter: 'blur(16px)',
                        border: '1.5px solid rgba(255,255,255,0.60)',
                        boxShadow: '0 4px 18px rgba(180,160,220,0.12)',
                    }}
                >
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#6b5fa0' }}>Round {round}</span>
                </div>
                {voted && modelA && modelB && (
                    <div
                        className="flex items-center gap-3 px-5 py-2.5 rounded-2xl"
                        style={{
                            background: 'rgba(52,211,153,0.12)',
                            backdropFilter: 'blur(16px)',
                            border: '1.5px solid rgba(52,211,153,0.30)',
                        }}
                    >
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#059669' }}>
                            A: {modelA.display_name} vs B: {modelB.display_name}
                        </span>
                    </div>
                )}
            </div>

            <main
                className="flex gap-5 px-5 py-4 mx-auto"
                style={{
                    maxWidth: '1200px',
                    height: 'calc(100vh - 200px)',
                    paddingBottom: '220px',
                }}
            >
                <div className="flex-1 flex flex-col gap-3 min-w-0">
                    <ChatPanel
                        label="Model A"
                        badge="Identity hidden"
                        messages={messagesA}
                        accentColor="linear-gradient(135deg, #a78bfa, #818cf8)"
                        accentShadow="rgba(167,139,250,0.40)"
                        revealedModel={voted ? modelA?.display_name : null}
                        isStreaming={isStreaming}
                    />
                </div>

                <div className="flex flex-col items-center justify-center gap-3 shrink-0" style={{ paddingBottom: '40px' }}>
                    <div className="w-px flex-1 rounded-full" style={{ background: 'rgba(180,160,220,0.25)' }} />
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                            background: 'rgba(255,255,255,0.55)',
                            border: '1.5px solid rgba(255,255,255,0.80)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 16px rgba(180,160,220,0.15)',
                            fontWeight: 900,
                            fontSize: '0.7rem',
                            color: '#9b8cc4',
                            letterSpacing: '0.04em',
                        }}
                    >
                        VS
                    </div>
                    <div className="w-px flex-1 rounded-full" style={{ background: 'rgba(180,160,220,0.25)' }} />
                </div>

                <div className="flex-1 flex flex-col gap-3 min-w-0">
                    <ChatPanel
                        label="Model B"
                        badge="Identity hidden"
                        messages={messagesB}
                        accentColor="linear-gradient(135deg, #60a5fa, #34d399)"
                        accentShadow="rgba(96,165,250,0.40)"
                        revealedModel={voted ? modelB?.display_name : null}
                        isStreaming={isStreaming}
                    />
                </div>
            </main>

            <FloatingActionBar
                onSend={handleSend}
                onVote={handleVote}
                voted={voted}
                onNewRound={handleNewRound}
                disabled={isStreaming}
            />

            <div
                className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-6 py-3 rounded-2xl transition-all duration-500"
                style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#4a3f6b',
                    background: 'rgba(255,255,255,0.80)',
                    backdropFilter: 'blur(20px)',
                    border: '1.5px solid rgba(255,255,255,0.90)',
                    boxShadow: '0 8px 32px rgba(167,139,250,0.25)',
                    opacity: showVoteToast ? 1 : 0,
                    transform: showVoteToast
                        ? 'translateX(-50%) translateY(0px)'
                        : 'translateX(-50%) translateY(-14px)',
                    pointerEvents: 'none',
                }}
            >
                <span style={{ fontSize: '1.1rem' }}>✅</span>
                Vote cast for <strong>{voteLabel}</strong> — thanks!
            </div>
        </>
    );
}
