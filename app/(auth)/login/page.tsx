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

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [isLoading, setIsLoading] = React.useState(false)
  const [otpSent, setOtpSent] = React.useState(false)
  const [email, setEmail] = React.useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSendOTP = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/boards`,
        },
      })

      if (error) throw error

      setEmail(data.email)
      setOtpSent(true)
      toast.success('Kode OTP telah dikirim ke email Anda!')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const onVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const token = formData.get('token') as string

    if (!token) {
      toast.error('Masukkan kode OTP')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })

      if (error) throw error

      toast.success('Login berhasil!')
      router.push('/boards')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Kode OTP tidak valid')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Taskify Kanban</CardTitle>
          <CardDescription>
            {otpSent
              ? 'Masukkan kode OTP yang dikirim ke email Anda'
              : 'Login dengan email untuk melanjutkan'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpSent ? (
            <form onSubmit={handleSubmit(onSendOTP)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Mengirim...' : 'Kirim Kode OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={onVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="token" className="text-sm font-medium">
                  Kode OTP
                </label>
                <Input
                  id="token"
                  name="token"
                  type="text"
                  placeholder="123456"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifikasi...' : 'Verifikasi & Login'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setOtpSent(false)}
                disabled={isLoading}
              >
                Kirim ulang ke email lain
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

