import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  ArrowUpRight
} from 'lucide-react';
import { db } from '../lib/firebase.ts';
import { collection, query, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.tsx';
import { RemediationAction, Risk } from '../types.ts';
import { cn } from '../lib/utils.ts';

const priorityColors = {
  Low: 'text-green-600 bg-green-50 border-green-100',
  Medium: 'text-yellow-600 bg-yellow-50 border-yellow-100',
  High: 'text-orange-600 bg-orange-50 border-orange-100',
  Critical: 'text-red-600 bg-red-50 border-red-100',
};

const statusIcons = {
  Pending: Clock,
  InProgress: Activity,
  Completed: CheckCircle2,
  Overdue: AlertCircle,
};

import { Activity } from 'lucide-react';

export const RemediationManager: React.FC = () => {
  const { userProfile } = useAuth();
  const [actions, setActions] = useState<RemediationAction[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAction, setNewAction] = useState<Partial<RemediationAction>>({
    title: '',
    description: '',
    riskId: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completion: 0
  });

  useEffect(() => {
    if (userProfile?.organizationId) {
      fetchData();
    }
  }, [userProfile]);

  const fetchData = async () => {
    try {
      const actionsQ = query(collection(db, `organizations/${userProfile.organizationId}/actions`));
      const risksQ = query(collection(db, `organizations/${userProfile.organizationId}/risks`));
      
      const [actionsSnap, risksSnap] = await Promise.all([getDocs(actionsQ), getDocs(risksQ)]);
      
      setActions(actionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RemediationAction)));
      setRisks(risksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Risk)));
    } catch (error) {
      console.error('Error fetching remediation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.organizationId) return;

    try {
      const actionData = {
        ...newAction,
        organizationId: userProfile.organizationId,
        ownerUid: userProfile.uid,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, `organizations/${userProfile.organizationId}/actions`), actionData);
      setShowAddModal(false);
      setNewAction({
        title: '',
        description: '',
        riskId: '',
        priority: 'Medium',
        status: 'Pending',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completion: 0
      });
      fetchData();
    } catch (error) {
      console.error('Error adding action:', error);
    }
  };

  const handleUpdateStatus = async (actionId: string, newStatus: string) => {
    try {
      const actionRef = doc(db, `organizations/${userProfile.organizationId}/actions`, actionId);
      await updateDoc(actionRef, { 
        status: newStatus,
        completion: newStatus === 'Completed' ? 100 : 0 
      });
      fetchData();
    } catch (error) {
      console.error('Error updating action:', error);
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Remediation Tracking</h2>
          <p className="text-slate-500">Track task execution and the reduction of residual risk.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Action Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pending</p>
          <h3 className="text-2xl font-extrabold text-slate-900">{actions.filter(a => a.status === 'Pending').length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">In Progress</p>
          <h3 className="text-2xl font-extrabold text-blue-600">{actions.filter(a => a.status === 'InProgress').length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Completed</p>
          <h3 className="text-2xl font-extrabold text-green-600">{actions.filter(a => a.status === 'Completed').length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Overdue</p>
          <h3 className="text-2xl font-extrabold text-red-600">{actions.filter(a => a.status === 'Overdue').length}</h3>
        </div>
      </div>

      {/* Action List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actions or risk scenarios..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remediation Action</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Related Risk</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {actions.map((action) => {
                const risk = risks.find(r => r.id === action.riskId);
                const Icon = statusIcons[action.status as keyof typeof statusIcons] || Clock;
                return (
                  <tr key={action.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-bold text-slate-900">{action.title}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-slate-900 transition-all duration-500" 
                              style={{ width: `${action.completion}%` }} 
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{action.completion}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {risk ? (
                        <div className="flex items-center text-xs font-semibold text-slate-600 max-w-[150px]">
                          <span className="truncate">{risk.title}</span>
                          <ArrowUpRight className="w-3 h-3 ml-1 text-slate-300" />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 italic">No risk linked</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-bold border",
                        priorityColors[action.priority as keyof typeof priorityColors]
                      )}>
                        {action.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-300" />
                        <span>{new Date(action.dueDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={action.status}
                        onChange={(e) => handleUpdateStatus(action.id, e.target.value)}
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-tight bg-transparent border-none focus:ring-0 cursor-pointer",
                          action.status === 'Completed' ? "text-green-600" : 
                          action.status === 'InProgress' ? "text-blue-600" :
                          action.status === 'Overdue' ? "text-red-600" : "text-slate-400"
                        )}
                      >
                        <option value="Pending">Pending</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {actions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <CheckSquare className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">No active remediation tasks</p>
                      <p className="text-xs text-slate-500 mt-1">Create tasks to mitigate identified risk scenarios.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Action Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Assign Remediation Action</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>
            
            <form onSubmit={handleAddAction} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action Title</label>
                <input
                  required
                  type="text"
                  value={newAction.title}
                  onChange={(e) => setNewAction({...newAction, title: e.target.value})}
                  placeholder="e.g. Implement MFA for Admin Panel"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Linked Risk Scenario</label>
                  <select
                    required
                    value={newAction.riskId}
                    onChange={(e) => setNewAction({...newAction, riskId: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  >
                    <option value="">Select a risk...</option>
                    {risks.map(risk => (
                      <option key={risk.id} value={risk.id}>{risk.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</label>
                  <select
                    value={newAction.priority}
                    onChange={(e) => setNewAction({...newAction, priority: e.target.value as any})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newAction.dueDate}
                    onChange={(e) => setNewAction({...newAction, dueDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned To</label>
                  <div className="flex items-center space-x-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">{userProfile?.displayName || 'Current User'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Implementation Details</label>
                <textarea
                  rows={3}
                  value={newAction.description}
                  onChange={(e) => setNewAction({...newAction, description: e.target.value})}
                  placeholder="Describe the steps required to complete this action..."
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
