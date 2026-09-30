import { supabase } from '../../lib/supabase';
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  ShoppingCart,
  Info,
  X,
} from 'lucide-react';
import { HeaderMeatGharLogo } from '../MeatGharLogo';
import { AppImage } from '../common/AppImage';
import { useCart } from '../../context/CartContext';
import { PurchaseAgreementModal } from '../PurchaseAgreementModal';

interface ProductDetailsScreenProps {
  productId: string;
  onBack: () => void;
  onAddToCart?: () => void;
  onNavigateTab: (tab: string) => void;
}

export const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({
  productId,
  onBack,
  onAddToCart,
  onNavigateTab,
}) => {
  const { addToCart } = useCart();
  const [quantityKg, setQuantityKg] = useState(0.25);
  const [selectedCut, setSelectedCut] = useState('Curry Cut');
  const [customCutInstruction, setCustomCutInstruction] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showMinLimitToast, setShowMinLimitToast] = useState(false);
  const [showCuttingGuide, setShowCuttingGuide] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'add_to_cart' | 'buy_now' | null>(null);

  const [product, setProduct] = useState<any>(null);
  const [loadError, setLoadError] = useState('');
  useEffect(()=>{let alive=true;void supabase.from('products').select('*').eq('id',productId).single().then(({data,error})=>{if(!alive)return;if(error)setLoadError(error.message);else {setProduct(data);if(!data.unit_kg)setQuantityKg(1);}});return()=>{alive=false;};},[productId]);
  const pricePerKg = product ? Number(product.price) / (Number(product.unit_kg) || 1) : 0;
  const totalPrice = Math.round(pricePerKg * quantityKg * 100)/100;

  const formatQuantity = (val: number) => {
    if (!product?.unit_kg) return `${val} × ${product?.weight || 'unit'}`;
    if (val === 0.25) return '250 GRAM';
    if (val === 0.5) return '500 GRAM';
    return `${val} KG`;
  };

  const handleIncreaseQuantity = () => {
    if (!product?.unit_kg) {setQuantityKg(v=>Math.min(100,v+1));return;}
    setQuantityKg((prev) => {
      if (prev < 0.25) return 0.25;
      if (prev === 0.25) return 0.5;
      if (prev < 10) return Number((prev + 0.5).toFixed(2));
      return 10;
    });
  };

  const handleDecreaseQuantity = () => {
    if (!product?.unit_kg) {setQuantityKg(v=>Math.max(1,v-1));return;}
    if (quantityKg <= 0.25) {
      setShowMinLimitToast(true);
      setTimeout(() => {
        setShowMinLimitToast(false);
      }, 2000);
      return;
    }
    if (quantityKg <= 0.5) {
      setQuantityKg(0.25);
      return;
    }
    setQuantityKg((prev) => Number((prev - 0.5).toFixed(2)));
  };

  const cutOptions = ['Curry Cut', 'Small Pieces', 'Large Pieces', 'Custom Cut'];

  const executeAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.unit_kg ? totalPrice : Number(product.price),
      originalPrice: product.original_price ? Number(product.original_price) * (product.unit_kg ? quantityKg/Number(product.unit_kg) : 1) : undefined,
      image: product.image,
      category: product.category,
      weight: formatQuantity(quantityKg),
      cut: selectedCut === 'Custom Cut' ? `Custom: ${customCutInstruction || 'Special Cut'}` : selectedCut,
      quantity: product.unit_kg ? 1 : quantityKg,
      quantityKg: product.unit_kg ? quantityKg : undefined,
      notes,
    });

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      if (onAddToCart) onAddToCart();
    }, 900);
  };

  const executeBuyNow = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.unit_kg ? totalPrice : Number(product.price),
      originalPrice: product.original_price ? Number(product.original_price) * (product.unit_kg ? quantityKg/Number(product.unit_kg) : 1) : undefined,
      image: product.image,
      category: product.category,
      weight: formatQuantity(quantityKg),
      cut: selectedCut === 'Custom Cut' ? `Custom: ${customCutInstruction || 'Special Cut'}` : selectedCut,
      quantity: product.unit_kg ? 1 : quantityKg,
      quantityKg: product.unit_kg ? quantityKg : undefined,
      notes,
    });
    onNavigateTab('delivery_address');
  };

  const handleAddProductToCart = () => {
    if(!product?.in_stock || product.stock_quantity<=0) {setLoadError('This product is unavailable');return;}
    setPendingAction('add_to_cart');
    setIsAgreementOpen(true);
  };

  const handleBuyNow = () => {
    if(!product?.in_stock || product.stock_quantity<=0) {setLoadError('This product is unavailable');return;}
    setPendingAction('buy_now');
    setIsAgreementOpen(true);
  };

  const handleConfirmAgreement = () => {
    setIsAgreementOpen(false);
    if (pendingAction === 'add_to_cart') {
      executeAddToCart();
    } else if (pendingAction === 'buy_now') {
      executeBuyNow();
    }
    setPendingAction(null);
  };

  if (!product) return <div className="p-6"><button onClick={onBack}>Back</button><p role="status">{loadError || 'Loading product…'}</p></div>;
  return (
    <div className="w-full h-full bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden select-none">
      {loadError && <p role="status" className="p-2 text-xs text-red-800 bg-red-50">{loadError}</p>}
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
          <span>Added {formatQuantity(quantityKg)} to Cart!</span>
        </div>
      )}

      {/* Minimum Limit Alert Toast */}
      {showMinLimitToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#333333] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border border-slate-600">
          <span className="text-xs">🏠</span>
          <span className="tracking-wide">MINIMUM 250 GRAM</span>
        </div>
      )}

      {/* ✂️ Cutting Guide Popup Modal */}
      {showCuttingGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowCuttingGuide(false)}
        >
          <div
            className="bg-white w-full max-w-[320px] rounded-2xl p-4 shadow-2xl border border-slate-100 relative text-slate-800 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#BA181B] flex items-center gap-1.5">
                <span>✂️</span>
                <span>Cutting Guide</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCuttingGuide(false)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Guide Content */}
            <div className="py-2.5 space-y-2.5 text-left">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Curry Cut</h4>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Medium-sized pieces, perfect for everyday curries, gravies, and stews.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900">Small Pieces</h4>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Smaller pieces for quicker cooking and dishes that require bite-sized chicken.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900">Large Pieces</h4>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Larger pieces, ideal for BBQ, roasting, grilling, and special dishes.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900">Custom Cut</h4>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Tell us exactly how you want your chicken cut.
                  <br />
                  <span className="text-slate-400 italic">Example: “12 medium-sized pieces”</span>
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-1.5 mt-1">
                <span className="text-xs shrink-0">💡</span>
                <p className="text-[10px] text-amber-900 font-medium leading-tight">
                  <strong>Note:</strong> Piece count may vary depending on the selected weight and cut size.
                </p>
              </div>
            </div>

            {/* GOT IT Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowCuttingGuide(false)}
                className="w-full py-2.5 bg-[#BA181B] hover:bg-red-800 active:bg-red-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-900/20 transition-all cursor-pointer"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. FIXED TOP HEADER (Never scrolls) */}
      <div className="bg-white px-4 pt-3 pb-3 border-b border-slate-200/90 shadow-2xs z-30 shrink-0 flex items-center justify-between">
        {/* Left: Back button + Meat Ghar logo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-slate-100 text-[#BA181B] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <HeaderMeatGharLogo />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-[#BA181B] cursor-pointer"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#BA181B]' : ''}`} />
          </button>
          <button aria-label="Share product" onClick={async()=>{try{if(navigator.share)await navigator.share({title:product.name,text:product.name+' — Meat Ghar',url:window.location.origin});else {await navigator.clipboard.writeText(product.name+' — '+window.location.origin);setLoadError('Product link copied');}}catch(error:any){if(error.name!=='AbortError')setLoadError('Unable to share this product.');}}} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 cursor-pointer">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE CONTENT ONLY */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-4 no-scrollbar">
        {/* Large Product Hero Image */}
        <div className="relative w-full aspect-16/10 bg-slate-100 overflow-hidden shadow-2xs">
          <AppImage
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-3 left-3 bg-[#BA181B] text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-md">
            {product.badge || product.category}
          </span>
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs flex items-center gap-1">
            <span>🍃</span> Fresh & Safe
          </span>

          {/* Dots indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#BA181B]" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
          </div>
        </div>

        {/* Product Details Section */}
        <div className="bg-white p-4 space-y-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-[#BA181B]">
                ₹{pricePerKg} <span className="text-xs font-semibold text-[#BA181B]/80">/ {product.unit_kg ? 'KG' : product.weight}</span>
              </span>
              <span className="text-xs text-slate-400 line-through">{product.original_price ? `₹${(Number(product.original_price)/(Number(product.unit_kg) || 1)).toFixed(2)}` : ''}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{product.in_stock && product.stock_quantity>0 ? 'In Stock' : 'Out of Stock'}</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mt-2">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleDecreaseQuantity}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer active:scale-95 ${
                  quantityKg <= 0.25
                    ? 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-[#BA181B]'
                    : 'bg-red-100/70 text-[#A8071A] hover:bg-red-200'
                }`}
                title={quantityKg <= 0.25 ? 'Minimum 250 GRAM' : 'Decrease Quantity'}
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center font-black text-sm text-slate-900 tracking-wide">
                <span>{formatQuantity(quantityKg)}</span>
              </div>

              <button
                type="button"
                onClick={handleIncreaseQuantity}
                disabled={quantityKg >= 10}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer active:scale-95 ${
                  quantityKg >= 10
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    : 'bg-red-100/70 text-[#A8071A] hover:bg-red-200'
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400 font-semibold tracking-wider uppercase mt-2">
              MIN 250 GRAM - MAX 10 KG
            </p>
          </div>

          {/* Choose Cut Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold text-slate-900">
                Choose Cut <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCuttingGuide(true)}
                className="text-[10px] font-bold text-[#BA181B] hover:text-red-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View Guide</span>
                <Info className="w-3 h-3 text-[#BA181B]" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cutOptions.map((c) => {
                const isSelected = selectedCut === c;
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCut(c)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#BA181B] text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Cut Input */}
            {selectedCut === 'Custom Cut' && (
              <div className="mt-2.5 bg-red-50/60 border border-red-200/90 rounded-xl p-2.5">
                <label className="text-[11px] font-extrabold text-[#BA181B] block mb-1">
                  Custom Cut Instructions <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="custom_cut_no_autofill"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  value={customCutInstruction}
                  onChange={(e) => setCustomCutInstruction(e.target.value)}
                  placeholder="e.g. Please cut into 1.5 inch cubes with bone"
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-red-200 rounded-lg px-3 py-2 outline-none focus:border-[#BA181B] focus:ring-1 focus:ring-[#BA181B] placeholder-slate-400"
                />
              </div>
            )}
          </div>

          {/* Add Notes (Optional) */}
          <div>
            <label className="text-xs font-extrabold text-slate-800 block mb-1">
              Add Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <input
                type="text"
                name="order_notes_no_autofill"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please cut into small pieces."
                className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none placeholder-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. FIXED BOTTOM ACTION BAR (Sticky & Never Scrolls) */}
      <div className="shrink-0 bg-white border-t border-slate-200/90 px-4 pt-3 pb-6 z-30 shadow-lg">
        {/* Row 1: Total Price & Size in a centered box */}
        <div className="bg-slate-50/80 border border-slate-100 rounded-xl py-2.5 px-4 mb-4 flex items-center justify-center gap-2.5 shadow-inner">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Price:</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-[#BA181B]">₹{totalPrice}</span>
            <span className="text-[11px] font-bold text-slate-500 lowercase tracking-tight">
              ({formatQuantity(quantityKg)})
            </span>
          </div>
        </div>

        {/* Row 2: Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddProductToCart}
            className="flex-1 py-4 bg-[#BA181B] hover:bg-red-800 active:bg-red-900 text-white font-black text-xs rounded-xl shadow-md shadow-red-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>ADD TO CART</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>BUY NOW</span>
          </button>
        </div>
      </div>

      {/* Purchase Agreement Modal */}
      <PurchaseAgreementModal
        isOpen={isAgreementOpen}
        onClose={() => {
          setIsAgreementOpen(false);
          setPendingAction(null);
        }}
        onConfirm={handleConfirmAgreement}
      />
    </div>
  );
};
