'use client';

import { motion } from 'framer-motion';
import { ActivityType, ACTIVITIES, Player } from '@/lib/types';

interface Props {
  player: Player;
}

const ACTIVITY_COLORS: Record<ActivityType, { bg: string; border: string; text: string }> = {
  'AM Lab':     { bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.25)',   text: '#00d4ff' },
  'AM Valley':  { bg: 'rgba(0,150,255,0.08)',   border: 'rgba(0,150,255,0.25)',   text: '#0096ff' },
  'PM Lab':     { bg: 'rgba(191,0,255,0.08)',   border: 'rgba(191,0,255,0.25)',   text: '#bf00ff' },
  'PM Valley':  { bg: 'rgba(255,100,0,0.08)',   border: 'rgba(255,100,0,0.25)',   text: '#ff6400' },
  'W8+':        { bg: 'rgba(255,215,0,0.08)',   border: 'rgba(255,215,0,0.25)',   text: '#ffd700' },
};

function ActivityBar({ activity, joined, total, pct }: { activity: ActivityType; joined: number; total: number; pct: number }) {
  const c = ACTIVITY_COLORS[activity];
  const barColor = pct >= 50 ? 'var(--neon-green)' : pct >= 25 ? '#ffb400' : 'var(--neon-red)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: '10px', padding: '14px 16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontFamily: 'Cinzel', fontSize: '11px', letterSpacing: '2px', color: c.text }}>{activity}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--neon-green)' }}>✓ {joined}</span>
          <span style={{ fontSize: '12px', color: 'var(--neon-red)' }}>✗ {total - joined}</span>
        </div>
      </div>
      <div className="progress-bar-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
          style={{
            height: '100%', borderRadius: '999px',
            background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
            boxShadow: `0 0 8px ${barColor}60`,
          }}
        />
      </div>
      <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{total} sessions tracked</span>
        <span style={{ fontFamily: 'Orbitron', fontSize: '12px', fontWeight: 600, color: barColor }}>{pct.toFixed(0)}%</span>
      </div>
    </motion.div>
  );
}

export default function ActivityStats({ player }: Props) {
  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontFamily: 'Cinzel', fontSize: '12px', letterSpacing: '3px', color: 'var(--neon-blue)', marginBottom: '4px' }}>
          ACTIVITY BREAKDOWN
        </div>
        <div className="divider-glow" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ACTIVITIES.map(act => {
          const s = player.activityStats[act];
          return (
            <ActivityBar
              key={act}
              activity={act}
              joined={s.joined}
              total={s.total}
              pct={s.percentage}
            />
          );
        })}
      </div>

      {/* Total summary */}
      <div style={{
        marginTop: '16px', padding: '12px 16px',
        background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)',
        borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'Rajdhani', fontSize: '13px', color: 'var(--text-muted)' }}>Total Attended / Total</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: '18px', fontWeight: 700, color: 'var(--neon-green)' }}>{player.attended}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>/ {player.total}</span>
          <span style={{ fontFamily: 'Orbitron', fontSize: '14px', color: 'var(--neon-blue)', marginLeft: '8px' }}>{player.attendancePercent}</span>
        </div>
      </div>
    </div>
  );
}
