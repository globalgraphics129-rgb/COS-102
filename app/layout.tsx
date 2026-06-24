import type { Metadata } from 'next'
import { Poppins, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import PortalTimer from './components/PortalTimer'
import ThemeToggle from './components/ThemeToggle'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-code',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: 'AcademiHub - Academic Project Management',
  description: 'Streamline project submissions, manage departments, and track academic projects in one place.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${jetbrainsMono.variable}`}>
      <body>
        <div className="grid-bg" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <PortalTimer />
        {children}
        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '24px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Created by Glory Adeniran (CLASS REP IFT 2025/2026) &middot; Built with AcademiHub
          </p>
        </footer>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontFamily: "var(--font-sans, 'Poppins'), sans-serif",
              fontSize: '13px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: 'var(--surface)' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: 'var(--surface)' },
            },
          }}
        />
      </body>
    </html>
  )
}
