const {handler,send}=require('../lib/backend');
const {assert}=require('../lib/orders');
module.exports=handler(async(req,res)=>{assert(req.method==='GET','Method not allowed.',405);send(res,200,{capture_enabled:process.env.ORDER_CAPTURE_ENABLED==='true',sheets_configured:Boolean(process.env.SHEETS_SYNC_URL&&process.env.SHEETS_SYNC_SECRET)});});
