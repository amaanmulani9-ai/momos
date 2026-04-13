'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

export interface ResolvedPlace {
  label: string;
  area: string;
  address: string;
  lat?: number;
  lon?: number;
  placeId?: string;
}

interface AddressSearchProps {
  areaValue: string;
  addressValue: string;
  onResolved: (place: ResolvedPlace) => void;
  disabled?: boolean;
}

export default function AddressSearch({ areaValue, addressValue, onResolved, disabled }: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ResolvedPlace[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { places?: ResolvedPlace[] };
      setSuggestions(data.places ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (open && query.length >= 2) {
        void runSearch(query);
      }
    }, 280);
    return () => window.clearTimeout(t);
  }, [query, open, runSearch]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div ref={wrapRef} className="space-y-3">
      <label htmlFor="addr-search" className="form-label flex items-center gap-2">
        <MapPin className="h-4 w-4 text-[#ff8a5b]" />
        Search address (OpenStreetMap)
      </label>
      <input
        id="addr-search"
        disabled={disabled}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="form-input"
        placeholder="Start typing street, area, or landmark…"
        autoComplete="off"
      />
      {open && (query.length >= 2 || suggestions.length > 0) && (
        <div className="max-h-52 overflow-y-auto rounded-[20px] border border-white/10 bg-[#121722] py-1 shadow-lg">
          {loading && <p className="px-4 py-3 text-sm text-white/45">Searching…</p>}
          {!loading &&
            suggestions.map((p) => (
              <button
                key={`${p.label}-${p.lat}-${p.lon}`}
                type="button"
                className="block w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/6"
                onClick={() => {
                  onResolved(p);
                  setQuery('');
                  setSuggestions([]);
                  setOpen(false);
                }}
              >
                {p.label}
              </button>
            ))}
          {!loading && query.length >= 2 && suggestions.length === 0 && (
            <p className="px-4 py-3 text-sm text-white/45">No matches. You can still type area and address manually below.</p>
          )}
        </div>
      )}
      <p className="text-xs text-white/38">
        Current: {areaValue || '—'} ·{' '}
        {addressValue ? (addressValue.length > 56 ? `${addressValue.slice(0, 56)}…` : addressValue) : '—'}
      </p>
    </div>
  );
}
