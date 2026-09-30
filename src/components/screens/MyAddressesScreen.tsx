import React,{useState} from 'react';
import {supabase} from '../../lib/supabase';
import {useRows,addressText} from '../../lib/useData';
import {DataScreen,panelClass,buttonClass} from '../common/DataScreen';
export const MyAddressesScreen:React.FC<{onBack:()=>void;onAddNewAddress:()=>void;onNavigateTab:(tab:string)=>void}> = ({onBack,onAddNewAddress})=>{
 const {rows,loading,error,reload}=useRows('addresses',true);const [actionError,setActionError]=useState('');
 const remove=async(id:string)=>{if(!confirm('Delete this address?'))return;const {error}=await supabase.from('addresses').delete().eq('id',id).select().single();if(error)setActionError(error.message);else {if(localStorage.getItem('meatghar_selected_address_id')===id)localStorage.removeItem('meatghar_selected_address_id');await reload();}};
 return <DataScreen title="My Addresses" onBack={onBack} loading={loading} error={error || actionError}>{rows.map(a=><article key={a.id} className={panelClass}><h2 className="font-bold">{a.type} · {a.full_name}</h2><p>{addressText(a)}</p><p>{a.phone}</p><button className="text-red-700 text-sm font-bold" onClick={()=>void remove(a.id)}>Delete</button></article>)}{!loading && !rows.length && !error && <p>No saved addresses yet.</p>}<button className={buttonClass} onClick={onAddNewAddress}>Add New Address</button></DataScreen>;
};
