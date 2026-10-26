const $=id=>document.getElementById(id);let job=localStorage.getItem('job'),key,pollTimer;
async function api(path,body,headers={}){const r=await fetch('/api/'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...headers},body:body?JSON.stringify(body):undefined});const data=await r.json();if(!r.ok)throw Error(typeof data.error==='string'?data.error:JSON.stringify(data.error));return data;}
function error(e){$('state').textContent=e.message;}
function render(result){const root=$('result');root.replaceChildren();if(!result){root.textContent='Waiting for worker';return;}
 for(const provider of result.providers??[]){const p=document.createElement('p');p.textContent=`${provider.name}: ${provider.status} — ${provider.reason??''}`;root.append(p);}
 for(const message of result.warnings??[]){const p=document.createElement('p');p.textContent=message;root.append(p);}
 if(result.capability){const p=document.createElement('p');p.textContent=result.capability.nextAction;root.append(p);}
 // Provider text is always rendered as text. Raw tool output is never interpreted as HTML.
 const detail=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre');summary.textContent='Technical result';pre.textContent=JSON.stringify(result,null,2);detail.append(summary,pre);root.append(detail);
}
$('login').onsubmit=async e=>{e.preventDefault();try{await api('login',{password:new FormData(e.target).get('password')});e.target.reset();$('login').hidden=true;$('trip').hidden=false;$('state').textContent='Ready — each request checks worker capabilities';if(job)poll();}catch(e){error(e);}};
$('trip').addEventListener('input',()=>{key=undefined;});
$('trip').onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));const data={originAirport:f.originAirport,arrivalAirport:f.airport,departureAirport:f.airport,outboundDate:f.outboundDate,returnDate:f.returnDate,cityOrder:f.first==='makkah'?['makkah','madinah']:['madinah','makkah'],makkahNights:+f.makkahNights,madinahNights:+f.madinahNights,adults:+f.adults,rooms:+f.rooms,displayCurrency:f.displayCurrency,locale:'en',preferences:{checkedBaggagePreferred:f.baggage==='on'}};key=key??crypto.randomUUID();const button=e.submitter;button.disabled=true;try{const result=await api('jobs',data,{'Idempotency-Key':key});key=undefined;job=result.id;localStorage.setItem('job',job);poll();}catch(e){error(e);}finally{button.disabled=false;}};
async function poll(){clearTimeout(pollTimer);const current=job;try{const data=await api('jobs/'+current);if(current!==job)return;$('state').textContent=data.state==='running'?'Checking worker capabilities':data.state;render(data.result);const active=['queued','running'].includes(data.state);$('cancel').hidden=!active;if(active)pollTimer=setTimeout(poll,1000);}catch(e){error(e);}}
$('cancel').onclick=async()=>{try{await api('jobs/'+job+'/cancel',{});poll();}catch(e){error(e);}};

// Resume a valid signed session and its stored job after a page reload.
(async()=>{try{await api('session');$('login').hidden=true;$('trip').hidden=false;$('state').textContent='Ready — each request checks worker capabilities';if(job)poll();}catch{/* Sign-in form remains available. */}})();
