'use client';

import React, {useState, useEffect, useCallback, FC} from 'react';
import {
    Search, Filter, Grid, List, Star, Heart, ShoppingCart, Share,
    Eye, TrendingUp, Zap, Award, Shield, Crown, Flame, Check,
    ChevronLeft, ChevronRight
} from 'lucide-react';

// ========================================================================
// COMPONENTES PREMIUM
// ========================================================================

const HeroSection: FC = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative px-6 py-20 text-center">
            <div className="flex items-center justify-center mb-6">
                <Crown className="w-8 h-8 text-yellow-400 mr-2"/>
                <span className="text-yellow-400 font-bold text-lg">MARKETPLACE PREMIUM</span>
            </div>
            <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                Social Deal
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                Descubra produtos exclusivos da nossa comunidade. Compre, venda e conecte-se com pessoas incríveis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-2xl hover:scale-105 transform transition-all duration-300 flex items-center justify-center shadow-2xl">
                    <Zap className="w-5 h-5 mr-2"/>
                    Explorar Agora
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 mr-2"/>
                    Ver Tendências
                </button>
            </div>
        </div>
    </div>
);

const StatsSection: FC = () => {
    const stats = [
        {icon: ShoppingCart, label: "Produtos", value: "12.5K+", color: "text-purple-600"},
        {icon: Award, label: "Vendedores", value: "3.2K+", color: "text-blue-600"},
        {icon: Star, label: "Avaliações", value: "4.9/5", color: "text-yellow-600"},
        {icon: Shield, label: "Garantia", value: "100%", color: "text-green-600"}
    ];

    return (
        <div className="bg-white py-12 border-b">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center group hover:scale-105 transform transition-all duration-300">
                            <div className={`inline-flex p-4 rounded-2xl ${stat.color} bg-gray-50 mb-3 group-hover:bg-gray-100`}>
                                <stat.icon className="w-8 h-8"/>
                            </div>
                            <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                            <div className="text-gray-600 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProductSkeleton: FC = () => (
    <div className="bg-white rounded-3xl shadow-lg border overflow-hidden animate-pulse">
        <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300"></div>
        <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
            <div className="flex items-center space-x-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded-2xl mt-4"></div>
        </div>
    </div>
);

interface ProductType {
    id: number;
    title: string;
    price: number;
    salePrice?: number;
    currency: string;
    rating: number;
    reviewCount: number;
    isStock: boolean;
    isFeatured: boolean;
    isOnSale: boolean;
    discountPercentage?: number;
    seller: {
        DisplayName: string;
        isVerified: boolean;
    };
}

interface ProductCardProps {
    product: ProductType;
    onLike?: (id: number) => void;
    onShare?: (id: number) => void;
    onAddToCart?: (id: number) => void;
}

const ProductCard: FC<ProductCardProps> = ({product, onLike, onShare, onAddToCart}) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const staticImages = [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=400&fit=crop'
    ];

    const imageUrl = staticImages[(product.id - 1) % staticImages.length];

    const handleLike = () => {
        setIsLiked(!isLiked);
        onLike?.(product.id);
    };

    const handleProductClick = () => {
        window.location.href = `/products/${product.id}`;
    };

    return (
        <div
            className="bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden group transition-all duration-500 hover:scale-105 transform cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleProductClick}
        >
            <div className="relative aspect-square overflow-hidden">
                <img
                    src={imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isFeatured && (
                        <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-black rounded-full">
                            <Crown className="w-3 h-3 mr-1"/>
                            DESTAQUE
                        </div>
                    )}
                    {product.isOnSale && (
                        <div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-black rounded-full">
                            <Flame className="w-3 h-3 mr-1"/>
                            -{product.discountPercentage}%
                        </div>
                    )}
                    {!product.isStock && (
                        <div className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-full">
                            ESGOTADO
                        </div>
                    )}
                </div>

                <div className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 ${
                    isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleLike();
                        }}
                        className={`p-3 rounded-full backdrop-blur-sm border transition-all duration-300 hover:scale-110 ${
                            isLiked
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white/90 text-gray-700 border-white/50 hover:text-red-500'
                        }`}
                    >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}/>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onShare?.(product.id);
                        }}
                        className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 border border-white/50 hover:text-blue-500 hover:scale-110 transition-all duration-300"
                    >
                        <Share className="w-5 h-5"/>
                    </button>
                    <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 border border-white/50 hover:text-purple-500 hover:scale-110 transition-all duration-300">
                        <Eye className="w-5 h-5"/>
                    </button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="p-6">
                <div className="flex items-center mb-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold mr-2">
                        {product.seller?.DisplayName?.[0] || 'V'}
                    </div>
                    <span className="text-sm text-gray-600">{product.seller?.DisplayName || 'Vendedor'}</span>
                    {product.seller?.isVerified && <Check className="w-4 h-4 text-blue-500 ml-1"/>}
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                    {product.title}
                </h3>

                <div className="flex items-center mb-3">
                    <div className="flex items-center mr-2">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${
                                    i < Math.floor(product.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500 ml-1">({product.reviewCount || 0})</span>
                </div>

                <div className="mb-4">
                    <div className="flex items-end justify-between">
                        <div>
                            {product.isOnSale && product.salePrice ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-purple-600">
                                            {product.salePrice.toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: product.currency || 'BRL'
                                            })}
                                        </span>
                                        <span className="text-lg text-gray-400 line-through">
                                            {product.price.toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: product.currency || 'BRL'
                                            })}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <span className="text-2xl font-black text-purple-600">
                                    {product.price.toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: product.currency || 'BRL'
                                    })}
                                </span>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">Frete grátis</div>
                            <div className="flex items-center text-green-600 text-sm font-semibold">
                                <Shield className="w-3 h-3 mr-1"/>
                                Garantido
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart?.(product.id);
                    }}
                    disabled={!product.isStock}
                    className={`w-full py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        product.isStock
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 transform shadow-lg hover:shadow-xl'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <ShoppingCart className="w-5 h-5"/>
                    {product.isStock ? 'Adicionar ao Carrinho' : 'Indisponível'}
                </button>
            </div>
        </div>
    );
};

// ========================================================================
// COMPONENTE PRINCIPAL DO MARKETPLACE
// ========================================================================

const MarketplacePage = () => {
    const staticProducts: ProductType[] = [
        {
            id: 1,
            title: "Smartphone Premium XZ Pro Max",
            price: 2999.99,
            salePrice: 2499.99,
            currency: "BRL",
            rating: 4.8,
            reviewCount: 342,
            isStock: true,
            isFeatured: true,
            isOnSale: true,
            discountPercentage: 17,
            seller: { DisplayName: "Tech Store", isVerified: true }
        },
        {
            id: 2,
            title: "Notebook Gamer Pro Ultra RTX 4090",
            price: 5499.99,
            currency: "BRL",
            rating: 4.9,
            reviewCount: 128,
            isStock: true,
            isFeatured: true,
            isOnSale: false,
            seller: { DisplayName: "Gamer Shop", isVerified: true }
        },
        {
            id: 3,
            title: "Fone Bluetooth Premium Noise Cancelling",
            price: 899.99,
            salePrice: 699.99,
            currency: "BRL",
            rating: 4.7,
            reviewCount: 567,
            isStock: true,
            isFeatured: false,
            isOnSale: true,
            discountPercentage: 22,
            seller: { DisplayName: "Audio Master", isVerified: false }
        },
        {
            id: 4,
            title: "Smart Watch Elite Fitness Tracker",
            price: 1299.99,
            currency: "BRL",
            rating: 4.6,
            reviewCount: 234,
            isStock: false,
            isFeatured: false,
            isOnSale: false,
            seller: { DisplayName: "Wearables Co", isVerified: true }
        },
        {
            id: 5,
            title: "Câmera DSLR 4K Professional 50MP",
            price: 3799.99,
            salePrice: 3299.99,
            currency: "BRL",
            rating: 4.9,
            reviewCount: 89,
            isStock: true,
            isFeatured: true,
            isOnSale: true,
            discountPercentage: 13,
            seller: { DisplayName: "Photo Pro", isVerified: true }
        },
        {
            id: 6,
            title: "Tablet Ultra HD 12\" AMOLED Display",
            price: 2199.99,
            currency: "BRL",
            rating: 4.5,
            reviewCount: 456,
            isStock: true,
            isFeatured: false,
            isOnSale: false,
            seller: { DisplayName: "Mobile Store", isVerified: false }
        },
        {
            id: 7,
            title: "Console Next Gen 1TB SSD Gaming",
            price: 4299.99,
            salePrice: 3999.99,
            currency: "BRL",
            rating: 5.0,
            reviewCount: 1023,
            isStock: true,
            isFeatured: true,
            isOnSale: true,
            discountPercentage: 7,
            seller: { DisplayName: "Game Zone", isVerified: true }
        },
        {
            id: 8,
            title: "Drone 4K Pro GPS Gimbal 3 Eixos",
            price: 2899.99,
            currency: "BRL",
            rating: 4.8,
            reviewCount: 178,
            isStock: true,
            isFeatured: false,
            isOnSale: false,
            seller: { DisplayName: "Sky Tech", isVerified: true }
        }
    ];

    const [products, setProducts] = useState<ProductType[]>(staticProducts);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    const handleLikeProduct = (productId: number) => {
        console.log(`Liked product ${productId}`);
    };

    const handleShareProduct = (productId: number) => {
        console.log(`Shared product ${productId}`);
    };

    const handleAddToCart = (productId: number) => {
        console.log(`Added product ${productId} to cart`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <HeroSection/>
            <StatsSection/>

            <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por nome do produto..."
                                    className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                            >
                                <option value="all">Todas as Categorias</option>
                                <option value="electronics">Eletrônicos</option>
                                <option value="fashion">Moda</option>
                                <option value="home">Casa e Decoração</option>
                                <option value="sports">Esportes</option>
                            </select>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                            >
                                <option value="newest">Mais Recentes</option>
                                <option value="price-low">Menor Preço</option>
                                <option value="price-high">Maior Preço</option>
                                <option value="rating">Melhor Avaliação</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onLike={handleLikeProduct}
                            onShare={handleShareProduct}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MarketplacePage;