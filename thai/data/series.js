export const SERIES_DEFINITIONS = [
  { id: 'restaurant-taste', scene: 'restaurant', label: '口味', members: ['辣', '甜', '酸', '咸', '淡'] },
  { id: 'restaurant-adjust', scene: 'restaurant', label: '点单调整', members: ['要', '不要 / 不要这个', '加 / 增加', '少一点', '多一点'] },
  { id: 'restaurant-drink-basic', scene: 'restaurant', label: '饮品基础', members: ['水', '冰'] },
  { id: 'restaurant-staples', scene: 'restaurant', label: '主食', members: ['米饭', '面'] },
  { id: 'restaurant-protein', scene: 'restaurant', label: '肉类食材', members: ['肉', '鸡', '猪', '鱼'] },

  { id: 'coffee-ingredients', scene: 'coffee', label: '饮品与原料', members: ['咖啡', '茶', '奶', '糖'] },
  { id: 'coffee-sweetness', scene: 'coffee', label: '甜度', members: ['甜', '不甜', '少甜'] },
  { id: 'coffee-temperature', scene: 'coffee', label: '温度 / 冰量', members: ['热', '冷', '冰', '少冰', '不加冰'] },
  { id: 'coffee-size', scene: 'coffee', label: '杯型', members: ['大杯', '小杯'] },
  { id: 'coffee-place', scene: 'coffee', label: '饮用方式', members: ['外带', '在这里喝'] },
  { id: 'coffee-strength', scene: 'coffee', label: '浓度', members: ['浓', '淡'] },

  { id: 'convenience-stock', scene: 'convenience', label: '找货 / 库存', members: ['找', '有吗', '没有'] },
  { id: 'convenience-demonstrative', scene: 'convenience', label: '指示', members: ['这个', '那个'] },
  { id: 'convenience-count', scene: 'convenience', label: '数量', members: ['一个', '两个'] },
  { id: 'convenience-bag', scene: 'convenience', label: '袋子', members: ['袋子', '不要袋子'] },
  { id: 'convenience-payment', scene: 'convenience', label: '结账付款', members: ['多少钱', '现金', '扫码', '卡', '收据'] },
  { id: 'convenience-electronics', scene: 'convenience', label: '电子配件', members: ['充电器', '电池'] },
  { id: 'convenience-daily', scene: 'convenience', label: '日用品', members: ['纸巾', '洗发水'] },

  { id: 'market-price', scene: 'market', label: '价格 / 砍价', members: ['贵', '便宜', '多少钱', '再便宜一点'] },
  { id: 'market-weight', scene: 'market', label: '重量', members: ['一公斤', '半公斤', '称'] },
  { id: 'market-ripeness', scene: 'market', label: '新鲜 / 成熟度', members: ['新鲜', '熟', '生'] },
  { id: 'market-taste', scene: 'market', label: '味道', members: ['甜', '酸'] },
  { id: 'market-size', scene: 'market', label: '大小', members: ['大', '小'] },
  { id: 'market-demonstrative', scene: 'market', label: '指示', members: ['这个', '那个'] },
  { id: 'market-select', scene: 'market', label: '挑选', members: ['要', '不要', '帮我挑'] },

  { id: 'taxi-destination', scene: 'taxi', label: '目的地', members: ['去', '到这里', '地址'] },
  { id: 'taxi-route', scene: 'taxi', label: '路线', members: ['左转', '右转', '直走', '掉头'] },
  { id: 'taxi-stop', scene: 'taxi', label: '到达 / 停车', members: ['停这里', '到了', '我下车'] },
  { id: 'taxi-position', scene: 'taxi', label: '方位', members: ['前面', '后面'] },
  { id: 'taxi-speed', scene: 'taxi', label: '速度', members: ['快一点', '慢一点'] },
  { id: 'taxi-expressway', scene: 'taxi', label: '高速', members: ['高速', '不走高速'] },
  { id: 'taxi-fare', scene: 'taxi', label: '计价', members: ['多少钱', '打表'] },

  { id: 'motorbike-gear', scene: 'motorbike', label: '骑车装备', members: ['摩托车', '头盔', '钥匙'] },
  { id: 'motorbike-parking', scene: 'motorbike', label: '停车', members: ['停车', '停这里', '禁止停车', '入口'] },
  { id: 'motorbike-check', scene: 'motorbike', label: '车辆检查', members: ['油', '轮胎', '胎压', '刹车'] },
  { id: 'motorbike-repair', scene: 'motorbike', label: '维修', members: ['坏了', '修', '换'] },
  { id: 'motorbike-rent', scene: 'motorbike', label: '租车', members: ['租', '一天', '一个月', '多少钱'] },
  { id: 'motorbike-safety', scene: 'motorbike', label: '安全', members: ['慢一点', '小心'] },

  { id: 'directions-position', scene: 'directions', label: '方位', members: ['左边', '右边', '前面', '后面', '楼上', '楼下'] },
  { id: 'directions-distance', scene: 'directions', label: '距离', members: ['附近', '远', '近'] },
  { id: 'directions-place', scene: 'directions', label: '地点问答', members: ['哪里', '在哪里', '这里', '那里'] },
  { id: 'directions-floor', scene: 'directions', label: '楼层', members: ['一楼', '二楼'] },
  { id: 'directions-entry', scene: 'directions', label: '出入口 / 路口', members: ['入口', '出口', '路口'] },
  { id: 'directions-move', scene: 'directions', label: '移动', members: ['直走', '走路'] },

  { id: 'petrol-fuel', scene: 'petrol', label: '油品', members: ['汽油', '柴油', '91', '95', 'E20'] },
  { id: 'petrol-fill', scene: 'petrol', label: '加油方式', members: ['加油', '加满', '加500铢'] },
  { id: 'petrol-payment', scene: 'petrol', label: '付款', members: ['多少钱', '现金', '扫码', '收据'] },
  { id: 'petrol-tire', scene: 'petrol', label: '轮胎', members: ['胎压', '充气'] },
  { id: 'petrol-facility', scene: 'petrol', label: '站内设施', members: ['水', '厕所', '便利店'] },
  { id: 'petrol-entry', scene: 'petrol', label: '出入口', members: ['入口', '出口'] },

  { id: 'delivery-type', scene: 'delivery', label: '配送类型', members: ['快递', '外卖'] },
  { id: 'delivery-status', scene: 'delivery', label: '配送状态', members: ['送到', '到了', '找不到'] },
  { id: 'delivery-dropoff', scene: 'delivery', label: '交付位置', members: ['在楼下', '在大厅', '放门口', '放前台'] },
  { id: 'delivery-contact', scene: 'delivery', label: '联系', members: ['打电话', '不用打电话'] },
  { id: 'delivery-receive', scene: 'delivery', label: '接货', members: ['等一下', '马上下来'] },
  { id: 'delivery-location', scene: 'delivery', label: '地址 / 找路', members: ['房间号', '地址', '入口', '电梯'] },
  { id: 'delivery-payment', scene: 'delivery', label: '付款', members: ['现金', '扫码'] },

  { id: 'condo-home', scene: 'condo', label: '住所', members: ['公寓', '房间'] },
  { id: 'condo-lease', scene: 'condo', label: '租约', members: ['房租', '押金', '合同', '一个月', '一年', '续租', '搬走'] },
  { id: 'condo-staff', scene: 'condo', label: '物业', members: ['物业', '前台'] },
  { id: 'condo-access', scene: 'condo', label: '门禁', members: ['门卡', '钥匙'] },
  { id: 'condo-facility', scene: 'condo', label: '公共设施', members: ['游泳池', '健身房'] },
  { id: 'condo-bills', scene: 'condo', label: '生活费用', members: ['电费', '水费', '网络'] },

  { id: 'repairs-request', scene: 'repairs', label: '报修', members: ['坏了', '修', '可以来吗', '修好了吗'] },
  { id: 'repairs-time', scene: 'repairs', label: '时间', members: ['什么时候', '今天', '明天'] },
  { id: 'repairs-ac', scene: 'repairs', label: '空调', members: ['空调', '不冷'] },
  { id: 'repairs-water', scene: 'repairs', label: '水', members: ['漏水', '没水'] },
  { id: 'repairs-electricity', scene: 'repairs', label: '电', members: ['停电', '灯', '插座'] },
  { id: 'repairs-lock', scene: 'repairs', label: '门锁', members: ['门', '锁'] },
  { id: 'repairs-appliances', scene: 'repairs', label: '家电', members: ['冰箱', '洗衣机', '热水器'] },

  { id: 'laundry-service', scene: 'laundry', label: '洗衣服务', members: ['洗衣', '烘干', '熨衣服', '干洗'] },
  { id: 'laundry-machine', scene: 'laundry', label: '机器', members: ['洗衣机', '烘干机'] },
  { id: 'laundry-supplies', scene: 'laundry', label: '洗涤用品', members: ['洗衣液', '柔顺剂'] },
  { id: 'laundry-unit', scene: 'laundry', label: '计价单位', members: ['一公斤', '一件'] },
  { id: 'laundry-color', scene: 'laundry', label: '颜色', members: ['白色', '彩色'] },
  { id: 'laundry-method', scene: 'laundry', label: '洗法', members: ['一起洗', '分开洗'] },
  { id: 'laundry-pickup', scene: 'laundry', label: '取衣时间', members: ['今天', '明天', '几点取', '取衣服'] },

  { id: 'massage-type', scene: 'massage', label: '按摩类型', members: ['按摩', '泰式按摩', '精油按摩', '脚底按摩'] },
  { id: 'massage-body', scene: 'massage', label: '身体部位', members: ['头', '肩膀', '背', '腿', '脚'] },
  { id: 'massage-pressure', scene: 'massage', label: '力度 / 感受', members: ['痛', '轻一点', '重一点'] },
  { id: 'massage-permission', scene: 'massage', label: '许可', members: ['可以', '不可以'] },
  { id: 'massage-duration', scene: 'massage', label: '时长', members: ['一小时', '两小时'] },
  { id: 'massage-time', scene: 'massage', label: '预约 / 时间', members: ['预约', '现在', '等多久'] },

  { id: 'hospital-place', scene: 'hospital', label: '地点', members: ['医院', '药店'] },
  { id: 'hospital-symptoms', scene: 'hospital', label: '症状', members: ['生病', '发烧', '咳嗽', '喉咙痛', '头痛', '肚子痛', '拉肚子', '过敏', '受伤'] },
  { id: 'hospital-pain', scene: 'hospital', label: '疼痛程度', members: ['痛', '很痛'] },
  { id: 'hospital-onset', scene: 'hospital', label: '发病时间', members: ['什么时候开始', '今天', '昨天'] },
  { id: 'hospital-medicine', scene: 'hospital', label: '用药问题', members: ['吃几次', '有副作用吗'] },

  { id: 'bank-account', scene: 'bank', label: '账户', members: ['银行', '账户', '账号'] },
  { id: 'bank-payment', scene: 'bank', label: '付款方式', members: ['现金', '卡', '扫码', '二维码', '可以刷卡吗'] },
  { id: 'bank-business', scene: 'bank', label: '银行业务', members: ['转账', '开户', '取钱', '存钱', '换钱'] },
  { id: 'bank-verify', scene: 'bank', label: '验证', members: ['密码', '签名'] },
  { id: 'bank-result', scene: 'bank', label: '结果', members: ['失败', '成功'] },
  { id: 'bank-money', scene: 'bank', label: '货币 / 费用', members: ['泰铢', '手续费'] },

  { id: 'mobile-plan', scene: 'mobile', label: '手机 / 套餐', members: ['手机', 'SIM卡', '套餐', '流量', '充值'] },
  { id: 'mobile-subscription', scene: 'mobile', label: '订阅', members: ['一个月', '自动续费', '取消'] },
  { id: 'mobile-contact', scene: 'mobile', label: '联系', members: ['电话', '号码', '打电话', '接电话', '发消息'] },
  { id: 'mobile-network', scene: 'mobile', label: '网络 / 信号', members: ['网络', 'Wi-Fi', '信号', '没信号', '网速慢'] },
  { id: 'mobile-settings', scene: 'mobile', label: '设置 / 处理', members: ['密码', '重启'] },

  { id: 'greetings-hello', scene: 'greetings', label: '见面 / 告别', members: ['你好', '再见'] },
  { id: 'greetings-thanks', scene: 'greetings', label: '感谢', members: ['谢谢', '不客气'] },
  { id: 'greetings-apology', scene: 'greetings', label: '道歉 / 回应', members: ['对不起 / 抱歉', '不好意思', '没关系', '没事'] },
  { id: 'greetings-permission', scene: 'greetings', label: '许可', members: ['可以 / 能', '不可以'] },
  { id: 'greetings-yesno', scene: 'greetings', label: '判断', members: ['是', '不是'] },
  { id: 'greetings-existence', scene: 'greetings', label: '有无', members: ['有', '没有'] },
  { id: 'greetings-know', scene: 'greetings', label: '知道', members: ['知道', '不知道'] },
  { id: 'greetings-understand', scene: 'greetings', label: '理解', members: ['明白', '不明白'] },
  { id: 'greetings-wait', scene: 'greetings', label: '等待 / 节奏', members: ['等一下', '慢慢来'] },

  { id: 'friends-date', scene: 'friends', label: '日期', members: ['今天', '明天', '昨天', '下次'] },
  { id: 'friends-time', scene: 'friends', label: '约时间', members: ['有空吗', '什么时候', '几点'] },
  { id: 'friends-activity', scene: 'friends', label: '约活动', members: ['一起去', '去哪里', '吃饭', '喝一杯'] },
  { id: 'friends-arrival', scene: 'friends', label: '到达状态', members: ['我到了', '还没到', '快到了'] },
  { id: 'friends-feeling', scene: 'friends', label: '感受', members: ['很累', '很开心'] },
  { id: 'friends-like', scene: 'friends', label: '喜好', members: ['很喜欢', '不喜欢'] },
  { id: 'friends-response', scene: 'friends', label: '回应 / 联系', members: ['没问题', '联系我'] }
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
