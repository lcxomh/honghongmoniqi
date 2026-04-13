'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Volume2, RotateCcw, Share2 } from 'lucide-react';

// 消息类型
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
}

// 选项类型
interface Option {
  id: string;
  text: string;
  scoreChange: number;
}

// 根据生气阶段获取初始好感度
const getInitialScoreByAngerStage = (angerStage: string): number => {
  const adjustments: Record<string, number> = {
    just_angry: 20, cold_war: 5, blocked: -10, want_breakup: -20, post_breakup: -30,
    separated: 0, want_divorce: -25, ran_away: -5, lock_door: 0,
    want_cut_ties: -15, complaint: -10, resignation: -5,
  };
  return adjustments[angerStage] ?? 20;
};

// 情绪表情
const getEmotionEmoji = (score: number): string => {
  if (score < 0) return '😡';
  if (score < 30) return '😤';
  if (score < 60) return '😒';
  if (score < 80) return '🥺';
  return '🥰';
};

// 情绪描述
const getEmotionText = (score: number): string => {
  if (score < 0) return '非常生气';
  if (score < 30) return '还在生气';
  if (score < 60) return '开始软化';
  if (score < 80) return '快哄好了';
  return '基本原谅';
};

// 游戏主组件
export default function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitializedRef = useRef(false);
  
  // 使用 useRef 代替模块级变量，确保只在客户端生成 ID
  const messageIdCounterRef = useRef(0);
  const generateMessageId = useCallback(() => {
    messageIdCounterRef.current += 1;
    return `msg_${messageIdCounterRef.current}_${Date.now()}`;
  }, []);

  // 从 URL 获取配置
  const relationship = searchParams.get('relationship') || 'couple';
  const role = searchParams.get('role') || 'girlfriend';
  const scenesParam = searchParams.get('scenes') || 'other';
  const angerStage = searchParams.get('angerStage') || 'just_angry';
  const voice = searchParams.get('voice') || 'cute_girl';

  const scenes = scenesParam.split(',').map(s => {
    if (s.startsWith('other:')) {
      return decodeURIComponent(s.substring(6));
    }
    return s;
  });

  const initialScore = getInitialScoreByAngerStage(angerStage);

  // 游戏状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [score, setScore] = useState(initialScore);
  const [round, setRound] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [scoreChange, setScoreChange] = useState<number | null>(null);
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  const [gameEnded, setGameEnded] = useState<'success' | 'failure' | null>(null);
  const [endingMessage, setEndingMessage] = useState<string>('');
  const [recordSaved, setRecordSaved] = useState<boolean | null>(null); // null=未尝试, true=已保存, false=未登录
  const [showRecordMessage, setShowRecordMessage] = useState(false);

  // 播放语音
  const playAudio = useCallback((audioUrl: string) => {
    if (audioRef.current) audioRef.current.pause();
    audioRef.current = new Audio(audioUrl);
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.play().catch(() => {});
    setIsPlaying(true);
  }, []);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  // 消息变化时滚动
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // 初始化游戏
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initGame = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/chat/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            relationship, role, scenes, angerStage, voice,
            initialScore,
          }),
        });
        const data = await response.json();
        
        if (data.message) {
          setMessages([{
            id: generateMessageId(),
            role: 'assistant',
            content: data.message,
            audioUrl: data.audioUrl,
          }]);
          setCurrentAudio(data.audioUrl);
          
          if (data.audioUrl) {
            setTimeout(() => playAudio(data.audioUrl), 500);
          }
        }
        
        if (data.options) {
          setOptions(data.options);
        }
      } catch (error) {
        console.error('初始化游戏失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initGame();
  }, [relationship, role, scenes, angerStage, voice, initialScore, generateMessageId, playAudio]); // 依赖项列表包含所有使用的变量

  // 选择选项
  const handleSelectOption = useCallback(async (option: Option) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    setMessages(prev => [...prev, {
      id: generateMessageId(),
      role: 'user',
      content: option.text,
    }]);
    
    setScoreChange(option.scoreChange);
    setShowScoreAnimation(true);
    
    const newScore = Math.max(-50, Math.min(100, score + option.scoreChange));
    setScore(newScore);
    
    setTimeout(() => {
      setShowScoreAnimation(false);
      setScoreChange(null);
    }, 1500);
    
    try {
      const response = await fetch('/api/chat/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationship, role, angerStage, voice,
          userMessage: option.text,
          scoreChange: option.scoreChange,
          currentScore: newScore,
          round: round + 1,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      
      if (data.message) {
        setMessages(prev => [...prev, {
          id: generateMessageId(),
          role: 'assistant',
          content: data.message,
          audioUrl: data.audioUrl,
        }]);
        setCurrentAudio(data.audioUrl);
        
        if (data.audioUrl) {
          setTimeout(() => playAudio(data.audioUrl), 500);
        }
      }
      
      if (data.options) {
        setOptions(data.options);
      }
      
      if (data.gameEnded) {
        setGameEnded(data.gameEnded);
        setEndingMessage(data.endingMessage || '');
        if (data.endingAudio) {
          setTimeout(() => playAudio(data.endingAudio), 500);
        }

        // 保存游戏记录
        saveGameRecord(data.gameEnded);
      } else {
        setRound(prev => prev + 1);
      }
    } catch (error) {
      console.error('获取回复失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, relationship, role, angerStage, voice, score, round, messages, playAudio, generateMessageId]);

  const handleRestart = useCallback(() => {
    setRecordSaved(null);
    setShowRecordMessage(false);
    router.push('/');
  }, [router]);

  // 保存游戏记录
  const saveGameRecord = useCallback(async (result: 'success' | 'failure') => {
    try {
      const scenarioName = scenes.join(', ');
      const response = await fetch('/api/records/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: scenarioName,
          final_score: score,
          result,
        }),
      });

      if (response.ok) {
        setRecordSaved(true);
        setShowRecordMessage(true);
      } else if (response.status === 401) {
        setRecordSaved(false);
        setShowRecordMessage(true);
      }
    } catch (error) {
      console.error('保存游戏记录失败:', error);
      setRecordSaved(false);
      setShowRecordMessage(true);
    }
  }, [scenes, score]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: '哄哄模拟器', text: '我成功哄好了TA！', url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert('链接已复制！');
    }
  }, []);

  const getProgressColor = useCallback((s: number) => {
    if (s < 0) return 'bg-red-500';
    if (s < 30) return 'bg-orange-500';
    if (s < 60) return 'bg-yellow-500';
    if (s < 80) return 'bg-green-400';
    return 'bg-green-500';
  }, []);

  const getProgressWidth = useCallback((s: number) => Math.max(0, Math.min(100, ((s + 50) / 150) * 100)), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex flex-col">
      {/* 顶部状态栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getEmotionEmoji(score)}</span>
              <div className="text-sm">
                <div className="font-medium text-gray-800 dark:text-gray-200">好感度: {score}分</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{getEmotionText(score)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">第{round}轮</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">共10轮</div>
            </div>
          </div>
          <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className={`absolute h-full ${getProgressColor(score)} transition-all duration-1000 ease-out`} style={{ width: `${getProgressWidth(score)}%` }} />
            <div className="absolute top-0 bottom-0 w-0.5 bg-green-600" style={{ left: '86.67%' }} />
          </div>
          {showScoreAnimation && scoreChange !== null && (
            <div className={`absolute top-16 left-1/2 -translate-x-1/2 text-2xl font-bold animate-bounce ${scoreChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
            </div>
          )}
        </div>
      </div>

      {/* 聊天区域 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 pt-28 overflow-y-auto"
        style={{ paddingBottom: gameEnded ? '2rem' : '20rem' }}
      >
        <div className="max-w-lg mx-auto px-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-pink-100 dark:bg-pink-900'}`}>
                  <svg className={`w-6 h-6 ${message.role === 'user' ? 'text-blue-500 dark:text-blue-400' : 'text-pink-500 dark:text-pink-400'}`} viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M12 14c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" />
                  </svg>
                </div>
                <div className={`rounded-2xl px-4 py-2 shadow-sm ${message.role === 'user' ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.role === 'assistant' && message.audioUrl && (
                    <button onClick={() => playAudio(message.audioUrl!)} className="mt-2 flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600">
                      <Volume2 className="w-4 h-4" />
                      {isPlaying && currentAudio === message.audioUrl ? '暂停' : '播放语音'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="h-4" />
        </div>
      </div>

      {/* 选项区域 */}
      {!gameEnded && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">选择你的回复：</div>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full" />
                <span className="ml-2 text-gray-500 dark:text-gray-400">思考中...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {options.map((option, index) => (
                  <button 
                    key={option.id} 
                    onClick={() => handleSelectOption(option)} 
                    className="w-full text-left px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-pink-50 dark:hover:bg-pink-900/30 border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600 transition-all duration-200 text-sm text-gray-700 dark:text-gray-300 active:scale-[0.98]"
                  >
                    <span className="font-medium text-gray-500 dark:text-gray-400 mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 游戏结束弹窗 */}
      {gameEnded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl">
            {gameEnded === 'success' ? (
              <>
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-2xl font-bold text-green-500 mb-4">恭喜通关！</h2>
                <div className="bg-pink-50 dark:bg-pink-900/30 rounded-2xl p-4 mb-6">
                  <p className="text-gray-700 dark:text-gray-300">{endingMessage}</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4 animate-pulse">💔</div>
                <h2 className="text-2xl font-bold text-red-500 mb-4">挑战失败</h2>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-4 mb-6">
                  <p className="text-gray-700 dark:text-gray-300">{endingMessage}</p>
                </div>
              </>
            )}

            {/* 记录保存提示 */}
            {showRecordMessage && (
              <div className={`rounded-xl p-3 mb-6 ${
                recordSaved
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700'
              }`}>
                <p className={`text-sm font-medium ${
                  recordSaved ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {recordSaved ? '✓ 您的游戏记录已经保存' : '💡 登录后可保存你的游戏记录'}
                </p>
                {!recordSaved && (
                  <Link href="/login" className="text-sm text-pink-500 hover:text-pink-600 font-medium mt-1 inline-block">
                    立即登录 →
                  </Link>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleRestart} variant="outline" className="flex-1 py-6">
                <RotateCcw className="w-5 h-5 mr-2" />再玩一次
              </Button>
              {gameEnded === 'success' && (
                <Button onClick={handleShare} className="flex-1 py-6 bg-gradient-to-r from-pink-500 to-purple-500">
                  <Share2 className="w-5 h-5 mr-2" />分享
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
