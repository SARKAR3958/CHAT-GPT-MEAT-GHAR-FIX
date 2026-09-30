import React from 'react';
import {useRows} from '../../lib/useData';
import {DataScreen,panelClass} from '../common/DataScreen';
export const NotificationsScreen:React.FC<{onBack:()=>void;onNavigateTab:(tab:string)=>void}>=({onBack})=>{const {rows,loading,error}=useRows('notifications');return <DataScreen title="Notifications" onBack={onBack} loading={loading} error={error}>{rows.map(n=><article key={n.id} className={panelClass}><h2 className="font-bold">{n.title}</h2><p>{n.body}</p><p className="text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</p></article>)}{!loading && !error && !rows.length && <p>No notifications yet.</p>}</DataScreen>;};
