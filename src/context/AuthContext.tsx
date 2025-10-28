'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '@/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    sendVerificationCode: (email: string) => Promise<void>;
    verifyEmail: (email: string, code: string, userData: RegisterCredentials) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    console.log('🔐 Verificando token...', token.substring(0, 20) + '...');

                    const response = await fetch(`${API_URL}/users/me?populate[profile][populate][avatar]=*`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    console.log('📡 Status da resposta:', response.status);

                    if (response.ok) {
                        const userData = await response.json();
                        console.log('✅ Usuário carregado:', userData);
                        setUser(userData);
                    } else {
                        console.log('❌ Token inválido, limpando...');
                        throw new Error('Token de autenticação inválido.');
                    }
                }
            } catch (error) {
                console.error('💥 Erro na verificação:', error);
                // LIMPAR TUDO para forçar novo login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const sendVerificationCode = async (email: string) => {
        const response = await fetch(`${API_URL}/auth/send-verification-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error.message || 'Falha ao enviar o código de verificação.');
        }
    };

    const verifyEmail = async (email: string, code: string, userData: RegisterCredentials) => {
        const response = await fetch(`${API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, userData }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error.message || 'Código de verificação incorreto ou expirado.');
        }

        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.jwt);
    };

    const login = async (credentials: LoginCredentials) => {
        console.log('🔐 Tentando login com:', credentials.email);

        const response = await fetch(`${API_URL}/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: credentials.email,
                password: credentials.password
            }),
        });

        console.log('📡 Resposta do login:', response.status);

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Erro no login:', error);
            throw new Error(error.error.message || 'Erro ao fazer login');
        }

        const authData = await response.json();
        console.log('✅ Login bem-sucedido, token:', authData.jwt.substring(0, 20) + '...');

        // 🚨 AQUI ESTÁ A CORREÇÃO - Buscar usuário COMPLETO com profile
        const userResponse = await fetch(`${API_URL}/users/me?populate[profile][populate][avatar]=*`, {
            headers: {
                Authorization: `Bearer ${authData.jwt}`,
            },
        });

        if (!userResponse.ok) {
            throw new Error('Erro ao carregar dados do usuário');
        }

        const userWithProfile = await userResponse.json();

        setUser(userWithProfile);
        localStorage.setItem('user', JSON.stringify(userWithProfile));
        localStorage.setItem('token', authData.jwt);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const value: {
        user: User | null;
        loading: boolean;
        login: (credentials: LoginCredentials) => Promise<void>;
        sendVerificationCode: (email: string) => Promise<void>;
        verifyEmail: (email: string, code: string, userData: RegisterCredentials) => Promise<void>;
        logout: () => void;
        isAuthenticated: boolean
    } = {
        user,
        loading,
        login,
        sendVerificationCode,
        verifyEmail,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
