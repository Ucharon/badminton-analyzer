import type { ChartPalette } from './chartTypes';

// Tailwind CSS 默认调色板 (与现有主题一致)
export const CHART_PALETTE: ChartPalette = {
  primary: '#0ea5e9', // sky-500
  secondary: '#6366f1', // indigo-500
  accent: '#f59e0b', // amber-500
  muted: '#cbd5e1', // slate-300
  success: '#22c55e', // green-500
  warning: '#f97316', // orange-500
  danger: '#ef4444', // red-500
  info: '#06b6d4', // cyan-500
};

// 场馆饼图专用颜色数组
export const VENUE_COLORS = [
  '#10B981', // emerald-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#F97316', // orange-500
  '#F59E0B', // amber-500
  '#14B8A6', // teal-500
];

// 根据健康等级获取颜色
export function getHealthLevelColor(level: string): string {
  const colorMap: Record<string, string> = {
    优秀: CHART_PALETTE.success,
    良好: CHART_PALETTE.primary,
    及格: CHART_PALETTE.warning,
    待提高: CHART_PALETTE.danger,
  };
  return colorMap[level] || CHART_PALETTE.muted;
}

// 根据频率获取颜色 (用于周几柱状图)
export function getFrequencyColor(count: number, maxCount: number): string {
  const ratio = maxCount > 0 ? count / maxCount : 0;

  if (ratio >= 0.7) return CHART_PALETTE.success; // 高频
  if (ratio >= 0.4) return CHART_PALETTE.primary; // 中频
  return CHART_PALETTE.muted; // 低频
}
