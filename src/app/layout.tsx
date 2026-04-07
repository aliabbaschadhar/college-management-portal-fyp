import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Roboto } from 'next/font/google'
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
          colorPrimary: '#3D5EE1',
          colorTextOnPrimaryBackground: '#FFFFFF',
          colorBackground: '#FFFFFF',
          colorText: '#131022',
          colorInputBackground: '#FFFFFF',
          colorInputText: '#131022',
        },
      }}
    >
      <html lang="en">
        <body
          className={`${roboto.variable} font-sans antialiased bg-brand-light text-brand-dark`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}