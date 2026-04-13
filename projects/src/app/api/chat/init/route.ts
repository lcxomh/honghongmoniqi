import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 场景描述映射
const sceneDescriptions: Record<string, string> = {
  forgot_anniversary: '忘记了重要的纪念日',
  forgot_birthday: '忘记了TA的生日',
  forgot_promise: '忘记了之前答应过的事情',
  said_wrong: '说错话让TA生气了',
  did_wrong: '做错事让TA生气了',
  jealousy: 'TA吃醋了',
  neglect: '忽略了TA，没顾及TA的感受',
  money_issue: '因为钱的问题吵架了',
  disobeyed: '不听TA的话，让TA生气了',
  study_issue: '因为学习的问题让TA生气了',
  forgot_appointment: '忘记了和TA的约定',
  borrowed_money: '借钱问题闹矛盾了',
  work_mistake: '工作失误惹TA生气了',
  late_absent: '迟到早退被抓到了',
  forgot_task: '忘记交代的任务了',
  missed_deadline: '错过了重要的截止日期',
  attitude_issue: '态度有问题惹TA生气了',
};

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

// 生气阶段描述
const angerStageDescriptions: Record<string, { mood: string; reaction: string }> = {
  just_angry: {
    mood: '正在气头上，很生气',
    reaction: '会直接表达不满，语气激动',
  },
  cold_war: {
    mood: '冷暴力中',
    reaction: '回复简短冷淡，爱理不理',
  },
  blocked: {
    mood: '已经拉黑你了',
    reaction: '非常决绝，最后给一次机会',
  },
  want_breakup: {
    mood: '提出分手',
    reaction: '态度坚决，对感情很失望',
  },
  post_breakup: {
    mood: '已经分手了',
    reaction: '心灰意冷，很难再接受',
  },
  separated: {
    mood: '搬出去住了',
    reaction: '疲惫无奈，需要空间',
  },
  want_divorce: {
    mood: '提出离婚',
    reaction: '决心已定，很难改变',
  },
  ran_away: {
    mood: '离家出走了',
    reaction: '委屈生气，需要被找回',
  },
  lock_door: {
    mood: '把自己锁房间里',
    reaction: '生闷气，拒绝交流',
  },
  want_cut_ties: {
    mood: '想要绝交',
    reaction: '彻底决裂，非常失望',
  },
  complaint: {
    mood: '要投诉你',
    reaction: '非常愤怒，需要安抚',
  },
  resignation: {
    mood: '要辞职',
    reaction: '对你很失望，去意已决',
  },
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

export async function POST(request: NextRequest) {
  try {
    const { role, scenes, angerStage, initialScore, voice } = await request.json();

    const sceneArray = Array.isArray(scenes) ? scenes : [scenes];
    const sceneTexts = sceneArray.map((s: string) => sceneDescriptions[s] || s);
    const angerInfo = angerStageDescriptions[angerStage] || angerStageDescriptions.just_angry;
    const voiceInfo = voiceStyleMap[voice] || voiceStyleMap.cute_girl;
    const roleName = roleNames[role] || '对方';

    const systemPrompt = `你是哄人模拟游戏中的角色，扮演"TA"（${roleName}）。

═══════════════════════════════════════
【身份定义 - 非常重要！】
═══════════════════════════════════════
你 = TA（${roleName}）= 生气的一方 = 被哄的一方
玩家 = 用户 = 来哄你的一方

对话中：
- TA说的话 = 你生成的开场白（message字段）
- 玩家说的话 = 选项里的text（用户选择的回复）

═══════════════════════════════════════
【基本情况】
═══════════════════════════════════════
- 你因为"${sceneTexts.join('、')}"这件事而生气
- 当前状态：${angerInfo.mood}
- 反应特点：${angerInfo.reaction}
- 说话风格：${voiceInfo.style}
- 性格特点：${voiceInfo.personality}

═══════════════════════════════════════
【好感度说明】
═══════════════════════════════════════
- 初始好感度：${initialScore}分（满分100）
- 80分以上才算真正原谅
- 根据玩家说的话决定好感度变化

═══════════════════════════════════════
【任务一：生成TA的开场白】
═══════════════════════════════════════
作为TA，直接说出你为什么生气，表达你的不满。
- 长度15-30字
- 符合你${voiceInfo.style}的风格
- 不要用emoji（会被语音读出来）
- 要让玩家感受到你是真的在生气

═══════════════════════════════════════
【任务二：生成玩家选项】
═══════════════════════════════════════
生成4个玩家可以选择的回复选项。

注意：这些是【玩家说的话】，不是TA说的话！
- 选项内容要符合"哄人者"的身份
- 好的哄人方式（道歉、承诺、撒娇、给惊喜）加分
- 不好的方式（敷衍、借口、反击）减分
- 长度15-25字
- 好感度变化范围：-10到+15

选项类型要多样化：
- 至少1个正面选项（道歉、承诺等）
- 至少1个有风险的选项（可能惹TA更生气）
- 可以有奇葩搞笑的选项

═══════════════════════════════════════
【返回格式】
═══════════════════════════════════════
返回JSON：
{
  "message": "TA的开场白，表达为什么生气",
  "options": [
    {"id": "a", "text": "玩家可以说的话1", "scoreChange": 10},
    {"id": "b", "text": "玩家可以说的话2", "scoreChange": 8},
    {"id": "c", "text": "玩家可以说的话3", "scoreChange": 5},
    {"id": "d", "text": "玩家可以说的话4", "scoreChange": -10}
  ]
}`;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    const response = await llmClient.invoke([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请生成开场白和4个回复选项' },
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
      message = `你居然${sceneTexts[0]}！我真的很生气！`;
      options = [
        { id: 'a', text: '对不起，我错了，以后一定注意', scoreChange: 10 },
        { id: 'b', text: '别生气了好不好，我给你买好吃的', scoreChange: 8 },
        { id: 'c', text: '我知道错了，你罚我吧', scoreChange: 5 },
        { id: 'd', text: '这有什么好生气的', scoreChange: -10 },
      ];
    }

    // TTS 生成语音
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
    } catch (ttsError) {
      console.error('TTS失败:', ttsError);
    }

    return NextResponse.json({ message, options, audioUrl });
  } catch (error) {
    console.error('初始化错误:', error);
    return NextResponse.json({ 
      error: '初始化失败',
      message: '系统出错了，请重试',
      options: [
        { id: 'a', text: '重新开始', scoreChange: 0 },
        { id: 'b', text: '重新开始', scoreChange: 0 },
        { id: 'c', text: '重新开始', scoreChange: 0 },
        { id: 'd', text: '重新开始', scoreChange: 0 },
      ],
      audioUrl: null,
    }, { status: 500 });
  }
}
