import React,{useState} from 'react';
import {supabase} from '../../../lib/supabase';
import {useAdmin} from '../AdminContext';
import {AdminHeader} from '../components/AdminHeader';
import {panelClass,buttonClass} from '../../common/DataScreen';
export const PushNotificationsScreen:React.FC=()=>{
 const {showToast}=useAdmin();const [title,setTitle]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const [push,setPush]=useState(false);
 const send=async(e:React.FormEvent)=>{e.preventDefault();if(busy)return;setBusy(true);try {
  if(push){const {data,error}=await supabase.functions.invoke('send-push',{body:{title:title.trim(),message:message.trim()}});if(error)throw error;if(!data?.ok)throw new Error(data?.error || 'Push provider did not confirm delivery request');}
  else{const {error}=await supabase.from('notifications').insert({title:title.trim(),body:message.trim()});if(error)throw error;}
  showToast(push ? 'Push request accepted by provider' : 'In-app notification published');setTitle('');setMessage('');
 }catch(error:any){showToast('Notification failed: '+error.message);}finally{setBusy(false);}};
 return <div className="h-full flex flex-col bg-slate-50"><AdminHeader title="Notifications" showBack/><main className="flex-1 min-h-0 overflow-y-auto p-4"><form className={panelClass} onSubmit={send}><label className="block">Title<input required maxLength={150} value={title} onChange={e=>setTitle(e.target.value)} className="border rounded-xl p-3 w-full"/></label><label className="block">Message<textarea required maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)} className="border rounded-xl p-3 w-full"/></label><label className="block"><input type="checkbox" checked={push} onChange={e=>setPush(e.target.checked)}/> Send device push</label><p className="text-xs text-slate-500">Device push requires the provided server function and OneSignal account setup. Without device push, this publishes to the app notification inbox.</p><button disabled={busy} className={buttonClass}>Send Notification</button></form></main></div>;
};
