import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get('excludeId');

    const client = getSupabaseClient();

    let query = client
      .from('blog_posts')
      .select('id, title, slug, summary, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (excludeId) {
      query = query.neq('id', Number(excludeId));
    }

    const { data, error } = await query;

    if (error) throw new Error(`获取相关文章失败: ${error.message}`);

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('获取相关文章失败:', error);
    return NextResponse.json(
      { error: '获取失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
