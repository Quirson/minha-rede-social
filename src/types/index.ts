// types.ts - TIPOS COMPLETOS
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

// ESTRUTURA RAW DO STRAPI (como vem da API)
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

// NOVOS TIPOS PARA PRODUCTS
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
        category: { data?: ProductCategory };
        seller: { data: { id: number; attributes: Profile } };
        images?: { data?: Media[] };
        gallery?: { data?: Media[] };
    };
}

// ESTRUTURA "ACHATADA" PARA O COMPONENTE
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
    // Campos computados
    discountPercentage?: number;
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

// TIPOS PARA FILTROS E BUSCA
export interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    condition?: string;
    inStock?: boolean;
    onSale?: boolean;
    featured?: boolean;
    brand?: string;
}

export interface ProductSearchOptions {
    page?: number;
    pageSize?: number;
    searchTerm?: string;
    sortBy?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'rating' | 'popular' | 'name-asc' | 'name-desc';
    filters?: ProductFilters;
}

// TIPOS PARA CARRINHO E WISHLIST
export interface CartItem {
    id: number;
    product: Product;
    quantity: number;
    addedAt: string;
}

export interface WishlistItem {
    id: number;
    product: Product;
    addedAt: string;
}

// UTILITÁRIO PARA CONVERTER DADOS RAW EM LIMPOS
export const transformProductRaw = (raw: ProductRaw): Product => {
    const { attributes } = raw;
    const discountPercentage = attributes.isOnSale && attributes.salePrice
        ? Math.round(((attributes.price - attributes.salePrice) / attributes.price) * 100)
        : undefined;

    const finalPrice = attributes.isOnSale && attributes.salePrice
        ? attributes.salePrice
        : attributes.price;

    return {
        id: raw.id,
        ...attributes,
        category: attributes.category?.data,
        seller: attributes.seller.data.attributes,
        discountPercentage,
        finalPrice
    };
};