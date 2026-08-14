# Thai Word-Series Swipe Interaction — Design Spec

Date: 2026-08-14
Status: approved design, pending written-spec review

## Goal

Organize the Thai daily-life vocabulary site into **scene-local semantic word families**. Within a life scene, words that belong to the same practical category and are useful to memorize or substitute together should appear as one swipeable series.

Swiping left or right changes the **entire vocabulary card**: Chinese meaning, Thai spelling, romanization, Chinese pronunciation aid, favorite state, word playback, collocations, examples, and their playback controls all change together.

This is broader than pairing opposites. A useful series may be a category such as `咖啡 / 茶 / 奶 / 糖`, `肉 / 鸡 / 猪 / 鱼`, or `头 / 肩膀 / 背 / 腿 / 脚`.

## Classification principle

Use this rule in order:

1. Keep grouping **inside the current life scene**. Do not combine vocabulary across scenes.
2. Group words when they are naturally learned together because they are alternatives, members of the same category, a short sequence, or interchangeable choices in the same sentence pattern.
3. Prefer practical learner-facing families of roughly 2–6 items.
4. Do not force unrelated leftovers into a family merely to reduce the number of standalone cards.
5. A word belongs to at most one series inside a scene in v1.
6. Standalone words remain ordinary vocabulary cards.

The desired result is that most scene vocabulary feels organized into a handful of meaningful families, while genuinely independent words remain independent.

## Core interaction

A series renders one complete vocabulary card at a time.

Example: **肉类食材**

```text
肉  ←→  鸡  ←→  猪  ←→  鱼
```

Example: **饮品与原料**

```text
咖啡  ←→  茶  ←→  奶  ←→  糖
```

The learner can change the active item by:

- horizontal touch/pointer swipe on the card;
- `‹` and `›` buttons;
- the visible series progress, e.g. `2 / 4`, updates after every switch.

The first and last item do not wrap around.

## Swipe behavior

- Horizontal threshold: about 50 CSS pixels.
- Predominantly vertical movement must remain normal page scrolling.
- Short taps must not switch cards.
- Switching cards must call `audioEngine.stop()` first.
- The newly active card starts with `常用搭配` and `例句` collapsed.
- The active card keeps all normal controls: favorite, word playback, collocation playback, example playback.

## Full 18-scene taxonomy

### 1. 餐厅 / 路边摊 (`restaurant`)

- **口味**: 辣 / 甜 / 酸 / 咸 / 淡
- **点单调整**: 要 / 不要 / 加 / 少一点 / 多一点
- **饮品基础**: 水 / 冰
- **主食**: 米饭 / 面
- **肉类食材**: 肉 / 鸡 / 猪 / 鱼
- **Standalone**: 好吃 / 结账

### 2. 咖啡 / 奶茶 (`coffee`)

- **饮品与原料**: 咖啡 / 茶 / 奶 / 糖
- **甜度**: 甜 / 不甜 / 少甜
- **温度 / 冰量**: 热 / 冷 / 冰 / 少冰 / 不加冰
- **杯型**: 大杯 / 小杯
- **饮用方式**: 外带 / 在这里喝
- **浓度**: 浓 / 淡
- **Standalone**: 加一份 / 吸管

### 3. 便利店 / 超市 (`convenience`)

- **找货 / 库存**: 找 / 有吗 / 没有
- **指示**: 这个 / 那个
- **数量**: 一个 / 两个
- **袋子**: 袋子 / 不要袋子
- **结账付款**: 多少钱 / 现金 / 扫码 / 卡 / 收据
- **电子配件**: 充电器 / 电池
- **日用品**: 纸巾 / 洗发水
- **Standalone**: 水 / 厕所

### 4. 市场 / 水果摊 (`market`)

- **价格 / 砍价**: 贵 / 便宜 / 多少钱 / 再便宜一点
- **重量**: 一公斤 / 半公斤 / 称
- **新鲜 / 成熟度**: 新鲜 / 熟 / 生
- **味道**: 甜 / 酸
- **大小**: 大 / 小
- **指示**: 这个 / 那个
- **挑选**: 要 / 不要 / 帮我挑
- **Standalone**: 袋子

### 5. Taxi / Bolt / Grab (`taxi`)

- **目的地**: 去 / 到这里 / 地址
- **路线**: 左转 / 右转 / 直走 / 掉头
- **到达 / 停车**: 停这里 / 到了 / 我下车
- **方位**: 前面 / 后面
- **速度**: 快一点 / 慢一点
- **高速**: 高速 / 不走高速
- **计价**: 多少钱 / 打表
- **Standalone**: 堵车 / 等一下

### 6. 摩托车 / 停车 (`motorbike`)

- **骑车装备**: 摩托车 / 头盔 / 钥匙
- **停车**: 停车 / 停这里 / 禁止停车 / 入口
- **车辆检查**: 油 / 轮胎 / 胎压 / 刹车
- **维修**: 坏了 / 修 / 换
- **租车**: 租 / 一天 / 一个月 / 多少钱
- **安全**: 慢一点 / 小心

### 7. 问路 / 找地方 (`directions`)

- **方位**: 左边 / 右边 / 前面 / 后面 / 楼上 / 楼下
- **距离**: 附近 / 远 / 近
- **地点问答**: 哪里 / 在哪里 / 这里 / 那里
- **楼层**: 一楼 / 二楼
- **出入口 / 路口**: 入口 / 出口 / 路口
- **移动**: 直走 / 走路

### 8. 加油站 (`petrol`)

- **油品**: 汽油 / 柴油 / 91 / 95 / E20
- **加油方式**: 加油 / 加满 / 加500铢
- **付款**: 多少钱 / 现金 / 扫码 / 收据
- **轮胎**: 胎压 / 充气
- **站内设施**: 水 / 厕所 / 便利店
- **出入口**: 入口 / 出口
- **Standalone**: 等一下

### 9. 快递 / 外卖 (`delivery`)

- **配送类型**: 快递 / 外卖
- **配送状态**: 送到 / 到了 / 找不到
- **交付位置**: 在楼下 / 在大厅 / 放门口 / 放前台
- **联系**: 打电话 / 不用打电话
- **接货**: 等一下 / 马上下来
- **地址 / 找路**: 房间号 / 地址 / 入口 / 电梯
- **付款**: 现金 / 扫码
- **Standalone**: 取件

### 10. 公寓 / 物业 / 租房 (`condo`)

- **住所**: 公寓 / 房间
- **租约**: 房租 / 押金 / 合同 / 一个月 / 一年 / 续租 / 搬走
- **物业**: 物业 / 前台
- **门禁**: 门卡 / 钥匙
- **公共设施**: 游泳池 / 健身房
- **生活费用**: 电费 / 水费 / 网络
- **Standalone**: 停车位 / 有问题

### 11. 维修 / 水电 / 空调 (`repairs`)

- **报修**: 坏了 / 修 / 可以来吗 / 修好了吗
- **时间**: 什么时候 / 今天 / 明天
- **空调**: 空调 / 不冷
- **水**: 漏水 / 没水
- **电**: 停电 / 灯 / 插座
- **门锁**: 门 / 锁
- **家电**: 冰箱 / 洗衣机 / 热水器
- **Standalone**: 网络

### 12. 洗衣店 (`laundry`)

- **洗衣服务**: 洗衣 / 烘干 / 熨衣服 / 干洗
- **机器**: 洗衣机 / 烘干机
- **洗涤用品**: 洗衣液 / 柔顺剂
- **计价单位**: 一公斤 / 一件
- **颜色**: 白色 / 彩色
- **洗法**: 一起洗 / 分开洗
- **取衣时间**: 今天 / 明天 / 几点取 / 取衣服
- **Standalone**: 多少钱 / 袋子

### 13. 按摩 / 美容 (`massage`)

- **按摩类型**: 按摩 / 泰式按摩 / 精油按摩 / 脚底按摩
- **身体部位**: 头 / 肩膀 / 背 / 腿 / 脚
- **力度 / 感受**: 痛 / 轻一点 / 重一点
- **许可**: 可以 / 不可以
- **时长**: 一小时 / 两小时
- **预约 / 时间**: 预约 / 现在 / 等多久
- **Standalone**: 多少钱

### 14. 医院 / 药店 (`hospital`)

- **地点**: 医院 / 药店
- **症状**: 生病 / 发烧 / 咳嗽 / 喉咙痛 / 头痛 / 肚子痛 / 拉肚子 / 过敏 / 受伤
- **疼痛程度**: 痛 / 很痛
- **发病时间**: 什么时候开始 / 今天 / 昨天
- **用药问题**: 吃几次 / 有副作用吗
- **Standalone**: 医生 / 药

Medical content remains a basic communication aid, not diagnostic advice.

### 15. 银行 / 付款 (`bank`)

- **账户**: 银行 / 账户 / 账号
- **付款方式**: 现金 / 卡 / 扫码 / 二维码 / 可以刷卡吗
- **银行业务**: 转账 / 开户 / 取钱 / 存钱 / 换钱
- **验证**: 密码 / 签名
- **结果**: 失败 / 成功
- **货币 / 费用**: 泰铢 / 手续费
- **Standalone**: 收据

### 16. 手机 / 网络 / 电话 (`mobile`)

- **手机 / 套餐**: 手机 / SIM卡 / 套餐 / 流量 / 充值
- **订阅**: 一个月 / 自动续费 / 取消
- **联系**: 电话 / 号码 / 打电话 / 接电话 / 发消息
- **网络 / 信号**: 网络 / Wi-Fi / 信号 / 没信号 / 网速慢
- **设置 / 处理**: 密码 / 重启

### 17. 日常寒暄 (`greetings`)

- **见面 / 告别**: 你好 / 再见
- **感谢**: 谢谢 / 不客气
- **道歉 / 回应**: 对不起 / 不好意思 / 没关系 / 没事
- **许可**: 可以 / 不可以
- **判断**: 是 / 不是
- **有无**: 有 / 没有
- **知道**: 知道 / 不知道
- **理解**: 明白 / 不明白
- **等待 / 节奏**: 等一下 / 慢慢来

### 18. 朋友聊天 / 社交 (`friends`)

- **日期**: 今天 / 明天 / 昨天 / 下次
- **约时间**: 有空吗 / 什么时候 / 几点
- **约活动**: 一起去 / 去哪里 / 吃饭 / 喝一杯
- **到达状态**: 我到了 / 还没到 / 快到了
- **感受**: 很累 / 很开心
- **喜好**: 很喜欢 / 不喜欢
- **回应 / 联系**: 没问题 / 联系我

## Data model

Keep the existing vocabulary entries unchanged. Series membership is a separate declarative configuration layer.

```js
{
  id: 'restaurant-protein',
  scene: 'restaurant',
  label: '肉类食材',
  members: ['肉', '鸡', '猪', '鱼']
}
```

At load time, the configuration enriches matching entries with:

```js
{
  seriesId: 'restaurant-protein',
  seriesLabel: '肉类食材',
  seriesOrder: 1
}
```

Rules:

- Definitions match existing entries by `scene + zh`.
- Every configured member must resolve exactly once.
- No entry may belong to two series within the same scene in v1.
- A configured series must have at least two members.
- Series order follows the explicit member list.
- Entries not listed in a series remain standalone.

## Rendering architecture

The current filter pipeline remains authoritative:

1. Filter `ENTRIES` by scene, search query, or favorites.
2. Group only the entries that survive filtering.
3. If at least two visible members share a series, render one swipeable series shell.
4. If only one member survives, render it as a normal single card.
5. The active member uses the same `entryHtml()` renderer as standalone cards.

This guarantees that search and favorites do not unexpectedly reveal hidden or non-matching family members.

## Search behavior

- Search remains Chinese-first.
- Searching `辣` returns `辣` as a single card if no other taste member matches the query.
- Searching a broader term that matches multiple members may show a reduced series containing only those matching members.
- Search never forces the complete family into the result set.

## Favorites behavior

- Favorites remain entry-specific.
- Favoriting `鸡` does not favorite `猪` or `鱼`.
- In `我的收藏`, two or more favorited members from the same family form a reduced series.
- One favorited member is rendered standalone.

## Audio behavior

- Existing recorded-audio-first / Thai-TTS-fallback behavior remains unchanged.
- Series navigation calls `audioEngine.stop()` before replacing the card.
- Word, collocation, and example audio stay independently playable.
- Global normal/slow speed and Thai show/hide settings still apply.

## Accessibility and touch

- Previous/next are real `<button>` elements.
- Edge buttons use native `disabled`.
- Labels describe neighbors, e.g. `上一个：鸡`, `下一个：鱼`.
- Progress exposes readable text such as `第 2 个，共 4 个`.
- Swipe is optional; buttons provide the complete interaction.
- The swipe surface uses vertical-scroll-friendly touch behavior (`touch-action: pan-y`).
- Focus remains predictable after arrow-button navigation.

## Visual treatment

Example:

```text
肉类食材                         2 / 4
左右滑动整张词卡

          ‹      [ 鸡 ]      ›

     Thai / romanization / 近似音
              🔊 听单词
        常用搭配 ▾   例句 ▾
```

Requirements:

- Only one full card is visible per series on a phone.
- Card width stays the same as a standalone vocabulary card.
- Arrow touch targets are at least 44px.
- Progress text is required; dots are optional.
- No separate carousel visual language: series should feel like an extension of the normal word card.

## Error and edge handling

- Missing configured member: fail data validation.
- Duplicate member in a family: fail validation.
- Same entry assigned twice in one scene: fail validation.
- Series reduced to one item after filtering: render standalone.
- Search/scene change resets active indexes.
- Favorite re-render clamps indexes to valid ranges.
- Missing or malformed order data falls back deterministically in rendering but remains a failing data-test condition.

## Testing strategy

### Taxonomy/data tests

Verify:

- all definitions contain at least 2 members;
- each `scene + zh` member resolves exactly once;
- no entry is assigned to two series in the same scene;
- member order is stable;
- key categories such as `restaurant-protein` and `coffee-ingredients` exist;
- standalone words are not accidentally tagged.

### Pure grouping tests

Verify:

- same-series visible entries become one ordered display group;
- one surviving member becomes standalone;
- independent series remain independent;
- original result ordering is stable by first visible member.

### Interaction tests / manual QA

Verify:

- swipe left/right changes the entire card;
- vertical page scroll remains normal;
- short tap does not navigate;
- arrows update active card and progress;
- edge arrows disable correctly;
- playing audio stops before navigation;
- new card details start collapsed;
- favorite state remains per entry;
- search `辣` renders a single card;
- restaurant `肉类食材` contains 肉 / 鸡 / 猪 / 鱼;
- coffee `饮品与原料` contains 咖啡 / 茶 / 奶 / 糖;
- all 18 scenes render their approved families without duplicate entries.

## Acceptance criteria

The taxonomy/swipe redesign is complete when:

1. All 18 scenes use the approved scene-local family taxonomy above.
2. Category relationships include both contrasts and same-category vocabulary.
3. `咖啡 / 茶 / 奶 / 糖` are one coffee-scene family.
4. `肉 / 鸡 / 猪 / 鱼` are one restaurant-scene family.
5. Each family renders one complete card at a time with swipe + arrows + progress.
6. Standalone words remain standalone.
7. Search and favorites group only visible matching entries.
8. Audio, favorites, Thai visibility, slow playback, and existing scene navigation continue to work.
9. Mobile vertical scrolling is not blocked by horizontal swipe handling.
10. Automated taxonomy/grouping regressions pass and the refreshed preview visibly demonstrates the new families.

## Explicitly out of scope

- Cross-scene families
- One word appearing in multiple families in the same scene
- Infinite / looping carousel
- Auto-advance
- Timed slideshow
- Persisting each family's active index across sessions
- Third-party carousel/gesture libraries

## Decisions confirmed with user

- Series classification is **scene-local**.
- The correct grouping principle is semantic category + practical substitutability, not just antonyms.
- The whole card switches during horizontal navigation.
- The user explicitly expects examples such as `咖啡 / 茶 / 奶 / 糖` and `肉 / 鸡 / 猪 / 鱼` to be grouped.
- The complete 18-scene taxonomy in this document was reviewed and approved conversationally before this written update.
