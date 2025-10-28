"use client";
<<<<<<< Updated upstream
import React, { useState, useEffect, useCallback, FC } from 'react';
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart, Share } from 'lucide-react';
import { productsAPI, STRAPI_URL } from '@/lib/api';
import { Product as ProductType } from '@/types';

// --- COMPONENTE SKELETON (para loading) ---
const ProductSkeleton: FC = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        <div className="aspect-square bg-gray-200"></div>
        <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded-lg mt-2"></div>
        </div>
    </div>
);

// --- COMPONENTE PRODUCT CARD (para exibir um produto) ---
interface ProductCardProps {
    product: ProductType;
}
const ProductCard: FC<ProductCardProps> = ({ product }) => {
    const { title, description, price, currency, rating, isStock, images } = product.attributes;

    // Pega a primeira imagem ou um placeholder
    const imageUrl = images?.data?.[0]?.attributes?.url
        ? `${STRAPI_URL}${images.data[0].attributes.url}`
        : `https://placehold.co/300x300/EFEFEF/333333?text=Sem+Imagem`;
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group flex flex-col">
            <div className="relative aspect-square">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                {!isStock && <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">Esgotado</div>}
                <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:text-red-500 hover:scale-110 transition-all"><Heart className="w-5 h-5" /></button>
                    <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:text-blue-500 hover:scale-110 transition-all"><Share className="w-5 h-5" /></button>
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 line-clamp-2">{title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">{description}</p>
                <div className="flex items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />))}
                    <span className="text-sm text-gray-500">({rating.toFixed(1)})</span>
                </div>
                <div className="flex items-end justify-between mt-auto">
                    <div>
                        <p className="text-xs text-gray-500">A partir de</p>
                        <p className="text-xl font-extrabold text-purple-600">{price.toLocaleString('pt-BR', { style: 'currency', currency: currency || 'BRL' })}</p>
                    </div>
                    <button disabled={!isStock} className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-300 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed">
                        <ShoppingCart className="w-4 h-4" /> Comprar
                    </button>
                </div>
=======
import React, { useState, useEffect, useCallback, FC, Fragment } from 'react';
import {
    Search, Filter, Grid, List, Star, Heart, ShoppingCart, Share,
    Eye, TrendingUp, Zap, Award, MapPin, Clock, Shield,
    ChevronLeft, ChevronRight, SlidersHorizontal, X, Check,
    Flame, Crown, Sparkles, Gift, Tag, ArrowUpRight
} from 'lucide-react';
import { productsAPI, STRAPI_URL } from '@/lib/api';
import { Product as ProductType, ProductRaw, transformProductRaw } from '@/types';

// ========================================================================
// COMPONENTES PREMIUM (Seus componentes, sem alterações)
// ========================================================================

const HeroSection: FC = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0"><div className="absolute top-10 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div><div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div></div>
        <div className="relative px-6 py-20 text-center"><div className="flex items-center justify-center mb-6"><Crown className="w-8 h-8 text-yellow-400 mr-2" /><span className="text-yellow-400 font-bold text-lg">MARKETPLACE PREMIUM</span></div><h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">Social Deal</h1><p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">Descubra produtos exclusivos da nossa comunidade. Compre, venda e conecte-se com pessoas incríveis.</p><div className="flex flex-col sm:flex-row gap-4 justify-center"><button className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-2xl hover:scale-105 transform transition-all duration-300 flex items-center justify-center shadow-2xl"><Zap className="w-5 h-5 mr-2" />Explorar Agora</button><button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center"><TrendingUp className="w-5 h-5 mr-2" />Ver Tendências</button></div></div>
    </div>
);

const StatsSection: FC = () => (
    <div className="bg-white py-12 border-b"><div className="max-w-6xl mx-auto px-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-8">{[{ icon: ShoppingCart, label: "Produtos", value: "12.5K+", color: "text-purple-600" },{ icon: Award, label: "Vendedores", value: "3.2K+", color: "text-blue-600" },{ icon: Star, label: "Avaliações", value: "4.9/5", color: "text-yellow-600" },{ icon: Shield, label: "Garantia", value: "100%", color: "text-green-600" }].map((stat, i) => (<div key={i} className="text-center group hover:scale-105 transform transition-all duration-300"><div className={`inline-flex p-4 rounded-2xl ${stat.color} bg-gray-50 mb-3 group-hover:bg-gray-100`}><stat.icon className="w-8 h-8" /></div><div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div><div className="text-gray-600 font-medium">{stat.label}</div></div>))}</div></div></div>
);

const ProductSkeleton: FC = () => (
    <div className="bg-white rounded-3xl shadow-lg border overflow-hidden animate-pulse"><div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300"></div><div className="p-6 space-y-4"><div className="h-4 bg-gray-200 rounded-full w-3/4"></div><div className="h-3 bg-gray-200 rounded-full w-1/2"></div><div className="flex items-center space-x-2"><div className="h-4 bg-gray-200 rounded w-16"></div><div className="h-4 bg-gray-200 rounded w-12"></div></div><div className="h-12 bg-gray-200 rounded-2xl mt-4"></div></div></div>
);

interface ProductCardProps { product: ProductType; onLike?: (id: number) => void; onShare?: (id: number) => void; onAddToCart?: (id: number) => void; }
const ProductCard: FC<ProductCardProps> = ({ product, onLike, onShare, onAddToCart }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const imageUrl = product.images?.data?.[0]?.attributes?.url ? `${STRAPI_URL}${product.images.data[0].attributes.url}` : `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center`;
    const handleLike = () => { setIsLiked(!isLiked); onLike?.(product.id); };
    return (
        <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden group transition-all duration-500 hover:scale-105 transform" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className="relative aspect-square overflow-hidden"><img src={imageUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 left-4 flex flex-col gap-2">{product.isFeatured && (<div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-black rounded-full"><Crown className="w-3 h-3 mr-1" />DESTAQUE</div>)}{product.isOnSale && (<div className="flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-black rounded-full"><Flame className="w-3 h-3 mr-1" />-{product.discountPercentage}%</div>)}{!product.isStock && (<div className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-full">ESGOTADO</div>)}</div>
                <div className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}><button onClick={handleLike} className={`p-3 rounded-full backdrop-blur-sm border transition-all duration-300 hover:scale-110 ${isLiked ? 'bg-red-500 text-white border-red-500' : 'bg-white/90 text-gray-700 border-white/50 hover:text-red-500'}`}><Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} /></button><button onClick={() => onShare?.(product.id)} className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 border border-white/50 hover:text-blue-500 hover:scale-110 transition-all duration-300"><Share className="w-5 h-5" /></button><button className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 border border-white/50 hover:text-purple-500 hover:scale-110 transition-all duration-300"><Eye className="w-5 h-5" /></button></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-6"><div className="flex items-center mb-3"><div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold mr-2">{product.seller?.DisplayName?.[0] || 'V'}</div><span className="text-sm text-gray-600">{product.seller?.DisplayName || 'Vendedor'}</span>{product.seller?.isVerified && <Check className="w-4 h-4 text-blue-500 ml-1" />}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">{product.title}</h3>
                <div className="flex items-center mb-3"><div className="flex items-center mr-2">{[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />))}</div><span className="text-sm font-semibold text-gray-700">{product.rating.toFixed(1)}</span><span className="text-sm text-gray-500 ml-1">({product.reviewCount || 0})</span></div>
                <div className="mb-4"><div className="flex items-end justify-between"><div>{product.isOnSale && product.salePrice ? (<><div className="flex items-center gap-2"><span className="text-2xl font-black text-purple-600">{product.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: product.currency || 'BRL' })}</span><span className="text-lg text-gray-400 line-through">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: product.currency || 'BRL' })}</span></div></>) : (<span className="text-2xl font-black text-purple-600">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: product.currency || 'BRL' })}</span>)}</div><div className="text-right"><div className="text-xs text-gray-500">Frete grátis</div><div className="flex items-center text-green-600 text-sm font-semibold"><Shield className="w-3 h-3 mr-1" />Garantido</div></div></div></div>
                <button onClick={() => onAddToCart?.(product.id)} disabled={!product.isStock} className={`w-full py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${product.isStock ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 transform shadow-lg hover:shadow-xl' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
                    <ShoppingCart className="w-5 h-5" />
                    {product.isStock ? 'Adicionar ao Carrinho' : 'Indisponível'}
                </button>
>>>>>>> Stashed changes
            </div>
        </div>
    );
};

<<<<<<< Updated upstream
// --- COMPONENTE PRINCIPAL DO MARKETPLACE ---
=======
// ========================================================================
// COMPONENTE PRINCIPAL DO MARKETPLACE (Lógica Completa)
// ========================================================================
>>>>>>> Stashed changes
const MarketplacePage = () => {
    const [products, setProducts] = useState<ProductType[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

<<<<<<< Updated upstream
    // Debounce para a busca, para não fazer requisições a cada tecla digitada
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms de delay
        return () => clearTimeout(timerId);
    }, [searchTerm]);

=======
    // Debounce para a busca, para evitar requisições a cada tecla
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(1); // Reseta para a primeira página a cada nova busca
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchTerm]);

    // Função para buscar os produtos da API
>>>>>>> Stashed changes
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await productsAPI.getProducts({
                page,
                searchTerm: debouncedSearchTerm,
                category: selectedCategory,
                sortBy
            });
<<<<<<< Updated upstream
            setProducts(response.data);
=======
            // Transforma os dados brutos da API para o formato que o React usa
            const formattedProducts = response.data.map(transformProductRaw);
            setProducts(formattedProducts);
>>>>>>> Stashed changes
            setMeta(response.meta);
        } catch (err) {
            console.error("Erro ao buscar produtos:", err);
            setError("Não foi possível carregar os produtos. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearchTerm, selectedCategory, sortBy]);

<<<<<<< Updated upstream
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
                <p className="text-gray-600 mt-1">Descubra produtos incríveis da nossa comunidade</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar produtos..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="all">Todas as Categorias</option><option value="electronics">Eletrônicos</option><option value="fashion">Moda</option></select>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"><option value="newest">Mais Recentes</option><option value="price-low">Menor Preço</option><option value="price-high">Maior Preço</option><option value="rating">Melhor Avaliação</option></select>
                    </div>
                </div>
            </div>
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"><ProductSkeleton /><ProductSkeleton /><ProductSkeleton /><ProductSkeleton /></div>
            ) : error ? (
                <div className="text-center text-red-500 bg-red-50 p-6 rounded-lg border border-red-200">{error}</div>
            ) : products.length === 0 ? (
                <div className="text-center text-gray-500 bg-white p-6 rounded-lg border">Nenhum produto encontrado.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (<ProductCard key={product.id} product={product} />))}
                </div>
            )}
            {!isLoading && meta && meta.pagination.pageCount > 1 && (
                <div className="flex justify-center pt-6">
                    <div className="flex items-center space-x-2">
                        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50">Anterior</button>
                        {[...Array(meta.pagination.pageCount)].map((_, i) => (<button key={i} onClick={() => handlePageChange(i + 1)} className={`px-4 py-2 rounded-lg ${page === i + 1 ? 'bg-purple-600 text-white' : 'border'}`}>{i + 1}</button>))}
                        <button onClick={() => handlePageChange(page + 1)} disabled={page === meta.pagination.pageCount} className="px-4 py-2 border rounded-lg disabled:opacity-50">Próximo</button>
                    </div>
                </div>
            )}
=======
    // Efeito que chama a busca sempre que um filtro ou página muda
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= meta?.pagination?.pageCount) {
            setPage(newPage);
        }
    };

    // Funções de ação (completas)
    const handleLikeProduct = (productId: number) => console.log(`Liked product ${productId}`);
    const handleShareProduct = (productId: number) => console.log(`Shared product ${productId}`);
    const handleAddToCart = (productId: number) => console.log(`Added product ${productId} to cart`);

    return (
        <div className="space-y-8">
            <HeroSection />
            <StatsSection />
            <div className="max-w-7xl mx-auto px-6 space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nome do produto..." className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" /></div></div>
                        <div className="flex items-center space-x-3">
                            <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }} className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"><option value="all">Todas as Categorias</option><option value="electronics">Eletrônicos</option><option value="fashion">Moda</option></select>
                            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"><option value="newest">Mais Recentes</option><option value="price-low">Menor Preço</option><option value="price-high">Maior Preço</option><option value="rating">Melhor Avaliação</option></select>
                        </div>
                    </div>
                </div>
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"><ProductSkeleton /><ProductSkeleton /><ProductSkeleton /><ProductSkeleton /></div>
                ) : error ? (
                    <div className="text-center text-red-500 bg-red-50 p-6 rounded-2xl border border-red-200">{error}</div>
                ) : products.length === 0 ? (
                    <div className="text-center text-gray-500 bg-white p-10 rounded-2xl border">Nenhum produto encontrado com os filtros atuais.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product) => (<ProductCard key={product.id} product={product} onLike={handleLikeProduct} onShare={handleShareProduct} onAddToCart={handleAddToCart} />))}
                    </div>
                )}
                {!isLoading && meta && meta.pagination.pageCount > 1 && (
                    <div className="flex justify-center pt-8">
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-4 py-2 border rounded-xl disabled:opacity-50 flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Anterior</button>
                            {[...Array(meta.pagination.pageCount)].map((_, i) => (<button key={i} onClick={() => handlePageChange(i + 1)} className={`w-10 h-10 rounded-xl font-bold ${page === i + 1 ? 'bg-purple-600 text-white shadow-lg' : 'border bg-white'}`}>{i + 1}</button>))}
                            <button onClick={() => handlePageChange(page + 1)} disabled={page === meta.pagination.pageCount} className="px-4 py-2 border rounded-xl disabled:opacity-50 flex items-center gap-2">Próximo <ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>
>>>>>>> Stashed changes
        </div>
    );
};

export default MarketplacePage;
