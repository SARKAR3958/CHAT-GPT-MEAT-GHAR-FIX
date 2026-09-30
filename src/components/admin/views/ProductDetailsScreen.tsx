import React from 'react';
import { Layers, Package, Calendar, Edit2, Trash2, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { AdminHeader } from '../components/AdminHeader';

export const ProductDetailsScreen: React.FC = () => {
  const { selectedProduct, navigateAdminScreen, deleteProduct, toggleProductActive } = useAdmin();

  if (!selectedProduct) {
    return (
      <div className="w-full h-full bg-[#F8F9FA] flex flex-col justify-center items-center p-6 text-center">
        <p className="text-sm font-bold text-slate-800">No product selected</p>
        <button
          onClick={() => navigateAdminScreen('products')}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to permanently delete "${selectedProduct.name}"?`)) {
      deleteProduct(selectedProduct.id);
    }
  };

  return (
    <div className="w-full h-full bg-[#F8F9FA] text-slate-800 flex flex-col justify-between overflow-hidden font-sans select-none">
      {/* Header */}
      <AdminHeader title="Product Details" showBack={true} showBell={false} />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* Large Hero Product Image Card */}
        <div className="w-full h-56 rounded-3xl overflow-hidden bg-white border border-slate-300 shadow-sm relative">
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                selectedProduct.isActive
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-white'
              }`}
            >
              {selectedProduct.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Title, Price & Status Row */}
        <div className="bg-white p-4 rounded-3xl border border-slate-300 shadow-2xs space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug">{selectedProduct.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base font-extrabold text-red-600">
                  Rs. {selectedProduct.price}
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    Rs. {selectedProduct.originalPrice}
                  </span>
                )}
              </div>
            </div>

            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                selectedProduct.isActive
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
            >
              {selectedProduct.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            {selectedProduct.description || 'Special fresh cuts prepared hygienically.'}
          </p>
        </div>

        {/* Information Grid Cards Matching Screen 7 */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* 1. Category */}
          <div className="bg-white p-3 rounded-2xl border border-slate-300 shadow-2xs flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-1.5">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Category</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 truncate max-w-full">
              {selectedProduct.category}
            </span>
          </div>

          {/* 2. Stock */}
          <div className="bg-white p-3 rounded-2xl border border-slate-300 shadow-2xs flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-1.5">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Stock</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 truncate max-w-full">
              {selectedProduct.stockQuantity}+
            </span>
          </div>

          {/* 3. Created At */}
          <div className="bg-white p-3 rounded-2xl border border-slate-300 shadow-2xs flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-1.5">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Created At</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 truncate max-w-full">
              {selectedProduct.createdAt}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Fixed Action Buttons Matching Screen 7 */}
      <div className="bg-white border-t border-slate-300 p-4 shrink-0 flex items-center gap-3">
        <button
          onClick={() => navigateAdminScreen('edit_product')}
          className="flex-1 py-3 bg-white hover:bg-slate-50 border-2 border-red-600 text-red-600 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit</span>
        </button>

        <button
          onClick={handleDelete}
          className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-red-600/20 transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
