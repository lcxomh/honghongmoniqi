import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    // 获取游戏数据
    const { scenario, final_score, result } = await request.json();

    // 验证输入
    if (!scenario || typeof final_score !== 'number' || !result) {
      return NextResponse.json({
        error: '参数不完整'
      }, { status: 400 });
    }

    if (!['success', 'failure'].includes(result)) {
      return NextResponse.json({
        error: '无效的游戏结果'
      }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 保存游戏记录
    const { data: record, error: insertError } = await client
      .from('game_records')
      .insert({
        user_id: payload.userId,
        scenario,
        final_score,
        result,
        played_at: new Date().toISOString(),
      })
      .select('id, scenario, final_score, result, played_at')
      .single();

    if (insertError) {
      throw new Error(`保存游戏记录失败: ${insertError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '游戏记录已保存',
      record,
    });
  } catch (error) {
    console.error('保存游戏记录失败:', error);
    return NextResponse.json({
      error: '保存失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
