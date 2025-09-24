import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterCredentials, StrapiCollectionResponse, PostRaw } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api';
export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post('/auth/local', credentials);
        return response.data;
    },
    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        const { confirmPassword, ...registerData } = credentials;
        const response = await api.post('/auth/local/register', registerData);
        return response.data;
    },
    me: async () => {
        const response = await api.get('/users/me?populate=profile.avatar');
        return response.data;
    },
};

export const postsAPI = {
    getPosts: async (page = 1, pageSize = 10): Promise<StrapiCollectionResponse<PostRaw>> => {
        // STRAPI V5 usa populate=* de forma diferente
        const params = {
            populate: '*', // Simplificado para Strapi v5
            sort: 'publishedDate:desc',
            'pagination[page]': page,
            'pagination[pageSize]': pageSize
        };

        console.log('Parâmetros sendo enviados para API (v5):', JSON.stringify(params, null, 2));

        const response = await api.get('/posts', { params });

        console.log('Resposta da API posts:', response.data);

        // Debug específico para mídia no Strapi v5
        if (response.data.data && response.data.data.length > 0) {
            response.data.data.forEach((post: any, index: number) => {
                console.log(`Post ${index + 1} (v5):`, {
                    id: post.id,
                    hasAttributes: !!post.attributes,
                    directImages: post.images,
                    directVideo: post.video,
                    attributesImages: post.attributes?.images,
                    attributesVideo: post.attributes?.video
                });
            });
        }

        return response.data;
    },

    createPost: async (postData: any) => {
        const response = await api.post('/posts', { data: postData });
        return response.data;
    },

    likePost: async (postId: number) => {
        // Primeiro, busca o post atual para pegar o número de likes
        const currentPost = await api.get(`/posts/${postId}`);
        const currentLikes = currentPost.data.data.attributes.likes || 0;

        // Incrementa os likes
        const response = await api.put(`/posts/${postId}`, {
            data: { likes: currentLikes + 1 }
        });
        return response.data;
    },

    // Função adicional para debug - REMOVA EM PRODUÇÃO
    getPost: async (id: number) => {
        const response = await api.get(`/posts/${id}?populate=*`);
        console.log('Post individual com populate=*:', response.data);
        return response.data;
    }
};

export const productsAPI = {
    getProducts: async (page = 1, pageSize = 12, category?: string) => {
        let url = `/products?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`;
        if (category) {
            url += `&filters[category][$eq]=${category}`;
        }
        const response = await api.get(url);
        return response.data;
    },
    getProduct: async (id: number) => {
        const response = await api.get(`/products/${id}?populate=*`);
        return response.data;
    },
};

export const messagesAPI = {
    getMessages: async (chatRoom: string) => {
        const response = await api.get(`/chat-messages?filters[chatRoom][$eq]=${chatRoom}&populate=*&sort=createdAt:asc`);
        return response.data;
    },
    sendMessage: async (messageData: any) => {
        const response = await api.post('/chat-messages', { data: messageData });
        return response.data;
    },
};

export const groupsAPI = {
    getGroups: async (page = 1, pageSize = 10) => {
        const response = await api.get(`/groups?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`);
        return response.data;
    },
    createGroup: async (groupData: any) => {
        const response = await api.post('/groups', { data: groupData });
        return response.data;
    },
};

export const profileAPI = {
    getProfile: async (id: number) => {
        const response = await api.get(`/profiles/${id}?populate=*`);
        return response.data;
    },
    updateProfile: async (id: number, profileData: any) => {
        const response = await api.put(`/profiles/${id}`, {
            data: profileData
        });
        return response.data;
    },
};

export default api;