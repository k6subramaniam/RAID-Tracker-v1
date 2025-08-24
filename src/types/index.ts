// Core type definitions for RAIDMASTER

export type ItemType = 'Risk' | 'Assumption' | 'Issue' | 'Dependency';

export type ItemStatus = 
  | 'Proposed' 
  | 'Open' 
  | 'In Progress' 
  | 'Mitigating' 
  | 'Resolved' 
  | 'Closed' 
  | 'Archived';

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export type Impact = 'Low' | 'Medium' | 'High' | 'Critical';

export type Likelihood = 'Low' | 'Medium' | 'High';

export interface AIAnalysis {
  analysis: string;
  suggestedPriority: Priority;
  suggestedStatus?: ItemStatus;
  validationNotes: string;
  lastAnalyzedAt: Date;
  confidence: number;
  flags?: AIFlag[];
}

export interface AIFlag {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  field?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  actor: string;
  action: string;
  previousValue?: any;
  newValue?: any;
  note?: string;
}

export interface RAIDItem {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  status: ItemStatus;
  priority: Priority;
  impact: Impact;
  likelihood: Likelihood;
  severityScore: number;
  workstream: string;
  owner: string;
  governanceTags: string[];
  dueDate?: Date;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  references: string[];
  attachments: string[];
  ai?: AIAnalysis;
  history: HistoryEntry[];
}

export interface Workstream {
  id: string;
  label: string;
  color: string;
}

export interface Owner {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  initials?: string;
}

export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  thresholds: {
    priority: Priority;
    sla: number; // in hours
  }[];
  definitions: string;
  escalationPaths: string;
}

export interface FilterState {
  searchText: string;
  types: ItemType[];
  workstreams: string[];
  statuses: ItemStatus[];
  owners: string[];
  priorities: Priority[];
  dueSoon: boolean;
  overdue: boolean;
  recentlyUpdated: boolean;
  aiFlagged: boolean;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  filters: FilterState;
  dateRange?: {
    start: Date;
    end: Date;
  };
  savedAt: Date;
  generatedContent?: string;
}

export interface MatrixCell {
  impact: Impact;
  likelihood: Likelihood;
  count: number;
  items: RAIDItem[];
  severityColor: string;
}

export interface Theme {
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    // Type colors
    risk: string;
    assumption: string;
    issue: string;
    dependency: string;
    // Priority colors
    p0: string;
    p1: string;
    p2: string;
    p3: string;
    // Status colors
    open: string;
    inProgress: string;
    resolved: string;
    closed: string;
    archived: string;
  };
}

export interface AIConfig {
  systemInstruction: string;
  analysisPromptTemplate: string;
  validationPromptTemplate: string;
  tone: 'conservative' | 'balanced' | 'assertive';
  autoApplyThreshold: number;
  validationStrictness: 'low' | 'medium' | 'high';
}

export interface CalculatorResult {
  severityScore: number;
  recommendedPriority: Priority;
  slaExpectation: number;
  colorCode: string;
}