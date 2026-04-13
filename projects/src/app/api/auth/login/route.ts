import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyPassword, generateToken, getTokenFromHeader } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 验证输入
    if (!username || !password) {
      return NextResponse.json({
        error: '用户名和密码不能为空'
      }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 查询用户
    const { data: user, error: userError } = await client
      .from('users')
      .select('id, username, password')
      .eq('username', username)
      .maybeSingle();

    if (userError) {
      throw new Error(`查询用户失败: ${userError.message}`);
    }

    if (!user) {
      return NextResponse.json({
        error: '用户名或密码错误'
      }, { status: 401 });
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({
        error: '用户名或密码错误'
      }, { status: 401 });
    }

    // 生成 JWT Token
    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    // 创建响应
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
      },
    });

    // 设置 HTTP-only Cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json({
      error: '登录失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
