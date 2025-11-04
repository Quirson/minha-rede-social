'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { STRAPI_URL } from '@/lib/api';
import { User, Image as ImageIcon, MapPin, Calendar, LinkIcon, CheckCircle } from 'lucide-react';

const CreateProfilePage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [previewCover, setPreviewCover] = useState(null);
    const [errors, setErrors] = useState({});

    const [profileData, setProfileData] = useState({
        displayName: '',
        bio: '',
        avatar: null,
        coverImage: null,
        location: '',
        website: '',
        dateOfBirth: '',
    });

    useEffect(() => {
        if (!user) {
            router.push('/auth');
        }
    }, [user, router]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (name === 'avatar') {
                    setPreviewAvatar(reader.result);
                } else if (name === 'coverImage') {
                    setPreviewCover(reader.result);
                }
            };
            reader.readAsDataURL(file);
            setProfileData(prev => ({ ...prev, [name]: file }));
        } else {
            setProfileData(prev => ({ ...prev, [name]: value }));
        }
    };

    const uploadMedia = async (file) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            let avatarId = null;
            let coverImageId = null;

            // Upload do avatar se existir
            if (profileData.avatar) {
                avatarId = await uploadMedia(profileData.avatar);
            }

            // Upload da imagem de capa se existir
            if (profileData.coverImage) {
                coverImageId = await uploadMedia(profileData.coverImage);
            }

            // Cria o perfil no Strapi
            const profilePayload = {
                data: {
                    DisplayName: profileData.displayName,
                    Bio: profileData.bio,
                    Location: profileData.location,
                    Website: profileData.website,
                    DateOfBirth: profileData.dateOfBirth,
                    IsVerified: false,
                    user: user.id,
                    ...(avatarId && { avatar: avatarId }),
                    ...(coverImageId && { coverImage: coverImageId })
                }
            };

            const response = await fetch(`${STRAPI_URL}/api/profiles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(profilePayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Falha ao criar o perfil.');
            }

            console.log('✅ Perfil criado com sucesso!');
            router.push('/feed');
        } catch (error) {
            console.error('❌ Erro ao criar perfil:', error);
            setErrors({ general: error.message || 'Erro ao criar o perfil.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Complete seu Perfil</h2>
                        <p className="text-gray-300">Quase lá! Adicione algumas informações para se conectar com a comunidade.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Imagens de Perfil e Capa */}
                        <div className="relative h-40 bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
                            {previewCover ? (
                                <img src={previewCover} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <div className="text-gray-400 text-sm">Imagem de Capa</div>
                            )}
                            <label className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black bg-opacity-40 hover:bg-opacity-50 transition-opacity rounded-xl">
                                <ImageIcon className="w-8 h-8 text-white" />
                                <input type="file" name="coverImage" onChange={handleChange} className="hidden" />
                            </label>
                        </div>
                        <div className="flex justify-center -mt-20 z-20">
                            <div className="w-32 h-32 rounded-full border-4 border-purple-500 overflow-hidden bg-gray-800 flex items-center justify-center">
                                {previewAvatar ? (
                                    <img src={previewAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-gray-400" />
                                )}
                            </div>
                            <label className="absolute w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer -right-16 top-16 transition-colors duration-200 hover:bg-blue-600">
                                <ImageIcon className="w-6 h-6 text-white" />
                                <input type="file" name="avatar" onChange={handleChange} className="hidden" />
                            </label>
                        </div>

                        {/* Campos do Formulário */}
                        <div><label className="block text-sm font-medium text-gray-200 mb-2">Nome de Exibição*</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" name="displayName" value={profileData.displayName} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm" placeholder="Ex: Maria Souza" required /></div></div>
                        <div><label className="block text-sm font-medium text-gray-200 mb-2">Biografia</label><div className="relative"><textarea name="bio" value={profileData.bio} onChange={handleChange} rows="4" className="w-full pl-4 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm" placeholder="Conte-nos um pouco sobre você..." /></div></div>
                        <div><label className="block text-sm font-medium text-gray-200 mb-2">Localização</label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" name="location" value={profileData.location} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm" placeholder="Ex: São Paulo, Brasil" /></div></div>
                        <div><label className="block text-sm font-medium text-gray-200 mb-2">Website</label><div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="url" name="website" value={profileData.website} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm" placeholder="Ex: https://www.seusite.com" /></div></div>
                        <div><label className="block text-sm font-medium text-gray-200 mb-2">Data de Nascimento*</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="date" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm" required /></div></div>

                        {errors.general && <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20">{errors.general}</div>}

                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? <div className="flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Criando Perfil...</div> : 'Finalizar Cadastro'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProfilePage;
