import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminScreen, AdminProduct, AdminOrder, AdminUser, AdminCategory, AdminOffer, AdminSupportTicket, AdminBanner, AdminFlashDeal, OrderStatus } from './types';
import { supabase, testSupabaseConnection, uploadImageToSupabase } from '../../lib/supabase';
interface AdminContextType {
  currentScreen: AdminScreen;
  screenHistory: AdminScreen[];
  navigateAdminScreen: (screen: AdminScreen) => void;
  goBackAdmin: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;

  // Supabase Database & Storage Integration
  isSupabaseConnected: boolean;
  supabaseStatus: string;
  syncWithSupabase: () => Promise<void>;
  uploadImage: (file: File, folder?: string) => Promise<string | null>;

  // Wallet Approvals
  walletRequests: any[];
  approveWalletRequest: (id: string) => Promise<void>;
  rejectWalletRequest: (id: string) => Promise<void>;

  // Sliding Hero Banners
  banners: AdminBanner[];
  addBanner: (banner: Omit<AdminBanner, 'id'>) => void;
  updateBanner: (id: string, updates: Partial<AdminBanner>) => void;
  deleteBanner: (id: string) => void;
  toggleBannerActive: (id: string) => void;

  // Flash Deals
  flashDeals: AdminFlashDeal[];
  addFlashDeal: (deal: Omit<AdminFlashDeal, 'id'>) => void;
  updateFlashDeal: (id: string, updates: Partial<AdminFlashDeal>) => void;
  deleteFlashDeal: (id: string) => void;
  toggleFlashDealActive: (id: string) => void;

  // Products
  products: AdminProduct[];
  selectedProduct: AdminProduct | null;
  setSelectedProduct: (p: AdminProduct | null) => void;
  addProduct: (product: Omit<AdminProduct, 'id' | 'createdAt' | 'salesCount'>) => void;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  toggleProductActive: (id: string) => void;

  // Orders
  orders: AdminOrder[];
  selectedOrder: AdminOrder | null;
  setSelectedOrder: (o: AdminOrder | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Users
  users: AdminUser[];
  toggleUserBlock: (userId: string) => void;

  // Categories
  categories: AdminCategory[];
  addCategory: (cat: Omit<AdminCategory, 'id' | 'productCount'>) => void;
  deleteCategory: (catId: string) => void;

  // Offers
  offers: AdminOffer[];
  toggleOfferActive: (offerId: string) => void;
  addOffer: (offer: Omit<AdminOffer, 'id'>) => void;

  // Support Tickets & Live Chat
  supportTickets: AdminSupportTicket[];
  selectedTicket: AdminSupportTicket | null;
  setSelectedTicket: (ticket: AdminSupportTicket | null) => void;
  sendTicketReply: (ticketId: string, text: string) => void;
  updateTicketStatus: (ticketId: string, status: 'Open' | 'In Progress' | 'Resolved') => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Auth
  isLoggedIn: boolean;
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);
export const AdminProvider: React.FC<{ initialScreen?: AdminScreen; onExitAdmin?: () => void; children: React.ReactNode }> = ({ initialScreen = 'splash', onExitAdmin, children }) => {
  const [currentScreen, setCurrentScreen] = useState<AdminScreen>(initialScreen);
  const [screenHistory, setScreenHistory] = useState<AdminScreen[]>([initialScreen]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [offers, setOffers] = useState<AdminOffer[]>([]);
  const [supportTickets, setSupportTickets] = useState<AdminSupportTicket[]>([]);
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [flashDeals, setFlashDeals] = useState<AdminFlashDeal[]>([]);
  const [walletRequests, setWalletRequests] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<AdminSupportTicket | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState('Sign in to connect');
  const showToast = (msg: string) => setToastMessage(msg);
  useEffect(() => { if (!toastMessage) return; const id = setTimeout(() => setToastMessage(null), 5000); return () => clearTimeout(id); }, [toastMessage]);
  const syncWithSupabase = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const {data:role,error:roleError}=await supabase.rpc('is_admin');if(roleError)throw roleError;if(role!==true){setIsLoggedIn(false);setCurrentScreen('login');throw new Error('Administrator access is required');}
      const conn = await testSupabaseConnection();
      setIsSupabaseConnected(conn.ok); setSupabaseStatus(conn.message);
      if (!conn.ok) throw new Error(conn.message);
      const tables = ['products','categories','orders','profiles','offers','support_tickets','banners','flash_deals','wallet_transactions'];
      const results = await Promise.all(tables.map(table => supabase.from(table).select('*')));
      const failure = results.find(r => r.error); if (failure?.error) throw failure.error;
      const [ps, cs, os, us, ofs, ts, bs, ds, ws] = results.map(r => r.data || []);
      setProducts(ps.map(p => ({ id:p.id, name:p.name, category:p.category, categoryId:p.category_id || p.category, price:Number(p.price), originalPrice:p.original_price == null ? undefined : Number(p.original_price), stockQuantity:p.stock_quantity, unit:p.weight, description:p.description || '', image:p.image || '', isActive:p.in_stock, createdAt:p.created_at, salesCount:p.sales_count || 0 })));
      setCategories(cs.map(c => ({ id:c.id, name:c.name, image:c.image || '', iconName:c.icon || 'Drumstick', productCount:ps.filter(p => p.category_id === c.id || p.category === c.name).length })));
      setOrders(os.sort((a,b) => b.created_at.localeCompare(a.created_at)).map(o => ({ id:o.id, orderNumber:'#'+o.id, customerName:o.customer_name, customerPhone:o.customer_phone, deliveryAddress:typeof o.delivery_address === 'string' ? o.delivery_address : o.delivery_address?.address || '', items:o.items || [], subTotal:Number(o.subtotal), deliveryFee:Number(o.delivery_fee), total:Number(o.total_amount), paymentMethod:o.payment_method === 'COD' ? 'Cash on Delivery' : 'Online / UPI', status:o.status, date:new Date(o.created_at).toLocaleDateString(), time:new Date(o.created_at).toLocaleTimeString(), riderName:o.delivery_partner?.name, createdAt:o.created_at, deliveredAt:o.delivered_at })));
      setUsers(us.map(u => ({ id:u.id, name:u.full_name, phone:u.phone || '', email:u.email, avatar:'', status:u.is_blocked ? 'Blocked' : 'Active', totalOrders:os.filter(o => o.user_id === u.id).length, totalSpent:os.filter(o => o.user_id === u.id && o.status !== 'Cancelled').reduce((n,o) => n+Number(o.total_amount),0), joinedDate:new Date(u.created_at).toLocaleDateString() })));
      setOffers(ofs.map(o => ({...o.details, id:o.id, isActive:o.is_active})));
      setSupportTickets(ts.map(t => ({ id:t.id, ticketNumber:'#'+t.id, customerName:t.customer_name, customerPhone:t.customer_phone || '', customerAvatar:'', subject:t.subject, category:t.category || 'General Query', priority:t.priority || 'Medium', status:t.status, messages:t.messages || [], lastMessage:t.messages?.at(-1)?.text || '', lastUpdated:new Date(t.updated_at).toLocaleString(), unreadCount:0 })));
      setBanners(bs.map(b => ({...b.details, id:b.id, title:b.title, subtitle:b.subtitle || '', image:b.image, targetCategory:b.link_category || '', targetCategoryName:b.link_category || '', isActive:b.is_active, orderIndex:b.display_order })));
      setFlashDeals(ds.map(d => ({...d.details, id:d.id, title:d.title, image:d.image, isActive:d.is_active})));
      setWalletRequests(ws.sort((a,b) => b.created_at.localeCompare(a.created_at)));
    } catch (error:any) {setOrders([]);setUsers([]);setSupportTickets([]);setWalletRequests([]);setSelectedOrder(null);setSelectedTicket(null); setIsSupabaseConnected(false); setSupabaseStatus(error.message); showToast('Unable to load database: '+error.message); }
  }, [isLoggedIn]);
  useEffect(() => {
    let alive = true;
    const verify = async () => {
      const {data:{session}} = await supabase.auth.getSession();
      const {data, error} = session ? await supabase.rpc('is_admin') : {data:false,error:null};
      if (alive) { setIsLoggedIn(!error && data === true); if (!session || !data) setCurrentScreen('login'); }
    };
    void verify();
    const {data:{subscription}} = supabase.auth.onAuthStateChange(() => { setTimeout(() => void verify(), 0); });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!isLoggedIn) { setProducts([]); setOrders([]); setUsers([]); setWalletRequests([]); return; }
    void syncWithSupabase();
    const interval=setInterval(()=>void syncWithSupabase(),15000);
    const channel = supabase.channel('admin-live').on('postgres_changes', { event:'*', schema:'public' }, () => void syncWithSupabase()).subscribe();
    return () => { clearInterval(interval);void supabase.removeChannel(channel); };
  }, [isLoggedIn, syncWithSupabase]);
  useEffect(() => {
    if (selectedProduct) setSelectedProduct(products.find(p => p.id === selectedProduct.id) || null);
    if (selectedOrder) setSelectedOrder(orders.find(o => o.id === selectedOrder.id) || null);
    if (selectedTicket) setSelectedTicket(supportTickets.find(t => t.id === selectedTicket.id) || null);
  }, [products,orders,supportTickets]);
  const navigateAdminScreen = (screen:AdminScreen) => {
    if (!isLoggedIn && screen !== 'login' && screen !== 'splash') screen = 'login';
    setIsDrawerOpen(false); setScreenHistory(prev => [...prev,screen]); setCurrentScreen(screen);
  };
  const goBackAdmin = () => { if (screenHistory.length > 1) { const next=screenHistory.slice(0,-1); setScreenHistory(next); setCurrentScreen(next.at(-1)!); } else if (onExitAdmin) onExitAdmin(); else navigateAdminScreen('dashboard'); };
  const toggleDrawer = () => setIsDrawerOpen(v => !v);
  const loginAdmin = async (email:string, password:string) => {
    try {
      const {error} = await supabase.auth.signInWithPassword({email:email.trim(),password}); if(error) throw error;
      const {data,error:roleError} = await supabase.rpc('is_admin'); if(roleError) throw roleError;
      if(data !== true) { await supabase.auth.signOut(); throw new Error('This account does not have administrator access.'); }
      setIsLoggedIn(true); setCurrentScreen('dashboard'); setScreenHistory(['dashboard']); return true;
    } catch(error:any) { showToast(error.message); return false; }
  };
  const logoutAdmin = () => { void supabase.auth.signOut().then(({error}) => { if(error) showToast(error.message); }); setIsLoggedIn(false); setIsDrawerOpen(false); setCurrentScreen('login'); };
  const uploadImage = async (file:File, folder='products') => { const result=await uploadImageToSupabase(file,folder); if(result.error) showToast(result.error.message); return result.url; };
  // Never report success or mutate displayed data until the database confirms the write.
  const write = async (operation:any, message:string) => {
    try { if(!isLoggedIn) throw new Error('Administrator sign-in required.'); const {error}=await operation; if(error) throw error; await syncWithSupabase(); showToast(message); return true; }
    catch(error:any) { showToast('Save failed: '+error.message); return false; }
  };
  const productRow = (p:Partial<AdminProduct>) => ({ name:p.name, category:p.category, category_id:p.categoryId, price:p.price, original_price:p.originalPrice, weight:p.unit, unit_kg:p.unit === undefined ? undefined : /^\s*([0-9.]+)\s*(kg|g)\s*$/i.test(p.unit) ? Number(p.unit.match(/[0-9.]+/)![0]) * (/kg/i.test(p.unit) ? 1 : 0.001) : null, description:p.description, image:p.image, in_stock:p.isActive, stock_quantity:p.stockQuantity });
  const addProduct = (p:Omit<AdminProduct,'id'|'createdAt'|'salesCount'>) => { void write(supabase.from('products').insert({id:crypto.randomUUID(),...productRow(p)}),'Product saved').then(ok => { if(ok) navigateAdminScreen('products'); }); };
  const updateProduct = (id:string, p:Partial<AdminProduct>) => { void write(supabase.from('products').update(productRow(p)).eq('id',id).select().single(),'Product updated'); };
  const deleteProduct = (id:string) => { void write(supabase.from('products').delete().eq('id',id).select().single(),'Product deleted'); };
  const toggleProductActive = (id:string) => { const p=products.find(p => p.id===id); if(p) updateProduct(id,{isActive:!p.isActive}); };
  const updateOrderStatus = (id:string,status:OrderStatus) => { void write(supabase.rpc('set_order_status',{p_id:id.replace(/^#/,''),p_status:status}),'Order status updated'); };
  const approveWalletRequest = async (id:string) => { await write(supabase.rpc('review_wallet_deposit',{p_id:id,p_approve:true}),'Deposit approved'); };
  const rejectWalletRequest = async (id:string) => { await write(supabase.rpc('review_wallet_deposit',{p_id:id,p_approve:false}),'Deposit rejected'); };
  const toggleUserBlock = (id:string) => { const u=users.find(u => u.id===id); if(u) void write(supabase.rpc('set_user_blocked',{p_id:id,p_blocked:u.status==='Active'}),'User access updated'); };
  const addCategory = (c:Omit<AdminCategory,'id'|'productCount'>) => { void write(supabase.from('categories').insert({id:crypto.randomUUID(),name:c.name,image:c.image,icon:c.iconName}),'Category saved'); };
  const deleteCategory = (id:string) => { if(products.some(p => p.categoryId===id)) return showToast('Move or delete products in this category first.'); void write(supabase.from('categories').delete().eq('id',id).select().single(),'Category deleted'); };
  const addOffer = (o:Omit<AdminOffer,'id'>) => {if(!/^[A-Z0-9_-]{3,30}$/.test(o.couponCode || '')){showToast('Enter a coupon code of 3–30 letters, numbers, underscores or hyphens');return;} if(!Number.isFinite(Number(o.discountValue)) || Number(o.discountValue)<=0 || (o.discountType==='percentage' && Number(o.discountValue)>100) || o.discountType==='bogo'){showToast('Enter a positive flat discount or percentage up to 100. BOGO is not supported.');return;}if(o.validTill){const date=new Date(o.validTill);if(Number.isNaN(date.getTime())){showToast('Enter a valid expiry date.');return;}o={...o,validTill:date.toISOString().slice(0,10)};} void write(supabase.from('offers').insert({id:crypto.randomUUID(),details:o,is_active:o.isActive}),'Offer saved'); };
  const toggleOfferActive = (id:string) => { const o=offers.find(o=>o.id===id); if(o) void write(supabase.from('offers').update({is_active:!o.isActive}).eq('id',id).select().single(),'Offer updated'); };
  const sendTicketReply = (id:string,text:string) => { if(text.trim()) void write(supabase.rpc('reply_to_ticket',{p_id:id,p_text:text.trim()}),'Reply sent'); };
  const updateTicketStatus = (id:string,status:string) => { void write(supabase.from('support_tickets').update({status,updated_at:new Date().toISOString()}).eq('id',id).select().single(),'Ticket updated'); };
  const bannerRow = (b:Partial<AdminBanner>) => ({title:b.title,subtitle:b.subtitle,image:b.image,link_category:b.targetCategoryName,is_active:b.isActive,display_order:b.orderIndex,details:b});
  const addBanner = (b:Omit<AdminBanner,'id'>) => { void write(supabase.from('banners').insert({id:crypto.randomUUID(),...bannerRow(b)}),'Banner saved'); };
  const updateBanner = (id:string,b:Partial<AdminBanner>) => { const old=banners.find(b=>b.id===id); if(old) void write(supabase.from('banners').update(bannerRow({...old,...b})).eq('id',id).select().single(),'Banner updated'); };
  const deleteBanner = (id:string) => { void write(supabase.from('banners').delete().eq('id',id).select().single(),'Banner deleted'); };
  const toggleBannerActive = (id:string) => { const b=banners.find(b=>b.id===id); if(b) updateBanner(id,{isActive:!b.isActive}); };
  const dealRow = (d:Partial<AdminFlashDeal>) => ({title:d.title,discount:d.discountPercentage,image:d.image,is_active:d.isActive,details:d});
  const addFlashDeal = (d:Omit<AdminFlashDeal,'id'>) => {const product=products.find(p=>p.id===d.productId);if(!product || !Number.isFinite(d.endsInMinutes) || d.endsInMinutes<1 || d.endsInMinutes>10080){showToast('Select a product and valid duration');return;}d={...d,endsAt:new Date(Date.now()+d.endsInMinutes*60000).toISOString()}; void write(supabase.from('flash_deals').insert({id:crypto.randomUUID(),...dealRow(d)}),'Deal saved'); };
  const updateFlashDeal = (id:string,d:Partial<AdminFlashDeal>) => { const old=flashDeals.find(d=>d.id===id); if(old) void write(supabase.from('flash_deals').update(dealRow({...old,...d})).eq('id',id).select().single(),'Deal updated'); };
  const deleteFlashDeal = (id:string) => { void write(supabase.from('flash_deals').delete().eq('id',id).select().single(),'Deal deleted'); };
  const toggleFlashDealActive = (id:string) => { const d=flashDeals.find(d=>d.id===id); if(d) updateFlashDeal(id,{isActive:!d.isActive}); };
  return (
    <AdminContext.Provider
      value={{
        currentScreen,
        screenHistory,
        navigateAdminScreen,
        goBackAdmin,
        isDrawerOpen,
        setIsDrawerOpen,
        toggleDrawer,
        isSupabaseConnected,
        supabaseStatus,
        syncWithSupabase,
        uploadImage,
        walletRequests,
        approveWalletRequest,
        rejectWalletRequest,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerActive,
        flashDeals,
        addFlashDeal,
        updateFlashDeal,
        deleteFlashDeal,
        toggleFlashDealActive,
        products,
        selectedProduct,
        setSelectedProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductActive,
        orders,
        selectedOrder,
        setSelectedOrder,
        updateOrderStatus,
        users,
        toggleUserBlock,
        categories,
        addCategory,
        deleteCategory,
        offers,
        toggleOfferActive,
        addOffer,
        supportTickets,
        selectedTicket,
        setSelectedTicket,
        sendTicketReply,
        updateTicketStatus,
        toastMessage,
        showToast,
        isLoggedIn,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
