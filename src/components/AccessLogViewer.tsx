/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { AccessActionType, AccessLog } from '../types';
import { 
  History, 
  Search, 
  Download, 
  Trash2, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  LogIn, 
  LogOut, 
  ArrowUpRight, 
  UserCheck, 
  FileText,
  Activity,
  Layers,
  Sparkles,
  RotateCcw
} from 'lucide-react';

export const AccessLogViewer: React.FC = () => {
  const { accessLogs, clearLogs, users } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // Metrics
  const stats = useMemo(() => {
    const total = accessLogs.length;
    const logins = accessLogs.filter(l => l.action === 'LOGIN_SUCCESS').length;
    const appClicks = accessLogs.filter(l => l.action === 'APP_CLICK').length;
    const failedLogins = accessLogs.filter(l => l.action === 'LOGIN_FAILED').length;
    const uniqueUsers = new Set(accessLogs.map(l => l.username).filter(Boolean)).size;

    return { total, logins, appClicks, failedLogins, uniqueUsers };
  }, [accessLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return accessLogs.filter(log => {
      const matchesAction =
        selectedAction === 'all' ||
        (selectedAction === 'LOGINS' && (log.action === 'LOGIN_SUCCESS' || log.action === 'LOGIN_FAILED')) ||
        (selectedAction === 'APP_CLICK' && log.action === 'APP_CLICK') ||
        (selectedAction === 'USER_OPS' && log.action.startsWith('USER_')) ||
        log.action === selectedAction;

      const matchesUser =
        selectedUser === 'all' || log.username.toLowerCase() === selectedUser.toLowerCase();

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        log.username.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query) ||
        (log.targetApp && log.targetApp.toLowerCase().includes(query)) ||
        (log.userDepartment && log.userDepartment.toLowerCase().includes(query)) ||
        (log.ipAddress && log.ipAddress.includes(query));

      return matchesAction && matchesUser && matchesSearch;
    });
  }, [accessLogs, selectedAction, selectedUser, searchQuery]);

  // Export CSV functionality
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['ID', 'Timestamp', 'Username', 'Role', 'Department', 'Action', 'Target App', 'In-charge', 'Details', 'IP Address'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${new Date(l.timestamp).toLocaleString('th-TH')}"`,
      `"${l.username}"`,
      `"${l.userRole || ''}"`,
      `"${l.userDepartment || ''}"`,
      `"${l.action}"`,
      `"${l.targetApp || ''}"`,
      `"${l.inCharge || ''}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tohokuse-access-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: AccessActionType) => {
    switch (action) {
      case 'LOGIN_SUCCESS':
        return {
          label: 'เข้าสู่ระบบสำเร็จ',
          icon: LogIn,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'LOGIN_FAILED':
        return {
          label: 'เข้าสู่ระบบล้มเหลว',
          icon: AlertTriangle,
          className: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'LOGOUT':
        return {
          label: 'ออกจากระบบ',
          icon: LogOut,
          className: 'bg-slate-100 text-slate-700 border-slate-200',
        };
      case 'APP_CLICK':
        return {
          label: 'เปิดใช้งานเว็บแอป',
          icon: ArrowUpRight,
          className: 'bg-blue-50 text-[#0060AA] border-blue-200',
        };
      case 'USER_CREATED':
      case 'USER_UPDATED':
      case 'USER_DELETED':
        return {
          label: 'จัดการผู้ใช้งาน',
          icon: UserCheck,
          className: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'SHEET_SYNC':
        return {
          label: 'ซิงค์ชีต',
          icon: RotateCcw,
          className: 'bg-teal-50 text-teal-700 border-teal-200',
        };
      default:
        return {
          label: action,
          icon: Activity,
          className: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">การเข้าใช้งานทั้งหมด</span>
            <Activity className="w-4 h-4 text-[#0060AA]" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">บันทึกกิจกรรมทั้งหมด</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">เข้าใช้งานเว็บแอป</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.appClicks}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">คลิกเปิดแอปภายใน</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">การล็อกอินสำเร็จ</span>
            <LogIn className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.logins}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">จาก {stats.uniqueUsers} บัญชีผู้ใช้</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">เตือนความปลอดภัย</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.failedLogins}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">ล็อกอินไม่สำเร็จ</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">ประวัติการเข้าใช้งานระบบภายใน (Access Activity Log)</h2>
          <p className="text-xs text-slate-500">
            เก็บบันทึกการเข้าสู่ระบบ การคลิกลิงก์แอป และการปรับปรุงสิทธิ์ In-charge แบบเรียลไทม์
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            onClick={() => setConfirmClearOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ล้างบันทึก</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อผู้ใช้, เว็บแอปที่เข้า, รายละเอียด, IP..."
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0060AA]"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={e => setSelectedAction(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-700 focus:outline-none"
          >
            <option value="all">ทุกกิจกรรม (All Actions)</option>
            <option value="APP_CLICK">เปิดใช้งานแอป (App Access)</option>
            <option value="LOGINS">การเข้าสู่ระบบ (Logins)</option>
            <option value="USER_OPS">จัดการผู้ใช้ (User Ops)</option>
            <option value="LOGIN_FAILED">ล็อกอินไม่สำเร็จ (Failed)</option>
          </select>

          {/* User Filter */}
          <select
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-700 focus:outline-none"
          >
            <option value="all">ผู้ใช้งานทั้งหมด</option>
            {users.map(u => (
              <option key={u.id} value={u.username}>{u.name} (@{u.username})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">เวลา (Timestamp)</th>
                <th className="py-3 px-4">ผู้ใช้งาน (User)</th>
                <th className="py-3 px-4">กิจกรรม (Action)</th>
                <th className="py-3 px-4">เป้าหมาย / เว็บแอป</th>
                <th className="py-3 px-4">รายละเอียด</th>
                <th className="py-3 px-4">IP แอดเดรส</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    ไม่พบบันทึกกิจกรรมที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const badge = getActionBadge(log.action);
                  const Icon = badge.icon;
                  const dateObj = new Date(log.timestamp);
                  const timeFormatted = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const dateFormatted = dateObj.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-slate-900 font-medium">{timeFormatted}</div>
                        <div className="text-[10px] text-slate-400">{dateFormatted}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{log.username}</div>
                        {log.userRole && (
                          <div className="text-[10px] text-slate-400">
                            {log.userRole} {log.userDepartment ? `• ${log.userDepartment}` : ''}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.className}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-800">
                        {log.targetApp ? (
                          <div>
                            <div className="truncate max-w-[200px]">{log.targetApp}</div>
                            {log.inCharge && (
                              <div className="text-[10px] text-slate-400">In-charge: {log.inCharge}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-xs">
                        <div className="line-clamp-2">{log.details}</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.ipAddress || '192.168.1.1'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal to Clear Logs */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">ยืนยันการล้างประวัติการเข้าใช้งาน</h3>
            <p className="text-xs text-slate-600 mt-1">
              ต้องการลบประวัติการเข้าใช้งานทั้งหมด ({accessLogs.length} รายการ) หรือไม่? คุณสามารถกดดาวน์โหลด CSV สำรองไว้ก่อนได้
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  clearLogs();
                  setConfirmClearOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                ยืนยันล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
