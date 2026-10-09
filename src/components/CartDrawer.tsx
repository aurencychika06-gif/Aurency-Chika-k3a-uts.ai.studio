import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../utils/formatters';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    isCartOpen,
    setIsCartOpen
  } = useCart();

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 300000;
  const isEligibleFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const freeShippingDifference = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-lg">Keranjang Belanja</h3>
                <p className="text-xs text-stone-500 font-mono">
                  {totalItems} barang • Chika Official Store
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-amber-50/80 border-b border-amber-200/60 px-5 py-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-amber-900 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-700" />
                {isEligibleFreeShipping ? '🎉 Anda Mendapatkan Gratis Ongkir!' : 'Klaim Gratis Ongkir'}
              </span>
              <span className="font-mono text-amber-800 font-semibold text-[11px]">
                {isEligibleFreeShipping ? 'Tercapai 100%' : `Kurang ${formatRupiah(freeShippingDifference)}`}
              </span>
            </div>
            <div className="w-full bg-amber-200/70 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-stone-400 space-y-4">
                <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-300">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-stone-700 text-lg">Keranjang Masih Kosong</h4>
                  <p className="text-xs text-stone-500 max-w-xs mt-1">
                    Temukan tas kerja, sling bag, atau ransel minimalis favorit Anda di katalog TasCantik.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-all shadow-sm"
                >
                  Mulai Belanja Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 bg-stone-50/70 hover:bg-stone-50 rounded-2xl border border-stone-200/80 transition-all"
                  >
                    {/* Item Image */}
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl bg-stone-200 flex-shrink-0"
                    />

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-serif font-semibold text-xs text-stone-900 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                            title="Hapus dari keranjang"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono block">
                          {item.product.category}
                        </span>
                        <div className="text-xs font-bold text-amber-800 font-sans mt-0.5">
                          {formatRupiah(item.product.price)}
                        </div>
                      </div>

                      {/* Quantity Selector & Item Subtotal */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 border border-stone-300 rounded-lg p-0.5 bg-white">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold font-mono text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-semibold text-stone-700">
                          {formatRupiah(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-stone-400 hover:text-rose-600 underline font-sans"
                  >
                    Kosongkan Semua Keranjang
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal Produk ({totalItems} pcs):</span>
                  <span className="font-semibold text-stone-900">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Perkiraan Ongkir:</span>
                  <span className="font-semibold text-emerald-700">
                    {isEligibleFreeShipping ? 'GRATIS' : 'Dihitung saat checkout'}
                  </span>
                </div>
                <div className="border-t border-stone-200/80 pt-2 flex justify-between text-sm font-bold text-stone-900">
                  <span>Total Estimasi:</span>
                  <span className="text-base text-amber-800">{formatRupiah(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 active:scale-98 transition-all"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transaksi Terenkripsi & Database Terhubung Real-Time</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
