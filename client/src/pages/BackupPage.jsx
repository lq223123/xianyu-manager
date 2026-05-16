import { useState, useRef } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { Download, Upload, Database, AlertTriangle } from 'lucide-react';

export default function BackupPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await api.exportBackup();
      const now = new Date();
      const filename = `闲鱼备份_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.json`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('备份导出成功');
    } catch (err) {
      toast.error('备份导出失败：' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportResult(null);
    setImporting(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.products || !Array.isArray(data.products)) {
        toast.error('备份文件格式不正确');
        return;
      }

      if (!confirm(`即将导入 ${data.products.length} 个商品，确定继续吗？`)) return;

      const result = await api.importBackup({ products: data.products });
      setImportResult(result);
      toast.success(`导入完成：成功 ${result.imported} 个，跳过 ${result.skipped} 个`);
    } catch (err) {
      toast.error('导入失败：' + err.message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">数据备份</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">导出JSON备份或导入数据恢复</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 导出备份 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Download size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">导出备份</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">将所有商品数据导出为JSON文件</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            导出的JSON文件包含所有商品数据，可用于数据迁移或在其他设备上恢复数据。
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Download size={16} />
            {exporting ? '导出中...' : '导出JSON备份'}
          </button>
        </div>

        {/* 导入恢复 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Upload size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">导入恢复</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">从JSON备份文件恢复商品数据</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              导入的商品会追加到当前数据中，不会覆盖已有数据。
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Upload size={16} />
            {importing ? '导入中...' : '选择JSON文件导入'}
          </button>

          {importResult && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-400">
                导入完成：成功 <strong>{importResult.imported}</strong> 个，
                跳过 <strong>{importResult.skipped}</strong> 个
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
