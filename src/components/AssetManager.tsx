import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight,
  ShieldCheck,
  Server,
  Globe,
  Monitor,
  Cloud,
  Box,
  Mail,
  Network,
  Users
} from 'lucide-react';
import { db } from '../lib/firebase.ts';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.tsx';
import { Asset, AssetType, AssetCriticality } from '../types.ts';
import { cn } from '../lib/utils.ts';

const assetTypeIcons: Record<AssetType, any> = {
  Website: Globe,
  Server: Server,
  Laptop: Monitor,
  Database: Database,
  CloudService: Cloud,
  Application: Box,
  EmailSystem: Mail,
  Network: Network,
  ThirdParty: Users,
};

const criticalityColors = {
  1: 'bg-green-500',
  2: 'bg-blue-500',
  3: 'bg-yellow-500',
  4: 'bg-orange-500',
  5: 'bg-red-500',
};

export const AssetManager: React.FC = () => {
  const { userProfile } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: '',
    description: '',
    type: 'Application',
    criticality: 3,
    businessOwner: '',
    technicalOwner: '',
    status: 'Active'
  });

  useEffect(() => {
    if (userProfile?.organizationId) {
      fetchAssets();
    }
  }, [userProfile]);

  const fetchAssets = async () => {
    try {
      const q = query(
        collection(db, `organizations/${userProfile.organizationId}/assets`),
      );
      const snapshot = await getDocs(q);
      const assetList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
      setAssets(assetList);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.organizationId) return;

    try {
      const assetData = {
        ...newAsset,
        organizationId: userProfile.organizationId,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, `organizations/${userProfile.organizationId}/assets`), assetData);
      setShowAddModal(false);
      setNewAsset({
        name: '',
        description: '',
        type: 'Application',
        criticality: 3,
        businessOwner: '',
        technicalOwner: '',
        status: 'Active'
      });
      fetchAssets();
    } catch (error) {
      console.error('Error adding asset:', error);
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Business Assets</h2>
          <p className="text-slate-500">Inventory of systems, data, and services requiring protection.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <Plus className="w-4 h-4" />
          <span>Register Asset</span>
        </button>
      </div>

      {/* Stats row for Assets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Assets</p>
          <h3 className="text-2xl font-bold text-slate-900">{assets.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Critical Assets</p>
          <h3 className="text-2xl font-bold text-red-600">{assets.filter(a => a.criticality >= 4).length}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Inventory</p>
          <h3 className="text-2xl font-bold text-green-600">{assets.filter(a => a.status === 'Active').length}</h3>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assets..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>
            <button className="p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-all">
              <Filter className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset & Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Criticality</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Owners</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {assets.map((asset) => {
                const Icon = assetTypeIcons[asset.type] || Box;
                return (
                  <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <Icon className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{asset.name}</p>
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{asset.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div 
                            key={level}
                            className={cn(
                              "w-1.5 h-4 rounded-full",
                              level <= asset.criticality ? criticalityColors[asset.criticality as AssetCriticality] : "bg-slate-100"
                            )}
                          />
                        ))}
                        <span className="ml-2 text-xs font-bold text-slate-600">{asset.criticality}/5</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-slate-700">{asset.businessOwner}</p>
                      <p className="text-[10px] text-slate-400">{asset.technicalOwner}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight",
                        asset.status === 'Active' ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <Database className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">No assets registered</p>
                      <p className="text-xs text-slate-500 mt-1">Start by adding your critical business systems.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Register New Business Asset</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>
            
            <form onSubmit={handleAddAsset} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Name</label>
                  <input
                    required
                    type="text"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                    placeholder="e.g. Customer Database"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Type</label>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({...newAsset, type: e.target.value as AssetType})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  >
                    {Object.keys(assetTypeIcons).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Criticality (1-5)</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={newAsset.criticality}
                      onChange={(e) => setNewAsset({...newAsset, criticality: parseInt(e.target.value) as AssetCriticality})}
                      className="flex-1 accent-slate-900"
                    />
                    <span className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg font-bold text-xs">{newAsset.criticality}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
                  <select
                    value={newAsset.status}
                    onChange={(e) => setNewAsset({...newAsset, status: e.target.value as any})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Owner</label>
                  <input
                    type="text"
                    value={newAsset.businessOwner}
                    onChange={(e) => setNewAsset({...newAsset, businessOwner: e.target.value})}
                    placeholder="e.g. Head of Operations"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technical Owner</label>
                  <input
                    type="text"
                    value={newAsset.technicalOwner}
                    onChange={(e) => setNewAsset({...newAsset, technicalOwner: e.target.value})}
                    placeholder="e.g. Lead Developer"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description & Business Function</label>
                <textarea
                  rows={3}
                  value={newAsset.description}
                  onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                  placeholder="Describe the business purpose and consequences of failure..."
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
                  className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
