import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { MonthlyPoint } from './chartTypes';
import { CHART_PALETTE } from './chartColors';
import { formatCurrency } from '../../lib/utils';

interface MonthlyTrendChartProps {
  data: MonthlyPoint[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        <p className="text-sm" style={{ color: CHART_PALETTE.success }}>
          活动次数: {payload[0]?.value || 0}次
        </p>
        <p className="text-sm" style={{ color: CHART_PALETTE.primary }}>
          总花费: {formatCurrency(payload[1]?.value || 0)}
        </p>
      </div>
    );
  }
  return null;
};

export function MonthlyTrendChart({
  data,
  height = 280,
}: MonthlyTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16">
        📊 暂无月度数据
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            label={{
              value: '活动次数',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12 },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            label={{
              value: '总花费(元)',
              angle: 90,
              position: 'insideRight',
              style: { fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            iconSize={12}
          />
          <Bar
            yAxisId="left"
            dataKey="count"
            fill={CHART_PALETTE.success}
            name="活动次数"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="spend"
            stroke={CHART_PALETTE.primary}
            strokeWidth={2}
            name="总花费"
            dot={{ fill: CHART_PALETTE.primary, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
