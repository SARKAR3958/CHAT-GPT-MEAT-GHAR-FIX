import { useState,useEffect,useCallback } from 'react';
import {supabase} from './supabase';
export function useRows(table:string, owned=false) {
 const [rows,setRows]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 const reload=useCallback(async()=>{setLoading(true);setError('');try {
  let query=supabase.from(table).select('*');
  if(owned) {const {data:{user},error}=await supabase.auth.getUser();if(error || !user)throw new Error('Please sign in to continue.');query=query.eq('user_id',user.id);}
  const {data,error}=await query;if(error)throw error;setRows((data || []).sort((a,b)=>(b.created_at || '').localeCompare(a.created_at || '')));
 }catch(error:any){setRows([]);setError(error.message);}finally{setLoading(false);}},[table,owned]);
 useEffect(()=>{void reload();const interval=setInterval(()=>void reload(),15000);const channel=supabase.channel(`${table}-${owned}-${crypto.randomUUID()}`).on('postgres_changes',{event:'*',schema:'public',table},()=>void reload()).subscribe();return()=>{clearInterval(interval);void supabase.removeChannel(channel);};},[reload,table,owned]);
 return {rows,loading,error,reload};
}
export function useOrder(id:string) {const data=useRows('orders',true);return {...data,order:data.rows.find(o=>o.id===id)};}
export function addressText(a:any){return [a.house_flat,a.street_road,a.locality,a.city].filter(Boolean).join(', ');}
