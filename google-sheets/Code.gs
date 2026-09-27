/** Greekee reporting receiver. Use one Apps Script project for TEST and another for LIVE.
 * Set ENVIRONMENT below for that project, and use a DIFFERENT SYNC_SECRET in each.
 * This code creates a shared order tab, separate Fiona/Caleb dashboards and a
 * original Q3 2026 product lines in clearly marked HISTORY rows of TEST Orders.
 * Existing Fiona and Caleb quarterly tabs are read for history, never edited.
 */
const SPREADSHEET_ID = '1YGXHw1_KAaLs6-sur7ndsyOfYfnFyy3MOOQ6F4SpdyE';
const ENVIRONMENT = 'TEST'; // In the separate production Apps Script project, set LIVE.
const HEADERS = ['Sync key','Order number','Location','Customer','Phone','Product','Quantity','Add-ons per bowl','Order date','Collection / delivery date','Preparation','Payment','Sales platform','Point of contact','Notes','Product line total','Order total (once)','Delivery fee (once)','Line discount','Revision','Source order ID','Order count (once)','Paid total (once)','Unpaid total (once)'];
function names_() {
 if(!['TEST','LIVE'].includes(ENVIRONMENT))throw Error('Invalid environment');
 return {orders:'Greekee Orders — '+ENVIRONMENT,dashboards:{Fiona:'Fiona Dashboard — '+ENVIRONMENT,Caleb:'Caleb Dashboard — '+ENVIRONMENT}};
}
function bowlRankingFormula_(source,location){
 return '=IFERROR(QUERY('+source+'A2:K,"select F,sum(G) where F is not null and F <> \'Special Order\' and C = \''+location+'\' and K <> \'Cancelled\' and K <> \'Pending payment\' and K <> \'Pending confirmation\' group by F order by sum(G) desc label F \'\', sum(G) \'\'",0),{"No bowls yet",0})';
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
 if(create)styleOrders_(sheet); // Setup only; never spend time restyling on each incoming order.
 return sheet;
}
function styleOrders_(sheet){
 const rows=sheet.getMaxRows();sheet.setFrozenRows(1);sheet.setFrozenColumns(4);sheet.setHiddenGridlines(true);sheet.setTabColor('#2F4935');
 const header=sheet.getRange(1,1,1,24);header.setBackground('#2F4935').setFontColor('#FFFFFF').setFontWeight('bold').setFontSize(10).setWrap(true).setVerticalAlignment('middle');
 if(!sheet.getRange(1,1,rows,24).getBandings().length)sheet.getRange(1,1,rows,24).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY,true,false).setHeaderRowColor('#2F4935').setFirstRowColor('#FFFFFF').setSecondRowColor('#FAF7EF');
 sheet.setRowHeight(1,55);sheet.setRowHeights(2,rows-1,54);
 [[2,175],[3,110],[4,170],[5,155],[6,245],[7,78],[8,285],[9,125],[10,165],[11,175],[12,100],[13,125],[14,145],[15,255],[16,120],[17,130],[18,120],[19,120]].forEach(([col,width])=>sheet.setColumnWidth(col,width));
 sheet.hideColumns(1);sheet.hideColumns(13,2);sheet.hideColumns(18,7);
 sheet.getRange(2,9,rows-1,2).setNumberFormat('ddd, d mmm');sheet.getRange(2,16,rows-1,4).setNumberFormat('$#,##0.00');
 sheet.getRange(2,7,rows-1,1).setHorizontalAlignment('center');sheet.getRange(2,8,rows-1,1).setWrap(true);sheet.getRange(2,15,rows-1,1).setWrap(true);
 if(!sheet.getFilter())sheet.getRange(1,1,rows,24).createFilter();
 if(!sheet.getConditionalFormatRules().length){
  const rules=[
   [11,'Pending payment','#FAE6BB','#644B16'],[11,'Order accepted','#E2EEE4','#2E6138'],[11,'Delivered','#DBEFDB','#2E6138'],[11,'Cancelled','#F7DDD7','#7D332B'],[11,'Special deal (FOC)','#EEE1EF','#5B375E'],
   [12,'paid','#DBEFDB','#2E6138'],[12,'unpaid','#FAE6BB','#644B16']
  ].map(([col,value,bg,fg])=>SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(value).setBackground(bg).setFontColor(fg).setRanges([sheet.getRange(2,col,rows-1,1)]).build());
  sheet.setConditionalFormatRules(rules);
 }
}
function prepareDashboard_(ss,person){
 const {orders,dashboards}=names_(),location={Fiona:'Punggol',Caleb:'Hougang'}[person];if(!location)throw Error('Invalid dashboard owner');
 let sheet=ss.getSheetByName(dashboards[person]);
 if(sheet){if(sheet.getRange(1,1).getDisplayValues()[0][0]!=='GREEKEE  /  '+person.toUpperCase()+' ORDER PULSE')throw Error('Dashboard tab already contains other content');return sheet;}
 sheet=ss.insertSheet(dashboards[person]);sheet.setTabColor(person==='Fiona'?'#2F4935':'#B48437');
 const source="'"+orders.replace(/'/g,"''")+"'!";
 sheet.setHiddenGridlines(true);sheet.setFrozenRows(3);sheet.setColumnWidths(1,12,104);
 sheet.getRange('A1:L44').setBackground('#FAF7EF').setFontColor('#263A2D').setFontFamily('Arial');
 function block_(a1,value,bg,fg,size){const range=sheet.getRange(a1);range.merge().setBackground(bg).setFontColor(fg).setFontSize(size).setFontWeight('bold').setVerticalAlignment('middle');const cell=range.getCell(1,1);if(value[0]==='=')cell.setFormula(value);else cell.setValue(value);}
 block_('A1:L2','GREEKEE  /  '+person.toUpperCase()+' ORDER PULSE','#2F4935','#FFFFFF',23);
 block_('A3:L3',location+' pickup + assigned deliveries  •  '+(ENVIRONMENT==='TEST'?'TEST queue + Q3 bowl history':'LIVE orders only'),'#E7ECD9','#3D5944',11);
 block_('A9:L9','AT A GLANCE','#DCE8D4','#2F4935',13);
 block_('A14:L14',ENVIRONMENT==='TEST'?'BOWL RANKING / Q3 + TEST  •  LIVE TEST ACTIVITY':"WHAT'S MOVING  /  live LIVE data",'#2F4935','#FFFFFF',13);
 const cards=[
  ['A','C','ORDERS','=SUMIFS('+source+'V2:V,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*")','#E9F1E2',false],
  ['D','F','BOWLS TO PREPARE','=SUMIFS('+source+'G2:G,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'K2:K,"Order accepted")+SUMIFS('+source+'G2:G,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'K2:K,"Confirmed")+SUMIFS('+source+'G2:G,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'K2:K,"Preparing")+SUMIFS('+source+'G2:G,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'K2:K,"Ready")','#F7ECD4',false],
  ['G','I','PAID TOTAL','=SUMIFS('+source+'W2:W,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*")','#E2EEE4',true],
  ['J','L','UNPAID','=SUMIFS('+source+'X2:X,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*")','#FAE7DC',true]
 ];
 cards.forEach(([left,right,label,formula,bg,money])=>{block_(left+'5:'+right+'5',label,bg,'#4A6650',10);block_(left+'6:'+right+'7',formula,bg,'#243A2B',20);if(money)sheet.getRange(left+'6').setNumberFormat('$#,##0.00');});
 const small=[
  ['A','C','PENDING PAYMENT','=SUMIFS('+source+'V2:V,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'K2:K,"Pending payment")+SUMIFS('+source+'V2:V,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'K2:K,"Pending confirmation")',false],
  ['D','F','ORDERS ACCEPTED','=SUMIFS('+source+'V2:V,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'K2:K,"Order accepted")+SUMIFS('+source+'V2:V,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'K2:K,"Confirmed")+SUMIFS('+source+'V2:V,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'K2:K,"Preparing")+SUMIFS('+source+'V2:V,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'K2:K,"Ready")',false],
  ['G','I','DELIVERED','=SUMIFS('+source+'V2:V,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'K2:K,"Delivered")',false],
  ['J','L','DELIVERED PRODUCT REVENUE','=SUMIFS('+source+'P2:P,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'K2:K,"Delivered")',true]
 ];
 small.forEach(([left,right,label,formula,money])=>{block_(left+'11:'+right+'11',label,'#F1EFE7','#5B6C5A',9);block_(left+'12:'+right+'12',formula,'#F1EFE7','#263A2D',19);if(money)sheet.getRange(left+'12').setNumberFormat('$#,##0.00');});
 [[1,42],[2,22],[3,30],[4,16],[5,30],[6,34],[7,34],[8,18],[9,34],[10,14],[11,28],[12,48],[13,18],[14,34],[15,14]].forEach(([row,height])=>sheet.setRowHeight(row,height));
 sheet.getRange('P1:Q1').setValues([['Product','Bowls']]);
 sheet.getRange('P2').setFormula(bowlRankingFormula_(source,location));
 sheet.getRange('R1:S1').setValues([['Date','Bowls due']]);
 for(let i=0;i<7;i++){sheet.getRange(i+2,18).setFormula('=TODAY()+'+i);sheet.getRange(i+2,19).setFormula('=SUMIFS('+source+'G2:G,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'J2:J,">="&R'+(i+2)+','+source+'J2:J,"<"&(R'+(i+2)+'+1),'+source+'K2:K,"<>Cancelled")');}
 sheet.getRange('R2:R8').setNumberFormat('ddd d mmm');
 sheet.getRange('T1:U4').setValues([['Stage','Orders'],['Pending payment',''],['Orders accepted',''],['Delivered','']]);
 [small[0][3],small[1][3],small[2][3]].forEach((formula,i)=>sheet.getRange(i+2,21).setFormula(formula));
 sheet.getRange('V1:W4').setValues([['Payment','Orders'],['Paid',''],['Unpaid',''],['Refunded','']]);
 ['paid','unpaid','refunded'].forEach((status,i)=>sheet.getRange(i+2,23).setFormula('=SUMIFS('+source+'V2:V,'+source+'C2:C,"'+location+'",'+source+'A2:A,"<>HISTORY:*",'+source+'L2:L,"'+status+'")'));
 const charts=[
  [Charts.ChartType.BAR,'Best-selling bowls','P1:Q51',16,1,'#728E56'],
  [Charts.ChartType.COLUMN,'Next 7 days','R1:S8',16,7,'#D9A844'],
  [Charts.ChartType.PIE,'Order progress','T1:U4',35,1,'#728E56'],
  [Charts.ChartType.PIE,'Payment status','V1:W4',35,7,'#D9A844']
 ];
 charts.forEach(([type,title,data,row,col,accent])=>{
  let builder=sheet.newChart().setChartType(type).addRange(sheet.getRange(data)).setPosition(row,col,0,0).setNumHeaders(1).setHiddenDimensionStrategy(Charts.ChartHiddenDimensionStrategy.SHOW_BOTH).setOption('title',title).setOption('width',580).setOption('height',340).setOption('backgroundColor','#FFFFFF').setOption('colors',[accent]).setOption('legend',type===Charts.ChartType.PIE?{position:'right'}:'none');
  if(type===Charts.ChartType.PIE)builder=builder.setOption('pieHole',0.56);
  sheet.insertChart(builder.build());
 });
 block_('A54:L54',ENVIRONMENT==='TEST'?person+' • Named bowls include Q3 history and accepted/delivered TEST orders. Custom “Special Order” lines have no named bowl; other cards and charts show TEST only.':person+' • '+location+' queue  •  Charts update when orders sync.','#E7ECD9','#3D5944',10);
 sheet.hideColumns(16,8);
 return sheet;
}
const HISTORY_SOURCES = [
 {tab:"🌟FIO's ORDERS Q3'26",handler:'Fiona',key:'FIO'},
 {tab:"🌟CALB's ORDERS Q3'26",handler:'Caleb',key:'CALB'}
];
function legacyDate_(raw,display){
 if(raw instanceof Date && !isNaN(raw))return raw;
 if(typeof raw==='number'&&isFinite(raw))return raw;
 const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);
 return m?new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),12):'';
}
function refreshGreekeeHistory_(ss){
 // Build every row before touching the destination. No original quarterly cell is changed.
 const records=[];
 HISTORY_SOURCES.forEach(({tab,handler,key})=>{
  const source=ss.getSheetByName(tab);if(!source)throw Error('Missing historical source: '+tab);
  const length=Math.max(0,source.getLastRow()-21);if(!length)return;
  const range=source.getRange(22,1,length,10),values=range.getValues(),display=range.getDisplayValues();
  values.forEach((row,i)=>{
   const shown=display[i],name=shown[0],product=shown[1];if(!name||!product)return;
   const status=shown[3],stage={Delivered:'Delivered','Order Accepted':'Order accepted','Pending Payment':'Pending payment','FOC (Special)':'Special deal (FOC)'}[status]||status;
   const payment={Delivered:'Paid','Order Accepted':'Paid','Pending Payment':'Unpaid','FOC (Special)':'No charge'}[status]||'Unknown';
   const quantity=typeof row[2]==='number'?row[2]:/^\d+(?:\.\d+)?$/.test(shown[2])?Number(shown[2]):'';
   const price=typeof row[6]==='number'?row[6]:/^\$\s*\d+(?:\.\d{1,2})?$/.test(shown[6])?Number(shown[6].replace('$','')):'';
   const sourceRow=i+22;
   records.push([handler,safe_(name),safe_(product),quantity,stage,payment,legacyDate_(row[4],shown[4]),legacyDate_(row[5],shown[5]),price,safe_(shown[7]),safe_(shown[8]),safe_(shown[9]),safe_(status),key+':'+sourceRow,sourceRow]);
  });
 });
 if(ENVIRONMENT==='TEST')syncHistoryIntoOrders_(ss,records);
 return records.length;
}
function syncHistoryIntoOrders_(ss,records){
 const sheet=prepareOrders_(ss,false),last=sheet.getLastRow(),existing=new Map();
 if(last>1)sheet.getRange(2,1,last-1,1).getValues().forEach(([key],i)=>{
  if(String(key).startsWith('HISTORY:')){
   if(existing.has(String(key)))throw Error('Duplicate history key in Orders: '+key);
   existing.set(String(key),i+2);
  }
 });
 let next=last;const writes=[];
 records.forEach(([handler,customer,product,quantity,stage,payment,ordered,due,price,channel,contact,notes,label,sourceKey])=>{
  const key='HISTORY:'+sourceKey,row=existing.get(key)||++next;
  existing.delete(key);
  writes.push({row,values:[key,'HISTORY · '+sourceKey.replace(':',' row '),handler==='Fiona'?'Punggol':'Hougang',customer,'',product,quantity,'',ordered,due,stage,payment,channel,contact,[label,notes].filter(Boolean).join(' | '),price,'','','',0,sourceKey,0,0,0]});
 });
 if(next>sheet.getMaxRows())sheet.insertRowsAfter(sheet.getMaxRows(),next-sheet.getMaxRows());
 // Contiguous runs avoid hundreds of slow Apps Script round trips.
 writes.sort((a,b)=>a.row-b.row);
 for(let i=0;i<writes.length;){
  let j=i+1;while(j<writes.length&&writes[j].row===writes[j-1].row+1)j++;
  sheet.getRange(writes[i].row,1,j-i,24).setValues(writes.slice(i,j).map(w=>w.values));
  sheet.getRange(writes[i].row,9,j-i,2).setNumberFormat('ddd, d mmm');
  sheet.getRange(writes[i].row,16,j-i,1).setNumberFormat('$#,##0.00');
  i=j;
 }
 for(const row of existing.values())sheet.getRange(row,1,1,24).clearContent();
}
function addHistorySection_(sheet,person){
 if(sheet.getRange('A58').getDisplayValues()[0][0]==='GREEKEE  /  PAST ORDERS')return;
 if(sheet.getRange('A58').getDisplayValues()[0][0])throw Error('Dashboard history area contains other content');
 const source="'"+names_().orders.replace(/'/g,"''")+"'!";
 function block_(a1,value,bg,fg,size){const range=sheet.getRange(a1);range.merge().setBackground(bg).setFontColor(fg).setFontSize(size).setFontWeight('bold').setVerticalAlignment('middle');const cell=range.getCell(1,1);if(value[0]==='=')cell.setFormula(value);else cell.setValue(value);}
 sheet.getRange('A58:L96').setBackground('#FAF7EF').setFontColor('#263A2D').setFontFamily('Arial');
 block_('A58:L59','GREEKEE  /  PAST ORDERS','#2F4935','#FFFFFF',20);
 block_('A60:L60',person+' • Q3 2026 history • from the original quarterly sheet','#E7ECD9','#3D5944',11);
 const location=person==='Fiona'?'Punggol':'Hougang';
 const criteria=source+'A2:A,"HISTORY:*",'+source+'C2:C,"'+location+'",'+source+'K2:K,';
 const cards=[
  ['A','C','DELIVERED BOWLS','=SUMIFS('+source+'G2:G,'+criteria+'"Delivered")','#E9F1E2',false],
  ['D','F','DELIVERED SALES','=SUMIFS('+source+'P2:P,'+criteria+'"Delivered")','#F7ECD4',true],
  ['G','I','ACCEPTED PRODUCT LINES','=COUNTIFS('+criteria+'"Order accepted")','#E9F1E2',false],
  ['J','L','COMPLIMENTARY BOWLS','=SUMIFS('+source+'G2:G,'+source+'A2:A,"HISTORY:*",'+source+'C2:C,"'+location+'",'+source+'L2:L,"No charge")','#F7ECD4',false]
 ];
 cards.forEach(([left,right,label,formula,bg,money])=>{block_(left+'62:'+right+'62',label,bg,'#2F4935',10);block_(left+'63:'+right+'65',formula,bg,'#2F4935',22);if(money)sheet.getRange(left+'63').setNumberFormat('$#,##0.00');});
 sheet.getRange('P60:Q60').setValues([['Product','Bowls']]);
 sheet.getRange('P61').setFormula('=IFERROR(QUERY('+source+'A2:P,"select F,sum(G) where A starts with \'HISTORY:\' and C = \''+location+'\' and F is not null group by F label F \'\', sum(G) \'\'",0),{"No history",0})');
 sheet.getRange('R60:S60').setValues([['Month','Delivered sales']]);
 ['Jul 2026','Aug 2026','Sep 2026','No due date'].forEach((label,i)=>{
  const row=i+61;sheet.getRange(row,18).setValue(label);
  sheet.getRange(row,19).setFormula(i<3?'=SUMIFS('+source+'P2:P,'+criteria+'"Delivered",'+source+'J2:J,">="&DATE(2026,'+(i+7)+',1),'+source+'J2:J,"<"&EDATE(DATE(2026,'+(i+7)+',1),1))':'=SUMIFS('+source+'P2:P,'+criteria+'"Delivered",'+source+'J2:J,"")');
 });
 sheet.getRange('S61:S64').setNumberFormat('$#,##0.00');
 [
  [Charts.ChartType.BAR,'Past bowls by product','P60:Q110',69,1,'#728E56'],
  [Charts.ChartType.COLUMN,'Delivered sales by month','R60:S64',69,7,'#D9A844']
 ].forEach(([type,title,data,row,col,accent])=>sheet.insertChart(sheet.newChart().setChartType(type).addRange(sheet.getRange(data)).setPosition(row,col,0,0).setNumHeaders(1).setHiddenDimensionStrategy(Charts.ChartHiddenDimensionStrategy.SHOW_BOTH).setOption('title',title).setOption('width',580).setOption('height',340).setOption('backgroundColor','#FFFFFF').setOption('colors',[accent]).setOption('legend','none').build()));
 block_('A94:L96','HISTORY ONLY  •  Old rows are product lines, not unique orders. Missing old prices or quantities remain blank. TEST activity stays in the cards above.','#E7ECD9','#3D5944',10);
}
function refreshGreekeeHistory(){
 const ss=SpreadsheetApp.openById(SPREADSHEET_ID);if(ENVIRONMENT!=='TEST')throw Error('History belongs only in TEST');
 refreshGreekeeHistory_(ss);
 ['Fiona','Caleb'].forEach(person=>{
  const sheet=ss.getSheetByName(names_().dashboards[person]);if(!sheet)return;
  if(sheet.getRange('A58').getDisplayValues()[0][0]!=='GREEKEE  /  PAST ORDERS')return;
  updateHistoryDashboard_(sheet,person);
 });
}
function updateHistoryDashboard_(sheet,person){
 const source="'"+names_().orders.replace(/'/g,"''")+"'!",location=person==='Fiona'?'Punggol':'Hougang';
 sheet.getRange('P2').setFormula(bowlRankingFormula_(source,location));
 sheet.getRange('A3').setValue(location+' pickup + assigned deliveries  •  TEST queue + Q3 bowl history');
 sheet.getRange('A14').setValue('BOWL RANKING / Q3 + TEST  •  LIVE TEST ACTIVITY');
 sheet.getRange('A54').setValue(person+' • Named bowls include Q3 history and accepted/delivered TEST orders. Custom “Special Order” lines have no named bowl; other cards and charts show TEST only.');
 const criteria=source+'A2:A,"HISTORY:*",'+source+'C2:C,"'+location+'",'+source+'K2:K,';
 const formulas={
  A63:'=SUMIFS('+source+'G2:G,'+criteria+'"Delivered")',
  D63:'=SUMIFS('+source+'P2:P,'+criteria+'"Delivered")',
  G63:'=COUNTIFS('+criteria+'"Order accepted")',
  J63:'=SUMIFS('+source+'G2:G,'+source+'A2:A,"HISTORY:*",'+source+'C2:C,"'+location+'",'+source+'L2:L,"No charge")',
  P61:'=IFERROR(QUERY('+source+'A2:P,"select F,sum(G) where A starts with \'HISTORY:\' and C = \''+location+'\' and F is not null group by F label F \'\', sum(G) \'\'",0),{"No history",0})'
 };
 Object.keys(formulas).forEach(cell=>sheet.getRange(cell).setFormula(formulas[cell]));
 sheet.getRange('J62').setValue('COMPLIMENTARY BOWLS');
 for(let i=0;i<4;i++)sheet.getRange(i+61,19).setFormula(i<3?'=SUMIFS('+source+'P2:P,'+criteria+'"Delivered",'+source+'J2:J,">="&DATE(2026,'+(i+7)+',1),'+source+'J2:J,"<"&EDATE(DATE(2026,'+(i+7)+',1),1))':'=SUMIFS('+source+'P2:P,'+criteria+'"Delivered",'+source+'J2:J,"")');
}
function setupGreekeeSync(){
 const secret=PropertiesService.getScriptProperties().getProperty('SYNC_SECRET');
 if(!secret||secret.length<32)throw Error('Set a separate SYNC_SECRET of at least 32 characters first');
 const ss=SpreadsheetApp.openById(SPREADSHEET_ID);prepareOrders_(ss,true);if(ENVIRONMENT==='TEST')refreshGreekeeHistory_(ss);['Fiona','Caleb'].forEach(person=>{const dashboard=prepareDashboard_(ss,person);if(ENVIRONMENT==='TEST')addHistorySection_(dashboard,person);});
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
  const status=o.order_status==='completed'?'Delivered':o.order_status==='cancelled'?'Cancelled':o.payment_status==='paid'?'Order accepted':'Pending payment';
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
   sheet.getRange(row,9,1,2).setNumberFormat('ddd, d mmm');
  });
  SpreadsheetApp.flush();return reply({ok:true});
 }catch(error){console.error(String(error));return reply({ok:false,error:'Sync failed. Check Apps Script Executions for the reason.'});}
 finally{if(lock&&lock.hasLock())lock.releaseLock();}
}
