/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { PublicPortal } from './components/PublicPortal';
import { InternalPortal } from './components/InternalPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'public' | 'internal' | 'admin'>('public');
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-[#0060AA]/20 selection:text-[#0060AA]">
      {/* Translucent Glass Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">
        {activeTab === 'public' && <PublicPortal />}
        {activeTab === 'internal' && (
          <InternalPortal
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenAdmin={() => setActiveTab('admin')}
          />
        )}
        {activeTab === 'admin' && (
          <AdminDashboard
            onBackToPublic={() => setActiveTab('public')}
            onOpenLogin={() => setIsLoginOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onOpenLogin={() => setIsLoginOpen(true)} />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          if (activeTab === 'public') {
            setActiveTab('internal');
          }
        }}
      />
    </div>
  );
};

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, logAction } = useData();
  return (
    <AuthProvider users={users} onLogAction={logAction}>
      {children}
    </AuthProvider>
  );
};

export default function App() {
  return (
    <AppProvider>
      <DataProvider>
        <AuthWrapper>
          <AppContent />
        </AuthWrapper>
      </DataProvider>
    </AppProvider>
  );
}
