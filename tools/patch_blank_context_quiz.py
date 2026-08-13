from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

s = s.replace(
    '<h2>5. 语境互选测试</h2><p>英文例句选中文，中文概念选英文；不提前显示答案信息。</p>',
    '<h2>5. 语境互选测试</h2><p>例句挖空；答案只出现在选项里，英文单词与中文意思交替选择。</p>'
)

if 'function blankExample(w)' not in s:
    marker = 'function badExample(target,other)'
    helper = "function blankExample(w){let e=example(w),term=w[0],i=e.toLowerCase().indexOf(term.toLowerCase());if(i<0)return esc(e)+' <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>';return esc(e.slice(0,i))+'<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>'+esc(e.slice(i+term.length))}\n"
    if marker not in s:
        raise SystemExit('helper marker not found')
    s = s.replace(marker, helper + marker)

new_quiz = r'''function sentenceQuiz(){let it=sentenceItems(),d=cur(),box=$('sentenceQuiz');box.innerHTML='';let all=P.flatMap(x=>x.w.map(w=>({d:x.d,w})));it.forEach((x,i)=>{let chooseZh=(i+d.d)%2===0,correct=chooseZh?zhMain(x.w):x.w[0],pool=[...new Set(all.map(y=>chooseZh?zhMain(y.w):y.w[0]).filter(v=>v&&v!==correct))],opts=sh([correct,...sh(pool,'context-pool-'+x.id).slice(0,3)],'context-options-'+x.id),c=document.createElement('div');c.className='qcard';c.innerHTML=`<div class="qnum">${i+1} / ${it.length}</div><div class="qsentence">${blankExample(x.w)}</div><div class="choices"></div><div class="feedback"></div>`;opts.forEach(o=>{let b=document.createElement('button');b.className='choice';b.textContent=o;if(sqa[x.id]){b.disabled=true;if(o===correct)b.classList.add('correct');if(o===sqa[x.id]&&o!==correct)b.classList.add('wrong')}b.onclick=()=>{if(!sqa[x.id]){sqa[x.id]=o;sentenceQuiz()}};c.querySelector('.choices').appendChild(b)});if(sqa[x.id])c.querySelector('.feedback').textContent=sqa[x.id]===correct?'✅':'❌ 正确答案：'+correct;box.appendChild(c)});$('sentenceScore').textContent=it.filter((x,i)=>{let chooseZh=(i+d.d)%2===0,correct=chooseZh?zhMain(x.w):x.w[0];return sqa[x.id]===correct}).length+' / '+it.length}
function weakBox()'''

pattern = r'function sentenceQuiz\(\)\{.*?\}\nfunction weakBox\(\)'
s2, n = re.subn(pattern, new_quiz, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit(f'sentenceQuiz replacement count={n}')
s = s2

p.write_text(s, encoding='utf-8')
