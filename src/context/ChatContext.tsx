'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

// No src/context/ChatContext.tsx

interface Message {
    id: number;
    content: string; // Pode ser o texto ou o nome do ficheiro
    sender: {
        id: number;
        DisplayName?: string;
    };
    receiver?: {
        id: number;
    };
    createdAt: string;
    isRead: boolean;
    messageType?: 'text' | 'image' | 'video' | 'file'; // <-- ADICIONAR
    media?: any; // <-- ADICIONAR (usamos 'any' por simplicidade, pode ser mais específico)
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
    notifications: Record<number, number>;
    clearNotificationsFor: (senderId: number) => void;
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
    const currentChatRef = useRef<number | null>(null);
    const [notifications, setNotifications] = useState<Record<number, number>>({});

    // ========================================
    // FUNÇÃO CRÍTICA: Normalizar Mensagens
    // ========================================
    const normalizeMessage = useCallback((rawMessage: any): Message => {
        console.log('🔄 Normalizando mensagem:', rawMessage);

        // Caso 1: Mensagem já normalizada (tem sender.id)
        if (rawMessage.sender && typeof rawMessage.sender === 'object' && rawMessage.sender.id) {
            return {
                id: rawMessage.id,
                content: rawMessage.content,
                sender: {
                    id: rawMessage.sender.id,
                    DisplayName: rawMessage.sender.DisplayName || rawMessage.sender.attributes?.DisplayName
                },
                receiver: rawMessage.receiver ? {
                    id: rawMessage.receiver.id
                } : undefined,
                createdAt: rawMessage.createdAt || new Date().toISOString(),
                isRead: rawMessage.isRead || false
            };
        }

        // Caso 2: Mensagem do Strapi (com attributes)
        const attrs = rawMessage.attributes || rawMessage;

        // Extrair sender
        let senderId: number;
        let senderName: string | undefined;

        if (attrs.sender?.data) {
            // sender é uma relação do Strapi
            senderId = attrs.sender.data.id;
            senderName = attrs.sender.data.attributes?.DisplayName;
        } else if (typeof attrs.sender === 'number') {
            // sender é apenas um ID
            senderId = attrs.sender;
        } else if (typeof attrs.sender === 'object' && attrs.sender.id) {
            // sender já é um objeto normalizado
            senderId = attrs.sender.id;
            senderName = attrs.sender.DisplayName;
        } else {
            console.error('❌ Estrutura de sender inválida:', attrs.sender);
            senderId = 0;
        }

        // Extrair receiver
        let receiverId: number | undefined;
        if (attrs.receiver?.data) {
            receiverId = attrs.receiver.data.id;
        } else if (typeof attrs.receiver === 'number') {
            receiverId = attrs.receiver;
        } else if (typeof attrs.receiver === 'object' && attrs.receiver?.id) {
            receiverId = attrs.receiver.id;
        }

        const normalized = {
            id: rawMessage.id,
            content: attrs.content || '',
            sender: {
                id: senderId,
                DisplayName: senderName
            },
            receiver: receiverId ? { id: receiverId } : undefined,
            createdAt: attrs.createdAt || attrs.publishedAt || new Date().toISOString(),
            isRead: attrs.isRead || false
        };

        console.log('✅ Mensagem normalizada:', normalized);
        return normalized;
    }, []);

    // ========================================
    // CONECTAR AO SOCKET
    // ========================================
    useEffect(() => {
        if (!isAuthenticated || !user?.profile?.id) {
            console.log('⚠️ Usuário não autenticado');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ Token não encontrado');
            return;
        }

        console.log('🔌 Conectando ao Socket.io...', {
            url: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
            profileId: user.profile.id
        });

        const newSocket = io(process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337', {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // ========================================
        // EVENTOS DE CONEXÃO
        // ========================================
        newSocket.on('connect', () => {
            console.log('✅ Socket conectado:', newSocket.id);
            setIsConnected(true);

            // Buscar lista de usuários online
            newSocket.emit('get_online_users');
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket desconectado');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Erro de conexão:', error.message);
            setIsConnected(false);
        });

        // ========================================
        // EVENTOS DE PRESENÇA
        // ========================================
        newSocket.on('online_users_list', (data: { onlineUsers: number[] }) => {
            console.log('👥 Usuários online:', data.onlineUsers);
            setOnlineUsers(data.onlineUsers);
        });

        newSocket.on('user_connected', (data: { profileId: number }) => {
            console.log('🟢 Usuário conectou:', data.profileId);
            setOnlineUsers(prev => {
                if (prev.includes(data.profileId)) return prev;
                return [...prev, data.profileId];
            });
        });

        newSocket.on('user_disconnected', (data: { profileId: number }) => {
            console.log('🔴 Usuário desconectou:', data.profileId);
            setOnlineUsers(prev => prev.filter(id => id !== data.profileId));
        });

            // =========================================================
           //           🔥 A CORREÇÃO ESTÁ AQUI 🔥
          // =========================================================
         // EVENTOS DE MENSAGENS - CRÍTICO!

        // Histórico de mensagens (sem alteração aqui)
        newSocket.on('chat_history', (data: { messages: any[] }) => {
            console.log('📚 Histórico recebido:', data.messages.length, 'mensagens');
            const normalizedMessages = data.messages.map(normalizeMessage);
            setMessages(normalizedMessages);
        });

        // Nova mensagem privada - EVENTO PRINCIPAL COM A LÓGICA CORRIGIDA!
        // =========================================================
//           🔥 MÉTODO COMPLETO E CORRIGIDO 🔥
// =========================================================

        newSocket.on('new_private_message', (data: { message: any; chatRoomId: string }) => {
            console.log('📨 NOVA MENSAGEM RECEBIDA DO SERVIDOR:', data);

            const normalizedMessage = normalizeMessage(data.message);
            console.log('📨 Mensagem normalizada:', normalizedMessage);

            // PASSO 1: VERIFICAR SE A MENSAGEM É MINHA (O "ECO" DO SERVIDOR)
            // Se o remetente for eu, não fazemos nada, porque a "UI Otimista"
            // na função sendMessage já a colocou na tela.
            if (normalizedMessage.sender.id === user?.profile?.id) {
                console.log('✅ Mensagem própria (eco do servidor) recebida. Ignorando para evitar duplicados.');
                return; // Para a execução da função aqui.
            }

            // PASSO 2: SE A MENSAGEM É DE OUTRA PESSOA, VERIFICAR SE É PARA O CHAT ATUAL
            const senderId = normalizedMessage.sender.id;
            const receiverId = normalizedMessage.receiver?.id;
            const myProfileId = user?.profile?.id;

            // A verificação agora é mais simples: a mensagem é para mim E o chat aberto é com quem a enviou?
            const isForMyCurrentChat = (receiverId === myProfileId && senderId === currentChatRef.current);

            if (isForMyCurrentChat) {
                console.log('✅ A mensagem de outra pessoa pertence ao chat atual. Adicionando à UI.');

                setMessages(prev => {
                    // Medida de segurança extra para prevenir duplicatas caso algo falhe
                    if (prev.some(msg => msg.id === normalizedMessage.id)) {
                        console.warn('⚠️ Mensagem duplicada (por ID) ignorada:', normalizedMessage.id);
                        return prev;
                    }
                    return [...prev, normalizedMessage];
                });
            } else {
                console.log('🔥🔥🔥 NOTIFICAÇÃO DEVERIA SER CRIADA AQUI! 🔥🔥🔥', { senderId });
                setNotifications(prev => {
                    const newCount = (prev[senderId] || 0) + 1;
                    return { ...prev, [senderId]: newCount };
                });
                // FUTURAMENTE: Aqui você pode adicionar lógica para mostrar uma notificação de "nova mensagem"
                // Ex: setNotifications(prev => ({...}))
            }
        });

        // Erro do servidor (sem alteração aqui)
        newSocket.on('error', (data: { message: string }) => {
            console.error('❌ Erro do servidor:', data.message);
        });

        // ========================================
        // LIMPEZA
        // ========================================
        return () => {
            console.log('🧹 Desconectando socket...');
            newSocket.off('connect');
            newSocket.off('disconnect');
            newSocket.off('connect_error');
            newSocket.off('online_users_list');
            newSocket.off('user_connected');
            newSocket.off('user_disconnected');
            newSocket.off('chat_history');
            newSocket.off('new_private_message');
            newSocket.off('error');
            newSocket.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [isAuthenticated, user?.profile?.id, normalizeMessage]);

    // ========================================
    // ENVIAR MENSAGEM
    // ========================================
    const sendMessage = useCallback((content: string, receiverId: number) => {
        if (!socket || !isConnected || !user?.profile) {
            console.error('❌ Socket não conectado ou usuário sem perfil');
            return;
        }

        const trimmedContent = content.trim();
        if (!trimmedContent) {
            console.error('❌ Conteúdo vazio');
            return;
        }

        console.log('📤 Enviando mensagem (com UI Otimista):', {
            content: trimmedContent,
            receiverId,
        });

        // -------- 🔥 MUDANÇA CRÍTICA AQUI 🔥 --------
        // 1. Crie uma mensagem "temporária" para a UI.
        // Use um ID negativo ou um timestamp para evitar conflito de chave.
        const optimisticMessage: Message = {
            id: Date.now(), // ID temporário
            content: trimmedContent,
            sender: {
                id: user.profile.id,
                DisplayName: user.profile.DisplayName,
            },
            receiver: {
                id: receiverId,
            },
            createdAt: new Date().toISOString(),
            isRead: false,
        };

        // 2. Adicione essa mensagem diretamente ao estado.
        setMessages(prev => [...prev, optimisticMessage]);

        // 3. Envie a mensagem real para o servidor.
        socket.emit('send_private_message', {
            content: trimmedContent,
            receiverId: receiverId
        });

    }, [socket, isConnected, user]);
    const clearNotificationsFor = useCallback((senderId: number) => {
        setNotifications(prev => {
            if (!prev[senderId]) return prev;
            const newNotifications = { ...prev };
            delete newNotifications[senderId];
            return newNotifications;
        });
    }, []);

    // ========================================
    // ENTRAR NO CHAT
    // ========================================
    // ========================================
// ENTRAR NO CHAT
// ========================================
    const joinChat = useCallback((otherUserId: number) => {
        if (!socket || !isConnected) {
            console.error('❌ Socket não conectado');
            return;
        }

        console.log('💬 Entrando no chat com usuário:', otherUserId);
        currentChatRef.current = otherUserId;

        // A LINHA DO SOCKET.EMIT VEM PRIMEIRO
        socket.emit('join_private_chat', {
            otherUserId: otherUserId
        });

        // A FUNÇÃO PARA LIMPAR AS NOTIFICAÇÕES VEM DEPOIS, FORA DO OBJETO
        clearNotificationsFor(otherUserId);

    }, [socket, isConnected, clearNotificationsFor]);


    // ========================================
    // CARREGAR HISTÓRICO
    // ========================================
    const loadChatHistory = useCallback((otherUserId: number) => {
        if (!socket || !isConnected) {
            console.error('❌ Socket não conectado');
            return;
        }

        console.log('📚 Carregando histórico com usuário:', otherUserId);

        // Limpar mensagens anteriores
        setMessages([]);

        socket.emit('get_chat_history', {
            otherUserId: otherUserId
        });
    }, [socket, isConnected]);

    const value: ChatContextType = {
        socket,
        isConnected,
        messages,
        onlineUsers,
        sendMessage,
        joinChat,
        loadChatHistory,
        typing,
        setTyping,
        notifications,
        clearNotificationsFor,
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