import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  Upload, 
  FileText, 
  Check, 
  Camera,
  Calendar,
  CreditCard
} from 'lucide-react';
import { Order } from '../types/store';
import { getOrderByIdOrNumber, submitPaymentProof } from '../services/storeService';
import { formatRupiah, formatDate, getOrderStatusConfig } from '../utils/formatters';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderId
}) => {
  const [searchQuery, setSearchQuery] = useState(initialOrderId || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Payment proof upload states
  const [bankSender, setBankSender] = useState('BCA');
  const [proofImageBase64, setProofImageBase64] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setErrorMsg('Masukkan nomor order atau alamat email pemesan.');
      return;
    }

    setIsSearching(true);
    setErrorMsg('');
    setUploadSuccessMsg('');

    try {
      const found = await getOrderByIdOrNumber(searchQuery.trim());
      if (found) {
        setOrder(found);
      } else {
        setOrder(null);
        setErrorMsg(`Pesanan dengan ID/Email "${searchQuery}" tidak ditemukan di database.`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan saat mencari pesanan di Firestore.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setProofImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (!proofImageBase64) {
      alert('Silakan pilih foto atau screenshot bukti transfer terlebih dahulu.');
      return;
    }

    setIsUploadingProof(true);
    try {
      await submitPaymentProof(
        order.id,
        proofImageBase64,
        bankSender,
        customerNotes
      );
      setUploadSuccessMsg('Bukti transfer berhasil diunggah! Status pesanan kini Menunggu Approval dari Tim Admin Chika Official.');
      // Refresh current order state
      const updated = await getOrderByIdOrNumber(order.id);
      if (updated) setOrder(updated);
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengunggah bukti pembayaran.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const statusConfig = order ? getOrderStatusConfig(order.status) : null;

  const steps = [
    { key: 'menunggu_pembayaran', title: 'Menunggu Pembayaran' },
    { key: 'menunggu_verifikasi', title: 'Verifikasi Bukti' },
    { key: 'diproses', title: 'Sedang Diproses' },
    { key: 'dikirim', title: 'Dalam Pengiriman' },
    { key: 'selesai', title: 'Selesai' }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'menunggu_pembayaran': return 0;
      case 'menunggu_verifikasi': return 1;
      case 'diproses': return 2;
      case 'dikirim': return 3;
      case 'selesai': return 4;
      default: return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                Lacak Pesanan & Upload Bukti Pembayaran
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Pemeriksaan Status Realtime • Chika Official Store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 max-h-[82vh] overflow-y-auto space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Masukkan Nomor Order (misal: TC-123456) atau Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSearching ? 'Mencari...' : 'Cari Order'}
            </button>
          </form>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {uploadSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          {/* Order Details View */}
          {order && (
            <div className="space-y-6 pt-2 border-t border-stone-200">
              
              {/* Order Meta Bar */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-stone-900">
                      #{order.orderNumber}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig?.badgeClass}`}>
                      {statusConfig?.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 font-mono">
                    Dipesan: {formatDate(order.createdAt)} • {order.customerName}
                  </p>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-[10px] text-stone-400 block uppercase font-mono">Total Pembayaran</span>
                  <span className="text-base font-bold text-amber-800 font-sans">
                    {formatRupiah(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Status Stepper */}
              <div className="py-2">
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-stone-200 z-0"></div>
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-600 transition-all duration-500 z-0"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  ></div>

                  {steps.map((st, idx) => {
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    return (
                      <div key={st.key} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                            isCurrent
                              ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                              : isDone
                              ? 'bg-amber-600 text-white'
                              : 'bg-white border-2 border-stone-300 text-stone-400'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[10px] font-mono mt-1 text-center max-w-[70px] ${
                          isCurrent ? 'font-bold text-amber-900' : 'text-stone-500'
                        }`}>
                          {st.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Details & Resi */}
              {order.trackingNumber && (
                <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-teal-700" />
                    <div>
                      <span className="font-semibold block">Paket Telah Dikirim ({order.courier})</span>
                      <span className="font-mono text-teal-800">No. Resi Pengiriman: <strong>{order.trackingNumber}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Approval Notes if Any */}
              {order.approvalNotes && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                  <span className="font-semibold block">Catatan Verifikasi Admin:</span>
                  <span className="mt-0.5 block">{order.approvalNotes}</span>
                </div>
              )}

              {/* Items in this Order */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider font-mono text-stone-500">
                  Rincian Barang yang Dipesan ({order.items.length}):
                </h5>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={it.image}
                          alt={it.name}
                          className="w-12 h-12 object-cover rounded-lg bg-stone-100"
                        />
                        <div>
                          <div className="font-semibold text-stone-900 line-clamp-1">{it.name}</div>
                          <div className="text-[11px] text-stone-500 font-mono">
                            {formatRupiah(it.price)} x {it.quantity} pcs
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-stone-900 font-sans">
                        {formatRupiah(it.price * it.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Proof Section: If already uploaded or needs upload */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-700" />
                    Bukti Pembayaran / Transfer
                  </h5>

                  {order.paymentProofUrl && (
                    <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-semibold">
                      Bukti Telah Diunggah
                    </span>
                  )}
                </div>

                {/* Display existing uploaded proof if available */}
                {order.paymentProofUrl ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-white border border-stone-200 rounded-xl flex items-center gap-3">
                      <img
                        src={order.paymentProofUrl}
                        alt="Bukti Transfer"
                        className="w-20 h-20 object-cover rounded-lg border border-stone-300 cursor-pointer hover:opacity-90"
                        onClick={() => window.open(order.paymentProofUrl, '_blank')}
                      />
                      <div className="text-xs space-y-1">
                        <div className="font-semibold text-stone-800">
                          Bank Pengirim: {order.paymentProofBank || 'Transfer Bank'}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          Diunggah pada: {formatDate(order.paymentProofDate || order.updatedAt)}
                        </div>
                        <div className="text-[11px] text-amber-800">
                          {order.status === 'diproses' || order.status === 'dikirim' || order.status === 'selesai'
                            ? '✅ Bukti transfer telah DISETUJUI oleh Admin.'
                            : '⏳ Sedang menunggu verifikasi dan approval admin.'}
                        </div>
                      </div>
                    </div>

                    {/* Option to replace proof if payment was rejected or requested */}
                    <details className="text-xs text-stone-600">
                      <summary className="cursor-pointer font-medium hover:text-amber-700">
                        Ingin mengunggah ulang bukti transfer baru?
                      </summary>
                      <div className="mt-3 pt-3 border-t border-stone-200">
                        {/* Render the upload form */}
                        <form onSubmit={handleUploadPaymentProof} className="space-y-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-xs text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
                          />
                          <button
                            type="submit"
                            disabled={isUploadingProof || !proofImageBase64}
                            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                          >
                            {isUploadingProof ? 'Mengunggah...' : 'Perbarui Bukti Pembayaran'}
                          </button>
                        </form>
                      </div>
                    </details>
                  </div>
                ) : (
                  /* Form to upload new proof */
                  <form onSubmit={handleUploadPaymentProof} className="space-y-3">
                    <p className="text-xs text-stone-600">
                      Unggah foto bukti struk ATM, tangkapan layar m-Banking, atau mutasi QRIS Anda agar admin dapat segera memproses pengiriman tas:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                          Bank / E-Wallet yang Anda Gunakan:
                        </label>
                        <select
                          value={bankSender}
                          onChange={(e) => setBankSender(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        >
                          <option value="BCA">Bank BCA</option>
                          <option value="Mandiri">Bank Mandiri</option>
                          <option value="BRI">Bank BRI</option>
                          <option value="BNI">Bank BNI</option>
                          <option value="QRIS / GoPay / OVO">QRIS / E-Wallet</option>
                          <option value="Bank Lainnya">Bank Lainnya</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                          Catatan Tambahan (Opsional):
                        </label>
                        <input
                          type="text"
                          placeholder="Misal: Atas nama Chika Aurelia"
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>
                    </div>

                    {/* File Input */}
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                        Pilih Gambar Bukti Transfer (JPG/PNG):
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                      />
                    </div>

                    {/* Preview Selected Image */}
                    {proofImageBase64 && (
                      <div className="relative inline-block border-2 border-dashed border-amber-300 rounded-xl p-1 bg-amber-50/50">
                        <img
                          src={proofImageBase64}
                          alt="Preview Bukti"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setProofImageBase64('')}
                          className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 text-xs shadow-md"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isUploadingProof || !proofImageBase64}
                      className="w-full py-3 px-4 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploadingProof ? 'Menyimpan ke Firestore...' : 'Kirim Bukti Pembayaran untuk Diverifikasi'}</span>
                    </button>
                  </form>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
