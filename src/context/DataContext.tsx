/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  SheetPublicItem, 
  SheetInternalItem, 
  InternalUser, 
  AccessLog, 
  AccessActionType, 
  UserRole,
  SiteContentConfig,
  SiteAnnouncement
} from '../types';
import { 
  INITIAL_PUBLIC_ITEMS, 
  INITIAL_INTERNAL_ITEMS, 
  INITIAL_INTERNAL_USERS, 
  INITIAL_ACCESS_LOGS,
  INITIAL_SITE_CONFIG
} from '../data/initialData';

interface DataContextType {
  publicItems: SheetPublicItem[];
  internalItems: SheetInternalItem[];
  users: InternalUser[];
  accessLogs: AccessLog[];
  siteConfig: SiteContentConfig;
  
  // User Operations
  addUser: (user: Omit<InternalUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<InternalUser>) => void;
  deleteUser: (id: string) => boolean;
  bulkUpsertUsers: (incomingUsers: Omit<InternalUser, 'id' | 'createdAt'>[]) => { added: number; updated: number };
  replaceAllUsers: (incomingUsers: Omit<InternalUser, 'id' | 'createdAt'>[]) => number;

  // Link Operations
  addPublicItem: (item: Omit<SheetPublicItem, 'id'>) => void;
  updatePublicItem: (id: string, updates: Partial<SheetPublicItem>) => void;
  deletePublicItem: (id: string) => void;
  addInternalItem: (item: Omit<SheetInternalItem, 'id'>) => void;
  updateInternalItem: (id: string, updates: Partial<SheetInternalItem>) => void;
  deleteInternalItem: (id: string) => void;

  // Site Content Customization (Admin Only)
  updateSiteConfig: (config: Partial<SiteContentConfig>) => void;
  addAnnouncement: (announcement: Omit<SiteAnnouncement, 'id'>) => void;
  updateAnnouncement: (id: string, updates: Partial<SiteAnnouncement>) => void;
  deleteAnnouncement: (id: string) => void;
  resetSiteConfig: () => void;

  // Log Operations
  logAction: (action: AccessActionType, details: string, meta?: Partial<AccessLog>) => void;
  clearLogs: () => void;

  // Reset
  resetToDefaultData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PUBLIC: 'tohokuse_public_items',
  INTERNAL: 'tohokuse_internal_items',
  USERS: 'tohokuse_internal_users',
  LOGS: 'tohokuse_access_logs',
  SITE_CONFIG: 'tohokuse_site_config',
};

export const normalizeRole = (role?: string): UserRole => {
  if (!role) return 'user';
  return String(role).trim().toLowerCase() === 'admin' ? 'admin' : 'user';
};

export const normalizeInChargeList = (list: string[]): string[] => {
  if (!list || !Array.isArray(list) || list.length === 0) return ['other'];
  const normalized = new Set<string>();

  list.forEach(item => {
    if (!item) return;
    const clean = String(item).trim();
    const lower = clean.toLowerCase();
    if (lower === 'admin') normalized.add('admin');
    else if (lower === 'ga') normalized.add('GA');
    else if (lower === 'su' || lower === 'it') normalized.add('SU');
    else if (lower === 'hr') normalized.add('HR');
    else if (lower === 'other' || lower === 'all' || lower === 'staff') normalized.add('other');
    else if (
      lower === 'accounting' || 
      lower === 'manager' || 
      lower === 'production' || 
      lower === 'logistics' || 
      lower === 'qa'
    ) {
      normalized.add('GA');
    } else {
      normalized.add('other');
    }
  });

  return Array.from(normalized);
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publicItems, setPublicItems] = useState<SheetPublicItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PUBLIC);
      return saved ? JSON.parse(saved) : INITIAL_PUBLIC_ITEMS;
    } catch {
      return INITIAL_PUBLIC_ITEMS;
    }
  });

  const [internalItems, setInternalItems] = useState<SheetInternalItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INTERNAL);
      if (saved) {
        const parsed: SheetInternalItem[] = JSON.parse(saved);
        return parsed.map(item => ({
          ...item,
          inCharge: normalizeInChargeList(item.inCharge),
        }));
      }
      return INITIAL_INTERNAL_ITEMS;
    } catch {
      return INITIAL_INTERNAL_ITEMS;
    }
  });

  const [users, setUsers] = useState<InternalUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) {
        const parsed: any[] = JSON.parse(saved);
        const userMap = new Map<string, InternalUser>();
        // Ensure standard users from Excel table exist
        INITIAL_INTERNAL_USERS.forEach(u => userMap.set(u.username.toLowerCase(), u));

        parsed.forEach(user => {
          const uKey = (user.username || '').toLowerCase();
          const base = userMap.get(uKey);
          const isAdm = uKey === 'admin';
          userMap.set(uKey, {
            ...user,
            password: isAdm && (!user.password || user.password === '122333') 
              ? 'admin' 
              : (user.password || base?.password || (isAdm ? 'admin' : '122333')),
            role: isAdm ? 'admin' : normalizeRole(user.role),
            status: isAdm ? 'Active' : (user.status || 'Active'),
            inChargeScopes: isAdm ? ['admin', 'GA', 'SU', 'HR', 'other'] : normalizeInChargeList(user.inChargeScopes),
          });
        });

        // Ensure admin user is strictly present
        if (!userMap.has('admin')) {
          const defaultAdmin = INITIAL_INTERNAL_USERS.find(u => u.username === 'admin');
          if (defaultAdmin) userMap.set('admin', defaultAdmin);
        }

        return Array.from(userMap.values());
      }
      return INITIAL_INTERNAL_USERS;
    } catch {
      return INITIAL_INTERNAL_USERS;
    }
  });

  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : INITIAL_ACCESS_LOGS;
    } catch {
      return INITIAL_ACCESS_LOGS;
    }
  });

  const [siteConfig, setSiteConfig] = useState<SiteContentConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SITE_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SITE_CONFIG,
          ...parsed,
          announcements: Array.isArray(parsed.announcements)
            ? parsed.announcements
            : INITIAL_SITE_CONFIG.announcements,
        };
      }
      return INITIAL_SITE_CONFIG;
    } catch {
      return INITIAL_SITE_CONFIG;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PUBLIC, JSON.stringify(publicItems));
  }, [publicItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INTERNAL, JSON.stringify(internalItems));
  }, [internalItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(accessLogs));
  }, [accessLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(siteConfig));
  }, [siteConfig]);

  const logAction = (action: AccessActionType, details: string, meta: Partial<AccessLog> = {}) => {
    const newLog: AccessLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      username: meta.username || 'System',
      userId: meta.userId,
      userRole: meta.userRole,
      userDepartment: meta.userDepartment,
      targetApp: meta.targetApp,
      inCharge: meta.inCharge,
      ipAddress: meta.ipAddress || '192.168.1.' + Math.floor(Math.random() * 150 + 20),
    };

    setAccessLogs(prev => [newLog, ...prev]);
  };

  // User CRUD
  const addUser = (userData: Omit<InternalUser, 'id' | 'createdAt'>) => {
    const newUser: InternalUser = {
      ...userData,
      password: userData.password?.trim() || '122333',
      role: normalizeRole(userData.role),
      inChargeScopes: normalizeInChargeList(userData.inChargeScopes),
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [newUser, ...prev]);
    logAction('USER_CREATED', `สร้างผู้ใช้ใหม่: ${newUser.name} (${newUser.username}) บทบาท: ${newUser.role}`);
  };

  const updateUser = (id: string, updates: Partial<InternalUser>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const updated = { 
            ...u, 
            ...updates,
            ...(updates.role ? { role: normalizeRole(updates.role) } : {}),
            ...(updates.inChargeScopes ? { inChargeScopes: normalizeInChargeList(updates.inChargeScopes) } : {}),
          };
          logAction('USER_UPDATED', `แก้ไขข้อมูลผู้ใช้: ${updated.name} (${updated.username}) สิทธิ์: ${updated.role} สถานะ: ${updated.status}`);
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = (id: string): boolean => {
    const target = users.find(u => u.id === id);
    if (!target) return false;
    setUsers(prev => prev.filter(u => u.id !== id));
    logAction('USER_DELETED', `ลบผู้ใช้: ${target.name} (${target.username}) ออกจากระบบชีตผู้ใช้งาน`);
    return true;
  };

  // Bulk operations from Excel Import
  const bulkUpsertUsers = (incomingUsers: Omit<InternalUser, 'id' | 'createdAt'>[]) => {
    let addedCount = 0;
    let updatedCount = 0;

    setUsers(prev => {
      const userMap = new Map<string, InternalUser>();
      prev.forEach(u => userMap.set(u.username.toLowerCase(), u));

      incomingUsers.forEach(inc => {
        const key = inc.username.trim().toLowerCase();
        if (!key) return;

        const role = normalizeRole(inc.role);
        const inChargeScopes = normalizeInChargeList(inc.inChargeScopes);

        if (userMap.has(key)) {
          const existing = userMap.get(key)!;
          userMap.set(key, {
            ...existing,
            ...inc,
            password: inc.password?.trim() || existing.password || '122333',
            role,
            inChargeScopes,
          });
          updatedCount++;
        } else {
          const newUser: InternalUser = {
            ...inc,
            password: inc.password?.trim() || '122333',
            id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            role,
            inChargeScopes,
            createdAt: new Date().toISOString(),
          };
          userMap.set(key, newUser);
          addedCount++;
        }
      });

      return Array.from(userMap.values());
    });

    logAction('USER_IMPORT_EXCEL', `นำเข้าข้อมูลผู้ใช้จากไฟล์ Excel สำเร็จ: เพิ่มใหม่ ${addedCount} รายการ, อัปเดต ${updatedCount} รายการ`);
    return { added: addedCount, updated: updatedCount };
  };

  const replaceAllUsers = (incomingUsers: Omit<InternalUser, 'id' | 'createdAt'>[]) => {
    const newUsers: InternalUser[] = incomingUsers.map((inc, idx) => ({
      ...inc,
      password: inc.password?.trim() || '122333',
      id: `usr-${Date.now()}-${idx}`,
      role: normalizeRole(inc.role),
      inChargeScopes: normalizeInChargeList(inc.inChargeScopes),
      createdAt: new Date().toISOString(),
    }));

    setUsers(newUsers);
    logAction('USER_IMPORT_EXCEL', `เขียนทับรายชื่อผู้ใช้ทั้งหมดจากไฟล์ Excel (${newUsers.length} บัญชี)`);
    return newUsers.length;
  };

  // Public items CRUD
  const addPublicItem = (item: Omit<SheetPublicItem, 'id'>) => {
    const newItem: SheetPublicItem = {
      ...item,
      id: `pub-${Date.now()}`,
    };
    setPublicItems(prev => [...prev, newItem]);
    logAction('LINK_CREATED', `เพิ่มลิงก์สาธารณะ: ${newItem.title}`);
  };

  const updatePublicItem = (id: string, updates: Partial<SheetPublicItem>) => {
    setPublicItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
    logAction('LINK_UPDATED', `อัปเดตข้อมูลลิงก์สาธารณะ ID: ${id}`);
  };

  const deletePublicItem = (id: string) => {
    const target = publicItems.find(i => i.id === id);
    setPublicItems(prev => prev.filter(i => i.id !== id));
    if (target) {
      logAction('LINK_DELETED', `ลบลิงก์สาธารณะ: ${target.title}`);
    }
  };

  // Internal items CRUD
  const addInternalItem = (item: Omit<SheetInternalItem, 'id'>) => {
    const newItem: SheetInternalItem = {
      ...item,
      inCharge: normalizeInChargeList(item.inCharge),
      id: `int-${Date.now()}`,
    };
    setInternalItems(prev => [...prev, newItem]);
    logAction('LINK_CREATED', `เพิ่มลิงก์ภายใน: ${newItem.title} (In-charge: ${newItem.inCharge.join(', ')})`);
  };

  const updateInternalItem = (id: string, updates: Partial<SheetInternalItem>) => {
    setInternalItems(prev =>
      prev.map(item => (
        item.id === id 
          ? { 
              ...item 
              , ...updates,
              ...(updates.inCharge ? { inCharge: normalizeInChargeList(updates.inCharge) } : {}),
            } 
          : item
      ))
    );
    logAction('LINK_UPDATED', `อัปเดตข้อมูลลิงก์ภายใน ID: ${id}`);
  };

  const deleteInternalItem = (id: string) => {
    const target = internalItems.find(i => i.id === id);
    setInternalItems(prev => prev.filter(i => i.id !== id));
    if (target) {
      logAction('LINK_DELETED', `ลบลิงก์ภายใน: ${target.title}`);
    }
  };

  // Site Configuration & Text Customization
  const updateSiteConfig = (updates: Partial<SiteContentConfig>) => {
    setSiteConfig(prev => ({
      ...prev,
      ...updates,
    }));
    logAction('SITE_UPDATED', 'แก้ไขและปรับปรุงข้อความบนหน้าเว็บ (Site Content & Announcements)');
  };

  const addAnnouncement = (ann: Omit<SiteAnnouncement, 'id'>) => {
    const newAnn: SiteAnnouncement = {
      ...ann,
      id: `ann-${Date.now()}`,
    };
    setSiteConfig(prev => ({
      ...prev,
      announcements: [newAnn, ...(prev.announcements || [])],
    }));
    logAction('SITE_UPDATED', `เพิ่มประกาศใหม่: "${newAnn.titleTh || newAnn.titleEn}"`);
  };

  const updateAnnouncement = (id: string, updates: Partial<SiteAnnouncement>) => {
    setSiteConfig(prev => ({
      ...prev,
      announcements: (prev.announcements || []).map(a => a.id === id ? { ...a, ...updates } : a),
    }));
    logAction('SITE_UPDATED', `แก้ไขประกาศ ID: ${id}`);
  };

  const deleteAnnouncement = (id: string) => {
    setSiteConfig(prev => {
      const target = (prev.announcements || []).find(a => a.id === id);
      if (target) {
        logAction('SITE_UPDATED', `ลบประกาศ: "${target.titleTh || target.titleEn}"`);
      }
      return {
        ...prev,
        announcements: (prev.announcements || []).filter(a => a.id !== id),
      };
    });
  };

  const resetSiteConfig = () => {
    setSiteConfig(INITIAL_SITE_CONFIG);
    logAction('SITE_UPDATED', 'รีเซ็ตข้อความหน้าเว็บกลับเป็นค่ามาตรฐานเริ่มต้น');
  };

  const clearLogs = () => {
    setAccessLogs([]);
  };

  const resetToDefaultData = () => {
    setPublicItems(INITIAL_PUBLIC_ITEMS);
    setInternalItems(INITIAL_INTERNAL_ITEMS);
    setUsers(INITIAL_INTERNAL_USERS);
    setAccessLogs(INITIAL_ACCESS_LOGS);
    setSiteConfig(INITIAL_SITE_CONFIG);
    logAction('SITE_UPDATED', 'รีเซ็ตข้อมูลทั้งหมดกลับเป็นค่ามาตรฐานเริ่มต้น (Default Seed Data)');
  };

  return (
    <DataContext.Provider
      value={{
        publicItems,
        internalItems,
        users,
        accessLogs,
        siteConfig,
        addUser,
        updateUser,
        deleteUser,
        bulkUpsertUsers,
        replaceAllUsers,
        addPublicItem,
        updatePublicItem,
        deletePublicItem,
        addInternalItem,
        updateInternalItem,
        deleteInternalItem,
        updateSiteConfig,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        resetSiteConfig,
        logAction,
        clearLogs,
        resetToDefaultData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
