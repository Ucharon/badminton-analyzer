import type { OrderRow, Activity } from '../../types/order';
import dayjs from 'dayjs';
import { VENUE_KEYWORDS } from '../../lib/constants';
import { formatMonth } from '../../lib/utils';

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

  // 转换为Activity对象
  const activities: Activity[] = [];

  activityMap.forEach((orderList, activityId) => {
    const firstOrder = orderList[0];
    const totalAmount = orderList.reduce((sum, o) => sum + o.金额, 0);
    const paymentTypes = orderList.map((o) => o.支付方式);
    const earliestPayment = orderList
      .map((o) => dayjs(o.支付时间))
      .sort((a, b) => a.unix() - b.unix())[0];

    const activity: Activity = {
      活动ID: activityId,
      活动标题: firstOrder.活动标题,
      活动开始时间: dayjs(firstOrder.活动开始时间).toDate(),
      发布者: firstOrder.发布者,
      原始订单数: orderList.length,
      总金额: totalAmount,
      支付时间: earliestPayment.toDate(),
      包含报名支付: paymentTypes.includes('报名支付'),
      包含少补支付: paymentTypes.includes('少补支付'),
      订单详情: paymentTypes,
      活动类型: extractActivityType(firstOrder.活动标题),
    };

    activities.push(activity);
  });

  // 按时间排序
  return activities.sort(
    (a, b) => a.活动开始时间.getTime() - b.活动开始时间.getTime()
  );
}

// 识别活动类型（场馆）
export function extractActivityType(title: string): string {
  if (!title) return '其他活动';

  const titleLower = title.toLowerCase().replace(/\s+/g, '');

  for (const [venueName, keywords] of Object.entries(VENUE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        return getVenueDisplayName(venueName);
      }
    }
  }

  return '其他活动';
}

// 获取场馆显示名称
function getVenueDisplayName(key: string): string {
  const displayNames: Record<string, string> = {
    润羽: '润羽（海润C馆）',
    羽跃: '羽跃羽毛球馆',
    全羽汇: '全羽汇羽毛球馆',
    建安: '建安羽毛球馆',
    盛羽: '西乡盛羽球馆',
    翼羽: '翼羽（阳光文体）',
    RUN俱乐部: 'RUN+俱乐部',
    体育中心: '体育中心场馆',
  };

  return displayNames[key] || key;
}
