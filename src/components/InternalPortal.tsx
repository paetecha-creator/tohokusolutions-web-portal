/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useApp } from '../context/AppContext';
import { IconRenderer } from './IconRenderer';
import { 
  Lock, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  SlidersHorizontal,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  LogOut,
  Clock,
  Sparkles,
  Sliders,
  BellRing,
  AlertTriangle,
  Info
} from 'lucide-react';

interface InternalPortalProps {
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
}

export const InternalPortal: React.FC<InternalPortalProps> = ({ onOpenLogin, onOpenAdmin }) => {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const { internalItems, siteConfig, logAction } = useData();
  const { t, language } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [adminViewAsRole, setAdminViewAsRole] = useState<string>('all_admin'); // For admin to simulate view

  // Active internal announcements
  const internalAnnouncements = (siteConfig.announcements || []).filter(
    a => a.enabled && a.showOnInternal
  );

  const heroBadge = language === 'th' ? siteConfig.internalBadgeTh : siteConfig.internalBadgeEn;
  const heroTitle = language === 'th' ? siteConfig.internalTitleTh : siteConfig.internalTitleEn;
  const heroSubtitle = language === 'th' ? siteConfig.internalSubtitleTh : siteConfig.internalSubtitleEn;

  // If not logged in, render authentication gate
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="py-12 sm:py-16 max-w-lg mx-auto text-center px-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t('internal.access_denied_title')}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {t('internal.access_denied_desc')}
        </p>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>ความปลอดภัย & การกำหนดสิทธิ์ (In-charge)</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            • ระบบจะแสดงเฉพาะลิงก์เว็บแอปที่ตรงกับสิทธิ์ <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200 font-mono">In-charge</code> ของท่านเท่านั้น<br/>
            • เข้าสู่ระบบอย่างปลอดภัยด้วยชื่อผู้ใช้งานและรหัสผ่านส่วนตัว
          </p>
        </div>

        <button
          onClick={onOpenLogin}
          className="mt-6 w-full py-3 px-6 rounded-xl font-bold text-sm text-white bg-[#0060AA] hover:bg-[#004f8c] shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          <span>{t('internal.access_denied_btn')}</span>
        </button>
      </div>
    );
  }

  // Determine user's active in-charge scopes
  const userScopes = currentUser.inChargeScopes && currentUser.inChargeScopes.length > 0 
    ? currentUser.inChargeScopes 
    : ['other'];

  // Check if a link matches user's permission
  const checkPermission = (linkInCharge: string[]) => {
    // If admin is viewing in standard admin mode, show all
    if (isAdmin && adminViewAsRole === 'all_admin') {
      return true;
    }

    // If admin selected a specific role/in-charge to simulate
    if (isAdmin && adminViewAsRole !== 'all_admin') {
      return linkInCharge.some(ic => ic.toLowerCase() === adminViewAsRole.toLowerCase());
    }

    // Standard user logic: full access for admin or users with 'admin' scope
    if (isAdmin || userScopes.some(s => s.toLowerCase() === 'admin')) {
      return true;
    }

    // Standard matching with inCharge options (admin, GA, SU, HR, other)
    return linkInCharge.some(ic => 
      userScopes.some(scope => scope.toLowerCase() === ic.toLowerCase())
    );
  };

  // Filter items based on permissions, category, and search query
  const accessibleItems = useMemo(() => {
    return internalItems
      .filter(item => checkPermission(item.inCharge))
      .filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch =
          searchQuery.trim() === '' ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.inCharge.some(ic => ic.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [internalItems, currentUser, adminViewAsRole, selectedCategory, searchQuery]);

  // Categories of accessible items
  const categories = useMemo(() => {
    const set = new Set<string>();
    internalItems.filter(item => checkPermission(item.inCharge)).forEach(item => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [internalItems, currentUser, adminViewAsRole]);

  // Handle clicking link -> record access log
  const handleLinkClick = (item: typeof internalItems[0]) => {
    logAction('APP_CLICK', `เข้าใช้งานระบบภายใน: ${item.title} (In-charge: ${item.inCharge.join(', ')})`, {
      userId: currentUser.id,
      username: currentUser.username,
      userRole: currentUser.role,
      userDepartment: currentUser.department,
      targetApp: item.title,
      inCharge: item.inCharge.join(', '),
    });
  };

  const getInChargeBadgeStyle = (ic: string) => {
    switch (ic.toLowerCase()) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800';
      case 'ga':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'su':
        return 'bg-blue-50 text-[#0060AA] border-blue-200 dark:bg-blue-950/60 dark:text-sky-300 dark:border-blue-800';
      case 'hr':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Announcements Broadcast Bar */}
      {internalAnnouncements.map(ann => {
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

      {/* User Status Bar Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#003865] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {currentUser.name}
              </h2>
              <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                (@{currentUser.username})
              </span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                currentUser.role === 'admin'
                  ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                  : 'bg-blue-50 text-[#0060AA] border-blue-200 dark:bg-blue-950 dark:text-sky-300 dark:border-blue-800'
              }`}>
                {currentUser.role === 'admin' ? t('internal.admin_badge') : t('internal.user_badge')}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.department}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('internal.permission_tag')}:</span>
                <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                  {userScopes.join(', ')}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#0060AA] hover:bg-[#004f8c] shadow-xs transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t('internal.admin_panel_btn')}</span>
            </button>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </div>

      {/* Admin Scope Simulation Bar */}
      {isAdmin && (
        <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
            <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{t('internal.admin_sim_title')}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setAdminViewAsRole('all_admin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                adminViewAsRole === 'all_admin'
                  ? 'bg-[#0060AA] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {t('internal.show_all_admin')}
            </button>
            {['admin', 'GA', 'SU', 'HR', 'other'].map(scope => (
              <button
                key={scope}
                onClick={() => setAdminViewAsRole(scope)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  adminViewAsRole === scope
                    ? 'bg-[#0060AA] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {scope}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('internal.search_placeholder')}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0060AA]/20 focus:border-[#0060AA]"
          />
        </div>

        {/* Total accessible count */}
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-end sm:self-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>
            {t('internal.showing_items')} <strong>{accessibleItems.length}</strong> {t('internal.from_total')} {internalItems.length} {t('internal.items_unit')}
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#0060AA] text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          {t('public.all_categories')} ({accessibleItems.length})
        </button>
        {categories.map(cat => {
          const count = internalItems
            .filter(item => checkPermission(item.inCharge))
            .filter(i => i.category === cat).length;
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

      {/* Grid of Accessible Internal Links */}
      {accessibleItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            ไม่มีเว็บแอปภายในที่ตรงกับสิทธิ์ของคุณในหมวดนี้
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            ระบบแสดงผลเฉพาะรายการที่ตรงกับสิทธิ์ In-charge ของท่าน หากต้องการเข้าถึงระบบเพิ่มเติม โปรดติดต่อ Admin
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
          {accessibleItems.map(item => {
            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(item)}
                className="group relative flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#0060AA] dark:hover:border-sky-500 hover:shadow-lg dark:hover:shadow-sky-950/20 transition-all duration-200 text-left cursor-pointer"
              >
                {/* Header: Icon & Badges */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-sky-950/60 group-hover:bg-[#0060AA] dark:group-hover:bg-sky-500 text-[#0060AA] dark:text-sky-400 group-hover:text-white flex items-center justify-center transition-colors shrink-0 shadow-2xs">
                      <IconRenderer name={item.icon} size={24} />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {item.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                          {item.badge}
                        </span>
                      )}

                      {/* Launch Icon */}
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

                {/* In-charge Pills & Category footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 dark:text-slate-500 font-medium truncate max-w-[55%]">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-semibold text-[#0060AA] dark:text-sky-400 group-hover:underline">
                      เข้าใช้งาน &rarr;
                    </span>
                  </div>

                  {/* In-charge badges */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{t('internal.in_charge_label')}:</span>
                    {item.inCharge.map(ic => (
                      <span
                        key={ic}
                        className={`text-[10px] px-1.5 py-0.2 rounded border font-mono font-medium ${getInChargeBadgeStyle(ic)}`}
                      >
                        {ic}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};
