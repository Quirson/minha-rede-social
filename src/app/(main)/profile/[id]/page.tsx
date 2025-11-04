'use client'; // <-- TORNA O COMPONENTE UM CLIENTE

import React from 'react';
import ProfilePage from '@/components/profile/ProfilePage';
import { useParams } from 'next/navigation'; // <-- IMPORTA O useParams

export default function ProfilePageWrapper() {
    const params = useParams(); // Usa o hook para obter os parâmetros
    const profileId = params.id as string; // O 'id' vem do nome da pasta [id]

    // Se o ID ainda não estiver disponível, pode mostrar um loading
    if (!profileId) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-600"></div>
            </div>
        );
    }

    return <ProfilePage profileId={profileId} />;
}