const fs=require('node:fs');
fs.rmSync('public',{recursive:true,force:true});fs.mkdirSync('public',{recursive:true});
for(const f of ['index.html','og-image.jpg'])fs.copyFileSync(f,'public/'+f);
for(const d of ['assets','admin'])fs.cpSync(d,'public/'+d,{recursive:true});
console.log('Built storefront and partner dashboard. Server code and setup files are excluded.');
