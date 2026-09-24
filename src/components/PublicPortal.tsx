/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useApp } from '../context/AppContext';
import { SheetPublicItem } from '../types';
import { 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Globe2, 
  Sparkles,
  ArrowUpRight,
  Bookmark,
  BellRing,
  Info,
  AlertTriangle,
  CheckCircle2,
  Share2
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

export const PublicPortal: React.FC = () => {
  const { publicItems, siteConfig, logAction } = useData();
  const { t, language } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active public announcements
  const publicAnnouncements = (siteConfig.announcements || []).filter(
    a => a.enabled && a.showOnPublic
  );

  const heroBadge = language === 'th' ? siteConfig.publicBadgeTh : siteConfig.publicBadgeEn;
  const heroTitle = language === 'th' ? siteConfig.publicTitleTh : siteConfig.publicTitleEn;
  const heroSubtitle = language === 'th' ? siteConfig.publicSubtitleTh : siteConfig.publicSubtitleEn;

  // Categories extraction
  const categories = Array.from(
    new Set(publicItems.map(item => item.category).filter(Boolean))
  );

  // Filtered items
  const filteredItems = publicItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyLink = (e: React.MouseEvent, id: string, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLinkClick = (item: SheetPublicItem) => {
    logAction('APP_CLICK', `เปิดเว็บแอปสาธารณะ: ${item.title}`, {
      targetApp: item.title,
      userRole: 'user',
    });
  };

  // Dynamic Lucide icon renderer
  const IconRenderer = ({ name, size = 20 }: { name: string; size?: number }) => {
    const IconComponent = (LucideIcons as any)[name] || LucideIcons.Globe;
    return <IconComponent size={size} />;
  };

  // Color mapping
  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white',
          badge: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        };
      case 'amber':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white',
          badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      case 'emerald':
      case 'green':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white',
          badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
      case 'indigo':
      case 'purple':
        return {
          bg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white',
          badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        };
      case 'blue':
      default:
        return {
          bg: 'bg-blue-500/10 dark:bg-sky-500/20 text-[#0060AA] dark:text-sky-400 group-hover:bg-[#0060AA] group-hover:text-white',
          badge: 'bg-blue-50 dark:bg-blue-950/60 text-[#0060AA] dark:text-sky-300 border-blue-200 dark:border-blue-800',
        };
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Announcements Broadcast Bar */}
      {publicAnnouncements.map(ann => {
        const isWarning = ann.type === 'warning';
        const isSuccess = ann.type === 'success';
        const title = language === 'th' ? (ann.titleTh || ann.titleEn) : (ann.titleEn || ann.titleTh);
        const msg = language === 'th' ? (ann.messageTh || ann.messageEn) : (ann.messageEn || ann.messageTh);

        return (
          <div
            key={ann.id}
            className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 shadow-xs animate-fade-in ${
              isWarning
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : isSuccess
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-blue-50 dark:bg-sky-950/50 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-sky-200'
            }`}
          >
            {isWarning ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-[#0060AA] dark:text-sky-400 shrink-0 mt-0.5" />
            )}

            <div className="text-xs sm:text-sm space-y-0.5">
              <span className="font-bold">{title}</span>
              {msg && <p className="opacity-90 text-[11px] sm:text-xs leading-relaxed">{msg}</p>}
            </div>
          </div>
        );
      })}

      {/* Minimalist Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-blue-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800/80 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xs">
        <div className="max-w-3xl">
          {heroBadge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/70 dark:bg-blue-950/80 text-[#0060AA] dark:text-sky-400 border border-blue-200/50 dark:border-blue-800 mb-3.5">
              <Globe2 className="w-3.5 h-3.5" />
              <span>{heroBadge}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {heroTitle}
          </h1>
          <p className="mt-2.5 text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {heroSubtitle}
          </p>
        </div>

        {/* Search Input */}
        <div className="mt-6 max-w-xl relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('public.search_placeholder')}
            className="w-full pl-10 pr-12 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0060AA]/20 focus:border-[#0060AA] shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ล้าง
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#0060AA] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          {t('public.all_categories')} ({publicItems.length})
        </button>
        {categories.map(cat => {
          const count = publicItems.filter(i => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0060AA] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Public Links Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {t('public.no_results')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('public.no_results_desc')}
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="mt-4 px-4 py-2 text-xs font-bold text-[#0060AA] dark:text-sky-400 hover:underline cursor-pointer"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredItems.map(item => {
            const styles = getColorClasses(item.color);
            return (
              <a
                key={item.id}
                href={item.url}
                target={item.target || '_blank'}
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(item)}
                className="group relative flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#0060AA] dark:hover:border-sky-500 hover:shadow-lg dark:hover:shadow-sky-950/20 transition-all duration-200 text-left cursor-pointer"
              >
                {/* Header: Icon & Badges */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    {/* Icon container */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0 shadow-2xs ${styles.bg}`}>
                      <IconRenderer name={item.icon} size={24} />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles.badge}`}>
                          {item.badge}
                        </span>
                      )}
                      
                      {/* Copy Link button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(e, item.id, item.url)}
                        title={copiedId === item.id ? t('public.link_copied') : t('public.copy_link')}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Launch Icon Indicator */}
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-[#0060AA] dark:group-hover:bg-sky-500 group-hover:text-white text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors">
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0060AA] dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Footer Tag & URL preview */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span className="truncate max-w-[70%] font-medium text-slate-500 dark:text-slate-400">
                    {item.category}
                  </span>
                  <span className="font-semibold text-[10px] text-slate-400 group-hover:text-[#0060AA] dark:group-hover:text-sky-400 transition-colors">
                    {t('public.click_to_open')} &rarr;
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};
