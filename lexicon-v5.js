(()=>{
const P=window.P||[], allRows=P.flatMap(d=>(d.w||[]).map((w,i)=>({d:d.d,w,i})));
const zhMain=s=>String(s||'').split(/[；;]/)[0].trim();
const posMap={n:'n.',adj:'adj.',v:'v./v. phr.',phr:'phr.',adv:'adv.'};
const cap=s=>s?String(s).charAt(0).toUpperCase()+String(s).slice(1):'';
const SPECIAL={
  'fair enough':'Fair enough, but I would still compare the two options first.',
  'that makes sense':'That makes sense, especially if you need more time to decide.',
  "I get where you're coming from":"I get where you're coming from, but I see the risk differently.",
  'come to think of it':'Come to think of it, we never actually confirmed the date.',
  'as far as I know':'As far as I know, the policy has not changed yet.',
  'from what I understand':'From what I understand, the change only affects new customers.',
  'to be fair':'To be fair, she did warn us that the deadline was tight.',
  'in other words':'In other words, we need a cheaper way to get the same result.',
  'speaking of which':'Speaking of which, have you booked your flight yet?',
  'at least':'At least we know what caused the problem now.',
  'all of a sudden':'All of a sudden, everyone in the room went quiet.',
  'meanwhile':'Meanwhile, I called the hotel to explain the delay.',
  'at one point':'At one point, I seriously considered leaving early.',
  'out of nowhere':'The question came out of nowhere and caught me off guard.',
  'by the time':'By the time we arrived, everyone else had already eaten.',
  'afterward':'Afterward, we talked about what had gone wrong.',
  'before I knew it':'Before I knew it, two hours had passed.',
  'looking back':'Looking back, I would probably make the same decision again.',
  'from my standpoint':'From my standpoint, timing is a bigger issue than cost.',
  'when it comes to':'When it comes to money, I prefer a clear and realistic plan.',
  'for the most part':'For the most part, the move went more smoothly than expected.',
  'having said that':'Having said that, I still understand why some people disagree.',
  'to put it another way':'To put it another way, the problem is consistency rather than effort.',
  'in the long run':'In the long run, the more sustainable option usually wins.',
  'to some extent':'To some extent, I agree with that point.',
  'from my point of view':'From my point of view, flexibility matters more than perfection.',
  'what I mean is':'What I mean is, I need more information before I commit.',
  'on balance':'On balance, the experience has been more positive than difficult.',
  'at the same time':'At the same time, I can see why stability matters.'
};
function safeCue(term,coll){let a=String(coll),i=a.toLowerCase().indexOf(String(term).toLowerCase());if(i<0)return '___';let cue=a.slice(0,i)+'___'+a.slice(i+String(term).length);return cue.toLowerCase().includes(String(term).toLowerCase())?'___':cue}
function exampleFor(term,coll,kind,i){if(SPECIAL[term])return SPECIAL[term];
  if(kind==='v'||kind==='n'){
    const t=[`You might ${coll} in a situation like this.`,`Sometimes people ${coll}.`,`In practice, you may ${coll}.`,`Depending on the context, you might ${coll}.`,`It is possible to ${coll} when the situation requires it.`];return t[i%t.length]
  }
  if(kind==='adj'){
    const lower=coll.toLowerCase();
    if(term==='true to size')return 'This brand is usually true to size.';
    if(term==='overpriced')return 'Some products can feel overpriced even when the design is attractive.';
    if(term==='good value')return 'A basic model can still be good value for money.';
    if(term==='eligible for a refund')return 'A damaged item may be eligible for a refund under the policy.';
    if(term==='utilities included')return 'A rental can have utilities included in the monthly payment.';
    if(term==='sweltering')return 'Some people find the afternoon sweltering during the hottest months.';
    if(term==='spacious')return 'A well-designed studio can feel surprisingly spacious.';
    if(term==='cramped')return 'A small kitchen can feel cramped when several people are cooking.';
    if(term==='reasonable')return 'That can seem like a reasonable compromise in the circumstances.';
    if(term==='worthwhile')return 'The effort can be worthwhile in the long run.';
    if(lower.startsWith('prefer '))return `Some people ${coll}.`;
    if(lower.startsWith('find '))return `Some people ${coll}.`;
    if(lower.startsWith('taste '))return `The dish can ${coll}.`;
    if(lower.startsWith('offer '))return `Some places ${coll}.`;
    if(lower.startsWith('return '))return `You can ${coll}.`;
    if(lower.startsWith('fit '))return `This brand tends to ${coll}.`;
    if(lower.startsWith('rent '))return `You can ${coll}.`;
    if(lower.startsWith('make '))return `Sometimes people ${coll}.`;
    if(lower.startsWith('keep '))return `You can ${coll}.`;
    if(lower.startsWith('feel '))return `People can ${coll}.`;
    if(lower.startsWith('seem '))return `Someone can ${coll}.`;
    if(lower.startsWith('come across '))return `Someone can ${coll} at first.`;
    if(lower.startsWith('stay '))return `It helps to ${coll}.`;
    if(lower.startsWith('become '))return `People can ${coll}.`;
    if(lower.startsWith('look '))return `An injury can ${coll}.`;
    if(lower.startsWith('remain '))return `It is reasonable to ${coll}.`;
    if(lower.startsWith('sound '))return `A sincere reply can ${coll}.`;
    if(lower.startsWith('be '))return `Someone can ${coll}.`;
    return `The word “${term}” is natural in the phrase “${coll}.”`
  }
  if(kind==='adv'||kind==='phr')return `${cap(term)}, I would still check the context before deciding.`;
  return `The expression “${term}” is useful in everyday conversation.`
}
const currentRows=allRows.filter(x=>x.d>=4&&x.d<=33), byKind={};
currentRows.forEach(x=>{let k=x.w[4]||'phr';(byKind[k]||(byKind[k]=[])).push(x.w[0])});
const LX={};
P.forEach(day=>{let same=(day.w||[]).map(w=>w[0]);(day.w||[]).forEach((w,i)=>{
  let [term,zh,coll,cloze,kind]=w;kind=kind||(/\s/.test(term)?'phr':'v');
  let scene=same.filter(x=>x!==term), localSameKind=(day.w||[]).filter(x=>x[0]!==term&&x[4]===kind).map(x=>x[0]);let confusers=[...new Set([...localSameKind,scene])].slice(0,3);
  let kindPool=(byKind[kind]||[]).filter(x=>x!==term);
  let clozeBad=[...new Set([...localSameKind,...kindPool,...scene])].filter(x=>x!==term).slice(0,3);
  while(clozeBad.length<3){let extra=currentRows.map(x=>x.w[0]).find(x=>x!==term&&!clozeBad.includes(x));if(!extra)break;clozeBad.push(extra)}
  let cue=safeCue(term,coll||term), ex=exampleFor(term,coll||term,kind,i+day.d), z=zhMain(zh);
  LX[term]={
    pos:posMap[kind]||'phr.',
    memory:/\s/.test(term)?`把 “${term}” 当成一个整体词块记；先记核心场景“${z}”，再和搭配一起说出来。`:`把 ${term} 和核心场景“${z}”直接绑定，并用完整搭配记忆。`,
    example:ex,
    exampleZh:`例句含义：这里是在真实场景中表达“${z}”。`,
    collocation:coll||term,
    collocationParts:[term,cue],
    confusers,
    zhConfusers:confusers.map(x=>{let r=currentRows.find(y=>y.w[0]===x);return r?zhMain(r.w[1]):x}),
    cloze:cloze||`Use ______ naturally in this context.`,
    clozeOptions:[term,...clozeBad]
  }
})});
window.LX=LX;
})();
