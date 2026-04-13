import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST() {
  try {
    const client = getSupabaseClient();

    // 直接执行 SQL 创建表
    const { error } = await client.rpc('exec_sql', {
      sql: `
        -- 创建 users 表
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        
        -- 创建索引
        CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);
        
        -- 启用 RLS
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        
        -- 创建策略（允许公开读写）
        DROP POLICY IF EXISTS "Users public insert" ON users;
        CREATE POLICY "Users public insert" ON users
          FOR INSERT
          TO public
          WITH CHECK (true);
        
        DROP POLICY IF EXISTS "Users public select" ON users;
        CREATE POLICY "Users public select" ON users
          FOR SELECT
          TO public
          USING (true);
      `
    });

    if (error) {
      console.error('SQL 执行错误:', error);
      // 如果 exec_sql 不存在，尝试其他方式
      const { error: testError } = await client.from('users').select('*').limit(1);
      if (!testError || testError.code !== '42P01') {
        // 表已存在
        return NextResponse.json({
          success: true,
          message: 'users 表已存在'
        });
      }
      throw new Error(`创建表失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'users 表创建成功'
    });
  } catch (error) {
    console.error('迁移用户表失败:', error);
    return NextResponse.json({
      error: '迁移失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
