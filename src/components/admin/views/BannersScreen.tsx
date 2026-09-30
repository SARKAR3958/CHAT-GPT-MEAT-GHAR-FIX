import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Camera,
  UploadCloud,
  ChevronRight,
  Eye,
  Sliders,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { AdminHeader } from '../components/AdminHeader';
import { AdminBottomNav } from '../components/AdminBottomNav';
import { AdminBanner } from '../types';

const PRESET_BANNER_IMAGES = [
  '/images/hero_banner_meat_1790507616083.jpg',
  '/images/rohu_fish_wide_1790508321588.jpg',
  '/images/chicken_curry_cut_wide_1790508282856.jpg',
  '/images/mutton_boneless_wide_1790508301717.jpg',
  '/images/cat_ready_to_cook_1790507566251.jpg',
  '/images/cat_prawns_seafood_1790508815698.jpg',
];

const GRADIENT_PRESETS = [
  { label: 'Royal Red', value: 'from-[#6e0513] via-[#8c0818] to-[#48020b]' },
  { label: 'Ocean Teal', value: 'from-[#0e3b43] via-[#155e75] to-[#082f49]' },
  { label: 'Flame Orange', value: 'from-[#7c2d12] via-[#9a3412] to-[#431407]' },
  { label: 'Deep Indigo', value: 'from-[#312e81] via-[#3730a3] to-[#1e1b4b]' },
  { label: 'Charcoal Black', value: 'from-[#18181b] via-[#27272a] to-[#09090b]' },
];

export const BannersScreen: React.FC = () => {
  const { banners, categories, addBanner, updateBanner, deleteBanner, toggleBannerActive, uploadImage } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('FRESH MEAT');
  const [subtitle, setSubtitle] = useState('DELIVERED TO YOU');
  const [tagline, setTagline] = useState('Fresh meat delivered to your doorstep.');
  const [badgeText, setBadgeText] = useState('Fresh & Safe');
  const [image, setImage] = useState(PRESET_BANNER_IMAGES[0]);
  const [targetCategory, setTargetCategory] = useState(categories[0]?.id || 'chicken');
  const [backgroundColor, setBackgroundColor] = useState(GRADIENT_PRESETS[0].value);
  const [buttonText, setButtonText] = useState('Order Now');

  const handleFileUpload = async (e:React.ChangeEvent<HTMLInputElement>) => {const file=e.target.files?.[0];if(file){const url=await uploadImage(file);if(url)setImage(url);}};

  const handleOpenAdd = () => {
    setEditingBannerId(null);
    setTitle('FRESH MEAT');
    setSubtitle('DELIVERED TO YOU');
    setTagline('Fresh meat delivered to your doorstep.');
    setBadgeText('Fresh & Safe');
    setImage(PRESET_BANNER_IMAGES[0]);
    setTargetCategory(categories[0]?.id || 'chicken');
    setBackgroundColor(GRADIENT_PRESETS[0].value);
    setButtonText('Order Now');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (banner: AdminBanner) => {
    setEditingBannerId(banner.id);
    setTitle(banner.title);
    setSubtitle(banner.subtitle);
    setTagline(banner.tagline || '');
    setBadgeText(banner.badgeText || 'Special Offer');
    setImage(banner.image);
    setTargetCategory(banner.targetCategory);
    setBackgroundColor(banner.backgroundColor || GRADIENT_PRESETS[0].value);
    setButtonText(banner.buttonText || 'Order Now');
    setIsAddModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedCategory = categories.find((c) => c.id === targetCategory);
    const targetCategoryName = matchedCategory ? matchedCategory.name : 'All Categories';

    if (editingBannerId) {
      updateBanner(editingBannerId, {
        title,
        subtitle,
        tagline,
        badgeText,
        image,
        targetCategory,
        targetCategoryName,
        backgroundColor,
        buttonText,
      });
    } else {
      addBanner({
        title,
        subtitle,
        tagline,
        badgeText,
        image,
        targetCategory,
        targetCategoryName,
        backgroundColor,
        buttonText,
        isActive: true,
        orderIndex: banners.length,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="w-full h-full bg-[#F8F9FA] text-slate-800 flex flex-col justify-between overflow-hidden font-sans select-none relative">
      {/* Header */}
      <AdminHeader
        title="Sliding Banners"
        showDrawer={true}
        showBell={true}
        rightAction={
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-full shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Banner</span>
          </button>
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* Info Banner */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-300 shadow-2xs flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900">User App Sliding Hero Carousel</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Customers can swipe through these banners on the home screen.
            </p>
          </div>
          <span className="bg-red-50 text-red-600 text-xs font-extrabold px-2.5 py-1 rounded-full border border-red-200">
            {banners.filter((b) => b.isActive).length} Active
          </span>
        </div>

        {/* Banners List */}
        <div className="space-y-3.5">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="bg-white p-3.5 rounded-3xl border border-slate-300 shadow-2xs space-y-3 relative hover:border-slate-400 transition-all"
            >
              {/* Top Header Row of Banner Card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{banner.title}</span>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-full">
                    Opens: {banner.targetCategoryName}
                  </span>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBannerActive(banner.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                      banner.isActive
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {banner.isActive ? 'Active' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(banner)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                    title="Edit Banner"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Delete this banner from user app?')) {
                        deleteBanner(banner.id);
                      }
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* LIVE BANNER PREVIEW BOX (Exact match with user app) */}
              <div
                className={`bg-gradient-to-r ${banner.backgroundColor || 'from-[#6e0513] via-[#8c0818] to-[#48020b]'} text-white rounded-2xl p-3.5 shadow-md relative overflow-hidden min-h-[145px] flex items-center justify-between`}
              >
                {/* Left Text Content */}
                <div className="relative z-10 max-w-[200px] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[16px] font-black text-white tracking-tight leading-none uppercase">
                      {banner.title}
                    </span>
                  </div>

                  <div className="text-[18px] font-black text-[#FACC15] tracking-tight leading-none uppercase">
                    {banner.subtitle}
                  </div>

                  <p className="text-[10px] text-white/90 font-medium leading-snug line-clamp-2 pt-0.5">
                    {banner.tagline || 'Fresh meat delivered to your doorstep.'}
                  </p>

                  <div className="mt-1.5 py-1 px-3 bg-red-600 border border-white/20 text-white font-bold text-[10.5px] rounded-full inline-flex items-center gap-1 shadow-xs">
                    <span>{banner.buttonText || 'Order Now'}</span>
                    <ArrowRight className="w-3 h-3 text-white stroke-[2.5]" />
                  </div>
                </div>

                {/* Right Image */}
                <div className="absolute top-0 right-0 w-[46%] h-full pointer-events-none overflow-hidden">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover object-center"
                  />
                  {banner.badgeText && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[8.5px] font-bold px-1.5 py-0.5 rounded-full border border-white/30 flex items-center gap-0.5 shadow-xs">
                      <span>{banner.badgeText}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT BANNER MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-4 shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto no-scrollbar space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingBannerId ? 'Edit Sliding Banner' : 'Add New Sliding Banner'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-3.5">
              {/* Banner Image Selection & Device Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">Banner Photo</label>
                <div className="h-32 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 relative bg-slate-50 flex items-center justify-center">
                  <img
                    src={image}
                    alt="Preview"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold gap-1.5 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Image from Gallery / File</span>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Preset Thumbnails */}
                <div className="grid grid-cols-6 gap-1.5 pt-1">
                  {PRESET_BANNER_IMAGES.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImage(imgUrl)}
                      className={`h-10 rounded-lg overflow-hidden border-2 cursor-pointer ${
                        image === imgUrl ? 'border-red-600 ring-2 ring-red-500/20' : 'border-slate-200'
                      }`}
                    >
                      <img src={imgUrl} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Headline (Line 1)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 70 MINUTES"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Highlight (Yellow Line)</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. OR FREE / 20% OFF"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Tagline Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Tagline Subtext</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Fresh meat delivered to your doorstep."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              {/* TARGET CATEGORY (CLICK REDIRECTION) */}
              <div className="space-y-1 bg-red-50/50 p-3 rounded-2xl border border-red-200">
                <label className="text-xs font-bold text-red-900 block flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-red-600" />
                  <span>When Clicked, Open This Category:</span>
                </label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-red-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} Category ({cat.productCount || 0} items)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-red-600 mt-1">
                  Customer clicking on this banner will directly open this category screen!
                </p>
              </div>

              {/* Badge & Button Text */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Top Badge Tag</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. Fresh & Safe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Button Label</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. Order Now"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Background Color Themes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Banner Theme Gradient</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {GRADIENT_PRESETS.map((grad, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBackgroundColor(grad.value)}
                      className={`p-1.5 rounded-xl border text-[10px] font-bold text-left transition-all cursor-pointer ${
                        backgroundColor === grad.value
                          ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-500/20'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {grad.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
                >
                  {editingBannerId ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <AdminBottomNav />
    </div>
  );
};
