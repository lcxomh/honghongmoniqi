import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 验证输入
    if (!username || !password) {
      return NextResponse.json({
        error: '用户名和密码不能为空'
      }, { status: 400 });
    }

    // 验证用户名长度
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({
        error: '用户名长度必须在 3-20 个字符之间'
      }, { status: 400 });
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json({
        error: '密码长度至少 6 个字符'
      }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 检查用户名是否已存在
    const { data: existingUser, error: checkError } = await client
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`查询用户失败: ${checkError.message}`);
    }

    if (existingUser) {
      return NextResponse.json({
        error: '用户名已存在'
      }, { status: 409 });
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password);

    // 创建用户
    const { data: newUser, error: insertError } = await client
      .from('users')
      .insert({
        username,
        password: hashedPassword,
      })
      .select('id, username')
      .single();

    if (insertError) {
      throw new Error(`创建用户失败: ${insertError.message}`);
    }

    // 生成 JWT Token
    const token = generateToken({
      userId: newUser.id,
      username: newUser.username,
    });

    // 创建响应
    const response = NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        id: newUser.id,
        username: newUser.username,
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
    console.error('注册失败:', error);
    return NextResponse.json({
      error: '注册失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
