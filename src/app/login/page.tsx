'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'

export default function LoginPage() {
    const [passcode, setPasscode] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const res = await login(passcode)
        if (res.success) {
            router.push('/dashboard')
        } else {
            setError(res.error || 'Login failed')
            setLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center p-4">
            {/* Background Image Container */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("/login-bg.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)' // Prevent white edges from blur
                }}
            >
                <div className="absolute inset-0 bg-slate-900/40"></div>
            </div>

            <Card className="relative z-10 w-full max-w-md shadow-2xl border-blue-100 dark:border-blue-900 border-opacity-50 transition-all duration-300 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-blue-100 p-4 ring-8 ring-white dark:bg-blue-900 dark:ring-slate-900 shadow-lg">
                            <ShieldAlert className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">AIESEC CARTHAGE RNR</CardTitle>
                        <CardDescription className="text-base mt-2">Enter your admin passcode to access the tracking dashboard</CardDescription>
                    </div>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-2">
                                <Input
                                    id="passcode"
                                    type="password"
                                    placeholder="Passcode..."
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    className="h-12 text-lg text-center tracking-widest bg-white dark:bg-slate-950"
                                    required
                                />
                            </div>
                            {error && <p className="text-sm font-medium text-red-500 text-center animate-in fade-in slide-in-from-top-1">{error}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors shadow-md" type="submit" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Access Dashboard'}
                        </Button>
                        <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-sm text-slate-500 mb-2 dark:text-slate-400">AIESEC Carthage Member?</p>
                            <a href="/submit" className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-sm">
                                Submit Action Proofs Here &rarr;
                            </a>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
