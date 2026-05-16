# 闲鱼商品信息管理系统

一个用于闲鱼运营的商品信息后台管理系统 SaaS 网页版。

## 技术栈

- **前端**: React 18 + Vite + TailwindCSS + React Router
- **后端**: Node.js + Express
- **数据库**: Supabase PostgreSQL

## 项目结构

```
xianyu-manager/
├── client/                    # 前端 React 项目
│   ├── src/
│   │   ├── components/        # 布局、侧边栏等通用组件
│   │   ├── context/           # AuthContext、ThemeContext
│   │   ├── pages/             # 登录、注册、数据概览、商品管理、统计、导出、备份
│   │   ├── utils/api.js       # API 请求封装
│   │   ├── App.jsx            # 路由配置
│   │   ├── main.jsx           # 入口
│   │   └── index.css          # TailwindCSS + 全局样式
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                    # 后端 Express 项目
│   ├── src/
│   │   ├── routes/            # auth、products、stats、export、backup
│   │   ├── middleware/auth.js  # JWT 认证中间件
│   │   ├── utils/supabase.js  # Supabase 客户端
│   │   └── index.js           # 入口
│   ├── package.json
│   └── .env.example
└── database/
    └── schema.sql             # 数据库建表语句
```

## 本地开发教程

### 前置条件

- Node.js >= 18
- Supabase 账号（免费注册 https://supabase.com）

### 1. 创建 Supabase 项目

1. 注册/登录 https://supabase.com
2. 创建一个新项目
3. 进入 SQL Editor，执行 `database/schema.sql` 中的建表语句
4. 进入 Settings > API，获取 `Project URL` 和 `service_role key`

### 2. 配置环境变量

```bash
cd server
cp .env.example .env
```

编辑 `.env`：

```
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-random-secret-key
```

### 3. 安装依赖并启动

```bash
# 终端1 - 启动后端
cd server
npm install
npm run dev

# 终端2 - 启动前端
cd client
npm install
npm run dev
```

前端访问：http://localhost:5173
后端 API：http://localhost:3001

### 4. 使用

1. 打开浏览器访问 http://localhost:5173
2. 注册账号
3. 登录后即可使用所有功能

## 部署教程

### 前端部署（Vercel）

1. 安装 Vercel CLI：`npm i -g vercel`
2. 在 `client/` 目录下运行：`vercel`
3. 按照提示完成部署
4. 在 Vercel Dashboard 中设置环境变量（如果需要代理到后端，配置 vercel.json 中的 rewrites）

或者直接在 Vercel 网站导入 GitHub 仓库：
- Build Command: `cd client && npm install && npm run build`
- Output Directory: `client/dist`

### 后端部署（Railway / Render）

**Railway:**
1. 注册 https://railway.app
2. 新建项目，导入 GitHub 仓库
3. 设置 Root Directory 为 `server`
4. 设置环境变量（同 .env.example）
5. 自动部署

**Render:**
1. 注册 https://render.com
2. 创建 Web Service
3. 连接 GitHub 仓库
4. Root Directory: `server`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. 设置环境变量

### 部署后配置

部署完成后，将前端 Vercel 的 API 代理地址指���到后端服务地址。

修改 `client/vite.config.js` 的 proxy 配置，或在生产环境使用环境变量 `VITE_API_URL`。

## API 接口文档

### 认证 API

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 注册 | 否 |
| POST | /api/auth/login | 登录 | 否 |
| GET | /api/auth/me | 获取当前用户 | 是 |

### 商品 API

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/products | 获取商品列表（支持搜索/筛选/分页） | 是 |
| GET | /api/products/:id | 获取单个商品 | 是 |
| POST | /api/products | 新增商品 | 是 |
| PUT | /api/products/:id | 编辑商品 | 是 |
| DELETE | /api/products/:id | 删除商品 | 是 |
| POST | /api/products/batch-delete | 批量删除 | 是 |

查询参数：`page`, `pageSize`, `search`, `status`, `startDate`, `endDate`, `sortBy`, `sortOrder`

### 统计 API

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/stats/overview | 首页数据概览 | 是 |
| GET | /api/stats/monthly?year=&month= | 月度统计 | 是 |
| GET | /api/stats/yearly?year= | 年度统计 | 是 |

### 导出/备份 API

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/export/excel | 导出Excel | 是 |
| GET | /api/backup/export | 导出JSON备份 | 是 |
| POST | /api/backup/import | 导入JSON恢复 | 是 |
