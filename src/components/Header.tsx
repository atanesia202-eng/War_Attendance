'use client';

import { RefreshCw, Zap, Shield } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { motion } from 'framer-motion';

export default function Header() {
  const { fetchData, loading, lastUpdated } = useData();

  const handleRefresh = () => fetchData();

  const formattedTime = lastUpdated
    ? new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
        hour12: false,
      }).format(new Date(lastUpdated))
    : null;

  return (
    <header className="hof-header">
      {/* Top glow line */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #00d4ff, #00ff88, #00d4ff, transparent)' }} />

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px' }}>
        {/* Main header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', gap: '16px', flexWrap: 'wrap' }}>
          {/* Logo + Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,100,180,0.3))',
              border: '1px solid rgba(0,212,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0,212,255,0.3)',
            }}>
              <Shield size={22} color="#00d4ff" />
            </div>
            <div>
              <h1 className="header-title" style={{ fontSize: 'clamp(18px, 3vw, 26px)', lineHeight: 1 }}>
                HOF ATTENDANCE
              </h1>
              <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'var(--text-muted)', fontFamily: 'Rajdhani', marginTop: '3px' }}>
                ALLIANCE WAR MANAGEMENT SYSTEM
              </div>
            </div>
          </motion.div>

          {/* Right side: timestamp + refresh */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            {formattedTime && (
              <div style={{
                background: 'rgba(0,212,255,0.05)',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontFamily: 'Rajdhani',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <Zap size={12} color="#00d4ff" />
                <span>Updated: <span style={{ color: 'var(--neon-blue)' }}>{formattedTime}</span></span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
              title="Refresh data"
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              <span>{loading ? 'LOADING...' : 'REFRESH'}</span>
            </button>
          </motion.div>
        </div>

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </header>
  );
}
