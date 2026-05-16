import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';

const STAT_COLORS = ['#fbbf24', '#3b82f6', '#22c55e', '#6b7280'];
const STATUS_COLORS = { '未上架': '#fbbf24', '在售': '#3b82f6', '已售出': '#22c55e', '已下架': '#6b7280' };

function StatCard({ title, sales, count, listed, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <span className="text-xs text-gray-400 dark:text-gray-500">销售额</span>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">¥{sales.toFixed(2)}</p>
        </div>
        <div className="flex gap-4">
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500">售出单数</span>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{count}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500">上架数量</span>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{listed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overview, charts] = await Promise.all([
        api.getOverview(),
        api.getCharts(),
      ]);
      setStats(overview);
      setChartData(charts);
    } catch (err) {
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const cards = stats
    ? [
        { title: '今日数据', ...stats.today, icon: TrendingUp, color: 'bg-blue-500' },
        { title: '近7天数据', ...stats.week, icon: ShoppingCart, color: 'bg-green-500' },
        { title: '本月数据', ...stats.month, icon: DollarSign, color: 'bg-purple-500' },
        { title: '总数据', ...stats.total, icon: Package, color: 'bg-orange-500' },
      ]
    : [];

  const statusDist = chartData?.statusDistribution || [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">数据概览</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">查看商品的销售统计与数据看板</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* 数据看板 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 商品状态分布 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">商品状态分布</h3>
          {statusDist.every(d => d.value === 0) ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">暂无数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {statusDist.map((entry, i) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || STAT_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} 个`, name]}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: '#fff',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 近6月销售趋势 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">近6月销售趋势</h3>
          {chartData?.trend?.every(d => d.sales === 0 && d.soldCount === 0) ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">暂无数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: '#fff',
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" name="销售额(¥)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="soldCount" name="售出单数" stroke="#22c55e" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
