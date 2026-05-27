'use client';

import { use } from 'react';
import { useData } from '@/context/DataContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import CharacterCard from '@/components/CharacterCard';
import ActivityStats from '@/components/ActivityStats';
import AttendanceCalendar from '@/components/AttendanceCalendar';
import AttendanceHeatmap from '@/components/AttendanceHeatmap';
import { ChevronLeft, ShieldAlert } from 'lucide-react';

interface Props {
  params: Promise<{ ign: string }>;
}

export default function PlayerDetailPage({ params }: Props) {
  const router = useRouter();
  const { data, loading } = useData();
  const resolvedParams = use(params);
  
  // URL decode the ign
  const ign = decodeURIComponent(resolvedParams.ign);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm tracking-widest text-cyan-400">LOADING CHARACTER CHRONICLES...</p>
        </div>
      </div>
    );
  }

  const player = data?.players.find((p) => p.ign.toLowerCase() === ign.toLowerCase());

  if (!data || !player) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold font-serif mb-2">Member Chronicles Lost</h2>
          <p className="text-slate-400 mb-8">
            The player <span className="text-red-400 font-mono">&quot;{ign}&quot;</span> could not be found within the active HOF scroll records.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition text-slate-300 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Roster
          </button>
        </main>
      </div>
    );
  }

  // Get daily attendance history for this player
  const playerDailyAttendance = player.dailyAttendance || [];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 pb-16 overflow-x-hidden">
      {/* Background radial effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-transparent pointer-events-none -z-10" />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="group inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 font-mono text-sm tracking-wider mb-6 transition duration-200"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          RETURN TO HOF ROSTER
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Character Profile & Stats Card */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CharacterCard player={player} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <ActivityStats player={player} />
            </motion.div>
          </div>

          {/* Right Column: Dynamic Calendars, Timelines & Heatmaps */}
          <div className="lg:col-span-3 space-y-6">
            {/* Complete Daily Tracker Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <AttendanceCalendar dailyAttendance={playerDailyAttendance} />
            </motion.div>

            {/* Heatmap Visualisation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <AttendanceHeatmap dailyAttendance={playerDailyAttendance} ign={player.ign} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
