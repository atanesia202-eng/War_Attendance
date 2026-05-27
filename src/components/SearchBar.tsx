'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  players: string[];
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ players, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const suggestions = value.trim().length >= 1
    ? players.filter(p => p.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    setHighlighted(0);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    if (e.key === 'Enter') { onChange(suggestions[highlighted]); setOpen(false); }
    if (e.key === 'Escape') { setOpen(false); }
  };

  const highlight = (text: string) => {
    if (!value.trim()) return text;
    const idx = text.toLowerCase().indexOf(value.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ color: 'var(--neon-blue)', fontWeight: 700 }}>{text.slice(idx, idx + value.length)}</span>
        {text.slice(idx + value.length)}
      </>
    );
  };

  return (
    <div style={{ position: 'relative', minWidth: '260px' }}>
      {/* Input */}
      <div style={{ position: 'relative' }}>
        <Search
          size={16}
          color="#4a6b80"
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          id="player-search"
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search character name..."
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKey}
        />
        {value && (
          <button
            onClick={() => { onChange(''); inputRef.current?.focus(); }}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div
            ref={dropRef}
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
            className="autocomplete-dropdown"
            style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, transformOrigin: 'top' }}
          >
            {suggestions.map((s, i) => (
              <div
                key={s}
                className={`autocomplete-item ${i === highlighted ? 'active' : ''}`}
                onMouseEnter={() => setHighlighted(i)}
                onMouseDown={() => { onChange(s); setOpen(false); }}
              >
                <span style={{ marginRight: '8px', opacity: 0.4, fontSize: '11px' }}>◆</span>
                {highlight(s)}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
