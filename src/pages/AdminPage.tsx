import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Tables } from '../lib/types';

type Provider = Tables<'providers'>;
type Model = Tables<'models'>;

interface ProviderWithModels extends Provider {
    models: Model[];
}

const PROVIDER_PRESETS = [
    {
        name: 'OpenAI',
        base_url: 'https://api.openai.com/v1',
        api_format: 'openai',
        models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o', 'gpt-4o-mini', 'o3', 'o3-mini', 'o4-mini'],
    },
    {
        name: 'Anthropic',
        base_url: 'https://api.anthropic.com',
        api_format: 'anthropic',
        models: ['claude-sonnet-4-20250514', 'claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    },
    {
        name: 'Google Gemini',
        base_url: 'https://generativelanguage.googleapis.com/v1beta',
        api_format: 'gemini',
        models: ['gemini-2.5-pro-preview-06-05', 'gemini-2.5-flash-preview-05-20', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'],
    },
    {
        name: 'Google Gemini (OpenAI Compatible)',
        base_url: 'https://generativelanguage.googleapis.com/v1beta/openai',
        api_format: 'openai',
        models: ['gemini-2.5-pro-preview-06-05', 'gemini-2.5-flash-preview-05-20', 'gemini-2.0-flash'],
    },
    {
        name: 'DeepSeek',
        base_url: 'https://api.deepseek.com/v1',
        api_format: 'openai',
        models: ['deepseek-chat', 'deepseek-reasoner'],
    },
    {
        name: 'Qwen (DashScope)',
        base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        api_format: 'openai',
        models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwq-plus'],
    },
    {
        name: 'Doubao',
        base_url: 'https://ark.cn-beijing.volces.com/api/v3',
        api_format: 'openai',
        models: ['doubao-pro-32k', 'doubao-lite-32k'],
    },
    { name: 'Custom', base_url: '', api_format: 'openai', models: [] },
];

export default function AdminPage() {
    const { isAdmin } = useAuth();
    const [providers, setProviders] = useState<ProviderWithModels[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddProvider, setShowAddProvider] = useState(false);
    const [newModelId, setNewModelId] = useState('');
    const [newModelName, setNewModelName] = useState('');
    const [addingModelTo, setAddingModelTo] = useState<string | null>(null);

    // For editing model display name inline
    const [editingModelId, setEditingModelId] = useState<string | null>(null);
    const [editingModelName, setEditingModelName] = useState('');

    const [selectedPreset, setSelectedPreset] = useState(0);
    const [newProvider, setNewProvider] = useState({
        name: '',
        base_url: '',
        api_key: '',
        api_format: 'openai',
    });

    // Track which preset models are selected & custom models added during provider creation
    const [selectedPresetModels, setSelectedPresetModels] = useState<Set<string>>(new Set());
    const [customModelsToAdd, setCustomModelsToAdd] = useState<{ model_id: string; display_name: string }[]>([]);
    const [customModelInput, setCustomModelInput] = useState('');

    useEffect(() => {
        void fetchProviders();
    }, []);

    const fetchProviders = async () => {
        setLoading(true);
        const { data: providerData } = await supabase.from('providers').select('*').order('created_at', { ascending: true });

        if (providerData) {
            const withModels: ProviderWithModels[] = [];
            for (const provider of providerData) {
                const { data: modelData } = await supabase
                    .from('models')
                    .select('*')
                    .eq('provider_id', provider.id)
                    .order('created_at', { ascending: true });

                withModels.push({ ...provider, models: modelData || [] });
            }
            setProviders(withModels);
        }

        setLoading(false);
    };

    const handleAddProvider = async () => {
        if (!newProvider.name || !newProvider.base_url || !newProvider.api_key) return;

        const { data: provider, error } = await supabase
            .from('providers')
            .insert({
                name: newProvider.name,
                base_url: newProvider.base_url,
                api_key: newProvider.api_key,
                api_format: newProvider.api_format,
            })
            .select()
            .single();

        if (error) {
            alert(`Failed to add provider: ${error.message}`);
            return;
        }

        if (provider) {
            // Collect selected preset models
            const modelsToInsert: { provider_id: string; model_id: string; display_name: string }[] = [];
            for (const modelId of selectedPresetModels) {
                modelsToInsert.push({
                    provider_id: provider.id,
                    model_id: modelId,
                    display_name: modelId,
                });
            }
            // Add custom models
            for (const cm of customModelsToAdd) {
                modelsToInsert.push({
                    provider_id: provider.id,
                    model_id: cm.model_id,
                    display_name: cm.display_name || cm.model_id,
                });
            }
            if (modelsToInsert.length > 0) {
                await supabase.from('models').insert(modelsToInsert);
            }
        }

        setShowAddProvider(false);
        setNewProvider({ name: '', base_url: '', api_key: '', api_format: 'openai' });
        setSelectedPresetModels(new Set());
        setCustomModelsToAdd([]);
        setCustomModelInput('');
        void fetchProviders();
    };

    const handleDeleteProvider = async (id: string) => {
        if (!confirm('Delete this provider and all its models?')) return;
        const { error } = await supabase.from('providers').delete().eq('id', id);
        if (error) {
            alert(`Failed to delete provider: ${error.message}`);
            return;
        }
        void fetchProviders();
    };

    const handleToggleProvider = async (id: string, currentActive: boolean) => {
        await supabase.from('providers').update({ is_active: !currentActive }).eq('id', id);
        void fetchProviders();
    };

    const handleToggleModel = async (id: string, currentActive: boolean) => {
        await supabase.from('models').update({ is_active: !currentActive }).eq('id', id);
        void fetchProviders();
    };

    const handleAddModel = async (providerId: string) => {
        if (!newModelId.trim()) return;
        await supabase.from('models').insert({
            provider_id: providerId,
            model_id: newModelId.trim(),
            display_name: newModelName.trim() || newModelId.trim(),
        });
        setNewModelId('');
        setNewModelName('');
        setAddingModelTo(null);
        void fetchProviders();
    };

    const handleRenameModel = async (modelId: string) => {
        if (!editingModelName.trim()) {
            setEditingModelId(null);
            return;
        }
        const { error } = await supabase
            .from('models')
            .update({ display_name: editingModelName.trim() })
            .eq('id', modelId);
        if (error) {
            alert(`Failed to rename model: ${error.message}`);
        }
        setEditingModelId(null);
        setEditingModelName('');
        void fetchProviders();
    };

    const handleDeleteModel = async (id: string) => {
        if (!confirm('Delete this model?')) return;
        const { error } = await supabase.from('models').delete().eq('id', id);
        if (error) {
            alert(`Failed to delete model: ${error.message}`);
            return;
        }
        void fetchProviders();
    };

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
                <div
                    className="px-8 py-6 rounded-3xl text-center"
                    style={{
                        background: 'rgba(255,255,255,0.28)',
                        backdropFilter: 'blur(28px)',
                        border: '1.5px solid rgba(255,255,255,0.55)',
                        boxShadow: '0 8px 48px rgba(180,160,220,0.13)',
                    }}
                >
                    <span style={{ fontSize: '2.5rem' }}>🔐</span>
                    <p style={{ fontWeight: 700, color: '#6b5fa0', marginTop: '12px' }}>
                        Admin access required for this page.
                    </p>
                </div>
            </div>
        );
    }

    const inputStyle: React.CSSProperties = {
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 600,
        fontSize: '0.85rem',
        color: '#4a3f6b',
        background: 'rgba(255,255,255,0.60)',
        border: '1.5px solid rgba(255,255,255,0.80)',
        borderRadius: '12px',
        padding: '10px 14px',
        outline: 'none',
        width: '100%',
        caretColor: '#a78bfa',
    };

    const labelStyle: React.CSSProperties = {
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 700,
        fontSize: '0.78rem',
        color: '#6b5fa0',
    };

    return (
        <div className="px-6 py-6 mx-auto" style={{ maxWidth: '900px' }}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1
                        style={{
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 900,
                            fontSize: '1.4rem',
                            color: '#4a3f6b',
                        }}
                    >
                        ⚙️ AI Provider Management
                    </h1>
                    <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#9b8cc4', marginTop: '4px' }}>
                        Configure providers, API keys, and model availability.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowAddProvider(true);
                        setSelectedPreset(0);
                        const preset = PROVIDER_PRESETS[0];
                        setNewProvider({
                            name: preset.name,
                            base_url: preset.base_url,
                            api_key: '',
                            api_format: preset.api_format,
                        });
                        setSelectedPresetModels(new Set(preset.models));
                        setCustomModelsToAdd([]);
                        setCustomModelInput('');
                    }}
                    className="px-5 py-2.5 rounded-2xl transition-all duration-200 active:scale-95"
                    style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #60a5fa 100%)',
                        color: '#fff',
                        border: 'none',
                        boxShadow: '0 4px 18px rgba(167,139,250,0.45)',
                        cursor: 'pointer',
                    }}
                >
                    + Add Provider
                </button>
            </div>

            {showAddProvider && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
                    onClick={(e) => e.target === e.currentTarget && setShowAddProvider(false)}
                >
                    <div
                        className="w-full rounded-3xl px-7 py-6"
                        style={{
                            maxWidth: '520px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            background: 'rgba(255,255,255,0.92)',
                            backdropFilter: 'blur(28px)',
                            border: '1.5px solid rgba(255,255,255,0.55)',
                            boxShadow: '0 12px 56px rgba(160,120,220,0.25)',
                        }}
                    >
                        <h2 style={{ fontWeight: 900, fontSize: '1.1rem', color: '#4a3f6b', marginBottom: '16px' }}>
                            🚀 Add New Provider
                        </h2>

                        <div className="mb-4">
                            <label style={labelStyle}>Choose preset</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {PROVIDER_PRESETS.map((preset, i) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => {
                                            setSelectedPreset(i);
                                            setNewProvider({
                                                name: preset.name,
                                                base_url: preset.base_url,
                                                api_key: newProvider.api_key,
                                                api_format: preset.api_format,
                                            });
                                            setSelectedPresetModels(new Set(preset.models));
                                            setCustomModelsToAdd([]);
                                            setCustomModelInput('');
                                        }}
                                        className="px-3 py-1.5 rounded-xl transition-all duration-150"
                                        style={{
                                            fontFamily: "'Nunito', sans-serif",
                                            fontWeight: 700,
                                            fontSize: '0.78rem',
                                            color: selectedPreset === i ? '#fff' : '#6b5fa0',
                                            background:
                                                selectedPreset === i
                                                    ? 'linear-gradient(135deg, #a78bfa, #818cf8)'
                                                    : 'rgba(167,139,250,0.10)',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div>
                                <label style={labelStyle}>Provider name</label>
                                <input
                                    style={inputStyle}
                                    value={newProvider.name}
                                    onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                                    placeholder="e.g. OpenAI"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>API Base URL</label>
                                <input
                                    style={inputStyle}
                                    value={newProvider.base_url}
                                    onChange={(e) => setNewProvider({ ...newProvider, base_url: e.target.value })}
                                    placeholder="e.g. https://api.openai.com/v1"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>API Key</label>
                                <input
                                    style={inputStyle}
                                    type="password"
                                    value={newProvider.api_key}
                                    onChange={(e) => setNewProvider({ ...newProvider, api_key: e.target.value })}
                                    placeholder="Enter API key"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>API format</label>
                                <select
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                    value={newProvider.api_format}
                                    onChange={(e) => setNewProvider({ ...newProvider, api_format: e.target.value })}
                                >
                                    <option value="openai">OpenAI compatible</option>
                                    <option value="anthropic">Anthropic format</option>
                                    <option value="gemini">Google Gemini native</option>
                                </select>
                            </div>

                            {/* Preset models - toggleable */}
                            {PROVIDER_PRESETS[selectedPreset].models.length > 0 && (
                                <div
                                    className="px-4 py-3 rounded-xl"
                                    style={{
                                        background: 'rgba(167,139,250,0.08)',
                                        border: '1px solid rgba(167,139,250,0.15)',
                                    }}
                                >
                                    <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                                        <p style={{ ...labelStyle, marginBottom: 0 }}>📦 Preset models (click to toggle)</p>
                                        <button
                                            onClick={() => {
                                                const preset = PROVIDER_PRESETS[selectedPreset];
                                                if (selectedPresetModels.size === preset.models.length) {
                                                    setSelectedPresetModels(new Set());
                                                } else {
                                                    setSelectedPresetModels(new Set(preset.models));
                                                }
                                            }}
                                            style={{
                                                fontWeight: 700,
                                                fontSize: '0.70rem',
                                                color: '#a78bfa',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                            }}
                                        >
                                            {selectedPresetModels.size === PROVIDER_PRESETS[selectedPreset].models.length ? 'Deselect all' : 'Select all'}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PROVIDER_PRESETS[selectedPreset].models.map((modelId) => {
                                            const isSelected = selectedPresetModels.has(modelId);
                                            return (
                                                <button
                                                    key={modelId}
                                                    onClick={() => {
                                                        const next = new Set(selectedPresetModels);
                                                        if (isSelected) next.delete(modelId);
                                                        else next.add(modelId);
                                                        setSelectedPresetModels(next);
                                                    }}
                                                    className="px-2.5 py-1 rounded-lg transition-all duration-150"
                                                    style={{
                                                        fontSize: '0.72rem',
                                                        fontWeight: 600,
                                                        color: isSelected ? '#fff' : '#6b5fa0',
                                                        background: isSelected
                                                            ? 'linear-gradient(135deg, #a78bfa, #818cf8)'
                                                            : 'rgba(255,255,255,0.70)',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        opacity: isSelected ? 1 : 0.6,
                                                    }}
                                                >
                                                    {isSelected ? '✓ ' : ''}{modelId}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Custom model input */}
                            <div
                                className="px-4 py-3 rounded-xl"
                                style={{
                                    background: 'rgba(96,165,250,0.06)',
                                    border: '1px solid rgba(96,165,250,0.15)',
                                }}
                            >
                                <p style={{ ...labelStyle, marginBottom: '8px' }}>✏️ Add custom models</p>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        style={{ ...inputStyle, flex: 1 }}
                                        value={customModelInput}
                                        onChange={(e) => setCustomModelInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && customModelInput.trim()) {
                                                e.preventDefault();
                                                setCustomModelsToAdd([
                                                    ...customModelsToAdd,
                                                    { model_id: customModelInput.trim(), display_name: '' },
                                                ]);
                                                setCustomModelInput('');
                                            }
                                        }}
                                        placeholder="Type model ID and press Enter (e.g. gpt-4.1-2025-04-14)"
                                    />
                                    <button
                                        onClick={() => {
                                            if (customModelInput.trim()) {
                                                setCustomModelsToAdd([
                                                    ...customModelsToAdd,
                                                    { model_id: customModelInput.trim(), display_name: '' },
                                                ]);
                                                setCustomModelInput('');
                                            }
                                        }}
                                        className="px-3 rounded-xl shrink-0"
                                        style={{
                                            fontWeight: 700,
                                            fontSize: '0.78rem',
                                            color: '#fff',
                                            background: 'linear-gradient(135deg, #60a5fa, #818cf8)',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        + Add
                                    </button>
                                </div>
                                {customModelsToAdd.length > 0 && (
                                    <div className="flex flex-col gap-1.5">
                                        {customModelsToAdd.map((cm, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                                                style={{ background: 'rgba(255,255,255,0.60)' }}
                                            >
                                                <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#4a3f6b', flex: 1 }}>
                                                    {cm.model_id}
                                                </span>
                                                <input
                                                    style={{
                                                        ...inputStyle,
                                                        width: '140px',
                                                        padding: '4px 8px',
                                                        fontSize: '0.72rem',
                                                    }}
                                                    value={cm.display_name}
                                                    onChange={(e) => {
                                                        const updated = [...customModelsToAdd];
                                                        updated[idx] = { ...updated[idx], display_name: e.target.value };
                                                        setCustomModelsToAdd(updated);
                                                    }}
                                                    placeholder="Display name (optional)"
                                                />
                                                <button
                                                    onClick={() => {
                                                        setCustomModelsToAdd(customModelsToAdd.filter((_, i) => i !== idx));
                                                    }}
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize: '0.72rem',
                                                        color: '#e11d48',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={() => setShowAddProvider(false)}
                                className="flex-1 py-2.5 rounded-xl"
                                style={{
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    color: '#6b5fa0',
                                    background: 'rgba(255,255,255,0.60)',
                                    border: '1.5px solid rgba(255,255,255,0.80)',
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddProvider}
                                className="flex-1 py-2.5 rounded-xl active:scale-[0.98]"
                                style={{
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                    color: '#fff',
                                    background: 'linear-gradient(135deg, #a78bfa, #818cf8, #60a5fa)',
                                    border: 'none',
                                    boxShadow: '0 4px 16px rgba(167,139,250,0.40)',
                                    cursor: 'pointer',
                                }}
                            >
                                Confirm Add
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-16">
                    <div
                        className="px-6 py-4 rounded-2xl"
                        style={{
                            background: 'rgba(255,255,255,0.35)',
                            color: '#9b8cc4',
                            fontWeight: 700,
                        }}
                    >
                        Loading...
                    </div>
                </div>
            ) : providers.length === 0 ? (
                <div
                    className="flex flex-col items-center py-16 rounded-3xl"
                    style={{
                        background: 'rgba(255,255,255,0.22)',
                        backdropFilter: 'blur(20px)',
                        border: '1.5px solid rgba(255,255,255,0.55)',
                    }}
                >
                    <span style={{ fontSize: '3rem', marginBottom: '12px' }}>🤖</span>
                    <p style={{ fontWeight: 700, color: '#6b5fa0', marginBottom: '4px' }}>
                        No AI provider configured yet.
                    </p>
                    <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#9b8cc4' }}>
                        Click "Add Provider" to start configuration.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {providers.map((provider) => (
                        <div
                            key={provider.id}
                            className="rounded-3xl overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.22)',
                                backdropFilter: 'blur(28px)',
                                border: '1.5px solid rgba(255,255,255,0.55)',
                                boxShadow: '0 8px 48px rgba(180,160,220,0.10)',
                                opacity: provider.is_active ? 1 : 0.6,
                            }}
                        >
                            <div
                                className="flex items-center gap-3 px-6 py-4"
                                style={{
                                    background: 'rgba(255,255,255,0.30)',
                                    borderBottom: '1px solid rgba(255,255,255,0.45)',
                                }}
                            >
                                <div
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                    style={{
                                        background: provider.is_active
                                            ? 'linear-gradient(135deg, #a78bfa, #818cf8)'
                                            : 'rgba(180,160,220,0.30)',
                                        boxShadow: provider.is_active ? '0 4px 16px rgba(167,139,250,0.40)' : 'none',
                                    }}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>🤖</span>
                                </div>
                                <div className="flex-1">
                                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#4a3f6b' }}>
                                        {provider.name}
                                    </span>
                                    <div style={{ fontWeight: 600, fontSize: '0.72rem', color: '#9b8cc4' }}>
                                        {provider.base_url}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="px-3 py-1 rounded-full"
                                        style={{
                                            fontWeight: 700,
                                            fontSize: '0.72rem',
                                            color: provider.is_active ? '#059669' : '#9b8cc4',
                                            background: provider.is_active
                                                ? 'rgba(52,211,153,0.15)'
                                                : 'rgba(180,160,220,0.15)',
                                        }}
                                    >
                                        {provider.is_active ? 'Enabled' : 'Disabled'}
                                    </span>
                                    <button
                                        onClick={() => handleToggleProvider(provider.id, provider.is_active)}
                                        className="px-3 py-1.5 rounded-xl"
                                        style={{
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            color: '#6b5fa0',
                                            background: 'rgba(255,255,255,0.50)',
                                            border: '1px solid rgba(255,255,255,0.70)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {provider.is_active ? 'Disable' : 'Enable'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProvider(provider.id)}
                                        className="px-3 py-1.5 rounded-xl"
                                        style={{
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            color: '#e11d48',
                                            background: 'rgba(251,113,133,0.10)',
                                            border: '1px solid rgba(251,113,133,0.20)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#6b5fa0' }}>
                                        📦 Models ({provider.models.length})
                                    </span>
                                    <button
                                        onClick={() => setAddingModelTo(addingModelTo === provider.id ? null : provider.id)}
                                        className="px-3 py-1 rounded-xl"
                                        style={{
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            color: '#a78bfa',
                                            background: 'rgba(167,139,250,0.10)',
                                            border: '1px solid rgba(167,139,250,0.20)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        + Add Model
                                    </button>
                                </div>

                                {addingModelTo === provider.id && (
                                    <div className="flex gap-2 mb-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.40)' }}>
                                        <input
                                            style={{ ...inputStyle, flex: 1 }}
                                            value={newModelId}
                                            onChange={(e) => setNewModelId(e.target.value)}
                                            placeholder="Model ID (e.g. gpt-4o)"
                                        />
                                        <input
                                            style={{ ...inputStyle, flex: 1 }}
                                            value={newModelName}
                                            onChange={(e) => setNewModelName(e.target.value)}
                                            placeholder="Display name (optional)"
                                        />
                                        <button
                                            onClick={() => handleAddModel(provider.id)}
                                            className="px-4 rounded-xl shrink-0"
                                            style={{
                                                fontWeight: 700,
                                                fontSize: '0.8rem',
                                                color: '#fff',
                                                background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                                                border: 'none',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {provider.models.map((model) => (
                                        <div
                                            key={model.id}
                                            className="flex items-center gap-2 px-3 py-2 rounded-xl group"
                                            style={{
                                                background: model.is_active ? 'rgba(255,255,255,0.55)' : 'rgba(180,160,220,0.10)',
                                                border: '1px solid rgba(255,255,255,0.70)',
                                            }}
                                        >
                                            <span className="w-2 h-2 rounded-full" style={{ background: model.is_active ? '#34d399' : '#d1d5db' }} />
                                            {editingModelId === model.id ? (
                                                <form
                                                    onSubmit={(e) => {
                                                        e.preventDefault();
                                                        void handleRenameModel(model.id);
                                                    }}
                                                    className="flex items-center gap-1"
                                                >
                                                    <input
                                                        autoFocus
                                                        value={editingModelName}
                                                        onChange={(e) => setEditingModelName(e.target.value)}
                                                        onBlur={() => void handleRenameModel(model.id)}
                                                        style={{
                                                            fontWeight: 700,
                                                            fontSize: '0.78rem',
                                                            color: '#4a3f6b',
                                                            background: 'rgba(255,255,255,0.80)',
                                                            border: '1.5px solid #a78bfa',
                                                            borderRadius: '8px',
                                                            padding: '2px 8px',
                                                            outline: 'none',
                                                            width: '120px',
                                                        }}
                                                    />
                                                </form>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span
                                                        style={{
                                                            fontWeight: 700,
                                                            fontSize: '0.78rem',
                                                            color: model.is_active ? '#4a3f6b' : '#9b8cc4',
                                                            cursor: 'pointer',
                                                        }}
                                                        title="Click to rename"
                                                        onClick={() => {
                                                            setEditingModelId(model.id);
                                                            setEditingModelName(model.display_name);
                                                        }}
                                                    >
                                                        {model.display_name}
                                                    </span>
                                                    {model.display_name !== model.model_id && (
                                                        <span style={{ fontWeight: 500, fontSize: '0.62rem', color: '#b8aad8' }}>
                                                            {model.model_id}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <span style={{ fontWeight: 600, fontSize: '0.68rem', color: '#b8aad8' }}>
                                                ELO: {model.elo_rating}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setEditingModelId(model.id);
                                                    setEditingModelName(model.display_name);
                                                }}
                                                title="Rename"
                                                style={{
                                                    fontWeight: 600,
                                                    fontSize: '0.72rem',
                                                    color: '#a78bfa',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleToggleModel(model.id, model.is_active)}
                                                style={{
                                                    fontWeight: 600,
                                                    fontSize: '0.68rem',
                                                    color: '#6b5fa0',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline',
                                                }}
                                            >
                                                {model.is_active ? 'Disable' : 'Enable'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteModel(model.id)}
                                                style={{
                                                    fontWeight: 600,
                                                    fontSize: '0.68rem',
                                                    color: '#e11d48',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    {provider.models.length === 0 && (
                                        <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#b8aad8' }}>
                                            No models yet. Click "Add Model" to start.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
