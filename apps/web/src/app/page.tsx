'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/dashboard/Navbar';
import { HeroStats } from '@/components/dashboard/HeroStats';
import { AlertFeed } from '@/components/alerts/AlertFeed';
import { WhaleRadar } from '@/components/whale/WhaleRadar';
import { TraitHeatmap } from '@/components/dashboard/TraitHeatmap';
import { AIInsightPanel } from '@/components/dashboard/AIInsightPanel';
import { ReputationLeaderboard } from '@/components/reputation/ReputationLeaderboard';
import { FloorChart } from '@/components/dashboard/FloorChart';
import { AgentExplorer } from '@/components/dashboard/AgentExplorer';
import { useSocket } from '@/hooks/useSocket';
import { useAlertStore } from '@/lib/stores/alertStore';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'whales' | 'timemachine' | 'profile'>('dashboard');
  const { addAlert } = useAlertStore();
  
  useSocket({
    onAlert: (alert) => addAlert(alert),
  });

  return (
    <div className="min-h-screen bg-void bg-grid-void relative">
      {/* Ambient glow top */}
      <div className="fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-alpha to-transparent opacity-60 z-50" />
      <div className="fixed inset-x-0 top-0 h-96 bg-glow-alpha pointer-events-none z-0" />

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Hero stats row */}
              <HeroStats />

              {/* Main grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Alert feed + AI insight */}
                <div className="lg:col-span-1 space-y-6">
                  <AlertFeed />
                  <AIInsightPanel />
                </div>

                {/* Center: Floor chart + trait heatmap */}
                <div className="lg:col-span-1 space-y-6">
                  <FloorChart />
                  <TraitHeatmap />
                </div>

                {/* Right: Whale radar + leaderboards */}
                <div className="lg:col-span-1 space-y-6">
                  <WhaleRadar />
                  <ReputationLeaderboard />
                </div>
              </div>

              {/* Agent Explorer */}
              <AgentExplorer />
            </motion.div>
          )}

          {activeTab === 'whales' && (
            <motion.div
              key="whales"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <WhalePage />
            </motion.div>
          )}

          {activeTab === 'timemachine' && (
            <motion.div
              key="timemachine"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <TimeMachinePage />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <ProfilePage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Lazy sub-page imports
import dynamic from 'next/dynamic';
const WhalePage = dynamic(() => import('@/components/whale/WhalePage'), { ssr: false });
const TimeMachinePage = dynamic(() => import('@/components/timemachine/TimeMachinePage'), { ssr: false });
const ProfilePage = dynamic(() => import('@/components/reputation/ProfilePage'), { ssr: false });
