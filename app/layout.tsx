import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '即梦音频智能裁切',
  description: '数字人音频智能分段工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
