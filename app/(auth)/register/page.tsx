'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabase } from '@/providers/supabase-provider'
import { toast } from '@/lib/utils'
import { Navbar } from '@/components/marketing/Navbar'
import { RouteTransition } from '@/components/RouteTransition'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { name: data.name || '' } },
      })
      if (error) throw error
      toast.success('Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi.')
      router.push('/login')
    } catch (e: any) {
      toast.error(e.message || 'Gagal register')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <div className="absolute inset-0 gradient-hero" />
      <RouteTransition>
      <div className="container mx-auto px-6 pt-36 pb-10 relative">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="hidden lg:block rounded-3xl border bg-card/40 backdrop-blur p-10">
            <h2 className="text-3xl font-bold mb-3">Buat akun baru</h2>
            <p className="text-muted-foreground mb-8">Mulai kelola boards, kolom, dan cards secara realtime. Undang tim Anda dan berkolaborasi.</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>• Drag-and-drop cepat & halus</li>
              <li>• Realtime sync antar tab</li>
              <li>• Desain yang fokus pada aksesibilitas</li>
            </ul>
          </div>
          <Card className="rounded-3xl border bg-card/60 backdrop-blur shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Register</CardTitle>
              <CardDescription>Masukkan data Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nama (opsional)</label>
                  <Input id="name" type="text" placeholder="John Doe" {...register('name')} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input id="email" type="email" placeholder="nama@example.com" {...register('email')} disabled={isLoading} />
                  {errors.email && (<p className="text-sm text-destructive">{errors.email.message}</p>)}
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Input id="password" type="password" placeholder="••••••" {...register('password')} disabled={isLoading} />
                  {errors.password && (<p className="text-sm text-destructive">{errors.password.message}</p>)}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Mendaftar...' : 'Register'}</Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => router.push('/login')} disabled={isLoading}>Sudah punya akun? Login</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      </RouteTransition>
    </div>
  )
}


