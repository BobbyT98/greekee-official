const {test,beforeEach,afterEach}=require('node:test');const assert=require('node:assert/strict');const {randomUUID}=require('node:crypto');
const endpoint=require('../api/orders'),session=require('../api/session');const {sgDate}=require('../lib/orders');
let rows,originalFetch;
function response(value,status=200){return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});}
beforeEach(()=>{rows=[];originalFetch=global.fetch;Object.assign(process.env,{SUPABASE_URL:'https://test-project.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_test_only',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test_only',ORDER_CAPTURE_ENABLED:'true',GREEKEE_ENVIRONMENT:'TEST'});delete process.env.SHEETS_SYNC_URL;delete process.env.SHEETS_SYNC_SECRET;
 global.fetch=async(url,options={})=>{
  const path=new URL(url).pathname,q=new URL(url).searchParams;
  if(path.endsWith('/greekee_rate_limit'))return response(true);
  if(path==='/auth/v1/user'){if(options.headers.Authorization==='Bearer good')return response({id:'11111111-1111-4111-8111-111111111111',email:'staff@example.com'});return response({message:'invalid'},401);}
  if(path==='/rest/v1/greekee_staff')return response([{user_id:'11111111-1111-4111-8111-111111111111',display_name:'Test',active:true,locations:['Punggol']}]);
  if(path==='/auth/v1/token'){const b=JSON.parse(options.body);assert.equal(b.password,' password with spaces ');return response({access_token:'good',refresh_token:'refresh',expires_in:3600});}
  if(path==='/rest/v1/greekee_orders'){
   if(options.method==='POST'){const data=JSON.parse(options.body);if(rows.some(r=>r.request_key===data.request_key))return response({code:'23505',message:'duplicate'},409);const saved={...data,id:randomUUID(),order_number:'GK-TEST',revision:1,order_status:'pending',payment_status:'unpaid'};rows.push(saved);return response([saved]);}
   if(q.has('request_key'))return response(rows.filter(r=>'eq.'+r.request_key===q.get('request_key')));
   return response(rows);
  }
  if(path==='/rest/v1/greekee_order_events')return response([]);
  throw Error('Unexpected test fetch '+path);
 };
});
afterEach(()=>{global.fetch=originalFetch;});
async function call(handler,method,b,headers={},url='/api/orders'){let result;const res={headers:{},setHeader(k,v){this.headers[k]=v;},end(s){result={status:this.statusCode,headers:this.headers,body:JSON.parse(s)};}};await handler({method,url,body:b,headers:{host:'greekee.test',origin:'https://greekee.test','content-type':'application/json',...headers},socket:{remoteAddress:'127.0.0.1'}},res);return result;}
function order(){const due=sgDate(new Date(Date.now()+86400000));return {request_key:randomUUID(),customer_name:'API test',phone:'91234567',fulfillment:'pickup',location:'Punggol',fulfillment_date:due,pickup_slot:due+'T14:00:00+08:00',items:[{product_id:'berry-bliss',quantity:1,addons:[]}]};}
test('public reads and manual-order impersonation require staff login',async()=>{assert.equal((await call(endpoint,'GET',null)).status,401);assert.equal((await call(endpoint,'POST',{...order(),manual:true})).status,401);});
test('partners can read both queues, but a different location cannot edit',async()=>{
 const created=await call(endpoint,'POST',order());assert.equal(created.status,201);rows[0].location='Hougang';
 const cookie={cookie:'gk_access=good'};
 const all=await call(endpoint,'GET',null,cookie);assert.equal(all.status,200);assert.equal(all.body.orders[0].location,'Hougang');
 const filtered=await call(endpoint,'GET',null,cookie,'/api/orders?location=Hougang');assert.equal(filtered.status,200);
 const detail=await call(endpoint,'GET',null,cookie,'/api/orders?id='+rows[0].id);assert.equal(detail.status,200);
 const denied=await call(endpoint,'PATCH',{id:rows[0].id,revision:1,notes:'wrong person'},cookie);assert.equal(denied.status,404);
 assert.equal(rows[0].notes,'');
 assert.equal((await call(endpoint,'GET',null,cookie,'/api/orders?location=Invalid')).status,400);
});
test('cross-origin requests are rejected before saving',async()=>{assert.equal((await call(endpoint,'POST',order(),{origin:'https://attacker.test'})).status,403);assert.equal(rows.length,0);});
test('two concurrent identical submissions create exactly one order',async()=>{const body=order();const results=await Promise.all([call(endpoint,'POST',body),call(endpoint,'POST',body)]);assert(results.every(r=>r.status<300));assert.equal(rows.length,1);assert.equal(results[0].body.order_number,results[1].body.order_number);assert.equal(results[0].body.total_cents,890);assert(!('customer_name' in results[0].body));assert(!JSON.stringify(results).includes('sb_secret'));});
test('reusing the idempotency key with changed contents is rejected',async()=>{const body=order();await call(endpoint,'POST',body);const r=await call(endpoint,'POST',{...body,customer_name:'Changed'});assert.equal(r.status,409);assert.equal(rows.length,1);});
test('capture disabled and invalid bodies fail without an order',async()=>{process.env.ORDER_CAPTURE_ENABLED='false';assert.equal((await call(endpoint,'POST',order())).status,503);process.env.ORDER_CAPTURE_ENABLED='true';assert.equal((await call(endpoint,'POST','{bad')).status,400);assert.equal(rows.length,0);});
test('password whitespace is preserved; access tokens stay in HttpOnly cookies',async()=>{const r=await call(session,'POST',{action:'login',email:'staff@example.com',password:' password with spaces '});assert.equal(r.status,200);assert(r.headers['Set-Cookie'].every(x=>x.includes('HttpOnly')&&x.includes('SameSite=Strict')));assert(!JSON.stringify(r.body).includes('refresh_token'));});
test('Sheets failure leaves saved order intact and reports pending',async()=>{process.env.SHEETS_SYNC_URL='https://script.google.com/macros/s/test/exec';process.env.SHEETS_SYNC_SECRET='test-only-secret-12345678901234567890';const currentFetch=global.fetch;global.fetch=async(url,opt)=>{if(String(url).startsWith('https://script.google.com'))throw Error('offline');return currentFetch(url,opt);};const r=await call(endpoint,'POST',order());assert.equal(r.status,201);assert.equal(rows.length,1);assert.equal(r.body.sync.state,'pending');});
