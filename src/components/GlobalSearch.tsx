/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { SheetPublicItem, SheetInternalItem } from '../types';
import { IconRenderer } from './IconRenderer';
import { 
  Search, 
  X, 
  Globe, 
  Lock, 
  ShieldCheck, 
  ExternalLink, 
  LogIn, 
  Sparkles,
  Command,
  ArrowRight
} from 'lucide-react';

interface GlobalSearchProps {
  onOpenLogin: () => void;
  setActiveTab?: (tab: 'public' | 'internal' | 'admin') => void;
  className?: string;
  isMobileDrawer?: boolean;
  onItemSelect?: () => void;
}

type SearchCategoryFilter = 'all' | 'public' | 'internal';

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onOpenLogin,
  setActiveTab,
  className = '',
  isMobileDrawer = false,
  onItemSelect,
}) => {
  const { publicItems, internalItems, logAction } = useData();
  const { currentUser, isAuthenticated, isAdmin } = useAuth();
  const { language } = useApp();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<SearchCategoryFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if current user has access to an internal tool
  const hasInternalAccess = (item: SheetInternalItem): boolean => {
    if (!isAuthenticated || !currentUser) return false;
    if (isAdmin) return true;
    if (currentUser.inChargeScopes.includes('admin')) return true;
    return item.inCharge.some(scope => currentUser.inChargeScopes.includes(scope));
  };

  // Keyboard shortcut listener: Cmd+K / Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in another input/textarea
      const activeEl = document.activeElement;
      const isInput = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA';

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1. Process Public Items
    const matchedPublic: Array<{
      type: 'public';
      item: SheetPublicItem;
      hasAccess: boolean;
    }> = publicItems
      .filter(item => {
        if (!q) return true; // show suggestions if empty
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.badge && item.badge.toLowerCase().includes(q))
        );
      })
      .map(item => ({
        type: 'public' as const,
        item,
        hasAccess: true,
      }));

    // 2. Process Internal Items
    const matchedInternal: Array<{
      type: 'internal';
      item: SheetInternalItem;
      hasAccess: boolean;
    }> = internalItems
      .filter(item => {
        if (!q) return true;
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.inCharge.some(c => c.toLowerCase().includes(q)) ||
          (item.badge && item.badge.toLowerCase().includes(q))
        );
      })
      .map(item => ({
        type: 'internal' as const,
        item,
        hasAccess: hasInternalAccess(item),
      }));

    // 3. Apply Filter Type
    let combined = [];
    if (filterType === 'all') {
      combined = [...matchedPublic, ...matchedInternal];
    } else if (filterType === 'public') {
      combined = matchedPublic;
    } else {
      combined = matchedInternal;
    }

    // Sort: If user searched, prioritize title matches, then category
    if (q) {
      combined.sort((a, b) => {
        const aTitleMatch = a.item.title.toLowerCase().includes(q);
        const bTitleMatch = b.item.title.toLowerCase().includes(q);
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        return 0;
      });
    }

    // Limit to top 15 results for performance and clean display
    return combined.slice(0, 15);
  }, [query, publicItems, internalItems, filterType, isAuthenticated, currentUser, isAdmin]);

  // Reset selectedIndex when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  // Keyboard navigation within results
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectItem(searchResults[selectedIndex]);
      }
    }
  };

  const handleSelectItem = (res: typeof searchResults[0]) => {
    if (res.type === 'public') {
      logAction('APP_CLICK', `เปิดเว็บแอปสาธารณะผ่านค้นหา: ${res.item.title}`, {
        targetApp: res.item.title,
      });
      window.open(res.item.url, '_blank', 'noopener,noreferrer');
      setIsOpen(false);
      onItemSelect?.();
    } else {
      // Internal item
      if (!isAuthenticated) {
        setIsOpen(false);
        onItemSelect?.();
        onOpenLogin();
        return;
      }

      if (res.hasAccess) {
        logAction('APP_CLICK', `เปิดเว็บแอปภายในผ่านค้นหา: ${res.item.title}`, {
          targetApp: res.item.title,
          inCharge: res.item.inCharge.join(', '),
        });
        window.open(res.item.url, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
        onItemSelect?.();
      } else {
        alert(`คุณไม่มีสิทธิ์เข้าถึงเครื่องมือนี้ (จำกัดเฉพาะฝ่าย In-charge: ${res.item.inCharge.join(', ')})`);
      }
    }
  };

  // Highlight matched text helper
  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 px-0.5 rounded font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const placeholderText = language === 'th' 
    ? 'ค้นหาบริการ หรือ เว็บแอปภายใน...' 
    : 'Search services or internal apps...';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3 pointer-events-none text-slate-400 dark:text-slate-500 flex items-center">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholderText}
          className={`w-full pl-9 pr-14 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm border transition-all duration-200 outline-none
            ${isOpen 
              ? 'border-[#0060AA] dark:border-sky-500 ring-2 ring-[#0060AA]/15 bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' 
              : 'border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
            }`}
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs pointer-events-none">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          )}
        </div>
      </div>

      {/* Dropdown Results Overlay */}
      {isOpen && (
        <div 
          className={`absolute left-0 z-50 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in
            ${isMobileDrawer 
              ? 'w-full static shadow-none mt-2 border-slate-200' 
              : 'w-full sm:w-[480px] md:w-[520px] max-h-[75vh] flex flex-col'
            }`}
        >
          {/* Filter Pills Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-[#0060AA] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setFilterType('public')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === 'public'
                    ? 'bg-[#0060AA] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>สาธารณะ ({publicItems.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('internal')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === 'internal'
                    ? 'bg-[#0060AA] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>ภายใน ({internalItems.length})</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {searchResults.length} รายการ
            </span>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto max-h-[380px] p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            {searchResults.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-1 text-slate-400 dark:text-slate-500 text-xs">
                <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  ไม่พบผลการค้นหาสำหรับ "{query}"
                </p>
                <p className="text-[11px]">
                  ลองค้นหาด้วยคำอื่น เช่น SAP, HR, Ticket, ERP, หรือชื่อฝ่าย
                </p>
              </div>
            ) : (
              searchResults.map((res, index) => {
                const isSelected = index === selectedIndex;
                const isPublic = res.type === 'public';
                const { item } = res;

                return (
                  <div
                    key={`${res.type}-${item.id}`}
                    onClick={() => handleSelectItem(res)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 group ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-sky-950/40 text-slate-900 dark:text-white'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {/* App Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-colors ${
                      isPublic 
                        ? 'bg-blue-100 text-[#0060AA] dark:bg-blue-950 dark:text-sky-400 group-hover:bg-[#0060AA] group-hover:text-white' 
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'
                    }`}>
                      <IconRenderer name={item.icon} size={18} />
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {highlightMatch(item.title, query)}
                        </span>

                        {/* Public vs Internal Badge */}
                        {isPublic ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" />
                            <span>สาธารณะ</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>ภายใน</span>
                          </span>
                        )}

                        {/* In-charge badge for internal */}
                        {!isPublic && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                            {(item as SheetInternalItem).inCharge.join(', ')}
                          </span>
                        )}

                        {/* Item Badge */}
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {highlightMatch(item.description, query)}
                      </p>
                    </div>

                    {/* Action Icon / Status */}
                    <div className="shrink-0 self-center flex items-center gap-1 text-slate-400 group-hover:text-[#0060AA] dark:group-hover:text-sky-400">
                      {isPublic ? (
                        <ExternalLink className="w-4 h-4" />
                      ) : !isAuthenticated ? (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                          <LogIn className="w-3 h-3" />
                          <span>ล็อกอิน</span>
                        </div>
                      ) : res.hasAccess ? (
                        <ExternalLink className="w-4 h-4" />
                      ) : (
                        <span className="text-[10px] text-slate-400">จำกัดสิทธิ์</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Footer Navigation Hint */}
          <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>กด <kbd className="px-1 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 font-mono">↑</kbd> <kbd className="px-1 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 font-mono">↓</kbd> เพื่อเลือก</span>
              <span>•</span>
              <span><kbd className="px-1 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 font-mono">Enter</kbd> เพื่อเปิด</span>
            </span>
            <span>กด <kbd className="px-1 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 font-mono">ESC</kbd> เพื่อปิด</span>
          </div>
        </div>
      )}
    </div>
  );
};
