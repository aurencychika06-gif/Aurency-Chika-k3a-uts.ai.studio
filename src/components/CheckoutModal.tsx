import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Truck, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  Copy, 
  Check, 
  Upload, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/storeService';
import { Order, PaymentMethod } from '../types/store';
import { formatRupiah } from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated
}) => {
  const { cart, subtotal, clearCart } = useCart();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('Jakarta');
  const [courier, setCourier] = useState('JNE Regular (1-2 hari)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bca_transfer');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 300000;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 18000;
  const totalAmount = subtotal + shippingFee;

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMsg('Mohon lengkapi seluruh formulir data pengiriman Anda.');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('Keranjang Anda kosong.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = `TC-${Date.now().toString().slice(-6)}`;
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        category: item.product.category
      }));

      const newOrder = await createOrder({
        orderNumber,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        shippingCity,
        courier,
        notes: notes.trim(),
        items: orderItems,
        subtotal,
        shippingFee,
        discount: 0,
        totalAmount,
        status: 'menunggu_pembayaran',
        paymentMethod
      });

      // Clear cart
      clearCart();

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore
      }

      setCreatedOrder(newOrder);
      onOrderCreated(newOrder);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMsg(err?.message || 'Gagal membuat pesanan ke database Firestore. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-lg">
              {createdOrder ? 'Pesanan Berhasil Dibuat!' : 'Checkout & Pembayaran'}
            </h3>
            <p className="text-xs text-stone-500 font-mono">
              Chika Official Store • TasCantik Collection
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {createdOrder ? (
            /* Order Success State */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div>
                <h4 className="font-serif text-2xl font-bold text-stone-900">
                  Terima Kasih, {createdOrder.customerName}!
                </h4>
                <p className="text-sm text-stone-600 mt-1">
                  Pesanan Anda telah tercatat di real database Chika Official Store.
                </p>
                <div className="mt-3 inline-block bg-amber-50 border border-amber-300/80 px-4 py-1.5 rounded-full text-xs font-mono font-bold text-amber-900">
                  No. Order: #{createdOrder.orderNumber}
                </div>
              </div>

              {/* Payment Instruction Card */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-left space-y-3">
                <h5 className="font-semibold text-xs text-stone-700 uppercase font-mono tracking-wider">
                  Instruksi Transfer Pembayaran:
                </h5>

                <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-400 block font-mono">
                      {createdOrder.paymentMethod === 'bca_transfer'
                        ? 'Bank Central Asia (BCA)'
                        : createdOrder.paymentMethod === 'mandiri_transfer'
                        ? 'Bank Mandiri'
                        : 'QRIS / E-Wallet Instant'}
                    </span>
                    <span className="font-mono text-base font-bold text-stone-900">
                      {createdOrder.paymentMethod === 'bca_transfer'
                        ? '8270-192-8821'
                        : createdOrder.paymentMethod === 'mandiri_transfer'
                        ? '137-00-2918291-0'
                        : 'NMID: ID102938192831'}
                    </span>
                    <span className="text-[10px] text-stone-500 block">
                      a.n. Chika Official Store (TasCantik)
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      handleCopyAccount(
                        createdOrder.paymentMethod === 'bca_transfer'
                          ? '82701928821'
                          : createdOrder.paymentMethod === 'mandiri_transfer'
                          ? '1370029182910'
                          : 'ID102938192831'
                      )
                    }
                    className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium border border-stone-300"
                  >
                    {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBank ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>

                <div className="flex justify-between items-center text-sm pt-2 border-t border-stone-200">
                  <span className="text-stone-600">Total yang harus ditransfer:</span>
                  <span className="text-lg font-bold text-amber-800 font-sans">
                    {formatRupiah(createdOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Bukti Transfer Nanti / Di Menu Lacak</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-3 px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-sm transition-colors"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Customer Data */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase text-stone-500 tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-700" />
                  1. Informasi Penerima & Pengiriman
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Chika Aurelia"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      No. WhatsApp / HP <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Alamat Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@anda.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      Kota Tujuan
                    </label>
                    <select
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white"
                    >
                      <option value="Jakarta">Jakarta</option>
                      <option value="Bandung">Bandung</option>
                      <option value="Surabaya">Surabaya</option>
                      <option value="Semarang">Semarang</option>
                      <option value="Yogyakarta">Yogyakarta</option>
                      <option value="Medan">Medan</option>
                      <option value="Denpasar">Denpasar (Bali)</option>
                      <option value="Makassar">Makassar</option>
                      <option value="Kota Lainnya">Kota Lainnya di Indonesia</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Alamat Lengkap Pengiriman <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kode Pos"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white resize-none"
                  />
                </div>

                {/* Kurir Selection */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Pilihan Ekspedisi
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'JNE Regular (1-2 hari)', code: 'JNE' },
                      { name: 'SiCepat Best (1 hari)', code: 'SiCepat' },
                      { name: 'J&T Express (2-3 hari)', code: 'J&T' }
                    ].map((k) => (
                      <button
                        type="button"
                        key={k.code}
                        onClick={() => setCourier(k.name)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          courier === k.name
                            ? 'bg-amber-50 border-amber-600 text-amber-900 font-semibold'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="font-bold">{k.code}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          {subtotal >= FREE_SHIPPING_THRESHOLD ? 'Gratis Ongkir' : 'Rp 18.000'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Method */}
              <div className="space-y-3 pt-3 border-t border-stone-200">
                <h4 className="text-xs font-mono font-bold uppercase text-stone-500 tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  2. Metode Pembayaran Transfer & QRIS
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'bca_transfer', name: 'BCA Transfer', desc: 'No. Rek 8270-192-8821' },
                    { id: 'mandiri_transfer', name: 'Mandiri Transfer', desc: 'No. Rek 137-00-2918' },
                    { id: 'qris', name: 'QRIS & E-Wallet', desc: 'GoPay, OVO, ShopeePay' }
                  ].map((p) => (
                    <label
                      key={p.id}
                      className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                        paymentMethod === p.id
                          ? 'bg-amber-50 border-amber-600 ring-1 ring-amber-600'
                          : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-900">{p.name}</span>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={p.id}
                          checked={paymentMethod === p.id}
                          onChange={() => setPaymentMethod(p.id as PaymentMethod)}
                          className="accent-amber-700"
                        />
                      </div>
                      <span className="text-[10px] text-stone-500 mt-1 font-mono">{p.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="bg-stone-100 rounded-2xl p-4 border border-stone-200 space-y-2 text-xs">
                <div className="font-semibold text-stone-800 font-mono uppercase text-[11px] mb-2">
                  Ringkasan Tagihan ({cart.length} Produk):
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Total Harga Barang:</span>
                  <span className="font-medium text-stone-900">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Biaya Pengiriman ({courier.split(' ')[0]}):</span>
                  <span className={shippingFee === 0 ? 'font-bold text-emerald-700' : 'font-medium text-stone-900'}>
                    {shippingFee === 0 ? 'GRATIS (Promo)' : formatRupiah(shippingFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-bold text-stone-900">
                  <span>Total Tagihan:</span>
                  <span className="text-amber-800 text-base">{formatRupiah(totalAmount)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white font-semibold rounded-2xl text-sm transition-all shadow-lg shadow-amber-900/20 active:scale-98 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Memproses Pesanan ke Database...</span>
                ) : (
                  <>
                    <span>Bayar Sekarang ({formatRupiah(totalAmount)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
