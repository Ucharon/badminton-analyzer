// 类型字面量定义
export type PaymentDirection = '出款(-)' | '入款(+)';
export type PaymentMethod = '报名支付' | '少补支付' | string;
export type SettlementStatus = '已完成' | '已退款';
export type PaymentStatus = '已支付' | string;

// 原始订单类型
export interface OrderRow {
  序号?: number;
  订单编号: string;
  支付账单号?: string;
  活动标题: string;
  票种?: string;
  活动开始时间: Date; // 解析后保证为Date
  活动结束时间?: string | Date;
  发布者: string;
  发布者玩聚号?: string;
  报名者?: string;
  报名者玩聚号?: string;
  报名者性别?: string;
  支付类型?: string;
  银行类型?: string;
  支付方式: PaymentMethod;
  '出款/入款': PaymentDirection;
  金额: number;
  支付状态: PaymentStatus;
  结算状态: SettlementStatus;
  支付时间: Date; // 解析后保证为Date
  创建时间?: string | Date;
  联系方式?: string;
}

// 活动类型
export interface Activity {
  活动ID: string;
  活动标题: string;
  活动开始时间: Date;
  发布者: string;
  原始订单数: number;
  总金额: number;
  支付时间: Date; // 最早的支付时间
  包含报名支付: boolean;
  包含少补支付: boolean;
  订单详情: string[];
  活动类型?: string; // 场馆类型
}

// 统计数据类型
export interface Statistics {
  // 基本统计
  总订单数: number;
  有效活动次数: number;
  出款总额: number;
  入款总额: number;
  实际净花费: number;
  平均每次: number;
  单次最高: number;
  单次最低: number;
  订单活动比: number;

  // 时间统计
  活动天数: number;
  最活跃月份: string;
  最活跃月份次数: number;
  花费最多月份: string;
  花费最多月份金额: number;

  // 频率评价
  平均每周次数: number;
  健康等级: '优秀' | '良好' | '及格' | '待提高';
  健康评语: string;

  // 运动效果
  累计运动时长: number; // 小时
  消耗卡路里: number;
  燃烧脂肪: number; // 公斤
}

// 月度统计
export interface MonthlyStat {
  月份: string; // YYYY-MM
  总花费: number;
  次数: number;
  平均: number;
}

// 场馆统计
export interface VenueStat {
  场馆名称: string;
  总花费: number;
  次数: number;
  平均: number;
  占比: number; // 百分比
}

// 周几统计
export interface WeekdayStat {
  星期: string; // 周一、周二等
  总花费: number;
  次数: number;
  平均: number;
  占比: number;
}

// 季度统计
export interface QuarterlyStat {
  季度: string; // 2025Q1
  总花费: number;
  次数: number;
  平均: number;
}

// 分析结果汇总
export interface AnalysisResult {
  statistics: Statistics;
  monthlyStats: MonthlyStat[];
  venueStats: VenueStat[];
  weekdayStats: WeekdayStat[];
  quarterlyStats: QuarterlyStat[];
  activities: Activity[];
  rawOrders: OrderRow[];
}
