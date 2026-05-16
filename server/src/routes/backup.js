import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// 导出JSON备份
router.get('/export', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      productCount: products.length,
      products,
    };

    const now = new Date();
    const filename = `闲鱼备份_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.json(backup);
  } catch (err) {
    console.error('Backup export error:', err);
    res.status(500).json({ error: '导出备份失败' });
  }
});

// 导入JSON恢复数据
router.post('/import', async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: '备份文件中没有商品数据' });
    }

    let imported = 0;
    let skipped = 0;

    for (const product of products) {
      const { id, user_id, created_at, updated_at, ...rest } = product;

      const { error } = await supabase
        .from('products')
        .insert({
          ...rest,
          user_id: req.userId,
        });

      if (error) {
        skipped++;
      } else {
        imported++;
      }
    }

    res.json({
      success: true,
      imported,
      skipped,
      total: products.length,
    });
  } catch (err) {
    console.error('Backup import error:', err);
    res.status(500).json({ error: '导入备份失败' });
  }
});

export default router;
