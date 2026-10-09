import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Check, 
  DollarSign, 
  X,
  CreditCard,
  User,
  ZoomIn
} from 'lucide-react';
import { Order } from '../../types/store';
import { approvePaymentProof, rejectPaymentProof } from '../../services/storeService';
import { formatRupiah, formatDate, getOrderStatusConfig } from '../../utils/formatters';

interface AdminApprovalProps {
  orders: Order[];
}

export const AdminApproval: React.FC<AdminApprovalProps> = ({ orders }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Rejection modal
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Nominal transfer tidak sesuai dengan total tagihan.');
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const pendingOrders = orders.filter((o) => o.status === 'menunggu_verifikasi' && o.paymentProofUrl);
  const allProofOrders = orders.filter((o) => Boolean(o.paymentProofUrl));

  const displayList = activeTab === 'pending' ? pendingOrders : allProofOrders;

  const handleApprove = async (orderId: string, orderNumber: string) => {
    setProcessingId(orderId);
    try {
      await approvePaymentProof(orderId, 'Pembayaran telah disetujui & diverifikasi oleh Admin Chika Official Store.');
      setFeedbackMsg(`Pesanan #${orderNumber} BERHASIL DISETUJUI! Status otomatis berubah ke 'Sedang Diproses'.`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Gagal menyetujui pembayaran di Firestore.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingOrder) return;

    setProcessingId(rejectingOrder.id);
    try {
      await rejectPaymentProof(rejectingOrder.id, rejectReason.trim());
      setFeedbackMsg(`Bukti transfer pesanan #${rejectingOrder.orderNumber} telah DITOLAK. Status dikembalikan ke 'Menunggu Pembayaran'.`);
      setRejectingOrder(null);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Gagal menolak bukti pembayaran di Firestore.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-serif font-bold text-white text-xl">
            Approval Bukti Pembayaran Pelanggan
          </h3>
          <p className="text-xs text-stone-400">
            Verifikasi transfer rekening & QRIS sebelum barang dipacking dan dikirim
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
              activeTab === 'pending'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950/30'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            Menunggu Approval ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
              activeTab === 'all'
                ? 'bg-stone-700 text-white border-stone-600'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
          >
            Semua Bukti ({allProofOrders.length})
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-900/60 border border-emerald-500 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Queue Cards */}
      {displayList.length === 0 ? (
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-12 text-center text-stone-500 space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <h4 className="font-serif font-bold text-white text-base">
            Semua Bukti Pembayaran Telah Diproses!
          </h4>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Tidak ada antrean bukti transfer yang tertunda saat ini. Bukti pembayaran baru dari pelanggan akan otomatis tampil di sini secara real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayList.map((ord) => {
            const isPending = ord.status === 'menunggu_verifikasi';
            const isProcessing = processingId === ord.id;
            const cfg = getOrderStatusConfig(ord.status);

            return (
              <div
                key={ord.id}
                className={`bg-stone-900/80 rounded-2xl border p-5 space-y-4 transition-all shadow-sm ${
                  isPending ? 'border-purple-600/60 ring-1 ring-purple-600/40' : 'border-stone-800'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-amber-400">
                      #{ord.orderNumber}
                    </span>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${cfg.badgeClass}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {formatDate(ord.paymentProofDate || ord.updatedAt)}
                  </span>
                </div>

                {/* Card Body: Image & Customer info */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Proof Image Box */}
                  <div className="relative group/img w-full sm:w-36 h-36 bg-stone-800 rounded-xl overflow-hidden border border-stone-700 flex-shrink-0">
                    <img
                      src={ord.paymentProofUrl}
                      alt="Struk Transfer"
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                    />
                    <button
                      onClick={() => setPreviewImage(ord.paymentProofUrl || null)}
                      className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-xs gap-1 transition-opacity"
                    >
                      <ZoomIn className="w-4 h-4" />
                      <span>Perbesar</span>
                    </button>
                  </div>

                  {/* Verification Details */}
                  <div className="flex-1 space-y-2 text-xs text-stone-300">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Pelanggan:</span>
                      <strong className="text-white text-sm">{ord.customerName}</strong>
                      <div className="text-[11px] text-stone-400 font-mono">{ord.customerEmail}</div>
                      <div className="text-[11px] text-stone-400 font-mono">WhatsApp: {ord.customerPhone}</div>
                    </div>

                    <div className="pt-1 border-t border-stone-800 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-stone-400 block text-[10px]">Bank / Metode:</span>
                        <span className="font-semibold text-purple-300 font-mono">
                          {ord.paymentProofBank || ord.paymentMethod}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Wajib Ditransfer:</span>
                        <span className="font-bold text-amber-300 font-sans text-sm">
                          {formatRupiah(ord.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {ord.approvalNotes && (
                      <div className="text-[11px] text-stone-400 bg-stone-800/60 p-2 rounded-lg">
                        <strong>Catatan:</strong> {ord.approvalNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setPreviewImage(ord.paymentProofUrl || null)}
                    className="text-stone-400 hover:text-white text-xs flex items-center gap-1 font-mono"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Full Size</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRejectingOrder(ord)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-rose-950/50 hover:text-rose-300 text-stone-300 border border-stone-700 hover:border-rose-700/60 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Tolak Bukti</span>
                    </button>

                    <button
                      onClick={() => handleApprove(ord.id, ord.orderNumber)}
                      disabled={isProcessing}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-emerald-950/30 disabled:opacity-50 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isProcessing ? 'Memproses...' : 'Setujui Pembayaran'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Full Size Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-stone-900 rounded-2xl p-2 border border-stone-700" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 bg-stone-800 hover:bg-stone-700 text-white rounded-full p-1.5 shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Bukti Transfer Penuh"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-stone-900 text-stone-100 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-base text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Tolak Bukti Transfer #{rejectingOrder.orderNumber}
              </h4>
              <button
                onClick={() => setRejectingOrder(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <p className="text-xs text-stone-300">
                Pilih atau tuliskan alasan penolakan agar pelanggan dapat memahami dan mengunggah ulang bukti pembayaran yang benar:
              </p>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Alasan Penolakan:
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 mb-2"
                >
                  <option value="Nominal transfer tidak sesuai dengan total tagihan.">Nominal transfer tidak sesuai dengan total tagihan.</option>
                  <option value="Foto bukti transfer buram atau tidak dapat dibaca.">Foto bukti transfer buram atau tidak dapat dibaca.</option>
                  <option value="Nomor rekening tujuan tidak cocok dengan toko kami.">Nomor rekening tujuan tidak cocok dengan toko kami.</option>
                  <option value="Bukti transfer terindikasi palsu atau kedaluwarsa.">Bukti transfer terindikasi palsu atau kedaluwarsa.</option>
                  <option value="Lainnya">Tulis Alasan Kustom</option>
                </select>

                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Keterangan penolakan untuk pelanggan..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingOrder(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processingId !== null}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
