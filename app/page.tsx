import { Navbar } from '@/components/marketing/Navbar'
import { Hero } from '@/components/marketing/Hero'
import { RouteTransition } from '@/components/RouteTransition'

export default function Home() {
  return (
    <main>
      <Navbar />
      <RouteTransition>
        <Hero />
      </RouteTransition>
    </main>
  )
}

