import React, { useState } from 'react';
import { ShoppingBag, Eye, Star, Check, AlertCircle } from 'lucide-react';
import { Product } from '../types/store';
import { formatRupiah } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 8;

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group bg-white rounded-2xl border border-stone-200/90 hover:border-amber-500/50 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Product Image Box */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill Tag */}
        <div className="absolute top-3 left-3">
          <span className="text-[11px] font-medium bg-stone-900/80 backdrop-blur-md text-stone-100 px-2.5 py-1 rounded-full border border-stone-700 shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Habis
            </span>
          ) : isLowStock ? (
            <span className="text-[10px] font-semibold bg-amber-500/95 text-stone-950 px-2 py-0.5 rounded-full shadow-sm">
              Sisa {product.stock} pcs!
            </span>
          ) : (
            <span className="text-[10px] font-medium bg-emerald-600/90 text-white px-2 py-0.5 rounded-full shadow-sm">
              Stok: {product.stock}
            </span>
          )}
        </div>

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(product);
            }}
            className="p-2.5 rounded-full bg-white text-stone-900 hover:bg-stone-100 shadow-lg transition-transform active:scale-95"
            title="Lihat Detail Produk"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Info Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Rating & Sold count */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5 font-sans">
            <div className="flex items-center gap-1 text-amber-600 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
            <span>Terjual {product.soldCount}+</span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif font-semibold text-stone-900 text-base group-hover:text-amber-800 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Short description / material */}
          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>

          {/* Material highlight */}
          <div className="mt-2 text-[11px] text-stone-600 font-mono bg-stone-50 border border-stone-200/80 rounded-md px-2 py-1 line-clamp-1">
            Bahan: {product.material}
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-mono block">Harga Resmi</span>
            <span className="text-base sm:text-lg font-bold text-stone-900 font-sans tracking-tight">
              {formatRupiah(product.price)}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-900 hover:bg-amber-700 text-white active:scale-95'
            }`}
            title={isOutOfStock ? 'Stok habis' : 'Tambah ke keranjang'}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Masuk!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>+ Keranjang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
