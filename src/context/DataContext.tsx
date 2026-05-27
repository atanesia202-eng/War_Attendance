'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SheetData } from '@/lib/types';
import { buildCsvUrl, parseCSV } from '@/lib/parseSheets';

interface DataContextType {
  data: SheetData | null;
  loading: boolean;
  error: string | null;
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  fetchData: (url?: string) => Promise<void>;
  lastUpdated: string | null;
}

const DataContext = createContext<DataContextType | null>(null);

const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1h5C2VwX8ARQ0feUBWDyEevuNDCV9B4L7WGuGkS5qLzA/edit?gid=1534410095#gid=1534410095';

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET_URL);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async (url?: string) => {
    const targetUrl = url || sheetUrl;
    setLoading(true);
    setError(null);
    try {
      const csvUrl = buildCsvUrl(targetUrl);
      const res = await fetch(`/api/sheet?url=${encodeURIComponent(csvUrl)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const csvText = await res.text();
      const parsed = parseCSV(csvText);
      setData(parsed);
      setLastUpdated(new Date().toISOString());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [sheetUrl]);

  return (
    <DataContext.Provider value={{ data, loading, error, sheetUrl, setSheetUrl, fetchData, lastUpdated }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
