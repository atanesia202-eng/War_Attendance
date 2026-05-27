import { Player, ActivityType, ACTIVITIES, DailyAttendance, HOFStats, SheetData } from './types';

export function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export function extractGid(url: string): string | null {
  const match = url.match(/[?&#]gid=(\d+)/);
  return match ? match[1] : null;
}

export function buildCsvUrl(sheetUrl: string): string {
  const id = extractSheetId(sheetUrl);
  const gid = extractGid(sheetUrl);
  if (!id) return sheetUrl;
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gid ? `&gid=${gid}` : ''}`;
}

function parseBoolean(val: string): boolean | null {
  if (val === 'TRUE') return true;
  if (val === 'FALSE') return false;
  return null;
}

function parseAttendancePercent(val: string): number {
  if (!val) return 0;
  return parseFloat(val.replace('%', '')) || 0;
}

function getStatus(pct: number): 'active' | 'warning' | 'inactive' {
  if (pct >= 3) return 'active';
  if (pct >= 1) return 'warning';
  return 'inactive';
}

export function parseCSV(csvText: string): SheetData {
  // Split into lines, handle \r\n
  const rawLines = csvText.split(/\r?\n/);
  
  // Find the header rows by scanning for known patterns
  // Row 0 (index 0): dates row — starts with "May 2026" or similar month
  // Row 1 (index 1): week labels (W1, W3, etc.)
  // Row 2 (index 2): day-of-week labels (SUNDAY, MONDAY, ...)
  // Row 3 (index 3): activity labels (AM Lab, AM Valley, ...)
  // Row 4 (index 4): data header: SP/MS RANKING, IGN, PS, LEVEL, MS, SP, Server, ATTENDED, TOTAL, % Attendance, ...
  // Rows 5+: player data

  // Parse each line into cells
  const allRows: string[][] = rawLines.map(line => parseCsvLine(line));

  // Find the index of the data header row (contains "IGN")
  let headerRowIdx = -1;
  for (let i = 0; i < allRows.length; i++) {
    if (allRows[i].some(cell => cell.trim() === 'IGN')) {
      headerRowIdx = i;
      break;
    }
  }

  if (headerRowIdx < 0) {
    return { players: [], stats: computeStats([]), lastUpdated: new Date().toISOString(), dates: [] };
  }

  const datesRow = allRows[headerRowIdx - 4] || [];
  const weekRow = allRows[headerRowIdx - 3] || [];
  const dowRow = allRows[headerRowIdx - 2] || [];
  const activityRow = allRows[headerRowIdx - 1] || [];
  const dataHeaderRow = allRows[headerRowIdx];

  // Fixed columns: SP/MS RANKING(0), IGN(1), PS(2), LEVEL(3), MS(4), SP(5), Server(6), ATTENDED(7), TOTAL(8), %Attendance(9)
  const DATA_START_COL = 10; // activity columns start here

  // Build date/activity map from activity columns
  interface ColMeta {
    date: string;
    dayOfWeek: string;
    week: string;
    activity: ActivityType;
  }
  const colMeta: ColMeta[] = [];

  let currentDate = '';
  let currentWeek = '';
  let currentDow = '';

  for (let col = DATA_START_COL; col < activityRow.length; col++) {
    const dateCell = datesRow[col]?.trim() || '';
    const weekCell = weekRow[col]?.trim() || '';
    const dowCell = dowRow[col]?.trim() || '';
    const actCell = activityRow[col]?.trim() || '';

    if (dateCell) currentDate = dateCell;
    if (weekCell) currentWeek = weekCell;
    if (dowCell) currentDow = dowCell;

    const activity = actCell as ActivityType;
    if (ACTIVITIES.includes(activity)) {
      colMeta.push({ date: currentDate, dayOfWeek: currentDow, week: currentWeek, activity });
    } else {
      colMeta.push({ date: currentDate, dayOfWeek: currentDow, week: currentWeek, activity: '' as ActivityType });
    }
  }

  // Get unique sorted dates
  const uniqueDates: string[] = [];
  colMeta.forEach(m => {
    if (m.date && !uniqueDates.includes(m.date)) uniqueDates.push(m.date);
  });

  // Parse player rows
  const players: Player[] = [];

  for (let r = headerRowIdx + 1; r < allRows.length; r++) {
    const row = allRows[r];
    if (!row || row.length < 10) continue;

    const ign = row[1]?.trim();
    if (!ign || ign === '' || ign === 'IGN') continue;

    const rank = parseInt(row[0]?.trim()) || r - headerRowIdx;
    const ps = row[2]?.trim() || '';
    const level = row[3]?.trim() || '';
    const ms = row[4]?.trim() || '';
    const sp = row[5]?.trim() || '';
    const server = row[6]?.trim() || '';
    const attended = parseInt(row[7]?.trim()) || 0;
    const total = parseInt(row[8]?.trim()) || 0;
    const pctStr = row[9]?.trim() || '0%';
    const pctNum = parseAttendancePercent(pctStr);

    // Build daily attendance
    const dateMap: { [date: string]: DailyAttendance } = {};

    for (let col = 0; col < colMeta.length; col++) {
      const meta = colMeta[col];
      if (!meta.date || !ACTIVITIES.includes(meta.activity)) continue;

      const rawVal = row[DATA_START_COL + col]?.trim();
      const boolVal = parseBoolean(rawVal || '');

      if (!dateMap[meta.date]) {
        dateMap[meta.date] = {
          date: meta.date,
          dayOfWeek: meta.dayOfWeek,
          week: meta.week,
          activities: {},
        };
      }
      dateMap[meta.date].activities[meta.activity] = boolVal;
    }

    const dailyAttendance = uniqueDates
      .map(d => dateMap[d])
      .filter(Boolean);

    // Compute per-activity stats
    const activityStats: Player['activityStats'] = {
      'AM Lab': { joined: 0, missed: 0, total: 0, percentage: 0 },
      'AM Valley': { joined: 0, missed: 0, total: 0, percentage: 0 },
      'PM Lab': { joined: 0, missed: 0, total: 0, percentage: 0 },
      'PM Valley': { joined: 0, missed: 0, total: 0, percentage: 0 },
      'W8+': { joined: 0, missed: 0, total: 0, percentage: 0 },
    };

    dailyAttendance.forEach(day => {
      ACTIVITIES.forEach(act => {
        const val = day.activities[act];
        if (val === null || val === undefined) return;
        activityStats[act].total++;
        if (val === true) activityStats[act].joined++;
        else activityStats[act].missed++;
      });
    });

    ACTIVITIES.forEach(act => {
      const s = activityStats[act];
      s.percentage = s.total > 0 ? Math.round((s.joined / s.total) * 100) : 0;
    });

    players.push({
      rank,
      ign,
      powerScore: ps,
      level,
      ms,
      sp,
      server,
      attended,
      total,
      attendancePercent: pctStr,
      attendancePercentNum: pctNum,
      dailyAttendance,
      activityStats,
      status: getStatus(pctNum),
    });
  }

  const stats = computeStats(players);
  return {
    players,
    stats,
    lastUpdated: new Date().toISOString(),
    dates: uniqueDates,
  };
}

function computeStats(players: Player[]): HOFStats {
  if (!players.length) {
    return { totalPlayers: 0, avgAttendance: 0, topPlayer: '-', server23Count: 0, server24Count: 0, activeCount: 0, warningCount: 0, inactiveCount: 0 };
  }
  const avg = players.reduce((s, p) => s + p.attendancePercentNum, 0) / players.length;
  const top = [...players].sort((a, b) => b.attendancePercentNum - a.attendancePercentNum)[0];
  return {
    totalPlayers: players.length,
    avgAttendance: Math.round(avg * 100) / 100,
    topPlayer: top?.ign || '-',
    server23Count: players.filter(p => p.server === '23').length,
    server24Count: players.filter(p => p.server === '24').length,
    activeCount: players.filter(p => p.status === 'active').length,
    warningCount: players.filter(p => p.status === 'warning').length,
    inactiveCount: players.filter(p => p.status === 'inactive').length,
  };
}

// Minimal CSV line parser that handles quoted fields
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
