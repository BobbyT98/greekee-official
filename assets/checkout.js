/* Runs after the existing cart script. No Supabase keys are sent to the browser. */
(()=>{
 const byId=id=>document.getElementById(id);
 const button=byId('sendOrder'),error=byId('checkoutError'),receipt=byId('orderReceipt');
 let busy=false;
 const config=fetch('/api/config').then(async r=>{if(!r.ok)throw Error('Unable to check ordering availability. Please try again.');return r.json();});
 // Attach a handler immediately to avoid an unhandled promise during initial load.
 config.catch(()=>{});
 config.then(c=>{button.textContent=c.capture_enabled?'Save order & continue →':'Send order on WhatsApp →';if(c.capture_enabled)byId('captureNote').textContent='We’ll save this as a pending request. Send the WhatsApp message to confirm availability and arrange payment. Your details are used to fulfil your order.';}).catch(()=>{});
 const today=toDateInputValue(new Date());byId('eastDate').min=today;byId('eastDate').value=today;
 GREEKEE_PHONE.bind(byId('custCountry'),byId('custPhone'));
 function requireValue(id,label){const value=byId(id).value.trim();if(!value){byId(id).focus();throw Error(label);}return value;}
 function collect(){
  const delivery=mode==='delivery'?computeDelivery():null;
  const customer_name=requireValue('custName','Please add your name.');
  const phone=GREEKEE_PHONE.normalize(byId('custCountry'),byId('custPhone'));
  const address=delivery?requireValue('custAddress','Please add your delivery address.'):'';
  const fulfillment_date=requireValue(mode==='pickup'?'pickupDate':delivery.region==='East'?'eastDate':'nswDate','Please choose a collection or delivery date.');
  const pickup_slot=mode==='pickup'?requireValue('pickupTime','Please choose an available pickup time.'):'';
  return {customer_name,phone,fulfillment:mode,location:pickupLoc,fulfillment_date,pickup_slot,address,delivery_region:delivery?.region||'',delivery_area:delivery?.region==='East'?delivery.location:'',notes:byId('custNotes').value.trim(),website:byId('website').value,items:cart.map(c=>({product_id:c.product_id,quantity:c.qty,addons:c.addons||[]}))};
 }
 async function attemptKey(payload){
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(payload)));
  const fingerprint=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
  const key='gk-checkout-'+fingerprint;let value;try{value=sessionStorage.getItem(key);}catch{}
  if(!value){value=crypto.randomUUID();try{sessionStorage.setItem(key,value);}catch{}}
  return {storageKey:key,value};
 }
 function manualLink(payload){
  const delivery=mode==='delivery'?computeDelivery():null;
  const location=mode==='pickup'?pickupLoc:(delivery.whatsapp===WHATSAPP_NUMBERS.Hougang?'Hougang':'Punggol');
  const list=cart.map(c=>`${c.qty} x ${c.name}${c.meta?' ('+c.meta+')':''} — ${money(c.unitPrice*c.qty)}`);
  list.push('',`Name: ${payload.customer_name}`,`Phone: ${payload.phone}`,`Method: ${mode}`,`Location: ${location}`,`Date: ${payload.fulfillment_date}`);
  if(payload.pickup_slot)list.push('Pickup: '+formatPickupLabel(new Date(payload.pickup_slot)));
  if(delivery)list.push('Address: '+payload.address,'Delivery: '+money(delivery.fee));
  list.push('Total: '+money(cartTotal()+(delivery?.fee||0)));if(payload.notes)list.push('Notes: '+payload.notes);
  return 'https://wa.me/'+WHATSAPP_NUMBERS[location]+'?text='+encodeURIComponent("Hi Greekee! I'd like to order:\n\n"+list.join('\n'));
 }
 button.addEventListener('click',async()=>{
  if(busy||!cart.length)return;error.textContent='';error.hidden=true;
  let payload;try{payload=collect();}catch(e){error.textContent=e.message;error.hidden=false;return;}
  busy=true;button.disabled=true;const original=button.textContent;button.textContent='Saving…';
  try {
   const settings=await config;
   if(!settings.capture_enabled){window.location.assign(manualLink(payload));return;}
   const attempt=await attemptKey(payload);payload.request_key=attempt.value;
   const response=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(35000)});
   const saved=await response.json();if(!response.ok)throw Error(saved.error||'Could not save. Please try again.');
   receipt.replaceChildren();const title=document.createElement('h3');title.textContent='Your request is saved';const detail=document.createElement('p');detail.textContent=`${saved.order_number} · ${money(saved.total_cents/100)}. Next, send your message on WhatsApp. We’ll reply to confirm availability and payment.`;
   const link=document.createElement('a');link.href=saved.whatsapp_url;link.target='_blank';link.rel='noopener';link.className='whatsapp-btn';link.textContent='Open WhatsApp & send →';link.style.display='block';link.style.textAlign='center';link.style.marginTop='14px';
   receipt.append(title,detail,link);receipt.hidden=false;try{sessionStorage.removeItem(attempt.storageKey);}catch{}cart=[];renderCart();receipt.scrollIntoView({behavior:'smooth',block:'nearest'});
  }catch(e){error.textContent=e.name==='TimeoutError'?'This is taking longer than usual. Tap again to safely retry the same order.':e.message||'Could not connect. Please try again.';error.hidden=false;}
  finally{busy=false;button.disabled=false;button.textContent=original;}
 });
})();
