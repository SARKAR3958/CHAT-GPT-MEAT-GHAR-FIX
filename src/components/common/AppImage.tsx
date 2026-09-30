import React,{useState,useEffect} from 'react';
import {getImageUrl} from '../../utils/imageAssets';
interface AppImageProps extends React.ImgHTMLAttributes<HTMLImageElement>{src:string;fallbackSrc?:string;}
export const AppImage:React.FC<AppImageProps>=({src,alt='Meat Ghar',fallbackSrc='/images/product-placeholder.svg',...props})=>{
 const [url,setUrl]=useState(getImageUrl(src) || fallbackSrc);
 useEffect(()=>setUrl(getImageUrl(src) || fallbackSrc),[src,fallbackSrc]);
 return <img {...props} src={url} alt={alt} decoding="async" onError={()=>{if(url!==fallbackSrc)setUrl(fallbackSrc);}}/>;
};
export default AppImage;
