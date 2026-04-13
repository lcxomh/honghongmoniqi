import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    // 获取当前登录用户
    const token = request.cookies.get('token')?.value;
    let currentUserId: number | null = null;

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        currentUserId = payload.userId;
      }
    }

    // 获取排行榜：每个用户的最高分记录，按分数降序排列，取前 20 名
    // 使用 SQL 查询，先找出每个用户的最高分，然后获取对应的完整记录
    const { data: leaderboard, error } = await client.rpc('get_leaderboard', {
      limit_count: 20
    });

    if (error) {
      // 如果 rpc 不存在，使用替代方法
      const { data: records, error: recordsError } = await client
        .from('game_records')
        .select(`
          id,
          user_id,
          final_score,
          result,
          played_at,
          users (
            id,
            username
          )
        `)
        .eq('result', 'success')
        .order('final_score', { ascending: false })
        .order('played_at', { ascending: true })
        .limit(100); // 获取更多记录用于后续处理

      if (recordsError) {
        throw new Error(`获取排行榜失败: ${recordsError.message}`);
      }

      // 处理数据：每个用户只保留最高分记录
      const userBestScores = new Map<number, any>();

      records?.forEach((record: any) => {
        const userId = record.user_id;
        if (!userBestScores.has(userId) || record.final_score > userBestScores.get(userId).final_score) {
          userBestScores.set(userId, record);
        }
      });

      // 转换为数组并排序，取前 20 名
      const leaderboardData = Array.from(userBestScores.values())
        .sort((a, b) => b.final_score - a.final_score)
        .slice(0, 20)
        .map((record, index) => ({
          rank: index + 1,
          userId: record.user_id,
          username: record.users?.username || '未知用户',
          finalScore: record.final_score,
          playedAt: record.played_at,
        }));

      return NextResponse.json({
        success: true,
        leaderboard: leaderboardData,
        currentUserId,
      });
    }

    // 格式化返回数据
    const formattedLeaderboard = leaderboard?.map((item: any, index: number) => ({
      rank: index + 1,
      userId: item.user_id,
      username: item.username,
      finalScore: item.final_score,
      playedAt: item.played_at,
    })) || [];

    return NextResponse.json({
      success: true,
      leaderboard: formattedLeaderboard,
      currentUserId,
    });
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return NextResponse.json({
      error: '获取失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
