import { makeEntry } from './factory.js';

const restaurantEntriesCore = [
  {
    id: 'restaurant-spicy', scene: ['restaurant'], zh: '辣', th: 'เผ็ด', roman: 'phèt', zhPron: '配特', type: '形容词', audio: null, keywords: ['口味', '辣度'],
    collocations: [
      { th: 'ไม่เผ็ด', roman: 'mâi phèt', zh: '不辣', zhPron: '卖 配特', audio: null },
      { th: 'เผ็ดมาก', roman: 'phèt mâak', zh: '很辣', zhPron: '配特 马', audio: null }
    ],
    examples: [
      { th: 'ไม่เอาเผ็ดค่ะ', roman: 'mâi ao phèt kha', zh: '不要辣。', zhPron: '卖 奥 配特 卡', audio: null },
      { th: 'อันนี้เผ็ดไหมคะ', roman: 'an-níi phèt mái kha', zh: '这个辣吗？', zhPron: '安尼 配特 买 卡', audio: null }
    ]
  },
  {
    id: 'restaurant-sweet', scene: ['restaurant'], zh: '甜', th: 'หวาน', roman: 'wǎan', zhPron: '玩', type: '形容词', audio: null, keywords: ['口味', '甜度'],
    collocations: [
      { th: 'หวานน้อย', roman: 'wǎan nói', zh: '少甜', zhPron: '玩 诺伊', audio: null },
      { th: 'ไม่หวาน', roman: 'mâi wǎan', zh: '不甜', zhPron: '卖 玩', audio: null }
    ],
    examples: [
      { th: 'เอาหวานน้อยค่ะ', roman: 'ao wǎan nói kha', zh: '要少甜。', zhPron: '奥 玩 诺伊 卡', audio: null },
      { th: 'อันนี้หวานไหมคะ', roman: 'an-níi wǎan mái kha', zh: '这个甜吗？', zhPron: '安尼 玩 买 卡', audio: null }
    ]
  },
  {
    id: 'restaurant-salty', scene: ['restaurant'], zh: '咸', th: 'เค็ม', roman: 'khem', zhPron: '肯', type: '形容词', audio: null, keywords: ['口味'],
    collocations: [
      { th: 'เค็มมาก', roman: 'khem mâak', zh: '很咸', zhPron: '肯 马', audio: null },
      { th: 'ไม่เค็ม', roman: 'mâi khem', zh: '不咸', zhPron: '卖 肯', audio: null }
    ],
    examples: [
      { th: 'ไม่เอาเค็มค่ะ', roman: 'mâi ao khem kha', zh: '不要太咸。', zhPron: '卖 奥 肯 卡', audio: null },
      { th: 'จานนี้เค็มไปค่ะ', roman: 'jaan níi khem bpai kha', zh: '这盘太咸了。', zhPron: '占 尼 肯 拜 卡', audio: null }
    ]
  },
  {
    id: 'restaurant-no-want', scene: ['restaurant'], zh: '不要 / 不要这个', th: 'ไม่เอา', roman: 'mâi ao', zhPron: '卖 奥', type: '表达', audio: null, keywords: ['拒绝', '点餐'],
    collocations: [
      { th: 'ไม่เอาอันนี้', roman: 'mâi ao an-níi', zh: '不要这个', zhPron: '卖 奥 安尼', audio: null },
      { th: 'ไม่เอาแล้ว', roman: 'mâi ao láeo', zh: '不要了', zhPron: '卖 奥 廖', audio: null }
    ],
    examples: [
      { th: 'ไม่เอาอันนี้ค่ะ', roman: 'mâi ao an-níi kha', zh: '不要这个。', zhPron: '卖 奥 安尼 卡', audio: null },
      { th: 'ไม่เอาแล้วค่ะ ขอบคุณค่ะ', roman: 'mâi ao láeo kha, khòp-khun kha', zh: '不要了，谢谢。', zhPron: '卖 奥 廖 卡，扩坤 卡', audio: null }
    ]
  },
  {
    id: 'restaurant-add', scene: ['restaurant'], zh: '加 / 增加', th: 'เพิ่ม', roman: 'phôem', zhPron: '彭', type: '动词', audio: null, keywords: ['加料', '增加'],
    collocations: [
      { th: 'เพิ่มอีกหน่อย', roman: 'phôem ìik nòi', zh: '再加一点', zhPron: '彭 易 诺伊', audio: null },
      { th: 'เพิ่มไข่', roman: 'phôem khài', zh: '加蛋', zhPron: '彭 凯', audio: null }
    ],
    examples: [
      { th: 'เพิ่มไข่หนึ่งฟองค่ะ', roman: 'phôem khài nʉ̀ng fɔɔng kha', zh: '加一个蛋。', zhPron: '彭 凯 能 方 卡', audio: null },
      { th: 'เพิ่มข้าวอีกหน่อยได้ไหมคะ', roman: 'phôem khâao ìik nòi dâi mái kha', zh: '可以再加一点饭吗？', zhPron: '彭 靠 易 诺伊 戴 买 卡', audio: null }
    ]
  },
  {
    id: 'restaurant-check-bill', scene: ['restaurant'], zh: '结账', th: 'เช็กบิล', roman: 'chék-bin', zhPron: '切克 宾', type: '动词', audio: null, keywords: ['付款', '买单'],
    collocations: [
      { th: 'เช็กบิลด้วย', roman: 'chék-bin dûai', zh: '麻烦结账', zhPron: '切克 宾 对', audio: null },
      { th: 'ขอเช็กบิล', roman: 'khɔ̌ɔ chék-bin', zh: '请结账', zhPron: '考 切克 宾', audio: null }
    ],
    examples: [
      { th: 'ขอเช็กบิลค่ะ', roman: 'khɔ̌ɔ chék-bin kha', zh: '请结账。', zhPron: '考 切克 宾 卡', audio: null },
      { th: 'จ่ายด้วยคิวอาร์ได้ไหมคะ', roman: 'jàai dûai khiu-aa dâi mái kha', zh: '可以扫码付款吗？', zhPron: '载 对 Q阿 戴 买 卡', audio: null }
    ]
  }
];

const restaurantEntriesExtra = [
  makeEntry('restaurant', 'extra01', '酸', 'เปรี้ยว', 'bprîao', 'adj'),
  makeEntry('restaurant', 'extra02', '淡', 'จืด', 'jʉ̀ʉt', 'adj'),
  makeEntry('restaurant', 'extra03', '好吃', 'อร่อย', 'à-ròi', 'adj'),
  makeEntry('restaurant', 'extra04', '要', 'เอา', 'ao', 'request'),
  makeEntry('restaurant', 'extra05', '少一点', 'น้อยหน่อย', 'nói nòi', 'request'),
  makeEntry('restaurant', 'extra06', '多一点', 'เยอะหน่อย', 'yóe nòi', 'request'),
  makeEntry('restaurant', 'extra07', '水', 'น้ำ', 'náam', 'noun'),
  makeEntry('restaurant', 'extra08', '冰', 'น้ำแข็ง', 'náam-khǎeng', 'noun'),
  makeEntry('restaurant', 'extra09', '米饭', 'ข้าว', 'khâao', 'noun'),
  makeEntry('restaurant', 'extra10', '面', 'ก๋วยเตี๋ยว', 'gǔai-dtǐao', 'noun'),
  makeEntry('restaurant', 'extra11', '肉', 'เนื้อ', 'nʉ́a', 'noun'),
  makeEntry('restaurant', 'extra12', '鸡', 'ไก่', 'gài', 'noun'),
  makeEntry('restaurant', 'extra13', '猪', 'หมู', 'mǔu', 'noun'),
  makeEntry('restaurant', 'extra14', '鱼', 'ปลา', 'bplaa', 'noun'),
];

export const restaurantEntries = [...restaurantEntriesCore, ...restaurantEntriesExtra];
