// Controlled API fixtures are confined to this test; production always uses Supabase.
import {firefox} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const user={id:'11111111-1111-4111-8111-111111111111',email:'test@example.com',role:'authenticated',aud:'authenticated',app_metadata:{provider:'email'},user_metadata:{full_name:'Test Customer',phone:'911234567890'},created_at:new Date().toISOString()};
const jwt=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:user.id,role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.test-signature';
const session={access_token:jwt,refresh_token:'test-refresh',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user};
const product={id:'test-meat',name:'Test Mutton',category:'Mutton',category_id:'cat-test',price:200,original_price:250,weight:'500g',unit_kg:0.5,stock_quantity:20,in_stock:true,image:'/images/cat_mutton_1790504374485.jpg',description:'Test product description',rating:0,rating_count:0,sales_count:0,created_at:new Date().toISOString()};
const address={id:'test-address',user_id:user.id,full_name:'Test Customer',phone:'911234567890',house_flat:'1',street_road:'Main Road',locality:'Boko',city:'Guwahati',type:'Home',created_at:new Date().toISOString()};
await mkdir('tests/output',{recursive:true});
const browser=await firefox.launch({headless:true});let passed=0;
async function context({signedIn=true,admin=false,width=360}={}){
 const ctx=await browser.newContext({viewport:{width,height:800}});const errors=[];const calls=[];let failOrder=true;let createdOrder=null;
 await ctx.addInitScript(({session,signedIn})=>{if(signedIn)localStorage.setItem('sb-test-meatghar-auth-token',JSON.stringify(session));localStorage.setItem('meatghar_admin_logged','true');localStorage.setItem('meatghar_wallet_balance','999999');},{session,signedIn});
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.routeWebSocket(/.*/,ws=>ws.close());
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.origin===new URL(base).origin)return route.continue();
  if(url.hostname!=='test-meatghar.supabase.co')return route.abort();
  calls.push({path:url.pathname,method:route.request().method(),body:route.request().postData()});
  const respond=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body),headers:{'Access-Control-Allow-Origin':'*'}});
  if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'*'}});
  if(url.pathname==='/auth/v1/user')return signedIn?respond(user):respond({message:'Unauthorized'},401);
  if(url.pathname==='/auth/v1/token')return respond({error:'invalid_grant',error_description:'Invalid login credentials'},400);
  if(url.pathname==='/auth/v1/logout')return respond({});
  const name=url.pathname.split('/').at(-1);const singular=(route.request().headers().accept || '').includes('vnd.pgrst.object');
  if(name==='is_admin')return respond(admin);
  if(name==='place_order'){if(failOrder)return respond({code:'P0001',message:'Test server rejected order'},400);const body=JSON.parse(route.request().postData());createdOrder={id:'MTG-test-order',user_id:user.id,items:[{productId:product.id,name:product.name,price:100,quantity:1,unit:'0.25 KG',image:product.image}],subtotal:100,delivery_fee:40,taxes:5,total_amount:145,payment_method:'COD',payment_status:'Pending',status:'Pending',delivery_address:{address:'1, Main Road, Boko, Guwahati'},created_at:new Date().toISOString(),status_history:[{status:'Pending',at:new Date().toISOString()}]};assert.equal(body.p_expected_total,145);assert.equal(body.p_items[0].productId,product.id);return respond(createdOrder);}
  if(name==='coupon_discount')return respond({message:'Invalid coupon'},400);
  const tables={products:[product],categories:[{id:'cat-test',name:'Mutton',is_active:true,image:product.image}],profiles:[{id:user.id,phone:'911234567890',email:user.email,full_name:'Test Customer',is_blocked:false,created_at:new Date().toISOString()}],addresses:[address],store_settings:[{id:true,delivery_fee:40,free_delivery_threshold:500,tax_percent:5,is_open:true}],orders:createdOrder?[createdOrder]:[],user_wallets:[],wallet_transactions:[],banners:[],flash_deals:[],offers:[],support_tickets:[],notifications:[],reviews:[]};
  const rows=tables[name] || [];
  if(route.request().method()==='HEAD')return route.fulfill({status:200,headers:{'Content-Range':'0-0/1'}});
  return respond(singular ? rows[0] || null : rows);
 });
 return {ctx,page,errors,calls,allowOrder:()=>{failOrder=false;}};
}
const pass=name=>{passed++;console.log('PASS '+name);};
try{
 for(const width of [320,360,768,1440]){
  const t=await context({width});await t.page.goto(base);await t.page.mouse.click(Math.min(width,512)/2,350);await t.page.getByText('Popular Today',{exact:true}).waitFor();
  assert.equal(await t.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(t.errors,[]);
  await t.page.waitForTimeout(300);
  assert.equal(await t.page.getByAltText('Meat Ghar Logo').first().evaluate(img=>img.complete && img.naturalWidth>0),true);
  if(width===360)await t.page.screenshot({path:'tests/output/customer-home.png',fullPage:true});
  pass('customer home fits viewport '+width);await t.ctx.close();
 }
 const t=await context();await t.page.goto(base);await t.page.mouse.click(180,350);await t.page.getByText('Popular Today',{exact:true}).waitFor();await t.page.getByText('Test Mutton',{exact:true}).first().click();await t.page.getByRole('heading',{name:'Test Mutton'}).waitFor();assert.equal(await t.page.getByRole('heading',{name:'Fresh Chicken Curry Cut'}).count(),0);pass('selected product uses its actual identity');await t.page.waitForTimeout(300);await t.page.screenshot({path:'tests/output/product-details.png',fullPage:true});
 await t.page.getByRole('button',{name:/ADD TO CART/i}).click();await t.page.getByRole('checkbox').check();await t.page.getByRole('button',{name:/continue/i}).click();await t.page.getByRole('heading',{name:'Your Cart'}).waitFor();await t.page.getByRole('button',{name:'Proceed to Checkout'}).click();await t.page.getByRole('button',{name:'Continue to Checkout'}).click();await t.page.getByText('Pay & Place Order',{exact:false}).waitFor();await t.page.getByText('Pay & Place Order',{exact:false}).click();await t.page.getByText('Test server rejected order',{exact:true}).waitFor();assert.equal(await t.page.getByText('Order Placed',{exact:true}).count(),0);assert.equal(await t.page.evaluate(()=>JSON.parse(localStorage.getItem('meatghar_cart_items')).length),1);pass('failed checkout preserves cart and shows no success');
 t.allowOrder();await t.page.getByText('Pay & Place Order',{exact:false}).click();await t.page.getByRole('heading',{name:'Order Placed'}).waitFor();assert.equal(await t.page.evaluate(()=>JSON.parse(localStorage.getItem('meatghar_cart_items')).length),0);pass('confirmed checkout clears cart only after database success');assert.deepEqual(t.errors,[]);await t.ctx.close();
 const blocked=await context({signedIn:false});await blocked.page.goto(base+'/admin');await blocked.page.getByText('Login to your admin account',{exact:true}).waitFor();assert.equal(await blocked.page.getByText('Sales Overview',{exact:true}).count(),0);pass('forged local admin flag cannot bypass authentication');assert.deepEqual(blocked.errors,[]);await blocked.ctx.close();
 const admin=await context({admin:true});await admin.page.goto(base+'/admin');const go=admin.page.getByRole('button',{name:'Go to Dashboard'});await go.waitFor();await go.click();await admin.page.getByText('Sales Overview',{exact:true}).waitFor();assert.equal(await admin.page.getByText('1,248',{exact:true}).count(),0);await admin.page.screenshot({path:'tests/output/admin-dashboard.png',fullPage:true});assert.deepEqual(admin.errors,[]);pass('admin dashboard renders real computed metrics');await admin.ctx.close();
 console.log(`\n${passed} browser checks passed using controlled local API fixtures.`);
}finally{await browser.close();}
