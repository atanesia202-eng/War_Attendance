'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Star, Sword, Check, X, Download } from 'lucide-react';
import { Player, ACTIVITIES } from '@/lib/types';

interface Props {
  player: Player;
}

// ─── Palette (plain hex – safe for html2canvas) ───────────────────────────
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

function statusHex(status: string) {
  if (status === 'active')  return C.green;
  if (status === 'warning') return C.amber;
  return C.red;
}

// ─── Off-screen export card builder ───────────────────────────────────────
async function buildExportImage(player: Player, rows: typeof player.dailyAttendance) {
  const html2canvas = (await import('html2canvas')).default;

  const wrap = document.createElement('div');
  wrap.style.cssText = `
    position:fixed; top:-9999px; left:-9999px;
    width:760px;
    background:${C.bg};
    font-family:Inter,-apple-system,sans-serif;
    color:${C.textPri};
    padding:28px;
    border-radius:16px;
  `;

  const avatarHue = [...player.ign].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const sc = statusHex(player.status);
  const statusLabel = player.status === 'active' ? 'ACTIVE' : player.status === 'warning' ? 'WARNING' : 'INACTIVE';

  // ── Header card ──
  const header = `
    <div style="display:flex;align-items:center;gap:20px;padding:20px;
                background:${C.card};border-radius:12px;border:1px solid ${C.border};
                margin-bottom:16px;">
      <!-- Avatar -->
      <div style="width:72px;height:72px;border-radius:12px;flex-shrink:0;
                  background:linear-gradient(135deg,hsl(${avatarHue},60%,12%),hsl(${(avatarHue+40)%360},60%,22%));
                  border:2px solid hsl(${avatarHue},55%,38%);
                  display:flex;align-items:center;justify-content:center;
                  font-size:26px;font-weight:700;color:hsl(${avatarHue},80%,80%);">
        ${player.ign.slice(0,1).toUpperCase()}
      </div>
      <!-- Info -->
      <div style="flex:1;">
        <div style="font-size:22px;font-weight:800;color:#ffffff;margin-bottom:10px;">
          ${player.ign}
          <span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;margin-left:10px;
                        background:${sc}22;border:1px solid ${sc}66;color:${sc};">
            ${statusLabel}
          </span>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <span style="background:#ffffff0a;border:1px solid #ffffff10;border-radius:6px;padding:4px 10px;
                       font-size:12px;color:${C.gold};">
            ⭐ LV ${player.level || '—'}
          </span>
          <span style="background:#ffffff0a;border:1px solid #ffffff10;border-radius:6px;padding:4px 10px;
                       font-size:12px;color:${C.textSec};">
            ⚔️ ${player.powerScore || '—'}
          </span>
          <span style="background:#ffffff0a;border:1px solid #ffffff10;border-radius:6px;padding:4px 10px;
                       font-size:12px;color:${C.blue};">
            🛡 S${player.server}
          </span>
          ${player.ms ? `<span style="background:${C.blue}12;border:1px solid ${C.blue}44;border-radius:6px;padding:4px 10px;font-size:12px;color:${C.blue};">MS${player.ms}</span>` : ''}
          ${player.sp ? `<span style="background:${C.purple}12;border:1px solid ${C.purple}44;border-radius:6px;padding:4px 10px;font-size:12px;color:${C.purple};">SP${player.sp}</span>` : ''}
        </div>
      </div>
    </div>`;

  // ── Stats row ──
  const stats = `
    <div style="display:flex;gap:12px;margin-bottom:16px;">
      <div style="flex:1;padding:14px;background:${C.card};border-radius:10px;border:1px solid ${C.border};text-align:center;">
        <div style="font-size:10px;color:${C.textMut};letter-spacing:1px;margin-bottom:6px;">ATTENDANCE RATE</div>
        <div style="font-size:24px;font-weight:800;color:${sc};">${player.attendancePercentNum.toFixed(1)}%</div>
      </div>
      <div style="flex:1;padding:14px;background:${C.card};border-radius:10px;border:1px solid ${C.border};text-align:center;">
        <div style="font-size:10px;color:${C.textMut};letter-spacing:1px;margin-bottom:6px;">JOINED</div>
        <div style="font-size:24px;font-weight:800;color:${C.green};">${player.attended}</div>
      </div>
      <div style="flex:1;padding:14px;background:${C.card};border-radius:10px;border:1px solid ${C.border};text-align:center;">
        <div style="font-size:10px;color:${C.textMut};letter-spacing:1px;margin-bottom:6px;">MISSED</div>
        <div style="font-size:24px;font-weight:800;color:${C.red};">${player.total - player.attended}</div>
      </div>
    </div>`;

  // ── Calendar table ──
  const actCols = ACTIVITIES.map(a =>
    `<th style="padding:10px 12px;text-align:center;font-size:11px;color:${C.blue};
                background:#0a1520;border-bottom:1px solid ${C.border}22;font-weight:600;">
      ${a}
    </th>`
  ).join('');

  const rowsHtml = rows.map(day => {
    const dateParts = day.date.split('/').slice(0, 2).join('/');
    const dow = day.dayOfWeek?.slice(0, 3) || '';
    const cells = ACTIVITIES.map(act => {
      const v = day.activities[act];
      const icon = v === true ? `<span style="color:${C.green};font-size:16px;font-weight:700;">✓</span>`
                 : v === false ? `<span style="color:${C.red};font-size:16px;font-weight:700;">✗</span>`
                 : `<span style="color:#ffffff30;">—</span>`;
      return `<td style="padding:10px 12px;text-align:center;border-bottom:1px solid #ffffff06;">${icon}</td>`;
    }).join('');

    const total = ACTIVITIES.filter(a => day.activities[a] === true).length;
    const tracked = ACTIVITIES.filter(a => day.activities[a] !== null && day.activities[a] !== undefined).length;
    const totColor = total === tracked && tracked > 0 ? C.green : total === 0 && tracked > 0 ? C.red : C.amber;

    return `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #ffffff06;font-size:13px;
                   font-weight:600;color:${C.textPri};white-space:nowrap;">
          ${dateParts}
          <span style="font-size:11px;color:${C.textMut};margin-left:4px;">(${dow})</span>
        </td>
        ${cells}
        <td style="padding:10px 12px;text-align:center;border-bottom:1px solid #ffffff06;
                   font-size:13px;font-weight:700;color:${totColor};">
          ${tracked > 0 ? `${total}/${tracked}` : '—'}
        </td>
      </tr>`;
  }).join('');

  const table = `
    <div style="background:${C.card};border-radius:12px;border:1px solid ${C.border};overflow:hidden;">
      <div style="padding:14px 18px;border-bottom:1px solid ${C.border}44;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:13px;font-weight:700;color:${C.blue};letter-spacing:1px;">ATTENDANCE CALENDAR &amp; LOG</span>
        <span style="font-size:11px;color:${C.textMut};">${rows.length} day(s)</span>
      </div>
      <div style="overflow:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:10px 16px;text-align:left;font-size:11px;color:${C.textMut};
                          background:#0a1520;border-bottom:1px solid ${C.border}22;font-weight:600;">DATE</th>
              ${actCols}
              <th style="padding:10px 12px;text-align:center;font-size:11px;color:${C.gold};
                          background:#0a1520;border-bottom:1px solid ${C.border}22;font-weight:600;">TOTAL</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </div>`;

  // ── Watermark ──
  const watermark = `
    <div style="text-align:right;margin-top:14px;font-size:10px;color:${C.textMut};letter-spacing:1px;">
      HOF ATTENDANCE SYSTEM · ${new Date().toLocaleDateString('en-GB')}
    </div>`;

  wrap.innerHTML = header + stats + table + watermark;
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

// ─── Component ────────────────────────────────────────────────────────────
export default function RightProfilePanel({ player }: Props) {
  const avatarHue = [...player.ign].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  const statusColor = statusHex(player.status);
  const statusGlow  = player.status === 'active'  ? '0 0 20px rgba(0,255,136,0.3)'
                    : player.status === 'warning' ? '0 0 20px rgba(255,180,0,0.3)'
                    : '0 0 20px rgba(255,34,68,0.3)';

  const [exportMode, setExportMode] = useState<'all' | 'specific'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  const playerDailyAttendance = player.dailyAttendance || [];

  const pastDatesToToday = useMemo(() => {
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

  const generated8Days = useMemo(() => {
    const dates = [];
    const today = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    // -3 to +4 gives 8 days where today is row 4 (index 3)
    for (let i = -3; i <= 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
      const dayOfWeek = days[d.getDay()];
      
      const existing = playerDailyAttendance.find(att => {
         const parts = att.date.split('/');
         if (parts.length >= 2) {
             return parseInt(parts[0], 10) === d.getDate() && parseInt(parts[1], 10) === d.getMonth() + 1;
         }
         return false;
      });
      
      if (existing) {
        dates.push({ ...existing, date: dateStr, dayOfWeek });
      } else {
        dates.push({
          date: dateStr,
          dayOfWeek,
          week: '',
          activities: { 'AM Lab': null, 'AM Valley': null, 'PM Lab': null, 'PM Valley': null, 'W8+': null }
        });
      }
    }
    return dates;
  }, [playerDailyAttendance]);

  const displayedAttendance = useMemo(() => {
    if (exportMode === 'specific' && selectedDate) {
      const parts = selectedDate.split('/');
      const d = new Date(new Date().getFullYear(), parseInt(parts[1])-1, parseInt(parts[0]));
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const dayOfWeek = days[d.getDay()];

      const existing = playerDailyAttendance.find(att => {
         const p = att.date.split('/');
         return p.length >= 2 && parseInt(p[0], 10) === d.getDate() && parseInt(p[1], 10) === d.getMonth() + 1;
      });

      if (existing) return [{ ...existing, date: selectedDate, dayOfWeek }];
      return [{
          date: selectedDate,
          dayOfWeek,
          week: '',
          activities: { 'AM Lab': null, 'AM Valley': null, 'PM Lab': null, 'PM Valley': null, 'W8+': null }
      }];
    }
    return generated8Days;
  }, [exportMode, selectedDate, generated8Days, playerDailyAttendance]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const rows = displayedAttendance;
      const dataUrl = await buildExportImage(player, rows);
      const link = document.createElement('a');
      const suffix = (exportMode === 'specific' && selectedDate)
        ? `_${selectedDate.replace(/\//g, '-')}`
        : '_All';
      link.download = `${player.ign}_Attendance${suffix}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setExporting(false);
    }
  }, [player, exportMode, selectedDate, displayedAttendance]);

  return (
    <div className="space-y-6">
      {/* ── 1. Profile Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card"
        style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
      >
        {/* Top glow line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: `linear-gradient(90deg, transparent, ${statusColor}, transparent)`,
          boxShadow: statusGlow,
        }} />

        {/* ── Header: title + export controls ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
          <h3 style={{ fontFamily: 'Inter', fontSize: '14px', letterSpacing: '0.5px', color: C.blue, margin: 0 }}>
            CHARACTER OVERVIEW
          </h3>

          {/* Export controls */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Mode selector */}
            <select
              value={exportMode}
              onChange={e => { setExportMode(e.target.value as 'all' | 'specific'); setSelectedDate(''); }}
              style={{
                background: 'rgba(8,15,26,0.9)', border: `1px solid ${C.blue}44`,
                borderRadius: '6px', color: C.textPri, fontFamily: 'Inter',
                fontSize: '11px', padding: '6px 10px', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="all">Export All</option>
              <option value="specific">Export by Date</option>
            </select>

            {/* Date picker (only when specific) */}
            {exportMode === 'specific' && (
              <select
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{
                  background: 'rgba(8,15,26,0.9)', border: `1px solid ${C.blue}44`,
                  borderRadius: '6px', color: C.textPri, fontFamily: 'Inter',
                  fontSize: '11px', padding: '6px 10px', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="">— Select Date —</option>
                {pastDatesToToday.map(day => (
                  <option key={day.date} value={day.date}>
                    {day.date} ({day.dayOfWeek?.slice(0, 3) || ''})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleExport}
              disabled={exporting || (exportMode === 'specific' && !selectedDate)}
              className="btn-primary"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', fontSize: '11px', fontFamily: 'Inter', fontWeight: 600,
                opacity: (exporting || (exportMode === 'specific' && !selectedDate)) ? 0.5 : 1,
                cursor: (exporting || (exportMode === 'specific' && !selectedDate)) ? 'not-allowed' : 'pointer',
              }}
            >
              <Download size={12} />
              {exporting ? 'SAVING…' : 'EXPORT'}
            </button>
          </div>
        </div>

        {/* ── Avatar + Name + Tags ── */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '12px',
              background: `linear-gradient(135deg, hsl(${avatarHue},70%,15%), hsl(${(avatarHue+40)%360},70%,25%))`,
              border: `2px solid hsl(${avatarHue},60%,40%)`,
              boxShadow: `0 0 20px hsl(${avatarHue},60%,30%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontFamily: 'Inter', fontWeight: 700,
              color: `hsl(${avatarHue},80%,85%)`, userSelect: 'none',
            }}>
              {player.ign.slice(0,1).toUpperCase()}
            </div>
            <div style={{
              position: 'absolute', bottom: '2px', right: '2px',
              width: '12px', height: '12px', borderRadius: '50%',
              background: statusColor, boxShadow: statusGlow,
              border: '2px solid #0d1829',
            }} />
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '24px', color: '#fff', margin: '0 0 8px 0' }}>
              {player.ign}
            </h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={11} color={C.gold} />
                <span style={{ fontSize: '11px', color: C.textMut }}>LV:</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: C.gold }}>{player.level || '—'}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sword size={11} color={C.red} />
                <span style={{ fontSize: '11px', color: C.textMut }}>PS:</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: C.textSec }}>{player.powerScore || '—'}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={11} color={C.blue} />
                <span style={{ fontSize: '11px', color: C.textMut }}>SERVER:</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: C.blue }}>S{player.server}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MS / SP ── */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
          <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,212,255,0.05)', border: `1px solid ${C.blue}33`, padding: '10px', borderRadius: '8px' }}>
            <div style={{ fontSize: '9px', color: C.textMut, letterSpacing: '0.5px', marginBottom: '4px' }}>MS</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: C.blue }}>{player.ms || '—'}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: 'rgba(191,0,255,0.05)', border: `1px solid ${C.purple}33`, padding: '10px', borderRadius: '8px' }}>
            <div style={{ fontSize: '9px', color: C.textMut, letterSpacing: '0.5px', marginBottom: '4px' }}>SP</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: C.purple }}>{player.sp || '—'}</div>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Attendance Calendar & Log ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="glass-card"
        style={{ padding: '28px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
          <h3 style={{ fontFamily: 'Inter', fontSize: '15px', letterSpacing: '0.5px', color: C.blue, margin: 0, fontWeight: 700 }}>
            ATTENDANCE CALENDAR &amp; LOG
          </h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: C.textMut }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: C.green, display: 'inline-block' }} /> JOINED
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: C.textMut }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: C.red, display: 'inline-block' }} /> MISSED
            </div>
          </div>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: '500px' }} className="scrollbar-fantasy">
          <table className="hof-table" style={{ margin: 0 }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10 }}>
                <th style={{ fontSize: '12px', fontFamily: 'Inter', color: C.textMut, fontWeight: 600, padding: '14px 12px' }}>DATE</th>
                {ACTIVITIES.map(act => (
                  <th key={act} style={{ textAlign: 'center', fontSize: '12px', fontFamily: 'Inter', color: C.textPri, fontWeight: 600, padding: '14px 8px' }}>
                    {act}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedAttendance.map((day, idx) => (
                <tr key={day.date + idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ fontSize: '14px', fontFamily: 'Inter', fontWeight: 600, color: C.textPri, padding: '14px 12px', whiteSpace: 'nowrap' }}>
                    {day.date.split('/').slice(0, 2).join('/')}{' '}
                    <span style={{ fontSize: '12px', color: C.textMut }}>({day.dayOfWeek?.slice(0, 3) || ''})</span>
                  </td>
                  {ACTIVITIES.map(act => {
                    const status = day.activities[act];
                    return (
                      <td key={act} style={{ textAlign: 'center', padding: '12px 8px' }}>
                        {status === true ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,255,136,0.2)', border: `2px solid rgba(0,255,136,0.55)`, boxShadow: '0 0 10px rgba(0,255,136,0.3)' }}>
                            <Check size={16} color={C.green} strokeWidth={3} />
                          </div>
                        ) : status === false ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,34,68,0.2)', border: `2px solid rgba(255,34,68,0.55)`, boxShadow: '0 0 10px rgba(255,34,68,0.3)' }}>
                            <X size={16} color={C.red} strokeWidth={3} />
                          </div>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '16px' }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {displayedAttendance.length === 0 && (
                <tr>
                  <td colSpan={ACTIVITIES.length + 1} style={{ padding: '32px', textAlign: 'center', color: C.textMut, fontSize: '14px' }}>
                    NO LOGS FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── 3. Attendance Summary ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="glass-card"
        style={{ padding: '24px' }}
      >
        <h3 style={{ fontFamily: 'Inter', fontSize: '13px', letterSpacing: '0.5px', color: C.blue,
                     marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
          ATTENDANCE SUMMARY
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="hof-table" style={{ margin: 0 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={{ fontSize: '10px', fontFamily: 'Inter', color: C.textMut }}>STATISTIC</th>
                {ACTIVITIES.map(act => (
                  <th key={act} style={{ textAlign: 'center', fontSize: '10px', fontFamily: 'Inter', color: C.textPri }}>{act}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ fontSize: '11px', fontWeight: 600, color: C.textMut }}>JOINED</td>
                {ACTIVITIES.map(act => (
                  <td key={act} style={{ textAlign: 'center', fontSize: '12px', color: C.green }}>{player.activityStats[act]?.joined ?? 0}</td>
                ))}
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ fontSize: '11px', fontWeight: 600, color: C.textMut }}>MISSED</td>
                {ACTIVITIES.map(act => (
                  <td key={act} style={{ textAlign: 'center', fontSize: '12px', color: C.red }}>{player.activityStats[act]?.missed ?? 0}</td>
                ))}
              </tr>
              <tr>
                <td style={{ fontSize: '11px', fontWeight: 600, color: C.textMut }}>RATE</td>
                {ACTIVITIES.map(act => {
                  const pct = player.activityStats[act]?.percentage ?? 0;
                  const col = pct >= 70 ? C.green : pct >= 40 ? C.amber : C.red;
                  return (
                    <td key={act} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: col }}>{pct}%</td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
