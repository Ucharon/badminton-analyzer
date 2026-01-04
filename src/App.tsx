import { useState } from 'react';
import type { AnalysisResult } from './types/order';
import { parseExcelFile } from './features/upload/excelParser';
import { fetchExcelFromURL } from './features/upload/fetchExcel';
import { filterOrders, mergeActivities } from './features/transform/mergeActivities';
import {
  calculateStatistics,
  calculateMonthlyStats,
  calculateVenueStats,
  calculateWeekdayStats,
  calculateQuarterlyStats,
} from './features/transform/calculateStats';
import { Upload, FileSpreadsheet, TrendingUp, Calendar, MapPin, Activity, Link } from 'lucide-react';
import { formatCurrency } from './lib/utils';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    setWarnings([]);

    try {
      // 1. 解析Excel
      const parseResult = await parseExcelFile(file);
      if (!parseResult.success || !parseResult.data) {
        setError(parseResult.error || '解析失败');
        setIsAnalyzing(false);
        return;
      }

      const orders = parseResult.data;

      // 验证是否有数据
      if (orders.length === 0) {
        setError('Excel文件中没有有效数据');
        setIsAnalyzing(false);
        return;
      }

      // 2. 过滤数据
      const {
        outgoing,
        totalOutgoing,
        totalIncoming,
        netSpent,
      } = filterOrders(orders);

      // 验证是否有出款订单
      if (outgoing.length === 0) {
        setError('没有找到有效的出款订单，请检查数据');
        setIsAnalyzing(false);
        return;
      }

      // 3. 合并活动
      const activities = mergeActivities(outgoing);

      // 验证是否有有效活动
      if (activities.length === 0) {
        setError('未找到有效活动记录，请检查Excel数据格式');
        setIsAnalyzing(false);
        return;
      }

      // 4. 计算统计数据
      const statistics = calculateStatistics(
        activities,
        netSpent,
        totalOutgoing,
        totalIncoming
      );
      statistics.总订单数 = orders.length;
      statistics.订单活动比 = outgoing.length / activities.length;

      const monthlyStats = calculateMonthlyStats(activities);
      const venueStats = calculateVenueStats(activities);
      const weekdayStats = calculateWeekdayStats(activities);
      const quarterlyStats = calculateQuarterlyStats(activities);

      // 5. 设置结果
      setResult({
        statistics,
        monthlyStats,
        venueStats,
        weekdayStats,
        quarterlyStats,
        activities,
        rawOrders: orders,
      });

      if (parseResult.warnings && parseResult.warnings.length > 0) {
        setWarnings(parseResult.warnings);
        console.warn('解析警告:', parseResult.warnings);
      }

      // 重置input以支持重复上传同一文件
      e.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUrlAnalysis = async () => {
    if (!urlInput.trim()) {
      setError('请输入Excel文件URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setWarnings([]);

    try {
      // 从URL获取并解析Excel
      const parseResult = await fetchExcelFromURL(urlInput);

      if (!parseResult.success || !parseResult.data) {
        setError(parseResult.error || '解析失败');
        setIsAnalyzing(false);
        return;
      }

      const orders = parseResult.data;

      // 验证是否有数据
      if (orders.length === 0) {
        setError('Excel文件中没有有效数据');
        setIsAnalyzing(false);
        return;
      }

      // 2. 过滤数据
      const {
        outgoing,
        totalOutgoing,
        totalIncoming,
        netSpent,
      } = filterOrders(orders);

      // 验证是否有出款订单
      if (outgoing.length === 0) {
        setError('没有找到有效的出款订单，请检查数据');
        setIsAnalyzing(false);
        return;
      }

      // 3. 合并活动
      const activities = mergeActivities(outgoing);

      // 验证是否有有效活动
      if (activities.length === 0) {
        setError('未找到有效活动记录，请检查Excel数据格式');
        setIsAnalyzing(false);
        return;
      }

      // 4. 计算统计数据
      const statistics = calculateStatistics(
        activities,
        netSpent,
        totalOutgoing,
        totalIncoming
      );
      statistics.总订单数 = orders.length;
      statistics.订单活动比 = outgoing.length / activities.length;

      const monthlyStats = calculateMonthlyStats(activities);
      const venueStats = calculateVenueStats(activities);
      const weekdayStats = calculateWeekdayStats(activities);
      const quarterlyStats = calculateQuarterlyStats(activities);

      // 5. 设置结果
      setResult({
        statistics,
        monthlyStats,
        venueStats,
        weekdayStats,
        quarterlyStats,
        activities,
        rawOrders: orders,
      });

      if (parseResult.warnings && parseResult.warnings.length > 0) {
        setWarnings(parseResult.warnings);
        console.warn('解析警告:', parseResult.warnings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Activity className="text-green-600" size={40} />
            羽毛球活动账单分析
          </h1>
          <p className="text-gray-600">上传蛙友聚账单Excel，一键分析你的运动数据</p>
        </header>

        {/* Upload Area */}
        {!result && (
          <div className="max-w-2xl mx-auto">
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-green-500 transition-colors cursor-pointer bg-white shadow-md">
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  点击或拖拽上传Excel文件
                </p>
                <p className="text-sm text-gray-500">
                  支持 .xls 和 .xlsx 格式
                </p>
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isAnalyzing}
                />
              </div>
            </label>

            {/* 分隔符 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-500">或</span>
              </div>
            </div>

            {/* URL输入 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-3">
                <Link className="text-blue-600" size={20} />
                <h3 className="font-semibold text-gray-800">通过URL分析</h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="粘贴Excel文件URL，例如：https://example.com/file.xls"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isAnalyzing}
                />
                <button
                  onClick={handleUrlAnalysis}
                  disabled={isAnalyzing || !urlInput.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  分析
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                提示：URL需要支持跨域访问(CORS)
              </p>
            </div>

            {isAnalyzing && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-2 text-gray-600">正在分析中...</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                ❌ {error}
              </div>
            )}

            {warnings.length > 0 && !error && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                <div className="font-semibold mb-2">⚠️ 解析警告 ({warnings.length}条)</div>
                <div className="text-sm max-h-40 overflow-y-auto">
                  {warnings.slice(0, 10).map((w, i) => (
                    <div key={i}>• {w}</div>
                  ))}
                  {warnings.length > 10 && (
                    <div className="mt-2 text-xs">...还有{warnings.length - 10}条警告，请查看控制台</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={<TrendingUp className="text-green-600" />}
                label="实际净花费"
                value={formatCurrency(result.statistics.实际净花费)}
                subtext={`${result.statistics.有效活动次数}次活动`}
              />
              <MetricCard
                icon={<Calendar className="text-blue-600" />}
                label="平均每次"
                value={formatCurrency(result.statistics.平均每次)}
                subtext={`活动${result.statistics.活动天数}天`}
              />
              <MetricCard
                icon={<Activity className="text-purple-600" />}
                label="运动频率"
                value={result.statistics.健康等级}
                subtext={`${result.statistics.平均每周次数.toFixed(1)}次/周`}
              />
              <MetricCard
                icon={<MapPin className="text-orange-600" />}
                label="最爱场地"
                value={result.venueStats[0]?.场馆名称 || '-'}
                subtext={`${result.venueStats[0]?.次数 || 0}次`}
              />
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Stats */}
              <StatsCard
                title="月度统计"
                items={result.monthlyStats.map(s => ({
                  label: s.月份,
                  value: `${s.次数}次`,
                  amount: formatCurrency(s.总花费)
                }))}
              />

              {/* Venue Stats */}
              <StatsCard
                title="场地分布"
                items={result.venueStats.map(s => ({
                  label: s.场馆名称,
                  value: `${s.次数}次 (${s.占比.toFixed(1)}%)`,
                  amount: formatCurrency(s.总花费)
                }))}
              />

              {/* Weekday Stats */}
              <StatsCard
                title="周几习惯"
                items={result.weekdayStats.map(s => ({
                  label: s.星期,
                  value: `${s.次数}次 (${s.占比.toFixed(1)}%)`,
                  amount: formatCurrency(s.总花费)
                }))}
              />

              {/* Health Summary */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">💪 健康评价</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">评级：</span>
                    <span className="text-2xl font-bold text-green-600 ml-2">
                      {result.statistics.健康等级}
                    </span>
                  </div>
                  <p className="text-gray-600">{result.statistics.健康评语}</p>
                  <div className="border-t pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">累计运动时长</span>
                      <span className="font-medium">{result.statistics.累计运动时长}小时</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">消耗卡路里</span>
                      <span className="font-medium">{result.statistics.消耗卡路里.toLocaleString()}千卡</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">燃烧脂肪</span>
                      <span className="font-medium text-orange-600">{result.statistics.燃烧脂肪.toFixed(1)}公斤</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={() => setResult(null)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                重新上传
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{subtext}</div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, items }: { title: string; items: Array<{ label: string; value: string; amount: string }> }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <div>
              <div className="font-medium text-gray-800">{item.label}</div>
              <div className="text-sm text-gray-500">{item.value}</div>
            </div>
            <div className="text-green-600 font-semibold">{item.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
