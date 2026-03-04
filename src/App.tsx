import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router';
import { AuthProvider, useAuth } from './hooks/useAuth';
import MainLayout from './components/MainLayout';
import BattlePage from './pages/BattlePage';
import LoginPage from './pages/LoginPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    background:
                        'radial-gradient(ellipse at 15% 20%, #fbc2eb 0%, transparent 55%), radial-gradient(ellipse at 85% 10%, #a18cd1 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #a1c4fd 0%, transparent 55%), linear-gradient(135deg, #fce4ec 0%, #ede7f6 40%, #e3f2fd 100%)',
                }}
            >
                <div
                    className="px-8 py-5 rounded-3xl flex items-center gap-3"
                    style={{
                        background: 'rgba(255,255,255,0.35)',
                        backdropFilter: 'blur(20px)',
                        border: '1.5px solid rgba(255,255,255,0.60)',
                    }}
                >
                    <div
                        className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: '#a78bfa', borderTopColor: 'transparent' }}
                    />
                    <span style={{ fontWeight: 700, color: '#6b5fa0', fontSize: '0.9rem' }}>
                        Loading...
                    </span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

function AppRoutes() {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path="/login" element={<LoginPage onSuccess={() => navigate('/')} />} />
            <Route
                path="/"
                element={
                    <AuthGuard>
                        <MainLayout>
                            <BattlePage />
                        </MainLayout>
                    </AuthGuard>
                }
            />
            <Route
                path="/leaderboard"
                element={
                    <AuthGuard>
                        <MainLayout>
                            <LeaderboardPage />
                        </MainLayout>
                    </AuthGuard>
                }
            />
            <Route
                path="/admin"
                element={
                    <AuthGuard>
                        <MainLayout>
                            <AdminPage />
                        </MainLayout>
                    </AuthGuard>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
