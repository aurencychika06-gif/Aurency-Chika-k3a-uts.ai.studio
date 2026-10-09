export type ProductCategory = 
  | 'Tote Bag & Workwear' 
  | 'Crossbody & Sling Bag' 
  | 'Backpack & Travel';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description: string;
  material: string;
  dimensions: string;
  weight: string;
  features: string[];
  image: string;
  images?: string[];
  rating: number;
  soldCount: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export type OrderStatus = 
  | 'menunggu_pembayaran' 
  | 'menunggu_verifikasi' 
  | 'diproses' 
  | 'dikirim' 
  | 'selesai' 
  | 'dibatalkan';

export type PaymentMethod = 'bca_transfer' | 'mandiri_transfer' | 'qris' | 'gopay';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  shippingCity: string;
  courier: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentProofUrl?: string;
  paymentProofDate?: string;
  paymentProofBank?: string;
  approvalNotes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  createdAt: string;
}
