import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Shield, 
  TrendingDown, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { db } from '../lib/firebase.ts';
import { collection, query, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.tsx';
import { Risk, Asset, RemediationAction } from '../types.ts';
import { cn } from '../lib/utils.ts';

export const ReportGenerator: React.FC = () => {
  const { userProfile, organization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    risks: Risk[];
    assets: Asset[];
    actions: RemediationAction[];
  }>({
    risks: [],
    assets: [],
    actions: [],
  });

  useEffect(() => {
    if (userProfile?.organizationId) {
      fetchReportData();
    }
  }, [userProfile]);

  const fetchReportData = async () => {
    try {
      const risksQ = query(collection(db, `organizations/${userProfile.organizationId}/risks`));
      const assetsQ = query(collection(db, `organizations/${userProfile.organizationId}/assets`));
      const actionsQ = query(collection(db, `organizations/${userProfile.organizationId}/actions`));
      
      const [risksSnap, assetsSnap, actionsSnap] = await Promise.all([
        getDocs(risksQ), 
        getDocs(assetsQ),
        getDocs(actionsQ)
      ]);
      
      setData({
        risks: risksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Risk)),
        assets: assetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset)),
        actions: actionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RemediationAction)),
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const topRisks = [...data.risks].sort((a, b) => b.score - a.score).slice(0, 5);
  const completionRate = data.actions.length > 0 
    ? Math.round((data.actions.filter(a => a.status === 'Completed').length / data.actions.length) * 100) 
    : 0;

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Report Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Intelligence</h2>
          <p className="text-slate-500">Generate high-level briefings for board and executive stakeholders.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* The Actual Report Content */}
      <div className="bg-white border border-slate-100 rounded-[32px] shadow-2xl shadow-slate-200/50 p-12 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Report Header */}
        <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">CRRD</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-1">Executive Risk Briefing</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              Confidential // Generated for {organization?.name || 'Your Organization'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reporting Period</p>
            <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Executive Summary Section */}
        <section className="mb-12">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center">
            <div className="w-8 h-[2px] bg-slate-900 mr-3" />
            01 // Risk Posture Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inherent Exposure</p>
              <div className="flex items-baseline space-x-2">
                <span className={cn(
                  "text-4xl font-black tracking-tighter",
                  data.risks.some(r => r.score >= 17) ? "text-red-600" : "text-orange-600"
                )}>
                  {data.risks.some(r => r.score >= 17) ? 'CRITICAL' : 'ELEVATED'}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The organization currently manages <strong>{data.risks.length}</strong> active risk scenarios across <strong>{data.assets.length}</strong> critical business assets.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remediation Velocity</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black tracking-tighter text-slate-900">{completionRate}%</span>
                <TrendingDown className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong>{data.actions.filter(a => a.status === 'Completed').length}</strong> of <strong>{data.actions.length}</strong> strategic remediation tasks have been finalized this period.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900 mb-3">
                <Activity className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Quick Metrics</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Critical Assets</span>
                  <span className="text-xs font-black text-slate-900">{data.assets.filter(a => a.criticality >= 4).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Overdue Tasks</span>
                  <span className="text-xs font-black text-red-600">{data.actions.filter(a => a.status === 'Overdue').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">High Impact Risks</span>
                  <span className="text-xs font-black text-slate-900">{data.risks.filter(r => r.impact >= 4).length}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top 5 Risks Section */}
        <section className="mb-12">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center">
            <div className="w-8 h-[2px] bg-slate-900 mr-3" />
            02 // Priority Risk Exposure (Top 5)
          </h2>
          <div className="border border-slate-100 rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Scenario</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Impact</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topRisks.map((risk) => (
                  <tr key={risk.id}>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-900 mb-1">{risk.title}</p>
                      <p className="text-[10px] text-slate-400 leading-tight line-clamp-1">{risk.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest",
                        risk.impact >= 4 ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {['-', 'Insignificant', 'Minor', 'Moderate', 'Major', 'Severe'][risk.impact]} Impact
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-xs",
                        risk.score >= 17 ? "bg-red-600 text-white" : "bg-slate-900 text-white"
                      )}>
                        {risk.score}
                      </div>
                    </td>
                  </tr>
                ))}
                {topRisks.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 text-xs italic">No risks currently logged in the register.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Remediation Progress Section */}
        <section>
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center">
            <div className="w-8 h-[2px] bg-slate-900 mr-3" />
            03 // Remediation Roadmap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Current Status Distribution</h3>
              <div className="space-y-4">
                {[
                  { label: 'Completed', count: data.actions.filter(a => a.status === 'Completed').length, color: 'bg-green-500' },
                  { label: 'In Progress', count: data.actions.filter(a => a.status === 'InProgress').length, color: 'bg-blue-500' },
                  { label: 'Pending/Overdue', count: data.actions.filter(a => ['Pending', 'Overdue'].includes(a.status)).length, color: 'bg-slate-300' },
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tight">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-slate-900">{item.count} Actions</span>
                    </div>
                    <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000", item.color)}
                        style={{ width: `${data.actions.length > 0 ? (item.count / data.actions.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border border-slate-100 rounded-3xl">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Strategic Next Steps</h3>
              <ul className="space-y-3">
                {data.actions.filter(a => a.status !== 'Completed').slice(0, 3).map((action) => (
                  <li key={action.id} className="flex items-start space-x-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-900 leading-tight">{action.title}</p>
                      <p className="text-[9px] text-slate-400">Due: {new Date(action.dueDate).toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
                {data.actions.filter(a => a.status !== 'Completed').length === 0 && (
                  <li className="text-[10px] text-slate-400 italic">No pending actions for this period.</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* Report Footer */}
        <div className="mt-16 pt-8 border-t border-slate-50 flex justify-between items-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">
          <span>Generated by CRRD Platform Intelligence</span>
          <span>&copy; {new Date().getFullYear()} {organization?.name}</span>
        </div>
      </div>
    </div>
  );
};
