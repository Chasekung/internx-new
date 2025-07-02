import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import ClientLayout from '@/components/ClientLayout'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Step Up - Connect with Tech Talent',
  description: 'Connect with the best tech talent for your company',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        url: '/stepup-logo.png',
        type: 'image/png',
        sizes: '593x620',
      }
    ],
    shortcut: '/favicon.ico',
    apple: {
      url: '/stepup-logo.png',
      type: 'image/png',
      sizes: '593x620',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col bg-transparent relative`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}




