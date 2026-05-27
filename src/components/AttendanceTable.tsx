'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Download, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Player, ACTIVITIES } from '@/lib/types';
import SearchBar from './SearchBar';

interface Props {
  players: Player[];
  selectedIgn?: string;
  onSelectPlayer?: (ign: string) => void;
}

type SortKey = 'rank' | 'ign' | 'level' | 'powerScore' | 'server' | 'attendancePercentNum' | 'attended';
type SortDir = 'asc' | 'desc';

// ─── Off-screen Custom Export Builder ─────────────────────────────────────
const C = {
  bg:       '#080f1a',
  card:     '#0d1829',
  border:   '#1a3050',
  blue:     '#00d4ff',
  green:    '#00ff88',
  red:      '#ff2244',
  gold:     '#ffd700',
  purple:   '#bf00ff',
  amber:    '#ffb400',
  textPri:  '#e8f4ff',
  textSec:  '#8ab4cf',
  textMut:  '#4a6b80',
};

async function buildGroupExportImage(players: Player[], date: string, dayOfWeek: string) {
  const html2canvas = (await import('html2canvas')).default;
  const wrap = document.createElement('div');
  
  wrap.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    width: 1280px;
    background: ${C.bg};
    font-family: Inter, sans-serif;
    color: ${C.textPri};
    padding: 40px;
    border-radius: 16px;
  `;

  const header = `
    <div style="text-align:center; margin-bottom: 28px;">
      <h1 style="font-size: 36px; font-weight: 700; color: ${C.blue}; margin: 0; text-transform: capitalize;">
        ${dayOfWeek} <span style="color: ${C.textPri};">${date}</span>
      </h1>
    </div>
  `;

  const actCols = ACTIVITIES.map(a => 
    `<th style="padding:14px; text-align:center; color:${C.blue}; border-bottom:1px solid ${C.border}; font-size:12px; font-weight:600; text-transform:uppercase; width:100px;">${a}</th>`
  ).join('');

  const rowsHtml = players.map((p, i) => {
    const att = p.dailyAttendance?.find(d => d.date === date);
    const acts = att ? att.activities : {};
    
    const rankHtml = `<td style="padding:12px; text-align:center; border-bottom:1px solid #ffffff06; width:50px;">
      ${i+1 === 1 ? `<span style="color:${C.gold}; font-weight:700;">1</span>` : 
        i+1 === 2 ? `<span style="color:#c0c0c0; font-weight:700;">2</span>` : 
        i+1 === 3 ? `<span style="color:#cd7f32; font-weight:700;">3</span>` : 
        `<span style="color:${C.textMut}; font-size:14px;">${i+1}</span>`}
    </td>`;
    
    const ignHtml = `<td style="padding:12px; border-bottom:1px solid #ffffff06; text-align:left; min-width:180px;">
      <span style="font-weight:700; font-size:16px; color:#ffffff;">${p.ign}</span>
    </td>`;

    const msHtml = `<td style="padding:12px; text-align:center; border-bottom:1px solid #ffffff06; width:70px;">
      ${p.ms ? `<div style="display:inline-flex; align-items:center; justify-content:center; font-weight:600; color:${C.blue}; background:${C.blue}12; border:1px solid ${C.blue}33; border-radius:6px; font-size:11px; font-family:Inter,sans-serif; height:20px; width:40px; vertical-align:middle;"><span style="position:relative; top:-7px;">MS${p.ms}</span></div>` : '<span style="color:#ffffff15;">—</span>'}
    </td>`;

    const spHtml = `<td style="padding:12px; text-align:center; border-bottom:1px solid #ffffff06; width:70px;">
      ${p.sp ? `<div style="display:inline-flex; align-items:center; justify-content:center; font-weight:600; color:${C.purple}; background:${C.purple}12; border:1px solid ${C.purple}33; border-radius:6px; font-size:11px; font-family:Inter,sans-serif; height:20px; width:40px; vertical-align:middle;"><span style="position:relative; top:-7px;">SP${p.sp}</span></div>` : '<span style="color:#ffffff15;">—</span>'}
    </td>`;

    const lvHtml = `<td style="padding:12px; text-align:center; border-bottom:1px solid #ffffff06; color:${C.gold}; font-weight:600; font-size:14px; width:60px;">${p.level || '—'}</td>`;
    const psHtml = `<td style="padding:12px; text-align:center; border-bottom:1px solid #ffffff06; color:${C.textSec}; font-size:14px; width:130px;">${p.powerScore || '—'}</td>`;
    
    const svrColor = p.server === '23' ? C.blue : C.purple;
    const svHtml = `<td style="padding:12px; text-align:center; border-bottom:1px solid #ffffff06; width:90px;">
      <div style="display:inline-flex; align-items:center; justify-content:center; color:${svrColor}; background:${svrColor}15; border:1px solid ${svrColor}44; border-radius:6px; font-size:12px; font-weight:600; height:20px; width:40px; vertical-align:middle;"><span style="position:relative; top:-7px;">S${p.server}</span></div>
    </td>`;

    const actCells = ACTIVITIES.map(a => {
      const v = acts[a];
      let icon = `<span style="color:#ffffff15; font-size:18px;">—</span>`;
      if (v === true) {
        icon = `<div style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:${C.green}15; border:2px solid ${C.green}55; color:${C.green}; font-weight:bold; font-size:15px; font-family:system-ui, -apple-system, sans-serif; box-sizing:border-box; vertical-align:middle;"><span style="position:relative; top:-10px;">✓</span></div>`;
      }
      if (v === false) {
        icon = `<div style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:${C.red}15; border:2px solid ${C.red}55; color:${C.red}; font-weight:bold; font-size:15px; font-family:system-ui, -apple-system, sans-serif; box-sizing:border-box; vertical-align:middle;"><span style="position:relative; top:-10px;">✗</span></div>`;
      }
      return `<td style="padding:12px; text-align:center; border-bottom:1px solid #ffffff06; width:100px;">${icon}</td>`;
    }).join('');

    return `<tr>${rankHtml}${ignHtml}${msHtml}${spHtml}${lvHtml}${psHtml}${svHtml}${actCells}</tr>`;
  }).join('');

  const table = `
    <div style="background:${C.card}; border:1px solid ${C.border}; border-radius:12px; overflow:hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="background:rgba(0, 212, 255, 0.05);">
            <th style="padding:14px; border-bottom:1px solid ${C.border}; color:${C.textMut}; font-size:12px; font-weight:600; width:50px; text-align:center;">#</th>
            <th style="padding:14px; border-bottom:1px solid ${C.border}; color:${C.textMut}; font-size:12px; text-align:left; font-weight:600; min-width:180px;">CHARACTER</th>
            <th style="padding:14px; border-bottom:1px solid ${C.border}; color:${C.textMut}; font-size:12px; font-weight:600; width:70px; text-align:center;">MS</th>
            <th style="padding:14px; border-bottom:1px solid ${C.border}; color:${C.textMut}; font-size:12px; font-weight:600; width:70px; text-align:center;">SP</th>
            <th style="padding:14px; border-bottom:1px solid ${C.border}; color:${C.textMut}; font-size:12px; font-weight:600; width:60px; text-align:center;">LV</th>
            <th style="padding:14px; border-bottom:1px solid ${C.border}; color:${C.textMut}; font-size:12px; font-weight:600; width:130px; text-align:center;">POWER SCORE</th>
            <th style="padding:14px; border-bottom:1px solid ${C.border}; color:${C.textMut}; font-size:12px; font-weight:600; width:90px; text-align:center;">SERVER</th>
            ${actCols}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
    <div style="text-align:right;margin-top:16px;font-size:11px;color:${C.textMut};letter-spacing:1px;font-weight:500;">
      HOF ATTENDANCE · FILTERS APPLIED · ${players.length} MEMBERS
    </div>
  `;

  wrap.innerHTML = header + table;
  document.body.appendChild(wrap);
  
  try {
    const canvas = await html2canvas(wrap, {
      backgroundColor: C.bg,
      scale: 2,
      useCORS: true,
      logging: false,
    });
    return canvas.toDataURL('image/png');
  } finally {
    document.body.removeChild(wrap);
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function ProgressBar({ pct, status }: { pct: number; status: string }) {
  const cls = status === 'active' ? 'progress-bar-fill-green'
    : status === 'warning' ? 'progress-bar-fill-yellow'
      : 'progress-bar-fill-red';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
      <div className="progress-bar-track" style={{ flex: 1 }}>
        <motion.div
          className={cls}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct * 10, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span style={{
        fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: 600, minWidth: '42px',
        color: status === 'active' ? 'var(--neon-green)' : status === 'warning' ? '#ffb400' : 'var(--neon-red)',
      }}>
        {pct.toFixed(2)}%
      </span>
    </div>
  );
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={12} style={{ opacity: 0.3, marginLeft: 4 }} />;
  return sortDir === 'asc'
    ? <ChevronUp size={12} style={{ color: 'var(--neon-blue)', marginLeft: 4 }} />
    : <ChevronDown size={12} style={{ color: 'var(--neon-blue)', marginLeft: 4 }} />;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Crown size={14} color="#ffd700" />
      <span className="rank-1" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '13px' }}>1</span>
    </div>
  );
  if (rank === 2) return <span className="rank-2" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '13px' }}>2</span>;
  if (rank === 3) return <span className="rank-3" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '13px' }}>3</span>;
  return <span style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-muted)' }}>{rank}</span>;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AttendanceTable({ players, selectedIgn, onSelectPlayer }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [serverFilter, setServerFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('attendancePercentNum');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  
  // Custom Export States
  const [exportDate, setExportDate] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const allNames = useMemo(() => players.map(p => p.ign), [players]);

  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    // Generate past 30 days up to today
    for (let i = -30; i <= 0; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
      const dayOfWeek = days[d.getDay()];
      dates.push({ date: dateStr, dayOfWeek });
    }
    
    return dates.reverse(); // Today first
  }, []);

  const filtered = useMemo(() => {
    let list = [...players];
    if (search.trim()) list = list.filter(p => p.ign.toLowerCase().includes(search.toLowerCase()));
    if (serverFilter !== 'All') list = list.filter(p => p.server === serverFilter);
    list.sort((a, b) => {
      let av: string | number = a[sortKey] ?? '';
      let bv: string | number = b[sortKey] ?? '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [players, search, serverFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleRowClick = (ign: string) => {
    if (onSelectPlayer) {
      onSelectPlayer(ign);
    } else {
      router.push(`/player/${encodeURIComponent(ign)}`);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      if (exportDate === 'all') {
        // Normal table UI export
        if (tableRef.current) {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(tableRef.current, {
            backgroundColor: '#0f172a',
            scale: 2,
            useCORS: true,
            logging: false,
          });
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `HOF_Overview_${new Date().toISOString().slice(0, 10)}.png`;
          link.href = dataUrl;
          link.click();
        }
      } else {
        // Custom date export for all filtered users
        const dObj = availableDates.find(d => d.date === exportDate);
        if (dObj) {
          const dataUrl = await buildGroupExportImage(filtered, dObj.date, dObj.dayOfWeek);
          const link = document.createElement('a');
          link.download = `HOF_Attendance_${exportDate.replace(/\//g, '-')}.png`;
          link.href = dataUrl;
          link.click();
        }
      }
    } catch (e) {
      console.error('Export failed:', e);
    }
    setExporting(false);
  };

  const thStyle: React.CSSProperties = { cursor: 'pointer', userSelect: 'none' };

  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px',
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', flex: 1 }}>
          <SearchBar players={allNames} value={search} onChange={setSearch} />

          {/* Server filter */}
          <div style={{ position: 'relative' }}>
            <select
              id="server-filter"
              className="hof-select"
              value={serverFilter}
              onChange={e => setServerFilter(e.target.value)}
            >
              <option value="All">All Servers</option>
              <option value="23">Server 23</option>
              <option value="24">Server 24</option>
            </select>
            <ChevronDown size={14} color="#4a6b80" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Sort filter */}
          <div style={{ position: 'relative' }}>
            <select
              id="sort-filter"
              className="hof-select"
              value={`${sortKey}-${sortDir}`}
              onChange={e => {
                const [k, d] = e.target.value.split('-');
                setSortKey(k as SortKey);
                setSortDir(d as SortDir);
              }}
            >
              <option value="attendancePercentNum-desc">Attendance ↓ High</option>
              <option value="attendancePercentNum-asc">Attendance ↑ Low</option>
              <option value="attended-desc">Sessions ↓</option>
              <option value="attended-asc">Sessions ↑</option>
              <option value="powerScore-desc">Power Score ↓</option>
              <option value="ign-asc">Name A→Z</option>
            </select>
            <ChevronDown size={14} color="#4a6b80" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Export Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Inter' }}>
            <span style={{ color: 'var(--neon-blue)' }}>{filtered.length}</span> / {players.length} members
          </span>
          
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <select
              value={exportDate}
              onChange={e => setExportDate(e.target.value)}
              style={{
                background: 'rgba(8,15,26,0.9)', border: '1px solid rgba(0,212,255,0.3)',
                borderRadius: '6px', color: 'var(--text-primary)', fontFamily: 'Inter',
                fontSize: '11px', padding: '6px 8px', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="all">Export UI</option>
              {availableDates.map(d => (
                <option key={d.date} value={d.date}>Export {d.date}</option>
              ))}
            </select>
            <button 
              onClick={handleExport} 
              disabled={exporting}
              className="btn-primary" 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', 
                padding: '7px 12px', fontSize: '12px',
                opacity: exporting ? 0.5 : 1, cursor: exporting ? 'not-allowed' : 'pointer'
              }}
            >
              <Download size={13} />
              {exporting ? 'EXPORTING...' : 'EXPORT'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div ref={tableRef} style={{ overflowX: 'auto' }}>
        <table className="hof-table">
          <thead>
            <tr>
              <th style={thStyle} onClick={() => handleSort('rank')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>#<SortIcon col="rank" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('ign')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Character<SortIcon col="ign" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('level')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Lv<SortIcon col="level" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('powerScore')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Power Score<SortIcon col="powerScore" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('server')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Server<SortIcon col="server" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('attended')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Sessions<SortIcon col="attended" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('attendancePercentNum')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>Attendance<SortIcon col="attendancePercentNum" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.ign}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4), duration: 0.25 }}
                  onClick={() => handleRowClick(p.ign)}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: selectedIgn === p.ign ? 'rgba(0,212,255,0.08)' : 'transparent',
                    boxShadow: selectedIgn === p.ign ? 'inset 2px 0 0 0 var(--neon-blue)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <td style={{ width: '48px' }}><RankBadge rank={i + 1} /></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>{p.ign}</span>
                      {(p.ms || p.sp) && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {p.ms && <span style={{ fontSize: '10px', color: 'var(--neon-blue)', background: 'rgba(0,212,255,0.08)', padding: '1px 5px', borderRadius: '3px' }}>MS{p.ms}</span>}
                          {p.sp && <span style={{ fontSize: '10px', color: '#bf00ff', background: 'rgba(191,0,255,0.08)', padding: '1px 5px', borderRadius: '3px' }}>SP{p.sp}</span>}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', color: p.level ? 'var(--neon-gold)' : 'var(--text-muted)' }}>
                      {p.level || '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {p.powerScore || '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontFamily: 'Inter', fontWeight: 600,
                      background: p.server === '23' ? 'rgba(0,212,255,0.1)' : 'rgba(191,0,255,0.1)',
                      border: `1px solid ${p.server === '23' ? 'rgba(0,212,255,0.25)' : 'rgba(191,0,255,0.25)'}`,
                      color: p.server === '23' ? 'var(--neon-blue)' : '#bf00ff',
                    }}>
                      S{p.server}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {p.attended}<span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>/{p.total}</span>
                    </span>
                  </td>
                  <td style={{ minWidth: '180px' }}>
                    <ProgressBar pct={p.attendancePercentNum} status={p.status} />
                  </td>
                  <td>
                    <span className={`status-${p.status}`} style={{
                      padding: '3px 10px', borderRadius: '4px', fontSize: '11px',
                      fontFamily: 'Inter', letterSpacing: '0.5px', fontWeight: 600,
                    }}>
                      {p.status === 'active' ? 'ACTIVE' : p.status === 'warning' ? 'WARNING' : 'INACTIVE'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚔️</div>
            <div style={{ fontFamily: 'Inter', fontSize: '14px', letterSpacing: '0.5px' }}>NO MEMBERS FOUND</div>
          </div>
        )}
      </div>
    </div>
  );
}
