export const SERIES_DEFINITIONS = [
  { id: 'restaurant-taste', scene: 'restaurant', label: '口味', members: ['甜', '辣', '酸', '咸', '淡'] },
  { id: 'restaurant-adjust', scene: 'restaurant', label: '增减', members: ['不要 / 不要这个', '加 / 增加', '少一点', '多一点'] },
  { id: 'coffee-temperature', scene: 'coffee', label: '冷热 / 冰量', members: ['热', '冷', '冰', '少冰', '不加冰'] },
  { id: 'convenience-demonstrative', scene: 'convenience', label: '这个 / 那个', members: ['这个', '那个'] },
  { id: 'convenience-count', scene: 'convenience', label: '数量', members: ['一个', '两个'] },
  { id: 'market-demonstrative', scene: 'market', label: '这个 / 那个', members: ['这个', '那个'] },
  { id: 'market-weight', scene: 'market', label: '重量', members: ['一公斤', '半公斤'] },
  { id: 'taxi-route', scene: 'taxi', label: '路线', members: ['左转', '右转', '直走', '掉头'] },
  { id: 'directions-demonstrative', scene: 'directions', label: '这里 / 那里', members: ['这里', '那里'] },
  { id: 'directions-direction', scene: 'directions', label: '方向', members: ['左边', '右边', '前面', '后面', '楼上', '楼下'] },
  { id: 'directions-distance', scene: 'directions', label: '距离', members: ['远', '近'] },
  { id: 'greetings-permission', scene: 'greetings', label: '可以 / 不可以', members: ['可以 / 能', '不可以'] },
  { id: 'greetings-existence', scene: 'greetings', label: '有 / 没有', members: ['有', '没有'] },
  { id: 'friends-date', scene: 'friends', label: '时间', members: ['今天', '明天', '昨天'] }
];

export function applySeriesMetadata(entries, definitions = SERIES_DEFINITIONS) {
  const lookup = new Map();

  definitions.forEach(definition => {
    definition.members.forEach((zh, index) => {
      lookup.set(`${definition.scene}\u0000${zh}`, {
        seriesId: definition.id,
        seriesLabel: definition.label,
        seriesOrder: index + 1
      });
    });
  });

  return entries.map(entry => {
    const scene = entry.scene?.[0];
    const metadata = lookup.get(`${scene}\u0000${entry.zh}`);
    return metadata ? { ...entry, ...metadata } : entry;
  });
}
