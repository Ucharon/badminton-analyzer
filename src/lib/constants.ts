// 周几映射
export const WEEKDAY_MAP: Record<string, string> = {
  Monday: '周一',
  Tuesday: '周二',
  Wednesday: '周三',
  Thursday: '周四',
  Friday: '周五',
  Saturday: '周六',
  Sunday: '周日',
};

// 场馆关键词
export const VENUE_KEYWORDS = {
  润羽: ['润羽', '海润', '龙兴翔'],
  羽跃: ['羽跃', '菜羽'],
  全羽汇: ['全羽汇', '李宁全羽汇', '轻羽飞扬'],
  建安: ['建安'],
  盛羽: ['盛羽'],
  翼羽: ['翼羽', '阳光文体'],
  RUN俱乐部: ['RUN+'],
  体育中心: ['西乡体育中心', '宝安体育馆', '深圳湾体育中心'],
};

// 必需的Excel列名
export const REQUIRED_COLUMNS = [
  '活动标题',
  '金额',
  '支付方式',
  '出款/入款',
  '支付状态',
  '结算状态',
  '活动开始时间',
  '发布者',
];

// 运动消耗常量
export const EXERCISE_CONSTANTS = {
  HOURS_PER_ACTIVITY: 3, // 每次活动小时数
  CALORIES_PER_HOUR: 450, // 每小时消耗卡路里
  CALORIES_PER_KG_FAT: 7700, // 每公斤脂肪的卡路里
};

// 健康评级阈值（每周次数）
export const HEALTH_THRESHOLDS = {
  EXCELLENT: 3,
  GOOD: 2,
  PASS: 1,
};
