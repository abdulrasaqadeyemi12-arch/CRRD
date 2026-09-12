import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  ShieldAlert,
  Activity,
  ArrowRight,
  Target,
  BrainCircuit,
  Info
} from 'lucide-react';
import { db } from '../lib/firebase.ts';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.tsx';
import { Risk, Asset, RiskLikelihood, RiskImpact, RiskStatus, TreatmentStrategy } from '../types.ts';
import { cn } from '../lib/utils.ts';

const riskScoreColor = (score: number) => {
  if (score >= 17) return 'bg-red-600 text-white';
  if (score >= 10) return 'bg-orange-500 text-white';
  if (score >= 5) return 'bg-yellow-500 text-slate-900';
  return 'bg-green-500 text-white';
};

const getScoreLevel = (score: number) => {
  if (score >= 17) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
};

export const RiskRegister: React.FC = () => {
  const { userProfile } = useAuth();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRisk, setNewRisk] = useState<Partial<Risk>>({
    title: '',
    description: '',
    assetId: '',
    threat: '',
    vulnerability: '',
    impact: 3,
    likelihood: 3,
    status: 'Open',
    treatmentStrategy: 'Mitigate',
    treatmentPlan: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    if (userProfile?.organizationId) {
      fetchData();
    }
  }, [userProfile]);

  const fetchData = async () => {
    try {
      const risksQ = query(collection(db, `organizations/${userProfile.organizationId}/risks`));
      const assetsQ = query(collection(db, `organizations/${userProfile.organizationId}/assets`));
      
      const [risksSnap, assetsSnap] = await Promise.all([getDocs(risksQ), getDocs(assetsQ)]);
      
      setRisks(risksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Risk)));
      setAssets(assetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset)));
    } catch (error) {
      console.error('Error fetching risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.organizationId) return;

    const impact = newRisk.impact || 3;
    const likelihood = newRisk.likelihood || 3;
    const score = impact * likelihood;

    try {
      const riskData = {
        ...newRisk,
        score,
        organizationId: userProfile.organizationId,
        createdAt: new Date().toISOString(),
        ownerUid: userProfile.uid,
      };
      await addDoc(collection(db, `organizations/${userProfile.organizationId}/risks`), riskData);
      setShowAddModal(false);
      setNewRisk({
        title: '',
        description: '',
        assetId: '',
        threat: '',
        vulnerability: '',
        impact: 3,
        likelihood: 3,
        status: 'Open',
        treatmentStrategy: 'Mitigate',
        treatmentPlan: '',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      fetchData();
    } catch (error) {
      console.error('Error adding risk:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Risk Register</h2>
          <p className="text-slate-500">Structured ledger of cybersecurity threats and business consequences.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Risk</span>
        </button>
      </div>

      {/* Heatmap/Summary Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Risk Heatmap</p>
          <div className="grid grid-cols-5 gap-1 w-full max-w-[200px] aspect-square">
            {Array.from({ length: 25 }).map((_, i) => {
              const row = 5 - Math.floor(i / 5);
              const col = (i % 5) + 1;
              const score = row * col;
              const count = risks.filter(r => r.impact === row && r.likelihood === col).length;
              return (
                <div 
                  key={i} 
                  className={cn(
                    "rounded-sm relative group cursor-default",
                    count > 0 ? riskScoreColor(score) : "bg-slate-50"
                  )}
                >
                  {count > 0 && <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold">{count}</span>}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none z-10">
                    I:{row} L:{col} ({getScoreLevel(score)})
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-between w-full max-w-[200px] text-[8px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Likelihood →</span>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <ShieldAlert className="w-6 h-6 text-red-500 mb-4" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Critical Risks</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{risks.filter(r => r.score >= 17).length}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <Activity className="w-6 h-6 text-orange-500 mb-4" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">High Risks</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{risks.filter(r => r.score >= 10 && r.score < 17).length}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <Target className="w-6 h-6 text-slate-400 mb-4" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Under Treatment</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{risks.filter(r => r.status === 'UnderTreatment').length}</h3>
          </div>
        </div>
      </div>

      {/* Risk Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search risks, assets, or owners..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center space-x-2">
              <Filter className="w-3 h-3" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk ID & Title</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Affected</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Score</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategy</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {risks.map((risk) => {
                const asset = assets.find(a => a.id === risk.assetId);
                return (
                  <tr key={risk.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-bold text-slate-900 truncate">{risk.title}</p>
                        <p className="text-[10px] font-medium text-slate-400 tracking-tighter">ID: {risk.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {asset ? (
                        <div>
                          <p className="text-xs font-bold text-slate-700">{asset.name}</p>
                          <p className="text-[10px] text-slate-400">{asset.type}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 italic">No asset linked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={cn(
                        "inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm shadow-sm",
                        riskScoreColor(risk.score)
                      )}>
                        {risk.score}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-slate-600">{risk.treatmentStrategy}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight",
                        risk.status === 'Open' ? "bg-red-50 text-red-600" : 
                        risk.status === 'UnderTreatment' ? "bg-blue-50 text-blue-600" :
                        "bg-green-50 text-green-600"
                      )}>
                        {risk.status.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {risks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">Risk register is empty</p>
                      <p className="text-xs text-slate-500 mt-1">Add your first risk scenario to start quantifying business impact.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Risk Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Log Cyber Risk Scenario</h3>
                <p className="text-xs text-slate-500 mt-1">Quantify the business exposure of a specific threat.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>
            
            <form onSubmit={handleAddRisk} className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              {/* Section 1: Definition */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-slate-400 mb-2">
                  <Info className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Risk Definition</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Title</label>
                    <input
                      required
                      type="text"
                      value={newRisk.title}
                      onChange={(e) => setNewRisk({...newRisk, title: e.target.value})}
                      placeholder="e.g. Account Takeover via Phishing"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Affected Asset</label>
                    <select
                      required
                      value={newRisk.assetId}
                      onChange={(e) => setNewRisk({...newRisk, assetId: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                    >
                      <option value="">Select an asset...</option>
                      {assets.map(asset => (
                        <option key={asset.id} value={asset.id}>{asset.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Treatment Strategy</label>
                    <select
                      value={newRisk.treatmentStrategy}
                      onChange={(e) => setNewRisk({...newRisk, treatmentStrategy: e.target.value as TreatmentStrategy})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                    >
                      <option value="Mitigate">Mitigate</option>
                      <option value="Accept">Accept</option>
                      <option value="Transfer">Transfer</option>
                      <option value="Avoid">Avoid</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Scoring */}
              <div className="p-6 bg-slate-50 rounded-3xl space-y-6">
                <div className="flex items-center space-x-2 text-slate-400">
                  <BrainCircuit className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">5x5 Risk Quantification</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Likelihood</label>
                      <span className="text-xs font-bold text-slate-500">
                        {['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'][(newRisk.likelihood || 1) - 1]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={newRisk.likelihood}
                      onChange={(e) => setNewRisk({...newRisk, likelihood: parseInt(e.target.value) as RiskLikelihood})}
                      className="w-full accent-slate-900"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Business Impact</label>
                      <span className="text-xs font-bold text-slate-500">
                        {['Insignificant', 'Minor', 'Moderate', 'Major', 'Severe'][(newRisk.impact || 1) - 1]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={newRisk.impact}
                      onChange={(e) => setNewRisk({...newRisk, impact: parseInt(e.target.value) as RiskImpact})}
                      className="w-full accent-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculated Inherent Risk Score</p>
                  <div className={cn(
                    "px-4 py-2 rounded-xl font-black text-xl shadow-lg",
                    riskScoreColor((newRisk.impact || 3) * (newRisk.likelihood || 3))
                  )}>
                    {(newRisk.impact || 3) * (newRisk.likelihood || 3)}
                  </div>
                </div>
              </div>

              {/* Section 3: Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Threat Scenario</label>
                  <input
                    type="text"
                    value={newRisk.threat}
                    onChange={(e) => setNewRisk({...newRisk, threat: e.target.value})}
                    placeholder="e.g. External Actor / Phishing"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vulnerability</label>
                  <input
                    type="text"
                    value={newRisk.vulnerability}
                    onChange={(e) => setNewRisk({...newRisk, vulnerability: e.target.value})}
                    placeholder="e.g. Lack of Multi-Factor Auth"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Description & Consequences</label>
                <textarea
                  rows={3}
                  value={newRisk.description}
                  onChange={(e) => setNewRisk({...newRisk, description: e.target.value})}
                  placeholder="Describe how this risk manifests and the potential business impact (financial, operational, reputational)..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center space-x-2"
                >
                  <span>Log Risk Scenario</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
