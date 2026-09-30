import {supabase} from '../lib/supabase';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  productId?: string;
  quantityKg?: number;
  name: string;
  category?: string;
  weight?: string;
  prep?: string;
  cut?: string;
  notes?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  totalAmount: number;
  taxRate: number;
  storeOpen: boolean;
  pricingError: string;
  couponCode: string;
  discount: number;
  setCouponCode: (code:string)=>void;
  couponError: string;
  couponLoading: boolean;
  addToCart: (item: {
    id: string;
    quantityKg?: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category?: string;
    weight?: string;
    prep?: string;
    cut?: string;
    notes?: string;
    quantity?: number;
  }) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getItemQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'meatghar_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter(item=>typeof item.id==='string' && typeof item.productId==='string' && Number.isFinite(item.price) && item.price>=0 && Number.isInteger(item.quantity) && item.quantity>0 && item.quantity<=100);
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  useEffect(()=>{const refresh=async()=>{const {data,error}=await supabase.from('products').select('*');if(error)return;setCartItems(prev=>prev.map(item=>{const product=data.find(p=>p.id===item.productId);if(!product)return item;const price=item.quantityKg && product.unit_kg ? Math.round(Number(product.price)*item.quantityKg/Number(product.unit_kg)*100)/100 : Number(product.price);return {...item,name:product.name,image:product.image,price};}));};void refresh();const channel=supabase.channel('cart-prices').on('postgres_changes',{event:'*',schema:'public',table:'products'},()=>void refresh()).subscribe();return()=>{void supabase.removeChannel(channel);};},[]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [settings,setSettings]=useState<{delivery_fee:number;free_delivery_threshold:number;tax_percent:number;is_open:boolean} | null>(null);
  const [pricingError,setPricingError]=useState('');
  const [couponCode,setCouponCode]=useState('');
  const [discount,setDiscount]=useState(0);
  const [couponError,setCouponError]=useState('');
  const [couponLoading,setCouponLoading]=useState(false);
  useEffect(()=>{const load=async()=>{const {data,error}=await supabase.from('store_settings').select('*').eq('id',true).single();if(error){setSettings(null);setPricingError('Unable to load store pricing. Please retry.');}else{setSettings(data);setPricingError('');}};void load();const channel=supabase.channel('pricing').on('postgres_changes',{event:'*',schema:'public',table:'store_settings'},()=>void load()).subscribe();return()=>{void supabase.removeChannel(channel);};},[]);
  useEffect(()=>{let alive=true;setDiscount(0);setCouponError('');if(!couponCode || !subtotal){setCouponLoading(false);return;}setCouponLoading(true);void supabase.rpc('coupon_discount',{p_code:couponCode,p_subtotal:subtotal}).then(({data,error})=>{if(!alive)return;setCouponLoading(false);if(error)setCouponError(error.message);else setDiscount(Number(data));});return()=>{alive=false;};},[couponCode,subtotal]);
  const taxRate=Number(settings?.tax_percent || 0);
  const storeOpen=!!settings?.is_open;
  const deliveryFee = settings && subtotal>0 && subtotal<Number(settings.free_delivery_threshold) ? Number(settings.delivery_fee) : 0;
  const taxes = subtotal>0 ? Math.round((subtotal-discount)*taxRate/100) : 0;
  const totalAmount = subtotal>0 ? Math.round((subtotal-discount+deliveryFee+taxes)*100)/100 : 0;

  const addToCart = (product: {
    id: string;
    quantityKg?: number;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category?: string;
    weight?: string;
    prep?: string;
    cut?: string;
    notes?: string;
    quantity?: number;
  }) => {
    if (!product.id || !Number.isFinite(product.price) || product.price < 0) return;
    const addQty = Math.min(100, Math.max(1, Math.floor(product.quantity || 1)));
    const variantId = `${product.id}::${product.quantityKg ?? ''}::${product.cut || ''}::${product.notes || ''}`;
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === variantId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: Math.min(100,updated[existingIdx].quantity + addQty),
          prep: product.prep || updated[existingIdx].prep,
          cut: product.cut || updated[existingIdx].cut,
          notes: product.notes || updated[existingIdx].notes,
          weight: product.weight || updated[existingIdx].weight,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: variantId,
            productId: product.id,
            quantityKg: product.quantityKg,
            name: product.name,
            category: product.category || 'Meat',
            weight: product.weight || '1 KG',
            prep: product.prep,
            cut: product.cut || 'Curry Cut',
            notes: product.notes,
            price: product.price,
            originalPrice: product.originalPrice,
            quantity: addQty,
            image: product.image,
          },
        ];
      }
    });
  };

  const updateQuantity = (id:string,delta:number) => {
    if(!Number.isFinite(delta))return;
    setCartItems(prev=>{const exact=prev.findIndex(i=>i.id===id);const index=exact>=0?exact:prev.findIndex(i=>i.productId===id);return prev.map((item,n)=>{if(n!==index)return item;const quantity=Math.min(100,item.quantity+Math.trunc(delta));return quantity>0?{...item,quantity}:null;}).filter((i):i is CartItem=>i!==null);});
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id && item.name !== id));
  };

  const clearCart = () => {
    setCartItems([]);setCouponCode('');
  };

  const getItemQuantity = (id: string) => {
    return cartItems.filter(i=>i.id===id || i.productId===id).reduce((sum,i)=>sum+i.quantity,0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        deliveryFee,
        taxes,
        totalAmount, taxRate, storeOpen, pricingError, couponCode, discount, setCouponCode, couponError, couponLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
