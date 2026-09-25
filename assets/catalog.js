/* Shared menu: prices are integer Singapore cents. Update here, then redeploy. */
(function (root) {
  const catalog = {
    version: '2026-09-24',
    products: [
      {id:'berry-bliss', name:'Berry Bliss', sheetName:'Berry Bliss', cents:890, kind:'signature'},
      {id:'sunset-dream', name:'Sunset Dream', sheetName:'Sunset Dream', cents:890, kind:'signature'},
      {id:'choco-nana', name:'Choco Nana', sheetName:'Choconana', cents:890, kind:'signature'},
      {id:'green-glow', name:'Green Glow', sheetName:'Green Glow', cents:890, kind:'signature'},
      ...[['plain','Plain strained',490],['berry','Berry',590],['matcha','Matcha',590],['milo','Milo',590],['protein','Protein',590]].map(([id,name,cents])=>({id:'base-'+id,name,sheetName:'Special Order',cents,kind:'custom'})),
      ...[['plain','Plain strained',290],['berry','Berry',390],['matcha','Matcha',390],['milo','Milo',390],['protein','Protein',390]].map(([id,name,cents])=>({id:'jy-'+id,name:'Just the Yogurt — '+name,sheetName:id==='plain'?'Plain':'Special Order',cents,kind:'yogurt'}))
    ],
    toppings:['Strawberry','Blueberry','Raspberry','Mango','Banana','Muscat grape','Granola','Choco balls','Biscoff crumbs','Honey drizzle','Berry sauce','Coconut milk','Choco sauce','Condensed milk','Biscoff sauce'],
    toppingCents:100, minCustomToppings:3, minYogurtQty:2,
    whatsapp:{Punggol:'6581864984',Hougang:'6590252477'},
    east:[['Pasir Ris',600,'Punggol'],['Tampines',600,'Punggol'],['Sengkang',400,'Punggol'],['Punggol',400,'Punggol'],['Hougang',400,'Hougang'],['Kovan',400,'Hougang'],['Buangkok',400,'Hougang']],
    eastFreeCents:3500, otherFreeCents:5000, otherDeliveryCents:1000
  };
  if(typeof module==='object' && module.exports) module.exports=catalog;
  else root.GREEKEE_CATALOG=catalog;
})(typeof globalThis !== 'undefined' ? globalThis : this);
