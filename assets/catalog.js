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
    deliveryAreas:[
      ['Punggol','East',400,'Punggol'],['Sengkang','East',400,'Punggol'],['Hougang','East',400,'Hougang'],['Kovan','East',400,'Hougang'],['Buangkok','East',400,'Hougang'],
      ['Pasir Ris','East',600,'Punggol'],['Tampines','East',600,'Punggol'],['Bedok','East',600,'Punggol'],['Changi residential','East',600,'Punggol'],
      ['Yishun','North',1000,'Punggol'],['Woodlands','North',1000,'Punggol'],['Sembawang','North',1000,'Punggol'],['Bishan','North',1000,'Punggol'],['Ang Mo Kio','North',1000,'Punggol'],
      ['Toa Payoh','South',1000,'Punggol'],['City / CBD','South',1000,'Punggol'],['Queenstown','South',1000,'Punggol'],['Bukit Merah','South',1000,'Punggol'],
      ['Clementi','West',1000,'Punggol'],['Bukit Batok','West',1000,'Punggol'],['Jurong East','West',1000,'Punggol'],['Bukit Panjang','West',1000,'Punggol'],
      ['Jurong West','Special',1500,'Punggol'],['Tuas','Special',1500,'Punggol'],['Sentosa','Special',1500,'Punggol'],['Other / restricted location','Special',1500,'Punggol']
    ],
    eastFreeCents:3500, otherFreeCents:5000
  };
  if(typeof module==='object' && module.exports) module.exports=catalog;
  else root.GREEKEE_CATALOG=catalog;
})(typeof globalThis !== 'undefined' ? globalThis : this);
