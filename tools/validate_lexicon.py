from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]

def load_js(path,prefix):
    text=path.read_text(encoding='utf-8').strip()
    if not (text.startswith(prefix) and text.endswith(';')):
        raise AssertionError(f'{path.name} format invalid')
    return json.loads(text[len(prefix):-1])

plan=load_js(ROOT/'plan.js','window.P=')
lx=load_js(ROOT/'lexicon.js','window.LX=')
words=[w for d in plan for w in d['w']]
missing=[w[0] for w in words if w[0] not in lx]
assert not missing, f'missing lexicon entries: {missing[:10]}'
for w in words:
    word=w[0]; e=lx[word]
    for k in ['pos','memory','example','exampleZh','collocation','cloze','clozeAnswer']:
        assert str(e.get(k,'')).strip(), f'{word}: missing {k}'
    assert e['clozeAnswer']==word, f'{word}: wrong clozeAnswer'
    conf=e.get('confusers',[]); opts=e.get('clozeOptions',[])
    assert len(conf)==3 and len(set(conf))==3 and word not in conf, f'{word}: bad confusers'
    assert len(opts)==4 and len(set(opts))==4 and opts.count(word)==1, f'{word}: bad cloze options'
    assert '______' in e['cloze'], f'{word}: cloze has no blank'
    assert e['cloze'] != e['example'], f'{word}: cloze duplicates example'
    assert len(e.get('collocationParts',[]))==2 and '___' in e['collocationParts'][1], f'{word}: bad collocation parts'
print(f'lexicon validation passed: {len(lx)} entries / {len(words)} plan rows')
