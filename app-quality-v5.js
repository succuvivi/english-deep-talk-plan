(function(root){
  function resolveCourseWord(day,target){
    const src=root.by&&root.by.get?root.by.get(Number(day)):null;
    const current=src&&Array.isArray(src.w)?src.w.find(w=>w[0]===target):null;
    if(current)return current;
    const legacy=root.LEGACY_WORDS_V5&&root.LEGACY_WORDS_V5[Number(day)];
    return Array.isArray(legacy)?legacy.find(w=>w[0]===target)||null:null;
  }
  function reviewSourceWords(day){
    const n=Number(day),legacy=root.LEGACY_WORDS_V5&&root.LEGACY_WORDS_V5[n];
    if(root.LEGACY_STARTED_DAYS_V5&&root.LEGACY_STARTED_DAYS_V5[n]&&Array.isArray(legacy)&&legacy.length)return legacy;
    const src=root.by&&root.by.get?root.by.get(n):null;
    return src&&Array.isArray(src.w)?src.w:[];
  }
  root.resolveCourseWord=resolveCourseWord;
  root.reviewSourceWords=reviewSourceWords;
  const rounds=root.__fairRandomV4Installed&&root.__fairRandomV4Installed.rounds;
  const shuffle=(key,a)=>rounds?rounds.shuffle(key,a,x=>x.id||x[0]||String(x)):Array.from(a);
  const sample=(key,a,n,idFn)=>rounds?rounds.sample(key,a,n,idFn):Array.from(a).slice(0,n);
  if(typeof root.reviewItems==='function'&&root.by&&root.S){
    root.reviewItems=function(){
      const d=root.cur(),out=[];
      [[1,'1D',5],[2,'2D',5],[6,'6D',5]].forEach(([off,label,n])=>{
        const srcDay=d.d-off,words=reviewSourceWords(srcDay);if(!words.length)return;
        sample('quality-review:'+d.d+':'+label,words,n,w=>w[0]).forEach(w=>out.push({id:label+':'+srcDay+':'+w[0],label,src:srcDay,w}));
      });
      if(root.oneHour&&root.oneHour(d))sample('quality-review:'+d.d+':1H',d.w,5,w=>w[0]).forEach(w=>out.push({id:'1H:'+d.d+':'+w[0],label:'1H',src:d.d,w}));
      const weak=sample('quality-review:'+d.d+':weak',Object.values(root.S.weak||{}),4,x=>x.d+':'+x.w);
      weak.forEach(x=>{const w=resolveCourseWord(x.d,x.w);if(w)out.push({id:'weak:'+x.d+':'+x.w,label:'弱词',src:x.d,w})});
      return shuffle('quality-review:'+d.d+':final',out);
    };
  }
  if(typeof root.previousWeakItems==='function'&&root.S){
    root.previousWeakItems=function(){
      const d=root.cur(),items=Object.values(root.S.weak||{}).filter(x=>x.d===d.d-1).map(x=>{const w=resolveCourseWord(x.d,x.w);return w?{id:'previous-weak-'+x.d+'-'+x.w,src:x.d,w,entry:x}:null}).filter(Boolean);
      return shuffle('quality-previous:'+d.d,items);
    };
  }
  if(typeof root.sentenceItems==='function'&&root.by&&root.S){
    root.sentenceItems=function(){
      const d=root.cur(),out=d.w.map(w=>({id:'today:'+d.d+':'+w[0],src:d.d,w})),pool=[],seen=new Set(out.map(x=>x.src+':'+x.w[0]));
      const add=(src,w)=>{const k=src+':'+w[0];if(!seen.has(k)&&root.LX&&root.LX[w[0]]&&root.LX[w[0]].cloze){seen.add(k);pool.push({id:'ext:'+k,src,w})}};
      [1,2,6].forEach(off=>{const src=d.d-off;reviewSourceWords(src).forEach(w=>add(src,w))});
      Object.values(root.S.weak||{}).forEach(x=>{const w=resolveCourseWord(x.d,x.w);if(w)add(x.d,w)});
      const ext=sample('quality-sentence:'+d.d+':extension',pool,5,x=>x.src+':'+x.w[0]);
      return shuffle('quality-sentence:'+d.d+':final',[...out,...ext]);
    };
  }
  if(typeof root.render==='function')root.render();
})(window);
