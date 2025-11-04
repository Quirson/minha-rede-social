'use client';

import React, {useState, Fragment, useRef, useMemo} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    User,
    ShoppingBag,
    MessageCircle,
    Users,
    Search,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Plus,
    Image,
    Video,
    MapPin,
    Smile,
    Send,
    X as CloseIcon,
    Globe,
    Lock,
    Users as UsersIcon,
    Tag,
    Trash2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { STRAPI_URL, postsAPI } from '@/lib/api';
import { Transition, Dialog } from '@headlessui/react';
import {useChat} from "@/context/ChatContext";

interface MenuItem {
    id: 'feed' | 'profile' | 'marketplace' | 'messages' | 'groups';
    label: string;
    icon: React.ElementType;
    href: string;
    badge?: number;
}

// Tipos para os arquivos
interface UploadedFile {
    file: File;
    preview: string;
    type: 'image' | 'video';
}

// FUNÇÃO PARA CLOUDINARY - CORRIGE URLs DUPLICADAS
const getMediaUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) {
        return url;
    }
    return `${STRAPI_URL}${url}`;
};

// Componente Modal para Criar Post COMPLETO
const CreatePostModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
}> = ({ isOpen, onClose, onPostCreated }) => {
    const [text, setText] = useState('');
    const [tags, setTags] = useState('');
    const [location, setLocation] = useState('');
    const [privacy, setPrivacy] = useState<'public' | 'private' | 'friends'>('public');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const { user } = useAuth();

    const userAvatar = user?.profile?.avatar?.url
        ? getMediaUrl(user.profile.avatar.url)
        : `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${user?.profile?.DisplayName?.charAt(0) || 'U'}`;

    const handleFileSelect = (files: FileList | null, type: 'image' | 'video') => {
        if (!files) return;

        const newFiles: UploadedFile[] = [];

        Array.from(files).forEach(file => {
            const fileType = file.type.startsWith('image/') ? 'image' :
                file.type.startsWith('video/') ? 'video' : null;

            if (fileType === type) {
                newFiles.push({
                    file,
                    preview: URL.createObjectURL(file),
                    type: fileType
                });
            }
        });

        setUploadedFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent, type: 'image' | 'video') => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files, type);
    };

    const uploadMediaToStrapi = async (file: File): Promise<number> => {
        const formData = new FormData();
        formData.append('files', file);

        const response = await fetch(`${STRAPI_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erro ao fazer upload da mídia');
        }

        const data = await response.json();
        return data[0].id;
    };

    const handleSubmit = async () => {
        if ((!text.trim() && uploadedFiles.length === 0) || !user?.profile?.id) {
            alert('Adicione texto ou mídia para criar um post.');
            return;
        }

        setIsSubmitting(true);
        try {
            let imageIds: number[] = [];
            let videoId: number | null = null;

            for (const uploadedFile of uploadedFiles) {
                const mediaId = await uploadMediaToStrapi(uploadedFile.file);

                if (uploadedFile.type === 'image') {
                    imageIds.push(mediaId);
                } else if (uploadedFile.type === 'video' && !videoId) {
                    videoId = mediaId;
                }
            }

            const postData: any = {
                content: text.trim(),
                author: user.profile.id,
                publishedDate: new Date().toISOString(),
                tags: tags.trim() || 'geral',
                location: location.trim() || 'Mozambique',
                isPublic: privacy === 'public',
                likes: 0,
                shares: 0
            };

            if (imageIds.length > 0) {
                postData.images = imageIds;
            }

            if (videoId) {
                postData.video = videoId;
            }

            console.log('📤 Enviando post completo:', postData);
            const response = await postsAPI.createPost(postData);
            console.log('✅ Post criado com sucesso:', response);

            setText('');
            setTags('');
            setLocation('');
            setUploadedFiles([]);
            onPostCreated();
            onClose();

            if (window.location.pathname === '/feed') {
                window.location.reload();
            }

        } catch (error) {
            console.error('❌ Erro ao criar post:', error);
            alert('Erro ao criar o post. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const PrivacyOptions = [
        { value: 'public', icon: Globe, label: 'Público', description: 'Qualquer pessoa pode ver' },
        { value: 'friends', icon: UsersIcon, label: 'Amigos', description: 'Apenas seus amigos' },
        { value: 'private', icon: Lock, label: 'Privado', description: 'Apenas você' }
    ];

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-white/30">
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-gray-200/50">
                                    <div className="flex items-center justify-between">
                                        <Dialog.Title className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                            Criar Nova Publicação
                                        </Dialog.Title>
                                        <button
                                            onClick={onClose}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <CloseIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                                    <div className="flex items-start space-x-3 mb-4">
                                        <img
                                            src={userAvatar}
                                            alt="Seu avatar"
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-lg"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${user?.profile?.DisplayName?.charAt(0) || 'U'}`;
                                            }}
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {user?.profile?.DisplayName || 'Usuário'}
                                            </h3>
                                            <select
                                                value={privacy}
                                                onChange={(e) => setPrivacy(e.target.value as any)}
                                                className="mt-1 text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0"
                                            >
                                                {PrivacyOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        className="w-full p-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none transition-all duration-200 border border-gray-200 text-gray-900 placeholder-gray-500 text-lg"
                                        placeholder="No que você está pensando?"
                                        rows={4}
                                        autoFocus
                                    />

                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="relative group">
                                                    {file.type === 'image' ? (
                                                        <img
                                                            src={file.preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <video
                                                            src={file.preview}
                                                            className="w-full h-32 object-cover rounded-lg"
                                                        />
                                                    )}
                                                    <button
                                                        onClick={() => removeFile(index)}
                                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Tag className="w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={tags}
                                                onChange={(e) => setTags(e.target.value)}
                                                placeholder="Adicionar tags (separadas por vírgula)"
                                                className="flex-1 p-2 text-sm bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="Adicionar localização"
                                                className="flex-1 p-2 text-sm bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:bg-white"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Globe className="w-4 h-4 text-gray-400" />
                                            <div className="flex-1 flex space-x-2">
                                                {PrivacyOptions.map(option => {
                                                    const Icon = option.icon;
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => setPrivacy(option.value as any)}
                                                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all ${
                                                                privacy === option.value
                                                                    ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            <Icon className="w-3 h-3" />
                                                            <span>{option.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                                                isDragging ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-300'
                                            }`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, 'image')}
                                        >
                                            <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 mb-2">
                                                Arraste imagens aqui ou clique para selecionar
                                            </p>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                                            >
                                                Selecionar Imagens
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => handleFileSelect(e.target.files, 'image')}
                                                className="hidden"
                                            />
                                        </div>

                                        <div
                                            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                                                isDragging ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-300'
                                            }`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, 'video')}
                                        >
                                            <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 mb-2">
                                                Arraste um vídeo aqui ou clique para selecionar
                                            </p>
                                            <button
                                                onClick={() => videoInputRef.current?.click()}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                                            >
                                                Selecionar Vídeo
                                            </button>
                                            <input
                                                ref={videoInputRef}
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => handleFileSelect(e.target.files, 'video')}
                                                className="hidden"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 border-t border-gray-200/50 bg-gray-50/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                                                title="Adicionar imagens"
                                            >
                                                <Image className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => videoInputRef.current?.click()}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                title="Adicionar vídeo"
                                            >
                                                <Video className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                                <MapPin className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors">
                                                <Smile className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm text-gray-500">
                                                {uploadedFiles.length} mídia(s)
                                            </span>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={(!text.trim() && uploadedFiles.length === 0) || isSubmitting}
                                                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 ${
                                                    (!text.trim() && uploadedFiles.length === 0) || isSubmitting
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                                }`}
                                            >
                                                {isSubmitting ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                                Publicar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const { notifications } = useChat();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);

    // LÓGICA DAS NOTIFICAÇÕES AQUI DENTRO
    const totalMessageNotifications = useMemo(() => {
        if (!notifications) return 0;
        return Object.values(notifications).reduce((total, count) => total + count, 0);
    }, [notifications]);

    const menuItems: MenuItem[] = [
        { id: 'feed', label: 'Feed', icon: Home, href: '/feed' },
        { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, href: '/marketplace' },
        { id: 'messages', label: 'Mensagens', icon: MessageCircle, href: '/messages', badge: totalMessageNotifications },
        { id: 'groups', label: 'Grupos', icon: Users, href: '/groups' },
        { id: 'profile', label: 'Meu Perfil', icon: User, href: `/profile/${user?.profile?.id}` }, // <-- REMOVIDO O `|| ''`
    ];

    const userName = user?.profile?.DisplayName || 'Usuário';
    const userAvatar = user?.profile?.avatar?.url
        ? getMediaUrl(user.profile.avatar.url)
        : `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${userName.charAt(0)}`;

    const handlePostCreated = () => {
        console.log('Post criado com sucesso!');
    };

    return (
        <div
            className="min-h-screen"
            style={{
                background: `
                    linear-gradient(135deg, 
                        #667eea 0%, 
                        #764ba2 100%
                    ),
                    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`
            }}
        >
            <CreatePostModal
                isOpen={showCreatePostModal}
                onClose={() => setShowCreatePostModal(false)}
                onPostCreated={handlePostCreated}
            />

            <Transition.Root show={isMobileMenuOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={setIsMobileMenuOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <div className="flex flex-grow flex-col gap-y-5 overflow-y-auto bg-white/95 backdrop-blur-xl px-6 pb-4 shadow-2xl">
                                    <div className="flex h-16 shrink-0 items-center gap-x-3 border-b border-gray-200/50">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                            SD
                                        </div>
                                        <div>
                                            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                                Social Deal
                                            </span>
                                            <div className="text-xs text-gray-500 font-medium">Professional</div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <img
                                                    src={userAvatar}
                                                    alt={userName}
                                                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-md"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${userName.charAt(0)}`;
                                                    }}
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{userName}</h3>
                                                <p className="text-sm text-gray-500">Online agora</p>
                                            </div>
                                        </div>
                                    </div>

                                    <nav className="flex flex-1 flex-col">
                                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                            <li>
                                                <ul role="list" className="-mx-2 space-y-2">
                                                    {menuItems.map((item) => {
                                                        if (item.id === 'profile' && !user?.profile?.id) {
                                                            return null;
                                                        }
                                                        const isActive = pathname === item.href;
                                                        return (
                                                            <li key={item.id}>
                                                                <Link
                                                                    href={item.href}
                                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                                    className={`group flex items-center gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-200 ${
                                                                        isActive
                                                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                                                            : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                                                                    }`}
                                                                >
                                                                    <item.icon className={`h-5 w-5 shrink-0 ${
                                                                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-500'
                                                                    }`} />
                                                                    <span className="flex-1">{item.label}</span>
                                                                    {item.badge && item.badge > 0 && (
                                                                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}`}>
                                                                            {item.badge}
                                                                        </span>
                                                                    )}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </li>

                                            <li>
                                                <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2">
                                                    Ações Rápidas
                                                </div>
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={() => {
                                                            setShowCreatePostModal(true);
                                                            setIsMobileMenuOpen(false);
                                                        }}
                                                        className="group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                                                    >
                                                        <Plus className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                                                        Criar Post
                                                    </button>
                                                    <button className="group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200">
                                                        <Settings className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                                                        Configurações
                                                    </button>
                                                </div>
                                            </li>

                                            <li className="mt-auto">
                                                <button
                                                    onClick={logout}
                                                    className="group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200"
                                                >
                                                    <LogOut className="h-5 w-5 text-red-500" />
                                                    Sair
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            <div className="lg:pl-72">
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-white/80 backdrop-blur-xl px-4 shadow-lg border-b border-white/20 sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 hover:text-indigo-600 lg:hidden transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="h-6 w-px bg-gray-300 lg:hidden" />

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <form className="relative flex flex-1 max-w-md">
                            <div className="relative w-full">
                                <Search className="pointer-events-none absolute inset-y-0 left-3 h-full w-5 text-gray-400" />
                                <input
                                    className="block h-full w-full rounded-xl border-0 bg-gray-50 py-0 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 sm:text-sm"
                                    placeholder="Pesquisar posts, pessoas..."
                                    type="search"
                                />
                            </div>
                        </form>

                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            <button
                                onClick={() => setShowCreatePostModal(true)}
                                className="hidden lg:flex items-center gap-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Plus className="w-4 h-4" />
                                Criar Post
                            </button>

                            <button className="relative -m-2.5 p-2.5 text-gray-400 hover:text-indigo-600 transition-colors duration-200">
                                <Bell className="h-6 w-6" />
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    3
                                </span>
                            </button>

                            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-300" />

                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-x-3 rounded-xl px-3 py-2 hover:bg-gray-50 transition-all duration-200"
                                >
                                    <img
                                        src={userAvatar}
                                        alt={userName}
                                        className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${userName.charAt(0)}`;
                                        }}
                                    />
                                    <span className="hidden lg:block text-sm font-semibold text-gray-900">{userName}</span>
                                    <ChevronDown className="hidden lg:block h-4 w-4 text-gray-400" />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                                        <Link href={`/profile/${user?.profile?.id}`} className="flex items-center gap-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <User className="h-4 w-4 text-gray-400" />
                                            Ver Perfil
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setShowCreatePostModal(true);
                                                setShowUserMenu(false);
                                            }}
                                            className="flex w-full items-center gap-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Plus className="h-4 w-4 text-gray-400" />
                                            Criar Post
                                        </button>
                                        <Link href="/settings" className="flex items-center gap-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <Settings className="h-4 w-4 text-gray-400" />
                                            Configurações
                                        </Link>
                                        <hr className="my-2 border-gray-200" />
                                        <button onClick={logout} className="flex w-full items-center gap-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                            <LogOut className="h-4 w-4 text-red-500" />
                                            Sair
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <main className="py-8">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>

            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/95 backdrop-blur-xl px-6 pb-4 border-r border-gray-200/50 shadow-2xl">
                    <div className="flex h-16 shrink-0 items-center gap-x-3 border-b border-gray-200/50">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                            SD
                        </div>
                        <div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                Social Deal
                            </span>
                            <div className="text-xs text-gray-500 font-medium">Rede Social</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-md"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${userName.charAt(0)}`;
                                    }}
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{userName}</h3>
                                <p className="text-sm text-gray-500">Online agora</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-2">
                                    {menuItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <li key={item.id}>
                                                <Link
                                                    href={item.href}
                                                    className={`group flex items-center gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-200 ${
                                                        isActive
                                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                                            : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
                                                    }`}
                                                >
                                                    <item.icon className={`h-5 w-5 shrink-0 ${
                                                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-500'
                                                    }`} />
                                                    <span className="flex-1">{item.label}</span>
                                                    {item.badge && (
                                                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                                                            isActive
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-red-500 text-white'
                                                        }`}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>

                            <li>
                                <div className="text-xs font-semibold leading-6 text-gray-400 uppercase tracking-wider mb-2">
                                    Ações Rápidas
                                </div>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setShowCreatePostModal(true)}
                                        className="group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                                    >
                                        <Plus className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                                        Criar Post
                                    </button>
                                    <button className="group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200">
                                        <Settings className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                                        Configurações
                                    </button>
                                </div>
                            </li>

                            <li className="mt-auto">
                                <button
                                    onClick={logout}
                                    className="group flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200"
                                >
                                    <LogOut className="h-5 w-5 text-red-500" />
                                    Sair
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {showUserMenu && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowUserMenu(false)}
                />
            )}
        </div>
    );
};

export default MainLayout;