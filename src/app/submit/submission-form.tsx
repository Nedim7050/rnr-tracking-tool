'use client'
import { useState } from 'react'
import { submitMemberAction } from '@/app/actions/submissions'
import { Member, MetricCatalog } from '@/types'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export function SubmissionForm({ members, metrics, scriptUrl }: { members: Member[], metrics: MetricCatalog[], scriptUrl: string }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const [memberId, setMemberId] = useState('')
    const [memberCode, setMemberCode] = useState('')
    const [metricId, setMetricId] = useState('')
    const [proofUrl, setProofUrl] = useState('')
    const [quantity, setQuantity] = useState('1')

    const [loadingMessage, setLoadingMessage] = useState('')

    // File Upload State
    const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url')
    const [fileData, setFileData] = useState<{ name: string, type: string, base64: string } | null>(null)
    const [isCompressing, setIsCompressing] = useState(false)

    const compressImage = async (file: File): Promise<{ name: string, type: string, base64: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let { width, height } = img;
                    const MAX_SIZE = 1280;

                    if (width > height && width > MAX_SIZE) {
                        height *= MAX_SIZE / width; width = MAX_SIZE;
                    } else if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height; height = MAX_SIZE;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    resolve({ name: file.name, type: "image/jpeg", base64: canvas.toDataURL("image/jpeg", 0.75).split(',')[1] });
                };
                img.src = event.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    const selectedMetric = metrics.find(m => m.metric_id === metricId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Filter out if proof is required but empty
        if (selectedMetric?.requires_proof && uploadMode === 'url' && !proofUrl.trim()) {
            setError("Proof URL is required for this action.")
            setLoading(false)
            return
        }
        if (selectedMetric?.requires_proof && uploadMode === 'file' && !fileData) {
            setError("A file upload is required for this action.")
            setLoading(false)
            return
        }

        let finalProofUrl = proofUrl;

        if (uploadMode === 'file' && fileData) {
            try {
                setLoadingMessage("🚀 Uploading image to Google Drive...")
                const response = await fetch(scriptUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'upload_proof',
                        payload: { filename: fileData.name, mimeType: fileData.type, base64: fileData.base64 }
                    }),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                })
                const uploadRes = await response.json()

                if (!uploadRes.success || !uploadRes.url) {
                    setError("Failed to upload evidence to Drive: " + (uploadRes.error || "Unknown"));
                    setLoading(false);
                    return;
                }
                finalProofUrl = uploadRes.url;
            } catch (err: any) {
                setError("Error uploading file: " + err.message);
                setLoading(false);
                setLoadingMessage('');
                return;
            }
        }

        setLoadingMessage("⚙️ Recording your action points...")
        const res = await submitMemberAction({
            member_id: memberId,
            member_code: memberCode,
            metric_id: metricId,
            proof_url: finalProofUrl,
            quantity: Number(quantity) || 1
        })

        if (res.success) {
            setSuccess(true)
        } else {
            setError(res.error || "Submission failed.")
        }
        setLoading(false)
        setLoadingMessage('')
    }

    if (success) {
        return (
            <Card className="shadow-xl border-emerald-100 dark:border-emerald-900/50">
                <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center text-center">
                    <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Submission Received</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Your proof has been recorded and is pending admin review.
                    </p>
                    <Button onClick={() => {
                        setSuccess(false); setProofUrl(''); setFileData(null); setMetricId(''); setQuantity('1'); setMemberCode('');
                    }} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                        Submit Another Action
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-xl border-blue-100 dark:border-blue-900/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Link href="/login" className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium flex items-center">
                        <ChevronLeft className="h-3 w-3" /> Admin
                    </Link>
                </div>
                <CardTitle className="text-xl">Action Details</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Who are you?</label>
                        <Select value={memberId} onValueChange={(v) => v && setMemberId(v)} required>
                            <SelectTrigger className="bg-white dark:bg-slate-950">
                                <SelectValue placeholder="Select your name" />
                            </SelectTrigger>
                            <SelectContent>
                                {members.sort((a, b) => a.full_name.localeCompare(b.full_name)).map(m => (
                                    <SelectItem key={m.member_id} value={m.member_id}>{m.full_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Private Member Code</label>
                        <Input
                            type="password"
                            placeholder="Enter your confidential code"
                            value={memberCode}
                            onChange={e => setMemberCode(e.target.value)}
                            className="bg-white dark:bg-slate-950"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Action Type</label>
                        <Select value={metricId} onValueChange={(v) => v && setMetricId(v)} required>
                            <SelectTrigger className="bg-white dark:bg-slate-950 w-full break-normal whitespace-normal h-auto min-h-[2.5rem] py-2">
                                <SelectValue placeholder="Select action you completed" />
                            </SelectTrigger>
                            <SelectContent className="min-w-[300px] w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
                                {metrics.map(m => (
                                    <SelectItem key={m.metric_id} value={m.metric_id} className="cursor-pointer break-words whitespace-normal py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50">
                                        {m.metric_name} {m.base_points > 0 ? <span className="text-blue-500 ml-1">(+{m.base_points} pts)</span> : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedMetric?.requires_quantity && (
                        <div className="space-y-2 animate-in slide-in-from-top-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quantity</label>
                            <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                className="bg-white dark:bg-slate-950"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Proof Method {selectedMetric?.requires_proof && <span className="text-red-500">*</span>}
                            </label>
                            <Select value={uploadMode} onValueChange={(v: any) => v && setUploadMode(v)}>
                                <SelectTrigger className="w-[180px] h-8 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500 transition-colors">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="url">Paste Link</SelectItem>
                                    <SelectItem value="file">Upload Photo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {uploadMode === 'url' ? (
                            <Input
                                type="url"
                                placeholder="https://drive.google.com/..."
                                value={proofUrl}
                                onChange={e => setProofUrl(e.target.value)}
                                className="bg-white dark:bg-slate-950"
                                required={selectedMetric?.requires_proof}
                            />
                        ) : (
                            <div className="space-y-2">
                                <Input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={async (e) => {
                                        setError('');
                                        const file = e.target.files?.[0];
                                        if (!file) { setFileData(null); return; }
                                        if (file.size > 10 * 1024 * 1024) {
                                            setError("File exceeds 10MB limit");
                                            e.target.value = '';
                                            return;
                                        }
                                        setIsCompressing(true);
                                        if (file.type.startsWith('image/')) {
                                            const compressedFile = await compressImage(file);
                                            setFileData(compressedFile);
                                        } else {
                                            const reader = new FileReader();
                                            reader.onload = () => setFileData({ name: file.name, type: file.type, base64: (reader.result as string).split(',')[1] });
                                            reader.readAsDataURL(file);
                                        }
                                        setIsCompressing(false);
                                    }}
                                    className="bg-white dark:bg-slate-950 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/40 dark:file:text-blue-400 cursor-pointer pt-2"
                                    required={selectedMetric?.requires_proof && !fileData}
                                />
                                {isCompressing && <p className="text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse">⚡ Optimizing image size (instant upload)...</p>}
                                {fileData && !isCompressing && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">✓ Ready to upload: {fileData.name}</p>}
                            </div>
                        )}
                        {selectedMetric?.proof_label && (
                            <p className="text-xs text-slate-500">Hint: {selectedMetric.proof_label}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col items-center">
                    <Button type="submit" disabled={loading || isCompressing} className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-semibold text-base transition-all relative overflow-hidden group">
                        {loading && <div className="absolute inset-0 w-full h-full bg-white/20 animate-[pulse_1s_ease-in-out_infinite]" />}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : "Submit Proof"}
                        </span>
                    </Button>

                    {/* Animated dynamic loading text */}
                    <div className={`mt-3 h-4 text-sm font-medium text-slate-500 overflow-hidden transition-all duration-500 ${loadingMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        {loadingMessage && <p className="animate-[pulse_1.5s_ease-in-out_infinite]">{loadingMessage}</p>}
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}
