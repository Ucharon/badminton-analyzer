import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
  PolarAngleAxis,
} from 'recharts';
import type { HealthGauge } from './chartTypes';
import { getHealthLevelColor } from './chartColors';

interface HealthRadialChartProps {
  gauge: HealthGauge;
  height?: number;
}

export function HealthRadialChart({
  gauge,
  height = 260,
}: HealthRadialChartProps) {
  const color = getHealthLevelColor(gauge.label);

  const chartData = [
    {
      name: gauge.label,
      value: gauge.value,
      fill: color,
    },
  ];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            fill={color}
          />
          <Legend
            iconSize={0}
            layout="vertical"
            verticalAlign="middle"
            align="center"
            content={() => (
              <div className="text-center">
                <div
                  className="text-4xl font-bold mb-1"
                  style={{ color }}
                >
                  {gauge.label}
                </div>
                <div className="text-gray-600 text-sm">
                  {gauge.weeklyAvg.toFixed(1)} 次/周
                </div>
                {gauge.comment && (
                  <div className="text-gray-500 text-xs mt-2 max-w-[200px] mx-auto">
                    {gauge.comment}
                  </div>
                )}
              </div>
            )}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
