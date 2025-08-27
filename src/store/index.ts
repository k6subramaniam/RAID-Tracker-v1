import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  RAIDItem, 
  FilterState, 
  Report, 
  AIConfig, 
  Workstream, 
  Owner,
  HistoryEntry 
} from '../types';
import { 
  DEFAULT_WORKSTREAMS, 
  DEFAULT_OWNERS, 
  DEFAULT_AI_CONFIG,
  SAMPLE_RAID_ITEMS 
} from '../constants';
import { apiService } from '../services/api';
import { generateId, calculateSeverityScore } from '../utils/helpers';

interface AppState {
  // RAID Items
  items: RAIDItem[];
  isLoading: boolean;
  error: string | null;
  dashboardStats: any;
  
  // RAID Items actions (now connected to backend)
  loadItems: () => Promise<void>;
  addItem: (item: Omit<RAIDItem, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'severityScore' | 'ai' | 'attachments'>) => Promise<string>;
  updateItem: (id: string, updates: Partial<RAIDItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // Filters
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  
  // Workstreams
  workstreams: Workstream[];
  addWorkstream: (workstream: Omit<Workstream, 'id'>) => void;
  updateWorkstream: (id: string, updates: Partial<Workstream>) => void;
  deleteWorkstream: (id: string) => void;
  
  // Owners
  owners: Owner[];
  addOwner: (owner: Omit<Owner, 'id'>) => void;
  updateOwner: (id: string, updates: Partial<Owner>) => void;
  deleteOwner: (id: string) => void;
  
  // Reports
  reports: Report[];
  saveReport: (report: Omit<Report, 'id' | 'savedAt'>) => string;
  deleteReport: (id: string) => void;
  
  // AI Config
  aiConfig: AIConfig;
  updateAIConfig: (config: Partial<AIConfig>) => void;
  resetAIConfig: () => void;
  
  // Theme
  themeMode: 'light' | 'dark' | 'auto';
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => void;
  
  // Draft management
  draftItem: Partial<RAIDItem> | null;
  setDraftItem: (draft: Partial<RAIDItem> | null) => void;
  clearDraft: () => void;
  
  // Dashboard stats
  loadDashboardStats: () => Promise<void>;
  
  // Error handling
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Initialization function to add sample data if store is empty
  initializeSampleData: () => void;
  getFilteredItems: () => RAIDItem[];
  getItemsByType: (type: RAIDItem['type']) => RAIDItem[];
  getItemsByStatus: (status: RAIDItem['status']) => RAIDItem[];
  getOverdueItems: () => RAIDItem[];
  getDueSoonItems: (days?: number) => RAIDItem[];
}

const defaultFilterState: FilterState = {
  searchText: '',
  types: [],
  workstreams: [],
  statuses: [],
  owners: [],
  priorities: [],
  dueSoon: false,
  overdue: false,
  recentlyUpdated: false,
  aiFlagged: false,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      filters: defaultFilterState,
      workstreams: DEFAULT_WORKSTREAMS,
      owners: DEFAULT_OWNERS,
      reports: [],
      aiConfig: DEFAULT_AI_CONFIG,
      themeMode: 'auto',
      draftItem: null,
      
      // RAID Items actions
      addItem: (item) => {
        const id = generateId();
        const now = new Date();
        const newItem: RAIDItem = {
          ...item,
          id,
          createdAt: now,
          updatedAt: now,
          history: [{
            id: generateId(),
            timestamp: now,
            actor: 'User',
            action: 'Created item',
            note: 'Initial creation',
          }],
        };
        set((state) => ({
          items: [...state.items, newItem],
        }));
        return id;
      },
      
      updateItem: (id, updates) => {
        const now = new Date();
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              const historyEntry: HistoryEntry = {
                id: generateId(),
                timestamp: now,
                actor: 'User',
                action: 'Updated item',
                previousValue: item,
                newValue: updates,
                note: `Updated fields: ${Object.keys(updates).join(', ')}`,
              };
              return {
                ...item,
                ...updates,
                updatedAt: now,
                history: [...item.history, historyEntry],
              };
            }
            return item;
          }),
        }));
      },
      
      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      // Filters actions
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },
      
      resetFilters: () => {
        set({ filters: defaultFilterState });
      },
      
      // Workstreams actions
      addWorkstream: (workstream) => {
        set((state) => ({
          workstreams: [...state.workstreams, { ...workstream, id: generateId() }],
        }));
      },
      
      updateWorkstream: (id, updates) => {
        set((state) => ({
          workstreams: state.workstreams.map((ws) =>
            ws.id === id ? { ...ws, ...updates } : ws
          ),
        }));
      },
      
      deleteWorkstream: (id) => {
        set((state) => ({
          workstreams: state.workstreams.filter((ws) => ws.id !== id),
        }));
      },
      
      // Owners actions
      addOwner: (owner) => {
        set((state) => ({
          owners: [...state.owners, { ...owner, id: generateId() }],
        }));
      },
      
      updateOwner: (id, updates) => {
        set((state) => ({
          owners: state.owners.map((owner) =>
            owner.id === id ? { ...owner, ...updates } : owner
          ),
        }));
      },
      
      deleteOwner: (id) => {
        set((state) => ({
          owners: state.owners.filter((owner) => owner.id !== id),
        }));
      },
      
      // Reports actions
      saveReport: (report) => {
        const id = generateId();
        set((state) => ({
          reports: [...state.reports, { ...report, id, savedAt: new Date() }],
        }));
        return id;
      },
      
      deleteReport: (id) => {
        set((state) => ({
          reports: state.reports.filter((report) => report.id !== id),
        }));
      },
      
      // AI Config actions
      updateAIConfig: (config) => {
        set((state) => ({
          aiConfig: { ...state.aiConfig, ...config },
        }));
      },
      
      resetAIConfig: () => {
        set({ aiConfig: DEFAULT_AI_CONFIG });
      },
      
      // Theme actions
      setThemeMode: (mode) => {
        set({ themeMode: mode });
      },
      
      // Draft actions
      setDraftItem: (draft) => {
        set({ draftItem: draft });
      },
      
      clearDraft: () => {
        set({ draftItem: null });
      },
      
      // Initialization function
      initializeSampleData: () => {
        const state = get();
        if (state.items.length === 0) {
          // Add sample RAID items
          SAMPLE_RAID_ITEMS.forEach(item => {
            const id = generateId();
            const now = new Date();
            const newItem: RAIDItem = {
              ...item,
              id,
              createdAt: now,
              updatedAt: now,
              history: [{
                id: generateId(),
                timestamp: now,
                actor: 'System',
                action: 'Created sample item',
                note: 'Sample data initialization',
              }],
            };
            state.items.push(newItem);
          });
          set({ items: [...state.items] });
        }
      },
      
      // Utility functions
      getFilteredItems: () => {
        const state = get();
        let filtered = [...state.items];
        const { filters } = state;
        
        // Search filter
        if (filters.searchText) {
          const search = filters.searchText.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              item.title.toLowerCase().includes(search) ||
              item.description.toLowerCase().includes(search)
          );
        }
        
        // Type filter
        if (filters.types.length > 0) {
          filtered = filtered.filter((item) => filters.types.includes(item.type));
        }
        
        // Workstream filter
        if (filters.workstreams.length > 0) {
          filtered = filtered.filter((item) =>
            filters.workstreams.includes(item.workstream)
          );
        }
        
        // Status filter
        if (filters.statuses.length > 0) {
          filtered = filtered.filter((item) => filters.statuses.includes(item.status));
        }
        
        // Owner filter
        if (filters.owners.length > 0) {
          filtered = filtered.filter((item) => filters.owners.includes(item.owner));
        }
        
        // Priority filter
        if (filters.priorities.length > 0) {
          filtered = filtered.filter((item) => filters.priorities.includes(item.priority));
        }
        
        // Due soon filter
        if (filters.dueSoon) {
          filtered = get().getDueSoonItems(7).filter((item) =>
            filtered.includes(item)
          );
        }
        
        // Overdue filter
        if (filters.overdue) {
          filtered = get().getOverdueItems().filter((item) =>
            filtered.includes(item)
          );
        }
        
        // Recently updated filter
        if (filters.recentlyUpdated) {
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          filtered = filtered.filter((item) => item.updatedAt >= threeDaysAgo);
        }
        
        // AI flagged filter
        if (filters.aiFlagged) {
          filtered = filtered.filter(
            (item) => item.ai && item.ai.flags && item.ai.flags.length > 0
          );
        }
        
        return filtered;
      },
      
      getItemsByType: (type) => {
        return get().items.filter((item) => item.type === type);
      },
      
      getItemsByStatus: (status) => {
        return get().items.filter((item) => item.status === status);
      },
      
      getOverdueItems: () => {
        const now = new Date();
        return get().items.filter(
          (item) => item.dueDate && item.dueDate < now && 
          !['Resolved', 'Closed', 'Archived'].includes(item.status)
        );
      },
      
      getDueSoonItems: (days = 7) => {
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + days);
        return get().items.filter(
          (item) =>
            item.dueDate &&
            item.dueDate >= now &&
            item.dueDate <= future &&
            !['Resolved', 'Closed', 'Archived'].includes(item.status)
        );
      },
    }),
    {
      name: 'raidmaster-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        workstreams: state.workstreams,
        owners: state.owners,
        reports: state.reports,
        aiConfig: state.aiConfig,
        themeMode: state.themeMode,
      }),
    }
  )
);