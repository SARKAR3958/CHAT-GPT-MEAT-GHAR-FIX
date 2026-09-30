import React,{useState,useEffect} from 'react';
import {useRows,addressText} from '../../lib/useData';
import {DataScreen,panelClass,buttonClass} from '../common/DataScreen';
export const DeliveryAddressScreen:React.FC<{onBack:()=>void;onContinueToCheckout:()=>void;onAddNewAddress:()=>void;onNavigateTab:(tab:string)=>void}> = ({onBack,onContinueToCheckout,onAddNewAddress})=>{
 const {rows,loading,error}=useRows('addresses',true);const [selected,setSelected]=useState(localStorage.getItem('meatghar_selected_address_id') || '');
 useEffect(()=>{if(rows.length && !rows.some(a=>a.id===selected))setSelected(rows[0].id);},[rows,selected]);
 return <DataScreen title="Delivery Address" onBack={onBack} loading={loading} error={error}>{rows.map(a=><label key={a.id} className={panelClass+' block cursor-pointer'}><input type="radio" name="address" checked={selected===a.id} onChange={()=>setSelected(a.id)}/> <strong>{a.type} · {a.full_name}</strong><p>{addressText(a)}</p><p>{a.phone}</p></label>)}{!loading && !rows.length && <p>Add a delivery address to continue.</p>}<button className="text-red-700 font-bold" onClick={onAddNewAddress}>Add New Address</button><button className={buttonClass+' w-full'} disabled={!rows.some(a=>a.id===selected)} onClick={()=>{localStorage.setItem('meatghar_selected_address_id',selected);onContinueToCheckout();}}>Continue to Checkout</button></DataScreen>;
};
