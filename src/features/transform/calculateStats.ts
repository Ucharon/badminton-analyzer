import type {
  Activity,
  Statistics,
  MonthlyStat,
  VenueStat,
  WeekdayStat,
  QuarterlyStat,
} from '../../types/order';
import dayjs from 'dayjs';
import { groupBy } from 'lodash-es';
import {
  WEEKDAY_MAP,
  EXERCISE_CONSTANTS,
  HEALTH_THRESHOLDS,
} from '../../lib/constants';
import { formatMonth, formatQuarter } from '../../lib/utils';

export function calculateStatistics(
  activities: Activity[],
  netSpent: number,
  totalOutgoing: number,
  totalIncoming: number
): Statistics {
  const totalActivities = activities.length;

  if (totalActivities === 0) {
    throw new Error('没有有效的活动数据');
  }

  // 计算基本统计
  const amounts = activities.map((a) => a.总金额);
  const avgPerActivity = netSpent / totalActivities;
  const maxAmount = Math.max(...amounts);
  const minAmount = Math.min(...amounts);

  // 多人报名统计
  const multiRegistrationActivities = activities.filter((a) => a.是否多人报名);
  const totalParticipations = activities.length; // 按名额拆分后，每条记录就是1次参与
  const helpRegistrationCount = multiRegistrationActivities.length;

  // 计算平均名额倍数（去重计算原始活动组）
  const uniqueActivityGroups = new Map<string, number>();
  activities.forEach((a) => {
    // 提取原始活动ID（去掉_slot后缀）
    const baseId = a.活动ID.replace(/_slot\d+$/, '');
    uniqueActivityGroups.set(baseId, a.报名名额数);
  });

  const actualActivityCount = uniqueActivityGroups.size;
  const averageSlotMultiplier = totalActivities / actualActivityCount;

  // 计算活动天数
  const uniqueDates = new Set(
    activities.map((a) => dayjs(a.活动开始时间).format('YYYY-MM-DD'))
  );
  const activityDays = uniqueDates.size;

  // 月度统计
  const monthlyStats = calculateMonthlyStats(activities);
  const mostActiveMonth = monthlyStats.reduce((max, cur) =>
    cur.次数 > max.次数 ? cur : max
  );
  const highestSpendMonth = monthlyStats.reduce((max, cur) =>
    cur.总花费 > max.总花费 ? cur : max
  );

  // 计算频率和健康评价
  const weeksInYear = 52;
  const avgPerWeek = totalActivities / weeksInYear;

  let healthLevel: Statistics['健康等级'];
  let healthComment: string;

  if (avgPerWeek >= HEALTH_THRESHOLDS.EXCELLENT) {
    healthLevel = '优秀';
    healthComment = '保持非常好的运动习惯！';
  } else if (avgPerWeek >= HEALTH_THRESHOLDS.GOOD) {
    healthLevel = '良好';
    healthComment = '运动频率很不错，继续保持！';
  } else if (avgPerWeek >= HEALTH_THRESHOLDS.PASS) {
    healthLevel = '及格';
    healthComment = '有一定运动习惯，可以适当增加频率。';
  } else {
    healthLevel = '待提高';
    healthComment = '建议增加运动频率，保持健康。';
  }

  // 运动效果计算
  const totalHours = totalActivities * EXERCISE_CONSTANTS.HOURS_PER_ACTIVITY;
  const totalCalories = totalHours * EXERCISE_CONSTANTS.CALORIES_PER_HOUR;
  const fatBurned = totalCalories / EXERCISE_CONSTANTS.CALORIES_PER_KG_FAT;

  return {
    总订单数: 0, // 由外部填充
    有效活动次数: actualActivityCount, // 原始活动组数（未拆分前）
    出款总额: totalOutgoing,
    入款总额: totalIncoming,
    实际净花费: netSpent,
    平均每次: avgPerActivity,
    单次最高: maxAmount,
    单次最低: minAmount,
    订单活动比: 0, // 由外部填充
    总参与次数: totalParticipations, // 按名额拆分后的总次数
    帮报名活动数: helpRegistrationCount, // 名额数>1的活动数
    平均名额倍数: averageSlotMultiplier, // 平均每次活动报几个名额
    活动天数: activityDays,
    最活跃月份: mostActiveMonth.月份,
    最活跃月份次数: mostActiveMonth.次数,
    花费最多月份: highestSpendMonth.月份,
    花费最多月份金额: highestSpendMonth.总花费,
    平均每周次数: avgPerWeek,
    健康等级: healthLevel,
    健康评语: healthComment,
    累计运动时长: totalHours,
    消耗卡路里: totalCalories,
    燃烧脂肪: fatBurned,
  };
}

// 计算月度统计
export function calculateMonthlyStats(activities: Activity[]): MonthlyStat[] {
  const grouped = groupBy(activities, (a: Activity) => formatMonth(a.活动开始时间));

  return Object.entries(grouped)
    .map(([month, acts]) => {
      const actsList = acts as Activity[];
      return {
        月份: month,
        总花费: actsList.reduce((sum: number, a: Activity) => sum + a.总金额, 0),
        次数: actsList.length,
        平均: actsList.reduce((sum: number, a: Activity) => sum + a.总金额, 0) / actsList.length,
      };
    })
    .sort((a, b) => a.月份.localeCompare(b.月份));
}

// 计算场馆统计
export function calculateVenueStats(activities: Activity[]): VenueStat[] {
  const grouped = groupBy(activities, (a: Activity) => a.活动类型 || '其他活动');
  const totalActivities = activities.length;

  return Object.entries(grouped)
    .map(([venue, acts]) => {
      const actsList = acts as Activity[];
      return {
        场馆名称: venue,
        总花费: actsList.reduce((sum: number, a: Activity) => sum + a.总金额, 0),
        次数: actsList.length,
        平均: actsList.reduce((sum: number, a: Activity) => sum + a.总金额, 0) / actsList.length,
        占比: (actsList.length / totalActivities) * 100,
      };
    })
    .sort((a, b) => b.次数 - a.次数);
}

// 计算周几统计
export function calculateWeekdayStats(activities: Activity[]): WeekdayStat[] {
  const grouped = groupBy(activities, (a: Activity) => {
    const dayName = dayjs(a.活动开始时间).format('dddd') as keyof typeof WEEKDAY_MAP;
    return WEEKDAY_MAP[dayName] || dayName;
  });

  const totalActivities = activities.length;
  const weekdayOrder = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  return weekdayOrder
    .map((weekday) => {
      const acts = (grouped[weekday] || []) as Activity[];
      return {
        星期: weekday,
        总花费: acts.reduce((sum: number, a: Activity) => sum + a.总金额, 0),
        次数: acts.length,
        平均: acts.length > 0 ? acts.reduce((sum: number, a: Activity) => sum + a.总金额, 0) / acts.length : 0,
        占比: (acts.length / totalActivities) * 100,
      };
    })
    .filter((stat) => stat.次数 > 0);
}

// 计算季度统计
export function calculateQuarterlyStats(
  activities: Activity[]
): QuarterlyStat[] {
  const grouped = groupBy(activities, (a: Activity) => formatQuarter(a.活动开始时间));

  return Object.entries(grouped)
    .map(([quarter, acts]) => {
      const actsList = acts as Activity[];
      return {
        季度: quarter,
        总花费: actsList.reduce((sum: number, a: Activity) => sum + a.总金额, 0),
        次数: actsList.length,
        平均: actsList.reduce((sum: number, a: Activity) => sum + a.总金额, 0) / actsList.length,
      };
    })
    .sort((a, b) => a.季度.localeCompare(b.季度));
}
