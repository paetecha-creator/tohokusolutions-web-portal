/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TohokuLogo } from './TohokuLogo';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { Lock, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onOpenLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLogin }) => {
  const { t, language } = useApp();
  const { siteConfig } = useData();

  const footerAbout = language === 'th' ? siteConfig.footerAboutTh : siteConfig.footerAboutEn;
  const contactLocation = language === 'th' ? siteConfig.contactLocationTh : siteConfig.contactLocationEn;

  return (
    <footer className="mt-16 sm:mt-24 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs py-8 px-4 sm:px-6 lg:px-8 text-slate-500 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          {/* Brand Info */}
          <div className="space-y-1.5 max-w-md">
            <TohokuLogo size="sm" showText={true} />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              {footerAbout}
            </p>
          </div>

          {/* Quick Contact Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-[11px]">
            {siteConfig.contactPhone && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-[#0060AA] dark:text-sky-400" />
                <span>{siteConfig.contactPhone}</span>
              </div>
            )}
            {siteConfig.contactEmail && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-[#0060AA] dark:text-sky-400" />
                <a href={`mailto:${siteConfig.contactEmail}`} className="hover:underline">
                  {siteConfig.contactEmail}
                </a>
              </div>
            )}
            {contactLocation && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-[#0060AA] dark:text-sky-400" />
                <span>{contactLocation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Access */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <span className="text-slate-400 dark:text-slate-500">
            {siteConfig.copyrightText || '© 2026 Tohoku Solutions Co., Ltd. All Rights Reserved.'}
          </span>

          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenLogin}
              className="flex items-center gap-1 hover:text-[#0060AA] dark:hover:text-sky-400 cursor-pointer font-medium"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('footer.auth_check')}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
