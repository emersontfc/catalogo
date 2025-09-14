
export interface Variation {
  name: string;
  price: number;
}

export interface Product {
  id: string | number; // Firestore uses string IDs
  name: string;
  price: number; // Default price, used if no variations
  variations?: Variation[];
  imageUrl: string;
  category: string;
  isAvailable: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  variation?: Variation; // Which variation was chosen
}

export interface Order {
  id: string; // Firestore document ID
  customerName: string;
  phone: string;
  deliveryAddress: string;
  items: Array<{
    id: string | number;
    quantity: number;
    name: string;
    price: number;
    variationName?: string;
  }>;
  total: number;
  status: 'pending' | 'preparing' | 'ready';
  createdAt: Date;
  orderId: string; // Human-readable/temporary ID
}
