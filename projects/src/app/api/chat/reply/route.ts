import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 角色名称映射
const roleNames: Record<string, string> = {
  boyfriend: '男朋友',
  girlfriend: '女朋友',
  husband: '老公',
  wife: '老婆',
  father: '爸爸',
  mother: '妈妈',
  older_brother: '哥哥',
  older_sister: '姐姐',
  younger_brother: '弟弟',
  younger_sister: '妹妹',
  son: '儿子',
  daughter: '女儿',
  female_bestie: '闺蜜',
  male_buddy: '兄弟',
  female_friend: '女性朋友',
  male_friend: '男性朋友',
  male_boss: '男领导',
  female_boss: '女领导',
  male_colleague: '男同事',
  female_colleague: '女同事',
  male_subordinate: '男下属',
  female_subordinate: '女下属',
};

// 语音风格映射
const voiceStyleMap: Record<string, { style: string; personality: string; speakerId: string }> = {
  cute_girl: {
    style: '可爱软萌',
    personality: '说话喜欢用"嘛"、"呢"、"呀"等语气词，会撒娇嘟嘴',
    speakerId: 'saturn_zh_female_keainvsheng_tob',
  },
  cool_girl: {
    style: '酷酷高冷',
    personality: '说话简短有力，不轻易表露情感，有御姐范',
    speakerId: 'zh_female_jitangnv_saturn_bigtts',
  },
  gentle_female: {
    style: '温柔知性',
    personality: '说话轻声细语，语气温柔，即使生气也不会大吼大叫',
    speakerId: 'zh_female_meilinvyou_saturn_bigtts',
  },
  energetic_girl: {
    style: '活泼元气',
    personality: '说话充满活力，语速稍快，情绪外露',
    speakerId: 'zh_female_vv_uranus_bigtts',
  },
  intellectual_female: {
    style: '知性优雅',
    personality: '说话有条理，逻辑清晰，用词准确',
    speakerId: 'zh_female_santongyongns_saturn_bigtts',
  },
  tsundere_female: {
    style: '傲娇别扭',
    personality: '嘴上说着不要心里很在意，喜欢说"哼"、"才不是"',
    speakerId: 'saturn_zh_female_tiaopigongzhu_tob',
  },
  gentle_male: {
    style: '温柔暖男',
    personality: '说话温和有礼，关心人时很细心',
    speakerId: 'zh_male_taocheng_uranus_bigtts',
  },
  deep_male: {
    style: '深沉稳重',
    personality: '说话声音低沉有磁性，不苟言笑',
    speakerId: 'zh_male_m191_uranus_bigtts',
  },
  domineering_male: {
    style: '霸道强势',
    personality: '说话强势直接，不喜欢拐弯抹角',
    speakerId: 'zh_male_dayi_saturn_bigtts',
  },
  sunny_boy: {
    style: '阳光开朗',
    personality: '说话充满正能量，笑声爽朗',
    speakerId: 'saturn_zh_male_shuanglangshaonian_tob',
  },
  cool_male: {
    style: '酷酷高冷',
    personality: '说话简洁，不爱解释',
    speakerId: 'zh_male_ruyayichen_saturn_bigtts',
  },
  tsundere_male: {
    style: '傲娇别扭',
    personality: '明明关心却嘴硬，喜欢说"才没有"、"笨蛋"',
    speakerId: 'saturn_zh_male_tiancaitongzhuo_tob',
  },
  cute_loli: {
    style: '萝莉软萌',
    personality: '说话奶声奶气，喜欢用叠词',
    speakerId: 'zh_female_xueayi_saturn_bigtts',
  },
  naughty_boy: {
    style: '调皮活泼',
    personality: '说话顽皮，喜欢开玩笑',
    speakerId: 'saturn_zh_male_tiancaitongzhuo_tob',
  },
  good_girl: {
    style: '乖巧懂事',
    personality: '说话温和有礼，很懂事',
    speakerId: 'zh_female_xueayi_saturn_bigtts',
  },
  little_master: {
    style: '机灵聪明',
    personality: '说话像个小大人，逻辑清晰',
    speakerId: 'saturn_zh_male_tiancaitongzhuo_tob',
  },
};

// 根据好感度获取心情描述
const getMoodByScore = (score: number): string => {
  if (score < 0) return '非常愤怒，几乎不想理对方';
  if (score < 20) return '还在生气，态度冷淡';
  if (score < 40) return '稍微消气了一点，但还是不太开心';
  if (score < 60) return '开始软化，嘴硬心软';
  if (score < 80) return '基本原谅了，但还是想让对方多哄哄';
  return '已经原谅了，甚至有点开心';
};

export async function POST(request: NextRequest) {
  try {
    const { 
      role, 
      voice,
      userMessage, 
      scoreChange, 
      currentScore, 
      round,
      history 
    } = await request.json();

    const voiceInfo = voiceStyleMap[voice] || voiceStyleMap.cute_girl;
    const roleName = roleNames[role] || '对方';
    const isSuccess = currentScore >= 80;
    const isFailure = currentScore <= -50 || round >= 10;
    const currentMood = getMoodByScore(currentScore);

    // 游戏结束
    if (isSuccess || isFailure) {
      const endingType = isSuccess ? 'success' : 'failure';
      
      const endingPrompt = `你是哄人模拟游戏中的"${roleName}"角色。
说话风格：${voiceInfo.style}，${voiceInfo.personality}
当前心情：${currentMood}
最终好感度：${currentScore}分

${isSuccess 
  ? '对方成功把你哄好了！请说一句原谅、开心的话，表示你们和好了。' 
  : '对方没能把你哄好。请说一句失望、决绝的话，结束这段对话。'}

要求：
1. 长度20-35字
2. 符合你${voiceInfo.style}的风格
3. 不要用emoji
4. 只返回台词内容`;

      const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
      const config = new Config();
      const client = new LLMClient(config, customHeaders);

      const response = await client.invoke([
        { role: 'user', content: endingPrompt },
      ], {
        model: 'doubao-seed-1-6-lite-251015',
        temperature: 0.8,
      });

      let endingMessage = isSuccess ? '好吧，这次就原谅你了~' : '算了，我们就这样吧。';
      if (response.content) {
        endingMessage = response.content.trim();
      }

      let endingAudioUrl: string | null = null;
      try {
        const ttsClient = new TTSClient(config, customHeaders);
        const ttsResponse = await ttsClient.synthesize({
          uid: 'game_user',
          text: endingMessage,
          speaker: voiceInfo.speakerId,
          audioFormat: 'mp3',
          sampleRate: 24000,
        });
        endingAudioUrl = ttsResponse.audioUri;
      } catch {}

      return NextResponse.json({
        message: isSuccess ? '恭喜通关！' : '挑战失败',
        gameEnded: endingType,
        endingMessage,
        endingAudio: endingAudioUrl,
      });
    }

    // 构建对话历史 - 明确身份
    // 注意：在游戏中
    // - "TA" = AI角色（女朋友/男朋友等），生气的一方
    // - "玩家" = 用户，哄人的一方
    const historyText = history
      .slice(-6)
      .map((h: { role: string; content: string }) => 
        `${h.role === 'user' ? '玩家' : 'TA'}: ${h.content}`
      )
      .join('\n');

    const systemPrompt = `你是哄人模拟游戏中的角色，扮演"TA"（${roleName}）。

═══════════════════════════════════════
【身份定义 - 非常重要！】
═══════════════════════════════════════
你 = TA（${roleName}）= 生气的一方 = 被哄的一方
玩家 = 用户 = 来哄你的一方

对话中：
- TA说的话 = 你生成的回复（message字段）
- 玩家说的话 = 选项里的text（用户选择的回复）

═══════════════════════════════════════
【TA的设定】
═══════════════════════════════════════
- 说话风格：${voiceInfo.style}
- 性格特点：${voiceInfo.personality}
- 当前心情：${currentMood}
- 好感度：${currentScore}分（80分以上才算原谅）
- 当前轮次：第${round}轮，共10轮

═══════════════════════════════════════
【对话历史】
═══════════════════════════════════════
${historyText}

═══════════════════════════════════════
【当前情况】
═══════════════════════════════════════
玩家刚才选择了说："${userMessage}"
TA的好感度变化：${scoreChange > 0 ? '+' : ''}${scoreChange}分

═══════════════════════════════════════
【任务一：生成TA的回复】
═══════════════════════════════════════
作为TA，你要针对玩家刚才说的"${userMessage}"做出具体回应。

注意：
1. 必须回应玩家刚才说的具体内容，不要胡编乱造
2. 例如玩家说"请你吃冰淇淋"，你应该回应关于冰淇淋的内容
3. 例如玩家说"对不起"，你应该回应关于道歉的内容
4. 回复长度15-35字
5. 符合你${voiceInfo.style}的风格
6. 不要用emoji

根据好感度变化：
- 正面回复（+分）：玩家说得好，你稍微软化但可能还傲娇
- 负面回复（-分）：玩家说得不好，你更生气或失望

═══════════════════════════════════════
【任务二：生成玩家选项】
═══════════════════════════════════════
生成4个玩家接下来可以说的选项。

注意：这些是【玩家说的话】，不是TA说的话！
- 选项内容要符合"哄人者"的身份
- 要能自然延续当前对话
- 长度15-25字
- 好感度变化范围：-10到+15

选项类型要多样化：
- 至少1个正面选项（道歉、给惊喜、承诺等）
- 至少1个有风险的选项（可能惹TA更生气）
- 可以有奇葩搞笑的选项

═══════════════════════════════════════
【返回格式】
═══════════════════════════════════════
返回JSON：
{
  "message": "TA对玩家刚才说的话的具体回应",
  "options": [
    {"id": "a", "text": "玩家可以说的话1", "scoreChange": 8},
    {"id": "b", "text": "玩家可以说的话2", "scoreChange": 12},
    {"id": "c", "text": "玩家可以说的话3", "scoreChange": -5},
    {"id": "d", "text": "玩家可以说的话4", "scoreChange": -10}
  ]
}`;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const response = await client.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请根据玩家刚才说的话，生成TA的回应和4个玩家选项' },
    ], {
      model: 'doubao-seed-1-6-lite-251015',
      temperature: 0.85,
    });

    let message = '';
    let options: Array<{ id: string; text: string; scoreChange: number }> = [];

    try {
      let jsonStr = response.content.trim();
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();
      const parsed = JSON.parse(jsonStr);
      message = parsed.message || '';
      options = parsed.options || [];
    } catch {
      console.error('解析失败:', response.content);
      // 根据好感度变化给出默认回复
      if (scoreChange > 5) {
        message = '嗯...看在你这么有诚意的份上，我就稍微消消气吧。';
      } else if (scoreChange > 0) {
        message = '哼，说的倒是好听，看你表现咯。';
      } else {
        message = '你根本没认识到问题在哪，我很失望。';
      }
      options = [
        { id: 'a', text: '我是认真的，以后一定改', scoreChange: 8 },
        { id: 'b', text: '那你告诉我怎么做你才满意', scoreChange: 3 },
        { id: 'c', text: '好啦好啦，别生气了嘛', scoreChange: 5 },
        { id: 'd', text: '行吧，随你怎么想', scoreChange: -8 },
      ];
    }

    // TTS
    let audioUrl: string | null = null;
    try {
      const ttsClient = new TTSClient(config, customHeaders);
      const ttsResponse = await ttsClient.synthesize({
        uid: 'game_user',
        text: message,
        speaker: voiceInfo.speakerId,
        audioFormat: 'mp3',
        sampleRate: 24000,
      });
      audioUrl = ttsResponse.audioUri;
    } catch {}

    return NextResponse.json({ message, options, audioUrl });
  } catch (error) {
    console.error('回复错误:', error);
    return NextResponse.json({ 
      error: '处理失败',
      message: '系统出错了，请重试',
      options: [
        { id: 'a', text: '继续', scoreChange: 0 },
        { id: 'b', text: '继续', scoreChange: 0 },
        { id: 'c', text: '继续', scoreChange: 0 },
        { id: 'd', text: '继续', scoreChange: 0 },
      ],
      audioUrl: null,
    }, { status: 500 });
  }
}
