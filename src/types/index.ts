// types.ts - TIPOS CORRIGIDOS
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
    author: Profile; // <- AQUI: autor já "achatado"
    images?: { data?: Media[] };
    video?: { data?: Media };
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
