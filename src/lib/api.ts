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
        const params = {
            populate: '*',
            sort: 'publishedDate:desc',
            'pagination[page]': page,
            'pagination[pageSize]': pageSize
        };

        console.log('Parâmetros sendo enviados para API (v5):', JSON.stringify(params, null, 2));
        const response = await api.get('/posts', { params });
        console.log('Resposta da API posts:', response.data);

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
        const currentPost = await api.get(`/posts/${postId}`);
        const currentLikes = currentPost.data.data.attributes.likes || 0;
        const response = await api.put(`/posts/${postId}`, {
            data: { likes: currentLikes + 1 }
        });
        return response.data;
    },

    getPost: async (id: number) => {
        const response = await api.get(`/posts/${id}?populate=*`);
        console.log('Post individual com populate=*:', response.data);
        return response.data;
    }
};

// PRODUCTS API MELHORADA COM MAIS FUNCIONALIDADES
export const productsAPI = {
    getProducts: async (options: {
        page?: number;
        pageSize?: number;
        category?: string;
        searchTerm?: string;
        sortBy?: string;
        minPrice?: number;
        maxPrice?: number;
        inStock?: boolean;
        featured?: boolean;
    } = {}) => {
        const {
            page = 1,
            pageSize = 12,
            category,
            searchTerm,
            sortBy = 'newest',
            minPrice,
            maxPrice,
            inStock,
            featured
        } = options;

        let params: any = {
            'pagination[page]': page,
            'pagination[pageSize]': pageSize,
            populate: '*'
        };

        // Filtros
        let filters: any = {};

        if (category && category !== 'all') {
            filters.category = { $eq: category };
        }

        if (searchTerm) {
            filters.$or = [
                { title: { $containsi: searchTerm } },
                { description: { $containsi: searchTerm } },
                { tags: { $containsi: searchTerm } }
            ];
        }

        if (minPrice !== undefined) {
            filters.price = { $gte: minPrice };
        }

        if (maxPrice !== undefined) {
            filters.price = { ...filters.price, $lte: maxPrice };
        }

        if (inStock !== undefined) {
            filters.isStock = { $eq: inStock };
        }

        if (featured) {
            filters.isFeatured = { $eq: true };
        }

        if (Object.keys(filters).length > 0) {
            Object.keys(filters).forEach(key => {
                params[`filters[${key}]`] = filters[key];
            });
        }

        // Ordenação
        switch (sortBy) {
            case 'price-low':
                params.sort = 'price:asc';
                break;
            case 'price-high':
                params.sort = 'price:desc';
                break;
            case 'rating':
                params.sort = 'rating:desc';
                break;
            case 'popular':
                params.sort = 'views:desc';
                break;
            case 'newest':
            default:
                params.sort = 'createdAt:desc';
                break;
        }

        const response = await api.get('/products', { params });
        return response.data;
    },

    getProduct: async (id: number) => {
        const response = await api.get(`/products/${id}?populate=*`);
        return response.data;
    },

    getFeaturedProducts: async (limit = 8) => {
        const response = await api.get(`/products?filters[isFeatured][$eq]=true&pagination[pageSize]=${limit}&populate=*`);
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/product-categories?populate=*');
        return response.data;
    },

    addToWishlist: async (productId: number) => {
        const response = await api.post('/wishlists', {
            data: { product: productId }
        });
        return response.data;
    },

    removeFromWishlist: async (productId: number) => {
        const response = await api.delete(`/wishlists/${productId}`);
        return response.data;
    },

    addToCart: async (productId: number, quantity = 1) => {
        const response = await api.post('/cart-items', {
            data: {
                product: productId,
                quantity
            }
        });
        return response.data;
    }
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