// src/context/AuthContext.tsx
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = await authAPI.me();
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            const response: AuthResponse = await authAPI.login(credentials);

            localStorage.setItem('token', response.jwt);
            localStorage.setItem('user', JSON.stringify(response.user));

            setUser(response.user);
        } catch (error: any) {
            throw new Error(error.response?.data?.error?.message || 'Erro ao fazer login');
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        try {
            const response: AuthResponse = await authAPI.register(credentials);

            localStorage.setItem('token', response.jwt);
            localStorage.setItem('user', JSON.stringify(response.user));

            setUser(response.user);
        } catch (error: any) {
            throw new Error(error.response?.data?.error?.message || 'Erro ao registrar');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
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