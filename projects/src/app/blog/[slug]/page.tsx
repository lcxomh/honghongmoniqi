'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Calendar, BookOpen, Heart, Share2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  created_at: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 获取当前文章
        const postRes = await fetch(`/api/blog/${slug}`);
        if (!postRes.ok) {
          const err = await postRes.json();
          throw new Error(err.message || '获取文章失败');
        }
        const postData = await postRes.json();
        setPost(postData);

        // 获取相关文章
        const relatedRes = await fetch(`/api/blog/related?excludeId=${postData.id}`);
        if (!relatedRes.ok) throw new Error('获取相关文章失败');
        const relatedData = await relatedRes.json();
        setRelatedPosts(relatedData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title || '恋爱攻略',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制！');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            {error || '文章未找到'}
          </h1>
          <Link href="/blog">
            <Button>返回攻略列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回攻略列表
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            分享
          </Button>
        </div>
      </div>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* 文章卡片 */}
        <Card className="bg-white/90 dark:bg-gray-800/90 overflow-hidden">
          {/* 文章头部 */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-6">
            <div className="flex items-center gap-2 text-white/90 text-sm mb-3">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
              <span className="mx-2">•</span>
              <span>恋爱技巧</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              {post.title}
            </h1>
          </div>

          {/* 文章内容 */}
          <div className="px-8 py-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                {post.content}
              </div>
            </div>
          </div>

          {/* 文章底部 */}
          <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  喜欢这篇文章就分享给朋友吧~
                </span>
              </div>
              <div className="flex gap-2">
                <Link href="/blog">
                  <Button variant="outline" size="sm">
                    查看更多攻略
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-500">
                    开始练习
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* 相关文章推荐 */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-pink-500" />
              更多攻略
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                  <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-pink-300 dark:hover:border-pink-600 bg-white/90 dark:bg-gray-800/90 cursor-pointer">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(relatedPost.created_at).toLocaleDateString('zh-CN')}
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-pink-500 dark:group-hover:text-pink-400">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {relatedPost.summary}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-br from-pink-500 to-purple-500 border-0">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-white mb-3">
                学会理论，也要实践！
              </h3>
              <p className="text-white/90 mb-6">
                用哄哄模拟器练习，成为恋爱高手~
              </p>
              <Link href="/">
                <Button size="lg" variant="secondary" className="bg-white text-pink-500 hover:bg-pink-50">
                  立即开始
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
