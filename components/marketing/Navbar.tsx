'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <header className="absolute top-4 left-0 right-0 z-40">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between rounded-full bg-gradient-to-r from-white/15 via-white/10 to-white/5 backdrop-blur-xl shadow-lg/60 px-2 py-1"
        >
          {/* Left: Logo inside the pill */}
          <button
            className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-white/10 transition-colors"
            onClick={() => {
              if (pathname !== '/') router.push('/')
              else window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            aria-label="Taskify Kanban"
          >
            <div className="h-8 w-8 rounded-md text-primary-foreground grid place-items-center font-bold bg-gradient-to-br from-primary via-accent to-secondary shadow-lg/40">T</div>
            <span className="hidden sm:block font-semibold">Taskify</span>
          </button>

          {/* Center: navigation items matching landing sections */}
          <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            {['Home','Login','Register'].map((item) => {
              const isActive =
                (item === 'Home' && pathname === '/') ||
                (item === 'Login' && pathname === '/login') ||
                (item === 'Register' && pathname === '/register')
              return (
              <button
                key={item}
                className={`px-4 py-2 rounded-full hover:text-foreground hover:bg-white/10 transition-colors ${isActive ? 'bg-white/10 text-foreground' : ''}`}
                onClick={() => {
                  if (item==='Home') {
                    if (pathname !== '/') router.push('/')
                    else window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                  if (item==='Login') router.push('/login')
                  if (item==='Register') router.push('/register')
                }}
              >
                {item}
              </button>
            )})}
          </nav>
        </motion.div>
      </div>
    </header>
  )
}


