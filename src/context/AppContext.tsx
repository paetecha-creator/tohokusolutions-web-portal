/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'th' | 'en';
export type Theme = 'light' | 'dark';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  t: (key: string, fallback?: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'tohokuse_theme';
const LANG_STORAGE_KEY = 'tohokuse_lang';

export const translations: Record<Language, Record<string, string>> = {
  th: {
    // Navigation
    'nav.public': 'บริการสาธารณะ',
    'nav.public_sub': 'สำหรับทุกคน',
    'nav.internal': 'ระบบภายในแผนก',
    'nav.internal_sub': 'ระบบงานพนักงาน',
    'nav.admin': 'จัดการระบบ & ประวัติ',
    'nav.admin_sub': 'เฉพาะ Admin',
    'nav.login': 'เข้าสู่ระบบภายใน',
    'nav.logout': 'ออกจากระบบ',
    'nav.requires_login': 'ต้องล็อกอิน',
    'nav.admin_only': 'เฉพาะแอดมิน',
    'nav.role': 'บทบาท',

    // Theme & Language
    'theme.light': 'โหมดสว่าง',
    'theme.dark': 'โหมดมืด',
    'theme.switch_to_dark': 'เปลี่ยนเป็นโหมดกลางคืน (Dark Mode)',
    'theme.switch_to_light': 'เปลี่ยนเป็นโหมดสว่าง (Light Mode)',
    'lang.th': 'ไทย',
    'lang.en': 'English',

    // Public Portal
    'public.search_placeholder': 'ค้นหาบริการสาธารณะ, คีย์เวิร์ด, หมวดหมู่...',
    'public.all_categories': 'ทั้งหมด',
    'public.quick_access': 'บริการยอดนิยมแนะนำ',
    'public.no_results': 'ไม่พบรายการที่ค้นหา',
    'public.no_results_desc': 'ลองค้นหาด้วยคำสำคัญอื่น หรือล้างตัวกรองหมวดหมู่',
    'public.click_to_open': 'คลิกเพื่อเปิดเว็บแอป',
    'public.copy_link': 'คัดลอกลิงก์',
    'public.link_copied': 'คัดลอกลิงก์แล้ว!',

    // Internal Portal
    'internal.search_placeholder': 'ค้นหาเว็บแอปภายใน, In-charge, ระบบงาน...',
    'internal.permission_tag': 'สิทธิ์ In-charge ที่ได้รับ',
    'internal.department': 'แผนก',
    'internal.status_active': 'กำลังใช้งาน',
    'internal.admin_badge': 'ผู้ดูแลระบบ (Admin)',
    'internal.user_badge': 'ผู้ใช้งานทั่วไป (User)',
    'internal.admin_panel_btn': 'แผงควบคุมผู้ดูแล (Admin Dashboard)',
    'internal.admin_sim_title': 'โหมดผู้ดูแลระบบ: จำลองการแสดงผลตามสิทธิ์ In-charge ของแผนกต่างๆ',
    'internal.show_all_admin': 'แสดงทั้งหมด (Admin)',
    'internal.access_denied_title': 'พื้นที่สงวนสิทธิ์สำหรับบุคลากรภายใน',
    'internal.access_denied_desc': 'ระบบนี้เปิดให้เข้าใช้งานเฉพาะบุคลากรที่มีบัญชีผู้ใช้ในระบบ กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้งานและรหัสผ่าน',
    'internal.access_denied_btn': 'เข้าสู่ระบบบุคลากรภายใน (Login)',
    'internal.in_charge_label': 'สิทธิ์ In-charge',
    'internal.showing_items': 'แสดง',
    'internal.from_total': 'จากทั้งหมด',
    'internal.items_unit': 'รายการ',

    // Login Modal
    'login.title': 'เข้าสู่ระบบบุคลากรภายใน',
    'login.subtitle': 'เข้าสู่ระบบด้วยชื่อผู้ใช้งานและรหัสผ่านเพื่อตรวจสอบสิทธิ์ In-charge',
    'login.username_label': 'ชื่อผู้ใช้งาน (Username) หรืออีเมลองค์กร',
    'login.username_placeholder': 'เช่น admin, 15046, 15115, 15193',
    'login.password_label': 'รหัสผ่าน (Password)',
    'login.password_placeholder': 'กรอกรหัสผ่านของคุณ',
    'login.submit_btn': 'เข้าสู่ระบบทันที',
    'login.close': 'ยกเลิก / ปิด',

    // Admin Dashboard
    'admin.dashboard_title': 'แผงควบคุมระบบ & ประวัติการเข้าใช้งาน',
    'admin.back_to_portal': 'ดูหน้าเว็บพอร์ทัล',
    'admin.tab_users': 'จัดการผู้ใช้งาน',
    'admin.tab_users_sub': 'รายชื่อ & บทบาท (admin/user)',
    'admin.tab_logs': 'ประวัติการเข้าใช้งาน',
    'admin.tab_logs_sub': 'Access Audit Logs',
    'admin.tab_links': 'จัดการข้อมูลลิงก์',
    'admin.tab_links_sub': 'ลิงก์เว็บแอป Public & Internal',
    'admin.tab_site_texts': 'ตั้งค่าข้อความหน้าเว็บ',
    'admin.tab_site_texts_sub': 'แก้ไขข้อความ & ประกาศ',
    'admin.access_denied_title': 'สิทธิ์การเข้าถึงถูกจำกัด (Access Denied)',
    'admin.access_denied_desc': 'หน้าแผงควบคุมผู้ดูแลระบบ สงวนสิทธิ์เฉพาะผู้ใช้งานที่มีบทบาท admin เท่านั้น',
    'admin.login_as_admin': 'เข้าสู่ระบบด้วยบัญชี Admin',

    // User Management & Excel
    'user.export_excel': 'ส่งออก Excel (.xlsx)',
    'user.import_excel': 'นำเข้าจาก Excel (.xlsx / .csv)',
    'user.download_template': 'ดาวน์โหลดเทมเพลต Excel',
    'user.add_user': 'เพิ่มผู้ใช้งานใหม่',
    'user.col_username': 'ชื่อผู้ใช้ (Username)',
    'user.col_name': 'ชื่อ-นามสกุล',
    'user.col_dept': 'แผนก',
    'user.col_role': 'บทบาท (Role)',
    'user.col_incharge': 'สิทธิ์ In-charge',
    'user.col_status': 'สถานะ',
    'user.col_actions': 'จัดการ',
    'user.active': 'เปิดใช้งาน',
    'user.suspended': 'ถูกระงับ',
    'user.edit': 'แก้ไข',
    'user.delete': 'ลบ',

    // Footer
    'footer.company': 'Tohoku Solutions Co., Ltd.',
    'footer.all_rights': 'สงวนลิขสิทธิ์ทุกประการ',
    'footer.auth_check': 'เข้าสู่ระบบตรวจสอบสิทธิ์',
    'footer.hotline': 'สายด่วนติดต่อ',
    'footer.email': 'อีเมลสนับสนุน',
  },
  en: {
    // Navigation
    'nav.public': 'Public Services',
    'nav.public_sub': 'Open Portal',
    'nav.internal': 'Internal Portal',
    'nav.internal_sub': 'Employee Apps',
    'nav.admin': 'Admin Dashboard',
    'nav.admin_sub': 'Admin Only',
    'nav.login': 'Sign In',
    'nav.logout': 'Sign Out',
    'nav.requires_login': 'Sign In Required',
    'nav.admin_only': 'Admin Only',
    'nav.role': 'Role',

    // Theme & Language
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',
    'theme.switch_to_dark': 'Switch to Dark Mode',
    'theme.switch_to_light': 'Switch to Light Mode',
    'lang.th': 'ไทย',
    'lang.en': 'English',

    // Public Portal
    'public.search_placeholder': 'Search public services, keywords, categories...',
    'public.all_categories': 'All',
    'public.quick_access': 'Recommended Services',
    'public.no_results': 'No services found',
    'public.no_results_desc': 'Try searching with different keywords or clear filters',
    'public.click_to_open': 'Click to open web app',
    'public.copy_link': 'Copy link',
    'public.link_copied': 'Link copied!',

    // Internal Portal
    'internal.search_placeholder': 'Search internal apps, In-charge scopes, departments...',
    'internal.permission_tag': 'Assigned In-charge Scopes',
    'internal.department': 'Department',
    'internal.status_active': 'Active',
    'internal.admin_badge': 'Administrator (Admin)',
    'internal.user_badge': 'Standard User',
    'internal.admin_panel_btn': 'Admin Dashboard',
    'internal.admin_sim_title': 'Admin Preview: Simulate display by department In-charge scope',
    'internal.show_all_admin': 'Show All (Admin)',
    'internal.access_denied_title': 'Restricted Internal Portal',
    'internal.access_denied_desc': 'This portal is restricted to authorized employees. Please sign in using your username and password.',
    'internal.access_denied_btn': 'Sign In to Internal Portal',
    'internal.in_charge_label': 'In-charge Scope',
    'internal.showing_items': 'Showing',
    'internal.from_total': 'of',
    'internal.items_unit': 'apps',

    // Login Modal
    'login.title': 'Employee Portal Sign In',
    'login.subtitle': 'Sign in with your username and password to verify In-charge permissions',
    'login.username_label': 'Username or Corporate Email',
    'login.username_placeholder': 'e.g. admin, 15046, 15115, 15193',
    'login.password_label': 'Password',
    'login.password_placeholder': 'Enter your password',
    'login.submit_btn': 'Sign In Now',
    'login.close': 'Cancel / Close',

    // Admin Dashboard
    'admin.dashboard_title': 'System Admin & Access Audit Log',
    'admin.back_to_portal': 'View Portal',
    'admin.tab_users': 'User Management',
    'admin.tab_users_sub': 'Accounts & Roles (admin/user)',
    'admin.tab_logs': 'Access Audit Logs',
    'admin.tab_logs_sub': 'User Activity & Audit Trail',
    'admin.tab_links': 'Link Management',
    'admin.tab_links_sub': 'Public & Internal Web Apps',
    'admin.tab_site_texts': 'Site Text & Content',
    'admin.tab_site_texts_sub': 'Titles, Notices & Banners',
    'admin.access_denied_title': 'Access Denied',
    'admin.access_denied_desc': 'The Admin Dashboard is restricted to users with the admin role only.',
    'admin.login_as_admin': 'Sign In with Admin Account',

    // User Management & Excel
    'user.export_excel': 'Export Excel (.xlsx)',
    'user.import_excel': 'Import Excel (.xlsx / .csv)',
    'user.download_template': 'Download Excel Template',
    'user.add_user': 'Add New User',
    'user.col_username': 'Username',
    'user.col_name': 'Full Name',
    'user.col_dept': 'Department',
    'user.col_role': 'Role (admin/user)',
    'user.col_incharge': 'In-charge Scope',
    'user.col_status': 'Status',
    'user.col_actions': 'Actions',
    'user.active': 'Active',
    'user.suspended': 'Suspended',
    'user.edit': 'Edit',
    'user.delete': 'Delete',

    // Footer
    'footer.company': 'Tohoku Solutions Co., Ltd.',
    'footer.all_rights': 'All Rights Reserved.',
    'footer.auth_check': 'Access Verification Portal',
    'footer.hotline': 'Contact Hotline',
    'footer.email': 'Support Email',
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return (saved === 'en' || saved === 'th') ? saved : 'th';
    } catch {
      return 'th';
    }
  });

  // Enforce standard light mode and remove any residual dark class
  useEffect(() => {
    try {
      localStorage.removeItem(THEME_STORAGE_KEY);
      document.documentElement.classList.remove('dark');
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [theme] = useState<Theme>('light');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  const setTheme = (_newTheme: Theme) => {};

  const toggleTheme = () => {};

  const t = (key: string, fallback?: string): string => {
    return translations[language]?.[key] || fallback || key;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        theme,
        setTheme,
        toggleTheme,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
