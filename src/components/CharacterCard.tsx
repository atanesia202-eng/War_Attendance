'use client';

import { motion } from 'framer-motion';
import { Shield, Sword, Star, Zap } from 'lucide-react';
import { Player } from '@/lib/types';

interface Props {
  player: Player;
}

export default function CharacterCard({ player }: Props) {
  // Generate a deterministic avatar background based on name
  const avatarHue = [...player.ign].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  const statusColor = player.status === 'active' ? 'var(--neon-green)'
    : player.status === 'warning' ? '#ffb400'
    : 'var(--neon-red)';

  const statusGlow = player.status === 'active'
    ? '0 0 20px rgba(0,255,136,0.4)'
    : player.status === 'warning'
    ? '0 0 20px rgba(255,180,0,0.4)'
    : '0 0 20px rgba(255,34,68,0.4)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
      style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background glow orb */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '200px', height: '200px', borderRadius: '50%',
        background: `radial-gradient(circle, hsl(${avatarHue},80%,40%)22, transparent 70%)`,
        opacity: 0.15, pointerEvents: 'none',
      }} />

      {/* Status bar top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, transparent, ${statusColor}, transparent)`,
        boxShadow: statusGlow,
      }} />

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '16px',
            background: `linear-gradient(135deg, hsl(${avatarHue},70%,20%), hsl(${(avatarHue + 60) % 360},70%,30%))`,
            border: `2px solid hsl(${avatarHue},60%,40%)`,
            boxShadow: `0 0 30px hsl(${avatarHue},60%,30%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', userSelect: 'none',
          }}>
            {player.ign.slice(0, 1).toUpperCase()}
          </div>
          {/* Status dot */}
          <div style={{
            position: 'absolute', bottom: '4px', right: '4px',
            width: '14px', height: '14px', borderRadius: '50%',
            background: statusColor,
            boxShadow: statusGlow,
            border: '2px solid var(--bg-card)',
          }} className="animate-pulse-glow" />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h2 style={{
              fontFamily: 'Cinzel', fontWeight: 700, fontSize: 'clamp(18px, 3vw, 26px)',
              color: `hsl(${avatarHue},80%,80%)`,
              textShadow: `0 0 20px hsl(${avatarHue},80%,50%)`,
              lineHeight: 1,
            }}>
              {player.ign}
            </h2>
            <span className={`status-${player.status}`} style={{
              padding: '2px 10px', borderRadius: '4px',
              fontFamily: 'Cinzel', fontSize: '10px', letterSpacing: '2px',
            }}>
              {player.status.toUpperCase()}
            </span>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
            {[
              { icon: <Star size={13} color="var(--neon-gold)" />, label: 'Level', value: player.level || '—', color: 'var(--neon-gold)' },
              { icon: <Sword size={13} color="var(--neon-red)" />, label: 'Power', value: player.powerScore || '—', color: 'var(--text-secondary)' },
              { icon: <Shield size={13} color="var(--neon-blue)" />, label: 'Server', value: `S${player.server}`, color: player.server === '23' ? 'var(--neon-blue)' : '#bf00ff' },
              { icon: <Zap size={13} color="var(--neon-green)" />, label: 'Sessions', value: `${player.attended}/${player.total}`, color: 'var(--neon-green)' },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px', padding: '8px 14px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                {item.icon}
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', letterSpacing: '1px' }}>{item.label.toUpperCase()}</div>
                  <div style={{ fontFamily: 'Orbitron', fontSize: '13px', fontWeight: 600, color: item.color }}>{item.value}</div>
                </div>
              </div>
            ))}

            {/* MS / SP badges */}
            {player.ms && (
              <div style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', letterSpacing: '1px' }}>MS RANK</div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '13px', fontWeight: 700, color: 'var(--neon-blue)' }}>{player.ms}</div>
              </div>
            )}
            {player.sp && (
              <div style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(191,0,255,0.06)', border: '1px solid rgba(191,0,255,0.2)' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', letterSpacing: '1px' }}>SP RANK</div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '13px', fontWeight: 700, color: '#bf00ff' }}>{player.sp}</div>
              </div>
            )}
          </div>
        </div>

        {/* Big attendance percentage */}
        <div style={{ textAlign: 'center', minWidth: '110px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginBottom: '6px' }}>
            ATTENDANCE
          </div>
          <div style={{
            fontFamily: 'Orbitron', fontSize: '36px', fontWeight: 900,
            color: statusColor, textShadow: statusGlow, lineHeight: 1,
          }}>
            {player.attendancePercentNum.toFixed(1)}<span style={{ fontSize: '18px' }}>%</span>
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--neon-green)' }}>{player.attended}</span> joined ·{' '}
            <span style={{ color: 'var(--neon-red)' }}>{player.total - player.attended}</span> missed
          </div>
        </div>
      </div>
    </motion.div>
  );
}
