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
  // Use gviz/tq endpoint — the /export?format=csv endpoint now returns HTTP 400
  // We use &headers=5 to force the API to include the top 5 header rows (which contain dates and activities).
  // This causes gviz/tq to concatenate those 5 rows into the first row of the CSV.
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&headers=5${gid ? `&gid=${gid}` : ''}`;
}

function parseBoolean(val: string): boolean | null {
  const upper = val?.trim().toUpperCase();
  if (upper === 'TRUE') return true;
  if (upper === 'FALSE') return false;
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
  for (let i = 0; i < Math.min(10, allRows.length); i++) {
    if (allRows[i].some(cell => cell.includes('IGN') || cell.includes('SP/MS RANKING'))) {
      headerRowIdx = i;
      break;
    }
  }

  if (headerRowIdx < 0) {
    return { players: [], stats: computeStats([]), lastUpdated: new Date().toISOString(), dates: [] };
  }

  const dataHeaderRow = allRows[headerRowIdx];

  let DATA_START_COL = 10; // default
  for (let i = 0; i < dataHeaderRow.length; i++) {
    if (dataHeaderRow[i].includes('% Attendance')) {
      DATA_START_COL = i + 1;
      break;
    }
  }

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

  const dateRegex = /\b\d{1,2}\/\d{1,2}(?:\/\d{4})?\b/;
  const dowRegex = /\b(SUNDAY|MONDAY|TUESDAY|WEDMESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY)\b/i;
  const weekRegex = /\bW\d+\b/i;

  const isMergedHeaders = headerRowIdx < 4;
  const datesRow = isMergedHeaders ? [] : (allRows[headerRowIdx - 4] || []);
  const weekRow = isMergedHeaders ? [] : (allRows[headerRowIdx - 3] || []);
  const dowRow = isMergedHeaders ? [] : (allRows[headerRowIdx - 2] || []);
  const activityRow = isMergedHeaders ? [] : (allRows[headerRowIdx - 1] || []);

  for (let col = DATA_START_COL; col < dataHeaderRow.length; col++) {
    let dateCell = '';
    let weekCell = '';
    let dowCell = '';
    let actCell = '';

    if (isMergedHeaders) {
      const mergedHeader = dataHeaderRow[col] || '';
      const dMatch = mergedHeader.match(dateRegex);
      if (dMatch) dateCell = dMatch[0];
      
      const wMatch = mergedHeader.match(weekRegex);
      if (wMatch) weekCell = wMatch[0].toUpperCase();
      
      const dowMatch = mergedHeader.match(dowRegex);
      if (dowMatch) dowCell = dowMatch[0].toUpperCase();

      const matchedActivity = ACTIVITIES.find(a => mergedHeader.toLowerCase().includes(a.toLowerCase()));
      if (matchedActivity) actCell = matchedActivity;
    } else {
      dateCell = datesRow[col]?.trim() || '';
      weekCell = weekRow[col]?.trim() || '';
      dowCell = dowRow[col]?.trim() || '';
      actCell = activityRow[col]?.trim() || '';
    }

    if (dateCell) currentDate = dateCell;
    if (weekCell) currentWeek = weekCell;
    if (dowCell) currentDow = dowCell;

    const activityStr = actCell?.trim() || '';
    const matchedActivity = ACTIVITIES.find(a => a.toLowerCase() === activityStr.toLowerCase());

    if (matchedActivity) {
      colMeta.push({ date: currentDate, dayOfWeek: currentDow, week: currentWeek, activity: matchedActivity });
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
