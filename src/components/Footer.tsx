import React from 'react';
import { ShieldCheck, Heart, Package, Phone, Mail, MapPin } from 'lucide-react';
import { ProductCategory } from '../types/store';

interface FooterProps {
  onSelectCategory: (cat: ProductCategory | 'Semua') => void;
  onOpenTracking: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenTracking,
  onOpenAdmin
}) => {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-serif font-bold text-lg">
                TC
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-wide">
                TasCantik
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed font-sans text-xs">
              Chika Official Store menghadirkan kurasi tas kerja, selempang, dan ransel minimalis dengan fungsionalitas tinggi untuk menemani mobilitas harian Anda.
            </p>
            <div className="flex items-center gap-2 text-stone-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Realtime Cloud Database Active</span>
            </div>
          </div>

          {/* Col 2: Kategori TasCantik */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm tracking-wide">
              Kategori Produk
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => onSelectCategory('Tote Bag & Workwear')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Tote Bag & Workwear (Laptop & Office)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Crossbody & Sling Bag')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Crossbody & Sling Bag (Casual Daily)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Backpack & Travel')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Backpack & Travel (Urban & Short Trip)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('Semua')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Semua 12 Model TasCantik
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan Pelanggan & Lacak */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm tracking-wide">
              Layanan & Bantuan
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Lacak Status Pesanan Anda
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-amber-400 transition-colors text-left"
                >
                  Upload Bukti Transfer Bank
                </button>
              </li>
              <li>
                <span className="text-stone-400 block">Garansi Penukaran 7 Hari</span>
              </li>
              <li>
                <span className="text-stone-400 block">Gratis Ongkir Min. Rp 300.000</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Informasi Toko & Portal Admin */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white text-sm tracking-wide">
              Chika Official Store
            </h4>
            <div className="space-y-2 text-stone-400 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>Jakarta Selatan, DKI Jakarta 12430</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>chika@official.store</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>WhatsApp: +62 812-3456-7890</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-800 rounded-lg text-xs font-mono transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Portal Login Admin</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            © 2026 TasCantik — Chika Official Store. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>BCA • Mandiri • QRIS • GoPay</span>
            <span>JNE • SiCepat • J&T</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
