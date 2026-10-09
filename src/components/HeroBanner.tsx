import React from 'react';
import { Sparkles, Shield, Truck, RotateCcw, ArrowDown } from 'lucide-react';
import { ProductCategory } from '../types/store';

interface HeroBannerProps {
  onSelectCategory: (cat: ProductCategory | 'Semua') => void;
  selectedCategory: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory, selectedCategory }) => {
  return (
    <div className="relative bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-stone-100 overflow-hidden border-b border-stone-800">
      {/* Subtle background ambient lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-stone-700/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headline and Philosophy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800 border border-stone-700 text-amber-300 text-xs tracking-wider uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Koleksi Minimalis & Fungsional 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
              TasCantik
              <span className="block text-amber-400 text-3xl sm:text-4xl lg:text-5xl font-sans font-light mt-2">
                Chika Official Store
              </span>
            </h1>

            <p className="text-stone-300 text-base sm:text-lg max-w-xl font-light leading-relaxed">
              Dirancang dengan prinsip minimalis esensial dan ketahanan fungsional tinggi. Menemani produktivitas kerja, hangout santai, hingga mobilitas perjalanan harian Anda.
            </p>

            {/* Quick Category Badges */}
            <div className="pt-2">
              <p className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-3">
                Jelajahi 3 Kategori Utama (12 Produk Terkurasi):
              </p>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { name: 'Semua', count: '12 Produk' },
                  { name: 'Tote Bag & Workwear', count: '4 Model' },
                  { name: 'Crossbody & Sling Bag', count: '4 Model' },
                  { name: 'Backpack & Travel', count: '4 Model' }
                ].map((item) => {
                  const isActive = selectedCategory === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => onSelectCategory(item.name as any)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border ${
                        isActive
                          ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-900/30'
                          : 'bg-stone-800/90 hover:bg-stone-700/80 text-stone-200 border-stone-700'
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-amber-700 text-amber-100' : 'bg-stone-900 text-stone-400'
                      }`}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Value Props / Assurance */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-800/80 text-stone-300">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Original & Awet</h4>
                  <p className="text-[11px] text-stone-400">Material teruji tahan lama</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Pengiriman Cepat</h4>
                  <p className="text-[11px] text-stone-400">JNE, SiCepat & J&T Express</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Garansi Tukar</h4>
                  <p className="text-[11px] text-stone-400">7 hari jaminan kepuasan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Feature Card */}
          <div className="lg:col-span-5">
            <div className="relative group rounded-2xl overflow-hidden border border-stone-700 bg-stone-800/60 shadow-2xl">
              <div className="aspect-[4/3] sm:aspect-[16/11] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=80"
                  alt="TasCantik Minimalist Signature Series"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent"></div>
              
              <div className="absolute bottom-0 inset-x-0 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase bg-amber-500/90 text-stone-950 font-bold px-2 py-0.5 rounded">
                    Featured Choice
                  </span>
                  <span className="text-xs text-stone-300 font-mono">
                    Stok Terhubung Real Database
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white">
                  Signature Celine Leather & Canvas Series
                </h3>
                <p className="text-xs text-stone-300 line-clamp-2">
                  Didesain dengan partisi khusus laptop, botol minum, dan saku magnetik cepat. Hadirkan efisiensi gaya setiap hari.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
