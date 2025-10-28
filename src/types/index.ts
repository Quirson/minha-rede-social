// types.ts - TIPOS COMPLETOS E CORRETOS
export interface MediaFormat {
    name: string;
    hash: string;
    ext: string;
    mime: string;
    path: string | null;
    width: number;
    height: number;
    size: number;
    url: string;
}

export interface Media {
    id: number;
    attributes: {
        name: string;
        alternativeText: string | null;
        caption: string | null;
        width: number;
        height: number;
        formats: {
            thumbnail?: MediaFormat;
            small?: MediaFormat;
            medium?: MediaFormat;
            large?: MediaFormat;
        };
        hash: string;
        ext: string;
        mime: string;
        size: number;
        url: string;
        previewUrl: string | null;
        provider: string;
        provider_metadata: any;
        createdAt: string;
        updatedAt: string;
    };
}

export interface Profile {
    id: number;
    DisplayName: string;
    isVerified: boolean;
    Bio?: string;
    location?: string;
    website?: string;
    dateOfBirth?: string;
    createdAt: string;
    updatedAt: string;
    avatar?: { data?: Media };
    coverImage?: { data?: Media };
}

export interface User {
    id: number;
    username: string;
    email: string;
    provider: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string;
    updatedAt: string;
    profile?: Profile;
}

// ESTRUTURA RAW DO STRAPI
export interface PostRaw {
    id: number;
    attributes: {
        content: string;
        likes: number;
        shares: number;
        isPublic: boolean;
        tags?: string;
        location?: string;
        publishedDate: string;
        createdAt: string;
        updatedAt: string;
        author: { data: { id: number; attributes: Profile } };
        images?: { data?: Media[] };
        video?: { data?: Media };
    };
}

// ESTRUTURA "ACHATADA" PARA O COMPONENTE REACT
export interface Post {
    id: number;
    content: string;
    likes: number;
    shares: number;
    isPublic: boolean;
    tags?: string;
    location?: string;
    publishedDate: string;
    createdAt: string;
    updatedAt: string;
    author: Profile;
    images?: { data?: Media[] };
    video?: { data?: Media };
}

// TIPOS PARA PRODUCTS
export interface ProductCategory {
    id: number;
    attributes: {
        name: string;
        slug: string;
        description?: string;
        icon?: string;
        color?: string;
        createdAt: string;
        updatedAt: string;
    };
}

export interface ProductRaw {
    id: number;
    attributes: {
        title: string;
        description: string;
        price: number;
        currency: string;
        rating: number;
        reviewCount: number;
        isStock: boolean;
        stockQuantity: number;
        isFeatured: boolean;
        isOnSale: boolean;
        salePrice?: number;
        discountPercentage?: number;
        tags?: string;
        brand?: string;
        model?: string;
        condition: 'new' | 'used' | 'refurbished';
        shippingInfo?: string;
        returnPolicy?: string;
        views: number;
        likes: number;
        createdAt: string;
        updatedAt: string;
        publishedAt: string;
        category?: { data?: ProductCategory };
        seller: { data: { id: number; attributes: Profile } };
        images?: { data?: Media[] };
        gallery?: { data?: Media[] };
    };
}

export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    currency: string;
    rating: number;
    reviewCount: number;
    isStock: boolean;
    stockQuantity: number;
    isFeatured: boolean;
    isOnSale: boolean;
    salePrice?: number;
    discountPercentage?: number;
    tags?: string;
    brand?: string;
    model?: string;
    condition: 'new' | 'used' | 'refurbished';
    shippingInfo?: string;
    returnPolicy?: string;
    views: number;
    likes: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    category?: ProductCategory;
    seller: Profile;
    images?: { data?: Media[] };
    gallery?: { data?: Media[] };
    finalPrice: number;
}

export interface StrapiCollectionResponse<T> {
    data: T[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export interface LoginCredentials {
    email: any;
    identifier: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface AuthResponse {
    jwt: string;
    user: User;
}

// Função utilitária para transformar produtos
export const transformProductRaw = (raw: any): Product => {
    const attributes = raw.attributes || raw;

    const discountPercentage = attributes.isOnSale && attributes.salePrice
        ? Math.round(((attributes.price - attributes.salePrice) / attributes.price) * 100)
        : attributes.discountPercentage || 0;

    const finalPrice = attributes.isOnSale && attributes.salePrice
        ? attributes.salePrice
        : attributes.price;

    return {
        id: raw.id,
        title: attributes.title || '',
        description: attributes.description || '',
        price: attributes.price || 0,
        currency: attributes.currency || 'BRL',
        rating: attributes.rating || 0,
        reviewCount: attributes.reviewCount || 0,
        isStock: attributes.isStock ?? true,
        stockQuantity: attributes.stockQuantity || 0,
        isFeatured: attributes.isFeatured || false,
        isOnSale: attributes.isOnSale || false,
        salePrice: attributes.salePrice,
        discountPercentage,
        tags: attributes.tags,
        brand: attributes.brand,
        model: attributes.model,
        condition: attributes.condition || 'new',
        shippingInfo: attributes.shippingInfo,
        returnPolicy: attributes.returnPolicy,
        views: attributes.views || 0,
        likes: attributes.likes || 0,
        createdAt: attributes.createdAt,
        updatedAt: attributes.updatedAt,
        publishedAt: attributes.publishedAt,
        category: attributes.category?.data,
        seller: attributes.seller?.data?.attributes || {
            id: 0,
            DisplayName: 'Vendedor',
            isVerified: false,
            createdAt: '',
            updatedAt: ''
        },
        images: attributes.images,
        gallery: attributes.gallery,
        finalPrice
    };
};