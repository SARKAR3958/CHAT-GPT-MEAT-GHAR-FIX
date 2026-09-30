import React from 'react';
import {LocationData} from '../../types/location';
import {useRows,addressText} from '../../lib/useData';
import {panelClass,buttonClass} from './DataScreen';
export const AREA_OPTIONS=['Boko','Dhupdhara'];
export interface LocationSelectModalProps {isOpen:boolean;onClose:()=>void;currentLocation:LocationData;onSelectLocation:(loc:LocationData)=>void;onAddAddress?:()=>void;}
export const LocationSelectModal:React.FC<LocationSelectModalProps>=({isOpen,onClose,currentLocation,onSelectLocation,onAddAddress})=>{
 const {rows,loading,error}=useRows('addresses',true);if(!isOpen)return null;
 return <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-3"><section role="dialog" aria-modal="true" aria-label="Select delivery address" className="bg-slate-50 rounded-2xl max-w-lg w-full max-h-[85dvh] overflow-y-auto p-4 space-y-3"><div className="flex justify-between"><h2 className="font-bold">Select Delivery Address</h2><button aria-label="Close" onClick={onClose}>×</button></div>{loading && <p>Loading…</p>}{error && <p role="alert">{error}</p>}{rows.map(a=><button key={a.id} className={panelClass+' w-full text-left'} onClick={()=>{localStorage.setItem('meatghar_selected_address_id',a.id);onSelectLocation({...currentLocation,address:addressText(a),road:a.street_road,suburb:a.locality,city:a.city});onClose();}}><strong>{a.type} · {a.full_name}</strong><p>{addressText(a)}</p></button>)}{!loading && !rows.length && <p>No saved addresses. Sign in and add your delivery address.</p>}{onAddAddress && <button className={buttonClass+' w-full'} onClick={()=>{onClose();onAddAddress();}}>Add New Address</button>}</section></div>;
};
