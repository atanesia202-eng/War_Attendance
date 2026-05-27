'use client';

import { motion } from 'framer-motion';
import { ACTIVITIES, ActivityType, DailyAttendance } from '@/lib/types';

interface Props {
  dailyAttendance: DailyAttendance[];
  ign: string;
}

export default function AttendanceHeatmap({ dailyAttendance, ign }: Props) {
  // Build a flat list of cells: one per (date × activity)
  const daysWithData = dailyAttendance.filter(d =>
    ACTIVITIES.some(a => d.activities[a] !== null && d.activities[a] !== undefined)
  );

  if (daysWithData.length === 0) return null;

  // color per cell
  const cellColor = (val: boolean | null | undefined) => {
    if (val === true)  return { bg: 'rgba(0,255,136,0.75)', shadow: '0 0 6px rgba(0,255,136,0.6)' };
    if (val === false) return { bg: 'rgba(255,34,68,0.45)',  shadow: 'none' };
    return { bg: 'rgba(255,255,255,0.04)', shadow: 'none' };
  };

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontFamily: 'Cinzel', fontSize: '12px', letterSpacing: '3px', color: 'var(--neon-blue)' }}>
          ATTENDANCE HEATMAP
        </div>
        <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-muted)', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(0,255,136,0.75)', display: 'inline-block' }} />
            Joined
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(255,34,68,0.45)', display: 'inline-block' }} />
            Missed
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'inline-block' }} />
            N/A
          </span>
        </div>
      </div>
      <div className="divider-glow" style={{ marginBottom: '16px' }} />

      {/* Activity labels on left + grid */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {/* Y-axis labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '20px' }}>
          {ACTIVITIES.map(act => (
            <div key={act} style={{
              height: '14px', fontSize: '9px', color: 'var(--text-muted)',
              fontFamily: 'Rajdhani', letterSpacing: '1px',
              display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
              width: '52px', justifyContent: 'flex-end', paddingRight: '6px',
            }}>
              {act}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowX: 'auto' }}>
          {/* Date labels */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px', paddingLeft: '0' }}>
            {daysWithData.map(day => (
              <div key={day.date} style={{
                width: '14px', fontSize: '8px', color: 'var(--text-muted)',
                textAlign: 'center', lineHeight: '1.2',
                flexShrink: 0,
              }}>
                {day.date.slice(0, day.date.indexOf('/'))}
              </div>
            ))}
          </div>

          {/* Heatmap cells — rows = activities, cols = dates */}
          {ACTIVITIES.map((act, ai) => (
            <div key={act} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              {daysWithData.map((day, di) => {
                const val = day.activities[act];
                const c = cellColor(val);
                return (
                  <motion.div
                    key={`${day.date}-${act}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (di * 5 + ai) * 0.004, duration: 0.2 }}
                    className="heatmap-cell"
                    style={{ background: c.bg, boxShadow: c.shadow, flexShrink: 0 }}
                    title={`${day.date} – ${act}: ${val === true ? '✓ Joined' : val === false ? '✗ Missed' : 'N/A'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {daysWithData.map(day => {
          const joined = ACTIVITIES.filter(a => day.activities[a] === true).length;
          const tracked = ACTIVITIES.filter(a => day.activities[a] !== null && day.activities[a] !== undefined).length;
          const pct = tracked > 0 ? joined / tracked : 0;
          const bg = pct >= 0.8 ? 'rgba(0,255,136,0.2)' : pct >= 0.4 ? 'rgba(255,180,0,0.15)' : pct > 0 ? 'rgba(255,34,68,0.15)' : 'rgba(255,255,255,0.03)';
          return (
            <div key={day.date} style={{
              width: '14px', height: '14px', borderRadius: '3px',
              background: bg, flexShrink: 0,
            }} title={`${day.date}: ${joined}/${tracked}`} />
          );
        })}
      </div>
      <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>
        Daily participation rate (bottom row)
      </div>
    </div>
  );
}
