import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Building2, 
  Shield, 
  Bell, 
  Save,
  CreditCard,
  Key,
  Globe,
  Database,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { db } from '../lib/firebase.ts';
import { doc, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils.ts';

export const SettingsView: React.FC = () => {
  const { user, userProfile, organization } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'security' | 'integrations'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const handleSaveOrg = async () => {
    if (!organization?.id) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'organizations', organization.id), {
        name: orgName
      });
      // Optionally show a success toast here
    } catch (error) {
      console.error('Error updating organization:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'integrations', label: 'API & Integrations', icon: Database },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Configuration</h2>
        <p className="text-slate-500">Manage your account, organization settings, and system security.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <aside className="lg:w-64 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center w-full px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200",
                  activeTab === tab.id 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <tab.icon className={cn("w-4 h-4 mr-3", activeTab === tab.id ? "text-white" : "text-slate-400")} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 max-w-2xl">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="flex items-center space-x-6 pb-8 border-b border-slate-50">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{user?.displayName || 'User'}</h3>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <button className="mt-2 text-[10px] font-black text-slate-900 uppercase tracking-widest hover:underline">Change Photo</button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 text-sm font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'organization' && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organization Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Acme Cybersecurity"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industry Focus</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none text-sm font-medium">
                      <option>Technology & SaaS</option>
                      <option>Financial Services</option>
                      <option>Healthcare</option>
                      <option>Government / Public Sector</option>
                      <option>Manufacturing</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Subscription & Billing</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Professional Plan</p>
                      <p className="text-[10px] text-slate-400">Renewal Date: Oct 12, 2026</p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-white/50 transition-all shadow-sm">Manage Billing</button>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSaveOrg}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                  >
                    {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Update Organization</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 text-center py-12">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Key className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Security Configuration</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">Manage Multi-Factor Authentication, Session Policies, and Role-Based Access Controls.</p>
                </div>
                <button className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">Open Security Console</button>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-8">
                <div className="space-y-6">
                  {/* Microsoft 365 / Outlook */}
                  <div className="p-6 border border-slate-100 rounded-3xl bg-white shadow-sm hover:border-slate-200 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                          <Globe className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Microsoft 365 / Outlook</p>
                          <p className="text-[10px] text-slate-400">Ingest security alerts and sync calendars</p>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          const res = await fetch('/api/auth/microsoft/url');
                          const { url } = await res.json();
                          window.open(url, 'microsoft_auth', 'width=600,height=700');
                        }}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                      >
                        Connect
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Supports Outlook, Hotmail, and Azure AD</span>
                    </div>
                  </div>

                  {/* MCP Configuration */}
                  <div className="p-6 border border-slate-100 rounded-3xl bg-slate-50">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <BrainCircuit className="w-6 h-6 text-slate-900" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Model Context Protocol (MCP)</p>
                          <p className="text-[10px] text-slate-400">Expose risk data to external AI instances</p>
                        </div>
                      </div>
                      <div className="w-10 h-6 bg-slate-900 rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">MCP Endpoint URL</label>
                        <div className="flex space-x-2">
                          <input 
                            disabled 
                            value={`${window.location.origin}/api/mcp`} 
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-500"
                          />
                          <button className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50">Copy</button>
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-100">
                        <p className="text-[9px] text-slate-400 leading-relaxed font-medium">
                          <span className="text-slate-900 font-bold uppercase">Note:</span> MCP allows authorized external AI models (like Claude or Gemini) to "read" your risk posture as a context source. Use the API key below for authentication.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Standard Integrations */}
                  <div className="p-6 border border-slate-100 rounded-3xl flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                        <Database className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">External Database Export</p>
                        <p className="text-[10px] text-slate-400">Daily export of risk ledger to CSV/JSON</p>
                      </div>
                    </div>
                    <div className="w-10 h-6 bg-slate-900 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center space-x-4 text-slate-300">
            <span className="text-[10px] font-bold uppercase tracking-widest">v1.4.2 Production Build</span>
            <div className="w-1 h-1 bg-slate-200 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-widest">SLA: 99.9% Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
