import type {
  MonthlyStat,
  VenueStat,
  WeekdayStat,
  Statistics,
} from '../../types/order';
import type {
  MonthlyPoint,
  VenueSlice,
  WeekdayPoint,
  HealthGauge,
} from './chartTypes';
import { HEALTH_THRESHOLDS } from '../../lib/constants';

// 转换月度统计数据
export function toMonthlyPoints(monthlyStats: MonthlyStat[]): MonthlyPoint[] {
  return monthlyStats
    .map((stat) => ({
      month: stat.月份,
      count: stat.次数,
      spend: stat.总花费,
      avg: stat.平均,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// 转换场馆统计数据
export function toVenueSlices(venueStats: VenueStat[]): VenueSlice[] {
  return venueStats.map((stat) => ({
    label: stat.场馆名称,
    count: stat.次数,
    percent: stat.占比,
    spend: stat.总花费,
  }));
}

// 转换周几统计数据
export function toWeekdayPoints(weekdayStats: WeekdayStat[]): WeekdayPoint[] {
  // 确保按周一到周日的顺序排列
  const weekdayOrder = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const statsMap = new Map(weekdayStats.map((s) => [s.星期, s]));

  return weekdayOrder
    .map((weekday) => {
      const stat = statsMap.get(weekday);
      return {
        weekday,
        count: stat?.次数 || 0,
        percent: stat?.占比 || 0,
        spend: stat?.总花费 || 0,
      };
    })
    .filter((point) => point.count > 0); // 只显示有数据的天
}

// 转换健康等级数据为仪表盘数据
export function toHealthGauge(statistics: Statistics): HealthGauge {
  const weeklyAvg = statistics.平均每周次数;

  // 标准化为0-100分数
  let value = 0;
  if (weeklyAvg >= HEALTH_THRESHOLDS.EXCELLENT) {
    value = 100; // 优秀
  } else if (weeklyAvg >= HEALTH_THRESHOLDS.GOOD) {
    value = 75; // 良好
  } else if (weeklyAvg >= HEALTH_THRESHOLDS.PASS) {
    value = 50; // 及格
  } else {
    value = 25; // 待提高
  }

  return {
    label: statistics.健康等级,
    value,
    comment: statistics.健康评语,
    weeklyAvg,
  };
}
