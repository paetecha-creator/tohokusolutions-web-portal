/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { InternalUser } from '../types';

interface AuthContextType {
  currentUser: InternalUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password?: string) => { success: boolean; message: string };
  logout: () => void;
  quickLogin: (userId: string) => void;
  sessionExpiryMinutes: number;
  setSessionExpiryMinutes: (mins: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'tohokuse_auth_session';

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  users: InternalUser[];
  onLogAction: (action: any, details: string, meta?: any) => void;
}> = ({ children, users, onLogAction }) => {
  const [currentUser, setCurrentUser] = useState<InternalUser | null>(null);
  const [sessionExpiryMinutes, setSessionExpiryMinutes] = useState<number>(240); // 4 hours default

  // Restore session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        if (parsed.expiresAt && now > parsed.expiresAt) {
          // expired
          localStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(STORAGE_KEY);
        } else {
          // find updated user in current users list
          const found = users.find(u => 
            u.id === parsed.user.id || 
            u.username.toLowerCase() === parsed.user.username.toLowerCase()
          );
          if (found) {
            if (found.status === 'Active') {
              setCurrentUser(found);
            } else {
              // user was suspended
              localStorage.removeItem(STORAGE_KEY);
              sessionStorage.removeItem(STORAGE_KEY);
              setCurrentUser(null);
            }
          } else {
            // user was deleted
            localStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(STORAGE_KEY);
            setCurrentUser(null);
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
    }
  }, [users]);

  const saveSession = (user: InternalUser) => {
    const expiresAt = Date.now() + sessionExpiryMinutes * 60 * 1000;
    const sessionData = {
      user,
      expiresAt,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {
      console.warn('localStorage not available, fallback to state only', e);
    }
  };

  /**
   * Login by username and password
   */
  const login = (usernameInput: string, passwordInput?: string): { success: boolean; message: string } => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = (passwordInput || '').trim();

    if (!cleanUser) {
      return { success: false, message: 'กรุณาระบุชื่อผู้ใช้งาน (Username) หรืออีเมล' };
    }
    if (!cleanPass) {
      return { success: false, message: 'กรุณาระบุรหัสผ่าน (Password)' };
    }

    // Match by username or email
    const user = users.find(u => 
      u.username.toLowerCase() === cleanUser || 
      (u.email && u.email.toLowerCase() === cleanUser)
    );

    if (!user) {
      onLogAction('LOGIN_FAILED', `เข้าสู่ระบบถูกปฏิเสธ: ไม่พบชื่อผู้ใช้ "${usernameInput}" ในระบบ`);
      return { 
        success: false, 
        message: `เข้าสู่ระบบไม่ได้: ไม่พบบัญชีผู้ใช้ "${usernameInput}" ในระบบ` 
      };
    }

    if (user.status === 'Suspended') {
      onLogAction('LOGIN_FAILED', `เข้าสู่ระบบถูกปฏิเสธ: บัญชี "${user.username}" ถูกระงับการใช้งาน`);
      return { 
        success: false, 
        message: `บัญชีผู้ใช้ "${user.name}" ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ (Admin)` 
      };
    }

    // Verify password
    const expectedPassword = user.password || '122333';
    if (cleanPass !== expectedPassword) {
      onLogAction('LOGIN_FAILED', `เข้าสู่ระบบถูกปฏิเสธ: รหัสผ่านไม่ถูกต้องสำหรับบัญชี "${user.username}"`, {
        userId: user.id,
        username: user.username,
        userRole: user.role,
        userDepartment: user.department,
      });
      return {
        success: false,
        message: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
      };
    }

    // Success - user verified
    const updatedUser: InternalUser = {
      ...user,
      lastLogin: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);
    saveSession(updatedUser);

    onLogAction('LOGIN_SUCCESS', `เข้าสู่ระบบสำเร็จ: ${user.name} (@${user.username}) [สิทธิ์: ${user.role} | แผนก: ${user.department} | In-charge: ${user.inChargeScopes.join(', ')}]`, {
      userId: user.id,
      username: user.username,
      userRole: user.role,
      userDepartment: user.department,
    });

    return { success: true, message: `ยินดีต้อนรับ ${user.name}` };
  };

  const logout = () => {
    if (currentUser) {
      onLogAction('LOGOUT', `ออกจากระบบโดยผู้ใช้ "${currentUser.username}" (${currentUser.name})`, {
        userId: currentUser.id,
        username: currentUser.username,
        userRole: currentUser.role,
        userDepartment: currentUser.department,
      });
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  const quickLogin = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      if (user.status === 'Suspended') {
        alert(`บัญชี ${user.name} ถูกระงับการใช้งาน`);
        return;
      }
      const updatedUser: InternalUser = { ...user, lastLogin: new Date().toISOString() };
      setCurrentUser(updatedUser);
      saveSession(updatedUser);
      onLogAction('LOGIN_SUCCESS', `เข้าสู่ระบบผ่านการเลือกผู้ใช้: ${user.name} (@${user.username}) [${user.role}]`, {
        userId: user.id,
        username: user.username,
        userRole: user.role,
        userDepartment: user.department,
      });
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        quickLogin,
        sessionExpiryMinutes,
        setSessionExpiryMinutes,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
