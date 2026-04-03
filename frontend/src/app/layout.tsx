import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mini Arcade Royale - Premium Digital Arcade Games',
  description: 'Compete in arcade games, earn credits, and dominate the leaderboard',
  openGraph: {
    title: 'Mini Arcade Royale',
    description: 'Premium digital arcade entertainment platform',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-arcade-dark text-white font-sans antialiased">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
