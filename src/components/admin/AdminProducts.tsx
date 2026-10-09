import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  MinusCircle, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  X,
  Package
} from 'lucide-react';
import { Product, ProductCategory } from '../../types/store';
import { CATEGORIES } from '../../data/defaultProducts';
import { 
  saveProduct, 
  deleteProduct, 
  updateProductStock, 
  resetProductsToDefault 
} from '../../services/storeService';
import { formatRupiah } from '../../utils/formatters';

interface AdminProductsProps {
  products: Product[];
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ products }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Tote Bag & Workwear');
  const [price, setPrice] = useState<number>(350000);
  const [stock, setStock] = useState<number>(20);
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [dimensions, setDimensions] = useState('30 x 25 x 10 cm');
  const [weight, setWeight] = useState('500 gram');
  const [image, setImage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Tote Bag & Workwear');
    setPrice(350000);
    setStock(20);
    setDescription('');
    setMaterial('Premium Leather Synthetic');
    setDimensions('35 x 28 x 12 cm');
    setWeight('500 gram');
    setImage('https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setStock(p.stock);
    setDescription(p.description);
    setMaterial(p.material);
    setDimensions(p.dimensions);
    setWeight(p.weight);
    setImage(p.image);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !image.trim()) {
      alert('Nama dan gambar produk wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const productPayload: Product = {
        id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
        name: name.trim(),
        category,
        price: Number(price),
        stock: Number(stock),
        description: description.trim(),
        material: material.trim(),
        dimensions: dimensions.trim(),
        weight: weight.trim(),
        features: editingProduct?.features || ['Desain Minimalis Modern', 'Kompartemen Fungsional', 'Water Resistant'],
        image: image.trim(),
        rating: editingProduct?.rating || 4.8,
        soldCount: editingProduct?.soldCount || 0,
        featured: editingProduct?.featured || false,
        createdAt: editingProduct?.createdAt || now,
        updatedAt: now
      };

      await saveProduct(productPayload);
      setIsModalOpen(false);
      setActionMessage('Data produk dan stok berhasil disimpan ke Firestore.');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan produk ke Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (window.confirm(`Yakin ingin menghapus produk "${prodName}" dari katalog?`)) {
      try {
        await deleteProduct(id);
        setActionMessage(`Produk "${prodName}" berhasil dihapus.`);
        setTimeout(() => setActionMessage(''), 3000);
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus produk.');
      }
    }
  };

  const handleQuickStockChange = async (id: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await updateProductStock(id, newStock);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetToDefault = async () => {
    if (window.confirm('Muat ulang 12 produk default TasCantik ke database Firestore? Tindakan ini akan mengembalikan data katalog default.')) {
      setIsResetting(true);
      try {
        await resetProductsToDefault();
        setActionMessage('12 Produk default TasCantik berhasil dimuat ulang ke database Firestore!');
        setTimeout(() => setActionMessage(''), 4000);
      } catch (err) {
        console.error(err);
        alert('Gagal memuat ulang default.');
      } finally {
        setIsResetting(false);
      }
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.material.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="p-3.5 bg-emerald-900/60 border border-emerald-500 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Top Controls: Actions, Search, Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-white text-xl">
            Manajemen Produk & Stok TasCantik
          </h3>
          <p className="text-xs text-stone-400">
            Total {products.length} produk tersimpan di Firestore real database
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleResetToDefault}
            disabled={isResetting}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Muat ulang 12 produk awal jika terhapus"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Memuat...' : 'Reset 12 Produk Default'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-900/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'Semua' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            Semua ({products.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              {cat} ({products.filter((p) => p.category === cat).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau bahan tas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-800/80 text-stone-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Harga Jual</th>
                <th className="py-3 px-4 text-center">Stok & Penyesuaian Cepat</th>
                <th className="py-3 px-4">Terjual</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800 text-stone-300">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-stone-500">
                    Tidak ada produk yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-800/40">
                    {/* Image & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-xl bg-stone-800 border border-stone-700 flex-shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-white font-serif text-sm">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono line-clamp-1">
                            Bahan: {p.material}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-stone-300">
                        {p.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-bold text-amber-300 font-sans">
                      {formatRupiah(p.price)}
                    </td>

                    {/* Stock Counter with Inline Quick Change */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleQuickStockChange(p.id, p.stock, -1)}
                          disabled={p.stock <= 0}
                          className="text-stone-400 hover:text-rose-400 disabled:opacity-30 p-1"
                          title="Kurangi stok 1"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>

                        <span
                          className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border ${
                            p.stock <= 0
                              ? 'bg-rose-900/40 text-rose-300 border-rose-700'
                              : p.stock <= 8
                              ? 'bg-amber-900/40 text-amber-300 border-amber-700'
                              : 'bg-emerald-900/40 text-emerald-300 border-emerald-700'
                          }`}
                        >
                          {p.stock} pcs
                        </span>

                        <button
                          onClick={() => handleQuickStockChange(p.id, p.stock, 1)}
                          className="text-stone-400 hover:text-emerald-400 p-1"
                          title="Tambah stok 1"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Sold count */}
                    <td className="py-3 px-4 font-mono text-stone-400">
                      {p.soldCount} pcs
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-stone-300 hover:text-amber-400 hover:bg-stone-800 rounded-lg"
                          title="Edit Produk"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-stone-900 text-stone-100 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-800 flex items-center justify-between">
              <h4 className="font-serif font-bold text-lg text-white">
                {editingProduct ? 'Edit Data Produk & Stok' : 'Tambah Produk TasCantik Baru'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Nama Produk <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: TasCantik Sophia Structured Bag"
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Harga (Rp) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Jumlah Stok <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  URL Foto Produk <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Material / Bahan
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Vegan Leather"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Dimensi
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="30 x 25 x 10 cm"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">
                    Berat
                  </label>
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="500 gram"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan keunggulan kompartemen dan fungsi tas..."
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
