import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const client = getSupabaseClient();

    // 获取文章详情
    const { data: post, error: postError } = await client
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (postError) throw new Error(`获取文章失败: ${postError.message}`);
    if (!post) throw new Error('文章未找到');

    return NextResponse.json(post);
  } catch (error) {
    console.error('获取博客文章详情失败:', error);
    return NextResponse.json(
      { error: '获取失败', message: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
