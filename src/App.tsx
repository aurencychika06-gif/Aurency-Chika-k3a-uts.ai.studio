import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Product, Order, Customer, ProductCategory } from './types/store';
import { 
  seedProductsIfNeeded, 
  subscribeProducts, 
  subscribeOrders, 
  subscribeCustomers,
  resetProductsToDefault 
} from './services/storeService';
import { testConnection } from './firebase/config';
import { INITIAL_PRODUCTS } from './data/defaultProducts';

// Components
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { Footer } from './components/Footer';

// Admin Components
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminLoginModal } from './components/admin/AdminLoginModal';

function MainStore() {
  const { isAdmin } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();

  // Database States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // App Navigation / View State
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Modals
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingInitialOrderId, setTrackingInitialOrderId] = useState<string | undefined>();
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Initialize Firestore listeners
  useEffect(() => {
    // Test connection as required by skill
    testConnection();

    // Seed default 12 products if database is empty
    seedProductsIfNeeded();

    // Subscribe to products real-time
    const unsubscribeProducts = subscribeProducts((data) => {
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        // Fallback to initial products while seeding takes effect
        setProducts(INITIAL_PRODUCTS);
      }
      setIsLoadingProducts(false);
    });

    // Subscribe to orders real-time
    const unsubscribeOrders = subscribeOrders((data) => {
      setOrders(data);
    });

    // Subscribe to customers real-time
    const unsubscribeCustomers = subscribeCustomers((data) => {
      setCustomers(data);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeCustomers();
    };
  }, []);

  const handleOpenAdmin = () => {
    if (isAdmin) {
      setCurrentView('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleDirectBuy = (product: Product, quantity: number) => {
    setSelectedProductForDetail(null);
    addToCart(product, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCreated = (order: Order) => {
    setTrackingInitialOrderId(order.orderNumber);
  };

  const handleResetSeed = async () => {
    try {
      await resetProductsToDefault();
    } catch (e) {
      console.error(e);
    }
  };

  if (currentView === 'admin' && isAdmin) {
    return (
      <AdminPanel
        products={products}
        orders={orders}
        customers={customers}
        onBackToStore={() => setCurrentView('store')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Main Navbar */}
      <Navbar
        onOpenTracking={() => {
          setTrackingInitialOrderId(undefined);
          setIsTrackingOpen(true);
        }}
        onOpenAdmin={handleOpenAdmin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Hero Section */}
      <HeroBanner
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Product Catalog Grid (12 Products in 3 Categories) */}
      <main className="flex-1">
        <ProductGrid
          products={products}
          isLoading={isLoadingProducts}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onOpenDetail={(prod) => setSelectedProductForDetail(prod)}
          onResetSeed={handleResetSeed}
        />
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={setSelectedCategory}
        onOpenTracking={() => setIsTrackingOpen(true)}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onDirectBuy={handleDirectBuy}
      />

      {/* Order Tracking & Payment Proof Upload Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderId={trackingInitialOrderId}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setCurrentView('admin');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainStore />
      </CartProvider>
    </AuthProvider>
  );
}
