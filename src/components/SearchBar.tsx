import React, { useEffect, useRef } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { SearchFilterOptions, ProjectTier, VerificationStatus } from '../types';

interface SearchBarProps {
  filters: SearchFilterOptions;
  onChange: (newFilters: SearchFilterOptions) => void;
  totalResults: number;
  totalProjects: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  onChange,
  totalResults,
  totalProjects,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut '/' or 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== inputRef.current && !(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, query: e.target.value });
  };

  const handleClear = () => {
    onChange({ ...filters, query: '' });
    inputRef.current?.focus();
  };

  const setTier = (tier: 'all' | ProjectTier) => {
    onChange({ ...filters, tier });
  };

  const setStatus = (status: 'all' | VerificationStatus) => {
    onChange({ ...filters, status });
  };

  const setCategory = (category: 'all' | string) => {
    onChange({ ...filters, category });
  };

  return (
    <div id="codesentinel-search-bar" className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg backdrop-blur-md">
      {/* Search Input Line */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
          <Search className="w-4 h-4 text-cyan-400" />
        </div>
        
        <input
          id="search-input-field"
          ref={inputRef}
          type="text"
          value={filters.query}
          onChange={handleQueryChange}
          placeholder="Søk i verifiserte prosjekter, kodebaser, teknologier (f.eks. Rust, FHIR, Go) eller GitHub repos..."
          className="w-full bg-slate-950/70 border border-slate-800/80 rounded-lg pl-10 pr-24 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-sans"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {filters.query ? (
            <button
              id="clear-search-btn"
              onClick={handleClear}
              className="text-xs p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Tøm søk"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 rounded">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Filter Quick Chips */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-800/60 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filter:</span>
        </div>

        {/* Tier Filters */}
        <div className="flex items-center bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
          <button
            id="filter-tier-all"
            onClick={() => setTier('all')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filters.tier === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alle Tiers
          </button>
          <button
            id="filter-tier-1"
            onClick={() => setTier('tier-1')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filters.tier === 'tier-1'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tier 1 (Flaggskip)
          </button>
          <button
            id="filter-tier-2"
            onClick={() => setTier('tier-2')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filters.tier === 'tier-2'
                ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tier 2
          </button>
          <button
            id="filter-tier-3"
            onClick={() => setTier('tier-3')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filters.tier === 'tier-3'
                ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tier 3
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
          <button
            id="filter-status-all"
            onClick={() => setStatus('all')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filters.status === 'all'
                ? 'bg-slate-700/60 text-slate-200 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alle statuser
          </button>
          <button
            id="filter-status-verified"
            onClick={() => setStatus('verified')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filters.status === 'verified'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ✓ Verifisert
          </button>
          <button
            id="filter-status-blocked"
            onClick={() => setStatus('blocked_disallowed')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filters.status === 'blocked_disallowed'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⛔ Sperret (cross-device-sdk)
          </button>
        </div>

        {/* Results Counter */}
        <div className="ml-auto text-xs text-slate-400 font-mono">
          Viser <span className="text-cyan-400 font-bold">{totalResults}</span> av {totalProjects} oppføringer
        </div>
      </div>
    </div>
  );
};
