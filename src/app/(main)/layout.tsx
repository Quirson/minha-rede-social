'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout'; // Verifique o caminho para seu MainLayout

export default function ProtectedLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, loading, router]);

    if (loading || !isAuthenticated) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
            </div>
        );
    }

    return <MainLayout>{children}</MainLayout>;
}