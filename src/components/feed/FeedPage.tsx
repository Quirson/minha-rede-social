'use client';

import React, { useState, useEffect, FC } from 'react';
import { Heart, MoreHorizontal, MessageCircle, Share2, Send, MapPin, Bookmark, Smile } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { postsAPI, STRAPI_URL } from '@/lib/api';
import { Post as PostType, PostRaw } from '@/types';
import Link from 'next/link';

// --- SKELETON COMPONENT ---
const PostSkeleton: FC = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 animate-pulse">
        <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/4"></div>
            </div>
        </div>
        <div className="mt-4 space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6"></div>
        </div>
        <div className="mt-4 h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"></div>
    </div>
);

// --- POST CARD COMPONENT ---
interface PostCardProps {
    post: PostType;
    onLike: (id: number) => void;
}

const PostCard: FC<PostCardProps> = ({ post, onLike }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [showFullContent, setShowFullContent] = useState(false);
    const { id, content, publishedDate, likes, author, images, video, location } = post;

    if (!author) {
        console.error('Post sem autor:', post);
        return null;
    }

    const authorAvatar = author.avatar?.data?.attributes?.url
        ? `${STRAPI_URL}${author.avatar.data.attributes.url}`
        : `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${author.DisplayName?.charAt(0) || '?'}`;

    const videoUrl = video?.data?.attributes?.url ? `${STRAPI_URL}${video.data.attributes.url}` : null;
    const postImages = images?.data?.map(img => `${STRAPI_URL}${img.attributes.url}`) || [];

    const handleLike = () => {
        setIsLiked(!isLiked);
        onLike(id);
    };

    // Truncar conteúdo se muito longo
    const shouldTruncate = content && content.length > 150;
    const displayContent = shouldTruncate && !showFullContent
        ? content.substring(0, 150) + '...'
        : content;

    return (
        <div className="group bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/95">
            {/* Header do Post com gradiente sutil */}
            <div className="p-4 bg-gradient-to-r from-transparent to-purple-50/30 rounded-t-2xl">
                <div className="flex items-center justify-between">
                    <Link href={`/profile/${author.id}`} className="flex items-center space-x-3 group/author">
                        <div className="relative">
                            <img
                                src={authorAvatar}
                                alt={author.DisplayName || 'Usuário'}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-lg group-hover/author:ring-purple-300 transition-all duration-300"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 group-hover/author:text-purple-600 transition-colors duration-200">
                                {author.DisplayName || 'Usuário Anônimo'}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>
                                    {new Date(publishedDate).toLocaleDateString('pt-BR', {
                                        day: 'numeric',
                                        month: 'long',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                                {location && (
                                    <>
                                        <span>•</span>
                                        <div className="flex items-center space-x-1 text-purple-600">
                                            <MapPin className="w-3 h-3" />
                                            <span>{location}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </Link>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200">
                            <Bookmark className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Conteúdo do Post */}
            {content && (
                <div className="px-4 pb-3">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {displayContent}
                        {shouldTruncate && (
                            <button
                                onClick={() => setShowFullContent(!showFullContent)}
                                className="ml-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
                            >
                                {showFullContent ? 'Ver menos' : 'Ver mais'}
                            </button>
                        )}
                    </p>
                </div>
            )}

            {/* Mídia do Post com melhorias */}
            {videoUrl ? (
                <div className="mx-4 mb-4 bg-black rounded-xl overflow-hidden shadow-lg">
                    <video
                        src={videoUrl}
                        controls
                        className="w-full max-h-[500px] object-contain"
                        onError={(e) => console.error('Erro ao carregar vídeo:', e)}
                    />
                </div>
            ) : postImages.length > 0 && (
                <div className="mx-4 mb-4">
                    <div className={`grid gap-2 rounded-xl overflow-hidden shadow-lg ${
                        postImages.length === 1 ? 'grid-cols-1' :
                            postImages.length === 2 ? 'grid-cols-2' :
                                postImages.length === 3 ? 'grid-cols-2' :
                                    'grid-cols-2'
                    }`}>
                        {postImages.map((image, index) => (
                            <div
                                key={index}
                                className={`relative overflow-hidden group/image ${
                                    postImages.length === 3 && index === 0 ? 'row-span-2' : ''
                                } ${postImages.length === 1 ? 'aspect-video' : 'aspect-square'}`}
                            >
                                <img
                                    src={image}
                                    alt={`Imagem ${index + 1} do post`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-110"
                                    onError={(e) => {
                                        console.error('Erro ao carregar imagem:', image);
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/E5E7EB/9CA3AF?text=Erro';
                                    }}
                                />
                                {postImages.length > 4 && index === 3 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-semibold">
                                        +{postImages.length - 4}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Estatísticas com animação */}
            <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                    <span className="font-semibold hover:text-purple-600 cursor-pointer transition-colors">
                        {likes || 0} curtidas
                    </span>
                    <span className="hover:text-purple-600 cursor-pointer transition-colors">
                        {Math.floor(Math.random() * 50)} comentários
                    </span>
                </div>
                <span className="hover:text-purple-600 cursor-pointer transition-colors">
                    {Math.floor(Math.random() * 20)} compartilhamentos
                </span>
            </div>

            {/* Botões de Ação com animações */}
            <div className="px-2 py-2 flex items-center justify-around border-t border-gray-100">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                        isLiked
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                    }`}
                >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    Curtir
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-600 font-medium transition-all duration-200 transform hover:scale-105">
                    <MessageCircle className="w-5 h-5" />
                    Comentar
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-green-50 text-gray-600 hover:text-green-600 font-medium transition-all duration-200 transform hover:scale-105">
                    <Share2 className="w-5 h-5" />
                    Compartilhar
                </button>
            </div>
        </div>
    );
};

// --- CREATE POST COMPONENT ---
const CreatePost: FC<{ onPostCreated: (newPost: PostType) => void }> = ({ onPostCreated }) => {
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const { user } = useAuth();

    const userAvatar = user?.profile?.avatar?.url
        ? `${STRAPI_URL}${user.profile.avatar.url}`
        : `https://placehold.co/40x40/8B5CF6/FFFFFF?text=${user?.profile?.DisplayName?.charAt(0) || 'U'}`;

    const handleSubmit = async () => {
        if (!text.trim() || !user?.profile?.id) return;

        setIsSubmitting(true);
        try {
            const postData = {
                content: text,
                author: user.profile.id,
                publishedDate: new Date().toISOString()
            };

            const response = await postsAPI.createPost(postData);

            const newPostForUI: PostType = {
                id: response.data.id,
                ...response.data.attributes,
                author: user.profile
            };

            onPostCreated(newPostForUI);
            setText('');
            setIsFocused(false);
        } catch (error) {
            alert('Erro ao criar o post.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 transition-all duration-300 ${
            isFocused ? 'shadow-2xl ring-2 ring-purple-300' : ''
        }`}>
            <div className="p-4">
                <div className="flex items-start space-x-3">
                    <img
                        src={userAvatar}
                        alt="Seu avatar"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-lg"
                    />
                    <div className="flex-1">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            className="w-full text-base p-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none transition-all duration-200 border border-gray-200"
                            placeholder={`No que você está pensando, ${user?.profile?.DisplayName || ''}?`}
                            rows={isFocused ? 4 : 2}
                        />

                        {isFocused && (
                            <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors">
                                        <MapPin className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!text.trim() || isSubmitting}
                                    className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 ${
                                        !text.trim() || isSubmitting
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
                        )}
                    </div>
                </div>

                {!isFocused && (
                    <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100">
                        <button
                            onClick={handleSubmit}
                            disabled={!text.trim() || isSubmitting}
                            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 ${
                                !text.trim() || isSubmitting
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
                )}
            </div>
        </div>
    );
};

// --- FUNÇÃO HELPER PARA TRANSFORMAR DADOS - STRAPI V5 ---
const transformPostData = (rawPost: any): PostType | null => {
    console.log('=== TRANSFORMANDO POST (STRAPI V5) ===');
    console.log('Raw post recebido:', rawPost);

    if (!rawPost || typeof rawPost !== 'object' || !rawPost.id) {
        console.error('❌ Post inválido:', rawPost);
        return null;
    }

    const post = {
        id: rawPost.id,
        content: rawPost.content || '',
        likes: parseInt(rawPost.likes) || 0,
        shares: parseInt(rawPost.shares) || 0,
        isPublic: rawPost.isPublic ?? true,
        tags: rawPost.tags,
        location: rawPost.location,
        publishedDate: rawPost.publishedDate || rawPost.createdAt,
        createdAt: rawPost.createdAt,
        updatedAt: rawPost.updatedAt,

        author: rawPost.author || {
            id: 0,
            DisplayName: 'Usuário Desconhecido',
            isVerified: false,
            createdAt: '',
            updatedAt: ''
        },

        images: rawPost.images ? {
            data: rawPost.images.map((img: any) => ({
                id: img.id,
                attributes: {
                    name: img.name,
                    alternativeText: img.alternativeText,
                    caption: img.caption,
                    width: img.width,
                    height: img.height,
                    formats: img.formats,
                    url: img.url,
                    mime: img.mime,
                    size: img.size,
                    createdAt: img.createdAt,
                    updatedAt: img.updatedAt
                }
            }))
        } : undefined,

        video: rawPost.video ? {
            data: {
                id: rawPost.video.id,
                attributes: {
                    name: rawPost.video.name,
                    alternativeText: rawPost.video.alternativeText,
                    url: rawPost.video.url,
                    mime: rawPost.video.mime,
                    size: rawPost.video.size,
                    createdAt: rawPost.video.createdAt,
                    updatedAt: rawPost.video.updatedAt
                }
            }
        } : undefined
    };

    console.log('✅ Post transformado (v5):', {
        id: post.id,
        content: post.content.substring(0, 50) + '...',
        hasImages: !!post.images?.data?.length,
        imageCount: post.images?.data?.length || 0,
        hasVideo: !!post.video?.data,
        author: post.author.DisplayName
    });

    return post;
};

// --- FEED PAGE COMPONENT ---
const FeedPage = () => {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoading(true);

                console.log('🚀 Buscando posts com Strapi v5...');
                const response = await postsAPI.getPosts();
                console.log('📦 Resposta completa:', response);

                if (!response.data || !Array.isArray(response.data)) {
                    console.error('❌ Resposta da API inválida:', response);
                    setError('Dados inválidos recebidos da API.');
                    return;
                }

                console.log('📊 Total de posts recebidos:', response.data.length);

                const formattedPosts = response.data
                    .map(transformPostData)
                    .filter(post => post !== null);

                console.log('✅ Posts transformados:', formattedPosts.length);

                setPosts(formattedPosts);
                setError(null);
            } catch (err) {
                console.error("❌ Erro ao buscar posts:", err);
                setError('Falha ao carregar os posts.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleLike = async (postId: number) => {
        const originalPosts = [...posts];

        setPosts(posts.map(p =>
            p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p
        ));

        try {
            await postsAPI.likePost(postId);
        } catch (err) {
            setPosts(originalPosts);
            alert('Não foi possível curtir o post.');
        }
    };

    const addPostToFeed = (newPost: PostType) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    return (
        <div
            className="min-h-screen relative"
            style={{
                background: `
                    linear-gradient(135deg, 
                        rgba(139, 92, 246, 0.05) 0%, 
                        rgba(59, 130, 246, 0.05) 25%,
                        rgba(16, 185, 129, 0.05) 50%,
                        rgba(245, 158, 11, 0.05) 75%,
                        rgba(239, 68, 68, 0.05) 100%
                    ),
                    radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
        >
            <div className="max-w-2xl mx-auto space-y-6 py-8">
                <CreatePost onPostCreated={addPostToFeed} />

                {isLoading && (
                    <div className="space-y-6">
                        <PostSkeleton />
                        <PostSkeleton />
                        <PostSkeleton />
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-600 bg-red-50/80 backdrop-blur-sm p-6 rounded-2xl border border-red-200/50 shadow-lg">
                        <div className="text-lg font-semibold mb-2">Ops! Algo deu errado</div>
                        <div className="text-sm">{error}</div>
                    </div>
                )}

                {!isLoading && !error && posts.map((post, index) => (
                    <div
                        key={post.id}
                        style={{
                            animationDelay: `${index * 100}ms`
                        }}
                        className="animate-fade-in-up"
                    >
                        <PostCard post={post} onLike={handleLike} />
                    </div>
                ))}

                {!isLoading && !error && posts.length === 0 && (
                    <div className="text-center text-gray-600 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/30">
                        <div className="text-lg font-semibold mb-2">Nenhum post ainda</div>
                        <div className="text-sm">Seja o primeiro a compartilhar algo incrível!</div>
                    </div>
                )}
            </div>

            {/* CSS personalizado para animações */}
            <style jsx>{`
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default FeedPage;