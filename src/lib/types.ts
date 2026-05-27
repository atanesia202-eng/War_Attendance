export type ActivityType = 'AM Lab' | 'AM Valley' | 'PM Lab' | 'PM Valley' | 'W8+';

export const ACTIVITIES: ActivityType[] = ['AM Lab', 'AM Valley', 'PM Lab', 'PM Valley', 'W8+'];

export interface DailyAttendance {
  date: string; // e.g. "24/5"
  dayOfWeek: string;
  week: string;
  activities: {
    [key in ActivityType]?: boolean | null;
  };
}

export interface ActivityStats {
  joined: number;
  missed: number;
  total: number;
  percentage: number;
}

export interface Player {
  rank: number;
  ign: string;
  powerScore: string;
  level: string;
  ms: string;
  sp: string;
  server: string;
  attended: number;
  total: number;
  attendancePercent: string;
  attendancePercentNum: number;
  dailyAttendance: DailyAttendance[];
  activityStats: {
    [key in ActivityType]: ActivityStats;
  };
  status: 'active' | 'warning' | 'inactive';
}

export interface HOFStats {
  totalPlayers: number;
  avgAttendance: number;
  topPlayer: string;
  server23Count: number;
  server24Count: number;
  activeCount: number;
  warningCount: number;
  inactiveCount: number;
}

export interface SheetData {
  players: Player[];
  stats: HOFStats;
  lastUpdated: string;
  dates: string[];
}
