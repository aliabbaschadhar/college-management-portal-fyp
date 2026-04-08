'use client'

import Link from 'next/link'
import { GraduationCap, Mail, MapPin, Phone, ArrowRight, Heart } from 'lucide-react'


const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: 'College',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Administration', href: '/admin-info' },
        { label: 'Campus Life', href: '/campus' },
        { label: 'News & Events', href: '/news' },
      ],
    },
    {
      title: 'Academic',
      links: [
        { label: 'Departments', href: '/departments' },
        { label: 'Courses', href: '/courses' },
        { label: 'Admission Info', href: '/admissions' },
        { label: 'Academic Calendar', href: '/calendar' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Student Portal', href: '/dashboard' },
        { label: 'Library', href: '/library' },
        { label: 'Downloads', href: '/downloads' },
        { label: 'FAQs', href: '/faqs' },
      ],
    },
    {
      title: 'Help',
      links: [
        { label: 'Support Center', href: '/support' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Feedback', href: '/feedback' },
        { label: 'Privacy Policy', href: '/privacy' },
      ],
    },
  ]

  return (
    <footer className="relative border-t border-white/6 bg-[#080C14] pt-20 pb-10 overflow-hidden">
      {/* Background Dot Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.2]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Background Glows */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-96 opacity-20 pointer-events-none">
        <div className="absolute left-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-brand-primary blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[400px] w-[400px] rounded-full bg-brand-secondary blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-6 relative">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-[5deg] group-hover:scale-110 shadow-lg shadow-blue-500/20"
                style={{ background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))' }}
              >
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                College Portal
              </span>
              {/* Glow */}
              <div className="absolute -inset-2 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-8">
              Empowering students and faculty with a modern, integrated management experience. Built for excellence at Govt. Graduate College, Hafizabad.
            </p>
            <div className="flex items-center gap-4">
              {[
                { label: 'Facebook', path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', href: '#' },
                { label: 'Twitter', path: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z', href: '#' },
                { label: 'Instagram', path: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z', href: '#' },
                { label: 'GitHub', path: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22', href: '#' },
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  className="h-10 w-10 rounded-lg border border-white/8 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={social.path} />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 hover:text-white transition-colors flex items-center group/link"
                    >
                      <span className="w-0 group-hover/link:w-2 h-px bg-brand-secondary mr-0 group-hover/link:mr-2 transition-all duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-y border-white/5 mb-10">
          <div className="flex items-center gap-4 text-white/50">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-brand-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-white/70">Our Location</p>
              <p className="text-white/40">Sargodha Road, Hafizabad</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/50">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-brand-secondary">
              <Phone className="h-5 w-5" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-white/70">Phone Number</p>
              <p className="text-white/40">+92 (000) 000-0000</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/50">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-[#A78BFA]">
              <Mail className="h-5 w-5" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-white/70">Email Address</p>
              <p className="text-white/40">info@ggchafizabad.edu.pk</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-medium text-white/30">
          <p>© {currentYear} Govt. Graduate College, Hafizabad. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="hover:text-white/60 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
