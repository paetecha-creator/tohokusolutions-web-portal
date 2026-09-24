/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TohokuLogo } from './TohokuLogo';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { GlobalSearch } from './GlobalSearch';
import { 
  Globe, 
  Lock, 
  ShieldAlert, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  Sliders, 
  Languages,
  Search
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'public' | 'internal' | 'admin';
  setActiveTab: (tab: 'public' | 'internal' | 'admin') => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogin,
}) => {
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage, t } = useApp();
  const { siteConfig } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const brandTitle = language === 'th' ? siteConfig.brandNameTh : siteConfig.brandNameEn;
  const brandSub = language === 'th' ? siteConfig.brandSubTh : siteConfig.brandSubEn;

  const navItems = [
    {
      id: 'public' as const,
      label: t('nav.public'),
      sublabel: t('nav.public_sub'),
      icon: Globe,
      visible: true,
    },
    {
      id: 'internal' as const,
      label: t('nav.internal'),
      sublabel: t('nav.internal_sub'),
      icon: Lock,
      visible: true,
      badge: isAuthenticated ? undefined : t('nav.requires_login'),
    },
    {
      id: 'admin' as const,
      label: t('nav.admin'),
      sublabel: t('nav.admin_sub'),
      icon: Sliders,
      visible: isAdmin,
      badge: t('nav.admin_only'),
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          
          {/* Logo & Brand */}
          <div 
            className="cursor-pointer transition-opacity hover:opacity-90 flex items-center gap-3 shrink-0"
            onClick={() => setActiveTab('public')}
          >
            <TohokuLogo size="md" />
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-extrabold text-[#003865] dark:text-sky-300 tracking-tight leading-tight">
                {brandTitle}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {brandSub}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs & Global Search */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-1 justify-center max-w-2xl px-2">
            {/* Desktop Navigation Tabs */}
            <nav className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700 shadow-xs shrink-0">
              {navItems.filter(item => item.visible).map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'internal' && !isAuthenticated) {
                        onOpenLogin();
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 relative cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-[#0060AA] dark:text-sky-400 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0060AA] dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-normal bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Global Search Bar on Desktop */}
            <div className="flex-1 min-w-[200px] max-w-sm">
              <GlobalSearch 
                onOpenLogin={onOpenLogin}
                setActiveTab={setActiveTab}
              />
            </div>
          </div>

          {/* Right Action Controls: Language Toggle and User Login */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Language Toggle Button (TH - EN) */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setLanguage('th')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'th'
                    ? 'bg-white dark:bg-slate-900 text-[#0060AA] dark:text-sky-400 shadow-2xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                TH
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-900 text-[#0060AA] dark:text-sky-400 shadow-2xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                EN
              </button>
            </div>

            {/* User State */}
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[130px]">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold uppercase ${
                      currentUser.role === 'admin'
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                        : 'bg-blue-50 text-[#0060AA] border-blue-200 dark:bg-blue-950 dark:text-sky-300 dark:border-blue-800'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title={t('nav.logout')}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#0060AA] hover:bg-[#004f8c] shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('nav.login')}</span>
              </button>
            )}
          </div>

          {/* Mobile Action Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            {/* Quick Mobile Search Button */}
            <button
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                mobileSearchOpen
                  ? 'border-[#0060AA] bg-blue-50 text-[#0060AA] dark:bg-blue-950 dark:text-sky-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
              aria-label="ค้นหา"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Quick Lang Toggle */}
            <button
              onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0060AA] dark:text-sky-400"
            >
              {language.toUpperCase()}
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (mobileSearchOpen) setMobileSearchOpen(false);
              }}
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="เมนูหลัก"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Top Search Bar Bar (Expands under header) */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 shadow-md animate-fade-in">
          <GlobalSearch 
            onOpenLogin={onOpenLogin}
            setActiveTab={setActiveTab}
            isMobileDrawer={false}
            onItemSelect={() => setMobileSearchOpen(false)}
          />
        </div>
      )}

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-3 shadow-lg">
          {/* User Profile Info on Mobile */}
          {isAuthenticated && currentUser ? (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">@{currentUser.username} • {currentUser.department}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-sky-300">
                {currentUser.role}
              </span>
            </div>
          ) : null}

          {/* Search inside Mobile Menu */}
          <div className="pb-1">
            <GlobalSearch 
              onOpenLogin={onOpenLogin}
              setActiveTab={setActiveTab}
              isMobileDrawer={true}
              onItemSelect={() => setMobileMenuOpen(false)}
            />
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {navItems.filter(item => item.visible).map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'internal' && !isAuthenticated) {
                      onOpenLogin();
                    } else {
                      setActiveTab(item.id);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0060AA] text-white font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Login / Logout Button on Mobile */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.logout')}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white bg-[#0060AA] hover:bg-[#004f8c]"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('nav.login')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
