import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const prompt = `你是一个恋爱情感专栏作家，擅长用轻松幽默的语气写关于恋爱技巧的文章。

请写一篇关于"${title}"的博客文章，要求：
1. 风格轻松幽默，语气亲切自然
2. 内容实用，有具体建议和例子
3. 适合大众阅读，不要太学术化
4. 文章长度300-500字
5. 用生动的比喻和日常场景
6. 结尾可以加一点小幽默或暖心的话

请直接返回文章内容，不要任何其他文字。`;

    const response = await client.invoke([
      { role: 'user', content: prompt },
    ], {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.85,
    });

    const content = response.content || '';

    // 生成摘要（取前100字）
    const summary = content.slice(0, 100) + (content.length > 100 ? '...' : '');

    return NextResponse.json({
      title,
      content,
      summary,
      slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, ''),
      date: new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('生成博客文章失败:', error);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}
