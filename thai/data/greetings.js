import { makeEntry } from './factory.js';

const greetingsEntriesCore = [
  {
    id: 'greetings-hello', scene: ['greetings'], zh: '你好', th: 'สวัสดี', roman: 'sà-wàt-dii', zhPron: '萨瓦滴', type: '表达', audio: null, keywords: ['见面', '打招呼'],
    collocations: [
      { th: 'สวัสดีค่ะ', roman: 'sà-wàt-dii kha', zh: '你好（女性）', zhPron: '萨瓦滴 卡', audio: null },
      { th: 'สวัสดีตอนเช้า', roman: 'sà-wàt-dii dton cháao', zh: '早上好', zhPron: '萨瓦滴 东 超', audio: null }
    ],
    examples: [
      { th: 'สวัสดีค่ะ', roman: 'sà-wàt-dii kha', zh: '你好。', zhPron: '萨瓦滴 卡', audio: null },
      { th: 'สวัสดีค่ะ วันนี้เป็นยังไงบ้างคะ', roman: 'sà-wàt-dii kha, wan-níi bpen yang-ngai bâang kha', zh: '你好，今天怎么样？', zhPron: '萨瓦滴 卡，弯尼 边 扬盖 邦 卡', audio: null }
    ]
  },
  {
    id: 'greetings-thanks', scene: ['greetings'], zh: '谢谢', th: 'ขอบคุณ', roman: 'khòp-khun', zhPron: '扩坤', type: '表达', audio: null, keywords: ['感谢'],
    collocations: [
      { th: 'ขอบคุณค่ะ', roman: 'khòp-khun kha', zh: '谢谢（女性）', zhPron: '扩坤 卡', audio: null },
      { th: 'ขอบคุณมาก', roman: 'khòp-khun mâak', zh: '非常感谢', zhPron: '扩坤 马', audio: null }
    ],
    examples: [
      { th: 'ขอบคุณค่ะ', roman: 'khòp-khun kha', zh: '谢谢。', zhPron: '扩坤 卡', audio: null },
      { th: 'ขอบคุณมากนะคะ', roman: 'khòp-khun mâak ná kha', zh: '非常感谢。', zhPron: '扩坤 马 纳 卡', audio: null }
    ]
  },
  {
    id: 'greetings-never-mind', scene: ['greetings'], zh: '没关系', th: 'ไม่เป็นไร', roman: 'mâi bpen rai', zhPron: '卖 边 莱', type: '表达', audio: null, keywords: ['回应', '客气'],
    collocations: [
      { th: 'ไม่เป็นไรค่ะ', roman: 'mâi bpen rai kha', zh: '没关系（女性）', zhPron: '卖 边 莱 卡', audio: null },
      { th: 'ไม่เป็นไรเลย', roman: 'mâi bpen rai loei', zh: '完全没关系', zhPron: '卖 边 莱 乐伊', audio: null }
    ],
    examples: [
      { th: 'ไม่เป็นไรค่ะ', roman: 'mâi bpen rai kha', zh: '没关系。', zhPron: '卖 边 莱 卡', audio: null },
      { th: 'ไม่เป็นไรค่ะ ไม่ต้องกังวล', roman: 'mâi bpen rai kha, mâi dtɔ̂ng gang-won', zh: '没关系，不用担心。', zhPron: '卖 边 莱 卡，卖 东 刚翁', audio: null }
    ]
  },
  {
    id: 'greetings-sorry', scene: ['greetings'], zh: '对不起 / 抱歉', th: 'ขอโทษ', roman: 'khɔ̌ɔ-thôot', zhPron: '考 托', type: '表达', audio: null, keywords: ['道歉'],
    collocations: [
      { th: 'ขอโทษค่ะ', roman: 'khɔ̌ɔ-thôot kha', zh: '对不起（女性）', zhPron: '考 托 卡', audio: null },
      { th: 'ขอโทษนะคะ', roman: 'khɔ̌ɔ-thôot ná kha', zh: '不好意思 / 抱歉', zhPron: '考 托 纳 卡', audio: null }
    ],
    examples: [
      { th: 'ขอโทษค่ะ', roman: 'khɔ̌ɔ-thôot kha', zh: '对不起。', zhPron: '考 托 卡', audio: null },
      { th: 'ขอโทษนะคะ ฉันไม่เข้าใจ', roman: 'khɔ̌ɔ-thôot ná kha, chǎn mâi khâo-jai', zh: '不好意思，我不明白。', zhPron: '考 托 纳 卡，产 卖 靠载', audio: null }
    ]
  },
  {
    id: 'greetings-can', scene: ['greetings'], zh: '可以 / 能', th: 'ได้', roman: 'dâi', zhPron: '戴', type: '动词', audio: null, keywords: ['同意', '能力'],
    collocations: [
      { th: 'ได้ค่ะ', roman: 'dâi kha', zh: '可以（女性回答）', zhPron: '戴 卡', audio: null },
      { th: 'ได้ไหม', roman: 'dâi mái', zh: '可以吗', zhPron: '戴 买', audio: null }
    ],
    examples: [
      { th: 'ได้ค่ะ', roman: 'dâi kha', zh: '可以。', zhPron: '戴 卡', audio: null },
      { th: 'อันนี้ได้ไหมคะ', roman: 'an-níi dâi mái kha', zh: '这个可以吗？', zhPron: '安尼 戴 买 卡', audio: null }
    ]
  },
  {
    id: 'greetings-dont-know', scene: ['greetings'], zh: '不知道', th: 'ไม่รู้', roman: 'mâi rúu', zhPron: '卖 鲁', type: '表达', audio: null, keywords: ['不知道', '回答'],
    collocations: [
      { th: 'ไม่รู้ค่ะ', roman: 'mâi rúu kha', zh: '不知道（女性）', zhPron: '卖 鲁 卡', audio: null },
      { th: 'ยังไม่รู้', roman: 'yang mâi rúu', zh: '还不知道', zhPron: '扬 卖 鲁', audio: null }
    ],
    examples: [
      { th: 'ไม่รู้ค่ะ', roman: 'mâi rúu kha', zh: '不知道。', zhPron: '卖 鲁 卡', audio: null },
      { th: 'ตอนนี้ยังไม่รู้ค่ะ', roman: 'dton-níi yang mâi rúu kha', zh: '现在还不知道。', zhPron: '东尼 扬 卖 鲁 卡', audio: null }
    ]
  }
];

const greetingsEntriesExtra = [
  makeEntry('greetings', 'extra01', '不客气', 'ด้วยความยินดี', 'dûai khwaam yin-dii', 'answer'),
  makeEntry('greetings', 'extra02', '不好意思', 'ขอโทษนะ', 'khɔ̌ɔ-thôot ná', 'answer'),
  makeEntry('greetings', 'extra03', '不可以', 'ไม่ได้', 'mâi dâi', 'answer'),
  makeEntry('greetings', 'extra04', '是', 'ใช่', 'châi', 'answer'),
  makeEntry('greetings', 'extra05', '不是', 'ไม่ใช่', 'mâi châi', 'answer'),
  makeEntry('greetings', 'extra06', '有', 'มี', 'mii', 'answer'),
  makeEntry('greetings', 'extra07', '没有', 'ไม่มี', 'mâi mii', 'answer'),
  makeEntry('greetings', 'extra08', '知道', 'รู้', 'rúu', 'verb'),
  makeEntry('greetings', 'extra09', '明白', 'เข้าใจ', 'khâo-jai', 'verb'),
  makeEntry('greetings', 'extra10', '不明白', 'ไม่เข้าใจ', 'mâi khâo-jai', 'answer'),
  makeEntry('greetings', 'extra11', '等一下', 'รอแป๊บ', 'rɔɔ bpáep', 'request'),
  makeEntry('greetings', 'extra12', '没事', 'ไม่เป็นไร', 'mâi bpen rai', 'answer'),
  makeEntry('greetings', 'extra13', '再见', 'แล้วเจอกัน', 'láeo jəə gan', 'answer'),
  makeEntry('greetings', 'extra14', '慢慢来', 'ค่อยๆทำ', 'khɔ̂i-khɔ̂i tham', 'request'),
];

export const greetingsEntries = [...greetingsEntriesCore, ...greetingsEntriesExtra];
