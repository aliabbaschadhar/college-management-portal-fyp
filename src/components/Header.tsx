'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { GraduationCap, Menu, X } from 'lucide-react'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/[0.07] bg-[#080C14]/80 backdrop-blur-xl shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #3D5EE1, #6FCCD8)' }}
            >
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-black tracking-tight text-white hidden sm:inline-block">
              College Portal
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              Home
            </Link>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                Dashboard
              </Link>
            </SignedIn>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            <SignedOut>
              <Link href="/sign-in">
                <button className="px-4 py-2 rounded-lg border border-white/15 bg-white/5 text-sm font-semibold text-white/70 backdrop-blur-sm hover:bg-white/10 hover:text-white transition-all">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #3D5EE1, #6FCCD8)' }}
                >
                  Sign Up
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'h-9 w-9',
                    userButtonPopoverCard: 'shadow-2xl',
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.07] py-4 space-y-1">
            <Link
              href="/"
              className="block rounded-lg px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <SignedIn>
              <Link
                href="/dashboard"
                className="block rounded-lg px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </SignedIn>

            <div className="pt-3 border-t border-white/[0.07] mt-3 flex flex-col gap-2 px-1">
              <SignedOut>
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full rounded-lg border border-white/15 bg-white/5 py-3 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all">
                    Sign In
                  </button>
                </Link>
                <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    className="w-full rounded-lg py-3 text-sm font-bold text-white transition-all hover:brightness-110"
                    style={{ background: 'linear-gradient(135deg, #3D5EE1, #6FCCD8)' }}
                  >
                    Sign Up
                  </button>
                </Link>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-3 py-2 px-3">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-sm text-white/50">My Account</span>
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header