import React, { useMemo, useState } from 'react';
import { Filter, SlidersHorizontal, RefreshCw, ShoppingBag } from 'lucide-react';
import { Product, ProductCategory } from '../types/store';
import { ProductCard } from './ProductCard';
import { CATEGORIES } from '../data/defaultProducts';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenDetail: (product: Product) => void;
  onResetSeed?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  searchQuery,
  selectedCategory,
  onSelectCategory,
  onOpenDetail,
  onResetSeed
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'popular' | 'stock'>('featured');

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== 'Semua') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => b.soldCount - a.soldCount);
        break;
      case 'stock':
        result.sort((a, b) => b.stock - a.stock);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="katalog">
      {/* Category Pills & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => onSelectCategory('Semua')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all border ${
              selectedCategory === 'Semua'
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            Semua ({products.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Sort and Count */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          <span className="text-xs text-stone-500 font-sans">
            Menampilkan <strong className="text-stone-800">{filteredAndSortedProducts.length}</strong> produk
          </span>

          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-1.5 shadow-sm text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-stone-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="featured">Pilihan Unggulan</option>
              <option value="popular">Terlaris (Paling Populer)</option>
              <option value="price_asc">Harga: Terendah ke Tertinggi</option>
              <option value="price_desc">Harga: Tertinggi ke Terendah</option>
              <option value="stock">Stok Terbanyak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-4 animate-pulse">
              <div className="aspect-[4/3] bg-stone-200 rounded-xl"></div>
              <div className="h-4 bg-stone-200 rounded w-3/4"></div>
              <div className="h-3 bg-stone-200 rounded w-1/2"></div>
              <div className="h-8 bg-stone-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 my-8 shadow-sm">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400 mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
            Produk Tidak Ditemukan
          </h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto mb-6">
            Tidak ada produk yang cocok dengan pencarian &quot;{searchQuery}&quot; pada kategori {selectedCategory}.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                onSelectCategory('Semua');
              }}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
            >
              Reset Filter Kategori
            </button>
            {onResetSeed && (
              <button
                onClick={onResetSeed}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Muat Ulang 12 Produk Default
              </button>
            )}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && filteredAndSortedProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      )}
    </section>
  );
};
