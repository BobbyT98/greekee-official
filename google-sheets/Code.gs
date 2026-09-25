/** Bind this script to GREEKEE through Extensions > Apps Script.
 * Set SYNC_SECRET in Script Properties, run setupGreekeeSync, then deploy as a
 * web app: execute as you; access Anyone. Requests are HMAC signed by Vercel.
 * Only rows with a Greekee sync key are ever updated. Existing manual rows stay.
 */
const SPREADSHEET_ID = '1YGXHw1_KAaLs6-sur7ndsyOfYfnFyy3MOOQ6F4SpdyE';
const META_HEADERS = ['Greekee sync key','Order number','Sync revision','Payment status','Add-ons per bowl','Order total (once)','Delivery fee (once)','Line discount','Payment checked at','Source order ID'];
const ORDER_HEADERS = ['Name','Product','Quantity','Status','Order date','Delivery date','Price','Sales platform','Point of contact','Notes'];
function normalName_(s) { return String(s).normalize('NFKC').replace(/[^a-z0-9]/gi,'').toLowerCase(); }
function sheetFor_(ss,location,orderDate) {
 const year=Number(orderDate.slice(0,4)),quarter=Math.floor((Number(orderDate.slice(5,7))-1)/3)+1;
 const wanted=(location==='Punggol'?'FIO':'CALB')+"s ORDERS Q"+quarter+String(year).slice(-2);
 const found=ss.getSheets().filter(s=>normalName_(s.getName())===normalName_(wanted));
 if(found.length!==1)throw Error('Create exactly one '+wanted+' tab for this quarter.');
 return found[0];
}
function setupGreekeeSync() {
 const secret=PropertiesService.getScriptProperties().getProperty('SYNC_SECRET');
 if(!secret||secret.length<32)throw Error('Set a random SYNC_SECRET of at least 32 characters in Script Properties first.');
 const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
 ss.setSpreadsheetTimeZone('Asia/Singapore');
 const current=Utilities.formatDate(new Date(),'Asia/Singapore','yyyy-MM-dd');
 ['Punggol','Hougang'].forEach(location=>prepareSheet_(sheetFor_(ss,location,current)));
 console.log('Ready. Deploy as a web app and copy its /exec URL into Vercel SHEETS_SYNC_URL.');
}
function prepareSheet_(sheet) {
 const actual=sheet.getRange(21,1,1,10).getDisplayValues()[0].map(s=>s.trim().toLowerCase());
 if(actual.some((v,i)=>v!==ORDER_HEADERS[i].toLowerCase()))throw Error('Order headers on row 21 do not match. Nothing was changed.');
 if(sheet.getMaxColumns()<32)sheet.insertColumnsAfter(sheet.getMaxColumns(),32-sheet.getMaxColumns());
 const headers=sheet.getRange(21,23,1,10).getDisplayValues()[0];
 if(headers.some((v,i)=>v && v!==META_HEADERS[i]))throw Error('Columns W:AF are already in use. Nothing was overwritten.');
 if(headers.every(v=>!v)&&sheet.getLastRow()>21&&sheet.getRange(22,23,sheet.getLastRow()-21,10).getDisplayValues().some(row=>row.some(v=>v!=='')))throw Error('Columns W:AF already contain data. Nothing was overwritten.');
 sheet.getRange(21,23,1,10).setValues([META_HEADERS]);
 // Extend the existing dashboard's row-22 SUMIF/SUMIFS ranges so new orders count.
 // This preserves its existing Delivered-based revenue definition and charts.
 const range=sheet.getRange('K1:V20'),formula=range.getFormulas();
 formula.forEach((row,r)=>row.forEach((f,c)=>{if(f&&/\bSUMIF[S]?\(/i.test(f)){const next=f.replace(/(\$?[A-Z]+\$?22):(\$?[A-Z]+)\$?\d+/g,'$1:$2');if(next!==f)range.getCell(r+1,c+1).setFormula(next);}}));
}
function safe_(value){const s=String(value==null?'':value);return /^[=+\-@\t\r]/.test(s)?"'"+s:s;}
function doPost(e) {
 const reply=value=>ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
 let lock;
 try {
  if(!e||!e.postData||e.postData.contents.length>60000)throw Error('Invalid request');
  const envelope=JSON.parse(e.postData.contents),secret=PropertiesService.getScriptProperties().getProperty('SYNC_SECRET');
  if(!secret||secret.length<32||typeof envelope.payload!=='string')throw Error('Not configured');
  const digest=Utilities.computeHmacSha256Signature(envelope.payload,secret,Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');
  const sig=String(envelope.signature||'');let mismatch=digest.length^sig.length;for(let i=0;i<digest.length;i++)mismatch|=digest.charCodeAt(i)^(sig.charCodeAt(i)||0);if(mismatch)throw Error('Invalid signature');
  const request=JSON.parse(envelope.payload),o=request.order;
  if(!Number.isFinite(request.timestamp)||Math.abs(Date.now()-request.timestamp)>300000)throw Error('Expired request');
  if(!o||!['Punggol','Hougang'].includes(o.location)||!Array.isArray(o.items)||!o.items.length||!Number.isInteger(o.revision))throw Error('Invalid order');
  lock=LockService.getScriptLock();lock.waitLock(10000);
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID),sheet=sheetFor_(ss,o.location,o.order_date);prepareSheet_(sheet);
  const last=Math.max(21,sheet.getLastRow());
  const keys=last>21?sheet.getRange(22,23,last-21,3).getValues():[];
  const index={};keys.forEach((row,i)=>{if(row[0])index[String(row[0])]={row:i+22,revision:Number(row[2])||0};});
  const history=last>21?sheet.getRange(22,1,last-21,10).getDisplayValues():[];
  let lastUsed=21;history.forEach((row,i)=>{if(row.some(v=>v!==''))lastUsed=i+22;});keys.forEach((row,i)=>{if(row[0])lastUsed=Math.max(lastUsed,i+22);});
  const status={pending:'Pending confirmation',confirmed:'Confirmed',preparing:'Preparing',ready:'Ready',completed:'Delivered',cancelled:'Cancelled'}[o.order_status];
  if(!status)throw Error('Unknown status');
  let discountRemaining=o.discount_cents;
  o.items.forEach((item,i)=>{
   const discount=i===o.items.length-1?discountRemaining:Math.floor(o.discount_cents*item.line_cents/Math.max(1,o.subtotal_cents));discountRemaining-=discount;
   const key=o.id+':'+item.id,known=index[key];if(known&&known.revision>=o.revision)return;
   const row=known?known.row:++lastUsed;if(row>sheet.getMaxRows())sheet.insertRowsAfter(sheet.getMaxRows(),Math.max(50,row-sheet.getMaxRows()));
   // Reserve the key first. A retry after a partial failure repairs this row.
   if(!known){sheet.getRange(row,23,1,3).setValues([[key,o.order_number,0]]);SpreadsheetApp.flush();}
   const addons=item.addons.map(a=>a.name+' x'+a.quantity+' ($'+(a.unit_cents/100).toFixed(2)+' each)').join(', ');
   const notes=[o.notes,'Payment: '+o.payment_status,addons?'Per bowl: '+addons:'',o.adjustment_reason?'Adjustment: '+o.adjustment_reason:'',o.pickup_slot?'Pickup: '+Utilities.formatDate(new Date(o.pickup_slot),'Asia/Singapore','HH:mm'):''].filter(Boolean).join(' | ');
   // G holds this line's discounted product total; delivery is kept separately.
   sheet.getRange(row,4).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Pending confirmation','Confirmed','Preparing','Ready','Delivered','Cancelled'],true).setAllowInvalid(false).build());
   sheet.getRange(row,8).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Website','WhatsApp','Whatsapp','Instagram','Telegram','Lemon8','Other'],true).setAllowInvalid(false).build());
   // Product names are canonical dashboard names; free text remains in Notes.
   sheet.getRange(row,2).clearDataValidations();
   sheet.getRange(row,1,1,10).setValues([[safe_(o.customer_name),item.sheet_name,item.quantity,status,new Date(o.order_date+'T12:00:00+08:00'),new Date(o.fulfillment_date+'T12:00:00+08:00'),(item.line_cents-discount)/100,o.source,safe_(o.point_of_contact),safe_((item.sheet_name==='Special Order'?item.name+' | ':'')+notes)]]);
   sheet.getRange(row,5,1,2).setNumberFormat('yyyy-mm-dd');sheet.getRange(row,7).setNumberFormat('0.00');
   SpreadsheetApp.flush();
   sheet.getRange(row,23,1,10).setValues([[key,o.order_number,o.revision,o.payment_status,safe_(addons),i===0?o.total_cents/100:'',i===0?o.delivery_fee_cents/100:'',discount/100,o.payment_checked_at||'',o.id]]);
  });
  SpreadsheetApp.flush();return reply({ok:true});
 }catch(error){console.error(String(error));return reply({ok:false,error:'Sync failed. Check Apps Script Executions for the reason.'});}
 finally{if(lock&&lock.hasLock())lock.releaseLock();}
}
/** Optional: run at quarter end to create EMPTY tabs for the next quarter.
 * This uses a minimal matching structure; existing tabs and history are untouched.
 */
function createNextQuarterTabs() {
 const ss=SpreadsheetApp.openById(SPREADSHEET_ID),current=Utilities.formatDate(new Date(),'Asia/Singapore','yyyy-MM-dd');
 let year=Number(current.slice(0,4)),q=Math.floor((Number(current.slice(5,7))-1)/3)+2;if(q===5){q=1;year++;}
 ['FIO','CALB'].forEach(prefix=>{
  const name='🌟'+prefix+"'s ORDERS Q"+q+"'"+String(year).slice(-2);
  if(ss.getSheets().some(s=>normalName_(s.getName())===normalName_(name)))return;
  const s=ss.insertSheet(name);s.getRange('A1').setValue('Order Tracking Dashboard');s.getRange('A21:J21').setValues([ORDER_HEADERS]);
  s.getRange('K1').setValue('Delivered quantity');s.getRange('K2').setFormula('=SUMIF(D22:D,"Delivered",C22:C)');s.getRange('K4').setValue('Delivered product revenue');s.getRange('K5').setFormula('=SUMIF(D22:D,"Delivered",G22:G)');s.setFrozenRows(21);prepareSheet_(s);
 });
}
