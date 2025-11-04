'use client';

import React, { useState, useRef, Fragment } from 'react';
import {
    Plus,
    Search,
    Users,
    Lock,
    Globe,
    MoreVertical,
    Edit,
    Trash2,
    LogOut,
    Image as ImageIcon,
    Send,
    Paperclip,
    X,
    Settings,
    UserPlus,
    Crown
} from 'lucide-react';
import { useGroups, Group } from '@/context/GroupContext';
import { useAuth } from '@/context/AuthContext';
import { STRAPI_URL } from '@/lib/api';
import { Dialog, Transition, Menu } from '@headlessui/react';

// ==================== HELPER ====================
const getMediaUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${STRAPI_URL}${url}`;
};

// ==================== MODAL CRIAR/EDITAR GRUPO ====================
const CreateGroupModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    editGroup?: Group | null;
}> = ({ isOpen, onClose, editGroup }) => {
    const [name, setName] = useState(editGroup?.name || '');
    const [description, setDescription] = useState(editGroup?.description || '');
    const [category, setCategory] = useState(editGroup?.category || '');
    const [rules, setRules] = useState(editGroup?.rules || '');
    const [isPrivate, setIsPrivate] = useState(editGroup?.isPrivate || false);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        editGroup?.coverImage ? getMediaUrl(editGroup.coverImage.url) : null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { createGroup, updateGroup, fetchGroups } = useGroups();

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const uploadCoverImage = async (): Promise<number | null> => {
        if (!coverImage) return null;

        const formData = new FormData();
        formData.append('files', coverImage);

        try {
            const response = await fetch(`${STRAPI_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Erro ao fazer upload da imagem');
            const data = await response.json();
            return data[0].id;
        } catch (error) {
            console.error('❌ Erro ao fazer upload:', error);
            return null;
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert('O nome do grupo é obrigatório!');
            return;
        }

        setIsSubmitting(true);
        try {
            let coverImageId = editGroup?.coverImage?.id || null;

            if (coverImage) {
                const uploadedId = await uploadCoverImage();
                if (uploadedId) coverImageId = uploadedId;
            }

            const groupData: any = {
                name: name.trim(),
                description: description.trim(),
                category: category.trim(),
                rules: rules.trim(),
                isPrivate
            };

            if (coverImageId) {
                groupData.coverImage = coverImageId;
            }

            if (editGroup) {
                await updateGroup(editGroup.id, groupData);
            } else {
                await createGroup(groupData);
            }

            await fetchGroups();
            onClose();
            resetForm();
        } catch (error) {
            console.error('❌ Erro ao salvar grupo:', error);
            alert('Erro ao salvar grupo. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setCategory('');
        setRules('');
        setIsPrivate(false);
        setCoverImage(null);
        setPreviewUrl(null);
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
                                            {editGroup ? 'Editar Grupo' : 'Criar Novo Grupo'}
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
                                        {/* Imagem de Capa */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Imagem de Capa
                                            </label>
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="relative h-40 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 cursor-pointer transition-all overflow-hidden group"
                                            >
                                                {previewUrl ? (
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <ImageIcon className="w-12 h-12 text-indigo-400 mb-2" />
                                                        <p className="text-sm text-gray-600">Clique para adicionar imagem</p>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <ImageIcon className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />
                                        </div>

                                        {/* Nome do Grupo */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Nome do Grupo *
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Ex: Amigos da Tecnologia"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                            />
                                        </div>

                                        {/* Descrição */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Descrição
                                            </label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Descreva sobre o que é o grupo..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                                            />
                                        </div>

                                        {/* Categoria */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Categoria
                                            </label>
                                            <input
                                                type="text"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                placeholder="Ex: Tecnologia, Esportes, Música..."
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                                            />
                                        </div>

                                        {/* Regras */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Regras do Grupo
                                            </label>
                                            <textarea
                                                value={rules}
                                                onChange={(e) => setRules(e.target.value)}
                                                placeholder="Defina as regras do grupo..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                                            />
                                        </div>

                                        {/* Privacidade */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Privacidade
                                            </label>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPrivate(false)}
                                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                                                        !isPrivate
                                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <Globe className="w-5 h-5" />
                                                    <span className="font-semibold">Público</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPrivate(true)}
                                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                                                        isPrivate
                                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <Lock className="w-5 h-5" />
                                                    <span className="font-semibold">Privado</span>
                                                </button>
                                            </div>
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
                                        disabled={!name.trim() || isSubmitting}
                                        className={`px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                                            !name.trim() || isSubmitting
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
                                            editGroup ? 'Salvar Alterações' : 'Criar Grupo'
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

// ==================== CARD DO GRUPO ====================
const GroupCard: React.FC<{
    group: Group;
    onSelect: (group: Group) => void;
    onEdit: (group: Group) => void;
    onDelete: (groupId: number) => void;
    isAdmin: boolean;
}> = ({ group, onSelect, onEdit, onDelete, isAdmin }) => {
    const coverUrl = group.coverImage
        ? getMediaUrl(group.coverImage.url)
        : 'https://placehold.co/400x200/667eea/FFFFFF?text=Grupo';

    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        >
            {/* Imagem de Capa */}
            <div
                onClick={() => onSelect(group)}
                className="relative h-40 overflow-hidden"
            >
                <img
                    src={coverUrl}
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/667eea/FFFFFF?text=Grupo';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Badge Privado */}
                {group.isPrivate && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Privado
                    </div>
                )}

                {/* Menu Admin */}
                {isAdmin && (
                    <div className="absolute top-3 right-3">
                        <Menu as="div" className="relative">
                            <Menu.Button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                                <MoreVertical className="w-4 h-4 text-gray-700" />
                            </Menu.Button>
                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-10">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(group);
                                            }}
                                            className={`${
                                                active ? 'bg-indigo-50' : ''
                                            } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700`}
                                        >
                                            <Edit className="w-4 h-4" />
                                            Editar Grupo
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Tem certeza que deseja deletar este grupo?')) {
                                                    onDelete(group.id);
                                                }
                                            }}
                                            className={`${
                                                active ? 'bg-red-50' : ''
                                            } flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Deletar Grupo
                                        </button>
                                    )}
                                </Menu.Item>
                            </Menu.Items>
                        </Menu>
                    </div>
                )}
            </div>

            {/* Conteúdo */}
            <div onClick={() => onSelect(group)} className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{group.name}</h3>
                    {isAdmin && (
                        <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    )}
                </div>

                {group.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{group.description}</p>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">{group.memberCount || 0}</span>
                        <span>membros</span>
                    </div>
                    {group.category && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                            {group.category}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// ==================== PÁGINA PRINCIPAL ====================
export default function GroupsPage() {
    const { user } = useAuth();
    const { groups, isLoadingGroups, deleteGroup, setCurrentGroup, fetchGroups } = useGroups();
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectGroup = (group: Group) => {
        setSelectedGroup(group);
        setCurrentGroup(group);
    };

    const handleEditGroup = (group: Group) => {
        setEditingGroup(group);
        setShowCreateModal(true);
    };

    const handleDeleteGroup = async (groupId: number) => {
        await deleteGroup(groupId);
        await fetchGroups();
    };

    if (selectedGroup) {
        return <GroupChatView group={selectedGroup} onBack={() => setSelectedGroup(null)} />;
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Meus Grupos
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Conecte-se com pessoas que compartilham seus interesses
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingGroup(null);
                            setShowCreateModal(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Criar Grupo
                    </button>
                </div>

                {/* Barra de Pesquisa */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Pesquisar grupos..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                    />
                </div>
            </div>

            {/* Lista de Grupos */}
            {isLoadingGroups ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : filteredGroups.length === 0 ? (
                <div className="text-center py-20">
                    <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {searchQuery ? 'Nenhum grupo encontrado' : 'Você ainda não está em nenhum grupo'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {searchQuery ? 'Tente pesquisar com outros termos' : 'Crie seu primeiro grupo e comece a conectar!'}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            Criar Primeiro Grupo
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map(group => (
                        <GroupCard
                            key={group.id}
                            group={group}
                            onSelect={handleSelectGroup}
                            onEdit={handleEditGroup}
                            onDelete={handleDeleteGroup}
                            isAdmin={group.admin?.id === user?.profile?.id}
                        />
                    ))}
                </div>
            )}

            {/* Modal Criar/Editar */}
            <CreateGroupModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setEditingGroup(null);
                }}
                editGroup={editingGroup}
            />
        </div>
    );
}

// ==================== CHAT DO GRUPO ====================
function GroupChatView({ group, onBack }: { group: Group; onBack: () => void }) {
    const { user } = useAuth();
    const { groupMessages, sendGroupMessage, loadGroupMessages, isLoadingMessages, leaveGroup } = useGroups();
    const [message, setMessage] = useState('');
    const [showMembers, setShowMembers] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        loadGroupMessages(group.id);
    }, [group.id]);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [groupMessages]);

    const handleSend = () => {
        if (!message.trim()) return;
        sendGroupMessage(group.id, message.trim());
        setMessage('');
    };

    const handleLeaveGroup = async () => {
        if (confirm('Tem certeza que deseja sair deste grupo?')) {
            await leaveGroup(group.id);
            onBack();
        }
    };

    const isAdmin = group.admin?.id === user?.profile?.id;
    const coverUrl = group.coverImage
        ? getMediaUrl(group.coverImage.url)
        : 'https://placehold.co/1200x300/667eea/FFFFFF?text=Grupo';

    return (
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header do Grupo */}
            <div className="relative h-48">
                <img src={coverUrl} alt={group.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                    <X className="w-5 h-5 text-gray-700" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">{group.name}</h1>
                            <div className="flex items-center gap-4 text-white/90 text-sm">
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {group.memberCount} membros
                                </span>
                                {group.category && (
                                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                                        {group.category}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowMembers(!showMembers)}
                                className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                            >
                                <Users className="w-5 h-5 text-gray-700" />
                            </button>
                            {!isAdmin && (
                                <button
                                    onClick={handleLeaveGroup}
                                    className="p-3 bg-red-500/90 backdrop-blur-sm rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <LogOut className="w-5 h-5 text-white" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mensagens */}
            <div className="h-[500px] overflow-y-auto p-6 bg-gray-50">
                {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                ) : groupMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Send className="w-16 h-16 mb-4 text-gray-300" />
                        <p className="text-lg font-semibold">Nenhuma mensagem ainda</p>
                        <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groupMessages.map((msg) => {
                            const isOwn = msg.sender?.id === user?.profile?.id;
                            const senderAvatar = msg.sender?.avatar
                                ? getMediaUrl(msg.sender.avatar.url)
                                : `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${msg.sender?.DisplayName?.charAt(0) || 'U'}`;

                            return (
                                <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                    <img
                                        src={senderAvatar}
                                        alt={msg.sender?.DisplayName || 'User'}
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${msg.sender?.DisplayName?.charAt(0) || 'U'}`;
                                        }}
                                    />
                                    <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
                                        {!isOwn && (
                                            <span className="text-xs font-semibold text-gray-600 mb-1 px-1">
                                                {msg.sender?.DisplayName || 'Usuário'}
                                            </span>
                                        )}
                                        <div className={`px-4 py-2 rounded-2xl shadow-sm ${
                                            isOwn
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                                : 'bg-white text-gray-800'
                                        }`}>
                                            {msg.messageType === 'image' && msg.media ? (
                                                <img
                                                    src={getMediaUrl(msg.media.url) || ''}
                                                    alt="Imagem"
                                                    className="rounded-lg max-w-full mb-2"
                                                />
                                            ) : msg.messageType === 'video' && msg.media ? (
                                                <video
                                                    src={getMediaUrl(msg.media.url) || ''}
                                                    controls
                                                    className="rounded-lg max-w-full mb-2"
                                                />
                                            ) : null}
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 mt-1 px-1">
                                            {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end gap-3">
                    <button className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Digite uma mensagem..."
                            rows={1}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!message.trim()}
                        className={`p-3 rounded-full transition-all ${
                            message.trim()
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Sidebar Membros */}
            {showMembers && (
                <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-10">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Membros ({group.memberCount})</h3>
                        <button
                            onClick={() => setShowMembers(false)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-60px)]">
                        {group.group_members?.map((member) => {
                            const memberAvatar = member.avatar
                                ? getMediaUrl(member.avatar.url)
                                : `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${member.DisplayName?.charAt(0) || 'U'}`;
                            const isMemberAdmin = member.id === group.admin?.id;

                            return (
                                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <img
                                        src={memberAvatar}
                                        alt={member.DisplayName}
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${member.DisplayName?.charAt(0) || 'U'}`;
                                        }}
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{member.DisplayName}</p>
                                        {isMemberAdmin && (
                                            <span className="text-xs text-yellow-600 flex items-center gap-1">
                                                <Crown className="w-3 h-3" />
                                                Administrador
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}