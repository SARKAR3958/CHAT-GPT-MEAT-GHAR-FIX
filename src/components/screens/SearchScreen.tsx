import { supabase } from '../../lib/supabase';
import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  X,
  Clock,
  Star,
  Plus,
  Minus,
  Home as HomeIcon,
  LayoutGrid,
  ClipboardList,
  ShoppingCart,
  User,
  Share2,
} from 'lucide-react';
import { CategoryProduct } from './CategoryListScreen';
import { HeaderMeatGharLogo } from '../MeatGharLogo';
import { AppImage } from '../common/AppImage';
import { useCart } from '../../context/CartContext';
import { getCleanProductImage } from './HomeScreen';

interface SearchScreenProps {
  onBack: () => void;
  onSelectProduct: (productName: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onBack,
  onSelectProduct,
  onNavigateTab,
}) => {
  const { cartCount, addToCart, updateQuantity, getItemQuantity } = useCart();
  const [loadError,setLoadError]=useState('');
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  useEffect(()=>{ void supabase.from('products').select('*').then(({data,error})=>{if(error){setLoadError(error.message);return;}setProducts((data || []).map(p=>({id:p.id,name:p.name,categoryId:p.category_id || p.category,unitPrice:Number(p.price),weight:p.weight,price:`₹${p.price} / ${p.weight}`,rating:`${p.rating || 0} (${p.rating_count || 0})`,inStock:p.in_stock && p.stock_quantity>0,image:p.image})));}); },[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    'chicken',
    'mutton',
    'fish',
    'eggs',
    'tikka',
  ]);

  const suggestedSearches = [
    'Chicken Curry Cut',
    'Mutton Boneless',
    'Fresh Rohu Fish',
    'Tiger Prawns',
    'Farm Eggs',
  ];

  // Dynamic search filter across all products
  const filteredProducts = useMemo(() => {
    const rawTerm = searchTerm.trim().toLowerCase();
    if (!rawTerm) {
      // Default recommended picks when search is empty
      return products.slice(0, 8);
    }

    const tokens = rawTerm.split(/\s+/).filter(Boolean);

    return products.filter((p) => {
      const name = p.name.toLowerCase();
      const cat = p.categoryId.toLowerCase();

      // Check direct inclusion
      if (name.includes(rawTerm) || cat.includes(rawTerm)) return true;

      // Handle category synonyms
      const matchesCategory =
        (rawTerm === 'fish' && cat === 'fish') ||
        (rawTerm === 'chicken' && cat === 'chicken') ||
        (rawTerm === 'mutton' && cat === 'mutton') ||
        (rawTerm.startsWith('egg') && cat === 'eggs') ||
        (rawTerm.includes('prawn') && (cat === 'prawns' || name.includes('prawn'))) ||
        (rawTerm.includes('seafood') && (cat === 'prawns' || cat === 'fish')) ||
        (rawTerm.includes('tikka') && (cat === 'ready-to-cook' || cat === 'marinades')) ||
        (rawTerm.includes('kebab') && (cat === 'ready-to-cook' || cat === 'marinades'));

      if (matchesCategory) return true;

      // Check if every token matches name or category
      return tokens.every(
        (t) =>
          name.includes(t) ||
          cat.includes(t) ||
          (t === 'egg' && cat === 'eggs') ||
          (t === 'cut' && name.includes('cut')) ||
          (t === 'curry' && name.includes('curry')) ||
          (t === 'boneless' && name.includes('boneless'))
      );
    });
  }, [searchTerm, products]);

  const handleSelectSearch = (term: string) => {
    setSearchTerm(term);
    if (!recentSearches.includes(term.toLowerCase())) {
      setRecentSearches((prev) => [term.toLowerCase(), ...prev.slice(0, 4)]);
    }
  };

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
    <div className="w-full h-full min-h-0 bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {loadError && <p role="alert" className="p-3 text-red-800 bg-red-50">{loadError}</p>}
      {/* Top Header Bar */}
      <div className="bg-white px-4 pt-3 pb-3 border-b border-slate-200 shadow-2xs z-20 shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBack}
              className="p-1 rounded-full hover:bg-slate-100 text-[#BA181B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className="text-base font-black text-slate-900 leading-tight">Search</h2>
          </div>

          {/* Meat Ghar Header Branding */}
          <HeaderMeatGharLogo />
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="flex items-center bg-slate-100/90 rounded-xl px-3 py-2 border border-slate-200/90 focus-within:border-[#BA181B] focus-within:bg-white transition-all shadow-2xs">
            <Search className="w-4 h-4 text-[#BA181B] shrink-0 mr-2 stroke-[2.2]" />
            <input
              type="text"
              name="search_query_no_autofill"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chicken, mutton, fish, eggs..."
              className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none placeholder:text-slate-400"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Search Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3.5 no-scrollbar pb-20">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Recent Searches</span>
              </div>
              <button
                onClick={() => setRecentSearches([])}
                className="text-[11px] font-bold text-[#BA181B] hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {recentSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSelectSearch(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                    searchTerm.toLowerCase() === s.toLowerCase()
                      ? 'bg-[#BA181B] text-white shadow-2xs'
                      : 'bg-red-50/70 border border-red-100 text-slate-700 hover:bg-red-100'
                  }`}
                >
                  <Clock className={`w-3 h-3 ${searchTerm.toLowerCase() === s.toLowerCase() ? 'text-white' : 'text-red-400'}`} />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Searches */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
            <span>✨ Suggested Searches</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {suggestedSearches.map((s) => (
              <button
                key={s}
                onClick={() => handleSelectSearch(s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                  searchTerm.toLowerCase() === s.toLowerCase()
                    ? 'bg-[#BA181B] text-white shadow-2xs'
                    : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Search className={`w-3 h-3 ${searchTerm.toLowerCase() === s.toLowerCase() ? 'text-white' : 'text-slate-400'}`} />
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Heading */}
        <div>
          <div className="flex items-center justify-between mb-2.5 pt-1">
            <h3 className="text-xs font-extrabold text-slate-900">
              {searchTerm ? `Results for "${searchTerm}"` : 'Popular Recommendations'}
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {/* Results Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((p) => {
                const qty = getItemQuantity(p.id) || getItemQuantity(p.name);

                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p.id)}
                    className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Product Image with Badges */}
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
          ) : (
            /* Empty State when no results found */
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-center shadow-2xs my-2">
              <div className="w-12 h-12 rounded-full bg-red-50 text-[#BA181B] flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 stroke-[2]" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-800">
                No products found for "{searchTerm}"
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1 max-w-[260px] mx-auto">
                We couldn't find matching meat or seafood cuts. Try checking your spelling or search another keyword.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['Chicken', 'Mutton', 'Fish', 'Eggs', 'Kebab'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleSelectSearch(tag)}
                    className="px-3 py-1 bg-red-50 hover:bg-red-100 text-[#BA181B] rounded-full text-xs font-bold transition-colors cursor-pointer border border-red-200"
                  >
                    Search {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="bg-white border-t border-slate-200/90 px-4 py-2 flex items-center justify-around z-30 shadow-md shrink-0">
        <button
          onClick={() => onNavigateTab('home')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <HomeIcon className="w-5 h-5 text-slate-400 stroke-[1.8]" />
          <span className="text-[10px] font-semibold text-slate-500">Home</span>
        </button>

        <button
          onClick={() => onNavigateTab('categories')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <LayoutGrid className="w-5 h-5 text-slate-400 stroke-[1.8]" />
          <span className="text-[10px] font-semibold text-slate-500">Categories</span>
        </button>

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

        <button
          onClick={() => onNavigateTab('my_orders')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <ClipboardList className="w-5 h-5 text-slate-400 stroke-[1.8]" />
          <span className="text-[10px] font-semibold text-slate-500">Orders</span>
        </button>

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
