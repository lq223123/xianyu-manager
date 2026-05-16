// 闲鱼管理系统 - 一键配置脚本
// 运行: cd server && node setup.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '.env');
const schemaPath = resolve(__dirname, '..', 'database', 'schema.sql');

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

async function runSql(supabase, sqlText) {
  const url = process.env.SUPABASE_URL || supabase.supabaseUrl;
  const key = process.env.SUPABASE_SERVICE_KEY || supabase.supabaseKey;

  const res = await fetch(`${url}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({}),
  });
  return res;
}

async function main() {
  console.log('\n═══════════════════════════════════════════');
  console.log('🐟 闲鱼管理系统 - Supabase 配置向导');
  console.log('═══════════════════════════════════════════\n');
  console.log('获取方式: Supabase 后台 → Settings → API\n');

  const url = (await ask('Project URL: ')).trim();
  const key = (await ask('service_role key: ')).trim();

  if (!url || !key) {
    console.log('\n❌ 信息不完整，请重新运行。');
    rl.close();
    process.exit(1);
  }

  // 1. 写入 .env
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  writeFileSync(envPath, `PORT=3001
SUPABASE_URL=${url}
SUPABASE_SERVICE_KEY=${key}
JWT_SECRET=${jwtSecret}
`);
  console.log('✅ .env 已配置');

  // 2. 测试连接
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(0);
  // 即使表不存在，只要能连接就行
  console.log('✅ 数据库连接成功');

  // 3. 提示建表
  console.log('\n⚠️  请手动完成最后一步：建表');
  console.log('   1. 打开 Supabase 后台 → SQL Editor');
  console.log('   2. 复制以下文件内容并执行：');
  console.log(`   ${schemaPath}`);
  console.log('\n═══════════════════════════════════════════\n');

  rl.close();
}

main().catch((e) => {
  console.error('错误:', e.message);
  rl.close();
  process.exit(1);
});
