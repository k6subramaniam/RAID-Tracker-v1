import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';
import { Impact, Likelihood, Priority, ItemType, ItemStatus } from '../types';
import { SEVERITY_MATRIX, SLA_BY_PRIORITY, COLORS } from '../constants';

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate severity score based on impact and likelihood
export const calculateSeverityScore = (
  impact: Impact,
  likelihood: Likelihood
): { score: number; priority: Priority; color: string } => {
  const key = `${impact}-${likelihood}` as keyof typeof SEVERITY_MATRIX;
  return SEVERITY_MATRIX[key] || { score: 0, priority: 'P3', color: COLORS.p3 };
};

// Format date for display
export const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

// Format date with time
export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
};

// Get relative time string
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Check if date is overdue
export const isOverdue = (date: Date | string | undefined): boolean => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isBefore(dateObj, new Date());
};

// Check if date is due soon (within specified days)
export const isDueSoon = (date: Date | string | undefined, days: number = 7): boolean => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const futureDate = addDays(now, days);
  return isAfter(dateObj, now) && isBefore(dateObj, futureDate);
};

// Get color for item type
export const getTypeColor = (type: ItemType): string => {
  const colorMap: Record<ItemType, string> = {
    Risk: COLORS.risk,
    Assumption: COLORS.assumption,
    Issue: COLORS.issue,
    Dependency: COLORS.dependency,
  };
  return colorMap[type] || COLORS.p3;
};

// Get color for priority
export const getPriorityColor = (priority: Priority): string => {
  const colorMap: Record<Priority, string> = {
    P0: COLORS.p0,
    P1: COLORS.p1,
    P2: COLORS.p2,
    P3: COLORS.p3,
  };
  return colorMap[priority] || COLORS.p3;
};

// Get color for status
export const getStatusColor = (status: ItemStatus): string => {
  const colorMap: Record<ItemStatus, string> = {
    Proposed: COLORS.proposed,
    Open: COLORS.open,
    'In Progress': COLORS.inProgress,
    Mitigating: COLORS.mitigating,
    Resolved: COLORS.resolved,
    Closed: COLORS.closed,
    Archived: COLORS.archived,
  };
  return colorMap[status] || COLORS.p3;
};

// Get SLA for priority
export const getSLA = (priority: Priority): number => {
  return SLA_BY_PRIORITY[priority] || 168;
};

// Truncate text
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Get initials from name
export const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

// Sort items by priority
export const sortByPriority = <T extends { priority: Priority }>(items: T[]): T[] => {
  const priorityOrder: Priority[] = ['P0', 'P1', 'P2', 'P3'];
  return [...items].sort(
    (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
  );
};

// Sort items by severity score
export const sortBySeverity = <T extends { severityScore: number }>(items: T[]): T[] => {
  return [...items].sort((a, b) => b.severityScore - a.severityScore);
};

// Sort items by due date
export const sortByDueDate = <T extends { dueDate?: Date }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
};

// Sort items by updated date
export const sortByUpdatedDate = <T extends { updatedAt: Date }>(items: T[]): T[] => {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

// Validate required fields for item type
export const validateRequiredFields = (
  item: any,
  type: ItemType
): { valid: boolean; missing: string[] } => {
  const requiredFields = ['title', 'description', 'type', 'status', 'priority', 'impact', 'likelihood', 'workstream', 'owner'];
  const missing: string[] = [];
  
  for (const field of requiredFields) {
    if (!item[field] || (typeof item[field] === 'string' && item[field].trim() === '')) {
      missing.push(field);
    }
  }
  
  // Additional validation based on type
  if (type === 'Risk' || type === 'Issue') {
    if (!item.dueDate) {
      missing.push('dueDate');
    }
  }
  
  return { valid: missing.length === 0, missing };
};

// Export data to text format
export const exportToText = (data: any[], title: string = 'RAID Report'): string => {
  let text = `${title}\n${'='.repeat(title.length)}\n\n`;
  text += `Generated: ${formatDateTime(new Date())}\n\n`;
  
  if (data.length === 0) {
    text += 'No items to display.\n';
    return text;
  }
  
  data.forEach((item, index) => {
    text += `${index + 1}. ${item.title}\n`;
    text += `   Type: ${item.type} | Priority: ${item.priority} | Status: ${item.status}\n`;
    text += `   Owner: ${item.owner} | Workstream: ${item.workstream}\n`;
    if (item.dueDate) {
      text += `   Due: ${formatDate(item.dueDate)}`;
      if (isOverdue(item.dueDate)) {
        text += ' (OVERDUE)';
      }
      text += '\n';
    }
    text += `   Description: ${truncateText(item.description, 100)}\n`;
    text += '\n';
  });
  
  return text;
};

// Generate executive summary
export const generateExecutiveSummary = (items: any[]): string => {
  const total = items.length;
  const byType = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byPriority = items.reduce((acc, item) => {
    acc[item.priority] = (acc[item.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const overdue = items.filter((item) => isOverdue(item.dueDate)).length;
  const dueSoon = items.filter((item) => isDueSoon(item.dueDate)).length;
  
  let summary = `Executive Summary\n\n`;
  summary += `Total RAID items: ${total}\n\n`;
  
  summary += `By Type:\n`;
  Object.entries(byType).forEach(([type, count]) => {
    summary += `- ${type}: ${count} (${((count / total) * 100).toFixed(1)}%)\n`;
  });
  
  summary += `\nBy Priority:\n`;
  ['P0', 'P1', 'P2', 'P3'].forEach((priority) => {
    const count = byPriority[priority] || 0;
    if (count > 0) {
      summary += `- ${priority}: ${count} (${((count / total) * 100).toFixed(1)}%)\n`;
    }
  });
  
  if (overdue > 0) {
    summary += `\n⚠️ Overdue items: ${overdue}\n`;
  }
  
  if (dueSoon > 0) {
    summary += `📅 Due within 7 days: ${dueSoon}\n`;
  }
  
  const criticalItems = items.filter((item) => item.priority === 'P0' || item.priority === 'P1');
  if (criticalItems.length > 0) {
    summary += `\nCritical items requiring immediate attention:\n`;
    criticalItems.slice(0, 5).forEach((item) => {
      summary += `- ${item.title} (${item.priority})\n`;
    });
  }
  
  return summary;
};

export const calculateSeverityScore = (impact: string, likelihood: string): number => {
  const impactScore = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };
  const likelihoodScore = { 'Low': 1, 'Medium': 2, 'High': 3 };
  
  const impactValue = impactScore[impact as keyof typeof impactScore] || 2;
  const likelihoodValue = likelihoodScore[likelihood as keyof typeof likelihoodScore] || 2;
  
  return impactValue * likelihoodValue;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};