import React, { useState } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, Layers, X } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { AdminHeader } from '../components/AdminHeader';
import { AdminBottomNav } from '../components/AdminBottomNav';
import { AdminCategory } from '../types';

export const CategoriesScreen: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useAdmin();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState(
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80'
  );

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      iconName: 'Layers',
      image: newCatImage,
    });
    setNewCatName('');
    setIsAddModalOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory(catId);
    }
  };

  return (
    <div
      onClick={() => setOpenMenuId(null)}
      className="w-full h-full bg-[#F8F9FA] text-slate-800 flex flex-col justify-between overflow-hidden font-sans select-none relative"
    >
      {/* Header with "+ Add Category" button */}
      <AdminHeader
        title="Categories"
        showBack={true}
        showBell={false}
        rightAction={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-full shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Category</span>
          </button>
        }
      />

      {/* Categories List Matching Screen 11 */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-2.5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-3 rounded-2xl border border-slate-300 shadow-2xs flex items-center justify-between gap-3 relative hover:border-slate-400 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100"
              />
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900 truncate">{cat.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{cat.productCount} products</p>
              </div>
            </div>

            <div className="shrink-0 relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === cat.id ? null : cat.id);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {openMenuId === cat.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-8 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-30 space-y-0.5"
                >
                  <button
                    onClick={(e) => handleDelete(e, cat.id)}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Add New Category</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Category Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Steaks & BBQ"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Image URL</label>
                <input
                  type="text"
                  value={newCatImage}
                  onChange={(e) => setNewCatImage(e.target.value)}
                  placeholder="https://..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-600/20 transition-all cursor-pointer mt-1"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <AdminBottomNav />
    </div>
  );
};
