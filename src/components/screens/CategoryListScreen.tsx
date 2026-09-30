import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Star,
  Plus,
  Minus,
  Home as HomeIcon,
  LayoutGrid,
  ClipboardList,
  User,
  Share2,
  SlidersHorizontal,
  ChevronRight,
  Leaf,
} from 'lucide-react';
import { AppImage } from '../common/AppImage';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { getCleanProductImage } from './HomeScreen';

interface CategoryListScreenProps {
  initialCategory?: string | null;
  fromOrigin?: 'home' | 'category_manual';
  onBack: () => void;
  onSelectProduct: (productName: string) => void;
  onNavigateTab: (tab: string) => void;
}

export interface CategoryInfo {
  id: string;
  name: string;
  itemCount: number;
  image: string;
}

export interface CategoryProduct {
  unitPrice: number;
  weight?: string;
  id: string;
  categoryId: string;
  name: string;
  price: string;
  discount?: string;
  rating: string;
  inStock: boolean;
  image: string;
}

export const CategoryListScreen: React.FC<CategoryListScreenProps> = ({
  initialCategory,
  fromOrigin = 'category_manual',
  onBack,
  onSelectProduct,
  onNavigateTab,
}) => {
  const { cartCount, addToCart, updateQuantity, getItemQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  
  const [categoriesList, setCategoriesList] = useState<CategoryInfo[]>([]);
  const [productsList, setProductsList] = useState<CategoryProduct[]>([]);

  const [loadError,setLoadError]=useState('');
  // Load from Supabase on mount
  useEffect(() => {
    const fetchSupabaseMenu = async () => {
      try {
        const { data: dbCats,error:catError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true);
          
        if(catError)throw catError;
        if (dbCats) {
          const formattedCats: CategoryInfo[] = dbCats.map((c: any) => ({
            id: c.id,
            name: c.name,
            itemCount: 0, // Computed dynamically below or default
            image: c.image || '/images/cat_chicken_1790504356265.jpg',
          }));
          setCategoriesList(formattedCats);
        }

        const { data: dbProducts,error:productError } = await supabase
          .from('products')
          .select('*');
          
        if(productError)throw productError;
        if (dbProducts) {
          const formattedProducts: CategoryProduct[] = dbProducts.map((p: any) => ({
            id: p.id,
            categoryId: p.category_id || p.category,
            unitPrice: Number(p.price),
            weight: p.weight,
            name: p.name,
            price: `₹${p.price} / ${p.weight || '500g'}`,
            discount: p.badge || (p.original_price ? `${Math.round(((p.original_price - p.price) / p.original_price) * 100)}% OFF` : undefined),
            rating: `${p.rating || 0} (${p.rating_count || 0})`,
            inStock: p.in_stock !== false && Number(p.stock_quantity)>0,
            image: p.image || '/images/chicken_curry_cut_wide_1790508282856.jpg',
          }));
          setProductsList(formattedProducts);
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Unable to load products');
      }
    };
    fetchSupabaseMenu();
  }, []);

  useEffect(() => {
    if (initialCategory) {
      // Find category matching name or id
      const matched = categoriesList.find(
        (c) => c.name.toLowerCase() === initialCategory.toLowerCase() || c.id === initialCategory.toLowerCase()
      );
      if (matched) {
        setSelectedCategory(matched.id);
      }
    } else {
      setSelectedCategory(null);
    }
  }, [initialCategory, categoriesList]);

  const getCategoryCount = (cat: CategoryInfo) => {
    const catIdNorm = (cat.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const catNameNorm = (cat.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    return productsList.filter((p) => {
      const pCat = (p.categoryId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const pName = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      if (pCat && (pCat === catIdNorm || pCat === catNameNorm)) return true;
      if (pCat && (pCat.includes(catIdNorm) || catIdNorm.includes(pCat))) return true;
      if (pCat && (pCat.includes(catNameNorm) || catNameNorm.includes(pCat))) return true;
      if (pName && (pName.includes(catIdNorm) || pName.includes(catNameNorm))) return true;

      if (catIdNorm.includes('chicken') && (pCat.includes('chicken') || pName.includes('chicken'))) return true;
      if ((catIdNorm.includes('mutton') || catIdNorm.includes('goat')) && (pCat.includes('mutton') || pCat.includes('goat') || pName.includes('mutton') || pName.includes('goat'))) return true;
      if (catIdNorm.includes('fish') && (pCat.includes('fish') || pName.includes('fish') || pName.includes('rohu') || pName.includes('salmon') || pName.includes('pomfret'))) return true;
      if (catIdNorm.includes('egg') && (pCat.includes('egg') || pName.includes('egg'))) return true;
      if ((catIdNorm.includes('ready') || catIdNorm.includes('cook')) && (pCat.includes('ready') || pCat.includes('cook') || pCat.includes('tikka') || pCat.includes('kebab'))) return true;
      if (catIdNorm.includes('special') && (pCat.includes('special') || pCat.includes('steak') || pCat.includes('shank') || pCat.includes('chops'))) return true;
      if ((catIdNorm.includes('prawn') || catIdNorm.includes('seafood')) && (pCat.includes('prawn') || pCat.includes('seafood') || pName.includes('prawn'))) return true;
      if (catIdNorm.includes('cold') && (pCat.includes('cold') || pCat.includes('salami') || pCat.includes('sausage'))) return true;
      if (catIdNorm.includes('marinade') && (pCat.includes('marinade') || pCat.includes('kebab') || pName.includes('marinade'))) return true;

      return false;
    }).length;
  };

  const currentCategoryInfo = categoriesList.find((c) => c.id === selectedCategory);
  const displayedProducts = selectedCategory && currentCategoryInfo
    ? productsList.filter((p) => {
        const catIdNorm = currentCategoryInfo.id.toLowerCase().replace(/[^a-z0-9]/g, '');
        const catNameNorm = currentCategoryInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const pCat = (p.categoryId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const pName = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        if (pCat === catIdNorm || pCat === catNameNorm) return true;
        if (pCat.includes(catIdNorm) || catIdNorm.includes(pCat)) return true;

        if (catIdNorm === 'chicken' && (pCat.includes('chicken') || pName.includes('chicken'))) return true;
        if (catIdNorm === 'mutton' && (pCat.includes('mutton') || pCat.includes('goat') || pName.includes('mutton') || pName.includes('goat'))) return true;
        if (catIdNorm === 'fish' && (pCat.includes('fish') || pName.includes('fish') || pName.includes('rohu') || pName.includes('salmon') || pName.includes('pomfret'))) return true;
        if (catIdNorm === 'eggs' && (pCat.includes('egg') || pName.includes('egg'))) return true;
        if ((catIdNorm === 'readytocook' || catIdNorm === 'ready_to_cook') && (pCat.includes('ready') || pCat.includes('cook') || pCat.includes('tikka') || pCat.includes('kebab'))) return true;
        if (catIdNorm === 'specialcuts' && (pCat.includes('special') || pCat.includes('steak') || pCat.includes('shank') || pCat.includes('chops'))) return true;
        if (catIdNorm === 'prawns' && (pCat.includes('prawn') || pCat.includes('seafood') || pName.includes('prawn'))) return true;
        if (catIdNorm === 'coldcuts' && (pCat.includes('cold') || pCat.includes('salami') || pCat.includes('sausage'))) return true;
        if (catIdNorm === 'marinades' && (pCat.includes('marinade') || pCat.includes('kebab') || pName.includes('marinade'))) return true;

        return false;
      })
    : [];

  const handleAddQuantity = (product: CategoryProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    const priceNum = product.unitPrice;
    addToCart({
      id: product.id,
      name: product.name,
      price: priceNum,
      weight: product.weight,
      image: product.image,
      category: product.categoryId,
      quantity: 1,
    });
  };

  const handleRemoveQuantity = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(productId, -1);
  };

  return (
    <div className="w-full h-full bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {loadError && <p role="alert" className="p-3 text-red-800 text-sm bg-red-50">{loadError}</p>}
      {/* Top Header - Fixed */}
      <div className="shrink-0 bg-white px-4 pt-3 pb-3 border-b border-slate-200/80 shadow-2xs z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (fromOrigin === 'home') {
                  onBack(); // Directly back to Home when opened from Home
                } else if (selectedCategory) {
                  setSelectedCategory(null); // Back to categories grid when manual
                } else {
                  onBack(); // Back to Home
                }
              }}
              className="p-1.5 rounded-full hover:bg-slate-100 text-[#BA181B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                {selectedCategory && currentCategoryInfo
                  ? currentCategoryInfo.name
                  : 'All Categories'}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {selectedCategory && currentCategoryInfo
                  ? `${displayedProducts.length} items available`
                  : 'Explore Daily Fresh Meat'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('search')}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4.5 h-4.5 text-slate-700 stroke-[2.2]" />
            </button>
            <button
              onClick={() => onNavigateTab('cart')}
              className="relative p-2 rounded-full hover:bg-red-50 text-[#BA181B] transition-colors cursor-pointer flex items-center justify-center"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-[#BA181B] stroke-[2.2]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#BA181B] text-white text-[9px] font-black flex items-center justify-center border-1.5 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* If category selected: Quick Category Switcher Tabs */}
        {selectedCategory && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2.5 mt-1 border-t border-slate-100">
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              All Categories
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#BA181B] text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-red-200 hover:text-[#BA181B]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3.5 no-scrollbar pb-20">
        {/* VIEW 1: ALL CATEGORIES IN 3-PER-ROW GRID (when no category selected) */}
        {!selectedCategory ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                Select Category ({categoriesList.length})
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Tap to view cuts</span>
            </div>

            {/* Exactly 3 per row cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {categoriesList.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-2xs hover:border-[#BA181B] hover:shadow-xs active:scale-95 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  {/* Category Image */}
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-rose-50/50 mb-1.5 p-1 relative flex items-center justify-center">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Title & Item Count */}
                  <div className="text-center">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-[#BA181B] transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                      {getCategoryCount(cat)} Items
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* VIEW 2: PRODUCTS OF THE SELECTED CATEGORY */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>{currentCategoryInfo?.name} Products ({displayedProducts.length})</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-[11px] text-[#BA181B] font-bold hover:underline"
              >
                Change Category
              </button>
            </div>

            {displayedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center my-4">
                <div className="w-12 h-12 rounded-full bg-red-50 text-[#BA181B] font-black text-lg flex items-center justify-center mx-auto mb-2">
                  0
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">0 Items in {currentCategoryInfo?.name}</h3>
                <p className="text-xs text-slate-400 mt-1">Currently no products are listed under this category.</p>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mt-3.5 px-4 py-2 bg-[#BA181B] text-white text-xs font-bold rounded-xl"
                >
                  Browse Other Categories
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {displayedProducts.map((p) => {
                  const qty = getItemQuantity(p.id) || getItemQuantity(p.name);

                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectProduct(p.id)}
                      className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        {/* Product Image */}
                        <div className="w-full h-[120px] rounded-xl overflow-hidden bg-slate-100 mb-2 relative">
                          <AppImage
                            src={getCleanProductImage(p.name, p.image)}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Top-left: Discount badge if available (NEVER bestseller, popular, or fresh tags) */}
                          {p.discount && (p.discount.includes('%') || p.discount.toLowerCase().includes('off')) && !p.discount.toLowerCase().includes('bestseller') && !p.discount.toLowerCase().includes('popular') && !p.discount.toLowerCase().includes('fresh') && (
                            <span className="absolute top-2 left-2 bg-[#BA181B] text-white text-[8.5px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-tight">
                              {p.discount}
                            </span>
                          )}
                          {/* Top-right: Green pill badge Fresh (smaller and compact) */}
                          <span className="absolute top-2 right-2 bg-[#16A34A] text-white text-[7.5px] font-bold px-1.5 py-0.5 rounded-full shadow-xs flex items-center justify-center">
                            Fresh
                          </span>
                        </div>

                      {/* Product Name */}
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1 leading-tight">
                        {p.name}
                      </h4>

                      {/* Price in dark bold */}
                      <div className="text-[13px] font-black text-slate-900 mb-1.5">
                        {p.price}
                      </div>

                      {/* Rating & Stock */}
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <span className="text-slate-800 font-bold">{p.rating.split(' ')[0] || '0'}</span>
                          <span className="text-slate-400 font-normal">({p.rating.split(' ')[1] || '1.2k'})</span>
                        </div>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          In Stock
                        </span>
                      </div>
                    </div>

                    {/* Add Button or Stepper */}
                    <div className="mt-2.5">
                      {qty === 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(p.id);
                          }}
                          className="w-full py-2 bg-[#BA181B] hover:bg-red-800 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 fill-white/20 stroke-[2.2]" />
                          <span>Add</span>
                        </button>
                      ) : (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-1.5 bg-[#BA181B] text-white rounded-xl flex items-center justify-between px-2 shadow-sm"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(p.id, -1);
                            }}
                            className="w-7 h-7 rounded-lg bg-black/15 hover:bg-black/25 active:scale-90 flex items-center justify-center cursor-pointer transition-transform"
                            title="Decrease"
                          >
                            <Minus className="w-3.5 h-3.5 text-white stroke-[3]" />
                          </button>
                          <span className="font-black text-xs text-white px-2 select-none">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(p.id, 1);
                            }}
                            className="w-7 h-7 rounded-lg bg-black/15 hover:bg-black/25 active:scale-90 flex items-center justify-center cursor-pointer transition-transform"
                            title="Increase"
                          >
                            <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <div className="bg-white border-t border-slate-200/90 px-4 py-2 flex items-center justify-around z-30 shadow-md">
        {/* HOME */}
        <button
          onClick={() => onNavigateTab('home')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <HomeIcon className="w-5 h-5 text-slate-400 stroke-[1.8]" />
          <span className="text-[10px] font-semibold text-slate-500">Home</span>
        </button>

        {/* CATEGORIES (Active) */}
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex flex-col items-center gap-0.5 text-[#BA181B] relative cursor-pointer"
        >
          <LayoutGrid className="w-5 h-5 text-[#BA181B] stroke-[#BA181B] stroke-[2.2]" />
          <span className="text-[10px] font-bold text-[#BA181B]">Categories</span>
          <div className="w-7 h-[2.5px] bg-[#BA181B] rounded-full absolute -bottom-1.5" />
        </button>

        {/* CART */}
        <button
          onClick={() => onNavigateTab('cart')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors relative cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5 text-slate-400 stroke-[1.8]" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#BA181B] text-white text-[9px] font-extrabold flex items-center justify-center border-1.5 border-white shadow-2xs">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-semibold text-slate-500">Cart</span>
        </button>

        {/* ORDERS */}
        <button
          onClick={() => onNavigateTab('my_orders')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <ClipboardList className="w-5 h-5 text-slate-400 stroke-[1.8]" />
          <span className="text-[10px] font-semibold text-slate-500">Orders</span>
        </button>

        {/* SHARE */}
        <button
          onClick={() => onNavigateTab('share')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <Share2 className="w-5 h-5 text-slate-400 stroke-[1.8]" />
          <span className="text-[10px] font-semibold text-slate-500">Share</span>
        </button>
      </div>
    </div>
  );
};
