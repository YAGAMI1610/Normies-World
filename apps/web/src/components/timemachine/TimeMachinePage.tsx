'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Users, ArrowRight, Fish, Tag } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { timeMachineApi, type HistoricalSnapshot, normiesApi, type NormieVersion } from '@/lib/api';

const PRESET_DATES = [
  { label: '7 days ago',  date: format(subDays(new Date(), 7),  'yyyy-MM-dd') },
  { label: '30 days ago', date: format(subDays(new Date(), 30), 'yyyy-MM-dd') },
  { label: '90 days ago', date: format(subDays(new Date(), 90), 'yyyy-MM-dd') },
  { label: '180 days ago', date: format(subDays(new Date(), 180), 'yyyy-MM-dd') },
];

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function TimeMachinePage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [inputDate, setInputDate] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [lookupTokenId, setLookupTokenId] = useState<number | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const { data: snapshot, isLoading, isError } = useQuery({
    queryKey: ['snapshot', selectedDate],
    queryFn: () => timeMachineApi.getSnapshot(selectedDate),
    enabled: !!selectedDate,
  });

  const {
    data: versions,
    isLoading: isVersionsLoading,
    isError: isVersionsError,
  } = useQuery<NormieVersion[]>({
    queryKey: ['normie-versions', lookupTokenId],
    queryFn: () => normiesApi.getNormieVersions(lookupTokenId!),
    enabled: lookupTokenId !== null,
    staleTime: 60_000,
  });

  const handleDateSubmit = () => {
    if (inputDate) setSelectedDate(inputDate);
  };

  const handleTokenLookup = () => {
    const tokenId = Number(tokenInput);
    if (!Number.isInteger(tokenId) || tokenId < 0 || tokenId > 9999) {
      setTokenError('Please enter a valid Normie ID between 0 and 9999.');
      return;
    }
    setTokenError(null);
    setLookupTokenId(tokenId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-800 text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-alpha" />
            Normies Time Machine
          </h1>
          <p className="text-sm text-ink mt-1">Reconstruct any historical date — ownership, whales, traits, and floor.</p>
        </div>
      </div>

      {/* Date selector */}
      <div className="bg-surface rounded-xl ring-1 ring-border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs font-mono text-ink mb-2 block uppercase tracking-wider">Select Date</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                max={format(subDays(new Date(), 1), 'yyyy-MM-dd')}
                className="flex-1 bg-void border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-alpha font-mono"
              />
              <button
                onClick={handleDateSubmit}
                disabled={!inputDate}
                className="px-4 py-2 bg-alpha hover:bg-alpha/80 disabled:opacity-40 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                Travel <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-ink uppercase tracking-wider">Quick Jump</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_DATES.map(({ label, date }) => (
                <button
                  key={date}
                  onClick={() => { setInputDate(date); setSelectedDate(date); }}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                    selectedDate === date ? 'bg-alpha text-white' : 'bg-muted/20 text-ink hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedDate ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-ink"
          >
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a date to travel back in time</p>
          </motion.div>
        ) : isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-surface rounded-xl animate-pulse ring-1 ring-border" />
            ))}
          </motion.div>
        ) : isError ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-danger">
            <p className="text-sm">No snapshot found for this date. Try a different date.</p>
          </motion.div>
        ) : snapshot ? (
          <motion.div key={selectedDate} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Date header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-alpha/10 rounded-xl ring-1 ring-alpha/20">
              <Calendar className="w-5 h-5 text-alpha" />
              <div>
                <p className="text-sm font-display font-700 text-white">
                  {format(new Date(snapshot.date), 'MMMM d, yyyy')}
                </p>
                <p className="text-xs text-alpha">Historical reconstruction from indexed blockchain data</p>
              </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Holders', value: snapshot.holderCount.toLocaleString(), icon: Users, color: 'text-alpha' },
                { label: 'Floor', value: snapshot.floorEth ? `${snapshot.floorEth.toFixed(3)} Ξ` : '—', icon: Tag, color: 'text-pulse' },
                { label: 'Transfers', value: snapshot.transferCount.toLocaleString(), icon: ArrowRight, color: 'text-whale' },
                { label: 'Top Whales', value: snapshot.topHolders.length.toString(), icon: Fish, color: 'text-amber' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-surface rounded-xl ring-1 ring-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <p className="text-xs text-ink">{label}</p>
                  </div>
                  <p className="text-xl font-display font-700 text-white tabular">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top holders */}
              <div className="bg-surface rounded-xl ring-1 ring-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <Fish className="w-4 h-4 text-whale" />
                  <h3 className="text-sm font-display font-600 text-white">Top Holders on This Day</h3>
                </div>
                <div className="px-4 divide-y divide-border">
                  {snapshot.topHolders.slice(0, 8).map((holder, i) => (
                    <div key={holder.address} className="flex items-center gap-3 py-2.5">
                      <span className="text-[10px] font-mono text-ink w-4">{i + 1}</span>
                      <span className="text-xs font-mono text-white flex-1">{shortenAddress(holder.address)}</span>
                      <span className="text-xs font-mono text-whale">{holder.count} NFTs</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top traits */}
              <div className="bg-surface rounded-xl ring-1 ring-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                  <Tag className="w-4 h-4 text-alpha" />
                  <h3 className="text-sm font-display font-600 text-white">Most Active Traits</h3>
                </div>
                <div className="p-4 h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={snapshot.topTraits.slice(0, 8)} layout="vertical" margin={{ left: 60, right: 10 }}>
                      <XAxis type="number" tick={{ fill: '#8A9BC0', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="value"
                        tick={{ fill: '#D6E4FF', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        axisLine={false}
                        tickLine={false}
                        width={55}
                      />
                      <Tooltip
                        contentStyle={{ background: '#0F1420', border: '1px solid #1A2035', borderRadius: '8px', fontSize: '11px', color: '#D6E4FF' }}
                        formatter={(v: number) => [v, 'Transfers']}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {snapshot.topTraits.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={`hsl(${230 + i * 10}, 70%, ${50 + i * 3}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="bg-surface rounded-xl ring-1 ring-border p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-4">
          <div>
            <h2 className="text-sm font-display font-600 text-white">Normie Version History</h2>
            <p className="text-xs text-ink mt-1">Load the full /history/normie/{'{id}'}/versions history from the Normies API.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="number"
              placeholder="Normie ID"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="flex-1 bg-void border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-alpha font-mono"
              onKeyDown={(e) => { if (e.key === 'Enter') handleTokenLookup(); }}
              min={0}
              max={9999}
            />
            <button
              onClick={handleTokenLookup}
              className="px-4 py-2 bg-alpha hover:bg-alpha/80 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Load History
            </button>
          </div>
        </div>

        {tokenError && <p className="text-xs text-danger mb-4">{tokenError}</p>}

        {lookupTokenId === null ? (
          <p className="text-sm text-ink">Enter a Normie token ID above to view the full history of its canvas versions.</p>
        ) : isVersionsLoading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isVersionsError ? (
          <p className="text-sm text-danger">Unable to load version history for Normie #{lookupTokenId}.</p>
        ) : versions && versions.length === 0 ? (
          <p className="text-sm text-ink">No version history found for Normie #{lookupTokenId}.</p>
        ) : (
          <div className="space-y-4">
            {versions?.map((version, index) => (
              <div key={index} className="bg-void/30 border border-border rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-sm font-display font-700 text-white">Version {version.version ?? index + 1}</p>
                    {version.createdAt && (
                      <p className="text-xs text-ink">{format(new Date(version.createdAt), 'PP p')}</p>
                    )}
                  </div>
                  {version.txHash && (
                    <a
                      href={`https://etherscan.io/tx/${version.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-alpha hover:underline"
                    >
                      View transaction
                    </a>
                  )}
                </div>
                <pre className="mt-3 text-[11px] text-ink whitespace-pre-wrap break-words bg-void p-3 rounded-lg">
{JSON.stringify(version, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}