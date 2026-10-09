import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ExternalLink, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Award,
  Calendar
} from 'lucide-react';
import { Customer } from '../../types/store';
import { formatRupiah, formatDate } from '../../utils/formatters';

interface AdminCustomersProps {
  customers: Customer[];
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ customers }) => {
  const [search, setSearch] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  const totalSpentAll = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgSpent = customers.length > 0 ? totalSpentAll / customers.length : 0;
  const topSpender = customers.length > 0 ? customers[0] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div>
        <h3 className="font-serif font-bold text-white text-xl">
          Direktori Data Pelanggan Chika Official Store
        </h3>
        <p className="text-xs text-stone-400">
          Data tersinkronisasi otomatis dari riwayat transaksi checkout ke Cloud Firestore
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-stone-400">Total Pelanggan Terdaftar</span>
          <div className="text-2xl font-bold font-sans text-white">
            {customers.length} <span className="text-xs text-stone-400 font-normal">Customer</span>
          </div>
          <p className="text-[11px] text-stone-500 font-mono">Diupdate secara realtime</p>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-stone-400">Rata-Rata Belanja (AOV)</span>
          <div className="text-2xl font-bold font-sans text-amber-300">
            {formatRupiah(avgSpent)}
          </div>
          <p className="text-[11px] text-stone-500 font-mono">Nilai transaksi rata-rata</p>
        </div>

        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-stone-400">Top Loyal Customer</span>
          <div className="text-base font-bold font-sans text-emerald-400 truncate">
            {topSpender ? topSpender.name : '-'}
          </div>
          <p className="text-[11px] text-stone-400 font-mono">
            {topSpender ? `${formatRupiah(topSpender.totalSpent)} (${topSpender.totalOrders} order)` : 'Belum ada transaksi'}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari pelanggan berdasarkan nama, email, nomor HP, atau kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-800/80 text-stone-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Nama Pelanggan</th>
                <th className="py-3 px-4">Kontak (Email / WhatsApp)</th>
                <th className="py-3 px-4">Kota & Alamat</th>
                <th className="py-3 px-4 text-center">Total Order</th>
                <th className="py-3 px-4">Total Belanja (LTV)</th>
                <th className="py-3 px-4 text-right">Order Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 text-stone-300">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-stone-500">
                    Belum ada data pelanggan yang tersimpan. Lakukan checkout untuk mengisi data.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-stone-800/40">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-600/30 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xs uppercase">
                          {cust.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{cust.name}</div>
                          <div className="text-[10px] text-stone-500 font-mono">ID: {cust.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="text-stone-300 font-mono text-[11px]">{cust.email}</div>
                        {cust.phone && (
                          <a
                            href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline text-[11px] font-mono flex items-center gap-1"
                          >
                            <span>{cust.phone}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-white">{cust.city || '-'}</span>
                      <p className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                        {cust.address || '-'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold px-2.5 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-200">
                        {cust.totalOrders || 1}x
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-amber-300 font-sans text-sm">
                      {formatRupiah(cust.totalSpent || 0)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-stone-400 font-mono text-[11px]">
                      {formatDate(cust.lastOrderDate || cust.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
