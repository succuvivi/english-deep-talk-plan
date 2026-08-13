from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]

ADJ = set('awkward reliable available free busy convenient spicy mild full expensive affordable nearby broken noisy quiet urgent flexible close friendly funny stressed relaxed upset excited nervous disappointed proud grateful comfortable overwhelmed honest patient calm confident independent thoughtful easygoing sensitive stubborn curious likely sick better worse crowded local rainy single fair unfair embarrassed stable foreign homesick meaningful important enough simple tired sore dizzy humid worth extra included straight'.split())
VERB = set('realize assume handle hesitate afford mention order recommend fit exchange refund turn miss ride repair rent focus finish update delay discuss explain clarify reply remind share agree disagree invite join trust chill decide choose prefer depend consider avoid fix solve improve charge connect disconnect download upload send receive mute hurt rest save spend cost transfer owe borrow lend book depart arrive request complain happen support respect communicate argue believe seem convince matter compare judge keep quit start continue achieve practice approach introduce pronounce express respond understand misunderstand interrupt marry raise explore adapt value regret change apologize forgive blame promise ignore listen compromise'.split())
ADV = set('exactly seriously really actually basically honestly apparently luckily unfortunately anyway suddenly eventually while before after during especially however instead probably definitely abroad across'.split())
NOUN = set('option perspective schedule refill portion bill size receipt discount route traffic direction landlord neighbor leak task deadline progress priority point mistake relationship date couple boundary reason solution issue cause battery signal appointment medicine budget cash price flight luggage passport gate destination reservation table menu seat service tip market street food motorbike temple neighborhood delivery goal habit routine childhood future kid career salary opportunity experience skill responsibility success risk family parents relative culture language barrier tourist lifestyle freedom pressure expectation happiness misunderstanding'.split())
CONNECTORS = {'at first','in the end','in general','for example','the thing is','it depends','at the same time','even though'}
COMMON = {
'adj.': 'valuable avoidable reliable available comfortable convenient confident consistent considerable considerate sensitive sensible simple similar serious social special specific stable strange strong suitable successful supportive thoughtful useful usual vacant valid visible willing active actual awkward casual calm careful certain clear close crowded curious direct easy fair flexible formal free friendly full honest independent local lucky meaningful mild nervous noisy patient possible proud quiet ready relaxed safe single sick stable stressed stubborn tired unfair urgent weak worried'.split(),
'v.': 'accept achieve adapt admit advise afford agree allow apologize approach argue arrange arrive assume avoid balance believe blame borrow cancel change charge choose clarify compare complain confirm connect consider continue convince decide delay depend discuss disconnect download encourage exchange explain explore express figure finish focus forgive handle happen hesitate ignore improve include introduce invite join judge keep lend listen manage mention miss move notice offer order organize postpone practice prefer prepare pronounce promise protect raise realize receive recommend remind repair reply request respect respond rest save schedule send share solve spend split start stop support transfer trust try understand update upload value wait'.split(),
'n.': 'agenda answer appointment balance battery bill boundary budget calendar career cause choice culture deadline destination direction discount experience expectation family flight freedom future gate goal habit idea issue language lifestyle luggage market medicine menu mistake neighbor neighborhood option opportunity order passport perspective plan point pressure price priority problem progress reason receipt relationship reservation responsibility result route salary schedule service signal size skill solution table task timetable traffic value'.split(),
'adv.': 'actually apparently basically clearly definitely eventually exactly finally generally honestly immediately luckily normally obviously probably really seriously simply slowly suddenly usually unfortunately'.split(),
'phr.': ['make up','make out','make do','make it','plan on','think ahead','look ahead','call off','put off','set up','check out','check in','move in','move out','drop off','pick up','hang out','get along','catch up','follow up','deal with','figure out','work out','turn out','break up','calm down','speak up','grow up','settle down','at first','in the end','in general','for example','the thing is','it depends','at the same time','even though','on time','ahead of time','right away','by the way']}
OV = {
'realize': dict(pos='v.', memory='real + ize：把事情“变得真实、看清楚”→ 意识到。记住常用搭配 realize that...。', example='I realized that I left my keys at home.', exampleZh='我意识到我把钥匙落在家里了。', confusers=['recognize','remember','notice'], cloze='I did not ______ how late it was until I checked my phone.'),
'assume': dict(pos='v.', memory='把 assume 记成“先按某种情况来想”→ 假设、以为。常和 that 从句一起用。', example='I assumed he was busy, so I did not call.', exampleZh='我以为他很忙，所以没有打电话。', confusers=['presume','suppose','resume'], cloze='Do not ______ everyone agrees before you ask them.'),
'handle': dict(pos='v.', memory='handle 本义是“把手”；动词就像“把事情抓在手里处理”→ 处理、应对。', example='I can handle this problem by myself.', exampleZh='我可以自己处理这个问题。', confusers=['manage','settle','control'], cloze='Can you ______ the customer complaint while I am away?'),
'hesitate': dict(pos='v.', memory='把它和 hesitation（犹豫）一起记；看到 hesitate to do 就想到“迟疑着不马上做”。', example='Do not hesitate to ask if you need help.', exampleZh='如果你需要帮助，尽管问，不要犹豫。', confusers=['estimate','meditate','hesitation'], cloze='She did not ______ to speak up when something felt wrong.'),
'afford': dict(pos='v.', memory='afford 常和 can/can\'t 连用：can afford = 有能力承担价格或时间。', example='I cannot afford a new apartment right now.', exampleZh='我现在负担不起一套新公寓。', confusers=['offer','effort','avoid'], cloze='We cannot ______ another delay this week.'),
'mention': dict(pos='v.', memory='把 mention 记成“顺手提一句”，比 discuss 更轻、更短。', example='She mentioned that she might move next month.', exampleZh='她提到她下个月可能会搬家。', confusers=['motion','notice','comment'], cloze='Did he ______ why the meeting was moved?'),
'awkward': dict(pos='adj.', memory='把 awkward 和 awkward silence 绑定记忆：没人知道说什么时，那种感觉就是“尴尬、不自在”。', example='There was an awkward silence after my question.', exampleZh='我问完以后出现了一阵尴尬的沉默。', confusers=['odd','uncomfortable','embarrassed'], cloze='The conversation became ______ after I forgot his name.'),
'reliable': dict(pos='adj.', memory='rely（依靠）+ able（能够…的）→ 能依靠的 → 可靠的。', example='She is reliable, so I trust her with important things.', exampleZh='她很可靠，所以重要的事情我会交给她。', confusers=['relevant','reasonable','responsible'], cloze='We need a ______ internet connection for the call.'),
'option': dict(pos='n.', memory='option 和 choose/choice 一组记：有多个 option，最后做一个 choice。', example='Taking the train is another option.', exampleZh='坐火车是另一个选择。', confusers=['choice','opinion','opportunity'], cloze='If the bus is full, taking a taxi is another ______.'),
'perspective': dict(pos='n.', memory='把它和“视角”绑定：from my perspective = 从我的视角来看。', example='From my perspective, clear communication matters most.', exampleZh='从我的角度来看，清晰的沟通最重要。', confusers=['perception','position','prospect'], cloze='Try to see the problem from her ______ before judging.'),
'available': dict(pos='adj.', memory='avail（可用、可获得）+ able（能够…的）→ 可用的；用于人时就是“有空的”。', example='I am available on Friday evening.', exampleZh='我周五晚上有空。', confusers=['valuable','avoidable','reliable'], cloze='Is the meeting room ______ after lunch?'),
'schedule': dict(pos='n.', memory='把 schedule 直接和“时间表”画面绑定：check my schedule = 看一下自己的日程。', example='I checked my schedule before making plans.', exampleZh='我在做安排之前先看了自己的日程。', confusers=['agenda','calendar','timetable'], cloze='Let me check my ______ before I confirm the time.'),
'free': dict(pos='adj.', memory='free 不只表示“免费”，说时间时 be free = 有空。和 available 放在一起对比记。', example='I am free after work today.', exampleZh='我今天下班后有空。', confusers=['available','vacant','spare'], cloze='Are you ______ for coffee around six?'),
'busy': dict(pos='adj.', memory='busy with + 名词 = 忙于某事；busy doing = 忙着做某事。', example='I am busy with work this afternoon.', exampleZh='我今天下午工作很忙。', confusers=['occupied','active','crowded'], cloze='I am too ______ to talk right now; can I call you later?'),
'make it': dict(pos='v. phr.', memory='make it 不是“制作它”，口语里常表示“成功到达/能参加”。记住 Can you make it?。', example='I cannot make it at six, but seven works for me.', exampleZh='我六点赶不到，不过七点可以。', confusers=['make up','make out','make do'], cloze='Sorry, I cannot ______ to dinner tonight.'),
'reschedule': dict(pos='v.', memory='re-（再次）+ schedule（日程）→ 重新安排时间。', example='Can we reschedule the meeting for tomorrow?', exampleZh='我们可以把会议改到明天吗？', confusers=['rearrange','postpone','schedule'], cloze='We may need to ______ because my flight is delayed.'),
'confirm': dict(pos='v.', memory='con + firm：把事情“定牢”→ 确认。重点区分 conform（遵从）和 confront（面对）。', example='Please confirm the time before you leave.', exampleZh='你出发前请确认一下时间。', confusers=['conform','confront','confuse'], cloze='Please ______ your reservation by email.'),
'cancel': dict(pos='v.', memory='把 cancel 和 call off 一起记：两者都可以表示“取消计划/活动”。', example='I had to cancel our plan because I felt sick.', exampleZh='因为我不舒服，我不得不取消我们的计划。', confusers=['call off','postpone','remove'], cloze='They had to ______ the outdoor event because of the rain.'),
'convenient': dict(pos='adj.', memory='convenient = 对时间、地点或做法来说“方便”。常见：a convenient time/place。', example='Six o’clock is a convenient time for me.', exampleZh='六点对我来说是一个方便的时间。', confusers=['comfortable','suitable','available'], cloze='Is this location ______ for everyone?'),
'plan ahead': dict(pos='v. phr.', memory='plan + ahead（往前）→ 把计划做在事情发生之前，也就是“提前计划”。', example='I like to plan ahead for busy weeks.', exampleZh='遇到忙碌的一周，我喜欢提前做好计划。', confusers=['think ahead','look ahead','plan on'], cloze='If you travel during a holiday, it helps to ______.'),
'order': dict(pos='v.', memory='在餐厅里 order = 点餐；名词 an order = 一份订单。把“点菜”场景和词绑定。', example='I would like to order the chicken, please.', exampleZh='我想点鸡肉，谢谢。', confusers=['request','reserve','offer'], cloze='Are you ready to ______, or do you need another minute?'),
'recommend': dict(pos='v.', memory='recommend + 名词 / recommend doing；想到“把一个好选择推给别人”。', example='Can you recommend a dish that is not too spicy?', exampleZh='你能推荐一道不太辣的菜吗？', confusers=['suggest','request','comment'], cloze='What would you ______ for someone who likes mild food?'),
'refill': dict(pos='n.', memory='re-（再次）+ fill（装满）→ 再装满；餐厅里常指续杯。', example='Could I get a refill of water, please?', exampleZh='可以帮我再加一点水吗？', confusers=['refresh','replace','repeat'], cloze='Can I get a free ______ on this drink?'),
'spicy': dict(pos='adj.', memory='spice（香料）+ y（有…特征的）→ 香料味重的，常指“辣的”。', example='This curry is a little too spicy for me.', exampleZh='这份咖喱对我来说有点太辣了。', confusers=['salty','sour','smoky'], cloze='Is the soup very ______, or is it mild?'),
'mild': dict(pos='adj.', memory='mild 表示“温和、不强烈”；说食物时就是口味清淡、不太辣。', example='I prefer a mild flavor when I am tired.', exampleZh='我累的时候更喜欢清淡一点的味道。', confusers=['plain','soft','spicy'], cloze='Could you make the curry ______ instead of hot?'),
'portion': dict(pos='n.', memory='portion = 一份、份量；把它和 a large/small portion 一起记。', example='The portion is big enough for two people.', exampleZh='这份量够两个人吃。', confusers=['position','proportion','section'], cloze='The lunch ______ was much bigger than I expected.'),
'bill': dict(pos='n.', memory='餐厅里的 bill = 账单；美式英语也常说 check。记住 ask for the bill。', example='Could we have the bill, please?', exampleZh='可以把账单给我们吗？', confusers=['check','receipt','price'], cloze='Can we get the ______ when you have a moment?'),
'split': dict(pos='v.', memory='split = 分开；split the bill = 把账单分开付/平摊。', example='Let us split the bill equally.', exampleZh='我们把账单平摊吧。', confusers=['divide','separate','share'], cloze='Do you want to ______ the bill or pay together?'),
'takeaway': dict(pos='n.', memory='take + away：把食物“带走”→ 外带。英式英语常用 takeaway。', example='Can I get this takeaway, please?', exampleZh='这个可以帮我打包外带吗？', confusers=['takeout','delivery','leftover'], cloze='We are in a hurry, so let us get ______ instead of eating here.'),
'full': dict(pos='adj.', memory='full 本义“满的”；人吃到“肚子满了”就是 feel full = 吃饱了。', example='I am full, so I do not need dessert.', exampleZh='我吃饱了，所以不需要甜点。', confusers=['stuffed','hungry','filled'], cloze='I am already ______, so I will skip dessert.')}
POS_OV = {'make it':'v. phr.','plan ahead':'v. phr.','try on':'v. phr.','drop off':'v. phr.','move in':'v. phr.','move out':'v. phr.','follow up':'v. phr.','hang out':'v. phr.','get along':'v. phr.','catch up':'v. phr.','deal with':'v. phr.','figure out':'v. phr.','work out':'v. phr.','check in':'v. phr.','check out':'v. phr.','turn out':'v. phr.','break up':'v. phr.','calm down':'v. phr.','make up':'v. phr.','speak up':'v. phr.','grow up':'v. phr.','settle down':'v. phr.','at first':'adv. phr.','in the end':'adv. phr.','in general':'adv. phr.','for example':'adv. phr.','the thing is':'phr.','it depends':'phr.','at the same time':'adv. phr.','even though':'conj.','because':'conj.','although':'conj.','make sense':'v. phr.','language barrier':'n. phr.','street food':'n. phr.'}

def load_plan(path=ROOT/'plan.js'):
    text=path.read_text(encoding='utf-8').strip()
    if not(text.startswith('window.P=') and text.endswith(';')): raise ValueError('plan.js format changed')
    return json.loads(text[len('window.P='):-1])
def primary_zh(s): return re.split(r'[；;]',s)[0].strip()
def pos_of(word):
    if word in OV:return OV[word]['pos']
    if word in POS_OV:return POS_OV[word]
    if word in ADJ:return 'adj.'
    if word in ADV:return 'adv.'
    if word in VERB:return 'v.'
    if word in NOUN:return 'n.'
    if ' ' in word:return 'phr.'
    if word.endswith('ly'):return 'adv.'
    if word.endswith(('ous','ful','ive','able','ible','al','ic','ed')):return 'adj.'
    if word.endswith(('tion','ment','ness','ity','ship','ance','ence')):return 'n.'
    return 'v./n.'
def memory_for(word,pos,zh):
    if word in OV:return OV[word]['memory']
    z=primary_zh(zh)
    if ' ' in word:return f"把短语拆成 {' + '.join(word.split())} 来记；整体在这里表示“{z}”，优先整块记忆，不逐字翻译。"
    if word.startswith('re') and len(word)>6:return f"re- 常有“再次/重新”的感觉；把 {word} 和“{z}”这个核心用法一起记。"
    if word.endswith('able'):return f"-able 常表示“能够…的”；把 {word} 整体和“{z}”绑定记忆。"
    if word.endswith('tion'):return f"-tion 常见于名词；看到 {word} 先判断它是一个“事物/概念”，核心意思是“{z}”。"
    if pos=='adj.':return f"把 {word} 和一个具体画面绑定：某人/某事处于“{z}”的状态。"
    if pos=='n.':return f"把 {word} 当成场景里的一个“东西/概念”记，核心标签是“{z}”。"
    if pos=='v.':return f"把 {word} 记成一个动作按钮：看到“{z}”就立刻想到这个动词。"
    return f"把 {word} 作为固定表达整体记住，核心意思是“{z}”。"
def example_for(word,zh,coll,pos):
    if word in OV:return OV[word]['example'],OV[word]['exampleZh']
    z=primary_zh(zh)
    if pos=='adj.':return f'It feels {word} in this situation.',f'在这种情况下，感觉很{z}。'
    if pos=='n.':return f'We talked about {word} before making a decision.',f'我们在做决定前谈到了“{z}”这件事。'
    if pos=='adv.':return f'{word.capitalize()}, we decided to talk about it again.',f'{z}，我们决定再谈一次这件事。'
    if word=='because':return 'I stayed home because I was feeling sick.','因为我不舒服，所以待在家里。'
    if word in ('although','even though'):return f'{word.capitalize()} I was tired, I still went out.',f'{z}我很累，但我还是出门了。'
    if pos in ('adv. phr.','conj.') or word in CONNECTORS:return f'{word.capitalize()}, I still think the second option is better.',f'{z}，我还是觉得第二个选择更好。'
    if pos.endswith('phr.') or pos=='phr.':return f'I usually {word} when the situation changes.',f'情况变化时，我通常会{z}。'
    if pos=='v.':return f'I need to {word} this today.',f'我今天需要{z}这件事。'
    return f'I use {word} a lot in daily conversations.',f'我在日常对话里经常用 {word} 来表达“{z}”。'
def edit_distance(a,b):
    a,b=a.lower(),b.lower();prev=list(range(len(b)+1))
    for i,ca in enumerate(a,1):
        cur=[i]
        for j,cb in enumerate(b,1):cur.append(min(cur[-1]+1,prev[j]+1,prev[j-1]+(ca!=cb)))
        prev=cur
    return prev[-1]
def pool_key(pos):
    if 'phr.' in pos or pos in ('phr.','conj.'):return 'phr.'
    return pos if pos in COMMON else 'v.'
def pick_confusers(word,pos,all_words,same_day):
    if word in OV:return OV[word]['confusers']
    key=pool_key(pos);candidates=list(COMMON[key])
    for w,p in all_words:
        if w not in same_day and pool_key(p)==key:candidates.append(w)
    seen=[]
    for c in candidates:
        if c!=word and c not in same_day and c not in seen:seen.append(c)
    ranked=sorted(seen,key=lambda c:(edit_distance(word,c),abs(len(word)-len(c)),c))
    if len(ranked)<3:raise ValueError(f'not enough confusers for {word}')
    return ranked[:3]
def coll_parts(word,coll):
    cue=re.sub(re.escape(word),'___',coll,count=1,flags=re.I)
    if cue==coll:cue=coll+' · ___'
    return [word,cue]
def cloze_for(word,pos):
    if word in OV:return OV[word]['cloze']
    if pos=='adj.':return 'The situation felt ______ after the plan changed.'
    if pos=='n.':return 'We talked about the ______ before making a decision.'
    if pos=='adv.':return '______, we decided to talk about it again.'
    if word=='because':return 'I stayed home ______ I was feeling sick.'
    if word in ('although','even though'):return '______ I was tired, I still went out.'
    if pos in ('adv. phr.','conj.') or word in CONNECTORS:return '______, I still think the second option is better.'
    if pos.endswith('phr.') or pos=='phr.':return 'I usually ______ when plans suddenly change.'
    return 'I need to ______ this before tomorrow.'
def build_entries(plan):
    all_words=[(w[0],pos_of(w[0])) for d in plan for w in d['w']]
    all_zh=[(w[0],primary_zh(w[1]),pos_of(w[0]),d['d']) for d in plan for w in d['w']]
    entries={}
    for day in plan:
        same_day={w[0] for w in day['w']}
        for word,zh,coll in day['w']:
            pos=pos_of(word);ex,exzh=example_for(word,zh,coll,pos);conf=pick_confusers(word,pos,all_words,same_day)
            zhpool=[z for ow,z,op,od in all_zh if ow!=word and op==pos and od!=day['d']]
            if len(zhpool)<3:zhpool=[z for ow,z,op,od in all_zh if ow!=word and od!=day['d']]
            zhconf=[]
            for z in zhpool:
                if z not in zhconf and z!=primary_zh(zh):zhconf.append(z)
                if len(zhconf)==3:break
            entries[word]={'pos':pos,'zh':zh,'memory':memory_for(word,pos,zh),'example':ex,'exampleZh':exzh,'collocation':coll,'collocationParts':coll_parts(word,coll),'confusers':conf,'zhConfusers':zhconf,'cloze':cloze_for(word,pos),'clozeAnswer':word,'clozeOptions':[word]+conf}
    return entries
def main():
    entries=build_entries(load_plan())
    (ROOT/'lexicon.js').write_text('window.LX='+json.dumps(entries,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    print(f'wrote {len(entries)} lexicon entries')
if __name__=='__main__':main()
