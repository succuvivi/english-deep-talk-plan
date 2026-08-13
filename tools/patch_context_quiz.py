from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

old_head = '<h2>5. 例句选择测试 · 延展</h2><p>当天 10 词全部练，再混入旧词和弱词；选出最自然的真实用法。</p>'
new_head = '<h2>5. 语境互选测试</h2><p>英文例句选中文，中文概念选英文；不提前显示答案信息。</p>'
if old_head not in s:
    raise SystemExit('section heading not found')
s = s.replace(old_head, new_head)

old_css = '.example{margin-top:8px;padding-top:8px;border-top:1px dashed var(--line);color:#465064}.example b{color:var(--ink)}'
new_css = old_css + '.qsentence{font-size:17px;line-height:1.75;margin:8px 0 12px}.qsentence u{text-decoration-thickness:2px;text-underline-offset:4px;font-weight:850}.qnum{color:var(--muted);font-size:12px;margin-bottom:2px}'
if old_css in s:
    s = s.replace(old_css, new_css)
elif '.qsentence{' not in s:
    s = s.replace('.coll{color:var(--muted)}', '.coll{color:var(--muted)}.qsentence{font-size:17px;line-height:1.75;margin:8px 0 12px}.qsentence u{text-decoration-thickness:2px;text-underline-offset:4px;font-weight:850}.qnum{color:var(--muted);font-size:12px;margin-bottom:2px}')

marker = 'function badExample(target,other)'
helpers = '''function zhMain(w){return String(w[1]).split('；')[0].split(';')[0].trim()}\nfunction markedExample(w){let e=example(w),term=w[0],i=e.toLowerCase().indexOf(term.toLowerCase());if(i<0)return esc(e);return esc(e.slice(0,i))+'<u>'+esc(e.slice(i,i+term.length))+'</u>'+esc(e.slice(i+term.length))}\n'''
if 'function zhMain(w)' not in s:
    if marker not in s:
        raise SystemExit('helper marker not found')
    s = s.replace(marker, helpers + marker)

new_quiz = r'''function sentenceQuiz(){let it=sentenceItems(),d=cur(),box=$('sentenceQuiz');box.innerHTML='';let all=P.flatMap(x=>x.w.map(w=>({d:x.d,w})));it.forEach((x,i)=>{let enToZh=(i+d.d)%2===0,correct=enToZh?zhMain(x.w):x.w[0],pool=[...new Set(all.map(y=>enToZh?zhMain(y.w):y.w[0]).filter(v=>v&&v!==correct))],opts=sh([correct,...sh(pool,'context-pool-'+x.id).slice(0,3)],'context-options-'+x.id),c=document.createElement('div');c.className='qcard';c.innerHTML=`<div class="qnum">${i+1} / ${it.length}</div><div class="qsentence">${enToZh?markedExample(x.w):'<u>'+esc(zhMain(x.w))+'</u>'}</div><div class="choices"></div><div class="feedback"></div>`;opts.forEach(o=>{let b=document.createElement('button');b.className='choice';b.textContent=o;if(sqa[x.id]){b.disabled=true;if(o===correct)b.classList.add('correct');if(o===sqa[x.id]&&o!==correct)b.classList.add('wrong')}b.onclick=()=>{if(!sqa[x.id]){sqa[x.id]=o;sentenceQuiz()}};c.querySelector('.choices').appendChild(b)});if(sqa[x.id])c.querySelector('.feedback').textContent=sqa[x.id]===correct?'✅':'❌ 正确答案：'+correct;box.appendChild(c)});$('sentenceScore').textContent=it.filter((x,i)=>{let enToZh=(i+d.d)%2===0,correct=enToZh?zhMain(x.w):x.w[0];return sqa[x.id]===correct}).length+' / '+it.length}
function weakBox()'''

pattern = r'function sentenceQuiz\(\)\{.*?\}\nfunction weakBox\(\)'
s2, n = re.subn(pattern, new_quiz, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit(f'sentenceQuiz replacement count={n}')
s = s2

s = s.replace('完成例句选择延展测试。', '完成语境互选测试。')
p.write_text(s, encoding='utf-8')
