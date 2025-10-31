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

const authSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().optional(),
})

type AuthForm = z.infer<typeof authSchema>

export default function LoginPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = React.useState(false)
  const [mode, setMode] = React.useState<'login' | 'register'>('login')
  const [needsVerification, setNeedsVerification] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [otpCode, setOtpCode] = React.useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
  })

  const onSubmit = async (data: AuthForm) => {
    setIsLoading(true)
    try {
      if (mode === 'register') {
        // Register: Sign up dengan email + password
        const { error, data: authData } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name || '',
            },
            emailRedirectTo: `${window.location.origin}/boards`,
          },
        })

        if (error) throw error

        // Check apakah perlu verifikasi email
        if (authData.user && !authData.user.email_confirmed_at) {
          setEmail(data.email)
          setNeedsVerification(true)
          toast.success('Akun berhasil dibuat! Masukkan kode OTP dari email Anda.')
        } else {
          toast.success('Akun berhasil dibuat! Silakan login.')
          setMode('login')
          reset()
        }
      } else {
        // Login: Sign in dengan email + password
        const { error, data: authData } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })

        if (error) throw error

        // Check apakah email sudah verified
        if (authData.user && !authData.user.email_confirmed_at) {
          setEmail(data.email)
          setNeedsVerification(true)
          toast.info('Email belum terverifikasi. Cek email untuk kode OTP.')
        } else {
          toast.success('Login berhasil!')
          router.push('/boards')
          router.refresh()
        }
      }
    } catch (error: any) {
      toast.error(error.message || `Gagal ${mode === 'login' ? 'login' : 'register'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const onVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode.trim()) {
      toast.error('Masukkan kode OTP')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      })

      if (error) throw error

      toast.success('Email berhasil diverifikasi! Login berhasil.')
      router.push('/boards')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Kode OTP tidak valid')
    } finally {
      setIsLoading(false)
    }
  }

  const onResendOTP = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) throw error
      toast.success('Kode OTP baru telah dikirim!')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim ulang OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setNeedsVerification(false)
    reset()
  }

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <div className="absolute inset-0 gradient-hero" />
      <RouteTransition>
      <div className="container mx-auto px-6 pt-36 pb-10 relative">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Left panel */}
          <div className="hidden lg:block rounded-3xl border bg-card/40 backdrop-blur p-10">
            <h2 className="text-3xl font-bold mb-3">Selamat datang kembali</h2>
            <p className="text-muted-foreground mb-8">Masuk untuk mengelola board Kanban Anda dengan realtime drag-and-drop, comments, dan kolaborasi.</p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>• Realtime sync dengan Supabase</li>
              <li>• Optimistic UI, aman & cepat</li>
              <li>• Desain modern dan fokus pada UX</li>
            </ul>
          </div>
          {/* Right form */}
          <Card className="rounded-3xl border bg-card/60 backdrop-blur shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">{mode === 'login' ? 'Login' : 'Register'}</CardTitle>
              <CardDescription>
                {needsVerification ? 'Masukkan kode OTP 6 digit dari email Anda' : mode === 'login' ? 'Login ke akun Anda' : 'Buat akun baru'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!needsVerification ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {mode === 'register' && (
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Nama (opsional)</label>
                      <Input id="name" type="text" placeholder="John Doe" {...register('name')} disabled={isLoading} />
                    </div>
                  )}
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (mode === 'login' ? 'Logging in...' : 'Registering...') : (mode === 'login' ? 'Login' : 'Register')}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={toggleMode} disabled={isLoading}>
                    {mode === 'login' ? 'Belum punya akun? Register' : 'Sudah punya akun? Login'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={onVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="otp" className="text-sm font-medium">Kode OTP</label>
                    <Input id="otp" type="text" placeholder="123456" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} disabled={isLoading} autoFocus maxLength={6} />
                    <p className="text-xs text-muted-foreground">Cek email <strong>{email}</strong> untuk kode OTP</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Verifikasi...' : 'Verifikasi Email'}</Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" className="w-full" onClick={onResendOTP} disabled={isLoading}>Kirim ulang kode OTP</Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => { setNeedsVerification(false); setOtpCode('') }} disabled={isLoading}>Kembali</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </RouteTransition>
    </div>
  )
}

