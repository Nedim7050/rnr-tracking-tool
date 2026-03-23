'use client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AlertTriangle, Play, Database, FileSpreadsheet, Lock } from 'lucide-react'

export function SetupGuide({ error }: { error?: string }) {
    return (
        <div className="flex min-h-[80vh] w-full items-center justify-center p-4">
            <Card className="w-full max-w-2xl border-amber-200 bg-amber-50/80 backdrop-blur-sm dark:border-amber-900/50 dark:bg-amber-950/40 shadow-xl transition-all">
                <CardHeader className="border-b border-amber-100 dark:border-amber-900/50 pb-6 mb-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full flex-shrink-0 animate-pulse">
                            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight text-amber-900 dark:text-amber-400">Database Connection Required</CardTitle>
                            <CardDescription className="text-amber-700 dark:text-amber-600/80 mt-1 text-base">
                                The application requires a connection to the Google Apps Script backend.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="bg-red-50/80 text-red-700 p-4 rounded-lg border border-red-200 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400 text-sm font-mono shadow-sm">
                            <span className="font-bold flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4" /> Connection Error Details:</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-5 text-sm text-slate-700 dark:text-slate-300">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Setup Instructions
                        </h3>

                        <div className="grid gap-4">
                            <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                                <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 text-emerald-600 dark:text-emerald-400 rounded-md">
                                    <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">1. Setup Google Sheet</h4>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">Open Google Drive, create a new Sheet. Go to Extensions &gt; Apps Script. Paste the generated <code>Code.gs</code> string.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 text-blue-600 dark:text-blue-400 rounded-md">
                                    <Database className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">2. Deploy as Web App</h4>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">In Apps Script, click Deploy. Set <strong>Execute as: Me</strong> and <strong>Who has access: Anyone</strong>. Copy the URL.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                                <div className="bg-purple-100 dark:bg-purple-900/50 p-2 text-purple-600 dark:text-purple-400 rounded-md">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">3. Update Environment</h4>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">Set <code>GOOGLE_APPS_SCRIPT_URL</code> in <code>.env.local</code>. Restart your Next.js server.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
