import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '哄哄模拟器 | 学会哄人的小游戏',
    template: '%s | 哄哄模拟器',
  },
  description:
    '一个有趣的互动式哄人模拟游戏，通过选择不同的回复选项来哄好TA，学习有效的沟通技巧。',
  keywords: [
    '哄人',
    '恋爱',
    '模拟游戏',
    '情侣',
    '互动游戏',
    '恋爱模拟',
    '沟通技巧',
  ],
  authors: [{ name: 'Coze Code', url: 'https://code.coze.cn' }],
  generator: 'Coze Code',
  openGraph: {
    title: '哄哄模拟器 | 学会哄人的小游戏',
    description:
      '一个有趣的互动式哄人模拟游戏，看看你能不能把TA哄好！',
    url: 'https://code.coze.cn',
    siteName: '哄哄模拟器',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
