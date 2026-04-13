import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'game_records 表需要通过 SQL 手动创建'
    });

    return response;
  } catch (error) {
    console.error('迁移游戏记录表失败:', error);
    return NextResponse.json({
      error: '迁移失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
