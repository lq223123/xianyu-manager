const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  // 处理文件下载
  if (options.responseType === 'blob') {
    if (!res.ok) throw new Error('下载失败');
    return res.blob();
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }
  return data;
}

// Auth
export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),

  // Products
  getProducts: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products?${qs}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  batchDelete: (ids) => request('/products/batch-delete', { method: 'POST', body: JSON.stringify({ ids }) }),

  // Stats
  getOverview: () => request('/stats/overview'),
  getMonthlyStats: (year, month) => request(`/stats/monthly?year=${year}&month=${month}`),
  getYearlyStats: (year) => request(`/stats/yearly?year=${year}`),
  getCharts: () => request('/stats/charts'),

  // Export
  exportExcel: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const token = getToken();
    const res = await fetch(`${API_BASE}/export/excel?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('导出失败');
    return res.blob();
  },

  // Backup
  exportBackup: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/backup/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('导出备份失败');
    return res.blob();
  },
  importBackup: (body) => request('/backup/import', { method: 'POST', body: JSON.stringify(body) }),
};
