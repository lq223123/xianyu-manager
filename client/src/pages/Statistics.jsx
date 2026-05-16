import { useState } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { BarChart3 } from 'lucide-react';

export default function Statistics() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [mode, setMode] = useState('monthly');
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    setLoading(true);
    try {
      if (mode === 'monthly') {
        const data = await api.getMonthlyStats(year, month);
        setResult({ type: 'monthly', ...data });
      } else {
        const data = await api.getYearlyStats(year);
        setResult({ type: 'yearly', ...data });
      }
    } catch (err) {
      toast.error('查询统计失败');
    } finally {
      setLoading(false);
    }
  };

  const years = [];
  for (let y = currentYear; y >= 2020; y--) years.push(y);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">数据统计分析</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">按月份或年份查询统计数据</p>
      </div>

      {/* 查询条件 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">查询方式</label>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setMode('monthly')}
                className={`px-4 py-2 text-sm transition-colors ${
                  mode === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-650'
                }`}
              >
                按月份
              </button>
              <button
                onClick={() => setMode('yearly')}
                className={`px-4 py-2 text-sm transition-colors ${
                  mode === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-650'
                }`}
              >
                按年份
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">年份</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
          </div>

          {mode === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">月份</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((m) => (
                  <option key={m} value={m}>{m}月</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleQuery}
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <BarChart3 size={16} />
            {loading ? '查询中...' : '查询'}
          </button>
        </div>
      </div>

      {/* 查询结果 */}
      {result && (
        <div>
          {/* 月度结果 */}
          {result.type === 'monthly' && (
            <>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {result.year}年{result.month}月 统计结果
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">销售额</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ¥{result.sales.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">售出单数</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {result.soldCount} 单
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">上架商品数量</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {result.listedCount} 个
                  </p>
                </div>
              </div>
            </>
          )}

          {/* 年度结果 */}
          {result.type === 'yearly' && (
            <>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {result.year}年 统计结果
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">年度销售额</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ¥{result.totalSales.toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">年度售出单数</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {result.totalSoldCount} 单
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">年度上架数量</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {result.totalListedCount} 个
                  </p>
                </div>
              </div>

              {/* 月度明细表 */}
              <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">月度明细</h4>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                      <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">月份</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">销售额</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">售出单数</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">上架数量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.monthlyData.map((m) => (
                      <tr key={m.month} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{m.month}月</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">¥{m.sales.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{m.soldCount}</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{m.listedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
