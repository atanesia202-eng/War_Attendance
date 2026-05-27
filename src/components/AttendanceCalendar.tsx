'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ActivityType, ACTIVITIES, DailyAttendance } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  dailyAttendance: DailyAttendance[];
}

const ACT_SHORT: Record<ActivityType, string> = {
  'AM Lab': 'AM\nLab',
  'AM Valley': 'AM\nVal',
  'PM Lab': 'PM\nLab',
  'PM Valley': 'PM\nVal',
  'W8+': 'W8+',
};

function AttCell({ val }: { val: boolean | null | undefined }) {
  if (val === true) return (
    <div className="att-true" title="Participated">✓</div>
  );
  if (val === false) return (
    <div className="att-false" title="Missed">✗</div>
  );
  return <div className="att-null" title="No data">–</div>;
}

const PAGE_SIZE = 14;

export default function AttendanceCalendar({ dailyAttendance }: Props) {
  const [page, setPage] = useState(0);

  // Filter days that have at least some data
  const daysWithData = dailyAttendance.filter(d =>
    ACTIVITIES.some(a => d.activities[a] !== null && d.activities[a] !== undefined)
  );

  const totalPages = Math.ceil(daysWithData.length / PAGE_SIZE);
  const pageData = daysWithData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (daysWithData.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
        <div style={{ fontFamily: 'Cinzel', color: 'var(--text-muted)', letterSpacing: '2px' }}>NO ATTENDANCE DATA</div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid rgba(0,212,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
      }}>
        <div>
          <div style={{ fontFamily: 'Cinzel', fontSize: '12px', letterSpacing: '3px', color: 'var(--neon-blue)' }}>
            ATTENDANCE CALENDAR
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {daysWithData.length} days tracked
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div className="att-true" style={{ width: '18px', height: '18px', fontSize: '10px' }}>✓</div>Joined
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div className="att-false" style={{ width: '18px', height: '18px', fontSize: '10px' }}>✗</div>Missed
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div className="att-null" style={{ width: '18px', height: '18px', fontSize: '9px' }}>–</div>N/A
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-primary"
              style={{ padding: '5px 8px', opacity: page === 0 ? 0.4 : 1 }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontFamily: 'Orbitron', fontSize: '11px', color: 'var(--text-muted)', minWidth: '60px', textAlign: 'center' }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="btn-primary"
              style={{ padding: '5px 8px', opacity: page === totalPages - 1 ? 0.4 : 1 }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={{
                padding: '10px 16px', background: 'rgba(0,212,255,0.04)',
                fontFamily: 'Cinzel', fontSize: '10px', letterSpacing: '2px',
                color: 'var(--neon-blue)', borderBottom: '1px solid rgba(0,212,255,0.15)',
                textAlign: 'left', whiteSpace: 'nowrap',
              }}>DATE</th>
              <th style={{
                padding: '10px 8px', background: 'rgba(0,212,255,0.04)',
                fontFamily: 'Cinzel', fontSize: '10px', letterSpacing: '1px',
                color: 'var(--text-muted)', borderBottom: '1px solid rgba(0,212,255,0.15)',
                textAlign: 'center', whiteSpace: 'nowrap',
              }}>DAY</th>
              {ACTIVITIES.map(act => (
                <th key={act} style={{
                  padding: '10px 12px', background: 'rgba(0,212,255,0.04)',
                  fontFamily: 'Cinzel', fontSize: '10px', letterSpacing: '1px',
                  color: 'var(--neon-blue)', borderBottom: '1px solid rgba(0,212,255,0.15)',
                  textAlign: 'center', whiteSpace: 'pre-line',
                }}>{ACT_SHORT[act]}</th>
              ))}
              <th style={{
                padding: '10px 12px', background: 'rgba(0,212,255,0.04)',
                fontFamily: 'Cinzel', fontSize: '10px', letterSpacing: '1px',
                color: 'var(--neon-gold)', borderBottom: '1px solid rgba(0,212,255,0.15)',
                textAlign: 'center',
              }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((day, i) => {
              const dayTotal = ACTIVITIES.filter(a => day.activities[a] === true).length;
              const dayTracked = ACTIVITIES.filter(a => day.activities[a] !== null && day.activities[a] !== undefined).length;
              return (
                <motion.tr
                  key={day.date}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025 }}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    background: dayTotal === dayTracked && dayTracked > 0
                      ? 'rgba(0,255,136,0.03)'
                      : dayTotal === 0 && dayTracked > 0
                        ? 'rgba(255,34,68,0.03)'
                        : 'transparent',
                  }}
                >
                  <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontFamily: 'Orbitron', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {day.date}
                    </div>
                    {day.week && (
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{day.week}</div>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>
                      {day.dayOfWeek?.slice(0, 3) || ''}
                    </span>
                  </td>
                  {ACTIVITIES.map(act => (
                    <td key={act} style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <AttCell val={day.activities[act]} />
                    </td>
                  ))}
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    {dayTracked > 0 ? (
                      <span style={{
                        fontFamily: 'Orbitron', fontSize: '12px', fontWeight: 700,
                        color: dayTotal === dayTracked ? 'var(--neon-green)' : dayTotal === 0 ? 'var(--neon-red)' : '#ffb400',
                      }}>
                        {dayTotal}/{dayTracked}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
