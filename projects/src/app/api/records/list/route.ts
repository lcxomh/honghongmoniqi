import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth';

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

    const client = getSupabaseClient();

    // 获取用户游戏记录
    const { data: records, error } = await client
      .from('game_records')
      .select('id, scenario, final_score, result, played_at')
      .eq('user_id', payload.userId)
      .order('played_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`获取游戏记录失败: ${error.message}`);
    }

    // 统计数据
    const stats = {
      total: records?.length || 0,
      success: records?.filter(r => r.result === 'success').length || 0,
      failure: records?.filter(r => r.result === 'failure').length || 0,
      avgScore: records?.length > 0
        ? records.reduce((sum, r) => sum + r.final_score, 0) / records.length
        : 0,
    };

    return NextResponse.json({
      success: true,
      records: records || [],
      stats,
    });
  } catch (error) {
    console.error('获取游戏记录失败:', error);
    return NextResponse.json({
      error: '获取失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
