'use client';

import React, { useState, useEffect, useRef, Fragment } from 'react';
import {
    Camera,
    MapPin,
    Calendar,
    Link as LinkIcon,
    Edit,
    Check,
    X,
    UserPlus,
    UserMinus,
    Settings,
    Users,
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { STRAPI_URL } from '@/lib/api';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { useRouter } from 'next/navigation';

// ==================== HELPER ====================
const getMediaUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${STRAPI_URL}${url}`;
};

// ==================== TIPOS ====================
interface Profile {
    id: number;
    DisplayName: string;
    Bio?: string;
    avatar?: { url: string };
    coverImage?: { url: string };
    location?: string;
    website?: string;
    dateOfBirth?: string;
    isVerified: boolean;
    followersCount: number;
    followingCount: number;
    posts?: any[];
    followers?: any[];
    following?: any[];
    user?: {
        id: number;
        username: string;
        email: string;
    };
}

interface Post {
    id: number;
    content: string;
    images?: Array<{ url: string }>;
    video?: { url: string };
    likes: number;
    createdAt: string;
    author: Profile;
}

// ==================== MODAL EDITAR PERFIL ====================
const EditProfileModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    profile: Profile;
    onProfileUpdated: () => void;
}> = ({ isOpen, onClose, profile, onProfileUpdated }) => {
    const [displayName, setDisplayName] = useState(profile.DisplayName);
    const [bio, setBio] = useState(profile.Bio || '');
    const [location, setLocation] = useState(profile.location || '');
    const [website, setWebsite] = useState(profile.website || '');
    const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth || '');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        profile.avatar ? getMediaUrl(profile.avatar.url) : null
    );
    const [coverPreview, setCoverPreview] = useState<string | null>(
        profile.coverImage ? getMediaUrl(profile.coverImage.url) : null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async (file: File): Promise<number | null> => {
        const formData = new FormData();
        formData.append('files', file);

        try {
            const response = await fetch(`${STRAPI_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Erro ao fazer upload');
            const data = await response.json();
            return data[0].id;
        } catch (error) {
            console.error('❌ Erro ao fazer upload:', error);
            return null;
        }
    };

    const handleSubmit = async () => {
        if (!displayName.trim()) {
            alert('O nome é obrigatório!');
            return;
        }

        setIsSubmitting(true);
        try {
            let avatarId = profile.avatar?.id || null;
            let coverId = profile.coverImage?.id || null;

            if (avatar) {
                const uploadedId = await uploadImage(avatar);
                if (uploadedId) avatarId = uploadedId;
            }

            if (coverImage) {
                const uploadedId = await uploadImage(coverImage);
                if (uploadedId) coverId = uploadedId;
            }

            const updateData: any = {
                DisplayName: displayName.trim(),
                Bio: bio.trim(),
                location: location.trim(),
                website: website.trim(),
                dateOfBirth: dateOfBirth || profile.dateOfBirth
            };

            if (avatarId) updateData.avatar = avatarId;
            if (coverId) updateData.coverImage = coverId;

            // CORREÇÃO: Buscar primeiro o documentId correto do profile
            const findResponse = await fetch(
                `${STRAPI_URL}/api/profiles?filters[id][$eq]=${profile.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!findResponse.ok) throw new Error('Erro ao buscar profile para atualização');

            const findData = await findResponse.json();

            if (findData.data.length === 0) {
                throw new Error('Profile não encontrado para atualização');
            }

            const profileDocumentId = findData.data[0].documentId;

            // CORREÇÃO: Usar o documentId para fazer o PUT
            const response = await fetch(`${STRAPI_URL}/api/profiles/${profileDocumentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ data: updateData })
            });

            if (!response.ok) throw new Error('Erro ao atualizar perfil');

            alert('Perfil atualizado com sucesso!');
            onProfileUpdated();
            onClose();
        } catch (error) {
            console.error('❌ Erro ao atualizar perfil:', error);
            alert('Erro ao atualizar perfil. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" />
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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <Dialog.Title className="text-xl font-bold text-white">
                                            Editar Perfil
                                        </Dialog.Title>
                                        <button
                                            onClick={onClose}
                                            className="text-white/80 hover:text-white transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                                    <div className="space-y-4">
                                        {/* Cover Image */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Imagem de Capa
                                            </label>
                                            <div
                                                onClick={() => coverInputRef.current?.click()}
                                                className="relative h-40 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 cursor-pointer transition-all overflow-hidden group"
                                            >
                                                {coverPreview ? (
                                                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <Camera className="w-12 h-12 text-indigo-400 mb-2" />
                                                        <p className="text-sm text-gray-600">Clique para adicionar capa</p>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Camera className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                            <input
                                                ref={coverInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCoverSelect}
                                                className="hidden"
                                            />
                                        </div>

                                        {/* Avatar */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Foto de Perfil
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <div
                                                    onClick={() => avatarInputRef.current?.click()}
                                                    className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer group"
                                                >
                                                    {avatarPreview ? (
                                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                                                            <Camera className="w-8 h-8 text-indigo-400" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Camera className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => avatarInputRef.current?.click()}
                                                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-200 transition-colors"
                                                >
                                                    Alterar Foto
                                                </button>
                                            </div>
                                            <input
                                                ref={avatarInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarSelect}
                                                className="hidden"
                                            />
                                        </div>

                                        {/* Nome */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Nome *
                                            </label>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                            />
                                        </div>

                                        {/* Bio */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Bio
                                            </label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                                            />
                                        </div>

                                        {/* Localização */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Localização
                                            </label>
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                            />
                                        </div>

                                        {/* Website */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Website
                                            </label>
                                            <input
                                                type="text"
                                                value={website}
                                                onChange={(e) => setWebsite(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                            />
                                        </div>

                                        {/* Data de Nascimento */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Data de Nascimento
                                            </label>
                                            <input
                                                type="date"
                                                value={dateOfBirth}
                                                onChange={(e) => setDateOfBirth(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!displayName.trim() || isSubmitting}
                                        className={`px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                                            !displayName.trim() || isSubmitting
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Salvar Alterações
                                            </>
                                        )}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

// ==================== PÁGINA DE PERFIL ====================
export default function ProfilePage({ profileId }: { profileId: string }) {
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const isOwnProfile = user?.profile?.id === parseInt(profileId);

    useEffect(() => {
        fetchProfile();
        fetchPosts();
    }, [profileId]);

    // CORREÇÃO PRINCIPAL: Usar filter em vez de busca direta por ID
    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            console.log('🔄 Buscando perfil ID:', profileId);

            // USAR FILTER EM VEZ DE BUSCA DIRETA POR ID
            const response = await fetch(
                `${STRAPI_URL}/api/profiles?filters[id][$eq]=${profileId}&populate=*`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.data.length === 0) {
                throw new Error('Profile não encontrado');
            }

            console.log('✅ Perfil encontrado:', data.data[0]);
            setProfile(data.data[0]);

            // Verificar se está seguindo
            if (!isOwnProfile && user?.profile?.id) {
                checkIfFollowing(user.profile.id, parseInt(profileId));
            }
        } catch (error) {
            console.error('❌ Erro ao buscar perfil:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await fetch(
                `${STRAPI_URL}/api/posts?filters[author][id][$eq]=${profileId}&populate=*&sort=createdAt:desc`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) throw new Error('Erro ao buscar posts');

            const data = await response.json();
            setPosts(data.data || []);
        } catch (error) {
            console.error('❌ Erro ao buscar posts:', error);
        }
    };

    const checkIfFollowing = async (currentUserId: number, targetUserId: number) => {
        try {
            // CORREÇÃO: Usar filter também para verificar following
            const response = await fetch(
                `${STRAPI_URL}/api/profiles?filters[id][$eq]=${currentUserId}&populate=following`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) return;

            const data = await response.json();
            if (data.data.length === 0) return;

            const following = data.data[0].following || [];
            setIsFollowing(following.some((f: any) => f.id === targetUserId));
        } catch (error) {
            console.error('❌ Erro ao verificar follow:', error);
        }
    };

    const handleFollow = async () => {
        if (!user?.profile?.id || !profile) return;

        try {
            const newFollowingState = !isFollowing;
            setIsFollowing(newFollowingState);

            // Buscar o documentId do perfil atual (seguidor)
            const currentUserResponse = await fetch(
                `${STRAPI_URL}/api/profiles?filters[id][$eq]=${user.profile.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!currentUserResponse.ok) throw new Error('Erro ao buscar perfil atual');
            const currentUserData = await currentUserResponse.json();
            const currentUserDocumentId = currentUserData.data[0].documentId;

            // Buscar o documentId do perfil alvo
            const targetUserResponse = await fetch(
                `${STRAPI_URL}/api/profiles?filters[id][$eq]=${profile.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!targetUserResponse.ok) throw new Error('Erro ao buscar perfil alvo');
            const targetUserData = await targetUserResponse.json();
            const targetUserDocumentId = targetUserData.data[0].documentId;

            if (newFollowingState) {
                // Seguir
                await fetch(`${STRAPI_URL}/api/profiles/${currentUserDocumentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        data: {
                            followingCount: (parseInt(profile.followingCount) || 0) + 1
                        }
                    })
                });

                await fetch(`${STRAPI_URL}/api/profiles/${targetUserDocumentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        data: {
                            followersCount: (parseInt(profile.followersCount) || 0) + 1
                        }
                    })
                });
            } else {
                // Deixar de seguir
                await fetch(`${STRAPI_URL}/api/profiles/${currentUserDocumentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        data: {
                            followingCount: Math.max(0, (parseInt(profile.followingCount) || 0) - 1)
                        }
                    })
                });

                await fetch(`${STRAPI_URL}/api/profiles/${targetUserDocumentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        data: {
                            followersCount: Math.max(0, (parseInt(profile.followersCount) || 0) - 1)
                        }
                    })
                });
            }

            // Atualizar os dados do perfil
            fetchProfile();

        } catch (error) {
            console.error('❌ Erro ao seguir/deixar de seguir:', error);
            setIsFollowing(!isFollowing); // Reverter estado em caso de erro
            alert('Erro ao processar a ação. Tente novamente.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil não encontrado</h2>
                <p className="text-gray-600 mb-4">O perfil que você está procurando não existe.</p>
                <button
                    onClick={() => router.push('/feed')}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                    Voltar ao Feed
                </button>
            </div>
        );
    }

    const coverUrl = profile.coverImage
        ? getMediaUrl(profile.coverImage.url)
        : 'https://placehold.co/1200x300/667eea/FFFFFF?text=Cover';

    const avatarUrl = profile.avatar
        ? getMediaUrl(profile.avatar.url)
        : `https://placehold.co/200x200/8B5CF6/FFFFFF?text=${profile.DisplayName.charAt(0)}`;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Cover + Avatar */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                <div className="relative h-64">
                    <img
                        src={coverUrl}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                <div className="relative px-6 pb-6">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 gap-4">
                        <div className="flex items-end gap-4">
                            <img
                                src={avatarUrl}
                                alt={profile.DisplayName}
                                className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-xl"
                            />
                            <div className="pb-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-bold text-gray-900">{profile.DisplayName}</h1>
                                    {profile.isVerified && (
                                        <Shield className="w-6 h-6 text-blue-500" fill="currentColor" />
                                    )}
                                </div>
                                {profile.Bio && (
                                    <p className="text-gray-600 mt-1">{profile.Bio}</p>
                                )}
                                {profile.user && (
                                    <p className="text-sm text-gray-500 mt-1">@{profile.user.username}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {isOwnProfile ? (
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar Perfil
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollow}
                                    className={`px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg ${
                                        isFollowing
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                                    }`}
                                >
                                    {isFollowing ? (
                                        <>
                                            <UserMinus className="w-4 h-4" />
                                            Deixar de Seguir
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            Seguir
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                        {profile.location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {profile.location}
                            </div>
                        )}
                        {profile.website && (
                            <a
                                href={profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                            >
                                <LinkIcon className="w-4 h-4" />
                                {profile.website}
                            </a>
                        )}
                        {profile.dateOfBirth && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(profile.dateOfBirth).toLocaleDateString('pt-BR')}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 mt-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                            <p className="text-sm text-gray-600">Posts</p>
                        </div>
                        <div className="text-center cursor-pointer hover:bg-gray-50 px-3 py-1 rounded-lg transition-colors">
                            <p className="text-2xl font-bold text-gray-900">{profile.followersCount}</p>
                            <p className="text-sm text-gray-600">Seguidores</p>
                        </div>
                        <div className="text-center cursor-pointer hover:bg-gray-50 px-3 py-1 rounded-lg transition-colors">
                            <p className="text-2xl font-bold text-gray-900">{profile.followingCount}</p>
                            <p className="text-sm text-gray-600">Seguindo</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts</h2>

                {posts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-lg font-semibold">Nenhum post ainda</p>
                        <p className="text-sm">
                            {isOwnProfile ? 'Comece a compartilhar suas ideias!' : 'Este usuário ainda não postou nada.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                {post.images && post.images.length > 0 && (
                                    <img
                                        src={getMediaUrl(post.images[0].url) || ''}
                                        alt="Post"
                                        className="w-full h-48 object-cover rounded-lg mb-3"
                                    />
                                )}
                                <p className="text-gray-800 line-clamp-3 mb-3">{post.content}</p>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-4 h-4" />
                                            {post.likes}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="w-4 h-4" />
                                            0
                                        </span>
                                    </div>
                                    <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Editar */}
            {isOwnProfile && (
                <EditProfileModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    profile={profile}
                    onProfileUpdated={fetchProfile}
                />
            )}
        </div>
    );
}