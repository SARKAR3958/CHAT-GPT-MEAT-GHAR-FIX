// Deploy separately after configuring server-side secrets. Never expose the REST key in Vite.
import {createClient} from 'npm:@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':Deno.env.get('APP_ORIGIN') || '', 'Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
Deno.serve(async(request)=>{
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
 if(request.method==='OPTIONS')return new Response('ok',{headers:cors});
 if(request.method!=='POST')return reply({error:'Method not allowed'},405);
 const origin=request.headers.get('Origin');if(origin && origin!==Deno.env.get('APP_ORIGIN'))return reply({error:'Origin not allowed'},403);
 try{
  const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:request.headers.get('Authorization') || ''}}});
  const {data:{user},error}=await client.auth.getUser();if(error || !user)return reply({error:'Sign-in required'},401);
  const {data:admin,error:roleError}=await client.rpc('is_admin');if(roleError || !admin)return reply({error:'Administrator required'},403);
  const {title,message}=await request.json();if(typeof title!=='string'||typeof message!=='string'||!title.trim()||!message.trim()||title.length>150||message.length>2000)return reply({error:'Invalid title or message'},400);
  const appId=Deno.env.get('ONESIGNAL_APP_ID'),key=Deno.env.get('ONESIGNAL_REST_API_KEY');if(!appId || !key)return reply({error:'Push provider is not configured'},503);
  const response=await fetch('https://api.onesignal.com/notifications',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Key ${key}`},body:JSON.stringify({app_id:appId,included_segments:['Subscribed Users'],headings:{en:title.trim()},contents:{en:message.trim()},target_channel:'push'})});
  const data=await response.json();if(!response.ok||!data.id)return reply({error:'Push provider rejected the request'},502);
  return reply({ok:true,id:data.id});
 }catch{return reply({error:'Unable to send notification'},500);}
});
