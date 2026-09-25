const {handler,send,origin,body,supa,staffFromToken,requireStaff,sessions,cookie,limit}=require('../lib/backend');
const {assert,text}=require('../lib/orders');
module.exports=handler(async(req,res)=>{
 if(req.method==='GET'){const staff=await requireStaff(req);return send(res,200,{staff});}
 assert(req.method==='POST','Method not allowed.',405);origin(req);const b=body(req);
 if(b.action==='logout'){
  const token=cookie(req,'gk_access');if(token)await supa('/auth/v1/logout?scope=local',{auth:true,method:'POST',headers:{Authorization:'Bearer '+token}}).catch(()=>{});
  sessions(res,null);return send(res,200,{ok:true});
 }
 assert(['login','refresh'].includes(b.action),'Invalid action.');await limit(req,'auth',15,900);
 let payload;
 if(b.action==='login'){assert(typeof b.password==='string'&&b.password.length>0&&b.password.length<=200,'Please enter your password.');payload={email:text(b.email,254,'email',true),password:b.password};}
 else {payload={refresh_token:cookie(req,'gk_refresh')};assert(payload.refresh_token,'Please sign in.',401);}
 const result=await supa('/auth/v1/token?grant_type='+(b.action==='login'?'password':'refresh_token'),{method:'POST',auth:true,body:payload});
 try {const staff=await staffFromToken(result.access_token);sessions(res,result);send(res,200,{staff});}catch(e){sessions(res,null);throw e;}
});
