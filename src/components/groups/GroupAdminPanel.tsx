'use client';

import React, { useState, useEffect, Fragment } from 'react';
import {
    Settings,
    UserPlus,
    Shield,
    Trash2,
    Crown,
    X,
    Search,
    Check,
    Ban,
    LogOut,
    Edit,
    AlertTriangle
} from 'lucide-react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { useGroups, Group } from '@/context/GroupContext';
import { useAuth } from '@/context/AuthContext';
import { STRAPI_URL } from '@/lib/api';

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
    avatar?: {
        url: string;
    };
    Bio?: string;
}

// ==================== MODAL ADICIONAR MEMBROS ====================
const AddMemberModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    group: Group;
}> = ({ isOpen, onClose, group }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
    const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { addMemberToGroup } = useGroups();

    useEffect(() => {
        if (isOpen) {
            fetchAllProfiles();
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = allProfiles.filter(profile => {
                const isAlreadyMember = group.group_members?.some(m => m.id === profile.id);
                const matchesSearch = profile.DisplayName.toLowerCase().includes(searchQuery.toLowerCase());
                return !isAlreadyMember && matchesSearch;
            });
            setFilteredProfiles(filtered);
        } else {
            const nonMembers = allProfiles.filter(profile =>
                !group.group_members?.some(m => m.id === profile.id)
            );
            setFilteredProfiles(nonMembers);
        }
    }, [searchQuery, allProfiles, group.group_members]);

    const fetchAllProfiles = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${STRAPI_URL}/api/profiles?populate=avatar`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Erro ao buscar perfis');

            const data = await response.json();
            setAllProfiles(data.data || []);
        } catch (error) {
            console.error('❌ Erro ao buscar perfis:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMember = async (memberId: number) => {
        const success = await addMemberToGroup(group.id, memberId);
        if (success) {
            alert('Membro adicionado com sucesso!');
            onClose();
        } else {
            alert('Erro ao adicionar membro. Tente novamente.');
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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <Dialog.Title className="text-xl font-bold text-white flex items-center gap-2">
                                            <UserPlus className="w-6 h-6" />
                                            Adicionar Membros
                                        </Dialog.Title>
                                        <button
                                            onClick={onClose}
                                            className="text-white/80 hover:text-white transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Barra de Pesquisa */}
                                    <div className="relative mb-4">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Pesquisar pessoas..."
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                        />
                                    </div>

                                    {/* Lista de Perfis */}
                                    <div className="max-h-96 overflow-y-auto space-y-2">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                            </div>
                                        ) : filteredProfiles.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <UserPlus className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                                <p>Nenhuma pessoa encontrada</p>
                                            </div>
                                        ) : (
                                            filteredProfiles.map(profile => {
                                                const avatarUrl = profile.avatar
                                                    ? getMediaUrl(profile.avatar.url)
                                                    : `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${profile.DisplayName.charAt(0)}`;

                                                return (
                                                    <div
                                                        key={profile.id}
                                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={avatarUrl}
                                                                alt={profile.DisplayName}
                                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${profile.DisplayName.charAt(0)}`;
                                                                }}
                                                            />
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{profile.DisplayName}</p>
                                                                {profile.Bio && (
                                                                    <p className="text-sm text-gray-500 line-clamp-1">{profile.Bio}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleAddMember(profile.id)}
                                                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
                                                        >
                                                            <UserPlus className="w-4 h-4" />
                                                            Adicionar
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        )}
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

// ==================== PAINEL DE ADMINISTRAÇÃO ====================
export const GroupAdminPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    group: Group;
    onGroupUpdated: () => void;
}> = ({ isOpen, onClose, group, onGroupUpdated }) => {
    const { user } = useAuth();
    const {
        removeMemberFromGroup,
        promoteToAdmin,
        transferOwnership,
        updateGroup,
        deleteGroup
    } = useGroups();

    const [showAddMember, setShowAddMember] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isAdmin = group.admin?.id === user?.profile?.id;

    if (!isAdmin) return null;

    const handleRemoveMember = async (memberId: number) => {
        if (confirm('Tem certeza que deseja remover este membro?')) {
            const success = await removeMemberFromGroup(group.id, memberId);
            if (success) {
                alert('Membro removido com sucesso!');
                onGroupUpdated();
            } else {
                alert('Erro ao remover membro.');
            }
        }
    };

    const handlePromoteToAdmin = async (memberId: number) => {
        if (confirm('Deseja promover este membro a administrador? Você perderá suas permissões de admin.')) {
            const success = await promoteToAdmin(group.id, memberId);
            if (success) {
                alert('Membro promovido a administrador!');
                onGroupUpdated();
                onClose();
            } else {
                alert('Erro ao promover membro.');
            }
        }
    };

    const handleDeleteGroup = async () => {
        if (confirm('ATENÇÃO: Tem certeza que deseja DELETAR este grupo permanentemente? Esta ação não pode ser desfeita!')) {
            const success = await deleteGroup(group.id);
            if (success) {
                alert('Grupo deletado com sucesso!');
                onClose();
                window.location.href = '/groups';
            } else {
                alert('Erro ao deletar grupo.');
            }
        }
    };

    return (
        <>
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
                                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <Dialog.Title className="text-xl font-bold text-white flex items-center gap-2">
                                                <Settings className="w-6 h-6" />
                                                Administração do Grupo
                                            </Dialog.Title>
                                            <button
                                                onClick={onClose}
                                                className="text-white/80 hover:text-white transition-colors"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>

                                    <Tab.Group>
                                        <Tab.List className="flex border-b border-gray-200 px-6 bg-gray-50">
                                            <Tab className={({ selected }) => `px-4 py-3 text-sm font-semibold transition-all ${
                                                selected
                                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}>
                                                Membros ({group.memberCount})
                                            </Tab>
                                            <Tab className={({ selected }) => `px-4 py-3 text-sm font-semibold transition-all ${
                                                selected
                                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}>
                                                Configurações
                                            </Tab>
                                            <Tab className={({ selected }) => `px-4 py-3 text-sm font-semibold transition-all ${
                                                selected
                                                    ? 'text-red-600 border-b-2 border-red-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}>
                                                Zona de Perigo
                                            </Tab>
                                        </Tab.List>

                                        <Tab.Panels className="p-6 max-h-[60vh] overflow-y-auto">
                                            {/* PAINEL MEMBROS */}
                                            <Tab.Panel>
                                                <button
                                                    onClick={() => setShowAddMember(true)}
                                                    className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all"
                                                >
                                                    <UserPlus className="w-5 h-5" />
                                                    Adicionar Membros
                                                </button>

                                                <div className="space-y-3">
                                                    {group.group_members?.map(member => {
                                                        const memberAvatar = member.avatar
                                                            ? getMediaUrl(member.avatar.url)
                                                            : `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${member.DisplayName.charAt(0)}`;
                                                        const isMemberAdmin = member.id === group.admin?.id;
                                                        const isCurrentUser = member.id === user?.profile?.id;

                                                        return (
                                                            <div
                                                                key={member.id}
                                                                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <img
                                                                        src={memberAvatar}
                                                                        alt={member.DisplayName}
                                                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                                                                        onError={(e) => {
                                                                            (e.target as HTMLImageElement).src = `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${member.DisplayName.charAt(0)}`;
                                                                        }}
                                                                    />
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                                            {member.DisplayName}
                                                                            {isCurrentUser && (
                                                                                <span className="text-xs text-gray-500">(Você)</span>
                                                                            )}
                                                                        </p>
                                                                        {isMemberAdmin && (
                                                                            <span className="text-xs text-yellow-600 flex items-center gap-1 font-semibold">
                                                                                <Crown className="w-3 h-3" />
                                                                                Administrador
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {!isMemberAdmin && !isCurrentUser && (
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handlePromoteToAdmin(member.id)}
                                                                            className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                                                                        >
                                                                            <Shield className="w-4 h-4" />
                                                                            Promover
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRemoveMember(member.id)}
                                                                            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                                                                        >
                                                                            <Ban className="w-4 h-4" />
                                                                            Remover
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </Tab.Panel>

                                            {/* PAINEL CONFIGURAÇÕES */}
                                            <Tab.Panel>
                                                <div className="space-y-4">
                                                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
                                                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                            <Settings className="w-5 h-5 text-indigo-600" />
                                                            Informações do Grupo
                                                        </h3>
                                                        <div className="space-y-2 text-sm">
                                                            <p><strong>Nome:</strong> {group.name}</p>
                                                            <p><strong>Descrição:</strong> {group.description || 'Sem descrição'}</p>
                                                            <p><strong>Categoria:</strong> {group.category || 'Sem categoria'}</p>
                                                            <p><strong>Membros:</strong> {group.memberCount}</p>
                                                            <p><strong>Privacidade:</strong> {group.isPrivate ? 'Privado' : 'Público'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                                                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                            <Crown className="w-5 h-5 text-yellow-600" />
                                                            Administração
                                                        </h3>
                                                        <p className="text-sm text-gray-700 mb-3">
                                                            Você é o administrador deste grupo. Pode adicionar/remover membros,
                                                            promover outros admins e gerenciar configurações.
                                                        </p>
                                                    </div>

                                                    {group.rules && (
                                                        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                                            <h3 className="font-bold text-gray-900 mb-2">Regras do Grupo</h3>
                                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{group.rules}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Tab.Panel>

                                            {/* PAINEL ZONA DE PERIGO */}
                                            <Tab.Panel>
                                                <div className="space-y-4">
                                                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                                        <div className="flex items-start gap-3">
                                                            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                                            <div className="flex-1">
                                                                <h3 className="font-bold text-red-900 mb-1">Deletar Grupo</h3>
                                                                <p className="text-sm text-red-700 mb-3">
                                                                    Esta ação é <strong>irreversível</strong>. O grupo e todas as mensagens
                                                                    serão permanentemente deletados.
                                                                </p>
                                                                <button
                                                                    onClick={handleDeleteGroup}
                                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Deletar Grupo Permanentemente
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            <AddMemberModal
                isOpen={showAddMember}
                onClose={() => setShowAddMember(false)}
                group={group}
            />
        </>
    );
};