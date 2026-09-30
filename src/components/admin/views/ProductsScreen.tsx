import React, { useState } from 'react';
import { Search, SlidersHorizontal, Plus, MoreVertical, Edit2, Trash2, CheckCircle2, XCircle, Layers, X } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { AdminHeader } from '../components/AdminHeader';
import { AdminBottomNav } from '../components/AdminBottomNav';
import { AdminProduct } from '../types';

export const ProductsScreen: React.FC = () => {
  const { products, categories, navigateAdminScreen, setSelectedProduct, toggleProductActive, deleteProduct } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Filter calculations
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.filter((p) => !p.isActive).length;

  // Helper to count products per category dynamically
  const getCategoryCount = (catId: string, catName: string) => {
    return products.filter(
      (p) => p.categoryId === catId || p.category.toLowerCase() === catName.toLowerCase()
    ).length;
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter by category if selected
    if (selectedCategory) {
      const matchCat =
        product.categoryId === selectedCategory ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchCat) return false;
    }

    if (activeTab === 'active') return product.isActive;
    if (activeTab === 'inactive') return !product.isActive;
    return true;
  });

  const handleProductClick = (product: AdminProduct) => {
    setSelectedProduct(product);
    navigateAdminScreen('product_details');
  };

  const handleEditClick = (e: React.MouseEvent, product: AdminProduct) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setOpenMenuId(null);
    navigateAdminScreen('edit_product');
  };

  const handleDeleteClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
    }
  };

  const handleToggleClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    toggleProductActive(productId);
  };

  const handleCategorySelect = (catId: string | null) => {
    if (selectedCategory === catId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catId);
    }
  };

  const activeCategoryObj = categories.find(
    (c) => c.id === selectedCategory || c.name.toLowerCase() === selectedCategory?.toLowerCase()
  );

  return (
    <div
      onClick={() => setOpenMenuId(null)}
      className="w-full h-full bg-[#F8F9FA] text-slate-800 flex flex-col justify-between overflow-hidden font-sans select-none"
    >
      {/* Header */}
      <AdminHeader title="Products" showDrawer={true} showBell={true} />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-3.5">
        {/* Search Bar & Filter Button */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or categories..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-2xs"
            />
          </div>

          <button
            onClick={() => {
              setSelectedCategory(null);
              setActiveTab(activeTab === 'all' ? 'active' : activeTab === 'active' ? 'inactive' : 'all');
            }}
            className="w-10 h-10 bg-white border border-slate-300 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs shrink-0 cursor-pointer"
            title="Reset Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills & Add Product Button Row */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Pill Switchers */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedCategory(null);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all' && !selectedCategory
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All ({totalCount})
            </button>

            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Active ({activeCount})
            </button>

            <button
              onClick={() => setActiveTab('inactive')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inactive'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>

          {/* + Add Product Button */}
          <button
            onClick={() => {
              setSelectedProduct(null);
              navigateAdminScreen('add_product');
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-full shrink-0 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Product</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CATEGORY CARDS SECTION WITH RED PRODUCT COUNT BADGES (User App Style) */}
        {/* ========================================================================= */}
        <div className="bg-white p-3 rounded-2xl border border-slate-300 shadow-2xs space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 tracking-tight">Filter by Category</span>
              <span className="text-[10px] font-semibold text-slate-400">({categories.length} categories)</span>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Clear Filter</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Horizontal Scrollable Category Cards Tray */}
          <div className="flex items-start gap-2.5 overflow-x-auto no-scrollbar py-1 px-0.5">
            {/* 0. "All Categories" Card */}
            <div
              onClick={() => setSelectedCategory(null)}
              className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0 w-[64px]"
            >
              <div className="relative">
                <div
                  className={`w-[56px] h-[56px] rounded-2xl p-0.5 shadow-2xs overflow-hidden transition-all flex items-center justify-center shrink-0 ${
                    !selectedCategory
                      ? 'bg-red-600 text-white border-2 border-red-600 ring-2 ring-red-600/30'
                      : 'bg-slate-100 text-slate-600 border border-slate-300 hover:border-slate-400 group-hover:scale-105'
                  }`}
                >
                  <Layers className="w-5 h-5 stroke-[2.2]" />
                </div>
                {/* Red Count Badge on Top of Category Card */}
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9.5px] font-black px-1.5 py-0.2 rounded-full border-2 border-white shadow-xs leading-tight">
                  {totalCount}
                </span>
              </div>
              <span
                className={`text-[10.5px] text-center leading-tight line-clamp-1 max-w-[64px] ${
                  !selectedCategory ? 'font-black text-red-600' : 'font-bold text-slate-700'
                }`}
              >
                All
              </span>
            </div>

            {/* 1..N Category Cards matching user app */}
            {categories.map((cat) => {
              const isSelected =
                selectedCategory === cat.id ||
                selectedCategory?.toLowerCase() === cat.name.toLowerCase();
              const catProdCount = getCategoryCount(cat.id, cat.name);

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group shrink-0 w-[64px]"
                >
                  <div className="relative">
                    <div
                      className={`w-[56px] h-[56px] rounded-2xl bg-[#FDF2F2] p-0.5 shadow-2xs overflow-hidden transition-all flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-2 border-red-600 ring-2 ring-red-600/30 scale-105'
                          : 'border border-slate-300 hover:border-slate-400 group-hover:scale-105'
                      }`}
                    >
                      <img
                        src={cat.image}
                        alt={cat.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    </div>

                    {/* RED COUNT BADGE ON TOP OF CATEGORY CARD */}
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9.5px] font-black px-1.5 py-0.2 rounded-full border-2 border-white shadow-xs leading-tight">
                      {catProdCount}
                    </span>
                  </div>

                  <span
                    className={`text-[10.5px] text-center leading-tight line-clamp-1 max-w-[64px] ${
                      isSelected ? 'font-black text-red-600' : 'font-bold text-slate-700'
                    }`}
                  >
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter State Banner */}
        {selectedCategory && (
          <div className="flex items-center justify-between bg-red-50/90 border border-red-200 px-3 py-1.5 rounded-xl text-xs text-red-700">
            <span className="font-bold">
              Showing: <span className="font-extrabold underline">{activeCategoryObj?.name || selectedCategory}</span> ({filteredProducts.length} items)
            </span>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-red-700 font-bold hover:text-red-900 cursor-pointer text-xs"
            >
              Show All Products
            </button>
          </div>
        )}

        {/* Product Items List */}
        <div className="space-y-2 pt-1">
          {filteredProducts.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-300 text-center space-y-2 shadow-2xs">
              <p className="text-sm font-bold text-slate-800">No products found</p>
              <p className="text-xs text-slate-400">
                {selectedCategory
                  ? `No items found in category "${activeCategoryObj?.name || selectedCategory}".`
                  : 'Try adjusting your search or add a new item.'}
              </p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 cursor-pointer transition-all mt-2"
                >
                  View All Products
                </button>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white p-3 rounded-2xl border border-slate-300 shadow-2xs flex items-center justify-between gap-3 relative hover:border-slate-400 active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80';
                    }}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-100"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-bold text-slate-800">Rs. {product.price}</p>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md font-medium">
                        {product.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      product.isActive
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>

                  {/* 3-dots Menu Button */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === product.id ? null : product.id);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover Action Menu */}
                    {openMenuId === product.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-9 w-36 bg-white rounded-2xl shadow-xl border border-slate-300 py-1 z-30 space-y-0.5"
                      >
                        <button
                          onClick={(e) => handleEditClick(e, product)}
                          className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={(e) => handleToggleClick(e, product.id)}
                          className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          {product.isActive ? (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-amber-500" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          onClick={(e) => handleDeleteClick(e, product.id)}
                          className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <AdminBottomNav />
    </div>
  );
};
