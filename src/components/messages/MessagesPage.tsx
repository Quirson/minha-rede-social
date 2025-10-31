'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import {
    Search, Send, Paperclip, Smile, ImageIcon, VideoIcon,
    Phone, MoreVertical, Check, CheckCheck, Users,
    ArrowLeft, Menu, Loader2
} from 'lucide-react';
import { STRAPI_URL } from '@/lib/api';

const MessagesPage = () => {
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileChatOpen, setMobileChatOpen] = useState(false);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loadingProfiles, setLoadingProfiles] = useState(true);

    const {
        messages,
        sendMessage,
        joinChat,
        loadChatHistory,
        isConnected,
        onlineUsers
    } = useChat();

    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Buscar Profiles REAIS da API
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                setLoadingProfiles(true);
                const token = localStorage.getItem('token');
                const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

                console.log('🌐 Buscando profiles...');

                const response = await fetch(`${API_URL}/api/profiles?populate=*`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Profiles carregados:', data);

                    // A estrutura é data.data (array de profiles)
                    const profilesData = data.data || [];
                    console.log('📊 Total de profiles:', profilesData.length);

                    // Filtrar para não mostrar o próprio usuário
                    const otherProfiles = profilesData.filter((profile: any) =>
                        profile.id !== user?.profile?.id
                    );

                    console.log('👥 Outros profiles (após filtro):', otherProfiles.length);
                    setProfiles(otherProfiles);
                } else {
                    console.error('Erro ao carregar profiles - Status:', response.status);
                }
            } catch (error) {
                console.error('Erro ao buscar profiles:', error);
            } finally {
                setLoadingProfiles(false);
            }
        };

        if (user?.profile?.id) {
            fetchProfiles();
        }
    }, [user?.profile?.id]);

    // Rolagem automática
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Carregar histórico quando selecionar usuário
    useEffect(() => {
        if (selectedUser) {
            joinChat(selectedUser.id);
            loadChatHistory(selectedUser.id);
            setMobileChatOpen(true);
        }
    }, [selectedUser, joinChat, loadChatHistory]);

    const handleSendMessage = () => {
        if (!message.trim() || !selectedUser) return;

        sendMessage(message, selectedUser.id);
        setMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredProfiles = profiles.filter(profile =>
        (profile.DisplayName || profile.attributes?.DisplayName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isUserOnline = (userId: number) => onlineUsers.includes(userId);

    const getAvatarUrl = (profile: any) => {
        // CORREÇÃO: profile.avatar?.data?.attributes?.url (pode estar direto ou em attributes)
        let avatar = profile.avatar?.data?.attributes;
        if (!avatar && profile.attributes?.avatar?.data?.attributes) {
            avatar = profile.attributes.avatar.data.attributes;
        }

        if (avatar?.url) {
            return `${STRAPI_URL}${avatar.url}`;
        }
        return `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${getDisplayName(profile).charAt(0)}`;
    };

    const getDisplayName = (profile: any) => {
        // CORREÇÃO: profile.DisplayName (DIRETO) ou profile.attributes?.DisplayName
        return profile.DisplayName || profile.attributes?.DisplayName || 'Usuário';
    };

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] pb-20 lg:pb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex overflow-hidden">

                {/* Lista de Conversas */}
                <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col ${
                    isMobileChatOpen ? 'hidden md:flex' : 'flex'
                }`}>
                    {/* Header da Lista */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <Menu className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Barra de Pesquisa */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Pesquisar conversas..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Lista de Profiles REAIS */}
                    <div className="flex-1 overflow-y-auto">
                        {loadingProfiles ? (
                            <div className="flex justify-center items-center h-32">
                                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                            </div>
                        ) : filteredProfiles.length === 0 ? (
                            <div className="text-center text-gray-500 p-4">
                                Nenhum perfil encontrado
                            </div>
                        ) : (
                            filteredProfiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    onClick={() => setSelectedUser({
                                        id: profile.id,
                                        DisplayName: getDisplayName(profile),
                                        avatar: profile.avatar || profile.attributes?.avatar
                                    })}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                        selectedUser?.id === profile.id ? 'bg-purple-50 border-purple-200' : ''
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <img
                                                src={getAvatarUrl(profile)}
                                                alt={getDisplayName(profile)}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            {isUserOnline(profile.id) && (
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {getDisplayName(profile)}
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    {isUserOnline(profile.id) ? 'Agora' : 'Offline'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">
                                                {isUserOnline(profile.id) ? 'Online' : 'Última vez recentemente'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Área do Chat */}
                {selectedUser ? (
                    <div className={`flex-1 flex flex-col ${
                        isMobileChatOpen ? 'flex' : 'hidden md:flex'
                    }`}>
                        {/* Header do Chat */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => {
                                        setMobileChatOpen(false);
                                        setSelectedUser(null);
                                    }}
                                    className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>

                                <div className="relative">
                                    <img
                                        src={getAvatarUrl(selectedUser)}
                                        alt={selectedUser.DisplayName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    {isUserOnline(selectedUser.id) && (
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900">{selectedUser.DisplayName}</h3>
                                    <p className="text-sm text-gray-500">
                                        {isUserOnline(selectedUser.id) ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                    <VideoIcon className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Área das Mensagens REAIS */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg) => {
                                const isOwnMessage = msg.sender?.id === user?.profile?.id;

                                return (
                                    <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs lg:max-w-md ${
                                            isOwnMessage ? 'order-2' : 'order-1'
                                        }`}>
                                            <div className={`px-4 py-2 rounded-2xl ${
                                                isOwnMessage
                                                    ? 'bg-purple-600 text-white rounded-br-sm'
                                                    : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                                            }`}>
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                <div className={`flex items-center space-x-1 mt-1 ${
                                                    isOwnMessage ? 'justify-end' : 'justify-start'
                                                }`}>
                                                    <span className="text-xs opacity-75">
                                                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                    {isOwnMessage && (
                                                        <div className="text-purple-300">
                                                            {msg.isRead ? (
                                                                <CheckCheck className="w-4 h-4" />
                                                            ) : (
                                                                <Check className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {messages.length === 0 && (
                                <div className="flex items-center justify-center h-32 text-gray-500">
                                    <div className="text-center">
                                        <p>Nenhuma mensagem ainda</p>
                                        <p className="text-sm">Envie uma mensagem para iniciar a conversa</p>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input de Mensagem REAL */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-gray-100 rounded-full">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-gray-100 rounded-full">
                                    <ImageIcon className="w-5 h-5" />
                                </button>

                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Digite uma mensagem..."
                                        className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />

                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-purple-600">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>

                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim()}
                                    className={`p-3 rounded-full transition-colors ${
                                        message.trim()
                                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Status da Conexão */}
                        {!isConnected && (
                            <div className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm text-center">
                                🔄 Reconectando...
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-500">
                            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
                            <p>Escolha um contato para iniciar o chat</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;