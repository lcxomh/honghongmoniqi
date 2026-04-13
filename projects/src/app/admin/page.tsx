'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Wand2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    post?: {
      title: string;
      slug: string;
    };
  } | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('请输入文章主题');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          post: data.post,
        });
        setTopic('');
      } else {
        setResult({
          success: false,
          message: data.message || '生成失败',
        });
      }
    } catch {
      setResult({
        success: false,
        message: '网络错误，请重试',
      });
    } finally {
      setLoading(false);
    }
  };

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
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
            博客管理
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            使用 AI 自动生成恋爱技巧文章
          </p>
        </div>

        <div className="grid gap-6">
          {/* 生成文章表单 */}
          <Card className="p-6 bg-white/90 dark:bg-gray-800/90">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-pink-500" />
              生成新文章
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  文章主题
                </label>
                <Input
                  placeholder="例如：吵架后如何快速和好、纪念日礼物推荐、异地恋如何维持..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    开始生成
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* 结果显示 */}
          {result && (
            <Card className={`p-6 ${
              result.success
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium mb-2 ${
                    result.success
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {result.message}
                  </p>
                  {result.post && (
                    <div className="text-sm">
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        标题：{result.post.title}
                      </p>
                      <Link href={`/blog/${result.post.slug}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          查看文章
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* 提示卡片 */}
          <Card className="p-6 bg-white/90 dark:bg-gray-800/90">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
              使用说明
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• 输入一个恋爱技巧相关的主题，例如&quot;纪念日礼物推荐&quot;</li>
              <li>• AI 会自动生成一篇300-500字的文章</li>
              <li>• 文章会自动保存到数据库</li>
              <li>• 生成后可以点击&quot;查看文章&quot;预览效果</li>
            </ul>
          </Card>

          {/* 快捷主题 */}
          <Card className="p-6 bg-white/90 dark:bg-gray-800/90">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
              推荐主题
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                '约会地点推荐',
                '异地恋如何维持感情',
                '纪念日礼物选择',
                '情人节怎么过',
                '吵架后如何快速和好',
                '如何给对方制造惊喜',
                '纪念日浪漫计划',
                '恋爱中如何保持新鲜感',
              ].map((suggestedTopic) => (
                <Button
                  key={suggestedTopic}
                  variant="outline"
                  size="sm"
                  onClick={() => setTopic(suggestedTopic)}
                  disabled={loading}
                  className="text-xs"
                >
                  {suggestedTopic}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
