(function(factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else api.install(globalThis);
})(function(){
  function boundedInt(max,nextUint32){
    if(!Number.isInteger(max)||max<=0)throw new RangeError('max must be a positive integer');
    const range=0x100000000,limit=Math.floor(range/max)*max;
    let x;do{x=nextUint32()>>>0}while(x>=limit);
    return x%max;
  }
  function randomInt(max){
    const c=globalThis.crypto;
    if(c&&typeof c.getRandomValues==='function'){
      const buf=new Uint32Array(1);
      return boundedInt(max,()=>{c.getRandomValues(buf);return buf[0]});
    }
    if(!Number.isInteger(max)||max<=0)throw new RangeError('max must be a positive integer');
    return Math.floor(Math.random()*max);
  }
  function fairShuffle(items,intFn=randomInt){
    const a=[...items];
    for(let i=a.length-1;i>0;i--){const j=intFn(i+1);[a[i],a[j]]=[a[j],a[i]]}
    return a;
  }
  function createRoundRandomizer(intFn=randomInt){
    const orders=new Map();
    function tokenized(items,idFn){
      const counts=new Map();
      return items.map(item=>{
        const base=String(idFn(item)),n=counts.get(base)||0;
        counts.set(base,n+1);
        return [base+'\u0000'+n,item];
      });
    }
    function shuffle(key,items,idFn=x=>String(x)){
      const pairs=tokenized(items,idFn);
      if(!orders.has(key))orders.set(key,fairShuffle(pairs.map(x=>x[0]),intFn));
      const map=new Map(pairs);
      return orders.get(key).filter(id=>map.has(id)).map(id=>map.get(id));
    }
    return {shuffle,sample:(key,items,n,idFn)=>shuffle(key,items,idFn).slice(0,Math.max(0,n)),reset:()=>orders.clear()};
  }
  function defaultId(x){
    if(x==null)return String(x);
    if(typeof x==='string'||typeof x==='number'||typeof x==='boolean')return typeof x+':'+x;
    if(Array.isArray(x))return 'word:'+(x[0]??'')+'|'+(x[1]??'');
    if(typeof x==='object'){
      if(x.id!=null)return 'id:'+x.id;
      if(typeof x.w==='string'&&x.d!=null)return 'weak:'+x.d+':'+x.w;
      if(x.word!=null)return 'word:'+x.word;
      if(Array.isArray(x.w))return 'item:'+(x.src??x.d??'')+':'+x.w[0];
    }
    try{return JSON.stringify(x)}catch{return String(x)}
  }
  function reorderCards(root,rounds,containerId,key){
    const box=root.$&&root.$(containerId);if(!box||!box.children)return;
    const entries=Array.from(box.children).map((node,i)=>({id:String(i),node}));
    const ordered=rounds.shuffle(key,entries,x=>x.id);
    ordered.forEach((x,i)=>{
      box.appendChild(x.node);
      const q=x.node.querySelector&&x.node.querySelector('.question');
      if(q)q.textContent=(i+1)+'. '+q.textContent.replace(/^\d+\.\s*/,'');
    });
  }
  function install(root,options={}){
    if(root.__fairRandomV4Installed)return root.__fairRandomV4Installed;
    const rounds=createRoundRandomizer(options.intFn||randomInt);
    const baseReset=root.resetTransient;
    if(typeof baseReset==='function')root.resetTransient=function(){baseReset.apply(this,arguments);rounds.reset()};
    root.sh=function(a,seed){return rounds.shuffle('sh:'+String(seed),a,defaultId)};

    [['meaningQuiz','meaningQuiz','meaning-q'],['quiz','quiz','scene-q'],['recall','recall','recall-q']].forEach(([name,container,prefix])=>{
      const base=root[name];if(typeof base!=='function')return;
      root[name]=function(){const out=base.apply(this,arguments),d=root.cur&&root.cur();if(d)reorderCards(root,rounds,container,prefix+':'+d.d);return out};
    });

    root.matchQuiz=function(){
      const d=root.cur(),box=root.$('matchQuiz');if(!box)return;box.innerHTML='';
      const ordered=rounds.shuffle('match:targets:'+d.d,d.w,w=>w[0]);
      [ordered.slice(0,5),ordered.slice(5,10)].forEach((g,r)=>{
        const left=rounds.shuffle('match:left:'+d.d+':'+r,g.map(w=>w[0]),x=>x);
        const right=rounds.shuffle('match:right:'+d.d+':'+r,g.map(w=>({word:w[0],cue:((root.LX[w[0]]||{}).collocationParts||[w[0],w[2]])[1]})),x=>x.word);
        const card=document.createElement('div');card.className='qcard';card.innerHTML=`<div class="question">Round ${r+1}</div><div class="matchgrid"><div class="matchcol left"></div><div class="matchcol right"></div></div>`;
        left.forEach(word=>{let b=document.createElement('button');b.className='choice matchchoice'+(root.ms.left===word?' selected':'')+(root.ms.done[word]?' done':'');b.textContent=word;b.disabled=!!root.ms.done[word];b.onclick=()=>root.matchPick('left',word);card.querySelector('.left').appendChild(b)});
        right.forEach(x=>{let b=document.createElement('button');b.className='choice matchchoice'+(root.ms.right===x.word?' selected':'')+(root.ms.done[x.word]?' done':'');b.textContent=x.cue;b.disabled=!!root.ms.done[x.word];b.onclick=()=>root.matchPick('right',x.word);card.querySelector('.right').appendChild(b)});
        box.appendChild(card)
      });
      root.$('matchScore').textContent=Object.keys(root.ms.done).length+' / 10';
    };

    root.reviewItems=function(){
      const d=root.cur(),out=[];
      [[1,'1D',5],[2,'2D',5],[6,'6D',5]].forEach(([off,label,n])=>{
        const src=root.by.get(d.d-off);if(!src)return;
        rounds.sample('review:'+d.d+':'+label,src.w,n,w=>w[0]).forEach(w=>out.push({id:label+':'+src.d+':'+w[0],label,src:src.d,w}));
      });
      if(root.oneHour(d))rounds.sample('review:'+d.d+':1H',d.w,5,w=>w[0]).forEach(w=>out.push({id:'1H:'+d.d+':'+w[0],label:'1H',src:d.d,w}));
      const weak=rounds.sample('review:'+d.d+':weak',Object.values(root.S.weak||{}),4,x=>x.d+':'+x.w);
      weak.forEach(x=>{const src=root.by.get(x.d),w=src&&src.w.find(z=>z[0]===x.w);if(w)out.push({id:'weak:'+x.d+':'+x.w,label:'弱词',src:x.d,w})});
      return rounds.shuffle('review:'+d.d+':final',out,x=>x.id);
    };

    root.sentenceItems=function(){
      const d=root.cur();
      const current=d.w.map(w=>({id:'today:'+d.d+':'+w[0],src:d.d,w}));
      const currentKeys=new Set(current.map(x=>x.src+':'+x.w[0])),pool=new Map();
      const add=(src,w)=>{const k=src+':'+w[0];if(!currentKeys.has(k)&&!pool.has(k))pool.set(k,{id:'ext:'+k,src,w})};
      [1,2,6].forEach(off=>{const src=root.by.get(d.d-off);if(src)src.w.forEach(w=>add(src.d,w))});
      Object.values(root.S.weak||{}).forEach(x=>{const src=root.by.get(x.d),w=src&&src.w.find(z=>z[0]===x.w);if(w)add(x.d,w)});
      const ext=rounds.sample('sentence:'+d.d+':extension',Array.from(pool.values()),5,x=>x.src+':'+x.w[0]);
      return rounds.shuffle('sentence:'+d.d+':final',[...current,...ext],x=>x.src+':'+x.w[0]);
    };

    root.previousWeakItems=function(){
      const d=root.cur();if(!root.by.get(d.d-1))return[];
      const items=Object.values(root.S.weak||{}).filter(x=>x.d===d.d-1).map(x=>{const src=root.by.get(x.d),w=src&&src.w.find(z=>z[0]===x.w);return w?{id:'previous-weak-'+x.d+'-'+x.w,src:x.d,w,entry:x}:null}).filter(Boolean);
      return rounds.shuffle('previous-weak:'+d.d+':final',items,x=>x.id);
    };

    const api={rounds};root.__fairRandomV4Installed=api;
    if(options.rerender!==false&&typeof root.render==='function')root.render();
    return api;
  }
  return {boundedInt,randomInt,fairShuffle,createRoundRandomizer,defaultId,install};
});
