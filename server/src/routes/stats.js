import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// 首页数据概览
router.get('/overview', async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const { data: allProducts, error } = await supabase
      .from('products')
      .select('status, actual_price, listed_at, sold_at')
      .eq('user_id', userId);

    if (error) throw error;

    const sold = allProducts.filter(p => p.status === '已售出');

    const todaySold = sold.filter(p => p.sold_at === today);
    const weekSold = sold.filter(p => p.sold_at >= sevenDaysAgo);
    const monthSold = sold.filter(p => p.sold_at >= monthStart);

    const todayListed = allProducts.filter(p => p.listed_at === today);
    const weekListed = allProducts.filter(p => p.listed_at && p.listed_at >= sevenDaysAgo);
    const monthListed = allProducts.filter(p => p.listed_at && p.listed_at >= monthStart);

    res.json({
      today: {
        sales: todaySold.reduce((sum, p) => sum + Number(p.actual_price || 0), 0),
        count: todaySold.length,
        listed: todayListed.length,
      },
      week: {
        sales: weekSold.reduce((sum, p) => sum + Number(p.actual_price || 0), 0),
        count: weekSold.length,
        listed: weekListed.length,
      },
      month: {
        sales: monthSold.reduce((sum, p) => sum + Number(p.actual_price || 0), 0),
        count: monthSold.length,
        listed: monthListed.length,
      },
      total: {
        sales: sold.reduce((sum, p) => sum + Number(p.actual_price || 0), 0),
        count: sold.length,
        listed: allProducts.length,
      },
    });
  } catch (err) {
    console.error('Stats overview error:', err);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

// 月度统计
router.get('/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: '请提供年份和月份' });
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
    const endDate = new Date(yearNum, monthNum, 0).toISOString().split('T')[0];

    const { data: products, error } = await supabase
      .from('products')
      .select('status, actual_price, listed_at, sold_at')
      .eq('user_id', req.userId);

    if (error) throw error;

    const monthSold = products.filter(p =>
      p.status === '已售出' && p.sold_at >= startDate && p.sold_at <= endDate
    );
    const monthListed = products.filter(p =>
      p.listed_at && p.listed_at >= startDate && p.listed_at <= endDate
    );

    res.json({
      year: yearNum,
      month: monthNum,
      sales: monthSold.reduce((sum, p) => sum + Number(p.actual_price || 0), 0),
      soldCount: monthSold.length,
      listedCount: monthListed.length,
    });
  } catch (err) {
    console.error('Monthly stats error:', err);
    res.status(500).json({ error: '获取月度统计失败' });
  }
});

// 年度统计
router.get('/yearly', async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ error: '请提供年份' });
    }

    const yearNum = parseInt(year);
    const startDate = `${yearNum}-01-01`;
    const endDate = `${yearNum}-12-31`;

    const { data: products, error } = await supabase
      .from('products')
      .select('status, actual_price, listed_at, sold_at')
      .eq('user_id', req.userId);

    if (error) throw error;

    const yearSold = products.filter(p =>
      p.status === '已售出' && p.sold_at >= startDate && p.sold_at <= endDate
    );
    const yearListed = products.filter(p =>
      p.listed_at && p.listed_at >= startDate && p.listed_at <= endDate
    );

    // 按月份分组
    const monthlyData = [];
    for (let m = 1; m <= 12; m++) {
      const mStart = `${yearNum}-${String(m).padStart(2, '0')}-01`;
      const mEnd = new Date(yearNum, m, 0).toISOString().split('T')[0];
      const mSold = yearSold.filter(p => p.sold_at >= mStart && p.sold_at <= mEnd);
      const mListed = yearListed.filter(p => p.listed_at && p.listed_at >= mStart && p.listed_at <= mEnd);
      monthlyData.push({
        month: m,
        sales: mSold.reduce((sum, p) => sum + Number(p.actual_price || 0), 0),
        soldCount: mSold.length,
        listedCount: mListed.length,
      });
    }

    res.json({
      year: yearNum,
      totalSales: yearSold.reduce((sum, p) => sum + Number(p.actual_price || 0), 0),
      totalSoldCount: yearSold.length,
      totalListedCount: yearListed.length,
      monthlyData,
    });
  } catch (err) {
    console.error('Yearly stats error:', err);
    res.status(500).json({ error: '获取年度统计失败' });
  }
});

// 图表数据（状态分布 + 近6个月趋势）
router.get('/charts', async (req, res) => {
  try {
    const userId = req.userId;

    const { data: products, error } = await supabase
      .from('products')
      .select('status, actual_price, listed_at, sold_at')
      .eq('user_id', userId);

    if (error) throw error;

    // 状态分布
    const statusDistribution = [
      { name: '未上架', value: products.filter(p => p.status === '未上架').length },
      { name: '在售', value: products.filter(p => p.status === '在售').length },
      { name: '已售出', value: products.filter(p => p.status === '已售出').length },
      { name: '已下架', value: products.filter(p => p.status === '已下架').length },
    ];

    // 近6个月趋势
    const now = new Date();
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearNum = d.getFullYear();
      const monthNum = d.getMonth() + 1;
      const mStart = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
      const mEnd = new Date(yearNum, monthNum, 0).toISOString().split('T')[0];

      const mSold = products.filter(p =>
        p.status === '已售出' && p.sold_at >= mStart && p.sold_at <= mEnd
      );
      const mListed = products.filter(p =>
        p.listed_at && p.listed_at >= mStart && p.listed_at <= mEnd
      );

      trend.push({
        month: `${monthNum}月`,
        sales: mSold.reduce((sum, p) => sum + Number(p.actual_price || 0), 0),
        soldCount: mSold.length,
        listedCount: mListed.length,
      });
    }

    res.json({ statusDistribution, trend });
  } catch (err) {
    console.error('Charts error:', err);
    res.status(500).json({ error: '获取图表数据失败' });
  }
});

export default router;
