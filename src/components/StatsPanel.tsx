'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, Server, Crown, Activity, AlertTriangle, XCircle } from 'lucide-react';
import { HOFStats } from '@/lib/types';

interface Props {
  stats: HOFStats;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  glow: string;
  delay?: number;
  suffix?: string;
}

function StatCard({ label, value, icon, color, glow, delay = 0, suffix }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="stat-card"
      style={{ flex: '1 1 160px', minWidth: '140px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '8px',
          background: `${color}18`,
          border: `1px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 12px ${color}30`,
        }}>
          {icon}
        </div>
        <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', textAlign: 'right' }}>
          {label.toUpperCase()}
        </div>
      </div>
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '26px', fontWeight: '700', color, textShadow: glow, lineHeight: 1 }}>
        {value}{suffix && <span style={{ fontSize: '14px', marginLeft: '4px', opacity: 0.7 }}>{suffix}</span>}
      </div>
    </motion.div>
  );
}

export default function StatsPanel({ stats }: Props) {
  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Alliance header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <div className="divider-glow" style={{ flex: 1 }} />
        <span style={{ fontFamily: 'Cinzel', fontSize: '11px', letterSpacing: '4px', color: 'var(--neon-blue)', opacity: 0.7 }}>
          HOF ALLIANCE OVERVIEW
        </span>
        <div className="divider-glow" style={{ flex: 1 }} />
      </motion.div>

      {/* Stat cards row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <StatCard
          label="Total Members"
          value={stats.totalPlayers}
          icon={<Users size={18} color="#00d4ff" />}
          color="#00d4ff"
          glow="0 0 15px rgba(0,212,255,0.6)"
          delay={0}
        />
        <StatCard
          label="Avg Attendance"
          value={stats.avgAttendance.toFixed(1)}
          suffix="%"
          icon={<TrendingUp size={18} color="#00ff88" />}
          color="#00ff88"
          glow="0 0 15px rgba(0,255,136,0.6)"
          delay={0.05}
        />
        <StatCard
          label="Top Performer"
          value={stats.topPlayer.length > 12 ? stats.topPlayer.slice(0, 12) + '…' : stats.topPlayer}
          icon={<Crown size={18} color="#ffd700" />}
          color="#ffd700"
          glow="0 0 15px rgba(255,215,0,0.6)"
          delay={0.1}
        />
        <StatCard
          label="Server 23"
          value={stats.server23Count}
          icon={<Server size={18} color="#00d4ff" />}
          color="#00d4ff"
          glow="0 0 12px rgba(0,212,255,0.5)"
          delay={0.15}
        />
        <StatCard
          label="Server 24"
          value={stats.server24Count}
          icon={<Server size={18} color="#bf00ff" />}
          color="#bf00ff"
          glow="0 0 12px rgba(191,0,255,0.5)"
          delay={0.2}
        />
        <StatCard
          label="Active"
          value={stats.activeCount}
          icon={<Activity size={18} color="#00ff88" />}
          color="#00ff88"
          glow="0 0 12px rgba(0,255,136,0.5)"
          delay={0.25}
        />
        <StatCard
          label="Warning"
          value={stats.warningCount}
          icon={<AlertTriangle size={18} color="#ffb400" />}
          color="#ffb400"
          glow="0 0 12px rgba(255,180,0,0.5)"
          delay={0.3}
        />
        <StatCard
          label="Inactive"
          value={stats.inactiveCount}
          icon={<XCircle size={18} color="#ff2244" />}
          color="#ff2244"
          glow="0 0 12px rgba(255,34,68,0.5)"
          delay={0.35}
        />
      </div>
    </div>
  );
}
