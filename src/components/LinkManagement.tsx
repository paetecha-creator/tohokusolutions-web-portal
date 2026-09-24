/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { SheetPublicItem, SheetInternalItem } from '../types';
import { IconRenderer, AVAILABLE_ICONS } from './IconRenderer';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Search, 
  Layers, 
  Globe, 
  Lock, 
  Check, 
  X, 
  Tag, 
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

const AVAILABLE_INCHARGE_OPTIONS = ['admin', 'GA', 'SU', 'HR', 'other'] as const;

export const LinkManagement: React.FC = () => {
  const { 
    publicItems, 
    internalItems, 
    addPublicItem, 
    updatePublicItem, 
    deletePublicItem,
    addInternalItem, 
    updateInternalItem, 
    deleteInternalItem 
  } = useData();

  const [activeSheetTab, setActiveSheetTab] = useState<'public' | 'internal'>('internal');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    description: string;
    url: string;
    icon: string;
    badge: string;
    color: string;
    inCharge: string[];
  }>({
    title: '',
    category: '',
    description: '',
    url: 'https://',
    icon: 'Globe',
    badge: '',
    color: 'blue',
    inCharge: ['other'],
  });

  const resetForm = () => {
    setFormData({
      title: '',
      category: activeSheetTab === 'public' ? 'บริการทั่วไป' : 'ระบบภายใน',
      description: '',
      url: 'https://',
      icon: activeSheetTab === 'public' ? 'Globe' : 'Database',
      badge: '',
      color: 'blue',
      inCharge: ['other'],
    });
    setEditingItemId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SheetPublicItem | SheetInternalItem) => {
    setEditingItemId(item.id);
    const existingInCharge = (item as SheetInternalItem).inCharge || [];
    const validInCharge = existingInCharge.filter(t => (AVAILABLE_INCHARGE_OPTIONS as readonly string[]).includes(t));
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description,
      url: item.url,
      icon: item.icon,
      badge: item.badge || '',
      color: item.color || 'blue',
      inCharge: validInCharge.length > 0 ? validInCharge : ['other'],
    });
    setIsModalOpen(true);
  };

  const handleToggleInCharge = (tag: string) => {
    setFormData(prev => {
      const exists = prev.inCharge.includes(tag);
      if (exists) {
        if (prev.inCharge.length <= 1) return prev;
        return { ...prev, inCharge: prev.inCharge.filter(t => t !== tag) };
      } else {
        return { ...prev, inCharge: [...prev.inCharge, tag] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;

    if (activeSheetTab === 'public') {
      if (editingItemId) {
        updatePublicItem(editingItemId, {
          title: formData.title.trim(),
          category: formData.category.trim(),
          description: formData.description.trim(),
          url: formData.url.trim(),
          icon: formData.icon,
          badge: formData.badge.trim() || undefined,
          color: formData.color,
        });
      } else {
        addPublicItem({
          title: formData.title.trim(),
          category: formData.category.trim() || 'บริการทั่วไป',
          description: formData.description.trim(),
          url: formData.url.trim(),
          icon: formData.icon,
          badge: formData.badge.trim() || undefined,
          color: formData.color,
          order: publicItems.length + 1,
        });
      }
    } else {
      if (editingItemId) {
        updateInternalItem(editingItemId, {
          title: formData.title.trim(),
          category: formData.category.trim(),
          description: formData.description.trim(),
          url: formData.url.trim(),
          icon: formData.icon,
          badge: formData.badge.trim() || undefined,
          color: formData.color,
          inCharge: formData.inCharge,
        });
      } else {
        addInternalItem({
          title: formData.title.trim(),
          category: formData.category.trim() || 'ระบบงานภายใน',
          description: formData.description.trim(),
          url: formData.url.trim(),
          icon: formData.icon,
          badge: formData.badge.trim() || undefined,
          color: formData.color,
          inCharge: formData.inCharge,
          order: internalItems.length + 1,
        });
      }
    }

    setIsModalOpen(false);
  };

  const currentList = activeSheetTab === 'public' ? publicItems : internalItems;
  const filteredList = currentList.filter(item => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      ((item as SheetInternalItem).inCharge && (item as SheetInternalItem).inCharge.some(c => c.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">จัดการข้อมูลลิงก์เว็บแอป (Link Data Manager)</h2>
          <p className="text-xs text-slate-500">
            แก้ไขและอัปเดตลิงก์ที่แสดงในหน้าชีต "Public" และชีต "Internal"
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#0060AA] hover:bg-[#004f8c] shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{activeSheetTab === 'public' ? 'เพิ่มลิงก์ชีต Public' : 'เพิ่มลิงก์ชีต Internal'}</span>
        </button>
      </div>

      {/* Sheet Tab Switcher & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSheetTab('internal')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSheetTab === 'internal'
                ? 'bg-white text-[#0060AA] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>ชีต Internal ({internalItems.length})</span>
          </button>
          <button
            onClick={() => setActiveSheetTab('public')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSheetTab === 'public'
                ? 'bg-white text-[#0060AA] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>ชีต Public ({publicItems.length})</span>
          </button>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อลิงก์, หมวดหมู่, In-charge..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0060AA]"
          />
        </div>
      </div>

      {/* Links List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ไอคอน & ชื่อเว็บแอป</th>
                <th className="py-3 px-4">หมวดหมู่</th>
                {activeSheetTab === 'internal' && <th className="py-3 px-4">สิทธิ์ In-charge</th>}
                <th className="py-3 px-4">URL ปลายทาง</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    ไม่พบรายการลิงก์ในชีตนี้
                  </td>
                </tr>
              ) : (
                filteredList.map(item => {
                  const isInternal = 'inCharge' in item;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0060AA] flex items-center justify-center shrink-0">
                            <IconRenderer name={item.icon} size={18} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{item.title}</span>
                              {item.badge && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-sm">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                        {item.category}
                      </td>

                      {activeSheetTab === 'internal' && (
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(item as SheetInternalItem).inCharge?.map(ic => (
                              <span key={ic} className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-[#0060AA] border border-blue-200 font-medium">
                                {ic}
                              </span>
                            ))}
                          </div>
                        </td>
                      )}

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 max-w-[180px] truncate">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-slate-600 hover:text-[#0060AA]">
                          <span className="truncate">{item.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="แก้ไขลิงก์"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0060AA] hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`คุณต้องการลบลิงก์ "${item.title}" หรือไม่?`)) {
                                if (activeSheetTab === 'public') {
                                  deletePublicItem(item.id);
                                } else {
                                  deleteInternalItem(item.id);
                                }
                              }
                            }}
                            title="ลบลิงก์"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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

      {/* Add / Edit Link Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingItemId ? 'แก้ไขลิงก์เว็บแอป' : `เพิ่มลิงก์ในชีต "${activeSheetTab === 'public' ? 'Public' : 'Internal'}"`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อเว็บแอป / บริการ *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="เช่น ERP SAP, ระบบแจ้งซ่อม, พอร์ทัลลางาน"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมวดหมู่ (Category)
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    placeholder="เช่น ไอที & ซัพพอร์ต, บัญชี, HR"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ป้ายกำกับพิเศษ (Badge)
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="เช่น ยอดนิยม, VPN Only, 24 ชม."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  คำบรรยายบริการ (Description)
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="รายละเอียดโดยย่อของระบบและประโยชน์ในการใช้งาน"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL ปลายทาง *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 font-mono"
                  required
                />
              </div>

              {/* Icon selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  เลือกไอคอนประจำแอป:
                </label>
                <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 max-h-32 overflow-y-auto">
                  {AVAILABLE_ICONS.map(iconName => {
                    const isSelected = formData.icon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconName })}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#0060AA] text-white shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                        }`}
                      >
                        <IconRenderer name={iconName} size={16} />
                        <span className="text-[10px]">{iconName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* In-charge Scopes (Only for Internal Sheet) */}
              {activeSheetTab === 'internal' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    กำหนดสิทธิ์ In-charge (ผู้ใช้ที่มีสิทธิ์ตรงกันจะเห็นลิงก์นี้):
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    {AVAILABLE_INCHARGE_OPTIONS.map(opt => {
                      const isSelected = formData.inCharge.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleToggleInCharge(opt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-[#0060AA] text-white shadow-xs'
                              : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                          }`}
                        >
                          {opt} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    * เลือกกำหนดสิทธิ์ In-charge (admin, GA, SU, HR, other) ที่มีสิทธิ์มองเห็นและเข้าถึงลิงก์นี้
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0060AA] hover:bg-[#004f8c] shadow-xs cursor-pointer"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
