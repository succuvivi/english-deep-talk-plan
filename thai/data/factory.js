const EXACT = new Map(Object.entries({
  'mai': '卖', 'ao': '奥', 'dai': '戴', 'mii': '米', 'mee': '米', 'khop': '扩', 'khun': '坤',
  'kha': '卡', 'na': '纳', 'noi': '诺伊', 'maak': '马', 'nii': '尼', 'nan': '南', 'rai': '莱',
  'thao': '套', 'yang': '扬', 'laeo': '廖', 'bpai': '拜', 'maa': '玛', 'wan': '弯', 'khaw': '靠',
  'khao': '靠', 'sawat': '萨瓦', 'dii': '滴', 'phom': '彭', 'phet': '配特', 'waan': '玩',
  'yen': '烟', 'ron': '隆', 'suai': '水', 'gin': '金', 'naam': '南', 'khao': '靠', 'moo': '木',
  'gai': '盖', 'bplaa': '布拉', 'khai': '凯', 'baan': '班', 'hong': '宏', 'rot': '洛特', 'thii': '提',
  'nai': '奈', 'sai': '塞', 'saa': '萨', 'khwaa': '夸', 'saai': '赛', 'trong': '宗', 'jot': '佐特',
  'reo': '雷欧', 'chaa': '查', 'rɔɔ': '罗', 'bpáep': '贝普', 'ngoen': '恩', 'sot': '索特',
  'ya': '亚', 'yaa': '亚', 'mɔɔ': '莫', 'muu': '木', 'fai': '法伊', 'lom': '隆', 'yaang': '央',
  'thoo': '托', 'ha': '哈', 'rap': '拉普', 'song': '宋', 'phaa': '帕', 'nuaat': '努阿特'
}));

function cleanToken(token) {
  return token.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Zɔəʉœɯ]+/g, '').toLowerCase();
}

function approxToken(token) {
  const clean = cleanToken(token);
  if (!clean) return '';
  if (EXACT.has(clean)) return EXACT.get(clean);

  const initials = [
    ['kh', '卡'], ['ph', '坡'], ['th', '塔'], ['ch', '查'], ['bp', '巴'], ['dt', '达'], ['ng', '昂'],
    ['k', '卡'], ['g', '嘎'], ['p', '帕'], ['b', '巴'], ['t', '塔'], ['d', '达'], ['m', '马'],
    ['n', '纳'], ['r', '拉'], ['l', '拉'], ['w', '瓦'], ['y', '亚'], ['s', '萨'], ['h', '哈'], ['f', '发'], ['j', '甲']
  ];
  const initial = initials.find(([latin]) => clean.startsWith(latin))?.[1] || '阿';
  let vowel = '啊';
  if (clean.includes('ai')) vowel = '爱';
  else if (clean.includes('ao')) vowel = '奥';
  else if (clean.includes('ii') || clean.includes('ee')) vowel = '依';
  else if (clean.includes('uu') || clean.includes('ʉ') || clean.includes('u')) vowel = '乌';
  else if (clean.includes('ae')) vowel = '诶';
  else if (clean.includes('oe') || clean.includes('ə')) vowel = '额';
  else if (clean.includes('oo') || clean.includes('ɔ') || clean.includes('o')) vowel = '欧';
  else if (clean.includes('e')) vowel = '诶';
  else if (clean.includes('i')) vowel = '伊';
  return initial + vowel;
}

export function roughZh(roman) {
  return String(roman || '')
    .split(/[\s\-/]+/)
    .map(approxToken)
    .filter(Boolean)
    .join(' ');
}

function phrase(th, roman, zh) {
  return { th, roman, zh, zhPron: roughZh(roman), audio: null };
}

function generatedPhrases(kind, zh, th, roman) {
  switch (kind) {
    case 'adj':
      return {
        collocations: [
          phrase(`${th}มาก`, `${roman} mâak`, `很${zh}`),
          phrase(`ไม่${th}`, `mâi ${roman}`, `不${zh}`)
        ],
        examples: [
          phrase(`อันนี้${th}ไหมคะ`, `an-níi ${roman} mái kha`, `这个${zh}吗？`),
          phrase(`${th}ไปค่ะ`, `${roman} bpai kha`, `太${zh}了。`)
        ]
      };
    case 'verb':
      return {
        collocations: [
          phrase(`ช่วย${th}หน่อย`, `chûai ${roman} nòi`, `请帮忙${zh}一下`),
          phrase(`${th}ได้ไหม`, `${roman} dâi mái`, `可以${zh}吗`)
        ],
        examples: [
          phrase(`ช่วย${th}หน่อยค่ะ`, `chûai ${roman} nòi kha`, `请帮我${zh}一下。`),
          phrase(`${th}ได้ไหมคะ`, `${roman} dâi mái kha`, `可以${zh}吗？`)
        ]
      };
    case 'request':
      return {
        collocations: [
          phrase(th, roman, zh),
          phrase(`${th}นะคะ`, `${roman} ná kha`, `${zh}（语气更柔和）`)
        ],
        examples: [
          phrase(`${th}ค่ะ`, `${roman} kha`, `${zh}。`),
          phrase(`${th}นะคะ`, `${roman} ná kha`, `${zh}，麻烦了。`)
        ]
      };
    case 'place':
      return {
        collocations: [
          phrase(`อยู่${th}`, `yùu ${roman}`, `在${zh}`),
          phrase(`ไปทาง${th}`, `bpai thaang ${roman}`, `往${zh}走`)
        ],
        examples: [
          phrase(`อยู่${th}ค่ะ`, `yùu ${roman} kha`, `在${zh}。`),
          phrase(`ไปทาง${th}ค่ะ`, `bpai thaang ${roman} kha`, `往${zh}走。`)
        ]
      };
    case 'question':
      return {
        collocations: [
          phrase(th, roman, zh),
          phrase(`ขอถามว่า ${th}`, `khɔ̌ɔ thǎam wâa ${roman}`, `想问一下：${zh}`)
        ],
        examples: [
          phrase(`${th}คะ`, `${roman} kha`, `${zh}？`),
          phrase(`ขอถามหน่อยค่ะ ${th}`, `khɔ̌ɔ thǎam nòi kha ${roman}`, `请问，${zh}？`)
        ]
      };
    case 'answer':
      return {
        collocations: [
          phrase(`${th}ค่ะ`, `${roman} kha`, `${zh}（礼貌回答）`),
          phrase(`${th}นะคะ`, `${roman} ná kha`, `${zh}（语气更柔和）`)
        ],
        examples: [
          phrase(`${th}ค่ะ`, `${roman} kha`, `${zh}。`),
          phrase(`ตอนนี้${th}ค่ะ`, `dton-níi ${roman} kha`, `现在${zh}。`)
        ]
      };
    case 'time':
      return {
        collocations: [
          phrase(th, roman, zh),
          phrase(`${th}นี้`, `${roman} níi`, `${zh}这次 / 这个时间`)
        ],
        examples: [
          phrase(`${th}ได้ไหมคะ`, `${roman} dâi mái kha`, `${zh}可以吗？`),
          phrase(`${th}ฉันว่างค่ะ`, `${roman} chǎn wâang kha`, `我${zh}有空。`)
        ]
      };
    default:
      return {
        collocations: [
          phrase(`มี${th}ไหม`, `mii ${roman} mái`, `有${zh}吗`),
          phrase(`${th}อยู่ที่ไหน`, `${roman} yùu thîi nǎi`, `${zh}在哪里`)
        ],
        examples: [
          phrase(`มี${th}ไหมคะ`, `mii ${roman} mái kha`, `有${zh}吗？`),
          phrase(`${th}อยู่ที่ไหนคะ`, `${roman} yùu thîi nǎi kha`, `${zh}在哪里？`)
        ]
      };
  }
}

export function makeEntry(scene, key, zh, th, roman, kind = 'noun', keywords = [], overrides = {}) {
  const generated = generatedPhrases(kind, zh, th, roman);
  return {
    id: `${scene}-${key}`,
    scene: [scene],
    zh,
    th,
    roman,
    zhPron: overrides.zhPron || roughZh(roman),
    type: overrides.type || ({ adj: '形容词', verb: '动词', request: '常用表达', question: '问句', answer: '常用回答', time: '时间表达', place: '方位' }[kind] || '名词'),
    audio: overrides.audio ?? null,
    keywords,
    collocations: overrides.collocations || generated.collocations,
    examples: overrides.examples || generated.examples
  };
}
