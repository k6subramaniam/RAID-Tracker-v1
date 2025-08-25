import { ItemType, ItemStatus, Priority, Impact, Likelihood, Workstream, Owner, RAIDItem } from '../types';

export const ITEM_TYPES: ItemType[] = ['Risk', 'Assumption', 'Issue', 'Dependency'];

export const ITEM_STATUSES: ItemStatus[] = [
  'Proposed',
  'Open',
  'In Progress',
  'Mitigating',
  'Resolved',
  'Closed',
  'Archived'
];

export const PRIORITIES: Priority[] = ['P0', 'P1', 'P2', 'P3'];

export const IMPACTS: Impact[] = ['Low', 'Medium', 'High', 'Critical'];

export const LIKELIHOODS: Likelihood[] = ['Low', 'Medium', 'High'];

export const DEFAULT_WORKSTREAMS: Workstream[] = [
  { id: 'engineering', label: 'Engineering', color: '#3B82F6' },
  { id: 'product', label: 'Product', color: '#8B5CF6' },
  { id: 'design', label: 'Design', color: '#EC4899' },
  { id: 'marketing', label: 'Marketing', color: '#F59E0B' },
  { id: 'sales', label: 'Sales', color: '#10B981' },
  { id: 'operations', label: 'Operations', color: '#6366F1' },
  { id: 'finance', label: 'Finance', color: '#84CC16' },
  { id: 'hr', label: 'Human Resources', color: '#06B6D4' },
];

export const DEFAULT_OWNERS: Owner[] = [
  { id: 'john_doe', name: 'John Doe', role: 'Project Manager', initials: 'JD' },
  { id: 'jane_smith', name: 'Jane Smith', role: 'Tech Lead', initials: 'JS' },
  { id: 'mike_johnson', name: 'Mike Johnson', role: 'Product Owner', initials: 'MJ' },
  { id: 'sarah_wilson', name: 'Sarah Wilson', role: 'Engineering Manager', initials: 'SW' },
  { id: 'david_brown', name: 'David Brown', role: 'Team Lead', initials: 'DB' },
];

export const SAMPLE_RAID_ITEMS: Omit<RAIDItem, 'id' | 'createdAt' | 'updatedAt' | 'history'>[] = [
  {
    type: 'Risk',
    title: 'API Rate Limiting Issues',
    description: 'Third-party API may impose rate limits that could affect system performance during peak usage.',
    status: 'Open',
    priority: 'P2',
    impact: 'High',
    likelihood: 'Medium',
    severityScore: 6,
    workstream: 'engineering',
    owner: 'jane_smith',
    governanceTags: ['Technical'],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    references: ['https://api-docs.example.com/rate-limits'],
    attachments: [],
  },
  {
    type: 'Issue',
    title: 'Authentication Service Downtime',
    description: 'Users unable to login due to authentication service instability affecting 15% of user base.',
    status: 'In Progress',
    priority: 'P1',
    impact: 'Critical',
    likelihood: 'High',
    severityScore: 10,
    workstream: 'engineering',
    owner: 'sarah_wilson',
    governanceTags: ['Critical', 'Security'],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    references: [],
    attachments: [],
  },
  {
    type: 'Assumption',
    title: 'User Adoption Rate',
    description: 'Assuming 40% adoption rate within first quarter based on beta testing feedback.',
    status: 'Proposed',
    priority: 'P3',
    impact: 'Medium',
    likelihood: 'Medium',
    severityScore: 3,
    workstream: 'product',
    owner: 'mike_johnson',
    governanceTags: ['Business'],
    references: ['https://analytics.example.com/adoption-metrics'],
    attachments: [],
  },
  {
    type: 'Dependency',
    title: 'Design System Component Library',
    description: 'Frontend development depends on completion of design system component library by design team.',
    status: 'Open',
    priority: 'P2',
    impact: 'High',
    likelihood: 'Low',
    severityScore: 5,
    workstream: 'design',
    owner: 'john_doe',
    governanceTags: ['Dependencies'],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    references: [],
    attachments: [],
  },
];

export const SEVERITY_MATRIX = {
  'Critical-High': { score: 10, priority: 'P0' as Priority, color: '#DC2626' },
  'Critical-Medium': { score: 9, priority: 'P0' as Priority, color: '#DC2626' },
  'Critical-Low': { score: 8, priority: 'P1' as Priority, color: '#EA580C' },
  'High-High': { score: 7, priority: 'P1' as Priority, color: '#EA580C' },
  'High-Medium': { score: 6, priority: 'P1' as Priority, color: '#F59E0B' },
  'High-Low': { score: 5, priority: 'P2' as Priority, color: '#F59E0B' },
  'Medium-High': { score: 4, priority: 'P2' as Priority, color: '#EAB308' },
  'Medium-Medium': { score: 3, priority: 'P2' as Priority, color: '#EAB308' },
  'Medium-Low': { score: 2, priority: 'P3' as Priority, color: '#6B7280' },
  'Low-High': { score: 2, priority: 'P3' as Priority, color: '#6B7280' },
  'Low-Medium': { score: 1, priority: 'P3' as Priority, color: '#9CA3AF' },
  'Low-Low': { score: 0, priority: 'P3' as Priority, color: '#D1D5DB' },
};

export const COLORS = {
  // Type colors
  risk: '#EF4444',
  assumption: '#3B82F6',
  issue: '#F97316',
  dependency: '#8B5CF6',
  
  // Priority colors
  p0: '#DC2626',
  p1: '#EA580C',
  p2: '#F59E0B',
  p3: '#6B7280',
  
  // Status colors
  proposed: '#9CA3AF',
  open: '#3B82F6',
  inProgress: '#6366F1',
  mitigating: '#8B5CF6',
  resolved: '#10B981',
  closed: '#059669',
  archived: '#6B7280',
};

export const SLA_BY_PRIORITY = {
  P0: 24, // hours
  P1: 48,
  P2: 72,
  P3: 168, // 1 week
};

export const DEFAULT_AI_CONFIG = {
  systemInstruction: `You are an expert RAID (Risks, Assumptions, Issues, Dependencies) analyst. 
    Analyze items carefully and provide clear, actionable recommendations.`,
  analysisPromptTemplate: `Analyze the following RAID item and provide recommendations:
    {{item}}
    Consider the governance thresholds and severity matrix.
    Provide suggested priority, status, and rationale.`,
  validationPromptTemplate: `Validate the following RAID item for data quality:
    {{item}}
    Check for required fields, ambiguous language, and alignment.`,
  tone: 'balanced' as const,
  autoApplyThreshold: 0.85,
  validationStrictness: 'medium' as const,
};

export const ANIMATION_CONFIG = {
  duration: 300,
  useNativeDriver: true,
};