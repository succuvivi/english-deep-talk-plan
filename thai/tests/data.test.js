import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENES } from '../data/scenes.js';
import { ENTRIES } from '../data/index.js';
import { SERIES_DEFINITIONS } from '../data/series.js';

const sceneIds = new Set(SCENES.map(s => s.id));

test('scene registry contains exactly 18 unique scenes', () => {
  assert.equal(SCENES.length, 18);
  assert.equal(sceneIds.size, 18);
});

test('seed vocabulary has unique IDs and valid playable data', () => {
  const ids = new Set();
  for (const entry of ENTRIES) {
    assert.ok(entry.id && !ids.has(entry.id));
    ids.add(entry.id);
    assert.ok(entry.scene.length >= 1 && entry.scene.every(id => sceneIds.has(id)));
    assert.ok(entry.zh && entry.th && entry.roman && entry.zhPron);
    assert.doesNotMatch(entry.roman, /[\u0E00-\u0E7F]/, `${entry.id} romanization contains Thai script`);
    assert.ok(Array.isArray(entry.collocations) && entry.collocations.length >= 2);
    assert.ok(Array.isArray(entry.examples) && entry.examples.length >= 2);
    for (const item of [...entry.collocations, ...entry.examples]) {
      assert.ok(item.th && item.roman && item.zh);
      assert.doesNotMatch(item.roman, /[\u0E00-\u0E7F]/, `${entry.id} phrase romanization contains Thai script`);
    }
  }
});

const REQUIRED_COUNTS = new Map([
  ['restaurant', 20], ['coffee', 20], ['convenience', 20], ['market', 20],
  ['taxi', 20], ['motorbike', 20], ['directions', 20], ['petrol', 20],
  ['delivery', 20], ['condo', 20], ['repairs', 20], ['laundry', 20],
  ['massage', 20], ['hospital', 20], ['bank', 20], ['mobile', 20],
  ['greetings', 20], ['friends', 20]
]);

test('every v1 scene has at least 20 vocabulary entries', () => {
  for (const [scene, min] of REQUIRED_COUNTS) {
    const count = ENTRIES.filter(entry => entry.scene.includes(scene)).length;
    assert.ok(count >= min, `${scene} has ${count}, expected >= ${min}`);
  }
});

test('series definitions resolve to unique entries and contain at least two members', () => {
  const assigned = new Set();

  for (const definition of SERIES_DEFINITIONS) {
    assert.ok(definition.id && definition.scene && definition.label);
    assert.ok(definition.members.length >= 2, `${definition.id} needs >= 2 members`);
    assert.equal(new Set(definition.members).size, definition.members.length, `${definition.id} has duplicate member labels`);

    for (const zh of definition.members) {
      const matches = ENTRIES.filter(entry => entry.scene.includes(definition.scene) && entry.zh === zh);
      assert.equal(matches.length, 1, `${definition.id}:${zh} must resolve exactly once`);
      const key = `${definition.scene}:${matches[0].id}`;
      assert.ok(!assigned.has(key), `${matches[0].id} appears in more than one series in the same scene`);
      assigned.add(key);
    }
  }
});

test('enriched entries expose consistent ordered series metadata', () => {
  const grouped = new Map();
  for (const entry of ENTRIES.filter(entry => entry.seriesId)) {
    if (!grouped.has(entry.seriesId)) grouped.set(entry.seriesId, []);
    grouped.get(entry.seriesId).push(entry);
  }

  for (const definition of SERIES_DEFINITIONS) {
    const members = grouped.get(definition.id) || [];
    assert.equal(members.length, definition.members.length, `${definition.id} member count mismatch`);
    assert.deepEqual(
      members.sort((a, b) => a.seriesOrder - b.seriesOrder).map(entry => entry.zh),
      definition.members
    );
    assert.ok(members.every(entry => entry.seriesLabel === definition.label));
    assert.equal(new Set(members.map(entry => entry.seriesOrder)).size, members.length);
  }
});

const EXPECTED_SERIES = new Map([
  ['restaurant-protein', ['肉', '鸡', '猪', '鱼']],
  ['coffee-ingredients', ['咖啡', '茶', '奶', '糖']],
  ['restaurant-staples', ['米饭', '面']],
  ['coffee-sweetness', ['甜', '不甜', '少甜']],
  ['convenience-payment', ['多少钱', '现金', '扫码', '卡', '收据']],
  ['market-price', ['贵', '便宜', '多少钱', '再便宜一点']],
  ['taxi-route', ['左转', '右转', '直走', '掉头']],
  ['motorbike-check', ['油', '轮胎', '胎压', '刹车']],
  ['directions-position', ['左边', '右边', '前面', '后面', '楼上', '楼下']],
  ['petrol-fuel', ['汽油', '柴油', '91', '95', 'E20']],
  ['delivery-dropoff', ['在楼下', '在大厅', '放门口', '放前台']],
  ['condo-lease', ['房租', '押金', '合同', '一个月', '一年', '续租', '搬走']],
  ['repairs-appliances', ['冰箱', '洗衣机', '热水器']],
  ['laundry-service', ['洗衣', '烘干', '熨衣服', '干洗']],
  ['massage-body', ['头', '肩膀', '背', '腿', '脚']],
  ['hospital-symptoms', ['生病', '发烧', '咳嗽', '喉咙痛', '头痛', '肚子痛', '拉肚子', '过敏', '受伤']],
  ['bank-business', ['转账', '开户', '取钱', '存钱', '换钱']],
  ['mobile-contact', ['电话', '号码', '打电话', '接电话', '发消息']],
  ['greetings-apology', ['对不起 / 抱歉', '不好意思', '没关系', '没事']],
  ['friends-activity', ['一起去', '去哪里', '吃饭', '喝一杯']]
]);

test('approved scene taxonomy includes the required semantic families', () => {
  const byId = new Map(SERIES_DEFINITIONS.map(definition => [definition.id, definition]));
  for (const [id, members] of EXPECTED_SERIES) {
    assert.deepEqual(byId.get(id)?.members, members, `${id} taxonomy mismatch`);
  }
});

test('every one of the 18 scenes has semantic series coverage', () => {
  const covered = new Set(SERIES_DEFINITIONS.map(definition => definition.scene));
  assert.deepEqual([...sceneIds].sort(), [...covered].sort());
});

test('series classification covers most vocabulary without forcing every word', () => {
  const grouped = ENTRIES.filter(entry => entry.seriesId).length;
  assert.ok(grouped >= 300, `expected >= 300 grouped entries, got ${grouped}`);
  assert.ok(grouped < ENTRIES.length, 'some genuinely standalone vocabulary should remain');
});
