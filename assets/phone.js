/* Country selection and phone formatting shared by checkout and staff forms. */
(function(root){
 'use strict';
 const lib=root.libphonenumber;
 if(!lib)throw Error('Phone validation is unavailable. Please reload.');
 const display=new Intl.DisplayNames(['en'],{type:'region'});
 const countries=lib.getCountries().map(code=>({code,label:`${display.of(code)} (+${lib.getCountryCallingCode(code)})`})).sort((a,b)=>a.label.localeCompare(b.label));
 const options=countries.map(c=>`<option value="${c.code}">${c.label.replaceAll('&','&amp;').replaceAll('<','&lt;')}</option>`).join('');
 function bind(country,input,existing=''){
  country.innerHTML=options;
  const parsed=existing?lib.parsePhoneNumberFromString(existing,'SG'):null;
  country.value=parsed?.country||'SG';
  input.value=parsed?.nationalNumber||existing;
  country.addEventListener('change',()=>{input.value='';input.placeholder=country.value==='SG'?'e.g. 9123 4567':'Phone number without country code';});
  input.placeholder=country.value==='SG'?'e.g. 9123 4567':'Phone number without country code';
 }
 function normalize(country,input){
  const raw=input.value.trim();
  if(!raw)throw Error('Please add a phone number.');
  if(!/^[\d\s().-]+$/.test(raw))throw Error('Enter the number without a country code; choose the country above.');
  const number=lib.parsePhoneNumberFromString(raw,country.value);
  if(!number?.isValid())throw Error(`Please check the phone number for ${display.of(country.value)} (including its length).`);
  return number.number;
 }
 root.GREEKEE_PHONE={bind,normalize};
})(window);
