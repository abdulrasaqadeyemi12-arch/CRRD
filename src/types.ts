export type AssetType = 
  | 'Website' | 'Server' | 'Laptop' | 'Database' | 'CloudService' 
  | 'Application' | 'EmailSystem' | 'Network' | 'ThirdParty';

export type AssetCriticality = 1 | 2 | 3 | 4 | 5;

export interface Asset {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  type: AssetType;
  criticality: AssetCriticality;
  businessOwner: string;
  technicalOwner: string;
  status: 'Active' | 'Inactive' | 'Retired';
  createdAt: string;
}

export type RiskLikelihood = 1 | 2 | 3 | 4 | 5;
export type RiskImpact = 1 | 2 | 3 | 4 | 5;
export type RiskStatus = 'Open' | 'UnderTreatment' | 'Mitigated' | 'Accepted' | 'Avoided' | 'Transferred';
export type TreatmentStrategy = 'Mitigate' | 'Accept' | 'Transfer' | 'Avoid';

export interface Risk {
  id: string;
  organizationId: string;
  assetId: string;
  title: string;
  description: string;
  threat: string;
  vulnerability: string;
  impact: RiskImpact;
  likelihood: RiskLikelihood;
  score: number; // impact * likelihood
  status: RiskStatus;
  treatmentStrategy: TreatmentStrategy;
  treatmentPlan: string;
  ownerUid: string;
  dueDate: string;
  residualImpact?: RiskImpact;
  residualLikelihood?: RiskLikelihood;
  residualScore?: number;
  createdAt: string;
}

export interface RemediationAction {
  id: string;
  organizationId: string;
  riskId: string;
  title: string;
  description: string;
  ownerUid: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'InProgress' | 'Completed' | 'Overdue';
  dueDate: string;
  completion: number;
}

export interface Organization {
  id: string;
  name: string;
  adminUid: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  organizationId: string;
  role: 'Admin' | 'RiskManager' | 'Analyst' | 'Viewer';
  createdAt: string;
}
