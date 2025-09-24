import React, { useState } from 'react';
import {
    Search,
    Filter,
    Grid,
    List,
    Star,
    Heart,
    ShoppingCart,
    MapPin,
    Eye,
    Share,
    DollarSign,
    Package,
    ChevronDown,
    X
} from 'lucide-react';

const MarketplacePage = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const categories = [
        { id: 'all', label: 'Todos', count: 150 },
        { id: 'electronics', label: 'Eletrônicos', count: 45 },
        { id: 'fashion', label: 'Moda', count: 32 },
        { id: 'home', label: 'Casa & Jardim', count: 28 },
        { id: 'sports', label: 'Esportes', count: 22 },
        { id: 'books', label: 'Livros', count: 15 },
        { id: 'toys', label: 'Brinquedos', count: 8 }
    ];

    const products = [
        {
            id: 1,
            title: 'iPhone 14 Pro Max 128GB',
            description: 'Smartphone Apple iPhone 14 Pro Max com câmera profissional e chip A16 Bionic.',
            price: 899.99,
            currency: 'USD',
            images: ['/api/placeholder/300/300'],
            category: 'electronics',
            rating: 4.8,
            reviews: 124,
            seller: {
                name: 'TechStore',
                avatar: '/api/placeholder/40/40',
                rating: 4.9,
                verified: true
            },
            location: 'São Paulo, SP',
            isStock: true,
            isFavorite: false,
            views: 1250
        },
        {
            id: 2,
            title: 'MacBook Air M2 13"',
            description: 'Notebook Apple MacBook Air com chip M2, tela Liquid Retina de 13 polegadas.',
            price: 1299.99,
            currency: 'USD',
            images: ['/api/placeholder/300/300'],
            category: 'electronics',
            rating: 4.9,
            reviews: 89,
            seller: {
                name: 'Apple Store',
                avatar: '/api/placeholder/40/40',
                rating: 5.0,
                verified: true
            },
            location: 'Rio de Janeiro, RJ',
            isStock: true,
            isFavorite: true,
            views: 980
        },
        {
            id: 3,
            title: 'Tênis Nike Air Force 1',
            description: 'Tênis Nike Air Force 1 clássico, confortável e durável. Disponível em várias cores.',
            price: 120.00,
            currency: 'USD',
            images: ['/api/placeholder/300/300'],
            category: 'fashion',
            rating: 4.6,
            reviews: 256,
            seller: {
                name: 'SneakerWorld',
                avatar: '/api/placeholder/40/40',
                rating: 4.7,
                verified: false
            },
            location: 'Belo Horizonte, MG',
            isStock: true,
            isFavorite: false,
            views: 756
        },
        {
            id: 4,
            title: 'Cadeira Gamer RGB',
            description: 'Cadeira gamer ergonômica com iluminação RGB, suporte lombar e braços ajustáveis.',
            price: 299.99,
            currency: 'USD',
            images: ['/api/placeholder/300/300'],
            category: 'home',
            rating: 4.4,
            reviews: 78,
            seller: {
                name: 'GameSetup',
                avatar: '/api/placeholder/40/40',
                rating: 4.5,
                verified: true
            },
            location: 'Porto Alegre, RS',
            isStock: false,
            isFavorite: false,
            views: 432
        },
        {
            id: 5,
            title: 'Bicicleta Mountain Bike',
            description: 'Bicicleta mountain bike 21 marchas, quadro de alumínio, ideal para trilhas.',
            price: 450.00,
            currency: 'USD',
            images: ['/api/placeholder/300/300'],
            category: 'sports',
            rating: 4.7,
            reviews: 143,
            seller: {
                name: 'BikeShop',
                avatar: '/api/placeholder/40/40',
                rating: 4.8,
                verified: true
            },
            location: 'Curitiba, PR',
            isStock: true,
            isFavorite: true,
            views: 892
        },
        {
            id: 6,
            title: 'Kit de Livros Ficção Científica',
            description: 'Coleção com 5 livros clássicos de ficção científica, incluindo obras de Isaac Asimov.',
            price: 75.00,
            currency: 'USD',
            images: ['/api/placeholder/300/300'],
            category: 'books',
            rating: 4.9,
            reviews: 67,
            seller: {
                name: 'BookLovers',
                avatar: '/api/placeholder/40/40',
                rating: 4.9,
                verified: false
            },
            location: 'Brasília, DF',
            isStock: true,
            isFavorite: false,
            views: 234
        }
    ];

    const handleFavorite = (productId: number) => {
        console.log('Toggle favorite:', productId);
    };

    const handleShare = (productId: number) => {
        console.log('Share product:', productId);
    };

    const handleAddToCart = (productId: number) => {
        console.log('Add to cart:', productId);
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

        return matchesSearch && matchesCategory && matchesPrice;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low': return a.price - b.price;
            case 'price-high': return b.price - a.price;
            case 'rating': return b.rating - a.rating;
            case 'popular': return b.views - a.views;
            default: return b.id - a.id; // newest first
        }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 lg:pb-6">
            {/* Header do Marketplace */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
                        <p className="text-gray-600">Descubra produtos incríveis da nossa comunidade</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">150</div>
                            <div className="text-sm text-gray-500">Produtos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">45</div>
                            <div className="text-sm text-gray-500">Vendedores</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Barra de Pesquisa */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar produtos..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Controles */}
                    <div className="flex items-center space-x-3">
                        {/* Botão de Filtros */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filtros</span>
                        </button>

                        {/* Ordenação */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="newest">Mais Recentes</option>
                            <option value="popular">Mais Populares</option>
                            <option value="price-low">Menor Preço</option>
                            <option value="price-high">Maior Preço</option>
                            <option value="rating">Melhor Avaliação</option>
                        </select>

                        {/* Modo de Visualização */}
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Painel de Filtros */}
                {showFilters && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Categorias */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">Categoria</h3>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <label key={category.id} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={category.id}
                                                checked={selectedCategory === category.id}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="text-purple-600"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">
                        {category.label} ({category.count})
                      </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Faixa de Preço */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">Preço</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">$0</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="2000"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                            className="flex-1"
                                        />
                                        <span className="text-sm text-gray-600">$2000</span>
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        Até: ${priceRange[1]}
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">Status</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="text-purple-600" />
                                        <span className="ml-2 text-sm text-gray-700">Em Estoque</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="text-purple-600" />
                                        <span className="ml-2 text-sm text-gray-700">Vendedores Verificados</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Grid de Produtos */}
            <div className={viewMode === 'grid' ?
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' :
                'space-y-4'
            }>
                {sortedProducts.map((product) => (
                    <div
                        key={product.id}
                        className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 ${
                            viewMode === 'list' ? 'flex' : ''
                        }`}
                    >
                        {/* Imagem do Produto */}
                        <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
                            <div className="w-full h-full bg-gray-200"></div>

                            {/* Badge de Status */}
                            {!product.isStock && (
                                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                    Esgotado
                                </div>
                            )}

                            {/* Ações */}
                            <div className="absolute top-2 right-2 flex flex-col space-y-1">
                                <button
                                    onClick={() => handleFavorite(product.id)}
                                    className={`p-1.5 rounded-full ${product.isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-600'} shadow-sm`}
                                >
                                    <Heart className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleShare(product.id)}
                                    className="p-1.5 bg-white text-gray-600 rounded-full shadow-sm"
                                >
                                    <Share className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Visualizações */}
                            <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                <Eye className="w-3 h-3" />
                                <span>{product.views}</span>
                            </div>
                        </div>

                        {/* Informações do Produto */}
                        <div className="p-4 flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-medium text-gray-900 line-clamp-2">{product.title}</h3>
                                <div className="text-right ml-2">
                                    <div className="text-lg font-bold text-purple-600">
                                        ${product.price.toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                            {/* Rating */}
                            <div className="flex items-center space-x-1 mb-3">
                                <div className="flex">
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
                                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} avaliações)
                </span>
                            </div>

                            {/* Vendedor */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 flex items-center">
                                            {product.seller.name}
                                            {product.seller.verified && (
                                                <div className="w-3 h-3 bg-blue-500 rounded-full ml-1"></div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <MapPin className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-500">{product.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botão de Ação */}
                            <button
                                onClick={() => handleAddToCart(product.id)}
                                disabled={!product.isStock}
                                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                                    product.isStock
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span>{product.isStock ? 'Adicionar ao Carrinho' : 'Indisponível'}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Paginação */}
            <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Anterior
                    </button>
                    <button className="px-3 py-2 bg-purple-600 text-white rounded-lg">1</button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
                    <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Próximo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketplacePage;