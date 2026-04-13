import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const topic = body.topic || '恋爱沟通技巧';

    // 使用 LLM 生成文章
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    const prompt = `你是一个恋爱情感专栏作家，擅长用轻松幽默的语气写关于恋爱技巧的文章。

请写一篇关于"${topic}"的博客文章，要求：
1. 风格轻松幽默，语气亲切自然
2. 内容实用，有具体建议和例子
3. 适合大众阅读，不要太学术化
4. 文章长度300-500字
5. 用生动的比喻和日常场景
6. 结尾可以加一点小幽默或暖心的话

请直接返回文章内容，不要任何其他文字。`;

    const response = await llmClient.invoke([
      { role: 'user', content: prompt },
    ], {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.85,
    });

    const content = response.content || '';

    if (!content) {
      throw new Error('LLM 生成内容为空');
    }

    // 生成摘要（取前100字）
    const summary = content.slice(0, 100) + (content.length > 100 ? '...' : '');

    // 生成 slug（从内容中提取或使用主题）
    const slug = topic
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      + '-' + Date.now().toString(36);

    // 提取标题（取第一行）
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : topic;

    // 保存到数据库
    const client = getSupabaseClient();
    const { data, error } = await client.from('blog_posts').insert({
      title,
      slug,
      summary,
      content,
    }).select();

    if (error) {
      throw new Error(`保存文章失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: '文章生成并保存成功',
      post: data?.[0],
    });
  } catch (error) {
    console.error('生成文章失败:', error);
    return NextResponse.json({
      error: '生成失败',
      message: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}
