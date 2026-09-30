import React, { useState, useEffect, useRef } from 'react';
import { Camera, ChevronDown, Image as ImageIcon, Sparkles, UploadCloud, FolderOpen, ImagePlus } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { AdminHeader } from '../components/AdminHeader';

const SAMPLE_IMAGE_OPTIONS = [
  '/images/chicken_curry_cut_wide_1790508282856.jpg',
  '/images/mutton_boneless_wide_1790508301717.jpg',
  '/images/rohu_fish_wide_1790508321588.jpg',
  '/images/cat_eggs_1790504403080.jpg',
  '/images/cat_ready_to_cook_1790507566251.jpg',
  '/images/cat_prawns_seafood_1790508815698.jpg',
  '/images/cat_cold_cuts_1790508827963.jpg',
  '/images/cat_special_cuts_1790507586236.jpg',
];

export const AddProductScreen: React.FC<{ isEditMode?: boolean }> = ({ isEditMode = false }) => {
  const { categories, addProduct, updateProduct, selectedProduct, goBackAdmin, uploadImage } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'chicken');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('420');
  const [stockQuantity, setStockQuantity] = useState<string>('50');
  const [unit, setUnit] = useState('1 KG');
  const [isAvailable, setIsAvailable] = useState(true);
  const [image, setImage] = useState(SAMPLE_IMAGE_OPTIONS[0]);
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    if (isEditMode && selectedProduct) {
      setName(selectedProduct.name);
      setCategoryId(
        selectedProduct.categoryId ||
          categories.find((c) => c.name.toLowerCase() === selectedProduct.category.toLowerCase())?.id ||
          categories[0]?.id ||
          ''
      );
      setDescription(selectedProduct.description);
      setPrice(selectedProduct.price.toString());
      setStockQuantity(selectedProduct.stockQuantity.toString());
      setUnit(selectedProduct.unit || '1 KG');
      setIsAvailable(selectedProduct.isActive);
      setImage(selectedProduct.image);
    }
  }, [isEditMode, selectedProduct, categories]);

  const handleFileUpload = async (e:React.ChangeEvent<HTMLInputElement>) => {const file=e.target.files?.[0];if(file){const url=await uploadImage(file);if(url){setImage(url);setShowImagePicker(false);}}};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name');
      return;
    }

    if(!categories.some(c=>c.id===categoryId) || !Number.isFinite(Number(price)) || Number(price)<=0 || !Number.isFinite(Number(stockQuantity)) || Number(stockQuantity)<0 || !image){alert('Select a category and image, enter a positive price and non-negative stock.');return;}
    const selectedCategoryObj = categories.find((c) => c.id === categoryId) || categories[0];
    const categoryName = selectedCategoryObj ? selectedCategoryObj.name : 'General';

    if (isEditMode && selectedProduct) {
      updateProduct(selectedProduct.id, {
        name: name.trim(),
        category: categoryName,
        categoryId: selectedCategoryObj?.id || categoryId,
        description: description.trim(),
        price: parseFloat(price) || 0,
        stockQuantity: Number(stockQuantity),
        unit,
        isActive: isAvailable,
        image,
      });

    } else {
      addProduct({
        name: name.trim(),
        category: categoryName,
        categoryId: selectedCategoryObj?.id || categoryId,
        description: description.trim(),
        price: parseFloat(price) || 0,
        stockQuantity: Number(stockQuantity),
        unit,
        isActive: isAvailable,
        image,
      });
    }
  };

  return (
    <div className="w-full h-full bg-[#F8F9FA] text-slate-800 flex flex-col justify-between overflow-hidden font-sans select-none">
      {/* Top Header */}
      <AdminHeader
        title={isEditMode ? 'Edit Product' : 'Add Product'}
        showBack={true}
        showBell={false}
      />

      {/* Form Area */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto pb-4">
          {/* ========================================================================= */}
          {/* Image Upload Box & Gallery Picker */}
          {/* ========================================================================= */}
          <div className="space-y-2.5">
            <div
              onClick={() => setShowImagePicker(!showImagePicker)}
              className="w-full h-44 bg-white border-2 border-dashed border-slate-300 hover:border-red-400 rounded-3xl flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all overflow-hidden relative group shadow-2xs"
            >
              {image ? (
                <div className="relative w-full h-full">
                  <img
                    src={image}
                    alt="Preview"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white text-xs font-bold gap-2">
                    <Camera className="w-4 h-4" />
                    <span>Change Image</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-2">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Tap to select sample image</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG up to 5MB</p>
                </>
              )}
            </div>

            {/* DIRECT UPLOAD FROM DEVICE / GALLERY BUTTON */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-4 bg-white hover:bg-red-50 hover:border-red-300 border border-slate-300 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-800 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
              >
                <UploadCloud className="w-4 h-4 text-red-600 stroke-[2.2]" />
                <span>Upload Image from Gallery / File</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImagePicker(!showImagePicker)}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs shrink-0"
              >
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>Samples</span>
              </button>
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Sample Image Quick Selector */}
            {showImagePicker && (
              <div className="p-3 bg-white rounded-2xl border border-slate-300 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-700">Choose from Fresh Meat Gallery:</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    + Upload Custom
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_IMAGE_OPTIONS.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setImage(imgUrl);
                        setShowImagePicker(false);
                      }}
                      className={`h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        image === imgUrl ? 'border-red-600 scale-95 ring-2 ring-red-500/30' : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt="Sample"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 block">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name (e.g. Chicken Curry Cut)"
              required
              className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-2xs"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 block">Category</label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full appearance-none px-3.5 py-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-2xs pr-10 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 block">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description and special cuts..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-2xs resize-none"
            />
          </div>

          {/* Price, Stock Quantity & Unit */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">Price (₹)</label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full px-3 py-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">Stock</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="0"
                required
                className="w-full px-3 py-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-2xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full appearance-none px-2.5 py-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-2xs cursor-pointer"
              >
                <option value="1 KG">1 KG</option>
                <option value="500G">500G</option>
                <option value="400G">400G</option>
                <option value="Pack of 30">Pack of 30</option>
                <option value="Pack of 12">Pack of 12</option>
                <option value="Pack of 6">Pack of 6</option>
                <option value="Pack of 4">Pack of 4</option>
                <option value="Pack of 2">Pack of 2</option>
                <option value="Piece">Piece</option>
              </select>
            </div>
          </div>

          {/* Available Toggle Switch Matching Screen 6 */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-300 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Available Status</span>
              <span className="text-[10px] text-slate-400">Show on consumer mobile app</span>
            </div>

            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                isAvailable ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isAvailable ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-600/20 transition-all cursor-pointer mt-2"
          >
            {isEditMode ? 'Save Changes' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
};
