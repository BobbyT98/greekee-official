const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

// Run the real storefront date helpers against fixed Singapore instants.
const html=fs.readFileSync('index.html','utf8');
const dateHelper=html.slice(html.indexOf('function toDateInputValue(d){'),html.indexOf('function formatTime(d){'));
const slotHelpers=html.slice(html.indexOf('function getPickupSlotsForDate(dateStr,'),html.indexOf('function refreshPickupDateConstraints(){'));
assert(dateHelper.startsWith('function toDateInputValue')&&slotHelpers.startsWith('function getPickupSlotsForDate'));
const {firstPickupDate,getPickupSlotsForDate}=vm.runInNewContext(dateHelper+slotHelpers+';({firstPickupDate,getPickupSlotsForDate})',{Date,Intl});

test('calendar starts with a day containing a slot at least 24 hours away',()=>{
 const early=new Date('2026-09-27T03:20:00Z'); // 11:20 AM Singapore
 assert.equal(firstPickupDate(early),'2026-09-28');
 assert.equal(getPickupSlotsForDate('2026-09-28',early)[0].toISOString(),'2026-09-28T03:30:00.000Z');
 const late=new Date('2026-09-27T15:20:00Z'); // 11:20 PM Singapore
 assert.equal(firstPickupDate(late),'2026-09-29');
 assert.equal(getPickupSlotsForDate('2026-09-28',late).length,0);
 assert.equal(getPickupSlotsForDate('2026-09-29',late)[0].toISOString(),'2026-09-29T02:00:00.000Z');
});
