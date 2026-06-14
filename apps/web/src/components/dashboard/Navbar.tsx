'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { Bell, Zap, Fish, Clock, User, LayoutDashboard } from 'lucide-react';
import { useAlertStore } from '@/lib/stores/alertStore';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'whales',    label: 'Whale Intel', icon: Fish },
  { id: 'timemachine', label: 'Time Machine', icon: Clock },
  { id: 'profile',  label: 'Profile',      icon: User },
];

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { unreadCount, markAllRead } = useAlertStore();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-void/80 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-alpha flex items-center justify-center shadow-alpha">
            <Zap className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <div>
            <span className="font-display font-800 text-base text-white tracking-tight">NORMIES</span>
            <span className="font-display font-400 text-base text-alpha tracking-widest ml-1">ALPHA</span>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${activeTab === id
                  ? 'text-white bg-surface'
                  : 'text-ink hover:text-text hover:bg-surface/50'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {activeTab === id && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-lg ring-1 ring-alpha/40"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Right: alerts + wallet */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={markAllRead}
            className="relative p-2 rounded-lg hover:bg-surface transition-colors"
          >
            <Bell className="w-4 h-4 text-ink" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger rounded-full text-[9px] font-mono flex items-center justify-center text-white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>

          <ConnectButton
            accountStatus="avatar"
            chainStatus="none"
            showBalance={false}
          />
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors
              ${activeTab === id ? 'bg-surface text-white ring-1 ring-alpha/40' : 'text-ink'}`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
