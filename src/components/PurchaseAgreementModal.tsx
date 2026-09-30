import React, { useState } from 'react';

interface PurchaseAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PurchaseAgreementModal: React.FC<PurchaseAgreementModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (!isChecked) return;
    setIsChecked(false);
    onConfirm();
  };

  const handleClose = () => {
    setIsChecked(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-[3px] animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[390px] bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agreementTitle"
      >
        {/* Modal Head */}
        <div className="bg-gradient-to-br from-[#a90019] to-[#d00020] text-white p-5">
          <div className="inline-flex items-center gap-1.5 bg-white/16 border border-white/25 rounded-full px-2.5 py-1 text-[11px] font-bold mb-3">
            <span>🕌</span>
            <span>Purchase Agreement</span>
          </div>
          <h2 id="agreementTitle" className="m-0 mb-1.5 text-[21px] font-extrabold leading-tight">
            Before you continue
          </h2>
          <p className="m-0 text-[#ffe8eb] text-xs leading-relaxed">
            Please confirm the following before placing your meat order.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          <div className="bg-[#fff7f8] border border-[#ffd5da] rounded-[14px] p-3.5 text-[#333] text-xs leading-relaxed mb-4 font-medium">
            Meat Ghar delivers meat products only to Muslim customers. Please confirm that you are purchasing this product for yourself.
          </div>

          <label 
            className={`flex items-start gap-2.5 cursor-pointer select-none p-3.5 border rounded-[14px] transition-all duration-150 ${
              isChecked ? 'border-[#bd001b] bg-[#fff7f8]' : 'border-[#e1e4e8] bg-white'
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-5 h-5 mt-0.5 accent-[#b9001b] shrink-0 cursor-pointer"
            />
            <div className="text-xs font-bold leading-tight text-slate-900">
              Yes, I Buy This Myself
              <span className="block mt-1 text-[11px] font-medium text-slate-500 leading-normal">
                I confirm that I am a Muslim and I am purchasing this meat for myself.
              </span>
            </div>
          </label>

          <div className="flex gap-2.5 mt-4 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="h-[46px] rounded-[13px] border-0 text-xs font-extrabold cursor-pointer flex-1 bg-[#f0f2f4] text-[#555] hover:bg-[#e4e6e9] active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isChecked}
              onClick={handleContinue}
              className={`h-[46px] rounded-[13px] border-0 text-xs font-extrabold cursor-pointer flex-[1.5] transition-all ${
                isChecked
                  ? 'bg-[#b9001b] text-white hover:bg-[#a00017] active:scale-[0.98] shadow-md shadow-red-900/20'
                  : 'bg-[#e1e3e6] text-[#9da1a6] cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>

          <div className="text-center text-[#9a9da2] text-[10px] mt-3 font-medium">
            You must tick the checkbox to continue.
          </div>
        </div>
      </div>
    </div>
  );
};
