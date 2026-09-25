const {handler,send,origin,requireStaff,supa}=require('../lib/backend');
const {assert}=require('../lib/orders');
const {enabled,syncOne}=require('../lib/sheets');
module.exports=handler(async(req,res)=>{
 assert(req.method==='POST','Method not allowed.',405);origin(req);const staff=await requireStaff(req);assert(enabled(),'Google Sheets sync has not been configured yet.',503);
 // PostgREST cannot compare two columns in a filter; the SQL view exposes dirty rows.
 const orders=await supa(`/rest/v1/greekee_unsynced_orders?location=in.(${staff.locations.join(',')})&select=*&order=updated_at.asc&limit=2`);
 const results=[];for(const order of orders)results.push(await syncOne(order));
 return send(res,200,{processed:results.length,failed:results.filter(r=>r.state!=='synced').length,more:orders.length===2});
});
