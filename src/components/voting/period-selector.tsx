'use client'
import { useRouter } from 'next/navigation'
import { VotingPeriod } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function PeriodSelector({ periods, currentKey }: { periods: VotingPeriod[], currentKey: string }) {
    const router = useRouter()
    return (
        <Select value={currentKey} onValueChange={(val) => router.push(`/voting?period=${val}`)}>
            <SelectTrigger className="w-full sm:w-[250px] bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300">
                <SelectValue placeholder="Select period..." />
            </SelectTrigger>
            <SelectContent>
                {periods.map(p => (
                    <SelectItem key={p.period_key} value={p.period_key}>{p.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
