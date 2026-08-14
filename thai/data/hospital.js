import { makeEntry } from './factory.js';

export const hospitalEntries = [
  makeEntry('hospital', '01', '医院', 'โรงพยาบาล', 'roong-phá-yaa-baan', 'noun'),
  makeEntry('hospital', '02', '药店', 'ร้านขายยา', 'ráan khǎai yaa', 'noun'),
  makeEntry('hospital', '03', '医生', 'หมอ', 'mɔ̌ɔ', 'noun'),
  makeEntry('hospital', '04', '药', 'ยา', 'yaa', 'noun'),
  makeEntry('hospital', '05', '生病', 'ป่วย', 'bpùai', 'adj'),
  makeEntry('hospital', '06', '发烧', 'มีไข้', 'mii khâi', 'answer'),
  makeEntry('hospital', '07', '咳嗽', 'ไอ', 'ai', 'verb'),
  makeEntry('hospital', '08', '喉咙痛', 'เจ็บคอ', 'jèp khɔɔ', 'answer'),
  makeEntry('hospital', '09', '头痛', 'ปวดหัว', 'bpùat hǔa', 'answer'),
  makeEntry('hospital', '10', '肚子痛', 'ปวดท้อง', 'bpùat thɔ́ɔng', 'answer'),
  makeEntry('hospital', '11', '拉肚子', 'ท้องเสีย', 'thɔ́ɔng sǐa', 'answer'),
  makeEntry('hospital', '12', '过敏', 'แพ้', 'phɛ́ɛ', 'adj'),
  makeEntry('hospital', '13', '痛', 'เจ็บ', 'jèp', 'adj'),
  makeEntry('hospital', '14', '很痛', 'เจ็บมาก', 'jèp mâak', 'answer'),
  makeEntry('hospital', '15', '受伤', 'บาดเจ็บ', 'bàat-jèp', 'adj'),
  makeEntry('hospital', '16', '什么时候开始', 'เริ่มเมื่อไหร่', 'rœ̂m mʉ̂a-rài', 'question'),
  makeEntry('hospital', '17', '今天', 'วันนี้', 'wan-níi', 'time'),
  makeEntry('hospital', '18', '昨天', 'เมื่อวาน', 'mʉ̂a-waan', 'time'),
  makeEntry('hospital', '19', '吃几次', 'กินกี่ครั้ง', 'gin gìi khráng', 'question'),
  makeEntry('hospital', '20', '有副作用吗', 'มีผลข้างเคียงไหม', 'mii phǒn khâang-khiang mái', 'question'),
];
