import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AppLayout } from './components/AppLayout.tsx';
import { LoginView } from './components/LoginView.tsx';
import { OrgSetupView } from './components/OrgSetupView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { AssetManager } from './components/AssetManager.tsx';
import { RiskRegister } from './components/RiskRegister.tsx';
import { RemediationManager } from './components/RemediationManager.tsx';
import { ReportGenerator } from './components/ReportGenerator.tsx';
import { RiskAssistant } from './components/RiskAssistant.tsx';
import { SettingsView } from './components/SettingsView.tsx';

const AppContent: React.FC = () => {
  const { user, loading, userProfile, organization } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Securing Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  if (!userProfile || !organization) {
    return <OrgSetupView />;
  }

  // View Routing Logic
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveView} />;
      case 'assets':
        return <AssetManager />;
      case 'risks':
        return <RiskRegister />;
      case 'remediation':
        return <RemediationManager />;
      case 'reports':
        return <ReportGenerator />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveView} />;
    }
  };

  return (
    <AppLayout activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
      <RiskAssistant />
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
