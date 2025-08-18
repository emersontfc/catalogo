export interface Product {
  id: string | number; // Firestore uses string IDs
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string; // Firestore document ID
  customerName: string;
  phone: string;
  deliveryAddress: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready';
  createdAt: Date;
  orderId?: string; // Human-readable/temporary ID
}
