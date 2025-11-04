'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { STRAPI_URL } from '@/lib/api';
import { Socket } from 'socket.io-client';
import { useChat } from './ChatContext';

// ==================== TIPOS ====================
export interface Group {
    id: number;
    name: string;
    description?: string;
    coverImage?: {
        url: string;
    };
    isPrivate: boolean;
    memberCount: number;
    category?: string;
    rules?: string;
    group_members?: Array<{
        id: number;
        DisplayName: string;
        avatar?: { url: string };
    }>;
    admin: {
        id: number;
        DisplayName: string;
        avatar?: { url: string };
    };
    createdAt: string;
}

export interface GroupMessage {
    id: number;
    content: string;
    messageType: 'text' | 'image' | 'video' | 'file';
    media?: {
        url: string;
        mime?: string;
    };
    sender: {
        id: number;
        DisplayName: string;
        avatar?: { url: string };
    };
    group: {
        id: number;
    };
    createdAt: string;
}

interface GroupContextType {
    groups: Group[];
    currentGroup: Group | null;
    groupMessages: GroupMessage[];
    isLoadingGroups: boolean;
    isLoadingMessages: boolean;

    // Funções
    fetchGroups: () => Promise<void>;
    fetchGroupById: (groupId: number) => Promise<Group | null>;
    createGroup: (groupData: Partial<Group>) => Promise<Group | null>;
    updateGroup: (groupId: number, groupData: Partial<Group>) => Promise<Group | null>;
    deleteGroup: (groupId: number) => Promise<boolean>;
    joinGroup: (groupId: number) => Promise<boolean>;
    leaveGroup: (groupId: number) => Promise<boolean>;

    // Socket & Mensagens
    setCurrentGroup: (group: Group | null) => void;
    sendGroupMessage: (groupId: number, content: string, messageType?: string, mediaId?: number) => void;
    loadGroupMessages: (groupId: number) => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

// ==================== PROVIDER ====================
export const GroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { socket } = useChat(); // <-- ADICIONE ESTA LINHA
    const [groups, setGroups] = useState<Group[]>([]);
    const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
    const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // ==================== FETCH GRUPOS ====================
    const fetchGroups = async () => {
        if (!user?.profile?.id) return;

        setIsLoadingGroups(true);
        try {
            const response = await fetch(
                `${STRAPI_URL}/api/groups?populate=*&filters[group_members][id][$eq]=${user.profile.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) throw new Error('Erro ao buscar grupos');

            const data = await response.json();
            setGroups(data.data || []);
        } catch (error) {
            console.error('❌ Erro ao buscar grupos:', error);
        } finally {
            setIsLoadingGroups(false);
        }
    };

    // ==================== FETCH GRUPO POR ID ====================
    const fetchGroupById = async (groupId: number): Promise<Group | null> => {
        try {
            const response = await fetch(
                `${STRAPI_URL}/api/groups/${groupId}?populate=*`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) throw new Error('Erro ao buscar grupo');

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('❌ Erro ao buscar grupo:', error);
            return null;
        }
    };

    // ==================== CRIAR GRUPO ====================
    const createGroup = async (groupData: Partial<Group>): Promise<Group | null> => {
        if (!user?.profile?.id) return null;

        try {
            const response = await fetch(`${STRAPI_URL}/api/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    data: {
                        ...groupData,
                        admin: user.profile.id,
                        group_members: [user.profile.id],
                        memberCount: 1
                    }
                })
            });

            if (!response.ok) throw new Error('Erro ao criar grupo');

            const data = await response.json();
            await fetchGroups();
            return data.data;
        } catch (error) {
            console.error('❌ Erro ao criar grupo:', error);
            return null;
        }
    };

    // ==================== ATUALIZAR GRUPO ====================
    const updateGroup = async (groupId: number, groupData: Partial<Group>): Promise<Group | null> => {
        try {
            const response = await fetch(`${STRAPI_URL}/api/groups/${groupId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ data: groupData })
            });

            if (!response.ok) throw new Error('Erro ao atualizar grupo');

            const data = await response.json();
            await fetchGroups();
            return data.data;
        } catch (error) {
            console.error('❌ Erro ao atualizar grupo:', error);
            return null;
        }
    };

    // ==================== DELETAR GRUPO ====================
    const deleteGroup = async (groupId: number): Promise<boolean> => {
        try {
            const response = await fetch(`${STRAPI_URL}/api/groups/${groupId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Erro ao deletar grupo');

            await fetchGroups();
            return true;
        } catch (error) {
            console.error('❌ Erro ao deletar grupo:', error);
            return false;
        }
    };

    // ==================== ENTRAR NO GRUPO ====================
    const joinGroup = async (groupId: number): Promise<boolean> => {
        if (!user?.profile?.id) return false;

        try {
            const group = await fetchGroupById(groupId);
            if (!group) return false;

            const currentMembers = group.group_members?.map(m => m.id) || [];
            const updatedMembers = [...currentMembers, user.profile.id];

            await updateGroup(groupId, {
                group_members: updatedMembers as any,
                memberCount: updatedMembers.length
            });

            return true;
        } catch (error) {
            console.error('❌ Erro ao entrar no grupo:', error);
            return false;
        }
    };

    // ==================== SAIR DO GRUPO ====================
    const leaveGroup = async (groupId: number): Promise<boolean> => {
        if (!user?.profile?.id) return false;

        try {
            const group = await fetchGroupById(groupId);
            if (!group) return false;

            const currentMembers = group.group_members?.map(m => m.id) || [];
            const updatedMembers = currentMembers.filter(id => id !== user.profile.id);

            await updateGroup(groupId, {
                group_members: updatedMembers as any,
                memberCount: updatedMembers.length
            });

            return true;
        } catch (error) {
            console.error('❌ Erro ao sair do grupo:', error);
            return false;
        }
    };

    // ==================== CARREGAR MENSAGENS DO GRUPO ====================
    const loadGroupMessages = async (groupId: number) => {
        setIsLoadingMessages(true);
        try {
            const response = await fetch(
                `${STRAPI_URL}/api/chat-messages?populate=*&filters[group][id][$eq]=${groupId}&sort=createdAt:asc`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) throw new Error('Erro ao buscar mensagens');

            const data = await response.json();
            setGroupMessages(data.data || []);
        } catch (error) {
            console.error('❌ Erro ao buscar mensagens do grupo:', error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    // ==================== ENVIAR MENSAGEM ====================
    const sendGroupMessage = (
        groupId: number,
        content: string,
        messageType: 'text' | 'image' | 'video' | 'file' = 'text',
        mediaId?: number
    ) => {
        if (!socket || !content.trim() || !user?.profile) return;

        const optimisticMessage: GroupMessage = {
            id: Date.now(),
            content: content,
            messageType: messageType,
            sender: {
                id: user.profile.id,
                DisplayName: user.profile.DisplayName,
                avatar: (user.profile.avatar as any)?.data?.attributes,
            },
            group: { id: groupId },
            createdAt: new Date().toISOString(),
        };

        setGroupMessages(prev => [...prev, optimisticMessage]);

        socket.emit('send_message', { groupId, content, messageType, mediaId });
    };

    // ==================== SOCKET LISTENERS ====================
    useEffect(() => {
        if (!socket || !currentGroup) return;

        socket.emit('join_group', { groupId: currentGroup.id });

        const handleNewMessage = (data: { message: any; groupId: number }) => {
            if (data.groupId === currentGroup.id) {

                const newMessageSenderId = data.message?.sender?.data?.id || data.message?.sender?.id;

                if (newMessageSenderId === user?.profile?.id) {
                    return; // Ignorar eco da nossa própria mensagem
                }

                // Normalizar a mensagem que chega
                const normalizedMessage: GroupMessage = {
                    id: data.message.id,
                    content: data.message.content,
                    createdAt: data.message.createdAt,
                    group: data.message.group,
                    messageType: data.message.messageType,
                    media: data.message.media?.data?.attributes || data.message.media,
                    sender: data.message.sender?.data?.attributes ?
                        {...data.message.sender.data.attributes, id: data.message.sender.data.id} :
                        data.message.sender,
                };

                setGroupMessages(prev => [...prev, normalizedMessage]);
            }
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, currentGroup, user?.profile?.id]);

    // ==================== CARREGAR GRUPOS INICIAL ====================
    useEffect(() => {
        if (user?.profile?.id) {
            fetchGroups();
        }
    }, [user?.profile?.id]);

    // ==================== CONTEXT VALUE ====================
    const value: GroupContextType = {
        groups,
        currentGroup,
        groupMessages,
        isLoadingGroups,
        isLoadingMessages,
        fetchGroups,
        fetchGroupById,
        createGroup,
        updateGroup,
        deleteGroup,
        joinGroup,
        leaveGroup,
        setCurrentGroup,
        sendGroupMessage,
        loadGroupMessages
    };

    return (
        <GroupContext.Provider value={value}>
            {children}
        </GroupContext.Provider>
    );
};

// ==================== HOOK ====================
export const useGroups = () => {
    const context = useContext(GroupContext);
    if (!context) {
        throw new Error('useGroups deve ser usado dentro de GroupProvider');
    }
    return context;
};