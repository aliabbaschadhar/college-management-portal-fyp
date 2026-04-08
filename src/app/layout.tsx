import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Roboto } from 'next/font/google'
import { ThemeProvider } from '@/lib/theme-provider'
import './globals.css'

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-roboto',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'College Management Portal',
  description:
    'A centralized web-based platform to streamline administrative and academic tasks for students, faculty, and administrators.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: 'var(--color-brand-primary)',
          colorTextOnPrimaryBackground: 'var(--color-brand-white)',
          colorBackground: 'var(--color-brand-white)',
          colorText: 'var(--color-brand-dark)',
          colorInputBackground: 'var(--color-brand-white)',
          colorInputText: 'var(--color-brand-dark)',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${roboto.variable} font-sans antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}