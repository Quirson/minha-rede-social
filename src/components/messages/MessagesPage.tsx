'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Search,
    Plus,
    Send,
    Smile,
    Paperclip,
    Image as ImageIcon,
    Phone,
    Video,
    MoreHorizontal,
    ArrowLeft,
    Check,
    CheckCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Importa o hook de autenticação

// Interface para definir o tipo de uma mensagem (resolve o erro do senderId)
interface Message {
    id: number;
    content: string;
    senderId: number | 'current_user'; // Permite número ou a string especial
    timestamp: string;
    messageType: 'text';
    isRead: boolean;
}

const MessagesPage = () => {
    const { user } = useAuth(); // Pega os dados do usuário logado
    const currentUserId = user?.profile?.id; // ID do usuário atual

    const [selectedChat, setSelectedChat] = useState<number | null>(1);
    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showMobileChat, setShowMobileChat] = useState(false);

    // CORREÇÃO 1: Adiciona o valor inicial (null) ao useRef e o tipo correto
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Dados estáticos de exemplo (seriam buscados da API)
    const conversations = [
        { id: 1, participant: { id: 2, name: 'Maria Silva', avatar: '/api/placeholder/40/40', isOnline: true, lastSeen: null }, lastMessage: { text: 'Oi! Tudo bem? Viu meu novo post?', timestamp: '10:30' }, unreadCount: 0 },
        { id: 2, participant: { id: 3, name: 'João Santos', avatar: '/api/placeholder/40/40', isOnline: false, lastSeen: '2h atrás' }, lastMessage: { text: 'Obrigado pela dica! Vou testar hoje.', timestamp: '09:15' }, unreadCount: 2 },
    ];

    // CORREÇÃO 2: Usa o tipo Message e substitui 'current' por 'current_user' para clareza
    const messages: Message[] = [
        { id: 1, content: 'Oi! Como você está?', senderId: 2, timestamp: '10:00', messageType: 'text', isRead: true },
        { id: 2, content: 'Estou bem, obrigado! E você?', senderId: 'current_user', timestamp: '10:02', messageType: 'text', isRead: true },
        { id: 3, content: 'Também estou bem! Vi seu post sobre tecnologia, muito interessante.', senderId: 2, timestamp: '10:05', messageType: 'text', isRead: true },
        { id: 8, content: 'Claro! Posso te ajudar com o que precisar.', senderId: 'current_user', timestamp: '10:17', messageType: 'text', isRead: false },
    ];

    const currentConversation = conversations.find(c => c.id === selectedChat);
    const filteredConversations = conversations.filter(conv =>
        conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendMessage = () => {
        if (messageText.trim()) {
            console.log('Sending message:', messageText);
            // Lógica para enviar a mensagem para a API aqui
            setMessageText('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] pb-20 lg:pb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex overflow-hidden">
                {/* Lista de Conversas */}
                <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                    {/* ...código da lista de conversas... */}
                </div>

                {/* Área do Chat */}
                {selectedChat ? (
                    <div className={`flex-1 flex flex-col ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
                        {/* Header do Chat */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            {/* ...código do header... */}
                        </div>

                        {/* Área das Mensagens */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => {
                                // CORREÇÃO 3: Compara o senderId com o ID do usuário logado
                                const isCurrentUser = message.senderId === 'current_user';

                                return (
                                    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                                            <div className={`px-4 py-2 rounded-2xl ${isCurrentUser ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                                                <p className="text-sm">{message.content}</p>
                                            </div>
                                            <div className={`flex items-center space-x-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                                <span className="text-xs text-gray-500">{message.timestamp}</span>
                                                {isCurrentUser && (
                                                    <div className="text-purple-300">
                                                        {message.isRead ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {!isCurrentUser && (
                                            <div className="w-8 h-8 bg-gray-300 rounded-full order-1 mr-2 flex-shrink-0"></div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input de Mensagem */}
                        <div className="p-4 border-t border-gray-200">
                            {/* ...código do input... */}
                        </div>
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 items-center justify-center">
                        {/* ...código de 'selecione uma conversa'... */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesPage;