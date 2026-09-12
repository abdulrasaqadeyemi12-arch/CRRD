import React from 'react';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase.ts';

export const LoginView: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-200">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">CRRD</h1>
          <p className="text-slate-600 font-medium">Cyber Risk & Business Risk Management</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 p-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-sm text-slate-500">Sign in to manage your organization's security posture.</p>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white border-2 border-slate-100 hover:border-slate-900 rounded-2xl transition-all duration-300 group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span className="font-bold text-slate-900">Continue with Google</span>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
          </button>

          <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center space-x-2 text-slate-400">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-widest">Enterprise Grade Security</span>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-slate-400">
          Built for teams who prioritize business resilience.
        </p>
      </div>
    </div>
  );
};
