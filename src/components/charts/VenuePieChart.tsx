import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import type { VenueSlice } from './chartTypes';
import { VENUE_COLORS } from './chartColors';

interface VenuePieChartProps {
  data: VenueSlice[];
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{data.label}</p>
        <p className="text-sm text-green-600">
          次数: {data.count}次 ({data.percent.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export function VenuePieChart({ data, height = 300 }: VenuePieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16">
        📊 暂无场馆数据
      </div>
    );
  }

  // 将数据转换为符合 Recharts 要求的格式
  const chartData = data.map(item => ({
    ...item,
    name: item.label, // Recharts 需要 name 字段
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={window.innerWidth < 640 ? 70 : 90}
            labelLine={false}
            label={(props: any) => {
              const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

              if (!midAngle || !percent) return null;

              const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
              const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
              const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

              // 小于5%不显示标签
              if (percent < 0.05) return null;

              return (
                <text
                  x={x}
                  y={y}
                  fill="#6b7280"
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fontSize={11}
                  fontWeight="500"
                >
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              );
            }}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={VENUE_COLORS[index % VENUE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconSize={10}
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => {
              const item = data.find(d => d.label === value);
              return `${value} (${item?.count || 0}次)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
