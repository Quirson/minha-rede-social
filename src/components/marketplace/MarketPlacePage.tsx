"use client";
import React, { useState, useEffect } from "react";
import {
  Search, Filter, Grid, List, Star, Heart, ShoppingCart,
  MapPin, Eye, Share
} from "lucide-react";

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  rating?: number;
  reviews?: number;
  seller?: { name?: string; verified?: boolean; location?: string };
  isStock?: boolean;
  isFavorite?: boolean;
  views?: number;
};

const API_URL = "https://social-deal-backend.onrender.com";

const MarketplacePage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${API_URL}/api/products?populate=*`);
        const json = await res.json();
        const mapped = json.data.map((item: any) => {
          const attrs = item.attributes;
          return {
            id: item.id,
            title: attrs.title,
            description: attrs.description,
            price: attrs.price ?? 0,
            currency: attrs.currency ?? "USD",
            category: attrs.category ?? "others",
            images: attrs.images?.data?.map(
              (img: any) => API_URL + img.attributes.url
            ) ?? [],
            rating: attrs.rating ?? 0,
            reviews: attrs.reviews ?? 0,
            seller: {
              name: attrs.supplierName ?? "Desconhecido",
              verified: attrs.supplierVerified ?? false,
              location: attrs.supplierLocation ?? ""
            },
            isStock: attrs.inStock ?? true,
            isFavorite: false,
            views: attrs.views ?? 0
          } as Product;
        });
        setProducts(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ["all", ...Array.from(set)];
  }, [products]);

  const filtered = products.filter((p) => {
    const search = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const cat = selectedCategory === "all" || p.category === selectedCategory;
    const price = p.price >= priceRange[0] && p.price <= priceRange[1];
    return search && cat && price;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "price-low": return a.price - b.price;
      case "price-high": return b.price - a.price;
      case "rating": return (b.rating ?? 0) - (a.rating ?? 0);
      case "popular": return (b.views ?? 0) - (a.views ?? 0);
      default: return b.id - a.id; // newest first
    }
  });

  if (loading) return <div className="p-6">Carregando produtos...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
            <p className="text-gray-600">Produtos vindos do seu backend</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{products.length}</div>
              <div className="text-sm text-gray-500">Produtos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="newest">Mais Recentes</option>
              <option value="popular">Mais Populares</option>
              <option value="price-low">Menor Preço</option>
              <option value="price-high">Maior Preço</option>
              <option value="rating">Melhor Avaliação</option>
            </select>

            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Categoria</h3>
            <div className="space-y-2">
              {categories.map((c) => (
                <label key={c} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={c}
                    checked={selectedCategory === c}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-purple-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {c === "all" ? "Todos" : c}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Produtos */}
      <div className={viewMode === "grid"
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        : "space-y-4"
      }>
        {sorted.map((p) => (
          <div key={p.id} className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition ${viewMode === "list" ? "flex" : ""}`}>
            {/* Imagem */}
            {p.images?.[0] && (
              <img
                src={p.images[0]}
                alt={p.title}
                className={viewMode === "list" ? "w-48 object-cover" : "w-full aspect-square object-cover"}
              />
            )}
            <div className="p-4 flex-1">
              <h3 className="font-medium text-gray-900 line-clamp-2">{p.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
              <div className="mt-2 text-lg font-bold text-purple-600">
                {p.price} {p.currency}
              </div>
              <a
                href="#"
                className="mt-3 block bg-purple-600 text-white text-center py-2 rounded-lg"
              >
                Ver Produto
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplacePage;
