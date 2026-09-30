export type AdminScreen =
  | 'splash'
  | 'login'
  | 'dashboard'
  | 'flash_deals'
  | 'banners'
  | 'products'
  | 'add_product'
  | 'edit_product'
  | 'product_details'
  | 'orders'
  | 'order_details'
  | 'users'
  | 'categories'
  | 'offers'
  | 'reports_settings'
  | 'support'
  | 'push_notifications';

export interface AdminBanner {
  id: string;
  title: string;
  subtitle: string;
  tagline?: string;
  badgeText?: string;
  image: string;
  targetCategory: string; // e.g. 'fish', 'chicken', 'mutton', 'all'
  targetCategoryName: string; // e.g. 'Fish', 'Chicken', 'Mutton', 'All Categories'
  backgroundColor?: string;
  buttonText?: string;
  isActive: boolean;
  orderIndex: number;
}

export interface AdminFlashDeal {
  productId?: string;
  endsAt?: string;
  id: string;
  title: string;
  productName: string;
  category: string;
  categoryId: string;
  price: number;
  originalPrice: number;
  discountPercentage: string;
  image: string;
  stockLeft: number;
  totalStock: number;
  endsInMinutes: number;
  unit: string;
  isActive: boolean;
}

export interface AdminSupportMessage {
  id: string;
  sender: 'customer' | 'admin' | 'system';
  text: string;
  time: string;
}

export interface AdminSupportTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  customerAvatar: string;
  orderNumber?: string;
  subject: string;
  category: 'Delivery Delay' | 'Quality Issue' | 'Refund Request' | 'Missing Item' | 'General Query';
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  lastMessage: string;
  lastUpdated: string;
  unreadCount: number;
  messages: AdminSupportMessage[];
}

export type OrderStatus = 'Preparing' | 'On the Way' | 'Delivered' | 'Cancelled' | 'Pending';

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  unit: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  salesCount?: number;
}

export interface AdminOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  image?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string; // e.g. #ORD1024
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  deliveryAddress: string;
  items: AdminOrderItem[];
  subTotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  date: string; // e.g. Apr 28, 2025
  time: string; // e.g. 10:24 AM
  paymentMethod: 'Cash on Delivery' | 'Online / UPI' | 'Card';
  riderName?: string;
  createdAt?: string;
  deliveredAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar: string;
  status: 'Active' | 'Blocked';
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  iconName: string;
  image: string;
  productCount: number;
}

export interface AdminOffer {
  id: string;
  title: string;
  description: string;
  image: string;
  validTill: string;
  discountType: 'percentage' | 'flat' | 'bogo';
  discountValue: string;
  isActive: boolean;
  couponCode?: string;
}

export interface AdminSalesPoint {
  day: string;
  dateNum: number;
  revenue: number;
}
