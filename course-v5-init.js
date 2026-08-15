(()=>{
const old=window.P||[];
window.LEGACY_WORDS_V5=Object.fromEntries(old.map(d=>[d.d,(d.w||[]).map(w=>[...w])]));
let prior={};try{prior=JSON.parse(window.localStorage?.getItem("englishDeepTalk.v3")||"{}")}catch{}
if(prior.courseVersion!==5){prior.legacyStartedDaysV5=Object.entries(prior.days||{}).filter(([,v])=>v&&(v.started||v.done)).map(([d])=>Number(d));prior.courseVersion=5;try{window.localStorage?.setItem("englishDeepTalk.v3",JSON.stringify(prior))}catch{}}
window.LEGACY_STARTED_DAYS_V5=Object.fromEntries((prior.legacyStartedDaysV5||[]).map(d=>[Number(d),true]));
window.COURSE_V5_PARTS={};
})();
