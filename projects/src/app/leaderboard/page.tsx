'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trophy, Medal, Crown, Loader2, Star } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  finalScore: number;
  playedAt: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
          setCurrentUserId(data.currentUserId || null);
        } else {
          throw new Error('获取排行榜失败');
        }
      } catch (error) {
        console.error('获取排行榜失败:', error);
        setError('获取排行榜失败');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-500" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 dark:text-gray-400">{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-yellow-500';
    if (score >= 90) return 'text-green-500';
    if (score >= 85) return 'text-blue-500';
    if (score >= 80) return 'text-purple-500';
    return 'text-pink-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isCurrentUser = (userId: number) => {
    return currentUserId !== null && userId === currentUserId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">加载排行榜...</p>
        </div>
      </div>
    );
  }

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
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-500 shadow-lg mb-4 animate-pulse">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
            排行榜
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            哄人高手都在这里，看看你能排第几？
          </p>
        </div>

        {/* 提示信息 */}
        {error && (
          <Card className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
            <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
          </Card>
        )}

        {!error && leaderboard.length === 0 && (
          <Card className="mb-6 p-12 text-center bg-white/90 dark:bg-gray-800/90">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              排行榜空空如也
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              快来成为第一个哄人高手吧！
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                开始游戏
              </Button>
            </Link>
          </Card>
        )}

        {/* 排行榜列表 */}
        {leaderboard.length > 0 && (
          <div className="space-y-3">
            {/* 前三名特殊显示 */}
            {leaderboard.slice(0, 3).map((entry, index) => (
              <Card
                key={entry.userId}
                className={`p-6 relative overflow-hidden ${
                  isCurrentUser(entry.userId)
                    ? 'bg-gradient-to-r from-pink-100 via-purple-100 to-pink-100 dark:from-pink-900/30 dark:via-purple-900/30 dark:to-pink-900/30 border-2 border-pink-400 dark:border-pink-500 shadow-xl'
                    : 'bg-white/90 dark:bg-gray-800/90'
                }`}
              >
                {/* 背景装饰 */}
                {index === 0 && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                )}
                {index === 1 && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gray-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                )}
                {index === 2 && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                )}

                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-4">
                    {/* 排名 */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadge(entry.rank)} shadow-lg`}>
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* 用户信息 */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {entry.username}
                        </h3>
                        {isCurrentUser(entry.userId) && (
                          <span className="text-xs px-2 py-0.5 bg-pink-500 text-white rounded-full font-medium">
                            你
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        达成时间：{formatDate(entry.playedAt)}
                      </p>
                    </div>
                  </div>

                  {/* 分数 */}
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getScoreColor(entry.finalScore)}`}>
                      {entry.finalScore}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">好感度</p>
                  </div>
                </div>
              </Card>
            ))}

            {/* 其他排名 */}
            {leaderboard.slice(3).map((entry) => (
              <Card
                key={entry.userId}
                className={`p-4 flex items-center justify-between transition-all hover:shadow-md ${
                  isCurrentUser(entry.userId)
                    ? 'bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-300 dark:border-pink-600'
                    : 'bg-white/90 dark:bg-gray-800/90'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* 排名 */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankBadge(entry.rank)}`}>
                    <span className="font-bold text-sm">{entry.rank}</span>
                  </div>

                  {/* 用户信息 */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        {entry.username}
                      </h3>
                      {isCurrentUser(entry.userId) && (
                        <span className="text-xs px-2 py-0.5 bg-pink-500 text-white rounded-full">
                          你
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(entry.playedAt)}
                    </p>
                  </div>
                </div>

                {/* 分数 */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(entry.finalScore)}`}>
                    {entry.finalScore}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">好感度</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 底部提示 */}
        {!error && leaderboard.length > 0 && (
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-pink-500 to-purple-500 border-0 text-white">
              <div className="p-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="w-5 h-5" />
                  <h3 className="text-xl font-bold">想要上榜？</h3>
                </div>
                <p className="text-white/90 mb-4">
                  登录后开始游戏，你的最高分将会记录在排行榜上！
                </p>
                <Link href="/">
                  <Button size="lg" variant="secondary" className="bg-white text-pink-500 hover:bg-pink-50">
                    立即挑战
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
