import { makeEntry } from './factory.js';

export const bankEntries = [
  makeEntry('bank', '01', '银行', 'ธนาคาร', 'thá-naa-khaan', 'noun'),
  makeEntry('bank', '02', '现金', 'เงินสด', 'ngoen sòt', 'noun'),
  makeEntry('bank', '03', '卡', 'บัตร', 'bàt', 'noun'),
  makeEntry('bank', '04', '转账', 'โอนเงิน', 'oon ngoen', 'verb'),
  makeEntry('bank', '05', '扫码', 'สแกนจ่าย', 'sà-gaen jàai', 'verb'),
  makeEntry('bank', '06', '二维码', 'คิวอาร์โค้ด', 'khiu-aa khôot', 'noun'),
  makeEntry('bank', '07', '账户', 'บัญชี', 'ban-chii', 'noun'),
  makeEntry('bank', '08', '账号', 'เลขบัญชี', 'lêek ban-chii', 'noun'),
  makeEntry('bank', '09', '开户', 'เปิดบัญชี', 'bpə̀ət ban-chii', 'verb'),
  makeEntry('bank', '10', '取钱', 'ถอนเงิน', 'thɔ̌ɔn ngoen', 'verb'),
  makeEntry('bank', '11', '存钱', 'ฝากเงิน', 'fàak ngoen', 'verb'),
  makeEntry('bank', '12', '换钱', 'แลกเงิน', 'lâaek ngoen', 'verb'),
  makeEntry('bank', '13', '泰铢', 'บาท', 'bàat', 'noun'),
  makeEntry('bank', '14', '手续费', 'ค่าธรรมเนียม', 'khâa tham-niam', 'noun'),
  makeEntry('bank', '15', '密码', 'รหัส', 'rá-hàt', 'noun'),
  makeEntry('bank', '16', '签名', 'ลายเซ็น', 'laai-sen', 'noun'),
  makeEntry('bank', '17', '收据', 'ใบเสร็จ', 'bai-sèt', 'noun'),
  makeEntry('bank', '18', '失败', 'ไม่สำเร็จ', 'mâi sǎm-rèt', 'answer'),
  makeEntry('bank', '19', '成功', 'สำเร็จ', 'sǎm-rèt', 'answer'),
  makeEntry('bank', '20', '可以刷卡吗', 'จ่ายบัตรได้ไหม', 'jàai bàt dâi mái', 'question'),
];
