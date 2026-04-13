'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Heart, UserCircle, ChevronRight, Baby, BookOpen, LogOut, User, Trophy } from 'lucide-react';

// ==================== 配置数据 ====================

// 关系类型配置
const relationshipTypes = [
  { id: 'couple', name: '情侣', icon: '💑', description: '男朋友、女朋友' },
  { id: 'spouse', name: '夫妻', icon: '💍', description: '老公、老婆' },
  { id: 'family', name: '家庭', icon: '👨‍👩‍👧', description: '父母、子女、兄弟姐妹' },
  { id: 'friend', name: '朋友', icon: '🤝', description: '闺蜜、兄弟、朋友' },
  { id: 'work', name: '职场', icon: '💼', description: '领导、同事、下属' },
];

// 具体角色配置（更全面）
const roleOptions: Record<string, { id: string; name: string; gender: 'male' | 'female' | 'child' }[]> = {
  couple: [
    { id: 'boyfriend', name: '哄男朋友', gender: 'male' },
    { id: 'girlfriend', name: '哄女朋友', gender: 'female' },
  ],
  spouse: [
    { id: 'husband', name: '哄老公', gender: 'male' },
    { id: 'wife', name: '哄老婆', gender: 'female' },
  ],
  family: [
    { id: 'father', name: '哄爸爸', gender: 'male' },
    { id: 'mother', name: '哄妈妈', gender: 'female' },
    { id: 'older_brother', name: '哄哥哥', gender: 'male' },
    { id: 'older_sister', name: '哄姐姐', gender: 'female' },
    { id: 'younger_brother', name: '哄弟弟', gender: 'male' },
    { id: 'younger_sister', name: '哄妹妹', gender: 'female' },
    { id: 'son', name: '哄儿子', gender: 'child' },
    { id: 'daughter', name: '哄女儿', gender: 'child' },
  ],
  friend: [
    { id: 'female_bestie', name: '哄闺蜜', gender: 'female' },
    { id: 'male_buddy', name: '哄兄弟', gender: 'male' },
    { id: 'female_friend', name: '哄女性朋友', gender: 'female' },
    { id: 'male_friend', name: '哄男性朋友', gender: 'male' },
  ],
  work: [
    { id: 'male_boss', name: '哄男领导', gender: 'male' },
    { id: 'female_boss', name: '哄女领导', gender: 'female' },
    { id: 'male_colleague', name: '哄男同事', gender: 'male' },
    { id: 'female_colleague', name: '哄女同事', gender: 'female' },
    { id: 'male_subordinate', name: '哄男下属', gender: 'male' },
    { id: 'female_subordinate', name: '哄女下属', gender: 'female' },
  ],
};

// 场景标签配置（根据关系类型动态显示）
const sceneConfigs: Record<string, { id: string; name: string; emoji: string }[]> = {
  // 情侣/夫妻：有纪念日、生日
  couple: [
    { id: 'forgot_anniversary', name: '忘记纪念日', emoji: '📅' },
    { id: 'forgot_birthday', name: '忘记生日', emoji: '🎂' },
    { id: 'forgot_promise', name: '忘记承诺', emoji: '🤞' },
    { id: 'said_wrong', name: '说错话', emoji: '💬' },
    { id: 'did_wrong', name: '做错事', emoji: '🚫' },
    { id: 'jealousy', name: '吃醋了', emoji: '😤' },
    { id: 'neglect', name: '忽略TA了', emoji: '😔' },
    { id: 'other', name: '其他原因', emoji: '❓' },
  ],
  spouse: [
    { id: 'forgot_anniversary', name: '忘记纪念日', emoji: '📅' },
    { id: 'forgot_birthday', name: '忘记生日', emoji: '🎂' },
    { id: 'forgot_promise', name: '忘记承诺', emoji: '🤞' },
    { id: 'said_wrong', name: '说错话', emoji: '💬' },
    { id: 'did_wrong', name: '做错事', emoji: '🚫' },
    { id: 'jealousy', name: '吃醋了', emoji: '😤' },
    { id: 'neglect', name: '忽略TA了', emoji: '😔' },
    { id: 'money_issue', name: '钱的问题', emoji: '💰' },
    { id: 'other', name: '其他原因', emoji: '❓' },
  ],
  // 家庭：有生日，没有纪念日
  family: [
    { id: 'forgot_birthday', name: '忘记生日', emoji: '🎂' },
    { id: 'forgot_promise', name: '忘记承诺', emoji: '🤞' },
    { id: 'said_wrong', name: '说错话', emoji: '💬' },
    { id: 'did_wrong', name: '做错事', emoji: '🚫' },
    { id: 'disobeyed', name: '不听话', emoji: '😤' },
    { id: 'neglect', name: '忽略TA了', emoji: '😔' },
    { id: 'study_issue', name: '学习问题', emoji: '📚' },
    { id: 'other', name: '其他原因', emoji: '❓' },
  ],
  // 朋友：没有纪念日、生日
  friend: [
    { id: 'forgot_appointment', name: '忘记约定', emoji: '📅' },
    { id: 'said_wrong', name: '说错话', emoji: '💬' },
    { id: 'did_wrong', name: '做错事', emoji: '🚫' },
    { id: 'forgot_promise', name: '忘记承诺', emoji: '🤞' },
    { id: 'neglect', name: '忽略TA了', emoji: '😔' },
    { id: 'borrowed_money', name: '借钱问题', emoji: '💰' },
    { id: 'other', name: '其他原因', emoji: '❓' },
  ],
  // 职场：没有纪念日、生日
  work: [
    { id: 'work_mistake', name: '工作失误', emoji: '📊' },
    { id: 'late_absent', name: '迟到早退', emoji: '⏰' },
    { id: 'forgot_task', name: '忘记任务', emoji: '📝' },
    { id: 'said_wrong', name: '说错话', emoji: '💬' },
    { id: 'did_wrong', name: '做错事', emoji: '🚫' },
    { id: 'missed_deadline', name: '错过截止日期', emoji: '📅' },
    { id: 'attitude_issue', name: '态度问题', emoji: '😤' },
    { id: 'other', name: '其他原因', emoji: '❓' },
  ],
};

// 生气阶段配置（根据关系类型动态显示）
const angerStageConfigs: Record<string, { id: string; name: string; emoji: string; description: string }[]> = {
  couple: [
    { id: 'just_angry', name: '刚生气', emoji: '😤', description: 'TA刚发现，正在气头上' },
    { id: 'cold_war', name: '冷战中', emoji: '🧊', description: 'TA不理你，冷暴力中' },
    { id: 'blocked', name: '被拉黑', emoji: '🚫', description: 'TA把你拉黑了' },
    { id: 'want_breakup', name: '提分手', emoji: '💔', description: 'TA说想分手' },
    { id: 'post_breakup', name: '分手挽回', emoji: '💔', description: '已经分手，想挽回' },
  ],
  spouse: [
    { id: 'just_angry', name: '刚生气', emoji: '😤', description: 'TA刚发现，正在气头上' },
    { id: 'cold_war', name: '冷战中', emoji: '🧊', description: 'TA不理你，冷暴力中' },
    { id: 'separated', name: '分居中', emoji: '🏠', description: 'TA搬出去住了' },
    { id: 'want_divorce', name: '提离婚', emoji: '💔', description: 'TA说想离婚' },
  ],
  family: [
    { id: 'just_angry', name: '刚生气', emoji: '😤', description: 'TA刚发现，正在气头上' },
    { id: 'cold_war', name: '冷战不理', emoji: '🧊', description: 'TA不理你，躲着你' },
    { id: 'ran_away', name: '离家出走', emoji: '🏃', description: 'TA离家出走了' },
    { id: 'lock_door', name: '锁门不出', emoji: '🚪', description: 'TA把自己锁房间里了' },
  ],
  friend: [
    { id: 'just_angry', name: '刚生气', emoji: '😤', description: 'TA刚发现，正在气头上' },
    { id: 'cold_war', name: '冷战不理', emoji: '🧊', description: 'TA不理你，冷暴力中' },
    { id: 'blocked', name: '被拉黑', emoji: '🚫', description: 'TA把你拉黑了' },
    { id: 'want_cut_ties', name: '想绝交', emoji: '✂️', description: 'TA说想绝交' },
  ],
  work: [
    { id: 'just_angry', name: '刚生气', emoji: '😤', description: 'TA刚发现，正在气头上' },
    { id: 'cold_war', name: '冷战不理', emoji: '🧊', description: 'TA不理你，公事公办' },
    { id: 'complaint', name: '要投诉', emoji: '📋', description: 'TA说要投诉你' },
    { id: 'resignation', name: '要辞职', emoji: '📝', description: '下属说要辞职' },
  ],
};

// 声音类型配置（更丰富）
const voiceOptions = [
  // 女声
  { id: 'cute_girl', name: '可爱软妹', emoji: '🎀', speakerId: 'saturn_zh_female_keainvsheng_tob', category: 'female', description: '甜美可爱，软萌系' },
  { id: 'cool_girl', name: '霸道御姐', emoji: '👑', speakerId: 'zh_female_jitangnv_saturn_bigtts', category: 'female', description: '气场强大，女王范' },
  { id: 'gentle_female', name: '温柔姐姐', emoji: '💕', speakerId: 'zh_female_meilinvyou_saturn_bigtts', category: 'female', description: '温柔体贴，知性美' },
  { id: 'energetic_girl', name: '元气少女', emoji: '🌟', speakerId: 'zh_female_vv_uranus_bigtts', category: 'female', description: '活泼开朗，充满活力' },
  { id: 'intellectual_female', name: '知性姐姐', emoji: '📚', speakerId: 'zh_female_santongyongns_saturn_bigtts', category: 'female', description: '成熟稳重，有内涵' },
  { id: 'tsundere_female', name: '傲娇大小姐', emoji: '😤', speakerId: 'saturn_zh_female_tiaopigongzhu_tob', category: 'female', description: '嘴硬心软，傲娇型' },
  // 男声
  { id: 'gentle_male', name: '温柔男声', emoji: '💙', speakerId: 'zh_male_taocheng_uranus_bigtts', category: 'male', description: '温和亲切，暖男系' },
  { id: 'deep_male', name: '低沉男声', emoji: '🎤', speakerId: 'zh_male_m191_uranus_bigtts', category: 'male', description: '低沉有磁性，成熟型' },
  { id: 'domineering_male', name: '霸道总裁', emoji: '👔', speakerId: 'zh_male_dayi_saturn_bigtts', category: 'male', description: '强势霸道，总裁范' },
  { id: 'sunny_boy', name: '阳光少年', emoji: '☀️', speakerId: 'saturn_zh_male_shuanglangshaonian_tob', category: 'male', description: '阳光开朗，少年感' },
  { id: 'cool_male', name: '清冷男神', emoji: '❄️', speakerId: 'zh_male_ruyayichen_saturn_bigtts', category: 'male', description: '冷峻清冷，高冷范' },
  { id: 'tsundere_male', name: '傲娇少爷', emoji: '😏', speakerId: 'saturn_zh_male_tiancaitongzhuo_tob', category: 'male', description: '嘴硬心软，傲娇型' },
  // 童声
  { id: 'cute_loli', name: '可爱萝莉', emoji: '🌸', speakerId: 'zh_female_xueayi_saturn_bigtts', category: 'child', description: '软萌可爱，小女孩' },
  { id: 'naughty_boy', name: '调皮正太', emoji: '🎈', speakerId: 'saturn_zh_male_tiancaitongzhuo_tob', category: 'child', description: '活泼调皮，小男孩' },
  { id: 'good_girl', name: '乖乖女', emoji: '👧', speakerId: 'zh_female_xueayi_saturn_bigtts', category: 'child', description: '乖巧懂事，文静型' },
  { id: 'little_master', name: '小少爷', emoji: '👦', speakerId: 'saturn_zh_male_tiancaitongzhuo_tob', category: 'child', description: '娇气任性，小少爷' },
];

type StepType = 'relationship' | 'role' | 'scene' | 'anger_stage' | 'voice';

export default function SelectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepType>('relationship');
  const [selectedRelationship, setSelectedRelationship] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);
  const [selectedAngerStage, setSelectedAngerStage] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  // 用户认证状态
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // 获取当前用户信息
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setLoadingAuth(false);
      }
    };
    fetchUser();
  }, []);

  // 登出
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 获取当前步骤索引
  const getCurrentStepIndex = () => {
    const steps: StepType[] = ['relationship', 'role', 'scene', 'anger_stage', 'voice'];
    return steps.indexOf(currentStep);
  };

  // 计算进度
  const getProgress = () => {
    return ((getCurrentStepIndex() + 1) / 5) * 100;
  };

  // 选择关系类型
  const handleSelectRelationship = (id: string) => {
    setSelectedRelationship(id);
    setSelectedRole(null); // 重置角色选择
    setSelectedScenes([]); // 重置场景选择
    setSelectedAngerStage(null); // 重置生气阶段
    setCurrentStep('role');
  };

  // 选择角色
  const handleSelectRole = (id: string) => {
    setSelectedRole(id);
    setCurrentStep('scene');
  };

  // 切换场景选择
  const toggleScene = (id: string) => {
    if (id === 'other') {
      // 点击"其他原因"时显示输入框
      setShowOtherInput(!showOtherInput);
      if (!showOtherInput) {
        setSelectedScenes(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
      } else {
        setSelectedScenes(prev => prev.filter(s => s !== id));
        setOtherReason('');
      }
    } else {
      setSelectedScenes(prev => 
        prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
      );
    }
  };

  // 确认场景，进入生气阶段
  const handleConfirmScenes = () => {
    // 如果选择了"其他原因"但没有输入内容，提示用户
    if (selectedScenes.includes('other') && !otherReason.trim()) {
      alert('请输入其他原因的具体内容');
      return;
    }
    if (selectedScenes.length > 0) {
      setCurrentStep('anger_stage');
    }
  };

  // 选择生气阶段
  const handleSelectAngerStage = (id: string) => {
    setSelectedAngerStage(id);
    setCurrentStep('voice');
  };

  // 开始游戏
  const handleStartGame = () => {
    if (selectedVoice) {
      // 构建场景描述
      let sceneDescription = selectedScenes.join(',');
      if (selectedScenes.includes('other') && otherReason.trim()) {
        sceneDescription = sceneDescription.replace('other', `other:${encodeURIComponent(otherReason.trim())}`);
      }
      
      const params = new URLSearchParams({
        relationship: selectedRelationship!,
        role: selectedRole!,
        scenes: sceneDescription,
        angerStage: selectedAngerStage!,
        voice: selectedVoice,
      });
      router.push(`/game?${params.toString()}`);
    }
  };

  // 获取当前角色的性别
  const getCurrentGender = () => {
    if (!selectedRelationship || !selectedRole) return 'female';
    const role = roleOptions[selectedRelationship]?.find(r => r.id === selectedRole);
    return role?.gender || 'female';
  };

  // 根据性别过滤声音选项
  const getFilteredVoices = () => {
    const gender = getCurrentGender();
    if (gender === 'child') {
      return voiceOptions.filter(v => v.category === 'child');
    }
    return voiceOptions.filter(v => v.category === gender);
  };

  // 获取当前关系类型对应的场景
  const getCurrentScenes = () => {
    return sceneConfigs[selectedRelationship || 'couple'] || sceneConfigs.couple;
  };

  // 获取当前关系类型对应的生气阶段
  const getCurrentAngerStages = () => {
    return angerStageConfigs[selectedRelationship || 'couple'] || angerStageConfigs.couple;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-50 to-yellow-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* 顶部进度条 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {currentStep === 'relationship' && '选择关系类型'}
              {currentStep === 'role' && '选择具体角色'}
              {currentStep === 'scene' && '选择生气原因'}
              {currentStep === 'anger_stage' && '选择生气阶段'}
              {currentStep === 'voice' && '选择对方声音'}
            </span>
            <div className="flex items-center gap-2">
              {/* 用户登录状态 */}
              {loadingAuth ? (
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <Link href="/profile">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-gray-600 dark:text-gray-300"
                    >
                      <User className="w-4 h-4" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                    <span className="max-w-20 truncate">{user.username}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="h-7 px-2 text-gray-600 dark:text-gray-300"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-1">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="h-7 px-3 text-sm">
                      登录
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="h-7 px-3 text-sm bg-pink-500 hover:bg-pink-600">
                      注册
                    </Button>
                  </Link>
                </div>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                步骤 {getCurrentStepIndex() + 1}/5
              </span>
            </div>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>
      </div>

      {/* 主内容区域 */}
      <main className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
        {/* Logo 和标题 - 更醒目 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 shadow-2xl mb-6 ring-4 ring-pink-200 dark:ring-pink-900/50 animate-bounce">
            <Heart className="w-14 h-14 text-white animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-purple-600 mb-4 drop-shadow-sm">
            哄哄模拟器
          </h1>
          <div className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 rounded-full px-6 py-3 border-2 border-pink-300 dark:border-pink-700">
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 font-medium">
              💝 选择场景，挑战哄好TA！
            </p>
          </div>
        </div>

        {/* 快捷入口 - 两列布局更醒目 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* 恋爱攻略入口 */}
          <Link href="/blog">
            <Card className="h-full p-4 bg-gradient-to-br from-pink-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-1">📚 恋爱攻略</h3>
                <p className="text-xs text-white/80">
                  学习技巧
                </p>
              </div>
            </Card>
          </Link>

          {/* 排行榜入口 */}
          <Link href="/leaderboard">
            <Card className="h-full p-4 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-1">🏆 排行榜</h3>
                <p className="text-xs text-white/80">
                  冲击榜首
                </p>
              </div>
            </Card>
          </Link>
        </div>

        {/* 步骤1: 选择关系类型 */}
        {currentStep === 'relationship' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-3">
                <span className="text-lg">🎯</span>
                步骤 1/5
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                你想哄谁？
              </h2>
              <p className="text-gray-500 dark:text-gray-400">选择你和TA的关系类型</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relationshipTypes.map((type) => (
                <Card
                  key={type.id}
                  className="p-6 cursor-pointer hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 border-2 border-transparent hover:border-pink-400 dark:hover:border-pink-500 bg-white/90 dark:bg-gray-800/90 shadow-lg"
                  onClick={() => handleSelectRelationship(type.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{type.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{type.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-pink-500" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 步骤2: 选择具体角色 */}
        {currentStep === 'role' && selectedRelationship && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setCurrentStep('relationship')}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
            >
              ← 返回上一步
            </button>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-3">
                <span className="text-lg">🎭</span>
                步骤 2/5
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                你是哪个角色？
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {roleOptions[selectedRelationship]?.map((role) => (
                <Card
                  key={role.id}
                  className={`p-4 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border-2 bg-white/80 dark:bg-gray-800/80 ${
                    selectedRole === role.id
                      ? 'border-pink-400 dark:border-pink-500 ring-2 ring-pink-200 dark:ring-pink-800'
                      : 'border-transparent hover:border-pink-300 dark:hover:border-pink-600'
                  }`}
                  onClick={() => handleSelectRole(role.id)}
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      role.gender === 'female' 
                        ? 'bg-pink-100 dark:bg-pink-900' 
                        : role.gender === 'child'
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      {role.gender === 'child' ? (
                        <Baby className={`w-6 h-6 text-green-500 dark:text-green-400`} />
                      ) : (
                        <UserCircle className={`w-6 h-6 ${
                          role.gender === 'female' 
                            ? 'text-pink-500 dark:text-pink-400' 
                            : 'text-blue-500 dark:text-blue-400'
                        }`} />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{role.name}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 步骤3: 选择场景标签 */}
        {currentStep === 'scene' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setCurrentStep('role')}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
            >
              ← 返回上一步
            </button>
            <div className="text-center mb-2">
              <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-3">
                <span className="text-lg">😤</span>
                步骤 3/5
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                TA为什么生气？
              </h2>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                可以多选哦~
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getCurrentScenes().map((scene) => (
                <Card
                  key={scene.id}
                  className={`p-4 cursor-pointer transition-all duration-300 border-2 bg-white/80 dark:bg-gray-800/80 ${
                    selectedScenes.includes(scene.id)
                      ? 'border-pink-400 dark:border-pink-500 bg-pink-50 dark:bg-pink-900/30'
                      : 'border-transparent hover:border-pink-300 dark:hover:border-pink-600'
                  }`}
                  onClick={() => toggleScene(scene.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{scene.emoji}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{scene.name}</span>
                    {selectedScenes.includes(scene.id) && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            
            {/* 其他原因输入框 */}
            {showOtherInput && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                  请输入具体原因：
                </label>
                <Input
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="例如：忘记接TA下班..."
                  className="w-full"
                  maxLength={50}
                />
                <p className="text-xs text-gray-400 mt-1">最多50字</p>
              </div>
            )}
            
            <Button
              onClick={handleConfirmScenes}
              disabled={selectedScenes.length === 0}
              className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-6 text-lg disabled:opacity-50"
            >
              下一步：生气程度
            </Button>
          </div>
        )}

        {/* 步骤4: 选择生气阶段 */}
        {currentStep === 'anger_stage' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setCurrentStep('scene')}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
            >
              ← 返回上一步
            </button>
            <div className="text-center mb-2">
              <div className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-3">
                <span className="text-lg">🔥</span>
                步骤 4/5
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                TA现在什么状态？
              </h2>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                选择TA现在的生气程度
              </p>
            </div>
            <div className="space-y-3">
              {getCurrentAngerStages().map((stage) => (
                <Card
                  key={stage.id}
                  className={`p-5 cursor-pointer transition-all duration-300 border-2 bg-white/80 dark:bg-gray-800/80 ${
                    selectedAngerStage === stage.id
                      ? 'border-pink-400 dark:border-pink-500 ring-2 ring-pink-200 dark:ring-pink-800'
                      : 'border-transparent hover:border-pink-300 dark:hover:border-pink-600'
                  }`}
                  onClick={() => handleSelectAngerStage(stage.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{stage.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{stage.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stage.description}</p>
                    </div>
                    {selectedAngerStage === stage.id && (
                      <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 步骤5: 选择声音类型 */}
        {currentStep === 'voice' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setCurrentStep('anger_stage')}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
            >
              ← 返回上一步
            </button>
            <div className="text-center mb-2">
              <div className="inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-3">
                <span className="text-lg">🎵</span>
                步骤 5/5
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                TA的声音是什么样的？
              </h2>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                选一个符合TA性格的声音吧~
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getFilteredVoices().map((voice) => (
                <Card
                  key={voice.id}
                  className={`p-4 cursor-pointer transition-all duration-300 border-2 bg-white/80 dark:bg-gray-800/80 ${
                    selectedVoice === voice.id
                      ? 'border-pink-400 dark:border-pink-500 ring-2 ring-pink-200 dark:ring-pink-800'
                      : 'border-transparent hover:border-pink-300 dark:hover:border-pink-600'
                  }`}
                  onClick={() => setSelectedVoice(voice.id)}
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="text-3xl">{voice.emoji}</span>
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 block">{voice.name}</span>
                      <span className="text-xs text-gray-400">{voice.description}</span>
                    </div>
                    {selectedVoice === voice.id && (
                      <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            <Button
              onClick={handleStartGame}
              disabled={!selectedVoice}
              className="w-full mt-8 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-8 text-xl shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 disabled:opacity-50 rounded-2xl"
            >
              <span className="mr-2">🚀</span>
              {selectedVoice ? '开始挑战！' : '请先选择声音'}
            </Button>
            {selectedVoice && (
              <p className="text-center text-sm text-pink-500 mt-3 animate-pulse">
                一切准备就绪，点击开始吧！
              </p>
            )}
          </div>
        )}
      </main>

      {/* 底部装饰 */}
      <div className="fixed bottom-4 left-0 right-0 text-center text-sm text-gray-400 dark:text-gray-500">
        🎮 一个让你学会哄人的小游戏
      </div>
    </div>
  );
}
