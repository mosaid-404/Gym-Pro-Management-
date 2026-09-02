/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GymSettings, AuthSession, Member } from './types';
import { storage } from './services/storage';
import { updateDynamicBranding } from './services/branding';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/common/Header';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MemberPortal } from './components/member/MemberPortal';
import { ReceptionQRModal } from './components/common/ReceptionQRModal';
import { InstallPwaPrompt } from './components/common/InstallPwaPrompt';

export default function App() {
  const [settings, setSettings] = useState<GymSettings>(() => storage.getSettings());
  const [session, setSession] = useState<AuthSession | null>(() => storage.getSavedSession());
  const [inHallCount, setInHallCount] = useState<number>(() => storage.getCurrentInsideCount());
  const [isReceptionQROpen, setIsReceptionQROpen] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Apply dynamic branding (document.title, dynamic favicon, meta tags, and dynamic web manifest blob)
  useEffect(() => {
    updateDynamicBranding(settings);
  }, [settings]);

  // Sync data whenever triggered
  const refreshAll = () => {
    setSettings(storage.getSettings());
    setInHallCount(storage.getCurrentInsideCount());
    setRefreshTrigger((prev) => prev + 1);

    // Refresh member in session if logged in as member
    if (session?.role === 'member' && session.member) {
      const fresh = storage.getMembers().find(
        (m) => m.id === session.member!.id || m.phone === session.member!.phone
      );
      if (fresh) {
        const updatedSession: AuthSession = { ...session, member: fresh };
        setSession(updatedSession);
        storage.saveSession(updatedSession);
      }
    }
  };

  // Real-time listener for local storage changes across tabs and within the app
  useEffect(() => {
    const handleDataChange = () => {
      refreshAll();
    };

    window.addEventListener('storage', handleDataChange);
    window.addEventListener('gym_data_changed', handleDataChange);

    return () => {
      window.removeEventListener('storage', handleDataChange);
      window.removeEventListener('gym_data_changed', handleDataChange);
    };
  }, [session]);

  // Periodic polling for hall count
  useEffect(() => {
    const interval = setInterval(() => {
      setInHallCount(storage.getCurrentInsideCount());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (role: 'admin' | 'member', member?: Member, rememberMe: boolean = true) => {
    const newSession: AuthSession = {
      role,
      member,
      adminUsername: role === 'admin' ? 'admin' : undefined,
      rememberMe,
    };
    setSession(newSession);
    storage.saveSession(newSession);
    setInHallCount(storage.getCurrentInsideCount());
  };

  const handleLogout = () => {
    setSession(null);
    storage.saveSession(null);
  };

  const handleUpdateSettings = (newSettings: GymSettings) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
    updateDynamicBranding(newSettings);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0A0A0A] text-white font-['Cairo',sans-serif]">
      {/* If not logged in, show Login Page */}
      {!session ? (
        <LoginPage
          settings={settings}
          onLoginSuccess={handleLoginSuccess}
          onOpenReceptionQR={() => setIsReceptionQROpen(true)}
        />
      ) : (
        <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
          {/* Top Desktop Navigation Header */}
          <Header
            settings={settings}
            session={session}
            inHallCount={inHallCount}
            onLogout={handleLogout}
            onOpenReceptionQR={() => setIsReceptionQROpen(true)}
            onRefreshData={refreshAll}
          />

          {/* Main View Area */}
          <main className="flex-1 pb-16 w-full max-w-full overflow-x-hidden">
            {session.role === 'admin' ? (
              <AdminDashboard
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onOpenReceptionQR={() => setIsReceptionQROpen(true)}
                onRefreshData={refreshAll}
              />
            ) : session.member ? (
              <MemberPortal
                member={session.member}
                settings={settings}
                inHallCount={inHallCount}
                onRefreshData={refreshAll}
                onLogout={handleLogout}
              />
            ) : null}
          </main>
        </div>
      )}

      {/* Universal Reception QR Modal */}
      <ReceptionQRModal
        isOpen={isReceptionQROpen}
        onClose={() => {
          setIsReceptionQROpen(false);
          refreshAll();
        }}
        settings={settings}
        inHallCount={inHallCount}
        onCheckInSuccess={(name) => {
          refreshAll();
        }}
      />

      {/* Floating PWA Install Prompt Banner */}
      <InstallPwaPrompt settings={settings} />
    </div>
  );
}
