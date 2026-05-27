'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import AttendanceTable from '@/components/AttendanceTable';
import RightProfilePanel from '@/components/RightProfilePanel';
import { Shield, HelpCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const { data, loading, error, fetchData } = useData();
  const [selectedIgn, setSelectedIgn] = useState<string>('');

  useEffect(() => {
    // Initial fetch of attendance data on load
    fetchData();
  }, []);

  // Set default selected player when data loaded
  useEffect(() => {
    if (data && data.players.length > 0 && !selectedIgn) {
      setSelectedIgn(data.players[0].ign);
    }
  }, [data, selectedIgn]);

  // Find selected player object
  const selectedPlayer = data
    ? data.players.find((p) => p.ign.toLowerCase() === selectedIgn.toLowerCase()) || data.players[0] || null
    : null;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden pb-12">
      {/* Dynamic Dark Fantasy Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/30 via-slate-950 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[8s]" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[6s]" />

      <Header />

      <main className="w-full px-4 sm:px-6 lg:px-8 mt-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32"
            >
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-4" />
              <p className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">
                RETRIEVING ALLIANCE SCROLLS FROM SHEETS...
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto my-16 bg-red-950/20 border border-red-500/30 rounded-xl p-8 backdrop-blur-md text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Scroll Retrieval Failed</h3>
              <p className="text-slate-400 text-sm mb-6">{error}</p>
              <button
                onClick={() => fetchData()}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-lg font-medium shadow-[0_0_15px_rgba(239,68,68,0.2)] transition duration-200"
              >
                Retry Summon
              </button>
            </motion.div>
          ) : data ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >

              {/* Main Split-Screen Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Attendance Overview Table */}
                <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-md shadow-2xl relative">
                  <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                  
                  <h2 className="text-2xl font-bold font-serif mb-6 text-slate-100 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-cyan-400" />
                    HOF Attendance Overview
                  </h2>

                  <div className="mt-4">
                    <AttendanceTable 
                      players={data.players} 
                      selectedIgn={selectedIgn}
                      onSelectPlayer={setSelectedIgn}
                    />
                  </div>
                </div>

                {/* Right Side: Detailed Profile & Log Panel */}
                <div className="lg:col-span-5 sticky top-6 self-start">
                  {selectedPlayer ? (
                    <RightProfilePanel player={selectedPlayer} />
                  ) : (
                    <div className="glass-card p-12 text-center text-slate-500 font-mono text-sm">
                      SELECT A CHARACTER FROM THE ROSTER TO VIEW CHRONICLES
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 text-slate-500 font-mono text-sm"
            >
              <HelpCircle className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              NO ALLIANCE DATA RETRIEVED. ENTER A VALID GOOGLE SHEET LINK TO LOAD.
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
