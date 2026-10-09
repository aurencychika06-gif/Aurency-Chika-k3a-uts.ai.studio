import React, { useState } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Truck, Check, Minus, Plus, Zap } from 'lucide-react';
import { Product } from '../types/store';
import { formatRupiah } from '../utils/formatters';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onDirectBuy: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onDirectBuy
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    onDirectBuy(product, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-stone-700 shadow-md flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          
          {/* Left Column: Image */}
          <div className="relative bg-stone-100 flex items-center justify-center min-h-[300px] md:min-h-full">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover max-h-[460px]"
            />
            <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-md text-stone-100 text-xs px-3 py-1 rounded-full font-mono">
              {product.category}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Rating and Stock */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-600 font-semibold bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating.toFixed(1)} / 5.0</span>
                  <span className="text-stone-400">• ({product.soldCount} Terjual)</span>
                </div>

                <span className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isOutOfStock 
                    ? 'bg-rose-100 text-rose-800' 
                    : product.stock <= 8 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isOutOfStock ? 'Stok Habis' : `Tersedia: ${product.stock} pcs`}
                </span>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 leading-snug">
                  {product.name}
                </h2>
                <div className="text-2xl font-bold text-amber-800 font-sans mt-2">
                  {formatRupiah(product.price)}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                {product.description}
              </p>

              {/* Product Specifications Sheet */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2 text-xs">
                <div className="font-semibold text-stone-800 uppercase tracking-wider font-mono text-[11px] mb-1">
                  Spesifikasi Fungsional:
                </div>
                <div className="grid grid-cols-2 gap-2 text-stone-600">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Material:</span>
                    <span className="font-medium text-stone-800">{product.material}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Dimensi (P x T x L):</span>
                    <span className="font-medium text-stone-800">{product.dimensions}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Berat Bersih:</span>
                    <span className="font-medium text-stone-800">{product.weight}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Jaminan:</span>
                    <span className="font-medium text-stone-800">100% Original TasCantik</span>
                  </div>
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="pt-2 border-t border-stone-200 mt-2">
                    <span className="text-stone-400 block text-[10px] mb-1">Fitur Utama:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-stone-200 text-stone-700 px-2 py-0.5 rounded-md text-[11px]"
                        >
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Actions: Quantity & Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">Jumlah Pembelian:</span>
                <div className="flex items-center gap-2 border border-stone-300 rounded-xl p-1 bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-700 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-stone-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-700 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all border ${
                    isOutOfStock
                      ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border-stone-300 active:scale-95'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Berhasil Ditambah!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>+ Keranjang</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
                    isOutOfStock
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-amber-700 hover:bg-amber-800 text-white shadow-amber-900/20 active:scale-95'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Beli Sekarang</span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-stone-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Jaminan Asli
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-600" /> Siap Kirim Hari Ini
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
