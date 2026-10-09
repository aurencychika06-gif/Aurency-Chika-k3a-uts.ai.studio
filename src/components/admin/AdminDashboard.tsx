import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Package, 
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { Product, Order, Customer } from '../../types/store';
import { formatRupiah, formatDate, getOrderStatusConfig } from '../../utils/formatters';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  onNavigateToTab: (tab: string) => void;
  onOpenOrder: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  customers,
  onNavigateToTab,
  onOpenOrder
}) => {
  // Calculations
  const validOrders = orders.filter((o) => o.status !== 'dibatalkan');
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingApprovalOrders = orders.filter((o) => o.status === 'menunggu_verifikasi');
  const pendingPaymentOrders = orders.filter((o) => o.status === 'menunggu_pembayaran');
  const completedOrders = orders.filter((o) => o.status === 'selesai');
  const totalUnitsSold = validOrders.reduce((sum, o) => {
    return sum + o.items.reduce((iSum, it) => iSum + it.quantity, 0);
  }, 0);

  // Sales by Category
  const salesByCategory: Record<string, { count: number; revenue: number }> = {
    'Tote Bag & Workwear': { count: 0, revenue: 0 },
    'Crossbody & Sling Bag': { count: 0, revenue: 0 },
    'Backpack & Travel': { count: 0, revenue: 0 }
  };

  validOrders.forEach((o) => {
    o.items.forEach((it) => {
      const cat = it.category || 'Tote Bag & Workwear';
      if (!salesByCategory[cat]) {
        salesByCategory[cat] = { count: 0, revenue: 0 };
      }
      salesByCategory[cat].count += it.quantity;
      salesByCategory[cat].revenue += it.price * it.quantity;
    });
  });

  // Payment methods breakdown
  const paymentMethodCount: Record<string, number> = {};
  orders.forEach((o) => {
    paymentMethodCount[o.paymentMethod] = (paymentMethodCount[o.paymentMethod] || 0) + 1;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Alert banner if there are proofs waiting for approval */}
      {pendingApprovalOrders.length > 0 && (
        <div className="bg-purple-900/40 border border-purple-600/60 rounded-2xl p-4 text-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
              {pendingApprovalOrders.length}
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-white">
                Perhatian: {pendingApprovalOrders.length} Bukti Transfer Menunggu Approval!
              </h4>
              <p className="text-xs text-purple-200 font-sans">
                Pelanggan telah mengunggah bukti pembayaran. Segera periksa dan setujui untuk proses pengiriman tas.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('approval')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-md whitespace-nowrap"
          >
            Buka Antrean Approval →
          </button>
        </div>
      )}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-mono uppercase tracking-wider">Total Sales (Revenue)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-white">
            {formatRupiah(totalRevenue)}
          </div>
          <p className="text-[11px] text-stone-400 font-mono">
            Dari {validOrders.length} pesanan aktif (non-batal)
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-mono uppercase tracking-wider">Total Transaksi Order</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-white">
            {orders.length} <span className="text-sm font-normal text-stone-400">Pesanan</span>
          </div>
          <p className="text-[11px] text-amber-400 font-mono">
            {completedOrders.length} Selesai • {pendingPaymentOrders.length} Menunggu Bayar
          </p>
        </div>

        {/* Total Products Sold */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-mono uppercase tracking-wider">Tas Terjual (Volume)</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-white">
            {totalUnitsSold} <span className="text-sm font-normal text-stone-400">Pcs</span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono">
            Katalog: {products.length} model tas aktif
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-mono uppercase tracking-wider">Data Pelanggan</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-white">
            {customers.length} <span className="text-sm font-normal text-stone-400">Pelanggan</span>
          </div>
          <p className="text-[11px] text-stone-400 font-mono">
            Tersimpan di koleksi Firestore
          </p>
        </div>
      </div>

      {/* Breakdown: Sales by Category & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-white text-base">
              Laporan Penjualan per Kategori Produk
            </h3>
            <span className="text-[11px] text-stone-400 font-mono">Realtime Aggregation</span>
          </div>

          <div className="space-y-4">
            {Object.entries(salesByCategory).map(([catName, data]) => {
              const percentage = totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0;
              return (
                <div key={catName} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-stone-200">{catName}</span>
                    <span className="font-mono text-stone-400">
                      {formatRupiah(data.revenue)} ({data.count} pcs sold - {percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods & Quick Summary */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-white text-base">
              Distribusi Metode Pembayaran
            </h3>
            <span className="text-[11px] text-stone-400 font-mono">Database Transactions</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'bca_transfer', label: 'BCA Transfer', icon: '🏦' },
              { id: 'mandiri_transfer', label: 'Mandiri Transfer', icon: '🏛️' },
              { id: 'qris', label: 'QRIS & E-Wallet', icon: '📱' }
            ].map((m) => {
              const count = paymentMethodCount[m.id] || 0;
              return (
                <div key={m.id} className="bg-stone-800/70 border border-stone-700/80 rounded-xl p-3 text-center space-y-1">
                  <span className="text-xl block">{m.icon}</span>
                  <span className="text-xs font-semibold text-stone-200 block">{m.label}</span>
                  <span className="text-sm font-bold font-mono text-amber-400 block">{count} Order</span>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-stone-800/40 rounded-xl border border-stone-700/60 text-xs text-stone-300 flex items-center justify-between">
            <span>Perlu update status atau cetak resi pengiriman?</span>
            <button
              onClick={() => onNavigateToTab('orders')}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              Lihat Semua Order <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-white text-base">
              Riwayat Transaksi Terbaru
            </h3>
            <p className="text-xs text-stone-400">
              Sinkronisasi langsung dari database Cloud Firestore
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('orders')}
            className="text-xs text-amber-400 hover:text-amber-300 font-mono"
          >
            Lihat Semua ({orders.length}) →
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-stone-500 text-xs">
            Belum ada transaksi pesanan yang masuk. Silakan lakukan checkout di storefront untuk menguji alur.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-800/70 text-stone-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">No. Order</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Pelanggan</th>
                  <th className="py-2.5 px-3">Total Nominal</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Bukti Bayar</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800 text-stone-300">
                {orders.slice(0, 5).map((ord) => {
                  const cfg = getOrderStatusConfig(ord.status);
                  return (
                    <tr key={ord.id} className="hover:bg-stone-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        #{ord.orderNumber}
                      </td>
                      <td className="py-3 px-3 text-stone-400 font-mono">
                        {formatDate(ord.createdAt)}
                      </td>
                      <td className="py-3 px-3 font-medium text-white">
                        {ord.customerName}
                      </td>
                      <td className="py-3 px-3 font-bold text-stone-200">
                        {formatRupiah(ord.totalAmount)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badgeClass}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {ord.paymentProofUrl ? (
                          <span className="text-[10px] text-purple-400 font-mono">Ada Bukti</span>
                        ) : (
                          <span className="text-[10px] text-stone-500 font-mono">Belum Ada</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onOpenOrder(ord)}
                          className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs"
                        >
                          Kelola
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
