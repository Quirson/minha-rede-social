'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
    id: number;
    content: string;
    sender: any;
    receiver: any;
    createdAt: string;
    isRead: boolean;
}

interface ChatContextType {
    socket: Socket | null;
    isConnected: boolean;
    messages: Message[];
    onlineUsers: number[];
    sendMessage: (content: string, receiverId: number) => void;
    joinChat: (otherUserId: number) => void;
    loadChatHistory: (otherUserId: number) => void;
    typing: boolean;
    setTyping: (typing: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
    const [typing, setTyping] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user?.profile?.id) return;

        // Conectar ao Socket.io
        const newSocket = io(process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337', {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Eventos de conexão
        newSocket.on('connect', () => {
            console.log('🔌 Conectado ao chat');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Desconectado do chat');
            setIsConnected(false);
        });

        // Eventos de mensagens
        newSocket.on('new_private_message', (data) => {
            console.log('📨 Nova mensagem recebida:', data);
            setMessages(prev => [...prev, data.message]);
        });

        newSocket.on('chat_history', (data) => {
            console.log('📚 Histórico carregado:', data.messages.length, 'mensagens');
            setMessages(data.messages);
        });

        newSocket.on('online_users_list', (data) => {
            setOnlineUsers(data.onlineUsers);
        });

        newSocket.on('user_connected', (data) => {
            setOnlineUsers(prev => [...prev, data.profileId]);
        });

        newSocket.on('user_disconnected', (data) => {
            setOnlineUsers(prev => prev.filter(id => id !== data.profileId));
        });

        // Limpeza na desconexão
        return () => {
            newSocket.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [isAuthenticated, user?.profile?.id]);

    const sendMessage = (content: string, receiverId: number) => {
        if (!socket || !content.trim()) return;

        socket.emit('send_private_message', {
            content: content.trim(),
            receiverId: receiverId
        });
    };

    const joinChat = (otherUserId: number) => {
        if (!socket) return;

        socket.emit('join_private_chat', {
            otherUserId: otherUserId
        });
    };

    const loadChatHistory = (otherUserId: number) => {
        if (!socket) return;

        socket.emit('get_chat_history', {
            otherUserId: otherUserId
        });
    };

    const value = {
        socket,
        isConnected,
        messages,
        onlineUsers,
        sendMessage,
        joinChat,
        loadChatHistory,
        typing,
        setTyping
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};