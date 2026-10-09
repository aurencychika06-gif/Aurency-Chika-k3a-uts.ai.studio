import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Product, Order, Customer, OrderStatus } from '../types/store';
import { INITIAL_PRODUCTS } from '../data/defaultProducts';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const CUSTOMERS_COLLECTION = 'customers';

// Seed initial 12 products to Firestore if collection is empty
export async function seedProductsIfNeeded(): Promise<void> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(productsRef);
    if (snap.empty) {
      console.log('Seeding initial 12 TasCantik products into Firestore...');
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod);
      }
      console.log('Seeding complete! 12 products created in real database.');
    }
  } catch (error) {
    console.error('Failed to seed products:', error);
    // Don't throw fatal so storefront can still render
  }
}

// Reset / restore default 12 products
export async function resetProductsToDefault(): Promise<void> {
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  try {
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PRODUCTS_COLLECTION);
  }
}

// Real-time listener for products
export function subscribeProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Product);
      });
      // Sort by category or order
      onSuccess(items);
    },
    (error) => {
      console.error('Error listening to products:', error);
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
    }
  );
}

// Create or update product
export async function saveProduct(product: Product): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(docRef, {
      ...product,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${PRODUCTS_COLLECTION}/${product.id}`);
  }
}

// Delete product
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

// Update single product stock
export async function updateProductStock(productId: string, newStock: number): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      stock: Math.max(0, newStock),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${productId}`);
  }
}

// Real-time listener for orders
export function subscribeOrders(
  onSuccess: (orders: Order[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, ORDERS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Order);
      });
      onSuccess(items);
    },
    (error) => {
      console.error('Error listening to orders:', error);
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, ORDERS_COLLECTION);
    }
  );
}

// Fetch single order by ID or orderNumber
export async function getOrderByIdOrNumber(searchQuery: string): Promise<Order | null> {
  try {
    const cleanQuery = searchQuery.trim().toUpperCase();
    const snap = await getDocs(collection(db, ORDERS_COLLECTION));
    let matched: Order | null = null;
    snap.forEach((doc) => {
      const data = doc.data() as Order;
      if (
        data.id.toUpperCase() === cleanQuery ||
        data.orderNumber.toUpperCase() === cleanQuery ||
        data.customerEmail.toLowerCase() === searchQuery.trim().toLowerCase()
      ) {
        matched = data;
      }
    });
    return matched;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
  }
}

// Place new order
export async function createOrder(
  orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderData,
    id: orderId,
    createdAt: now,
    updatedAt: now
  };

  try {
    // Save order in Firestore
    await setDoc(doc(db, ORDERS_COLLECTION, orderId), newOrder);

    // Deduct stock for each item in the order
    for (const item of newOrder.items) {
      const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        const prodData = prodSnap.data() as Product;
        const currentStock = prodData.stock || 0;
        const currentSold = prodData.soldCount || 0;
        await updateDoc(prodRef, {
          stock: Math.max(0, currentStock - item.quantity),
          soldCount: currentSold + item.quantity,
          updatedAt: now
        });
      }
    }

    // Upsert customer in customers collection
    const customerKey = newOrder.customerEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const custRef = doc(db, CUSTOMERS_COLLECTION, customerKey);
    const custSnap = await getDoc(custRef);

    if (custSnap.exists()) {
      const prev = custSnap.data() as Customer;
      await updateDoc(custRef, {
        name: newOrder.customerName,
        phone: newOrder.customerPhone || prev.phone,
        address: newOrder.customerAddress || prev.address,
        city: newOrder.shippingCity || prev.city,
        totalOrders: (prev.totalOrders || 0) + 1,
        totalSpent: (prev.totalSpent || 0) + newOrder.totalAmount,
        lastOrderDate: now
      });
    } else {
      const newCust: Customer = {
        id: customerKey,
        name: newOrder.customerName,
        email: newOrder.customerEmail,
        phone: newOrder.customerPhone,
        address: newOrder.customerAddress,
        city: newOrder.shippingCity,
        totalOrders: 1,
        totalSpent: newOrder.totalAmount,
        lastOrderDate: now,
        createdAt: now
      };
      await setDoc(custRef, newCust);
    }

    return newOrder;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Update order status (with optional tracking number)
export async function updateOrderStatus(
  orderId: string, 
  status: OrderStatus, 
  trackingNumber?: string
): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const payload: Partial<Order> = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (trackingNumber !== undefined) {
      payload.trackingNumber = trackingNumber;
    }
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Customer submits payment proof
export async function submitPaymentProof(
  orderId: string,
  proofUrl: string,
  bankName: string,
  notes?: string
): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      paymentProofUrl: proofUrl,
      paymentProofDate: new Date().toISOString(),
      paymentProofBank: bankName,
      approvalNotes: notes || '',
      status: 'menunggu_verifikasi',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Admin approves payment proof
export async function approvePaymentProof(orderId: string, notes?: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'diproses',
      approvalNotes: notes || 'Pembayaran telah diverifikasi & disetujui oleh admin.',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Admin rejects payment proof
export async function rejectPaymentProof(orderId: string, reason: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'menunggu_pembayaran',
      approvalNotes: `Bukti pembayaran ditolak: ${reason}`,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

// Real-time listener for customers
export function subscribeCustomers(
  onSuccess: (customers: Customer[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, CUSTOMERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Customer[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Customer);
      });
      items.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
      onSuccess(items);
    },
    (error) => {
      console.error('Error listening to customers:', error);
      if (onError) onError(error);
      else handleFirestoreError(error, OperationType.LIST, CUSTOMERS_COLLECTION);
    }
  );
}
