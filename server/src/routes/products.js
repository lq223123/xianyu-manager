import { Router } from 'express';
import { supabase } from '../utils/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// 获取商品列表（支持搜索、筛选、分页、排序）
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      search = '',
      status = '',
      startDate = '',
      endDate = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId);

    if (search) {
      query = query.or(`name.ilike.%${search}%,wanliniu_name.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (startDate) {
      query = query.gte('listed_at', startDate);
    }
    if (endDate) {
      query = query.lte('listed_at', endDate);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + parseInt(pageSize) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      data,
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(count / parseInt(pageSize))
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: '获取商品列表失败' });
  }
});

// 获取单个商品
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: '获取商品详情失败' });
  }
});

// 新增商品
router.post('/', async (req, res) => {
  try {
    const product = {
      ...req.body,
      user_id: req.userId,
    };

    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ data });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: '新增商品失败' });
  }
});

// 编辑商品
router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: '编辑商品失败' });
  }
});

// 删除商品
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: '删除商品失败' });
  }
});

// 批量删除
router.post('/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请选择要删除的商品' });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids)
      .eq('user_id', req.userId);

    if (error) throw error;
    res.json({ success: true, deletedCount: ids.length });
  } catch (err) {
    res.status(500).json({ error: '批量删除失败' });
  }
});

export default router;
