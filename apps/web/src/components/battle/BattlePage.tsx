'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Zap, Shield, Users, Search } from 'lucide-react';
import { battleApi, type NormieCard } from '@/lib/api';
import { BattleCard } from './BattleCard';
import { BattleLeaderboard } from './BattleLeaderboard';

type GameMode = 'RANKED' | 'CASUAL';
type View = 'lobby' | 'collection' | 'matchmaking' | 'battle';

export default function BattlePage() {
  const [view, setView] = useState<View>('lobby');
  const [mode, setMode] = useState<GameMode>('CASUAL');
  const [selectedCard, setSelectedCard] = useState<NormieCard | null>(null);

  const { data: myCards = [], isLoading } = useQuery({
    queryKey: ['my-cards'],
    queryFn: battleApi.getMyCards,
  });

  const { mutate: findMatch, isPending: isMatchmaking } = useMutation({
    mutationFn: () => battleApi.findMatch(mode),
    onSuccess: () => setView('battle'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-800 text-white flex items-center gap-2">
            <Swords className="w-6 h-6 text-alpha" />
            AI Battle Cards
          </h1>
          <p className="text-sm text-ink mt-1">Every card is a real Normie NFT. Stats derived from traits, rarity & on-chain history.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('lobby')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${view === 'lobby' ? 'bg-alpha text-white' : 'bg-surface text-ink hover:text-white'}`}
          >
            Lobby
          </button>
          <button
            onClick={() => setView('collection')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${view === 'collection' ? 'bg-alpha text-white' : 'bg-surface text-ink hover:text-white'}`}
          >
            My Cards
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'lobby' && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Play panel */}
              <div className="bg-surface rounded-xl ring-1 ring-border p-6">
                <h2 className="text-lg font-display font-700 text-white mb-4">Choose Mode</h2>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(['CASUAL', 'RANKED'] as GameMode[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        mode === m ? 'border-alpha bg-alpha/10' : 'border-border hover:border-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {m === 'CASUAL' ? <Users className="w-4 h-4 text-pulse" /> : <Trophy className="w-4 h-4 text-amber" />}
                        <span className="text-sm font-medium text-white">{m === 'CASUAL' ? 'Casual' : 'Ranked'}</span>
                      </div>
                      <p className="text-xs text-ink">
                        {m === 'CASUAL' ? 'No ELO impact. Play for fun.' : 'ELO rating. Climb the leaderboard.'}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Selected card display */}
                {selectedCard ? (
                  <div className="flex gap-4 items-center mb-6 p-3 bg-muted/20 rounded-xl">
                    <BattleCard card={selectedCard} size="sm" />
                    <div>
                      <p className="text-xs text-ink mb-1">Selected card</p>
                      <p className="text-sm font-display font-700 text-white">{selectedCard.name}</p>
                      <p className="text-xs text-ink mt-1">ATK {selectedCard.attack} · DEF {selectedCard.defense} · SPD {selectedCard.speed}</p>
                      <button onClick={() => setSelectedCard(null)} className="text-xs text-danger mt-2 hover:underline">Remove</button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setView('collection')}
                    className="mb-6 p-4 border-2 border-dashed border-border rounded-xl text-center cursor-pointer hover:border-alpha transition-colors"
                  >
                    <p className="text-sm text-ink">Select your card →</p>
                  </div>
                )}

                <button
                  onClick={() => findMatch()}
                  disabled={isMatchmaking || !selectedCard}
                  className="w-full py-3 rounded-xl bg-alpha hover:bg-alpha/80 disabled:opacity-40 disabled:cursor-not-allowed text-white font-display font-700 text-sm transition-colors shadow-alpha flex items-center justify-center gap-2"
                >
                  {isMatchmaking ? (
                    <>
                      <Search className="w-4 h-4 animate-spin" />
                      Finding opponent…
                    </>
                  ) : (
                    <>
                      <Swords className="w-4 h-4" />
                      Find Match
                    </>
                  )}
                </button>
              </div>

              {/* Leaderboard */}
              <BattleLeaderboard />
            </div>
          </motion.div>
        )}

        {view === 'collection' && (
          <motion.div key="collection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-surface rounded-xl ring-1 ring-border p-6">
              <h2 className="text-lg font-display font-700 text-white mb-4">
                Your Cards
                <span className="ml-2 text-sm font-normal text-ink">({myCards.length} owned)</span>
              </h2>

              {isLoading ? (
                <p className="text-ink text-sm">Loading your Normies…</p>
              ) : myCards.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-ink text-sm">No Normies NFTs detected in your wallet.</p>
                  <p className="text-xs text-muted mt-1">Connect your wallet and own a Normie to play.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {myCards.map(card => (
                    <div key={card.tokenId} onClick={() => { setSelectedCard(card); setView('lobby'); }}>
                      <BattleCard
                        card={card}
                        selected={selectedCard?.tokenId === card.tokenId}
                        size="md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === 'battle' && (
          <motion.div key="battle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-surface rounded-xl ring-1 ring-border p-8 text-center">
              <div className="flex items-center justify-center gap-6">
                {selectedCard && <BattleCard card={selectedCard} size="lg" />}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-danger" />
                  </div>
                  <p className="text-xs font-mono text-ink">VS</p>
                </div>
                <div className="w-64 h-80 bg-muted/20 rounded-xl flex items-center justify-center">
                  <p className="text-ink text-sm animate-pulse">Finding opponent card…</p>
                </div>
              </div>
              <button onClick={() => setView('lobby')} className="mt-6 text-sm text-ink hover:text-white transition-colors">
                ← Back to lobby
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}