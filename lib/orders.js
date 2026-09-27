'use strict';
const catalog = require('../assets/catalog');
const { randomUUID } = require('node:crypto');
const { parsePhoneNumberFromString } = require('libphonenumber-js/max');
class AppError extends Error { constructor(status,message) {super(message);this.status=status;} }
function assert(ok,message,status=400){if(!ok)throw new AppError(status,message);}
function text(v,max,label,required=false){assert(typeof v==='string' || (!required && v==null),`Please check ${label}.`);const s=(v||'').trim();assert(s.length<=max && (!required||s.length>0),`Please check ${label}.`);return s;}
function oneOf(v,values,label){assert(values.includes(v),`Please check ${label}.`);return v;}
function integer(v,min,max,label){assert(Number.isInteger(v)&&v>=min&&v<=max,`Please check ${label}.`);return v;}
function phoneNumber(v){
 const raw=text(v,30,'phone number',true);
 const parsed=/^\+/.test(raw)?parsePhoneNumberFromString(raw):parsePhoneNumberFromString(raw,'SG');
 assert(parsed?.isValid(),'Please check the phone number and country code.');
 return parsed.number;
}
function sgDate(d=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
function earliestDeliveryDate(now=new Date()){
 const cutoff=now.getTime()+24*60*60000;
 const day=sgDate(new Date(cutoff));
 const start=new Date(day+'T00:00:00+08:00');
 return start.getTime()>=cutoff?day:sgDate(new Date(start.getTime()+86400000));
}
function date(v,label){assert(typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,`Please check ${label}.`);return v;}
const money=c=>'$'+(c/100).toFixed(2);
function priceItems(input,{manual=false}={}) {
 assert(Array.isArray(input)&&input.length>=1&&input.length<=40,'Choose between 1 and 40 different bowl combinations.');
 const items=input.map(item=>{
  const product=manual&&item.product_id==='special-order'?{id:'special-order',name:text(item.custom_name,100,'special order name',true),sheetName:'Special Order',cents:integer(item.custom_unit_cents,0,100000,'agreed unit price'),kind:'special'}:catalog.products.find(p=>p.id===item.product_id);assert(product,'A selected bowl is no longer on the menu. Please refresh.');
  const qty=integer(item.quantity,1,100,'quantity');
  assert(Array.isArray(item.addons)&&item.addons.length<=catalog.toppings.length,'Please check the toppings.');
  const seen=new Set();
  const addons=item.addons.map(a=>{const name=text(a.name,80,'add-on name',true);assert((manual||catalog.toppings.includes(name))&&!seen.has(name),'Please check the toppings.');seen.add(name);return {name,quantity:integer(a.quantity,1,20,'topping quantity'),unit_cents:manual?integer(a.unit_cents??catalog.toppingCents,0,10000,'add-on price'):catalog.toppingCents};});
  const count=addons.reduce((n,a)=>n+a.quantity,0);assert(count<=30,'Maximum 30 toppings per bowl.');
  if(!manual&&product.kind==='custom')assert(count>=catalog.minCustomToppings,'Custom bowls need at least 3 toppings.');
  if(product.kind==='yogurt') {assert(!count,'Yogurt-only servings cannot include toppings.');if(!manual)assert(qty>=catalog.minYogurtQty,'Yogurt-only orders need at least 2 servings per flavour.');}
  const unit=product.cents+addons.reduce((n,a)=>n+a.quantity*a.unit_cents,0);
  return {id:randomUUID(),product_id:product.id,name:product.kind==='custom'?'Build Your Own — '+product.name:product.name,sheet_name:product.sheetName,quantity:qty,addons,unit_cents:unit,line_cents:unit*qty};
 });
 assert(items.reduce((n,i)=>n+i.quantity,0)<=200,'For more than 200 bowls, please contact us on WhatsApp.');
 return items;
}
function validateOrder(body,{manual=false,now=new Date()}={}){
 const items=priceItems(body.items,{manual});const subtotal=items.reduce((n,i)=>n+i.line_cents,0);
 const fulfillment=oneOf(body.fulfillment,['pickup','delivery'],'collection method');
 let location,region='',area='',fee=0;
 if(fulfillment==='pickup')location=oneOf(body.location,['Punggol','Hougang'],'pickup location');
 else {
  region=oneOf(body.delivery_region,['East','North','South','West'],'delivery region');
  if(region==='East') {const target=catalog.east.find(e=>e[0]===body.delivery_area);assert(target,'Please choose a delivery area.');[area,fee,location]=target;if(subtotal>=catalog.eastFreeCents)fee=0;}
  else {location='Punggol';fee=subtotal>=catalog.otherFreeCents?0:catalog.otherDeliveryCents;}
  // Delivery ownership follows the customer's area, including manual orders.
 }
 const orderDate=manual?date(body.order_date,'order date'):sgDate(now);
 const due=date(body.fulfillment_date,'collection / delivery date');
 let slot=text(body.pickup_slot,40,'pickup time');
 if(!manual){
  const today=sgDate(now);const max=sgDate(new Date(now.getTime()+6*86400000));
  assert(due>today,'Orders need at least 24 hours of notice. Please choose a later date.');
  if(fulfillment==='pickup'){
   assert(due<=max,'Pickup is available up to 6 days ahead.');
   const instant=new Date(slot);assert(!isNaN(instant)&&sgDate(instant)===due,'Please select a valid pickup time.');
   const clock=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Singapore',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(instant);
   assert(/^(1[0-9]|2[01]):(00|30):00$|^22:00:00$/.test(clock),'Pickup times are 10 AM to 10 PM, every 30 minutes.');
   assert(instant.getTime()>=now.getTime()+24*60*60000,'Please choose a pickup slot at least 24 hours from now.');slot=instant.toISOString();
  } else {
   slot='';assert(due<=sgDate(new Date(now.getTime()+90*86400000)),'Delivery can be requested up to 90 days ahead.');
   assert(due>=earliestDeliveryDate(now),'Delivery needs at least 24 hours of notice. Please choose a later date.');
   if(region!=='East')assert(due>today&&[0,6].includes(new Date(due+'T00:00:00Z').getUTCDay()),'North / South / West delivery needs a future weekend date.');
  }
 }
 // Manual orders may include an agreed discount or delivery fee. Record the reason.
 const discount=manual?integer(body.discount_cents??0,0,subtotal,'discount'):0;
 if(manual&&fulfillment==='delivery'&&body.delivery_fee_cents!=null)fee=integer(body.delivery_fee_cents,0,20000,'delivery fee');
 const adjustment=text(body.adjustment_reason,300,'price adjustment reason');
 if(discount)assert(adjustment,'Add a reason for the discount.');
 const phone=phoneNumber(body.phone);
 const address=text(body.address,400,'delivery address',fulfillment==='delivery');
 return {customer_name:text(body.customer_name,100,'customer name',true),phone,location,fulfillment,delivery_region:region,delivery_area:area,address:fulfillment==='delivery'?address:'',order_date:orderDate,fulfillment_date:due,pickup_slot:slot||null,source:manual?oneOf(body.source,['WhatsApp','Instagram','Telegram','Lemon8','Other'],'sales platform'):'Website',point_of_contact:manual?text(body.point_of_contact,100,'point of contact'):location==='Punggol'?'Fiona':'Caleb',notes:text(body.notes,1500,'notes'),items,subtotal_cents:subtotal,discount_cents:discount,adjustment_reason:adjustment,delivery_fee_cents:fee,total_cents:subtotal-discount+fee};
}
function whatsapp(order){
 const rows=order.items.map(i=>`${i.quantity} x ${i.name}${i.addons.length?' ('+i.addons.map(a=>a.name+' x'+a.quantity).join(', ')+')':''} — ${money(i.line_cents)}`);
 const msg=[`Hi Greekee! My order is ${order.order_number}.`,...rows,'',`Total: ${money(order.total_cents)}`,`Name: ${order.customer_name}`,`Phone: ${order.phone}`,`Method: ${order.fulfillment}`,`Handling location: ${order.location}`,`Date: ${order.fulfillment_date}`];
 if(order.pickup_slot)msg.push('Pickup: '+new Date(order.pickup_slot).toLocaleString('en-SG',{timeZone:'Asia/Singapore'}));
 if(order.fulfillment==='delivery')msg.push(`Area: ${order.delivery_area||order.delivery_region}`,`Address: ${order.address}`,`Delivery fee: ${money(order.delivery_fee_cents)}`);
 if(order.notes)msg.push('Notes: '+order.notes);
 msg.push('','Please confirm availability and payment details.');
 return `https://wa.me/${catalog.whatsapp[order.location]}?text=${encodeURIComponent(msg.join('\n'))}`;
}
module.exports={AppError,assert,text,oneOf,integer,phoneNumber,sgDate,earliestDeliveryDate,date,money,priceItems,validateOrder,whatsapp,catalog};
