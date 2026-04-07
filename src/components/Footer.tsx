'use client'

import Link from 'next/link'
import { GraduationCap, Facebook, Twitter, Instagram, Github, Mail, MapPin, Phone } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <footer className="relative border-t border-white/[0.06] bg-[#080C14] pt-20 pb-10 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-96 opacity-20 pointer-events-none">
        <div className="absolute left-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-[#3D5EE1] blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[400px] w-[400px] rounded-full bg-[#6FCCD8] blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-6">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #3D5EE1, #6FCCD8)' }}
              >
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                College Portal
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-8">
              Empowering students and faculty with a modern, integrated management experience. Built for excellence at Govt. Graduate College, Hafizabad.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Github, href: '#' },
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="h-10 w-10 rounded-lg border border-white/[0.08] bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all active:scale-95"
                >
                  <social.icon className="h-5 w-5" />
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
                      <span className="w-0 group-hover/link:w-2 h-[1px] bg-[#6FCCD8] mr-0 group-hover/link:mr-2 transition-all duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-y border-white/[0.05] mb-10">
          <div className="flex items-center gap-4 text-white/50">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-[#3D5EE1]">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-white/70">Our Location</p>
              <p className="text-white/40">Sargodha Road, Hafizabad</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/50">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-[#6FCCD8]">
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
