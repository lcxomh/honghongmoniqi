import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, BookOpen, Heart } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export const dynamic = 'force-dynamic'; // 强制使用动态渲染，避免构建时访问数据库

export const metadata: Metadata = {
  title: '恋爱攻略 | 哄哄模拟器',
  description: '恋爱技巧、沟通方法、道歉指南 - 成为恋爱高手的秘诀',
};

async function getBlogPosts() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('blog_posts')
    .select('id, title, slug, summary, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`获取文章失败: ${error.message}`);
  }

  return data || [];
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 shadow-lg mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
            恋爱攻略
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            成为恋爱高手的秘诀，让感情更甜蜜~
          </p>
        </div>

        {/* 文章列表 */}
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-pink-300 dark:hover:border-pink-600 bg-white/90 dark:bg-gray-800/90 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                    恋爱技巧
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3">
                  {post.summary}
                </p>
                <div className="flex items-center gap-2 mt-4 text-pink-500 dark:text-pink-400 text-sm font-medium">
                  <span>阅读全文</span>
                  <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white/80 dark:bg-gray-800/80 rounded-2xl px-8 py-6 shadow-lg">
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              想要实战练习？试试我们的哄哄模拟器吧！
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                开始哄人
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
