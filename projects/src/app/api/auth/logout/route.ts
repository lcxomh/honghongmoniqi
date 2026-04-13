import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: '登出成功'
    });

    // 清除 Cookie
    response.cookies.delete('token');

    return response;
  } catch (error) {
    console.error('登出失败:', error);
    return NextResponse.json({
      error: '登出失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
