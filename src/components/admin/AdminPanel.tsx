import React, { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  CheckCircle, 
  Users, 
  Store, 
  LogOut, 
  Database, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Product, Order, Customer } from '../../types/store';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminApproval } from './AdminApproval';
import { AdminCustomers } from './AdminCustomers';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  onBackToStore: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  orders,
  customers,
  onBackToStore
}) => {
  const { adminName, adminEmail, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'orders' | 'approval' | 'customers'>('sales');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  const pendingApprovalsCount = orders.filter((o) => o.status === 'menunggu_verifikasi').length;

  const handleOpenOrderFromDashboard = (order: Order) => {
    setSelectedOrderForDetail(order);
    setActiveTab('orders');
  };

  const navItems = [
    { id: 'sales', label: 'Laporan Sales & KPI', icon: BarChart3, badge: null },
    { id: 'products', label: 'Data Produk & Stok', icon: Package, badge: `${products.length}` },
    { id: 'orders', label: 'Data Order & Riwayat', icon: ShoppingBag, badge: `${orders.length}` },
    { 
      id: 'approval', 
      label: 'Approval Bukti Bayar', 
      icon: CheckCircle, 
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : null,
      badgeColor: 'bg-purple-500 text-white animate-pulse'
    },
    { id: 'customers', label: 'Data Pelanggan', icon: Users, badge: `${customers.length}` }
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      
      {/* Top Admin Header Bar */}
      <header className="bg-stone-900 border-b border-stone-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Store & Admin Identity */}
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToStore}
                className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
                title="Kembali ke Webstore TasCantik"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Webstore</span>
              </button>

              <div className="h-6 w-px bg-stone-800 hidden sm:block"></div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-serif font-bold text-sm">
                  TC
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-white text-base">
                      Chika Official Store
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                      ADMIN PORTAL
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real Database Indicator & Admin Profile */}
            <div className="flex items-center gap-3">
              
              {/* Firestore Real Database Status */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800/90 border border-stone-700/80 text-[11px] font-mono text-stone-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Firestore Live: <strong>composed-thunder-gghtt</strong></span>
              </div>

              {/* Admin info badge */}
              <div className="flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700 text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-white leading-tight">{adminName}</div>
                  <div className="text-[10px] text-stone-400 font-mono leading-tight truncate max-w-[150px]">
                    {adminEmail}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors"
                title="Keluar dari Admin Panel"
              >
                <LogOut className="w-4 h-4" />
              </button>

            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="border-t border-stone-800 bg-stone-900/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all border ${
                      isActive
                        ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/20'
                        : 'bg-stone-800/60 hover:bg-stone-800 text-stone-300 border-stone-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                          item.badgeColor || (isActive ? 'bg-amber-700 text-white' : 'bg-stone-700 text-stone-300')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'sales' && (
          <AdminDashboard
            products={products}
            orders={orders}
            customers={customers}
            onNavigateToTab={(tab) => setActiveTab(tab as any)}
            onOpenOrder={handleOpenOrderFromDashboard}
          />
        )}

        {activeTab === 'products' && (
          <AdminProducts products={products} />
        )}

        {activeTab === 'orders' && (
          <AdminOrders
            orders={orders}
            selectedOrder={selectedOrderForDetail}
            onSelectOrder={setSelectedOrderForDetail}
          />
        )}

        {activeTab === 'approval' && (
          <AdminApproval orders={orders} />
        )}

        {activeTab === 'customers' && (
          <AdminCustomers customers={customers} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 border-t border-stone-800 py-4 text-center text-xs text-stone-500 font-mono">
        TasCantik Admin Portal • Chika Official Store • Powered by Google Cloud Firestore (Single Source of Truth)
      </footer>

    </div>
  );
};
