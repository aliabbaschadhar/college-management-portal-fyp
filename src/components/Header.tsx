'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { GraduationCap, Menu, X, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Admissions', href: '/admissions' },
    { label: 'Courses', href: '/courses' },
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/8 bg-[#080C14]/70 backdrop-blur-xl shadow-2xl shadow-black/40 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px] origin-left z-50"
        style={{ 
          scaleX,
          background: 'linear-gradient(90deg, var(--color-brand-primary), var(--color-brand-secondary), var(--color-brand-primary))'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group relative">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-10 group-hover:scale-110 shadow-lg shadow-blue-500/20"
              style={{ background: 'linear-gradient(135deg, #3D5EE1, #6FCCD8)' }}
            >
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tighter text-white uppercase leading-none">
                College
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-brand-secondary uppercase leading-none mt-1">
                Portal
              </span>
            </div>
            
            {/* Logo Glow */}
            <div className="absolute -inset-2 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative px-4 py-2 text-sm font-semibold text-white/50 hover:text-white transition-colors group/nav"
              >
                {link.label}
                <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-linear-to-r from-brand-primary to-brand-secondary origin-left scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300" />
              </Link>
            ))}
            <SignedIn>
              <Link
                href="/dashboard"
                className="relative px-4 py-2 text-sm font-semibold text-white/50 hover:text-white transition-colors group/nav"
              >
                Dashboard
                <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-linear-to-r from-brand-primary to-brand-secondary origin-left scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300" />
              </Link>
            </SignedIn>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            <SignedOut>
              <Link href="/sign-in">
                <button className="px-5 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 hover:shadow-[0_0_20px_rgba(61,94,225,0.4)] active:scale-95"
                  style={{ background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))' }}
                >
                  Join Now
                </button>
              </Link>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'h-9 w-9 ring-2 ring-white/10 ring-offset-2 ring-offset-[#080C14] transition-all hover:ring-brand-primary',
                      userButtonPopoverCard: 'shadow-2xl border border-white/10 bg-[#080C14]/90 backdrop-blur-xl',
                    },
                  }}
                />
              </div>
            </SignedIn>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`md:hidden p-2.5 rounded-xl transition-all ${
              mobileMenuOpen 
                ? 'bg-brand-primary text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden border-t border-white/5 mt-4"
            >
              <div className="py-6 space-y-2">
                {[...navLinks, { label: 'Dashboard', href: '/dashboard', auth: true }].map((link: { label: string; href: string; auth?: boolean }, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {!link.auth ? (
                      <Link
                        href={link.href}
                        className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all group"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ) : (
                      <SignedIn>
                        <Link
                          href={link.href}
                          className="flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all group"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </SignedIn>
                    )}
                  </motion.div>
                ))}

                <div className="pt-6 border-t border-white/5 mt-6 grid grid-cols-2 gap-3">
                  <SignedOut>
                    <Link href="/sign-in" className="col-span-1" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold text-white/70 hover:bg-white/10">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/sign-up" className="col-span-1" onClick={() => setMobileMenuOpen(false)}>
                      <button
                        className="w-full rounded-xl py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/20"
                        style={{ background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))' }}
                      >
                        Join
                      </button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <div className="col-span-2 flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <UserButton afterSignOutUrl="/" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">Account Settings</span>
                        <span className="text-xs text-white/40">Manage your profile</span>
                      </div>
                    </div>
                  </SignedIn>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

export default Header