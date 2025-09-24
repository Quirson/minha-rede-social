"use client";
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
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DO MARKETPLACE ---
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

    // Debounce para a busca, para não fazer requisições a cada tecla digitada
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms de delay
        return () => clearTimeout(timerId);
    }, [searchTerm]);

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
            setProducts(response.data);
            setMeta(response.meta);
        } catch (err) {
            console.error("Erro ao buscar produtos:", err);
            setError("Não foi possível carregar os produtos. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearchTerm, selectedCategory, sortBy]);

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
        </div>
    );
};

export default MarketplacePage;
