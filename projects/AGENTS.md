# 哄哄模拟器

## 项目概览

一个互动式哄人模拟游戏，用户通过选择回复选项来哄好对方。游戏采用微信风格聊天界面，通过10轮对话挑战，选择回复选项提升好感度。集成 LLM 动态生成对话和选项，支持 TTS 语音播放。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **前端**: React 19
- **语言**: TypeScript 5
- **UI组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS 4
- **AI能力**: coze-coding-dev-sdk (LLM + TTS)

## 目录结构

```
src/
├── app/
│   ├── page.tsx              # 游戏选择页面（关系、角色、场景、生气阶段、声音）
│   ├── game/
│   │   └── page.tsx          # 游戏主界面（聊天、选项、好感度）
│   ├── api/
│   │   └── chat/
│   │       ├── init/route.ts # 初始化游戏API（生成开场白和选项）
│   │       └── reply/route.ts # 回复API（生成回复和新选项）
│   ├── layout.tsx            # 全局布局
│   └── globals.css           # 全局样式
├── components/
│   └── ui/                   # shadcn/ui 组件库
└── lib/
    └── utils.ts              # 工具函数
```

## 游戏功能

### 选择流程（5步）

1. **关系类型**
   - 情侣：男朋友、女朋友
   - 夫妻：老公、老婆
   - 家庭：爸爸、妈妈、哥哥、姐姐、弟弟、妹妹、儿子、女儿
   - 朋友：闺蜜、兄弟、女性朋友、男性朋友
   - 职场：男领导、女领导、男同事、女同事、男下属、女下属

2. **场景选择**（根据关系类型动态显示）
   - 情侣/夫妻：忘记纪念日、忘记生日、忘记承诺、说错话、做错事、吃醋了、忽略了TA、其他原因
   - 家庭：忘记生日、忘记承诺、说错话、做错事、不听话、忽略了TA、学习问题、其他原因
   - 朋友：忘记约定、说错话、做错事、忘记承诺、忽略了TA、借钱问题、其他原因
   - 职场：工作失误、迟到早退、忘记任务、说错话、做错事、错过截止日期、态度问题、其他原因
   - "其他原因"支持用户自定义输入

3. **生气阶段**（根据关系类型动态显示）
   - 情侣：刚生气、冷战中、被拉黑、提分手、分手挽回
   - 夫妻：刚生气、冷战中、分居中、提离婚
   - 家庭：刚生气、冷战不理、离家出走、锁门不出
   - 朋友：刚生气、冷战不理、被拉黑、想绝交
   - 职场：刚生气、冷战不理、要投诉、要辞职

4. **声音选择**（根据角色性别动态显示）
   - 女声：可爱软妹、霸道御姐、温柔姐姐、元气少女、知性姐姐、傲娇大小姐
   - 男声：温柔男声、低沉男声、霸道总裁、阳光少年、清冷男神、傲娇少爷
   - 童声：可爱萝莉、调皮正太、乖乖女、小少爷

### 游戏机制

- **好感度系统**：初始分数根据生气阶段设定（-30~20）
  - 刚生气：20分
  - 冷战中：5分
  - 被拉黑：-10分
  - 提分手：-20分
  - 分手挽回：-30分
  - 等等...

- **胜负判定**
  - 成功：好感度达到80分
  - 失败：好感度低于-50分 或 10轮结束未达到80分

- **选项系统**
  - 每轮4个选项，有搞笑奇葩选项
  - 分值变化：-15到+15
  - 根据生气阶段和好感度调整选项

### 视觉效果

- 微信风格聊天界面
- 好感度进度条（颜色随分数变化）
- 好感度变化动画（+X/-X浮动显示）
- 成功撒花动画、失败心碎动画
- TTS语音播放按钮

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式（端口5000，支持热更新）
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务
pnpm start

# 类型检查
npx tsc --noEmit
```

## API接口

### POST /api/chat/init

初始化游戏，生成开场白和选项。

**请求体**：
```json
{
  "relationship": "couple",
  "role": "girlfriend",
  "scenes": ["forgot_anniversary"],
  "angerStage": "just_angry",
  "speakerId": "saturn_zh_female_keainvsheng_tob",
  "initialScore": 20
}
```

**响应**：
```json
{
  "message": "开场白内容",
  "options": [
    {"id": "a", "text": "选项文本", "scoreChange": 8}
  ],
  "audioUrl": "data:audio/mp3;base64,..."
}
```

### POST /api/chat/reply

处理用户回复，生成新的对话和选项。

**请求体**：
```json
{
  "relationship": "couple",
  "role": "girlfriend",
  "scenes": ["forgot_anniversary"],
  "angerStage": "just_angry",
  "speakerId": "saturn_zh_female_keainvsheng_tob",
  "userMessage": "用户选择的选项",
  "scoreChange": 8,
  "currentScore": 28,
  "round": 2,
  "history": [{"role": "user", "content": "..."}]
}
```

**响应**：
```json
{
  "message": "回复内容",
  "options": [...],
  "audioUrl": "...",
  "gameEnded": "success" | "failure" | null,
  "endingMessage": "结局台词",
  "endingAudio": "..."
}
```

## 环境变量

项目使用 `coze-coding-dev-sdk` 包，API 配置由 SDK 自动管理，无需手动设置环境变量。

## 编码规范

- 仅使用 **pnpm** 作为包管理器
- 使用 **shadcn/ui** 组件库
- 遵循 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 样式使用 Tailwind CSS 类名

## 注意事项

1. **好感动画**：选择选项后会显示好感度变化动画（+X/-X）
2. **语音播放**：每条对方消息都可以点击播放语音
3. **游戏结束**：成功或失败时显示弹窗，可重新开始或分享
4. **自定义场景**：选择"其他原因"时会显示输入框，用户可输入自定义内容
