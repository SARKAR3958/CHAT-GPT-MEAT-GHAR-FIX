import React,{useState} from 'react';
import {DataScreen,panelClass,buttonClass} from '../common/DataScreen';
export const ShareScreen:React.FC<{onBack:()=>void;onNavigateTab:(tab:string)=>void;userName?:string;userPhone?:string}>=({onBack})=>{
 const [message,setMessage]=useState('');const url=window.location.origin;
 const share=async()=>{try{if(navigator.share)await navigator.share({title:'Meat Ghar',text:'Fresh meat from Meat Ghar',url});else{await navigator.clipboard.writeText(url);setMessage('Link copied');}}catch(error:any){if(error.name!=='AbortError')setMessage('Unable to share. Copy this link: '+url);}};
 return <DataScreen title="Share Meat Ghar" onBack={onBack}><article className={panelClass}><h2 className="font-bold">Share with Friends</h2><p>Invite friends to discover Meat Ghar.</p><p className="break-all">{url}</p><button className={buttonClass} onClick={()=>void share()}>Share Link</button>{message && <p role="status">{message}</p>}</article></DataScreen>;
};
