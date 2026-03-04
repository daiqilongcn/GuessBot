import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ModelRanking {
    id: string;
    display_name: string;
    model_id: string;
    elo_rating: number;
    total_battles: number;
    total_wins: number;
    provider_name: string;
}

export default function LeaderboardPage() {
    const [models, setModels] = useState<ModelRanking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        setLoading(true);
        const { data: modelsData } = await supabase
            .from('models')
            .select('id, display_name, model_id, elo_rating, total_battles, total_wins, provider_id')
            .eq('is_active', true)
            .order('elo_rating', { ascending: false });

        if (modelsData) {
            const providerIds = [...new Set(modelsData.map((m) => m.provider_id))];
            const { data: providers } = await supabase.from('providers').select('id, name').in('id', providerIds);
            const providerMap = new Map(providers?.map((p) => [p.id, p.name]) || []);

            const ranked: ModelRanking[] = modelsData.map((m) => ({
                id: m.id,
                display_name: m.display_name,
                model_id: m.model_id,
                elo_rating: m.elo_rating,
                total_battles: m.total_battles,
                total_wins: m.total_wins,
                provider_name: providerMap.get(m.provider_id) || 'Unknown',
            }));
            setModels(ranked);
        }
        setLoading(false);
    };

    const getWinRate = (wins: number, battles: number) => {
        if (battles === 0) return '—';
        return `${((wins / battles) * 100).toFixed(1)}%`;
    };

    const getRankBadge = (index: number) => {
        if (index === 0) {
            return {
                emoji: '🥇',
                bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                shadow: 'rgba(251,191,36,0.40)',
            };
        }
        if (index === 1) {
            return {
                emoji: '🥈',
                bg: 'linear-gradient(135deg, #9ca3af, #6b7280)',
                shadow: 'rgba(156,163,175,0.40)',
            };
        }
        if (index === 2) {
            return {
                emoji: '🥉',
                bg: 'linear-gradient(135deg, #d97706, #b45309)',
                shadow: 'rgba(217,119,6,0.40)',
            };
        }
        return null;
    };

    return (
        <div className="px-6 py-6 mx-auto" style={{ maxWidth: '900px' }}>
            <div className="mb-6">
                <h1 style={{ fontWeight: 900, fontSize: '1.4rem', color: '#4a3f6b' }}>🏅 Model Leaderboard</h1>
                <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#9b8cc4', marginTop: '4px' }}>
                    Real-time ELO rankings based on blind-vote results.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div
                        className="px-6 py-4 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.35)', color: '#9b8cc4', fontWeight: 700 }}
                    >
                        Loading...
                    </div>
                </div>
            ) : models.length === 0 ? (
                <div
                    className="flex flex-col items-center py-16 rounded-3xl"
                    style={{
                        background: 'rgba(255,255,255,0.22)',
                        backdropFilter: 'blur(20px)',
                        border: '1.5px solid rgba(255,255,255,0.55)',
                    }}
                >
                    <span style={{ fontSize: '3rem', marginBottom: '12px' }}>📊</span>
                    <p style={{ fontWeight: 700, color: '#6b5fa0' }}>No ranking data yet</p>
                    <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#9b8cc4' }}>
                        Add models and run battles to populate leaderboard.
                    </p>
                </div>
            ) : (
                <div
                    className="rounded-3xl overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.22)',
                        backdropFilter: 'blur(28px)',
                        border: '1.5px solid rgba(255,255,255,0.55)',
                        boxShadow: '0 8px 48px rgba(180,160,220,0.10)',
                    }}
                >
                    <div
                        className="grid px-6 py-3"
                        style={{
                            gridTemplateColumns: '50px 1.5fr 1fr 100px 100px 100px',
                            background: 'rgba(255,255,255,0.35)',
                            borderBottom: '1px solid rgba(255,255,255,0.45)',
                        }}
                    >
                        {['#', 'Model', 'Provider', 'ELO', 'Battles', 'Win Rate'].map((header) => (
                            <span
                                key={header}
                                style={{
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    color: '#9b8cc4',
                                    letterSpacing: '0.04em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {header}
                            </span>
                        ))}
                    </div>

                    {models.map((model, index) => {
                        const badge = getRankBadge(index);
                        return (
                            <div
                                key={model.id}
                                className="grid items-center px-6 py-4 transition-all duration-150"
                                style={{
                                    gridTemplateColumns: '50px 1.5fr 1fr 100px 100px 100px',
                                    borderBottom: '1px solid rgba(255,255,255,0.25)',
                                    background: index < 3 ? 'rgba(255,255,255,0.15)' : 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.30)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.background =
                                        index < 3 ? 'rgba(255,255,255,0.15)' : 'transparent';
                                }}
                            >
                                <span style={{ fontWeight: 800, fontSize: badge ? '1.2rem' : '0.9rem', color: '#6b5fa0' }}>
                                    {badge ? badge.emoji : index + 1}
                                </span>
                                <div className="flex flex-col">
                                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#4a3f6b' }}>
                                        {model.display_name}
                                    </span>
                                    <span style={{ fontWeight: 600, fontSize: '0.7rem', color: '#b8aad8' }}>
                                        {model.model_id}
                                    </span>
                                </div>
                                <span
                                    className="px-3 py-1 rounded-full w-fit"
                                    style={{
                                        fontWeight: 700,
                                        fontSize: '0.72rem',
                                        color: '#6b5fa0',
                                        background: 'rgba(167,139,250,0.10)',
                                    }}
                                >
                                    {model.provider_name}
                                </span>
                                <span style={{ fontWeight: 900, fontSize: '1rem', color: '#4a3f6b' }}>
                                    {model.elo_rating}
                                </span>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#6b5fa0' }}>
                                    {model.total_battles}
                                </span>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#059669' }}>
                                    {getWinRate(model.total_wins, model.total_battles)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
