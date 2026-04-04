import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Mini Arcade Royale — Premium Digital Arcade Games',
    template: '%s | Mini Arcade Royale',
  },
  description: 'Play premium arcade games, earn virtual credits, and dominate the leaderboard. Entertainment platform with virtual currency only.',
  keywords: ['arcade games', 'digital entertainment', 'virtual credits', 'online arcade'],
  openGraph: {
    title: 'Mini Arcade Royale',
    description: 'Premium digital arcade entertainment platform',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mini Arcade Royale',
    description: 'Premium digital arcade entertainment platform',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#00C2FF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-arcade-dark text-arcade-text font-sans antialiased">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
