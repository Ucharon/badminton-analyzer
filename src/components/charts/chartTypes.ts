// 图表类型定义
export type ChartPalette = {
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
};

// 月度数据点
export interface MonthlyPoint {
  month: string; // YYYY-MM
  count: number; // 次数
  spend: number; // 总花费
  avg?: number; // 平均
}

// 场馆切片数据
export interface VenueSlice {
  label: string; // 场馆名称
  count: number; // 次数
  percent: number; // 占比
  spend?: number; // 总花费
}

// 周几数据点
export interface WeekdayPoint {
  weekday: string; // 周一…周日
  count: number; // 次数
  percent: number; // 占比
  spend?: number; // 总花费
}

// 健康仪表盘数据
export interface HealthGauge {
  label: string; // 健康等级
  value: number; // 0-100标准化分数
  comment?: string; // 评语
  weeklyAvg: number; // 平均每周次数
}
