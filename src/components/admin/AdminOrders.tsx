import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Eye, 
  Truck, 
  Check, 
  X, 
  Clock, 
  AlertCircle,
  FileText,
  User,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/store';
import { updateOrderStatus } from '../../services/storeService';
import { formatRupiah, formatDate, getOrderStatusConfig } from '../../utils/formatters';

interface AdminOrdersProps {
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  selectedOrder,
  onSelectOrder
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');

  // Edit State in Order Detail Modal
  const [newStatus, setNewStatus] = useState<OrderStatus>('diproses');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleOpenDetail = (order: Order) => {
    onSelectOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setSuccessMsg('');
  };

  const handleUpdateStatusAndTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      await updateOrderStatus(selectedOrder.id, newStatus, trackingNumber.trim());
      setSuccessMsg(`Status pes #${selectedOrder.orderNumber} berhasil diperbarui menjadi ${newStatus}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error(err);
      alert('Gagal memperbarui status order di Firestore.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'Semua' || o.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.shippingCity.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif font-bold text-white text-xl">
            Kelola Data Order & Riwayat Pesanan
          </h3>
          <p className="text-xs text-stone-400">
            Total {orders.length} riwayat transaksi terekam di Firestore
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-900/80 p-4 rounded-2xl border border-stone-800 space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'Semua', label: `Semua (${orders.length})` },
            { id: 'menunggu_verifikasi', label: `Perlu Approval (${orders.filter(o => o.status === 'menunggu_verifikasi').length})` },
            { id: 'menunggu_pembayaran', label: `Belum Bayar (${orders.filter(o => o.status === 'menunggu_pembayaran').length})` },
            { id: 'diproses', label: `Diproses (${orders.filter(o => o.status === 'diproses').length})` },
            { id: 'dikirim', label: `Dikirim (${orders.filter(o => o.status === 'dikirim').length})` },
            { id: 'selesai', label: `Selesai (${orders.filter(o => o.status === 'selesai').length})` },
            { id: 'dibatalkan', label: `Batal (${orders.filter(o => o.status === 'dibatalkan').length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border ${
                statusFilter === tab.id
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan No. Order, Nama Pelanggan, Email, atau Kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-800/80 text-stone-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Order</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Barang</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Bukti Transfer</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 text-stone-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-stone-500">
                    Tidak ada transaksi dengan kriteria filter tersebut.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const cfg = getOrderStatusConfig(ord.status);
                  return (
                    <tr key={ord.id} className="hover:bg-stone-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        #{ord.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-stone-400 font-mono">
                        {formatDate(ord.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{ord.customerName}</div>
                        <div className="text-[11px] text-stone-400 font-mono">{ord.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-stone-300">
                          {ord.items.length} item ({ord.items.reduce((s, i) => s + i.quantity, 0)} pcs)
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white font-sans">
                        {formatRupiah(ord.totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badgeClass}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {ord.paymentProofUrl ? (
                          <div className="flex items-center gap-1.5">
                            <img
                              src={ord.paymentProofUrl}
                              alt="Proof"
                              className="w-6 h-6 object-cover rounded border border-stone-600 cursor-pointer"
                              onClick={() => handleOpenDetail(ord)}
                            />
                            <span className="text-[10px] text-purple-300 font-mono">Tersedia</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-500 font-mono">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(ord)}
                          className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium border border-stone-700"
                        >
                          Detail & Resi
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-stone-900 text-stone-100 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-lg text-white">
                  Rincian Order #{selectedOrder.orderNumber}
                </h4>
                <p className="text-xs text-stone-400 font-mono">
                  Dibuat pada: {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => onSelectOrder(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {successMsg && (
                <div className="p-3 bg-emerald-900/60 border border-emerald-500 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Customer Contact Box */}
              <div className="bg-stone-800/60 rounded-2xl p-4 border border-stone-700/80 space-y-2 text-xs">
                <span className="font-mono uppercase text-[10px] text-amber-400 font-bold block">
                  Informasi Pelanggan & Alamat Kirim:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-300">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Nama Pemesan:</span>
                    <strong className="text-white text-sm">{selectedOrder.customerName}</strong>
                    <div className="text-[11px] text-stone-400">{selectedOrder.customerEmail}</div>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">No. WhatsApp:</span>
                    <a
                      href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline font-mono inline-flex items-center gap-1"
                    >
                      {selectedOrder.customerPhone} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-stone-400 block text-[10px]">Alamat Pengiriman ({selectedOrder.shippingCity}):</span>
                    <p className="text-stone-200 mt-0.5">{selectedOrder.customerAddress}</p>
                    <span className="text-[11px] text-stone-400 font-mono mt-1 block">
                      Kurir: {selectedOrder.courier}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="font-mono uppercase text-[10px] text-stone-400 font-bold block">
                  Produk yang Dipesan ({selectedOrder.items.length}):
                </span>
                <div className="divide-y divide-stone-800 border border-stone-800 rounded-xl overflow-hidden bg-stone-800/40">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.image}
                          alt={it.name}
                          className="w-10 h-10 object-cover rounded-lg bg-stone-700"
                        />
                        <div>
                          <div className="font-semibold text-white">{it.name}</div>
                          <div className="text-[11px] text-stone-400 font-mono">
                            {formatRupiah(it.price)} × {it.quantity} pcs
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-amber-300 font-sans">
                        {formatRupiah(it.price * it.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs px-2 pt-1 font-mono text-stone-300">
                  <span>Total Tagihan:</span>
                  <span className="text-base font-bold text-amber-400 font-sans">
                    {formatRupiah(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Proof View if Available */}
              {selectedOrder.paymentProofUrl && (
                <div className="bg-stone-800/60 rounded-2xl p-4 border border-stone-700/80 space-y-3">
                  <span className="font-mono uppercase text-[10px] text-purple-400 font-bold block">
                    Bukti Transfer dari Pelanggan:
                  </span>
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedOrder.paymentProofUrl}
                      alt="Proof"
                      className="w-28 h-28 object-cover rounded-xl border border-stone-600 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(selectedOrder.paymentProofUrl, '_blank')}
                      title="Klik untuk melihat ukuran penuh"
                    />
                    <div className="text-xs space-y-1">
                      <div className="text-stone-300">Bank Pengirim: <strong className="text-white">{selectedOrder.paymentProofBank || 'Bank Transfer'}</strong></div>
                      <div className="text-stone-400 font-mono text-[11px]">Waktu Unggah: {formatDate(selectedOrder.paymentProofDate || selectedOrder.updatedAt)}</div>
                      {selectedOrder.approvalNotes && (
                        <div className="text-amber-300 text-[11px] pt-1">
                          Catatan: {selectedOrder.approvalNotes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status & Resi Form */}
              <form onSubmit={handleUpdateStatusAndTracking} className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700 space-y-3">
                <span className="font-mono uppercase text-[10px] text-stone-300 font-bold block">
                  Perbarui Status & Masukkan No. Resi:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 block mb-1">
                      Status Pesanan:
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full bg-stone-700 border border-stone-600 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
                      <option value="menunggu_verifikasi">Menunggu Approval Bukti</option>
                      <option value="diproses">Sedang Diproses (Disetujui)</option>
                      <option value="dikirim">Dalam Pengiriman (Dikirim)</option>
                      <option value="selesai">Selesai</option>
                      <option value="dibatalkan">Dibatalkan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-400 block mb-1">
                      Nomor Resi Pengiriman:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: JNE82910382918"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full bg-stone-700 border border-stone-600 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  {isUpdating ? 'Menyimpan ke Firestore...' : 'Simpan Perubahan Status & Resi'}
                </button>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
