'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, User, Trophy, Target, TrendingUp, Calendar, Play, LogOut, Loader2 } from 'lucide-react';

interface GameRecord {
  id: number;
  scenario: string;
  final_score: number;
  result: 'success' | 'failure';
  played_at: string;
}

interface Stats {
  total: number;
  success: number;
  failure: number;
  avgScore: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);

  // 获取用户信息
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // 未登录，跳转到登录页
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  // 获取游戏记录
  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/records/list');
        if (response.ok) {
          const data = await response.json();
          setRecords(data.records || []);
          setStats(data.stats || { total: 0, success: 0, failure: 0, avgScore: 0 });
        } else if (response.status === 401) {
          router.push('/login');
        }
      } catch (error) {
        console.error('获取游戏记录失败:', error);
        setError('获取游戏记录失败');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user, router]);

  // 登出
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <User className="w-4 h-4" />
              <span className="font-medium">{user?.username}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              登出
            </Button>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 用户信息卡片 */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.username}</h1>
                <p className="text-white/80">欢迎回来！继续你的哄人之旅~</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="secondary" size="lg" className="bg-white text-pink-500 hover:bg-pink-50">
                <Play className="w-4 h-4 mr-2" />
                开始新游戏
              </Button>
            </Link>
          </div>
        </div>

        {/* 统计数据 */}
        {stats && stats.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4 bg-white/90 dark:bg-gray-800/90">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.total}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">总游戏次数</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/90 dark:bg-gray-800/90">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">{stats.success}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">成功通关</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/90 dark:bg-gray-800/90">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{stats.failure}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">挑战失败</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/90 dark:bg-gray-800/90">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">{stats.avgScore.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">平均好感度</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 游戏记录列表 */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            历史游戏记录
          </h2>

          {error && (
            <Card className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 mb-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </Card>
          )}

          {records.length === 0 ? (
            <Card className="p-12 text-center bg-white/90 dark:bg-gray-800/90">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                还没有游戏记录
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                开始你的第一局游戏吧！
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                  <Play className="w-4 h-4 mr-2" />
                  开始游戏
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <Card key={record.id} className="p-4 bg-white/90 dark:bg-gray-800/90 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-lg font-bold ${record.result === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                          {record.result === 'success' ? '🎉 通关' : '💔 失败'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(record.played_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                        场景：{record.scenario}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-2xl font-bold ${getScoreColor(record.final_score)}`}>
                        {record.final_score}分
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">好感度</p>
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute h-full ${getProgressColor(record.final_score)} transition-all duration-500`}
                      style={{ width: `${Math.max(0, Math.min(100, ((record.final_score + 50) / 150) * 100))}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
