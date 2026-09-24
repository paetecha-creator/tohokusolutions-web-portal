/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Role is strictly 'admin' | 'user' as requested
export type UserRole = 'admin' | 'user';

// In-charge options are strictly 'admin' | 'GA' | 'SU' | 'HR' | 'other'
export type InChargeOption = 'admin' | 'GA' | 'SU' | 'HR' | 'other';
export const AVAILABLE_INCHARGE_OPTIONS: InChargeOption[] = ['admin', 'GA', 'SU', 'HR', 'other'];

export interface InternalUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  department: string;
  role: UserRole; // strictly: 'admin' | 'user'
  inChargeScopes: string[]; // strictly: ["admin", "GA", "SU", "HR", "other"]
  status: 'Active' | 'Suspended';
  createdAt: string;
  lastLogin?: string;
}

export interface SheetPublicItem {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  icon: string;
  color?: string;
  badge?: string;
  target?: string;
  order: number;
}

export interface SheetInternalItem {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  icon: string;
  color?: string;
  inCharge: string[]; // Options: ["admin", "GA", "SU", "HR", "other"]
  badge?: string;
  order: number;
  isFavorite?: boolean;
}

export type AccessActionType = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'APP_CLICK'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_IMPORT_EXCEL'
  | 'USER_EXPORT_EXCEL'
  | 'LINK_CREATED'
  | 'LINK_UPDATED'
  | 'LINK_DELETED'
  | 'SITE_UPDATED'
  | 'SHEET_SYNC';

export interface AccessLog {
  id: string;
  timestamp: string;
  userId?: string;
  username: string;
  userRole?: string;
  userDepartment?: string;
  action: AccessActionType;
  details: string;
  targetApp?: string;
  inCharge?: string;
  ipAddress?: string;
}

// Site Announcement model for custom admin broadcast messages
export interface SiteAnnouncement {
  id: string;
  enabled: boolean;
  type: 'info' | 'warning' | 'success';
  titleTh: string;
  titleEn: string;
  messageTh: string;
  messageEn: string;
  showOnPublic: boolean;
  showOnInternal: boolean;
}

// Configurable Site Texts and Content by Admin
export interface SiteContentConfig {
  brandNameTh: string;
  brandNameEn: string;
  brandSubTh: string;
  brandSubEn: string;
  
  publicBadgeTh: string;
  publicBadgeEn: string;
  publicTitleTh: string;
  publicTitleEn: string;
  publicSubtitleTh: string;
  publicSubtitleEn: string;
  
  internalBadgeTh: string;
  internalBadgeEn: string;
  internalTitleTh: string;
  internalTitleEn: string;
  internalSubtitleTh: string;
  internalSubtitleEn: string;
  
  footerAboutTh: string;
  footerAboutEn: string;
  contactEmail: string;
  contactPhone: string;
  contactLocationTh: string;
  contactLocationEn: string;
  copyrightText: string;

  announcements: SiteAnnouncement[];
}
