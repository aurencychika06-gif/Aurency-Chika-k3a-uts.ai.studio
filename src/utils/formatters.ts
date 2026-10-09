export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return isoString;
  }
}

export interface StatusConfig {
  label: string;
  badgeClass: string;
  bgClass: string;
  dotColor: string;
}

export function getOrderStatusConfig(status: string): StatusConfig {
  switch (status) {
    case 'menunggu_pembayaran':
      return {
        label: 'Menunggu Pembayaran',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        bgClass: 'bg-amber-500',
        dotColor: '#f59e0b'
      };
    case 'menunggu_verifikasi':
      return {
        label: 'Menunggu Approval Bukti',
        badgeClass: 'bg-purple-50 text-purple-800 border-purple-200 animate-pulse',
        bgClass: 'bg-purple-500',
        dotColor: '#a855f7'
      };
    case 'diproses':
      return {
        label: 'Sedang Diproses',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        bgClass: 'bg-blue-500',
        dotColor: '#3b82f6'
      };
    case 'dikirim':
      return {
        label: 'Dalam Pengiriman',
        badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
        bgClass: 'bg-teal-500',
        dotColor: '#14b8a6'
      };
    case 'selesai':
      return {
        label: 'Pesanan Selesai',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        bgClass: 'bg-emerald-500',
        dotColor: '#10b981'
      };
    case 'dibatalkan':
      return {
        label: 'Dibatalkan',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        bgClass: 'bg-rose-500',
        dotColor: '#f43f5e'
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-stone-50 text-stone-700 border-stone-200',
        bgClass: 'bg-stone-400',
        dotColor: '#a8a29e'
      };
  }
}
