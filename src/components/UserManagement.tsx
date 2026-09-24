/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useApp } from '../context/AppContext';
import { InternalUser, UserRole } from '../types';
import { 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Lock, 
  Mail, 
  Building, 
  Filter,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Upload,
  FileDown,
  RefreshCw,
  Info
} from 'lucide-react';

const AVAILABLE_ROLES: UserRole[] = ['admin', 'user'];
const AVAILABLE_SCOPES = ['admin', 'GA', 'SU', 'HR', 'other'] as const;

export const UserManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, addUser, updateUser, deleteUser, bulkUpsertUsers, replaceAllUsers } = useData();
  const { t, language } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<InternalUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<InternalUser | null>(null);
  
  // Excel Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedRows, setImportedRows] = useState<Omit<InternalUser, 'id' | 'createdAt'>[]>([]);
  const [importMode, setImportMode] = useState<'upsert' | 'replace'>('upsert');
  const [importFileName, setImportFileName] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
    name: string;
    email: string;
    department: string;
    role: UserRole;
    inChargeScopes: string[];
    status: 'Active' | 'Suspended';
  }>({
    username: '',
    password: '',
    name: '',
    email: '',
    department: '',
    role: 'user',
    inChargeScopes: ['other'],
    status: 'Active',
  });

  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      department: '',
      role: 'user',
      inChargeScopes: ['other'],
      status: 'Active',
    });
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: InternalUser) => {
    setEditingUser(user);
    const validScopes = (user.inChargeScopes || []).filter(s =>
      (AVAILABLE_SCOPES as readonly string[]).includes(s)
    );
    setFormData({
      username: user.username,
      password: user.password || '',
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role === 'admin' ? 'admin' : 'user',
      inChargeScopes: validScopes.length > 0 ? validScopes : ['other'],
      status: user.status,
    });
    setFormError(null);
  };

  const handleToggleScope = (scope: string) => {
    setFormData(prev => {
      const exists = prev.inChargeScopes.includes(scope);
      if (exists) {
        if (prev.inChargeScopes.length <= 1) return prev; // keep at least one
        return { ...prev, inChargeScopes: prev.inChargeScopes.filter(s => s !== scope) };
      } else {
        return { ...prev, inChargeScopes: [...prev.inChargeScopes, scope] };
      }
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.username.trim() || !formData.name.trim()) {
      setFormError('กรุณากรอกชื่อผู้ใช้ (Username) และชื่อ-นามสกุลให้ครบถ้วน');
      return;
    }

    if (isAddModalOpen) {
      // Check duplicate username
      if (users.some(u => u.username.toLowerCase() === formData.username.trim().toLowerCase())) {
        setFormError(`ชื่อผู้ใช้ "${formData.username}" มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`);
        return;
      }

      addUser({
        username: formData.username.trim().toLowerCase(),
        password: formData.password || undefined,
        name: formData.name.trim(),
        email: formData.email.trim(),
        department: formData.department.trim() || 'General',
        role: formData.role,
        inChargeScopes: formData.inChargeScopes,
        status: formData.status,
      });
      setIsAddModalOpen(false);
    } else if (editingUser) {
      updateUser(editingUser.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        department: formData.department.trim(),
        role: formData.role,
        inChargeScopes: formData.inChargeScopes,
        status: formData.status,
        ...(formData.password ? { password: formData.password } : {}),
      });
      setEditingUser(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingUser) return;
    if (deletingUser.id === currentUser?.id) {
      alert('ไม่สามารถลบบัญชีผู้ดูแลระบบที่กำลังใช้งานอยู่ได้');
      return;
    }
    deleteUser(deletingUser.id);
    setDeletingUser(null);
  };

  // EXCEL EXPORT
  const handleExportExcel = () => {
    const dataToExport = users.map(u => ({
      Username: u.username,
      Password: u.password || '122333',
      Name: u.name,
      Email: u.email,
      Department: u.department,
      Role: u.role, // 'admin' | 'user'
      'In-charge': u.inChargeScopes.join(', '),
      Status: u.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Internal-user');
    
    // Auto-fit column widths
    const maxCols = [
      { wch: 15 }, // Username
      { wch: 15 }, // Password
      { wch: 30 }, // Name
      { wch: 25 }, // Email
      { wch: 25 }, // Department
      { wch: 10 }, // Role
      { wch: 25 }, // In-charge
      { wch: 12 }, // Status
    ];
    worksheet['!cols'] = maxCols;

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `tohokuse_users_${dateStr}.xlsx`);
  };

  // DOWNLOAD TEMPLATE
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Username: 'admin',
        Password: '122333',
        Name: 'Techasit Kaeowichian (System Administrator)',
        Email: 'techasit.kaeowichian@tohokusolutions.com',
        Department: 'SU',
        Role: 'admin',
        'In-charge': 'admin, GA, SU, HR, other',
        Status: 'Active',
      },
      {
        Username: '15046',
        Password: '122333',
        Name: 'ปราศิณี สุภรณ์ (Prarinee Suporn)',
        Email: 'prarinee.suporn@tohokusolutions.com',
        Department: 'SU',
        Role: 'user',
        'In-charge': 'SU, other',
        Status: 'Active',
      },
      {
        Username: '15115',
        Password: '122333',
        Name: 'สกุลรัตน์ คำอินทร์ (Sakulrat Kham-in)',
        Email: 'sakulrat.kham-in@tohokusolutions.com',
        Department: 'HR',
        Role: 'user',
        'In-charge': 'HR, other',
        Status: 'Active',
      },
      {
        Username: '15193',
        Password: '122333',
        Name: 'จิราวรรณ วงศ์บุดดี (Jirawan Wongbuddee)',
        Email: 'jirawan.wongbuddee@tohokusolutions.com',
        Department: 'GA',
        Role: 'user',
        'In-charge': 'GA, other',
        Status: 'Active',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Internal-user');
    XLSX.writeFile(workbook, 'tohokuse_users_template.xlsx');
  };

  // EXCEL IMPORT PARSER
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportError(null);
    setImportSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setImportError('ไฟล์ว่างเปล่าหรือไม่พบข้อมูลผู้ใช้งานในชีต');
          return;
        }

        const parsedRows: Omit<InternalUser, 'id' | 'createdAt'>[] = [];

        rawJson.forEach((row, idx) => {
          // Normalize column names
          const username = String(row['Username'] || row['username'] || row['User'] || '').trim().toLowerCase();
          const password = String(row['Password'] || row['password'] || row['รหัสผ่าน'] || '122333').trim();
          const name = String(row['Name'] || row['name'] || row['Full Name'] || row['ชื่อ-นามสกุล'] || '').trim();
          if (!username || !name) return; // skip invalid row

          const email = String(row['Email'] || row['email'] || row['อีเมล'] || '').trim();
          const department = String(row['Department'] || row['department'] || row['แผนก'] || 'General').trim();
          
          const rawRole = String(row['Role'] || row['role'] || row['บทบาท'] || 'user').trim().toLowerCase();
          const role: UserRole = rawRole === 'admin' ? 'admin' : 'user';

          const inChargeRaw = String(row['In-charge'] || row['Incharge'] || row['inCharge'] || row['สิทธิ์'] || 'other');
          const inChargeScopes = inChargeRaw
            .split(/[,;|]/)
            .map(s => s.trim())
            .filter(Boolean);

          const rawStatus = String(row['Status'] || row['status'] || row['สถานะ'] || 'Active').trim();
          const status: 'Active' | 'Suspended' = 
            rawStatus.toLowerCase() === 'suspended' || rawStatus === 'ระงับ' ? 'Suspended' : 'Active';

          parsedRows.push({
            username,
            password: password || '122333',
            name,
            email,
            department,
            role,
            inChargeScopes: inChargeScopes.length > 0 ? inChargeScopes : ['other'],
            status,
          });
        });

        if (parsedRows.length === 0) {
          setImportError('ไม่พบข้อมูลแถวที่ถูกต้อง กรุณาตรวจสอบหัวตาราง (Username, Name, Role, In-charge)');
          return;
        }

        setImportedRows(parsedRows);
      } catch (err: any) {
        setImportError(`ไม่สามารถอ่านไฟล์ได้: ${err.message || 'รูปแบบไฟล์ไม่ถูกต้อง'}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = () => {
    if (importedRows.length === 0) return;

    if (importMode === 'upsert') {
      const { added, updated } = bulkUpsertUsers(importedRows);
      setImportSuccessMsg(`นำเข้าสำเร็จ: เพิ่มผู้ใช้ใหม่ ${added} รายการ และอัปเดตข้อมูล ${updated} รายการ`);
    } else {
      if (!window.confirm(`คำเตือน: คุณเลือกแบบเขียนทับทั้งหมด รายชื่อเดิมจะถูกแทนที่ด้วย ${importedRows.length} รายการจากไฟล์ คุณแน่ใจหรือไม่?`)) {
        return;
      }
      const total = replaceAllUsers(importedRows);
      setImportSuccessMsg(`เขียนทับรายชื่อผู้ใช้ทั้งหมดสำเร็จ (${total} รายการ)`);
    }

    setTimeout(() => {
      setIsImportModalOpen(false);
      setImportedRows([]);
      setImportFileName('');
      setImportSuccessMsg(null);
    }, 2000);
  };

  // Filtered list
  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadgeStyle = (role: UserRole) => {
    return role === 'admin'
      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
      : 'bg-blue-50 text-[#0060AA] border-blue-200 dark:bg-blue-950/60 dark:text-sky-300 dark:border-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0060AA] dark:text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              จัดการข้อมูลผู้ใช้งาน & สิทธิ์ In-charge
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            กำหนดบทบาท (admin / user), สิทธิ์ In-charge และนำเข้า-ส่งออกไฟล์ Excel ได้อย่างรวดเร็ว
          </p>
        </div>

        {/* Buttons: Add User + Excel Import/Export */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            title="ดาวน์โหลดรายชื่อผู้ใช้ทั้งหมดเป็นไฟล์ Excel"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>ส่งออก Excel</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => {
              setImportedRows([]);
              setImportFileName('');
              setImportError(null);
              setIsImportModalOpen(true);
            }}
            title="นำเข้าไฟล์ Excel แทนการกรอกข้อมูลทีละคน"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>นำเข้า Excel</span>
          </button>

          {/* Add New User */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0060AA] hover:bg-[#004f8c] shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>เพิ่มผู้ใช้งาน</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อผู้ใช้, ชื่อ-นามสกุล, แผนก, อีเมล..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0060AA]/20 focus:border-[#0060AA]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0060AA]/20"
          >
            <option value="all">บทบาททั้งหมด ({users.length})</option>
            <option value="admin">เฉพาะ Admin ({users.filter(u => u.role === 'admin').length})</option>
            <option value="user">เฉพาะ User ({users.filter(u => u.role === 'user').length})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">ชื่อผู้ใช้ (Username)</th>
                <th className="px-4 py-3 font-semibold">ชื่อ-นามสกุล & แผนก</th>
                <th className="px-4 py-3 font-semibold">บทบาท (Role)</th>
                <th className="px-4 py-3 font-semibold">สิทธิ์ In-charge</th>
                <th className="px-4 py-3 font-semibold">สถานะ</th>
                <th className="px-4 py-3 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    ไม่พบข้อมูลผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isCurrent = user.id === currentUser?.id;
                  return (
                    <tr 
                      key={user.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-[#0060AA] dark:text-sky-400">
                            @{user.username}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                              คุณ
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{user.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{user.department}</span>
                          {user.email && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400">{user.email}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${getRoleBadgeStyle(user.role)}`}>
                          {user.role === 'admin' ? (
                            <ShieldAlert className="w-3 h-3 text-red-500" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-[#0060AA]" />
                          )}
                          <span>{user.role}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {user.inChargeScopes.map(sc => (
                            <span
                              key={sc}
                              className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {sc}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {user.status === 'Active' ? 'เปิดใช้งาน' : 'ระงับการใช้'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#0060AA] hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => setDeletingUser(user)}
                            disabled={isCurrent}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isCurrent 
                                ? 'opacity-30 cursor-not-allowed text-slate-300' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                            }`}
                            title={isCurrent ? 'ไม่สามารถลบบัญชีตนเองได้' : 'ลบผู้ใช้'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD / EDIT USER */}
      {(isAddModalOpen || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0060AA]/10 text-[#0060AA] dark:bg-[#0060AA]/30 dark:text-sky-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {isAddModalOpen ? 'เพิ่มผู้ใช้งานใหม่' : `แก้ไขผู้ใช้: @${editingUser?.username}`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingUser(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveUser} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ชื่อผู้ใช้ (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="เช่น 15046 หรือ admin"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    รหัสผ่าน (Password)
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="เช่น 122333 (ค่าเริ่มต้น)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">หากเว้นว่าง ระบบจะใช้รหัสผ่าน 122333</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น สมชาย รักงาน"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    อีเมลองค์กร
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@tohokuse.co.th"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    แผนก / ฝ่าย
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    placeholder="เช่น IT, HR, Finance"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    บทบาท (Role) *
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="user">user (ผู้ใช้งานทั่วไป)</option>
                    <option value="admin">admin (ผู้ดูแลระบบสูงสุด)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    สถานะการใช้งาน
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active (เปิดใช้งาน)</option>
                    <option value="Suspended">Suspended (ระงับชั่วคราว)</option>
                  </select>
                </div>
              </div>

              {/* In-charge scopes selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  สิทธิ์ In-charge สำหรับเข้าถึงเว็บแอปภายใน (เลือกได้มากกว่า 1 ข้อ) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {AVAILABLE_SCOPES.map(scope => {
                    const isSelected = formData.inChargeScopes.includes(scope);
                    return (
                      <button
                        type="button"
                        key={scope}
                        onClick={() => handleToggleScope(scope)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0060AA] text-white border-[#0060AA] shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {scope}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  ตัวเลือกสิทธิ์ In-charge มีเพียง 5 ตัวเลือก: admin, GA, SU, HR, other
                </p>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0060AA] hover:bg-[#004f8c] shadow-xs"
                >
                  {isAddModalOpen ? 'บันทึกผู้ใช้ใหม่' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EXCEL IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    นำเข้าข้อมูลผู้ใช้งานจากไฟล์ Excel (.xlsx / .csv)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    อัปโหลดไฟล์ตารางรายชื่อผู้ใช้เพื่อเพิ่มหรือปรับปรุงข้อมูลแบบเป็นชุด
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Template Download Box */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Info className="w-4 h-4 text-[#0060AA] dark:text-sky-400 shrink-0" />
                  <span>ยังไม่มีรูปแบบตาราง? ดาวน์โหลดเทมเพลตตัวอย่างไปกรอกข้อมูลได้เลย</span>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs text-white bg-[#0060AA] hover:bg-[#004f8c] shrink-0 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดเทมเพลต</span>
                </button>
              </div>

              {/* Upload Input Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/40"
              >
                <Upload className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {importFileName ? `ไฟล์ที่เลือก: ${importFileName}` : 'คลิกเพื่อเลือกไฟล์ Excel (.xlsx, .xls, .csv)'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  รองรับไฟล์ Excel ทุกเวอร์ชัน และไฟล์ CSV
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Error Message */}
              {importError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Success Message */}
              {importSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}

              {/* Parsed Preview Table */}
              {importedRows.length > 0 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      พรีวิวข้อมูลที่จะนำเข้า ({importedRows.length} รายการ):
                    </span>
                    
                    {/* Import Mode Options */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'upsert'}
                          onChange={() => setImportMode('upsert')}
                          className="text-[#0060AA]"
                        />
                        <span>เพิ่ม & อัปเดตเดิม (Upsert)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-rose-600"
                        />
                        <span>เขียนทับทั้งหมด (Replace)</span>
                      </label>
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 text-[10px] text-slate-500 uppercase">
                        <tr>
                          <th className="px-3 py-2">Username</th>
                          <th className="px-3 py-2">ชื่อ</th>
                          <th className="px-3 py-2">แผนก</th>
                          <th className="px-3 py-2">Role</th>
                          <th className="px-3 py-2">In-charge</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {importedRows.slice(0, 10).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="px-3 py-1.5 font-mono text-[#0060AA] dark:text-sky-400 font-semibold">{r.username}</td>
                            <td className="px-3 py-1.5">{r.name}</td>
                            <td className="px-3 py-1.5">{r.department}</td>
                            <td className="px-3 py-1.5 font-bold">{r.role}</td>
                            <td className="px-3 py-1.5 text-[10px] text-slate-500">{r.inChargeScopes.join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importedRows.length > 10 && (
                    <p className="text-[11px] text-slate-400 text-center">
                      ...และอีก {importedRows.length - 10} รายการ
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={importedRows.length === 0}
                onClick={handleConfirmImport}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันการนำเข้า ({importedRows.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                ยืนยันการลบผู้ใช้งาน
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                คุณแน่ใจหรือไม่ว่าต้องการลบ <strong>{deletingUser.name}</strong> (@{deletingUser.username}) ออกจากระบบ?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                ลบผู้ใช้ทันที
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
