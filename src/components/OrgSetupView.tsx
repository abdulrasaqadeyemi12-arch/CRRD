import React, { useState } from 'react';
import { Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { db, auth } from '../lib/firebase.ts';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';

export const OrgSetupView: React.FC = () => {
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !auth.currentUser) return;

    setLoading(true);
    try {
      const orgRef = doc(collection(db, 'organizations'));
      const orgId = orgRef.id;

      const orgData = {
        id: orgId,
        name: orgName,
        adminUid: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      };

      await setDoc(orgRef, orgData);

      // Create user profile
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        organizationId: orgId,
        role: 'Admin',
        createdAt: new Date().toISOString(),
      });

      // Reload window to refresh AuthContext
      window.location.reload();
    } catch (error) {
      console.error('Error setting up organization:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Finalize Setup</h2>
          <p className="text-slate-500 mb-8 text-sm">Create an organization to start managing your cyber risk posture.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Organization Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Cybersecurity"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
              />
            </div>

            <button
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 group"
            >
              <span>Initialize Platform</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
            </button>
          </form>

          <div className="mt-8 flex items-center space-x-2 text-slate-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Isolated Tenant Environment</span>
          </div>
        </div>
      </div>
    </div>
  );
};
