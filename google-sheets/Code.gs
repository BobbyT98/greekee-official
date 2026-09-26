/** Greekee reporting receiver. Use one Apps Script project for TEST and another for LIVE.
 * Set ENVIRONMENT below for that project, and use a DIFFERENT SYNC_SECRET in each.
 * This code creates only Greekee Orders — TEST/LIVE and Greekee Dashboard — TEST/LIVE.
 * Existing Fiona and Caleb quarterly tabs are never opened or edited.
 */
const SPREADSHEET_ID = '1YGXHw1_KAaLs6-sur7ndsyOfYfnFyy3MOOQ6F4SpdyE';
const ENVIRONMENT = 'TEST'; // In the separate production Apps Script project, set LIVE.
const HEADERS = ['Sync key','Order number','Location','Customer','Phone','Product','Quantity','Add-ons per bowl','Order date','Collection / delivery date','Preparation','Payment','Sales platform','Point of contact','Notes','Product line total','Order total (once)','Delivery fee (once)','Line discount','Revision','Source order ID','Order count (once)','Paid total (once)','Unpaid total (once)'];
function names_() {
 if(!['TEST','LIVE'].includes(ENVIRONMENT))throw Error('Invalid environment');
 return {orders:'Greekee Orders — '+ENVIRONMENT,dashboard:'Greekee Dashboard — '+ENVIRONMENT};
}
function safe_(value){const s=String(value==null?'':value);return /^[=+\-@\t\r]/.test(s)?"'"+s:s;}
function prepareOrders_(ss,create) {
 const name=names_().orders;
 let sheet=ss.getSheetByName(name);
 if(!sheet){if(!create)throw Error('Run setupGreekeeSync first');sheet=ss.insertSheet(name);}
 if(sheet.getMaxColumns()<HEADERS.length)sheet.insertColumnsAfter(sheet.getMaxColumns(),HEADERS.length-sheet.getMaxColumns());
 const actual=sheet.getRange(1,1,1,HEADERS.length).getDisplayValues()[0];
 if(actual.every(v=>v==='')){
  if(sheet.getLastRow()>1)throw Error('Order tab has data without headers');
  sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);sheet.setFrozenRows(1);
 } else if(actual.some((v,i)=>v!==HEADERS[i]))throw Error('Order tab headers do not match; no rows changed');
 return sheet;
}
function prepareDashboard_(ss){
 const {orders,dashboard}=names_();let sheet=ss.getSheetByName(dashboard);
 if(sheet){if(sheet.getRange(1,1).getDisplayValues()[0][0]!=='GREEKEE  /  ORDER PULSE')throw Error('Dashboard tab already contains other content');return;}
 sheet=ss.insertSheet(dashboard);
 const source="'"+orders.replace(/'/g,"''")+"'!";
 sheet.setHiddenGridlines(true);sheet.setFrozenRows(3);sheet.setColumnWidths(1,12,104);
 sheet.getRange('A1:L44').setBackground('#FAF7EF').setFontColor('#263A2D').setFontFamily('Arial');
 function block_(a1,value,bg,fg,size){const range=sheet.getRange(a1);range.merge().setBackground(bg).setFontColor(fg).setFontSize(size).setFontWeight('bold').setVerticalAlignment('middle');const cell=range.getCell(1,1);if(value[0]==='=')cell.setFormula(value);else cell.setValue(value);}
 block_('A1:L2','GREEKEE  /  ORDER PULSE','#2F4935','#FFFFFF',23);
 block_('A3:L3',ENVIRONMENT+' ENVIRONMENT  •  Connected orders only  •  No historical quarterly entries','#E7ECD9','#3D5944',11);
 block_('A9:L9','AT A GLANCE','#DCE8D4','#2F4935',13);
 block_('A14:L14',"WHAT'S MOVING  /  live "+ENVIRONMENT+' data','#2F4935','#FFFFFF',13);
 const cards=[
  ['A','C','ORDERS','=SUM('+source+'V2:V)','#E9F1E2',false],
  ['D','F','BOWLS TO PREPARE','=SUMIFS('+source+'G2:G,'+source+'K2:K,"<>Cancelled",'+source+'K2:K,"<>Delivered")','#F7ECD4',false],
  ['G','I','PAID TOTAL','=SUM('+source+'W2:W)','#E2EEE4',true],
  ['J','L','UNPAID','=SUM('+source+'X2:X)','#FAE7DC',true]
 ];
 cards.forEach(([left,right,label,formula,bg,money])=>{block_(left+'5:'+right+'5',label,bg,'#4A6650',10);block_(left+'6:'+right+'7',formula,bg,'#243A2B',20);if(money)sheet.getRange(left+'6').setNumberFormat('$#,##0.00');});
 const small=[
  ['A','C','PUNGGOL','=SUMIFS('+source+'V2:V,'+source+'C2:C,"Punggol")',false],
  ['D','F','HOUGANG','=SUMIFS('+source+'V2:V,'+source+'C2:C,"Hougang")',false],
  ['G','I','PENDING CONFIRMATION','=SUMIFS('+source+'V2:V,'+source+'K2:K,"Pending confirmation")',false],
  ['J','L','DELIVERED PRODUCT REVENUE','=SUMIFS('+source+'P2:P,'+source+'K2:K,"Delivered")',true]
 ];
 small.forEach(([left,right,label,formula,money])=>{block_(left+'11:'+right+'11',label,'#F1EFE7','#5B6C5A',9);block_(left+'12:'+right+'12',formula,'#F1EFE7','#263A2D',19);if(money)sheet.getRange(left+'12').setNumberFormat('$#,##0.00');});
 [[1,42],[2,22],[3,30],[4,16],[5,30],[6,34],[7,34],[8,18],[9,34],[10,14],[11,28],[12,48],[13,18],[14,34],[15,14]].forEach(([row,height])=>sheet.setRowHeight(row,height));
 sheet.getRange('P1:Q1').setValues([['Product','Bowls']]);
 sheet.getRange('P2').setFormula('=IFERROR(QUERY('+source+'A2:K,"select F,sum(G) where F is not null and K <> \'Cancelled\' group by F label F \'\', sum(G) \'\'",0),{"No orders yet",0})');
 sheet.getRange('R1:S1').setValues([['Date','Bowls due']]);
 for(let i=0;i<7;i++){sheet.getRange(i+2,18).setFormula('=TODAY()+'+i);sheet.getRange(i+2,19).setFormula('=SUMIFS('+source+'G2:G,'+source+'J2:J,R'+(i+2)+','+source+'K2:K,"<>Cancelled")');}
 sheet.getRange('R2:R8').setNumberFormat('ddd d mmm');
 sheet.getRange('T1:U3').setValues([['Location','Orders'],['Punggol',''],['Hougang','']]);
 sheet.getRange('U2').setFormula('=SUMIFS('+source+'V2:V,'+source+'C2:C,"Punggol")');
 sheet.getRange('U3').setFormula('=SUMIFS('+source+'V2:V,'+source+'C2:C,"Hougang")');
 sheet.getRange('V1:W4').setValues([['Payment','Orders'],['Paid',''],['Unpaid',''],['Refunded','']]);
 ['paid','unpaid','refunded'].forEach((status,i)=>sheet.getRange(i+2,23).setFormula('=SUMIFS('+source+'V2:V,'+source+'L2:L,"'+status+'")'));
 const charts=[
  [Charts.ChartType.BAR,'Best-selling bowls','P1:Q51',16,1,'#728E56'],
  [Charts.ChartType.COLUMN,'Next 7 days','R1:S8',16,7,'#D9A844'],
  [Charts.ChartType.PIE,'Orders by location','T1:U3',35,1,'#728E56'],
  [Charts.ChartType.PIE,'Payment status','V1:W4',35,7,'#D9A844']
 ];
 charts.forEach(([type,title,data,row,col,accent])=>{
  let builder=sheet.newChart().setChartType(type).addRange(sheet.getRange(data)).setPosition(row,col,0,0).setNumHeaders(1).setHiddenDimensionStrategy(Charts.ChartHiddenDimensionStrategy.SHOW_BOTH).setOption('title',title).setOption('width',580).setOption('height',340).setOption('backgroundColor','#FFFFFF').setOption('colors',[accent]).setOption('legend',type===Charts.ChartType.PIE?{position:'right'}:'none');
  if(type===Charts.ChartType.PIE)builder=builder.setOption('pieHole',0.56);
  sheet.insertChart(builder.build());
 });
 block_('A54:L54',ENVIRONMENT+' ONLY  •  Charts update when orders sync. Historical Fiona and Caleb tabs are separate.','#E7ECD9','#3D5944',10);
 sheet.hideColumns(16,8);
}
function setupGreekeeSync(){
 const secret=PropertiesService.getScriptProperties().getProperty('SYNC_SECRET');
 if(!secret||secret.length<32)throw Error('Set a separate SYNC_SECRET of at least 32 characters first');
 const ss=SpreadsheetApp.openById(SPREADSHEET_ID);prepareOrders_(ss,true);prepareDashboard_(ss);
 console.log('Ready for '+ENVIRONMENT+'. Add this web app URL and its secret only to Vercel '+(ENVIRONMENT==='TEST'?'Preview':'Production')+'.');
}
function doPost(e){
 const reply=v=>ContentService.createTextOutput(JSON.stringify(v)).setMimeType(ContentService.MimeType.JSON);let lock;
 try{
  if(!e?.postData?.contents||e.postData.contents.length>60000)throw Error('Invalid request');
  const envelope=JSON.parse(e.postData.contents),secret=PropertiesService.getScriptProperties().getProperty('SYNC_SECRET');
  if(!secret||secret.length<32||typeof envelope.payload!=='string')throw Error('Not configured');
  const digest=Utilities.computeHmacSha256Signature(envelope.payload,secret,Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');
  const sig=String(envelope.signature||'');let mismatch=digest.length^sig.length;for(let i=0;i<digest.length;i++)mismatch|=digest.charCodeAt(i)^(sig.charCodeAt(i)||0);if(mismatch)throw Error('Invalid signature');
  const request=JSON.parse(envelope.payload),o=request.order;
  if(request.environment!==ENVIRONMENT)throw Error('Wrong environment');
  if(!Number.isFinite(request.timestamp)||Math.abs(Date.now()-request.timestamp)>300000)throw Error('Expired request');
  if(!o||!['Punggol','Hougang'].includes(o.location)||!Array.isArray(o.items)||!o.items.length||!Number.isInteger(o.revision)||!o.id)throw Error('Invalid order');
  lock=LockService.getScriptLock();lock.waitLock(10000);
  const sheet=prepareOrders_(SpreadsheetApp.openById(SPREADSHEET_ID),false);
  const last=sheet.getLastRow(),known={};
  if(last>1)sheet.getRange(2,1,last-1,20).getValues().forEach((row,i)=>{if(row[0])known[String(row[0])]={row:i+2,revision:Number(row[19])||0};});
  let next=last;
  const status={pending:'Pending confirmation',confirmed:'Confirmed',preparing:'Preparing',ready:'Ready',completed:'Delivered',cancelled:'Cancelled'}[o.order_status];
  if(!status||!['unpaid','paid','refunded'].includes(o.payment_status))throw Error('Invalid status');
  let remaining=o.discount_cents;
  o.items.forEach((item,i)=>{
   const discount=i===o.items.length-1?remaining:Math.floor(o.discount_cents*item.line_cents/Math.max(1,o.subtotal_cents));remaining-=discount;
   const key=o.id+':'+item.id,existing=known[key];if(existing&&existing.revision>=o.revision)return;
   const row=existing?existing.row:++next;if(row>sheet.getMaxRows())sheet.insertRowsAfter(sheet.getMaxRows(),Math.max(50,row-sheet.getMaxRows()));
   if(!existing){sheet.getRange(row,1).setValue(key);SpreadsheetApp.flush();}
   const addons=item.addons.map(a=>a.name+' x'+a.quantity+' ($'+(a.unit_cents/100).toFixed(2)+' each)').join(', ');
   const notes=[o.notes,o.adjustment_reason?'Adjustment: '+o.adjustment_reason:'',o.pickup_slot?'Pickup: '+Utilities.formatDate(new Date(o.pickup_slot),'Asia/Singapore','HH:mm'):''].filter(Boolean).join(' | ');
   const total=i===0?o.total_cents/100:'';
   sheet.getRange(row,2,1,18).setValues([[o.order_number,o.location,safe_(o.customer_name),safe_(o.phone),safe_(item.sheet_name==='Special Order'?item.name:item.sheet_name),item.quantity,safe_(addons),new Date(o.order_date+'T12:00:00+08:00'),new Date(o.fulfillment_date+'T12:00:00+08:00'),status,o.payment_status,o.source,safe_(o.point_of_contact),safe_(notes),(item.line_cents-discount)/100,total,i===0?o.delivery_fee_cents/100:'',discount/100]]);
   SpreadsheetApp.flush();
   sheet.getRange(row,20,1,5).setValues([[o.revision,o.id,i===0?1:0,i===0&&o.payment_status==='paid'?total:0,i===0&&o.payment_status==='unpaid'?total:0]]);
   sheet.getRange(row,9,1,2).setNumberFormat('yyyy-mm-dd');
  });
  SpreadsheetApp.flush();return reply({ok:true});
 }catch(error){console.error(String(error));return reply({ok:false,error:'Sync failed. Check Apps Script Executions for the reason.'});}
 finally{if(lock&&lock.hasLock())lock.releaseLock();}
}
