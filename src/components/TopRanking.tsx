'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Crown, TrendingUp, TrendingDown } from 'lucide-react';
import { Player } from '@/lib/types';

interface Props {
  players: Player[];
}

export default function TopRanking({ players }: Props) {
  const router = useRouter();

  const top5 = [...players]
    .sort((a, b) => b.attendancePercentNum - a.attendancePercentNum)
    .slice(0, 5);

  const bottom5 = [...players]
    .filter(p => p.attendancePercentNum > 0)
    .sort((a, b) => a.attendancePercentNum - b.attendancePercentNum)
    .slice(0, 5);

  const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32', '#8ab4cf', '#8ab4cf'];
  const rankGlows  = [
    '0 0 15px rgba(255,215,0,0.6)',
    '0 0 10px rgba(192,192,192,0.4)',
    '0 0 10px rgba(205,127,50,0.4)',
    'none', 'none',
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {/* Top Active */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <TrendingUp size={16} color="var(--neon-green)" />
          <span style={{ fontFamily: 'Cinzel', fontSize: '11px', letterSpacing: '3px', color: 'var(--neon-green)' }}>
            TOP ACTIVE
          </span>
        </div>
        <div className="divider-glow" style={{ marginBottom: '14px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {top5.map((p, i) => (
            <motion.div
              key={p.ign}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => router.push(`/player/${encodeURIComponent(p.ign)}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                background: i === 0 ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)'}`,
                transition: 'all 0.2s',
              }}
              whileHover={{ x: 4, background: 'rgba(0,212,255,0.06)', borderColor: 'rgba(0,212,255,0.2)' }}
            >
              {/* Rank */}
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: i === 0 ? 'linear-gradient(135deg,#b8860b,#ffd700)' : i === 1 ? 'linear-gradient(135deg,#707070,#e0e0e0)' : i === 2 ? 'linear-gradient(135deg,#8b4513,#cd7f32)' : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: rankGlows[i], flexShrink: 0,
              }}>
                {i === 0 ? <Crown size={14} color="#3a2000" /> : (
                  <span style={{ fontFamily: 'Orbitron', fontSize: '11px', fontWeight: 700, color: i < 3 ? '#1a1a1a' : rankColors[i] }}>
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.ign}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  S{p.server} · {p.attended}/{p.total} sessions
                </div>
              </div>

              {/* Pct */}
              <span style={{
                fontFamily: 'Orbitron', fontSize: '13px', fontWeight: 700,
                color: rankColors[i], textShadow: rankGlows[i], flexShrink: 0,
              }}>
                {p.attendancePercentNum.toFixed(1)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Needs Attention */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <TrendingDown size={16} color="var(--neon-red)" />
          <span style={{ fontFamily: 'Cinzel', fontSize: '11px', letterSpacing: '3px', color: 'var(--neon-red)' }}>
            NEEDS ATTENTION
          </span>
        </div>
        <div className="divider-glow" style={{ marginBottom: '14px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {bottom5.map((p, i) => (
            <motion.div
              key={p.ign}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => router.push(`/player/${encodeURIComponent(p.ign)}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                background: 'rgba(255,34,68,0.04)',
                border: '1px solid rgba(255,34,68,0.12)',
                transition: 'all 0.2s',
              }}
              whileHover={{ x: -4, background: 'rgba(255,34,68,0.08)', borderColor: 'rgba(255,34,68,0.25)' }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'rgba(255,34,68,0.1)', border: '1px solid rgba(255,34,68,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'Orbitron', fontSize: '11px', fontWeight: 700, color: 'var(--neon-red)' }}>
                  {i + 1}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.ign}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  S{p.server} · {p.attended}/{p.total} sessions
                </div>
              </div>

              <span style={{ fontFamily: 'Orbitron', fontSize: '13px', fontWeight: 700, color: 'var(--neon-red)', flexShrink: 0 }}>
                {p.attendancePercentNum.toFixed(1)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
