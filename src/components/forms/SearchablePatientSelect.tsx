'use client';

import { useState, useEffect, useRef } from 'react';
import { HiSearch } from 'react-icons/hi';

export interface PatientOption {
  id: string;
  name: string;
  phone: string;
  age?: number | string;
  gender?: string;
  address?: string;
  [key: string]: any;
}

export interface SearchablePatientSelectProps {
  patients: PatientOption[];
  value?: string;
  onSelect: (patient: PatientOption) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

/**
 * Searchable patient selector (combobox).
 *
 * Filters the already-loaded patient list client-side as the user types AND
 * performs a server-side search through `/api/patients?phone=<q>&name=<q>`
 * (the backend part required by the Doctor Booking ↔ Patient integration).
 * Server results are merged with the client list so it stays fast and complete
 * even when the backend search endpoint is unavailable.
 */
export default function SearchablePatientSelect({
  patients,
  value,
  onSelect,
  placeholder = 'Search by name or phone...',
  required = false,
  className = '',
}: SearchablePatientSelectProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [serverResults, setServerResults] = useState<PatientOption[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = patients.find((p) => p.id === value);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Debounced server-side search
  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setServerResults([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const q = encodeURIComponent(term);
        const res = await fetch(`/api/patients?phone=${q}&name=${q}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const json = await res.json();
        if (json?.success) {
          setServerResults(Array.isArray(json.data) ? json.data : []);
        }
      } catch {
        setServerResults([]);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  const all = Array.from(
    new Map([...patients, ...serverResults].map((p) => [p.id, p])).values()
  );

  const filtered = query.trim()
    ? all.filter((p) => {
        const term = query.trim().toLowerCase().replace(/\s/g, '');
        return (
          (p.name || '').toLowerCase().includes(term) ||
          (p.phone || '').replace(/\s/g, '').includes(term)
        );
      })
    : all;

  const options = open ? filtered.slice(0, 8) : [];

  const handleSelect = (p: PatientOption) => {
    onSelect(p);
    setQuery(`${p.name}${p.phone ? ` (${p.phone})` : ''}`);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <HiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={selected ? `${selected.name} (${selected.phone})` : placeholder}
          required={required && !value}
          className="min-h-[44px] w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
        />
      </div>

      {open && options.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {options.map((p) => (
            <li
              key={p.id}
              className={`cursor-pointer px-3 py-2 text-sm ${p.id === value ? 'font-medium' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(p);
              }}
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-slate-500">
                {p.phone}
                {p.age ? ` • Age ${p.age}` : ''}
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && filtered.length === 0 && (
        <p className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-500 shadow-lg">
          No patient found.
        </p>
      )}
    </div>
  );
}
