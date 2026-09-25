// Local adapter for the same handlers used by Vercel. No database simulation.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
try{process.loadEnvFile('.env.local');}catch{}
require('./build');
const root=path.resolve('public');
http.createServer(async(req,res)=>{
 const route=new URL(req.url,'http://localhost').pathname;
 if(/^\/api\/(orders|session|sync|config)$/.test(route)){
  let text='';for await(const chunk of req){text+=chunk;if(text.length>30000){res.writeHead(413);return res.end('Too large');}}
  req.body=text;return require('../api/'+route.split('/').pop())(req,res);
 }
 const file=path.resolve(root,'.'+decodeURIComponent(route)+(route.endsWith('/')?'index.html':''));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){res.writeHead(302,{Location:route+'/'});return res.end();}
 if(!fs.existsSync(file)){res.writeHead(404);return res.end('Not found');}
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
}).listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log('Greekee: http://127.0.0.1:'+(process.env.PORT||3000)));
