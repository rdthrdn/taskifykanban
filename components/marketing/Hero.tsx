'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

function KanbanPreview({ delay = 0, rotate = -4 }: { delay?: number; rotate?: number }) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0, rotate }}
      animate={{ y: 0, opacity: 1, rotate }}
      transition={{ duration: 0.8, delay }}
      className="relative h-[440px] w-[320px] rounded-3xl bg-black/60 border border-white/10 shadow-2xl overflow-hidden backdrop-blur"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/10/20 to-transparent pointer-events-none" />
      <div className="p-4">
        <div className="flex gap-3 h-full">
          {["Backlog","Doing","Done"].map((title, idx) => (
            <div key={title} className="flex-1 rounded-xl bg-card/40 border border-white/10 p-3">
              <p className="text-xs text-white/70 mb-2">{title}</p>
              <div className="space-y-2">
                <div className="rounded-lg bg-primary/20 border border-primary/30 px-3 py-2 text-white/90 text-xs">Design landing page</div>
                <div className="rounded-lg bg-accent/20 border border-accent/30 px-3 py-2 text-white/90 text-xs">Set up Supabase</div>
                {idx > 0 && (
                  <div className="rounded-lg bg-muted/20 border border-muted/30 px-3 py-2 text-white/90 text-xs">Drag & Drop</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function Hero() {
  const router = useRouter()
  return (
    <section className="relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 gradient-hero" />
      <div className="container mx-auto px-6 pt-44 pb-20 relative">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <motion.h1
              className="mt-6 text-4xl sm:text-5xl lg:text-[4.5rem] font-extrabold tracking-tight leading-tight text-transparent bg-clip-text drop-shadow-[0_0_25px_rgba(237,158,89,0.45)]"
              initial={{ backgroundPosition: '0% 50%' }}
              animate={{ backgroundPosition: '100% 50%' }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{
                backgroundImage:
                  'linear-gradient(120deg, rgba(237,158,89,1) 0%, rgba(163,64,84,1) 45%, rgba(102,34,73,1) 80%)',
              }}
            >
              Papan tugas yang
              <span className="block"> bekerja secepat kamu berpikir</span>
            </motion.h1>
            <motion.p
              className="mt-6 text-muted-foreground text-lg max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Tunjukkan kemampuan UI/UX dan engineering Anda dengan board Kanban realtime, drag-and-drop halus, dan kolaborasi modern.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Button
                size="lg"
                className="hover-lift border-0 text-white bg-gradient-to-r from-primary via-accent to-secondary shadow-lg"
                onClick={() => router.push('/boards')}
              >
                Coba Sekarang
              </Button>
              <Button size="lg" variant="outline" className="hover-lift" onClick={() => router.push('/login')}>
                Login
              </Button>
            </motion.div>
          </motion.div>
          <div className="relative hidden lg:flex items-end justify-center gap-6">
            <KanbanPreview rotate={-8} />
            <motion.div animate={{ y: [0,-6,0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}>
              <KanbanPreview delay={0.15} rotate={-2} />
            </motion.div>
            <KanbanPreview rotate={4} />
          </div>
        </div>
      </div>
    </section>
  )
}


