import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import type { WeekdayPoint } from './chartTypes';
import { getFrequencyColor } from './chartColors';

interface WeekdayBarChartProps {
  data: WeekdayPoint[];
  height?: number;
  showPercent?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{data.weekday}</p>
        <p className="text-sm text-green-600">
          活动次数: {data.count}次
        </p>
        <p className="text-sm text-gray-600">
          占比: {data.percent.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

export function WeekdayBarChart({
  data,
  height = 280,
  showPercent = false,
}: WeekdayBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16">
        📊 暂无周几数据
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="weekday" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{
              value: showPercent ? '占比(%)' : '活动次数',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey={showPercent ? 'percent' : 'count'}
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getFrequencyColor(entry.count, maxCount)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
