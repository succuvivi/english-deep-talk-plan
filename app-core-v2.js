var P=window.P||[],LX=window.LX||{},future=P.filter(x=>x.d>=4),by=new Map(P.map(x=>[x.d,x])),K='englishDeepTalk.v3';
var S=load(),sel=initial(),mqa={},qa={},ra={},rva={},sqa={},ms={left:null,right:null,done:{}},tt;
var $=id=>document.getElementById(id);
function load(){try{return JSON.parse(localStorage.getItem(K))||{days:{},weak:{}}}catch{return{days:{},weak:{}}}}
function save(){localStorage.setItem(K,JSON.stringify(S))}
function ds(n){return S.days[n]||(S.days[n]={})}
function key(d,w){return d+':'+w[0]}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function zhMain(w){return String(w[1]).split(/[；;]/)[0].trim()}
function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function initial(){let t=today(),x=P.find(d=>d.date===t)||future.find(d=>d.date>=t);return(x||future.at(-1)||P[0]).d}
function cur(){return by.get(sel)}
function toast(s){let x=$('toast');x.textContent=s;x.className='toast show';clearTimeout(tt);tt=setTimeout(()=>x.className='toast',1600)}
function sh(a,seed){a=[...a];let s=0;for(const c of String(seed))s=(s*31+c.charCodeAt())>>>0;for(let i=a.length-1;i;i--){s=(1664525*s+1013904223)>>>0;let j=s%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function speak(s){if(!window.speechSynthesis)return toast('当前浏览器不支持语音');let u=new SpeechSynthesisUtterance(s);u.lang='en-US';u.rate=.86;window.speechSynthesis.cancel();window.speechSynthesis.speak(u)}
function resetTransient(){mqa={};qa={};ra={};rva={};sqa={};ms={left:null,right:null,done:{}}}
function weak(d,w){return S.weak[key(d,w)]}
function addWeak(d,w){S.weak[key(d,w)]={d,w:w[0],zh:w[1],ok:0,last:Date.now()};save()}
function goodWeak(d,w){let k=key(d,w),x=S.weak[k];if(!x)return;x.ok=(x.ok||0)+1;x.last=Date.now();if(x.ok>=3)delete S.weak[k];save()}
function oneHour(d){let x=ds(d.d);return x.started&&Date.now()-x.started>=3600000}
function rail(){let box=$('days');box.innerHTML='';P.forEach(d=>{let b=document.createElement('button');b.className='day'+(d.d===sel?' active':'')+(ds(d.d).done?' done':'');b.innerHTML=`<b>Day ${d.d}</b><small>${d.date.slice(5)}</small>`;b.onclick=()=>{sel=d.d;resetTransient();render();scrollTo({top:box.offsetTop-8,behavior:'smooth'})};box.appendChild(b)});requestAnimationFrame(()=>box.querySelector('.active')?.scrollIntoView({inline:'center',block:'nearest'}))}
function head(){let d=cur(),x=ds(d.d),t=today();$('meta').textContent=`Day ${d.d} · ${d.date}${d.date===t?' · 今天':''}`;$('theme').textContent=d.t;$('sub').textContent=d.sub;let s=$('status');s.className='badge'+(x.done?' done':x.started?' go':'');s.textContent=x.done?'已完成':x.started?'训练中':d.date>t?'可提前练':'未开始';$('start').textContent=x.started?'重新计时 1H':'开始今天训练';$('startHint').textContent=x.started?(oneHour(d)?'1H 复习已到期，会显示在“到期复习”。':'已记录开始时间；1 小时后出现同日 1H 复习。'):'开始后记录本机时间，1 小时后自动生成同日复习。'}
function words(){let d=cur(),box=$('words');box.innerHTML='';d.w.forEach((w,i)=>{let lx=LX[w[0]]||{},c=document.createElement('div');c.className='word'+(weak(d.d,w)?' weak':'');c.innerHTML=`<button class="speak">🔊</button><small>${String(i+1).padStart(2,'0')}</small><h3>${esc(w[0])}${lx.pos?' <span class="pos">'+esc(lx.pos)+'</span>':''}</h3><p>${esc(w[1])}</p>${lx.memory?'<div class="memory"><b>记忆：</b>'+esc(lx.memory)+'</div>':''}<p class="coll">搭配：<b>${esc(lx.collocation||w[2])}</b></p>${lx.example?'<p class="example"><b>例句：</b>'+esc(lx.example)+'</p>':''}${lx.exampleZh?'<p class="examplezh"><b>中文：</b>'+esc(lx.exampleZh)+'</p>':''}<button class="btn small wk">${weak(d.d,w)?'✓ 已在弱词池':'加入弱词'}</button>`;c.querySelector('.speak').onclick=()=>speak(w[0]);c.querySelector('.wk').onclick=()=>{let k=key(d.d,w);if(S.weak[k])delete S.weak[k];else addWeak(d.d,w);save();render()};box.appendChild(c)})}
