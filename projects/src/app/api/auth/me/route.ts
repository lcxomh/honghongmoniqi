import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 获取 Token
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({
        error: '未登录'
      }, { status: 401 });
    }

    // 验证 Token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({
        error: 'Token 无效'
      }, { status: 401 });
    }

    // 查询用户信息
    const client = getSupabaseClient();
    const { data: user, error } = await client
      .from('users')
      .select('id, username, created_at')
      .eq('id', payload.userId)
      .maybeSingle();

    if (error) {
      throw new Error(`查询用户失败: ${error.message}`);
    }

    if (!user) {
      return NextResponse.json({
        error: '用户不存在'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({
      error: '获取用户信息失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
