const $=id=>document.getElementById(id);
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600);}
let DB=JSON.parse(localStorage.getItem('jp_nova')||'{"profile":{},"apps":[]}');
const save=()=>localStorage.setItem('jp_nova',JSON.stringify(DB));
if(DB.profile.name){$('pName').value=DB.profile.name||'';$('pEmail').value=DB.profile.email||'';$('pPhone').value=DB.profile.phone||'';$('pTitle').value=DB.profile.title||'';$('pSkills').value=DB.profile.skills||'';$('pCv').value=DB.profile.cv||'';}
$('saveP').onclick=()=>{DB.profile={name:$('pName').value,email:$('pEmail').value,phone:$('pPhone').value,title:$('pTitle').value,skills:$('pSkills').value,cv:$('pCv').value};save();toast('Pilot saved ✓');boom(60);};
$('notifBtn').onclick=async()=>{try{await Notification.requestPermission();toast('Alerts ON 🔔');}catch(e){}};
function notify(t,b){if(Notification.permission==='granted')new Notification(t,{body:b});toast(b);};

const cv=$('confetti'),cx=cv.getContext('2d');let parts=[];
function size(){cv.width=innerWidth;cv.height=innerHeight;}size();addEventListener('resize',size);
function boom(n=120){const c=['#A3E635','#8B5CF6','#22D3EE','#fff'];for(let i=0;i<n;i++)parts.push({x:innerWidth/2,y:innerHeight/2,vx:(Math.random()-.5)*12,vy:Math.random()*-10-2,g:.3,col:c[i%4],l:80+Math.random()*40});}
(function loop(){cx.clearRect(0,0,cv.width,cv.height);parts=parts.filter(p=>p.l>0);parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.l--;cx.fillStyle=p.col;cx.fillRect(p.x,p.y,6,6);});requestAnimationFrame(loop);})();

let jobs=[],current=null;
async function load(q='developer'){
  $('jobs').innerHTML='<p style="color:#94a3b8">Scanning galaxies for '+q+'...</p>';
  let out=[];
  try{
    const r=await fetch('https://remotive.com/api/remote-jobs?search='+encodeURIComponent(q));
    const j=await r.json();
    out.push(...(j.jobs||[]).slice(0,12).map(x=>({
      id:'r'+x.id,
      title:x.title||'Untitled Role',
      co:x.company_name||'Unknown Co',
      loc:x.candidate_required_location||'Remote',
      url:x.url||'https://remoteok.com/',
      src:'Remotive'
    })));
  }catch(e){}
  try{
    const r2=await fetch('https://www.arbeitnow.com/api/job-board-api');
    const j2=await r2.json();
    let d=j2.data||[];
    if(q) d=d.filter(x=>((x.title||'')+(x.company||'')+(x.location||'')).toLowerCase().includes(q.toLowerCase()));
    out.push(...d.slice(0,10).map((x,i)=>({
      id:'a'+i,
      title:x.title||'Untitled Role',
      co:x.company||'Unknown Co',
      loc:x.location||'Remote',
      url:x.url||'https://www.linkedin.com/jobs/',
      src:'Arbeitnow'
    })));
  }catch(e){}
  if(!out.length) out=[
    {id:'d1',title:'Junior Frontend Dev',co:'Nairobi Tech',loc:'Nairobi • Hybrid',url:'https://www.linkedin.com/jobs/',src:'NOVA'},
    {id:'d2',title:'Python Intern',co:'M-Pesa Labs',loc:'Remote',url:'https://remoteok.com/',src:'NOVA'}
  ];
  jobs=out;renderJobs();
}

function renderJobs(){
  $('stFound').textContent=jobs.length;
  const apps=DB.apps;
  $('stApplied').textContent=apps.length;
  $('pipeTag').textContent=apps.length+' applied';
  $('stInter').textContent=apps.filter(a=>a.stage==='Interview').length;
  const r=apps.length?Math.round(apps.filter(a=>a.stage==='Interview').length/apps.length*100):0;
  $('rateTxt').textContent=r+'%';$('rateFill').style.width=r+'%';
  $('jobs').innerHTML=jobs.map(j=>{
    const coSafe=j.co||'NOVA';
    const init=coSafe.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const ap=apps.find(a=>a.id===j.id);
    return `<div class="job"><span class="badge">${j.src||'NOVA'} • ${j.loc||'Remote'}</span><h4>${j.title||'Untitled'}</h4><small><span style="display:inline-grid;place-items:center;width:24px;height:24px;background:linear-gradient(135deg,#8B5CF6,#22D3EE);border-radius:8px;font-weight:800">${init}</span> ${coSafe}</small><div class="row"><button class="ghost-btn" onclick="saveJob('${j.id}')">💾</button><button onclick="openApply('${j.id}')">⚡ Apply</button></div>${ap?'<small>✅ '+ap.stage+'</small>':''}</div>`;
  }).join('');
  const mk=s=>apps.filter(a=>a.stage===s).map(a=>`<div class="pill2"><b>${a.title}</b><br><small>${a.co}</small><br><button class="mini" onclick="moveStage('${a.id}')">→</button> <button class="mini" onclick="delApp('${a.id}')">x</button></div>`).join('')||'<small style="color:#64748b">empty</small>';
  $('kSaved').innerHTML=mk('Saved');$('kApplied').innerHTML=mk('Applied');$('kInter').innerHTML=mk('Interview');
}

window.saveJob=id=>{const j=jobs.find(x=>x.id===id);if(DB.apps.find(a=>a.id===id))return toast('Already in pipeline');DB.apps.push({id:j.id,title:j.title,co:j.co,url:j.url,stage:'Saved',date:new Date().toLocaleDateString()});save();renderJobs();toast('Saved 💾');};
window.openApply=id=>{
  const j=jobs.find(x=>x.id===id);current=j;
  if(!DB.profile.name)return toast('Save Pilot first!');
  $('mTitle').textContent=j.title;$('mCo').textContent=j.co+' • '+j.loc;
  $('mLetter').value=`Hi ${j.co} team,\nI'm ${DB.profile.name}, ${DB.profile.title||'applicant'} skilled in ${DB.profile.skills||'relevant skills'}.\n${DB.profile.cv||'Fast learner, ready to deliver.'}\nI'd love to crush the ${j.title} role.\n\n${DB.profile.email} | ${DB.profile.phone}`;
  $('applyModal').classList.remove('hidden');
};
$('mClose').onclick=()=>$('applyModal').classList.add('hidden');
$('mConfirm').onclick=()=>{
  const j=current;window.open(j.url,'_blank');
  const ex=DB.apps.find(a=>a.id===j.id);
  if(ex)ex.stage='Applied';else DB.apps.push({id:j.id,title:j.title,co:j.co,url:j.url,stage:'Applied',date:new Date().toLocaleDateString()});
  save();renderJobs();$('applyModal').classList.add('hidden');boom(150);
  notify('Application success ✅',j.title+' @ '+j.co);
  window.open('https://wa.me/254741709442?text='+encodeURIComponent(`NOVA ✅ Applied!\n${j.title} @ ${j.co}\n${j.url}\nBy ${DB.profile.name}`),'_blank');
};
window.moveStage=id=>{const a=DB.apps.find(x=>x.id===id);a.stage=a.stage==='Saved'?'Applied':a.stage==='Applied'?'Interview':'Applied';save();renderJobs();};
window.delApp=id=>{DB.apps=DB.apps.filter(a=>a.id!==id);save();renderJobs();};
$('searchBtn').onclick=()=>load($('q').value||'developer');
document.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>{$('q').value=b.dataset.f;load(b.dataset.f);});
$('waReport').onclick=()=>{if(!DB.apps.length)return toast('Apply first!');window.open('https://wa.me/254741709442?text='+encodeURIComponent('NOVA Report\n'+DB.apps.map(a=>`• ${a.title} @ ${a.co} [${a.stage}]`).join('\n')),'_blank');};
load('developer');

const msgs=$('botMsgs');
$('botBtn').onclick=()=>{$('botWin').classList.toggle('hidden');if(!msgs.children.length)msgs.innerHTML+=`<div class="msg bot">NovaBot ✦ online. You have <b>${DB.apps.length}</b> missions. Ask <b>win / cover / interview</b>.</div>`;};
$('botX').onclick=()=>$('botWin').classList.add('hidden');
function breply(q){q=q.toLowerCase();if(q.includes('win')||q.includes('hire'))return `Win protocol: search daily → Apply with custom letter → move to Interview on reply. Rate: ${$('rateTxt').textContent}.`;if(q.includes('cover'))return `I write it from your Pilot Profile. Keep skills + 1 win + contacts.`;if(q.includes('interview'))return `Prep: research ${current?current.co:'company'}, 3 STAR stories, ask about growth.`;return `Try: win / cover / interview.`;}
$('botSend').onclick=()=>{const i=$('botIn');if(!i.value.trim())return;msgs.innerHTML+=`<div class="msg">You: ${i.value}</div>`;let q=i.value;i.value='';setTimeout(()=>{msgs.innerHTML+=`<div class="msg bot">${breply(q)}</div>`;msgs.scrollTop=9999;},400);};