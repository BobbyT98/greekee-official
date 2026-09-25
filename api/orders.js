const {createHash}=require('node:crypto');
const {handler,send,origin,body,supa,requireStaff,limit}=require('../lib/backend');
const {assert,text,oneOf,date,validateOrder,whatsapp,AppError}=require('../lib/orders');
const {syncOne}=require('../lib/sheets');
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const publicReply=o=>({order_number:o.order_number,total_cents:o.total_cents,whatsapp_url:whatsapp(o)});
module.exports=handler(async(req,res)=>{
 if(req.method==='GET'){
  const staff=await requireStaff(req);const q=new URL(req.url,'https://local').searchParams;
  if(q.has('id')){assert(uuid(q.get('id')),'Invalid order.');const orders=await supa('/rest/v1/greekee_orders?id=eq.'+q.get('id')+'&select=*');assert(orders.length&&staff.locations.includes(orders[0].location),'Order not found.',404);const events=await supa('/rest/v1/greekee_order_events?order_id=eq.'+q.get('id')+'&select=actor_name,changed_at,changes&order=changed_at.desc&limit=50');return send(res,200,{order:orders[0],events});}
  let filter=`location=in.(${staff.locations.join(',')})`;
  if(q.get('location')){assert(staff.locations.includes(q.get('location')),'Location unavailable.',403);filter='location=eq.'+q.get('location');}
  for(const key of ['from','to'])if(q.get(key))filter+='&fulfillment_date='+(key==='from'?'gte.':'lte.')+date(q.get(key),'date filter');
  const offset=Number(q.get('offset')||0);assert(Number.isInteger(offset)&&offset>=0&&offset<=100000,'Invalid page.');
  const rows=await supa(`/rest/v1/greekee_orders?${filter}&select=*&order=created_at.desc,id.desc&limit=101&offset=${offset}`);
  return send(res,200,{orders:rows.slice(0,100),has_more:rows.length>100});
 }
 assert(['POST','PATCH'].includes(req.method),'Method not allowed.',405);origin(req);const b=body(req);
 if(req.method==='POST'){
  const manual=b.manual===true;let staff=null;
  if(manual)staff=await requireStaff(req);else assert(process.env.ORDER_CAPTURE_ENABLED==='true','Online order saving is not enabled yet. Please use WhatsApp.',503);
  assert(!b.website,'Invalid submission.');assert(uuid(b.request_key),'Please refresh and submit again.');
  await limit(req,manual?'manual':'checkout',manual?100:20,900);
  const input={...b};delete input.request_key;delete input.website;
  const hash=createHash('sha256').update(JSON.stringify({input,actor:staff?.user_id||null})).digest('hex');
  let existing=await supa('/rest/v1/greekee_orders?request_key=eq.'+b.request_key+'&select=*');
  if(existing.length){assert(existing[0].request_hash===hash,'This order changed. Please start a new submission.',409);return send(res,200,{...publicReply(existing[0]),sync:await syncOne(existing[0])});}
  const order=validateOrder(b,{manual});if(staff)assert(staff.locations.includes(order.location),'Location unavailable.',403);
  const record={...order,request_key:b.request_key,request_hash:hash,created_by:staff?.user_id||null};
  let saved;
  try{[saved]=await supa('/rest/v1/greekee_orders',{method:'POST',headers:{Prefer:'return=representation'},body:record});}
  catch(e){if(e.code!=='23505')throw e;existing=await supa('/rest/v1/greekee_orders?request_key=eq.'+b.request_key+'&select=*');assert(existing.length&&existing[0].request_hash===hash,'Please retry this order.',409);saved=existing[0];}
  const sync=await syncOne(saved);return send(res,201,{...publicReply(saved),sync});
 }
 const staff=await requireStaff(req);assert(uuid(b.id)&&Number.isInteger(b.revision),'Invalid order.');const p={};
 if(b.order_status!==undefined)p.order_status=oneOf(b.order_status,['pending','confirmed','preparing','ready','completed','cancelled'],'order status');
 if(b.payment_status!==undefined){p.payment_status=oneOf(b.payment_status,['unpaid','paid','refunded'],'payment status');assert(b.payment_verified===true,'Check the bank payment or refund before updating this status.');}
 for(const [k,max] of [['notes',1500],['customer_name',100],['phone',30],['address',400]])if(b[k]!==undefined)p[k]=text(b[k],max,k,['customer_name','phone'].includes(k));
 if(b.fulfillment_date!==undefined)p.fulfillment_date=date(b.fulfillment_date,'collection date');
 if(b.pickup_slot!==undefined){assert(b.pickup_slot===null||!isNaN(Date.parse(b.pickup_slot)),'Invalid pickup time.');p.pickup_slot=b.pickup_slot;}
 assert(Object.keys(p).length,'No changes supplied.');
 const [current]=await supa('/rest/v1/greekee_orders?id=eq.'+b.id+'&select=*');assert(current&&staff.locations.includes(current.location),'Order not found.',404);
 const nextDate=p.fulfillment_date||current.fulfillment_date;const nextSlot=Object.hasOwn(p,'pickup_slot')?p.pickup_slot:current.pickup_slot;
 if(current.fulfillment==='pickup'&&nextSlot){const {sgDate}=require('../lib/orders');assert(sgDate(new Date(nextSlot))===nextDate,'Pickup date and time must match.');}
 let saved;try{saved=await supa('/rest/v1/rpc/greekee_update_order',{method:'POST',body:{p_id:b.id,p_revision:b.revision,p_actor:staff.user_id,p_patch:p}});}catch(e){if(e.detail==='revision_conflict')throw new AppError(409,'Someone updated this order. Reload it before saving.');if(e.detail==='refund_requires_paid')throw new AppError(400,'Only paid orders can be marked refunded.');if(e.detail==='not_authorized')throw new AppError(403,'Order unavailable.');throw e;}
 return send(res,200,{order:saved,sync:await syncOne(saved)});
});
