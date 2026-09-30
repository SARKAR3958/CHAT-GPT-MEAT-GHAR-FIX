import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { HeaderMeatGharLogo } from '../MeatGharLogo';
export function DataScreen({title,onBack,children,error,loading}:{title:string;onBack:()=>void;children:React.ReactNode;error?:string;loading?:boolean}) {
 return <div className="w-full h-full bg-slate-50 text-slate-800 flex flex-col overflow-hidden"><header className="shrink-0 bg-white p-4 border-b border-slate-200 flex items-center justify-between"><div className="flex items-center gap-2"><button aria-label="Back" onClick={onBack} className="p-2 text-[#BA181B]"><ArrowLeft size={20}/></button><h1 className="font-extrabold text-lg">{title}</h1></div><HeaderMeatGharLogo/></header><main className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">{loading && <p role="status">Loading…</p>}{error && <p role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">{error}</p>}{children}</main></div>;
}
export const panelClass='bg-white rounded-2xl border border-slate-200 p-4 space-y-2';
export const buttonClass='bg-[#BA181B] text-white rounded-xl px-4 py-3 font-bold text-sm disabled:opacity-50';
