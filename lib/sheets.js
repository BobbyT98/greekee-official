const {createHmac}=require('node:crypto');
const {supa}=require('./backend');
const enabled=()=>Boolean(process.env.SHEETS_SYNC_URL&&process.env.SHEETS_SYNC_SECRET);
async function syncOne(order){
 if(!enabled())return {state:'not_configured'};
 // Only send fields needed for reporting; never forward auth IDs or request hashes.
 const {request_key,request_hash,created_by,payment_checked_by,...report}=order;
 const payload=JSON.stringify({timestamp:Date.now(),order:report});
 const signature=createHmac('sha256',process.env.SHEETS_SYNC_SECRET).update(payload).digest('hex');
 try {
  const url=new URL(process.env.SHEETS_SYNC_URL);
  if(url.protocol!=='https:'||url.hostname!=='script.google.com')throw new Error('invalid_sync_url');
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({payload,signature}),redirect:'follow',signal:AbortSignal.timeout(8000)});
  const result=await response.json();if(!response.ok||!result.ok)throw new Error('sheets_write_failed');
  // Do not mark a newer revision as synced while an older revision is in flight.
  await supa(`/rest/v1/greekee_orders?id=eq.${order.id}&revision=eq.${order.revision}&synced_revision=lt.${order.revision}`,{method:'PATCH',body:{synced_revision:order.revision,synced_at:new Date().toISOString(),last_sync_error:null}});
  return {state:'synced'};
 }catch{
  await supa(`/rest/v1/greekee_orders?id=eq.${order.id}&revision=eq.${order.revision}&synced_revision=lt.${order.revision}`,{method:'PATCH',body:{last_sync_error:'Google Sheets could not be reached. Retry sync from the dashboard.'}}).catch(()=>{});
  return {state:'pending'};
 }
}
module.exports={enabled,syncOne};
