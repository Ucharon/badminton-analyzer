import type { OrderRow, Activity } from '../../types/order';
import dayjs from 'dayjs';
import { VENUE_ALIASES } from '../../lib/constants';

// 过滤订单：只保留已完成的订单
export function filterOrders(orders: OrderRow[]) {
  const completed = orders.filter((o) => o.结算状态 === '已完成');

  const outgoing = completed.filter((o) => o['出款/入款'] === '出款(-)');
  const incoming = completed.filter((o) => o['出款/入款'] === '入款(+)');

  const totalOutgoing = outgoing.reduce((sum, o) => sum + o.金额, 0);
  const totalIncoming = incoming.reduce((sum, o) => sum + o.金额, 0);
  const netSpent = totalOutgoing - totalIncoming;

  return {
    completed,
    outgoing,
    incoming,
    totalOutgoing,
    totalIncoming,
    netSpent,
  };
}

// 合并活动：将"报名支付"+"少补支付"合并为一次活动
// 新增：识别多名额报名，按实际名额数拆分
export function mergeActivities(orders: OrderRow[]): Activity[] {
  // 创建活动ID映射
  const activityMap = new Map<string, OrderRow[]>();

  orders.forEach((order) => {
    const startTime = dayjs(order.活动开始时间);
    const activityId = `${order.活动标题}_${startTime.format('YYYYMMDDHHmm')}_${order.发布者}`;

    if (!activityMap.has(activityId)) {
      activityMap.set(activityId, []);
    }
    activityMap.get(activityId)!.push(order);
  });

  // 转换为Activity对象，并按名额数拆分
  const activities: Activity[] = [];

  activityMap.forEach((orderList, activityId) => {
    const firstOrder = orderList[0];
    const totalAmount = orderList.reduce((sum, o) => sum + o.金额, 0);
    const paymentTypes = orderList.map((o) => o.支付方式);
    const earliestPayment = orderList
      .map((o) => dayjs(o.支付时间))
      .sort((a, b) => a.unix() - b.unix())[0];

    // 统计报名支付和少补支付的数量
    const signupCount = paymentTypes.filter((p) => p === '报名支付').length;
    const supplementCount = paymentTypes.filter((p) => p === '少补支付').length;

    // 计算实际名额数：
    // 1. 如果报名和少补数量相同，说明是正常配对，名额数 = 报名数
    // 2. 如果报名 > 少补，说明部分没有少补，名额数 = 报名数
    // 3. 如果少补 > 报名（理论上不应该出现），名额数 = max(报名, 少补)
    const slotCount = Math.max(signupCount, supplementCount);

    // 计算每个名额的平均金额
    const averageAmountPerSlot = slotCount > 0 ? totalAmount / slotCount : totalAmount;

    // 根据名额数，生成对应数量的活动记录
    for (let i = 0; i < slotCount; i++) {
      const activity: Activity = {
        活动ID: `${activityId}_slot${i + 1}`, // 添加名额编号
        活动标题: firstOrder.活动标题,
        活动开始时间: dayjs(firstOrder.活动开始时间).toDate(),
        发布者: firstOrder.发布者,
        原始订单数: orderList.length,
        总金额: averageAmountPerSlot, // 分摊到每个名额的金额
        支付时间: earliestPayment.toDate(),
        包含报名支付: paymentTypes.includes('报名支付'),
        包含少补支付: paymentTypes.includes('少补支付'),
        订单详情: paymentTypes,
        活动类型: extractActivityType(firstOrder.活动标题),
        报名名额数: slotCount, // 该活动组的总名额数
        是否多人报名: slotCount > 1, // 是否帮多人报名
      };

      activities.push(activity);
    }
  });

  // 按时间排序
  return activities.sort(
    (a, b) => a.活动开始时间.getTime() - b.活动开始时间.getTime()
  );
}

// 识别活动类型（场馆）- 改进版
export function extractActivityType(title: string): string {
  if (!title) return '其他活动';

  const normalized = title.replace(/\s+/g, '');
  const normalizedLower = normalized.toLowerCase();

  // 策略1: 优先解析【组织者·场馆】格式
  const dotMatch = normalized.match(/【([^·】]+)·([^】]+)】/);
  if (dotMatch) {
    const venueRaw = dotMatch[2]; // 提取"·"右侧的场馆名
    const venue = mapVenueAlias(venueRaw);
    if (venue !== '其他活动') {
      return venue;
    }
  }

  // 策略2: 如果没有格式，使用关键词匹配
  for (const [standardName, aliases] of Object.entries(VENUE_ALIASES)) {
    for (const alias of aliases) {
      if (normalizedLower.includes(alias.toLowerCase())) {
        return standardName;
      }
    }
  }

  return '其他活动';
}

// 将场馆原始名称映射到标准名称
function mapVenueAlias(venueRaw: string): string {
  const venueLower = venueRaw.toLowerCase();

  for (const [standardName, aliases] of Object.entries(VENUE_ALIASES)) {
    for (const alias of aliases) {
      if (venueLower.includes(alias.toLowerCase())) {
        return standardName;
      }
    }
  }

  return '其他活动';
}

