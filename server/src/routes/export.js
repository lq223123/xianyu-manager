import { Router } from 'express';
import ExcelJS from 'exceljs';
import { supabase } from '../utils/supabase.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/excel', async (req, res) => {
  try {
    const { status = '', startDate = '', endDate = '', month = '' } = req.query;

    let query = supabase
      .from('products')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (startDate) query = query.gte('listed_at', startDate);
    if (endDate) query = query.lte('listed_at', endDate);

    const { data: products, error } = await query;
    if (error) throw error;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('商品数据');

    sheet.columns = [
      { header: '商品名称', key: 'name', width: 25 },
      { header: '万里牛商品名称', key: 'wanliniu_name', width: 25 },
      { header: '商品库存', key: 'stock', width: 12 },
      { header: '商品进价', key: 'purchase_price', width: 12 },
      { header: '闲鱼卖价', key: 'xianyu_price', width: 12 },
      { header: '实际成交价格', key: 'actual_price', width: 14 },
      { header: '商品状态', key: 'status', width: 12 },
      { header: '瑕疵原因', key: 'defect_reason', width: 30 },
      { header: '备注', key: 'notes', width: 30 },
      { header: '上架时间', key: 'listed_at', width: 14 },
      { header: '成交时间', key: 'sold_at', width: 14 },
    ];

    // 样式
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    products.forEach((p) => {
      sheet.addRow({
        name: p.name,
        wanliniu_name: p.wanliniu_name,
        stock: p.stock,
        purchase_price: p.purchase_price,
        xianyu_price: p.xianyu_price,
        actual_price: p.actual_price,
        status: p.status,
        defect_reason: p.defect_reason,
        notes: p.notes,
        listed_at: p.listed_at,
        sold_at: p.sold_at,
      });
    });

    const now = new Date();
    const filename = `闲鱼商品信息管理系统_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.xlsx`;
    const encodedFilename = encodeURIComponent(filename);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: '导出失败' });
  }
});

export default router;
