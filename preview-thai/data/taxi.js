import { makeEntry } from './factory.js';

export const taxiEntries = [
  makeEntry('taxi', '01', '去', 'ไป', 'bpai', 'verb'),
  makeEntry('taxi', '02', '到这里', 'ไปที่นี่', 'bpai thîi-nîi', 'request'),
  makeEntry('taxi', '03', '地址', 'ที่อยู่', 'thîi-yùu', 'noun'),
  makeEntry('taxi', '04', '左转', 'เลี้ยวซ้าย', 'líao sáai', 'request'),
  makeEntry('taxi', '05', '右转', 'เลี้ยวขวา', 'líao khwǎa', 'request'),
  makeEntry('taxi', '06', '直走', 'ตรงไป', 'dtrong bpai', 'request'),
  makeEntry('taxi', '07', '掉头', 'กลับรถ', 'glàp rót', 'request'),
  makeEntry('taxi', '08', '停这里', 'จอดตรงนี้', 'jɔ̀ɔt dtrong níi', 'request'),
  makeEntry('taxi', '09', '前面', 'ข้างหน้า', 'khâang-nâa', 'place'),
  makeEntry('taxi', '10', '后面', 'ข้างหลัง', 'khâang-lǎng', 'place'),
  makeEntry('taxi', '11', '快一点', 'เร็วหน่อย', 'reo nòi', 'request'),
  makeEntry('taxi', '12', '慢一点', 'ช้าหน่อย', 'cháa nòi', 'request'),
  makeEntry('taxi', '13', '堵车', 'รถติด', 'rót dtìt', 'answer'),
  makeEntry('taxi', '14', '高速', 'ทางด่วน', 'thaang-dùan', 'noun'),
  makeEntry('taxi', '15', '不走高速', 'ไม่ขึ้นทางด่วน', 'mâi khʉ̂n thaang-dùan', 'request'),
  makeEntry('taxi', '16', '多少钱', 'เท่าไหร่', 'thâo-rài', 'question'),
  makeEntry('taxi', '17', '打表', 'กดมิเตอร์', 'gòt mí-dtôe', 'request'),
  makeEntry('taxi', '18', '等一下', 'รอแป๊บหนึ่ง', 'rɔɔ bpáep nʉ̀ng', 'request'),
  makeEntry('taxi', '19', '到了', 'ถึงแล้ว', 'thʉ̌ng láeo', 'answer'),
  makeEntry('taxi', '20', '我下车', 'ลงตรงนี้', 'long dtrong níi', 'request'),
];
