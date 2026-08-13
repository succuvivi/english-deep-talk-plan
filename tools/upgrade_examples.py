from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

repls = [
    ('+ 场景题 + 2 秒主动回忆 + Deep Talk。', '+ 场景题 + 2 秒主动回忆 + 例句选择测试。'),
    ('<section class="panel"><div class="title"><div><h2>5. Deep Talk 输出</h2><p>不用背范文；用至少 3 个目标表达说 1–2 分钟。</p></div></div><div class="deep" id="deep"></div><div class="chips" id="chips"></div><textarea id="notes" placeholder="写 3–6 个英文要点，或者直接开口说。内容只保存在当前浏览器。"></textarea><div class="actions"><button class="btn" id="save">保存要点</button><button class="btn" id="sayQ">🔊 听题目</button></div></section>', '<section class="panel"><div class="title"><div><h2>5. 例句选择测试 · 延展</h2><p>当天 10 词全部练，再混入旧词和弱词；选出最自然的真实用法。</p></div><span class="score" id="sentenceScore">0 / 0</span></div><div class="list" id="sentenceQuiz"></div></section>'),
    ('做完选择题；至少 8 个词 2 秒内想起；完成到期复习；做一次 Deep Talk。', '做完选择题；至少 8 个词 2 秒内想起；完成到期复习；完成例句选择延展测试。'),
    ('进度、弱词和笔记只保存在当前浏览器 localStorage，不会上传个人学习记录。', '进度和弱词只保存在当前浏览器 localStorage，不会上传个人学习记录。'),
    ("let S=load(),sel=initial(),qa={},ra={},rva={},tt;", "let S=load(),sel=initial(),qa={},ra={},rva={},sqa={},tt;"),
    ("sel=d.d;qa={};ra={};rva={};render();", "sel=d.d;qa={};ra={};rva={};sqa={};render();"),
    ("sel=initial();qa={};ra={};rva={};render()", "sel=initial();qa={};ra={};rva={};sqa={};render()"),
]
for old, new in repls:
    if old not in s:
        raise SystemExit('missing expected text: ' + old[:80])
    s = s.replace(old, new)

css_old = '.word h3{font-size:21px;margin:4px 0}.word p{margin:4px 0}.coll{color:var(--muted)}'
css_new = '.word h3{font-size:21px;margin:4px 0}.word p{margin:4px 0}.coll{color:var(--muted)}.example{margin:10px 0!important;padding:9px 10px;background:#f8fafc;border-left:3px solid var(--brand);border-radius:9px;color:#3d4657}.example b{color:var(--brand)}'
if css_old not in s:
    raise SystemExit('missing css anchor')
s = s.replace(css_old, css_new)

anchor = "function weak(d,w){return S.weak[key(d,w)]}"
helpers = r'''function fillColl(c){return c.split('/')[0].trim().replace(/that\.\.\./gi,'that I was wrong').replace(/how to\.\.\./gi,'how to fix it').replace(/on\.\.\./gi,'on Friday').replace(/after\.\.\./gi,'after work').replace(/with\.\.\./gi,'with my friends').replace(/about\.\.\./gi,'about the plan').replace(/for\.\.\./gi,'for the weekend').replace(/from\.\.\./gi,'from my friend').replace(/by\.\.\./gi,'by Friday').replace(/at\.\.\./gi,'at 8 a.m.').replace(/in\.\.\./gi,'in Bangkok').replace(/to\.\.\./gi,'to do it').replace(/doing\.\.\./gi,'doing it').replace(/\.\.\./g,'it').replace(/\bsth\b/gi,'it').replace(/\bsomeone\b/gi,'my friend')}
function example(w){let word=w[0],c=fillColl(w[2]),low=c.toLowerCase(),fixed={realize:'I realized that I left my keys at home.',assume:'I assumed he was busy, so I did not call.',handle:'I can handle this problem by myself.',hesitate:'Do not hesitate to ask if you need help.',afford:'I cannot afford a new apartment right now.',mention:'She mentioned that she might move next month.',awkward:'There was an awkward silence after my question.',reliable:'She is reliable, so I trust her with important things.',option:'Taking the train is another option.',perspective:'From my perspective, clear communication matters most.',available:'I am available on Friday evening.',schedule:'I checked my schedule before making plans.',free:'I am free after work today.',busy:'I am busy with work this afternoon.',reschedule:'Can we reschedule the meeting for tomorrow?',confirm:'Please confirm the time before you leave.',cancel:'I had to cancel our plan because I felt sick.',convenient:'Six o’clock is a convenient time for me.','plan ahead':'I like to plan ahead for busy weeks.',order:'I would like to order the chicken, please.',recommend:'Can you recommend a dish that is not too spicy?',spicy:'This curry is a little too spicy for me.',mild:'I prefer a mild flavor when I am tired.',bill:'Could we have the bill, please?',split:'Let us split the bill equally.',takeaway:'Can I get this takeaway, please?',full:'I am full, so I do not need dessert.'};if(fixed[word])return fixed[word];if(/^be /i.test(c))return "I'm "+c.slice(3)+'.';if(/^feel /i.test(c))return 'I '+c+' today.';if(/^get (a|an) /i.test(c))return 'Can I '+c+', please?';if(/^a |^an /i.test(c))return 'It is '+c+'.';if(/^another /i.test(c))return 'I need '+c+'.';if(/^the /i.test(c))return 'This is '+c+'.';if(/^too /i.test(c))return 'It is '+c+' for me.';if(/^my /i.test(c)){if(/\b(hurts|works|feels|looks|is|are|was|were|has|have)\b/i.test(c))return c.charAt(0).toUpperCase()+c.slice(1)+'.';return 'I talked about '+c+' yesterday.'}if(/^show your /i.test(c))return 'Please '+c+' at the counter.';if(/^ask for /i.test(c))return 'I usually '+c+' politely.';if(/^somewhere nearby/i.test(c))return 'Let us meet '+c+'.';if(/^really /i.test(c))return 'He was '+c+'.';if(/^just chill/i.test(c))return 'I '+c+' at home after work.';if(/^low battery/i.test(c))return 'My phone has a '+c+'.';if(/^heavy traffic/i.test(c))return 'There was '+c+' this morning.';if(/^weak signal/i.test(c))return 'There is a '+c+' in this area.';if(/^awkward silence/i.test(c))return 'There was an '+c+'.';if(/^bank transfer/i.test(c))return 'I paid by '+c+'.';if(/^final destination/i.test(c))return 'Bangkok is my '+c+'.';if(/^top priority/i.test(c))return 'This is my '+c+'.';if(/^technical issue/i.test(c))return 'We had a '+c+' this morning.';if(/^boarding gate/i.test(c))return 'I am waiting at the '+c+'.';if(/^good point/i.test(c))return 'That is a '+c+'.';if(/^fair price/i.test(c))return 'That seems like a '+c+'.';if(/^water leak/i.test(c))return 'There is a '+c+' in the bathroom.';if(/^next-door neighbor/i.test(c))return 'I talked to my '+c+' yesterday.';if(/^(quiet|noisy|friendly|close|flexible|urgent|comfortable|affordable|expensive|reliable) /i.test(c))return 'It is '+c+'.';if(/^I\b/.test(c))return c.endsWith('.')?c:c+'.';return 'I usually '+c+'.'}
function badExample(target,other){let s=example(other),ow=other[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),r=new RegExp(ow,'i');if(r.test(s))return s.replace(r,target[0]);return 'I usually '+target[0]+' '+fillColl(other[2])+'.'}
'''+anchor
if anchor not in s:
    raise SystemExit('missing helper anchor')
s = s.replace(anchor, helpers)

old_words = "<p class=\"coll\">搭配：<b>${esc(w[2])}</b></p><button class=\"btn small wk\">"
new_words = "<p class=\"coll\">搭配：<b>${esc(w[2])}</b></p><p class=\"example\"><b>例句：</b>${esc(example(w))}</p><button class=\"btn small wk\">"
if old_words not in s:
    raise SystemExit('missing words markup')
s = s.replace(old_words, new_words)

old_deep = "function deep(){let d=cur(),x=ds(d.d);$('deep').textContent=d.q;$('chips').innerHTML=d.targets.map(x=>'<span>'+esc(x)+'</span>').join('');$('notes').value=x.notes||''}"
new_deep = r'''function sentenceItems(){let d=cur(),out=d.w.map((w,i)=>({id:'today'+d.d+'-'+i,label:'今日',src:d.d,w})),pool=[];[1,2,6].forEach(off=>{let src=by.get(d.d-off);if(src)sh(src.w,'sentence'+d.d+'-'+off).slice(0,3).forEach((w,i)=>pool.push({id:'old'+src.d+'-'+i,label:off+'D复习',src:src.d,w}))});Object.values(S.weak).forEach((x,i)=>{let src=by.get(x.d),w=src&&src.w.find(z=>z[0]===x.w);if(w)pool.unshift({id:'weak-s'+x.d+'-'+i,label:'弱词',src:x.d,w})});let seen=new Set(out.map(x=>x.src+':'+x.w[0]));for(const x of pool){let k=x.src+':'+x.w[0];if(!seen.has(k)&&out.length<15){seen.add(k);out.push(x)}}return out}
function sentenceQuiz(){let it=sentenceItems(),d=cur(),box=$('sentenceQuiz');box.innerHTML='';let all=P.flatMap(x=>x.w.map(w=>({d:x.d,w})));it.forEach((x,i)=>{let others=sh(all.filter(y=>y.w[0]!==x.w[0]),'sentence-options'+x.id).slice(0,3),correct=example(x.w),opts=sh([correct,...others.map(y=>badExample(x.w,y.w))],'sentence-shuffle'+x.id),c=document.createElement('div');c.className='qcard';c.innerHTML=`<span class="label">${x.label}</span><small>Day ${x.src}</small><div class="question">${i+1}. ${esc(x.w[0])} · ${esc(x.w[1])}</div><div class="hint">哪一句使用这个词/短语最自然？</div><div class="choices"></div><div class="feedback"></div>`;opts.forEach(o=>{let b=document.createElement('button');b.className='choice';b.textContent=o;if(sqa[x.id]){b.disabled=true;if(o===correct)b.classList.add('correct');if(o===sqa[x.id]&&o!==correct)b.classList.add('wrong')}b.onclick=()=>{if(!sqa[x.id]){sqa[x.id]=o;sentenceQuiz()}};c.querySelector('.choices').appendChild(b)});if(sqa[x.id])c.querySelector('.feedback').textContent=sqa[x.id]===correct?'✅ 正确：这是最自然的用法。':'❌ 更自然：'+correct;box.appendChild(c)});$('sentenceScore').textContent=it.filter(x=>sqa[x.id]===example(x.w)).length+' / '+it.length}'''
if old_deep not in s:
    raise SystemExit('missing deep function')
s = s.replace(old_deep, new_deep)

old_render = 'function render(){rail();head();words();quiz();recall();reviews();deep();weakBox();stats()}'
new_render = 'function render(){rail();head();words();quiz();recall();reviews();sentenceQuiz();weakBox();stats()}'
if old_render not in s:
    raise SystemExit('missing render')
s = s.replace(old_render, new_render)

old_handlers = "$('start').onclick=()=>{ds(sel).started=Date.now();save();render();toast('开始时间已记录')};$('done').onclick=complete;$('topDone').onclick=complete;$('today').onclick=()=>{sel=initial();qa={};ra={};rva={};sqa={};render()};$('save').onclick=()=>{ds(sel).notes=$('notes').value.trim();save();toast('要点已保存到本机')};$('sayQ').onclick=()=>speak(cur().q);$('reset').onclick=()=>{if(confirm('清除当前浏览器里的进度、弱词和笔记？')){localStorage.removeItem(K);location.reload()}};render()})();"
new_handlers = "$('start').onclick=()=>{ds(sel).started=Date.now();save();render();toast('开始时间已记录')};$('done').onclick=complete;$('topDone').onclick=complete;$('today').onclick=()=>{sel=initial();qa={};ra={};rva={};sqa={};render()};$('reset').onclick=()=>{if(confirm('清除当前浏览器里的进度和弱词？')){localStorage.removeItem(K);location.reload()}};render()})();"
if old_handlers not in s:
    raise SystemExit('missing handlers')
s = s.replace(old_handlers, new_handlers)

p.write_text(s, encoding='utf-8')
print('index.html upgraded')
