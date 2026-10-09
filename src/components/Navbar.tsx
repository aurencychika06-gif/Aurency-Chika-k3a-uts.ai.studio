import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, Truck, Package, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenTracking: () => void;
  onOpenAdmin: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTracking,
  onOpenAdmin,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  onSelectCategory
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { isAdmin, adminName } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-stone-800 transition-all shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-amber-900/40 border-b border-amber-800/40 text-amber-200 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 font-medium">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>CHIKA OFFICIAL STORE • Koleksi TasCantik 2026 Original • Gratis Ongkir Seluruh Indonesia min. Rp 300rb</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectCategory('Semua')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-inner font-serif text-2xl font-bold tracking-tight">
              TC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-wide text-white">
                  TasCantik
                </span>
                <span className="text-[10px] tracking-widest uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/30">
                  OFFICIAL
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans tracking-wide">
                Chika Official Store • Minimalis & Fungsional
              </p>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Cari tas kerja, tote, ransel, selempang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-800/80 hover:bg-stone-800 focus:bg-stone-800 border border-stone-700/80 rounded-full pl-10 pr-4 py-2 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs bg-stone-700 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Lacak Pesanan Button */}
            <button
              onClick={onOpenTracking}
              className="hidden lg:flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors"
              title="Lacak Pesanan & Upload Bukti Transfer"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Lacak / Bukti Transfer</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                isAdmin 
                  ? 'bg-amber-600/30 text-amber-200 border-amber-500/50 hover:bg-amber-600/40' 
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700 hover:text-white'
              }`}
              title="Panel Manajemen Admin Toko"
            >
              <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-amber-400' : 'text-stone-400'}`} />
              <span className="hidden sm:inline">{isAdmin ? `Admin: ${adminName.split(' ')[0]}` : 'Admin Panel'}</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs rounded-lg shadow-sm transition-all active:scale-95"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Keranjang</span>
              {totalItems > 0 && (
                <span className="bg-white text-amber-900 font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-300 hover:text-white bg-stone-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-800 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Cari koleksi tas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg pl-9 pr-3 py-2 text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  onOpenTracking();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 text-sm bg-stone-800 rounded-lg text-stone-200"
              >
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  Lacak Pesanan / Upload Bukti
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 text-sm bg-stone-800 rounded-lg text-stone-200"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Admin Panel (Kelola Stok & Order)
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
