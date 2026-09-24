/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { UserManagement } from './UserManagement';
import { AccessLogViewer } from './AccessLogViewer';
import { LinkManagement } from './LinkManagement';
import { SiteTextManagement } from './SiteTextManagement';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  History, 
  Layers, 
  FileText,
  Lock, 
  LogIn, 
  ArrowLeft
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToPublic: () => void;
  onOpenLogin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToPublic, onOpenLogin }) => {
  const { currentUser, isAuthenticated, isAdmin } = useAuth();
  const { t, language } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'logs' | 'links' | 'site_texts'>('users');

  // Security Gate: Strict role enforcement
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="py-16 max-w-md mx-auto text-center px-4 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {t('admin.access_denied_title')}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {t('admin.access_denied_desc')}
        </p>

        {isAuthenticated && currentUser && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            บัญชีปัจจุบันของคุณคือ <strong>{currentUser.name}</strong> (@{currentUser.username}) บทบาท: <span className="font-semibold text-slate-800 dark:text-white uppercase">{currentUser.role}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={onOpenLogin}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#0060AA] hover:bg-[#004f8c] shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{t('admin.login_as_admin')}</span>
          </button>
          <button
            onClick={onBackToPublic}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            {t('admin.back_to_portal')}
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { 
      id: 'users' as const, 
      label: t('admin.tab_users'), 
      sub: t('admin.tab_users_sub'), 
      icon: Users 
    },
    { 
      id: 'site_texts' as const, 
      label: t('admin.tab_site_texts'), 
      sub: t('admin.tab_site_texts_sub'), 
      icon: FileText 
    },
    { 
      id: 'links' as const, 
      label: t('admin.tab_links'), 
      sub: t('admin.tab_links_sub'), 
      icon: Layers 
    },
    { 
      id: 'logs' as const, 
      label: t('admin.tab_logs'), 
      sub: t('admin.tab_logs_sub'), 
      icon: History 
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#003865] to-[#0060AA] text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/30 text-red-200 border border-red-400/40 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            <span>สิทธิ์สูงสุด: ผู้ดูแลระบบ (Admin Access Only)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {t('admin.dashboard_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            ผู้ดูแลระบบ: {currentUser?.name || 'Admin'} (@{currentUser?.username || 'admin'}) • แผนก: {currentUser?.department || 'System'}
          </p>
        </div>

        <button
          onClick={onBackToPublic}
          className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('admin.back_to_portal')}</span>
        </button>
      </div>

      {/* Admin Sub-navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id)}
              className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-[#0060AA] shadow-xs text-[#0060AA] dark:text-sky-400'
                  : 'bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isActive ? 'bg-[#0060AA] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs sm:text-sm font-bold truncate">{tab.label}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{tab.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="transition-all">
        {activeAdminTab === 'users' && <UserManagement />}
        {activeAdminTab === 'site_texts' && <SiteTextManagement />}
        {activeAdminTab === 'links' && <LinkManagement />}
        {activeAdminTab === 'logs' && <AccessLogViewer />}
      </div>
    </div>
  );
};
