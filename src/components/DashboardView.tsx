import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  TrendingUp,
  Activity,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { db } from '../lib/firebase.ts';
import { collection, query, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.tsx';
import { Risk, RemediationAction } from '../types.ts';
import { cn } from '../lib/utils.ts';

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend !== undefined && (
        <div className={cn(
          "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold",
          trend < 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        )}>
          {trend < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
    <div className="flex items-baseline space-x-2">
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

export const DashboardView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalRisks: 0,
    criticalRisks: 0,
    highRisks: 0,
    mitigatedRisks: 0,
    overdueActions: 0,
    activeActions: 0
  });
  const [topRisks, setTopRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.organizationId) {
      fetchDashboardData();
    }
  }, [userProfile]);

  const fetchDashboardData = async () => {
    try {
      const risksQ = query(collection(db, `organizations/${userProfile.organizationId}/risks`));
      const actionsQ = query(collection(db, `organizations/${userProfile.organizationId}/actions`));
      
      const [risksSnap, actionsSnap] = await Promise.all([getDocs(risksQ), getDocs(actionsQ)]);
      
      const risks = risksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Risk));
      const actions = actionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RemediationAction));

      setStats({
        totalRisks: risks.length,
        criticalRisks: risks.filter(r => r.score >= 17).length,
        highRisks: risks.filter(r => r.score >= 10 && r.score < 17).length,
        mitigatedRisks: risks.filter(r => r.status === 'Mitigated').length,
        overdueActions: actions.filter(a => a.status === 'Overdue').length,
        activeActions: actions.filter(a => a.status !== 'Completed').length
      });

      setTopRisks(risks.sort((a, b) => b.score - a.score).slice(0, 4));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const riskDistribution = [
    { name: 'Critical', value: stats.criticalRisks, color: '#ef4444' },
    { name: 'High', value: stats.highRisks, color: '#f97316' },
    { name: 'Med/Low', value: stats.totalRisks - stats.criticalRisks - stats.highRisks, color: '#e2e8f0' },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Health</h2>
          <p className="text-slate-500">Real-time business exposure and risk distribution.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Overall Posture</p>
            <div className="flex items-center space-x-2">
              <span className={cn(
                "text-lg font-extrabold uppercase tracking-tighter",
                stats.criticalRisks > 0 ? "text-red-600" : stats.highRisks > 0 ? "text-orange-600" : "text-green-600"
              )}>
                {stats.criticalRisks > 0 ? 'Critical' : stats.highRisks > 0 ? 'Elevated' : 'Stable'}
              </span>
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse shadow-lg",
                stats.criticalRisks > 0 ? "bg-red-500 shadow-red-200" : stats.highRisks > 0 ? "bg-orange-500 shadow-orange-200" : "bg-green-500 shadow-green-200"
              )} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Critical Exposures" 
          value={stats.criticalRisks} 
          icon={ShieldAlert} 
          color="bg-red-500"
        />
        <StatCard 
          label="Total Active Risks" 
          value={stats.totalRisks} 
          icon={AlertTriangle} 
          color="bg-orange-500" 
        />
        <StatCard 
          label="Mitigated Risks" 
          value={stats.mitigatedRisks} 
          icon={CheckCircle2} 
          color="bg-green-500" 
        />
        <StatCard 
          label="Overdue Actions" 
          value={stats.overdueActions} 
          icon={Clock} 
          color="bg-slate-900" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-slate-400" />
            Risk Distribution
          </h3>
          <div className="h-64">
            {riskDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 text-xs font-medium">No active risks to display</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-slate-400" />
            Priority Remediation Strategy
          </h3>
          <div className="h-64 flex flex-col justify-center items-center text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Remediation Engine Ready</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Link remediation actions to your risks to see the trend of your organization's risk reduction.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Top Priority Risks</h3>
          <button onClick={() => onNavigate('risks')} className="text-sm font-bold text-slate-900 hover:underline underline-offset-4">View All Risks</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Risk Scenario</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topRisks.map((risk) => (
                <tr key={risk.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 mb-0.5">{risk.title}</p>
                    <p className="text-xs text-slate-500 font-medium">Treatment: {risk.treatmentStrategy}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={cn(
                      "inline-flex items-center justify-center w-10 h-10 rounded-xl text-white font-bold text-sm shadow-md shadow-slate-200",
                      risk.score >= 17 ? "bg-red-500" : "bg-orange-500"
                    )}>
                      {risk.score}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-slate-600">{risk.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {topRisks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">No risks logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
