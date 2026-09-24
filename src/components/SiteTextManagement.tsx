/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useApp } from '../context/AppContext';
import { SiteAnnouncement, SiteContentConfig } from '../types';
import { 
  FileText, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Eye, 
  Sparkles, 
  Globe, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  Megaphone,
  BellRing,
  X,
  AlertTriangle
} from 'lucide-react';

export const SiteTextManagement: React.FC = () => {
  const { siteConfig, updateSiteConfig, addAnnouncement, updateAnnouncement, deleteAnnouncement, resetSiteConfig } = useData();
  const { t, language } = useApp();

  const [activeSection, setActiveSection] = useState<'titles' | 'announcements' | 'footer'>('titles');
  const [formData, setFormData] = useState<SiteContentConfig>({ ...siteConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync formData whenever siteConfig updates in DataContext
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...siteConfig,
      announcements: siteConfig.announcements,
    }));
  }, [siteConfig]);

  // Editing Announcement Modal State
  const [editingAnn, setEditingAnn] = useState<SiteAnnouncement | null>(null);

  // New Announcement Modal / Form State
  const [isAddingAnn, setIsAddingAnn] = useState(false);
  const [newAnn, setNewAnn] = useState<Omit<SiteAnnouncement, 'id'>>({
    enabled: true,
    type: 'info',
    titleTh: '',
    titleEn: '',
    messageTh: '',
    messageEn: '',
    showOnPublic: true,
    showOnInternal: true,
  });

  const handleChange = (field: keyof SiteContentConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAll = () => {
    // Preserve current live announcements when saving site text
    const updatedConfig: SiteContentConfig = {
      ...formData,
      announcements: siteConfig.announcements,
    };
    updateSiteConfig(updatedConfig);
    setFormData(updatedConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อความและประกาศทั้งหมดกลับเป็นค่ามาตรฐานเริ่มต้นหรือไม่?')) {
      resetSiteConfig();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnn.titleTh && !newAnn.titleEn) {
      alert('กรุณากรอกหัวข้อประกาศอย่างน้อยหนึ่งภาษา');
      return;
    }
    addAnnouncement(newAnn);
    setIsAddingAnn(false);
    setNewAnn({
      enabled: true,
      type: 'info',
      titleTh: '',
      titleEn: '',
      messageTh: '',
      messageEn: '',
      showOnPublic: true,
      showOnInternal: true,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleUpdateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn) return;
    if (!editingAnn.titleTh && !editingAnn.titleEn) {
      alert('กรุณากรอกหัวข้อประกาศอย่างน้อยหนึ่งภาษา');
      return;
    }
    updateAnnouncement(editingAnn.id, {
      enabled: editingAnn.enabled,
      type: editingAnn.type,
      titleTh: editingAnn.titleTh,
      titleEn: editingAnn.titleEn,
      messageTh: editingAnn.messageTh,
      messageEn: editingAnn.messageEn,
      showOnPublic: editingAnn.showOnPublic,
      showOnInternal: editingAnn.showOnInternal,
    });
    setEditingAnn(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDeleteAnnouncement = (id: string, title: string) => {
    if (window.confirm(`คุณต้องการลบประกาศ "${title}" ใช่หรือไม่?`)) {
      deleteAnnouncement(id);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0060AA]/10 dark:bg-[#0060AA]/30 text-[#0060AA] dark:text-sky-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              ตั้งค่าข้อความและเนื้อหาหน้าเว็บ (Site Content & Announcements)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            แก้ไขชื่อระบบ คำบรรยาย ป้ายประกาศ และข้อมูลติดต่อได้อิสระ โดยมีผลกับผู้ใช้งานทุกคนทันที
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>คืนค่ามาตรฐาน</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0060AA] hover:bg-[#004f8c] shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการแก้ไข</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-medium flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>บันทึกข้อความหน้าเว็บเรียบร้อยแล้ว ข้อมูลจะมีผลทั่วทั้งเว็บไซต์ทันที!</span>
        </div>
      )}

      {/* Section Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSection('announcements')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSection === 'announcements'
              ? 'bg-[#0060AA] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>ประกาศ & ข่าวสาร ({siteConfig.announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('titles')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSection === 'titles'
              ? 'bg-[#0060AA] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>ข้อความหัวเรื่อง & แบรนด์</span>
        </button>

        <button
          onClick={() => setActiveSection('footer')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeSection === 'footer'
              ? 'bg-[#0060AA] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>ข้อมูลท้ายเว็บ & ช่องทางติดต่อ</span>
        </button>
      </div>

      {/* SECTION 1: ANNOUNCEMENTS */}
      {activeSection === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-[#0060AA] dark:text-sky-400" />
              <span>รายการป้ายประกาศ & แถบข้อความแจ้งเตือน</span>
            </h3>
            <button
              onClick={() => setIsAddingAnn(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มประกาศใหม่</span>
            </button>
          </div>

          {/* New Announcement Form (Collapsible) */}
          {isAddingAnn && (
            <form onSubmit={handleCreateAnnouncement} className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>สร้างประกาศใหม่บนหน้าเว็บ</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingAnn(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ปิด
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    ประเภทการแจ้งเตือน
                  </label>
                  <select
                    value={newAnn.type}
                    onChange={e => setNewAnn({ ...newAnn, type: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="info">Info (สีฟ้า - ข้อมูลทั่วไป)</option>
                    <option value="warning">Warning (สีส้ม - แจ้งเตือน/ปิดปรับปรุง)</option>
                    <option value="success">Success (สีเขียว - ประกาศสำเร็จ/ข่าวดี)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    แสดงที่หน้าเว็บ
                  </label>
                  <div className="flex items-center gap-4 text-xs mt-2">
                    <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAnn.showOnPublic}
                        onChange={e => setNewAnn({ ...newAnn, showOnPublic: e.target.checked })}
                        className="rounded text-[#0060AA]"
                      />
                      <span>หน้าสาธารณะ (Public)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAnn.showOnInternal}
                        onChange={e => setNewAnn({ ...newAnn, showOnInternal: e.target.checked })}
                        className="rounded text-[#0060AA]"
                      />
                      <span>ระบบภายใน (Internal)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    สถานะการเผยแพร่
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAnn.enabled}
                      onChange={e => setNewAnn({ ...newAnn, enabled: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    <span>เปิดแสดงทันที (Active)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    หัวข้อประกาศ (ภาษาไทย)
                  </label>
                  <input
                    type="text"
                    required
                    value={newAnn.titleTh}
                    onChange={e => setNewAnn({ ...newAnn, titleTh: e.target.value })}
                    placeholder="เช่น ประกาศปิดปรับปรุงเซิร์ฟเวอร์"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    หัวข้อประกาศ (English)
                  </label>
                  <input
                    type="text"
                    value={newAnn.titleEn}
                    onChange={e => setNewAnn({ ...newAnn, titleEn: e.target.value })}
                    placeholder="e.g. Scheduled System Maintenance"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    เนื้อหา / ข้อความรายละเอียด (ภาษาไทย)
                  </label>
                  <textarea
                    rows={2}
                    value={newAnn.messageTh}
                    onChange={e => setNewAnn({ ...newAnn, messageTh: e.target.value })}
                    placeholder="ระบุข้อความหรือรายละเอียดของประกาศ..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    เนื้อหา / ข้อความรายละเอียด (English)
                  </label>
                  <textarea
                    rows={2}
                    value={newAnn.messageEn}
                    onChange={e => setNewAnn({ ...newAnn, messageEn: e.target.value })}
                    placeholder="Announcement details..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAnn(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  บันทึกประกาศ
                </button>
              </div>
            </form>
          )}

          {/* Announcement List */}
          {siteConfig.announcements.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              ยังไม่มีประกาศข่าวสาร คลิก "เพิ่มประกาศใหม่" ด้านบนเพื่อเริ่มสร้าง
            </div>
          ) : (
            <div className="space-y-3">
              {siteConfig.announcements.map(ann => {
                const badgeColor = 
                  ann.type === 'warning' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300' :
                  ann.type === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' :
                  'bg-blue-100 text-[#0060AA] dark:bg-blue-950 dark:text-sky-300 border-blue-300';

                return (
                  <div 
                    key={ann.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                          {ann.type}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {ann.titleTh} {ann.titleEn && <span className="font-normal text-slate-400">({ann.titleEn})</span>}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          ann.enabled 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}>
                          {ann.enabled ? 'เปิดแสดงผล' : 'ปิดอยู่'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {ann.messageTh || ann.messageEn}
                      </p>
                      <div className="text-[10px] text-slate-400 flex items-center gap-3">
                        <span>แสดงผลที่:</span>
                        {ann.showOnPublic && <span className="text-[#0060AA] dark:text-sky-400">หน้าสาธารณะ (Public)</span>}
                        {ann.showOnPublic && ann.showOnInternal && <span>•</span>}
                        {ann.showOnInternal && <span className="text-indigo-600 dark:text-indigo-400">ระบบภายใน (Internal)</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setEditingAnn({ ...ann })}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border border-blue-200 text-[#0060AA] bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:border-blue-800 dark:text-sky-300 transition-colors"
                        title="แก้ไขเนื้อหาประกาศ"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>แก้ไข</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateAnnouncement(ann.id, { enabled: !ann.enabled })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                          ann.enabled 
                            ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300' 
                            : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {ann.enabled ? 'ปิดแสดง' : 'เปิดแสดง'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(ann.id, ann.titleTh || ann.titleEn)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="ลบประกาศ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* EDIT ANNOUNCEMENT MODAL */}
      {editingAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0060AA] dark:bg-blue-950 dark:text-sky-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    แก้ไขประกาศ & ข่าวสาร
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ปรับปรุงข้อความ รูปแบบการแจ้งเตือน และหน้าที่ต้องการให้แสดงผล
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAnn(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateAnnouncement} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    ประเภทการแจ้งเตือน
                  </label>
                  <select
                    value={editingAnn.type}
                    onChange={e => setEditingAnn({ ...editingAnn, type: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="info">Info (สีฟ้า - ข้อมูลทั่วไป)</option>
                    <option value="warning">Warning (สีส้ม - แจ้งเตือน/ปิดปรับปรุง)</option>
                    <option value="success">Success (สีเขียว - ประกาศสำเร็จ/ข่าวดี)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    แสดงที่หน้าเว็บ
                  </label>
                  <div className="flex items-center gap-4 text-xs mt-2">
                    <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingAnn.showOnPublic}
                        onChange={e => setEditingAnn({ ...editingAnn, showOnPublic: e.target.checked })}
                        className="rounded text-[#0060AA]"
                      />
                      <span>หน้าสาธารณะ (Public)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingAnn.showOnInternal}
                        onChange={e => setEditingAnn({ ...editingAnn, showOnInternal: e.target.checked })}
                        className="rounded text-[#0060AA]"
                      />
                      <span>ระบบภายใน (Internal)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    สถานะการเผยแพร่
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAnn.enabled}
                      onChange={e => setEditingAnn({ ...editingAnn, enabled: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    <span>เปิดแสดงทันที (Active)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    หัวข้อประกาศ (ภาษาไทย) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAnn.titleTh}
                    onChange={e => setEditingAnn({ ...editingAnn, titleTh: e.target.value })}
                    placeholder="เช่น ประกาศปิดปรับปรุงเซิร์ฟเวอร์"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    หัวข้อประกาศ (English)
                  </label>
                  <input
                    type="text"
                    value={editingAnn.titleEn}
                    onChange={e => setEditingAnn({ ...editingAnn, titleEn: e.target.value })}
                    placeholder="e.g. Scheduled System Maintenance"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    เนื้อหา / ข้อความรายละเอียด (ภาษาไทย)
                  </label>
                  <textarea
                    rows={3}
                    value={editingAnn.messageTh}
                    onChange={e => setEditingAnn({ ...editingAnn, messageTh: e.target.value })}
                    placeholder="ระบุข้อความหรือรายละเอียดของประกาศ..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    เนื้อหา / ข้อความรายละเอียด (English)
                  </label>
                  <textarea
                    rows={3}
                    value={editingAnn.messageEn}
                    onChange={e => setEditingAnn({ ...editingAnn, messageEn: e.target.value })}
                    placeholder="Announcement details..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAnn(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#0060AA] hover:bg-[#004f8c] shadow-xs cursor-pointer"
                >
                  บันทึกการแก้ไขประกาศ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 2: TITLES & BRAND */}
      {activeSection === 'titles' && (
        <div className="space-y-5 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Brand Titles */}
          <div className="space-y-3 pb-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-[#0060AA] dark:text-sky-400 uppercase tracking-wider">
              1. ชื่อระบบ & แบรนด์องค์กร (Brand & Header Title)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อแบรนด์หลัก (ภาษาไทย)
                </label>
                <input
                  type="text"
                  value={formData.brandNameTh}
                  onChange={e => handleChange('brandNameTh', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อแบรนด์หลัก (English)
                </label>
                <input
                  type="text"
                  value={formData.brandNameEn}
                  onChange={e => handleChange('brandNameEn', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  คำบรรยายใต้โลโก้ (ภาษาไทย)
                </label>
                <input
                  type="text"
                  value={formData.brandSubTh}
                  onChange={e => handleChange('brandSubTh', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  คำบรรยายใต้โลโก้ (English)
                </label>
                <input
                  type="text"
                  value={formData.brandSubEn}
                  onChange={e => handleChange('brandSubEn', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Public Portal Hero */}
          <div className="space-y-3 pb-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-[#0060AA] dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>2. ข้อความหน้าบริการสาธารณะ (Public Portal Hero Banner)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ป้ายแท็กด้านบน (ไทย)
                </label>
                <input
                  type="text"
                  value={formData.publicBadgeTh}
                  onChange={e => handleChange('publicBadgeTh', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ป้ายแท็กด้านบน (English)
                </label>
                <input
                  type="text"
                  value={formData.publicBadgeEn}
                  onChange={e => handleChange('publicBadgeEn', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  หัวข้อหลักหน้าสาธารณะ (ไทย)
                </label>
                <input
                  type="text"
                  value={formData.publicTitleTh}
                  onChange={e => handleChange('publicTitleTh', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  หัวข้อหลักหน้าสาธารณะ (English)
                </label>
                <input
                  type="text"
                  value={formData.publicTitleEn}
                  onChange={e => handleChange('publicTitleEn', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  คำอธิบายรายละเอียด (ไทย)
                </label>
                <textarea
                  rows={2}
                  value={formData.publicSubtitleTh}
                  onChange={e => handleChange('publicSubtitleTh', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  คำอธิบายรายละเอียด (English)
                </label>
                <textarea
                  rows={2}
                  value={formData.publicSubtitleEn}
                  onChange={e => handleChange('publicSubtitleEn', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Internal Portal Hero */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#0060AA] dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>3. ข้อความหน้าระบบภายในแผนก (Internal Portal Hero Banner)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ป้ายแท็กด้านบน (ไทย)
                </label>
                <input
                  type="text"
                  value={formData.internalBadgeTh}
                  onChange={e => handleChange('internalBadgeTh', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ป้ายแท็กด้านบน (English)
                </label>
                <input
                  type="text"
                  value={formData.internalBadgeEn}
                  onChange={e => handleChange('internalBadgeEn', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  หัวข้อหลักหน้าระบบภายใน (ไทย)
                </label>
                <input
                  type="text"
                  value={formData.internalTitleTh}
                  onChange={e => handleChange('internalTitleTh', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  หัวข้อหลักหน้าระบบภายใน (English)
                </label>
                <input
                  type="text"
                  value={formData.internalTitleEn}
                  onChange={e => handleChange('internalTitleEn', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  คำอธิบายรายละเอียด (ไทย)
                </label>
                <textarea
                  rows={2}
                  value={formData.internalSubtitleTh}
                  onChange={e => handleChange('internalSubtitleTh', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  คำอธิบายรายละเอียด (English)
                </label>
                <textarea
                  rows={2}
                  value={formData.internalSubtitleEn}
                  onChange={e => handleChange('internalSubtitleEn', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: FOOTER & CONTACT */}
      {activeSection === 'footer' && (
        <div className="space-y-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-xs font-bold text-[#0060AA] dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            <span>ข้อมูลติดต่อและส่วนท้ายเว็บไซต์ (Footer Information)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                คำอธิบายบริษัทส่วนท้ายเว็บ (ไทย)
              </label>
              <textarea
                rows={2}
                value={formData.footerAboutTh}
                onChange={e => handleChange('footerAboutTh', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                คำอธิบายบริษัทส่วนท้ายเว็บ (English)
              </label>
              <textarea
                rows={2}
                value={formData.footerAboutEn}
                onChange={e => handleChange('footerAboutEn', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>อีเมลติดต่อ / ฝ่ายสนับสนุน</span>
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={e => handleChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>เบอร์โทรศัพท์ / สายด่วนไอที</span>
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={e => handleChange('contactPhone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>ที่อยู่บริษัท / สถานที่ตั้ง (ไทย)</span>
              </label>
              <input
                type="text"
                value={formData.contactLocationTh}
                onChange={e => handleChange('contactLocationTh', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>ที่อยู่บริษัท / สถานที่ตั้ง (English)</span>
              </label>
              <input
                type="text"
                value={formData.contactLocationEn}
                onChange={e => handleChange('contactLocationEn', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ข้อความสงวนลิขสิทธิ์ (Copyright text)
              </label>
              <input
                type="text"
                value={formData.copyrightText}
                onChange={e => handleChange('copyrightText', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating or Bottom Save Button Bar */}
      <div className="flex items-center justify-end gap-3 pt-3">
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#0060AA] hover:bg-[#004f8c] shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>บันทึกการแก้ไขทั้งหมด</span>
        </button>
      </div>
    </div>
  );
};
