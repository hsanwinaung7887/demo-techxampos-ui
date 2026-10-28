// src/components/office/useReducer/SystemBackupRestoreReducer.js

export const initialState = {
  // ===== DATA STATE =====
  backups: [],
  selectedBackup: null,
  
  // ===== LOADING STATES =====
  isLoading: false,
  isBackupProcessing: false,
  isRestoreProcessing: false,
  
  // ===== PROGRESS TRACKING =====
  backupProgress: null,
  restoreProgress: null,
  currentBackupId: null,
  currentRestoreId: null,
  
  // ===== MESSAGES =====
  error: null,
  success: null,
  
  // ===== PAGINATION =====
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  },
  pageInputValue: '1',
  
  // ===== SUMMARY STATS =====
  summary: {
    totalSize: '0 B',
    totalBackups: 0,
    lastBackupDate: null,
    healthStatus: 'Healthy'
  },
  
  // ===== FILTERS =====
  filters: {
    backupType: 'all',
    fromDate: '',
    toDate: ''
  },
  showDatePicker: false,
  
  // ===== DIALOG VISIBILITY =====
  showBackupDialog: false,
  showRestoreDialog: false,
  showScheduleDialog: false,
  showOptimizationDialog: false,
  
  // ===== BACKUP FORM =====
  backupType: 'full',  // 'full', 'differential', 'incremental'
  
  // ===== RESTORE FORM =====
  restorePassword: '',
  restoreFile: null,
  
  // ===== SCHEDULE STATE =====
  autoBackupEnabled: true,
  schedules: {
    full: { enabled: true, day: 0, hour: 22, minute: 0, label: 'Sunday 10:00 PM' },
    differential: { enabled: true, days: [1, 2, 3, 4, 5, 6], hour: 22, minute: 0, label: 'Monday-Saturday 10:00 PM' },
    incremental: { enabled: true, interval: 12, label: 'Every 12 hours' }
  },
  nextBackupInfo: null,
  
  // ===== CUSTOM SCHEDULE =====
  showCustomScheduleDialog: false,
  customSchedule: {
    backupType: 'full',
    date: new Date().toISOString().split('T')[0],
    time: '22:00',
    repeat: 'once'
  }
};

export const SystemBackupRestoreReducer = (state, action) => {
  switch (action.type) {
    
    // ========== FETCH HISTORY ==========
    case 'FETCH_HISTORY_START':
      return { ...state, isLoading: true, error: null };
      
    case 'FETCH_HISTORY_SUCCESS':
      return {
        ...state,
        isLoading: false,
        backups: action.payload.data || [],
        pagination: {
          currentPage: action.payload.currentPage || 1,
          pageSize: action.payload.pageSize || 10,
          totalItems: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 0
        },
        summary: { ...state.summary, ...action.payload.summary }
      };
      
    case 'FETCH_HISTORY_ERROR':
      return { ...state, isLoading: false, error: action.payload };
      
    // ========== START BACKUP ==========
    case 'START_BACKUP':
      return {
        ...state,
        isBackupProcessing: true,
        error: null,
        backupProgress: { percentage: 0, message: 'Initializing backup...' },
        showBackupDialog: false
      };
      
    case 'BACKUP_SUCCESS':
      return {
        ...state,
        isBackupProcessing: false,
        success: action.payload.message || 'Backup completed successfully',
        currentBackupId: action.payload.backupId
      };
      
    case 'BACKUP_ERROR':
      return {
        ...state,
        isBackupProcessing: false,
        error: action.payload,
        backupProgress: null
      };
      
    // ========== UPDATE PROGRESS ==========
    case 'UPDATE_BACKUP_PROGRESS':
      return {
        ...state,
        backupProgress: action.payload,
        isBackupProcessing: action.payload.percentage < 100 && action.payload.percentage >= 0
      };
      
    case 'BACKUP_PROGRESS_COMPLETE':
      return {
        ...state,
        backupProgress: { percentage: 100, message: 'Backup completed!' },
        isBackupProcessing: false,
        currentBackupId: null
      };
      
    case 'BACKUP_PROGRESS_FAILED':
      return {
        ...state,
        backupProgress: null,
        isBackupProcessing: false,
        error: action.payload,
        currentBackupId: null
      };
      
    case 'CLEAR_BACKUP_PROGRESS':
      return { ...state, backupProgress: null, currentBackupId: null, isBackupProcessing: false };
      
    // ========== START RESTORE ==========
    case 'START_RESTORE':
      return {
        ...state,
        isRestoreProcessing: true,
        error: null,
        restoreProgress: { percentage: 0, message: 'Initializing restore...' },
        showRestoreDialog: false
      };
      
    case 'RESTORE_SUCCESS':
      return {
        ...state,
        isRestoreProcessing: false,
        success: 'System restored successfully',
        restorePassword: '',
        restoreFile: null,
        selectedBackup: null
      };
      
    case 'RESTORE_ERROR':
      return {
        ...state,
        isRestoreProcessing: false,
        error: action.payload,
        restoreProgress: null
      };
      
    case 'UPDATE_RESTORE_PROGRESS':
      return {
        ...state,
        restoreProgress: action.payload,
        isRestoreProcessing: action.payload.percentage < 100 && action.payload.percentage >= 0
      };
      
    case 'RESTORE_PROGRESS_COMPLETE':
      return {
        ...state,
        restoreProgress: { percentage: 100, message: 'Restore completed!' },
        isRestoreProcessing: false
      };
      
    case 'CLEAR_RESTORE_PROGRESS':
      return { ...state, restoreProgress: null, isRestoreProcessing: false };
      
    // ========== PAGINATION ==========
    case 'SET_PAGE':
      return {
        ...state,
        pagination: { ...state.pagination, currentPage: action.payload },
        pageInputValue: action.payload.toString()
      };
      
    case 'SET_PAGE_SIZE':
      return {
        ...state,
        pagination: { ...state.pagination, pageSize: action.payload, currentPage: 1 },
        pageInputValue: '1'
      };
      
    case 'SET_PAGE_INPUT':
      return { ...state, pageInputValue: action.payload };
      
    // ========== FILTERS ==========
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, currentPage: 1 },
        pageInputValue: '1'
      };
      
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: { backupType: 'all', fromDate: '', toDate: '' },
        pagination: { ...state.pagination, currentPage: 1 },
        pageInputValue: '1',
        showDatePicker: false
      };
      
    case 'SET_DATE_PICKER_VISIBLE':
      return { ...state, showDatePicker: action.payload };
      
    // ========== DIALOGS ==========
    case 'SHOW_BACKUP_DIALOG':
      return { ...state, showBackupDialog: true, backupType: action.payload || 'full', error: null };
      
    case 'HIDE_BACKUP_DIALOG':
      return { ...state, showBackupDialog: false };
      
    case 'SHOW_RESTORE_DIALOG':
      return { ...state, showRestoreDialog: true, selectedBackup: action.payload, restorePassword: '', restoreFile: null, error: null };
      
    case 'HIDE_RESTORE_DIALOG':
      return { ...state, showRestoreDialog: false, selectedBackup: null, restorePassword: '', restoreFile: null };
      
    case 'SHOW_SCHEDULE_DIALOG':
      return { ...state, showScheduleDialog: true };
      
    case 'HIDE_SCHEDULE_DIALOG':
      return { ...state, showScheduleDialog: false };
      
    case 'SHOW_OPTIMIZATION_DIALOG':
      return { ...state, showOptimizationDialog: true };
      
    case 'HIDE_OPTIMIZATION_DIALOG':
      return { ...state, showOptimizationDialog: false };
      
    case 'SHOW_CUSTOM_SCHEDULE_DIALOG':
      return { ...state, showCustomScheduleDialog: true };
      
    case 'HIDE_CUSTOM_SCHEDULE_DIALOG':
      return { ...state, showCustomScheduleDialog: false };
      
    // ========== FORM ACTIONS ==========
    case 'SET_BACKUP_TYPE':
      return { ...state, backupType: action.payload };
      
    case 'SET_RESTORE_PASSWORD':
      return { ...state, restorePassword: action.payload };
      
    case 'SET_RESTORE_FILE':
      return { ...state, restoreFile: action.payload };
      
    case 'SET_CUSTOM_SCHEDULE':
      return { ...state, customSchedule: { ...state.customSchedule, ...action.payload } };
      
    // ========== SCHEDULE ACTIONS ==========
    case 'SET_AUTO_BACKUP':
      return { ...state, autoBackupEnabled: action.payload };
      
    case 'UPDATE_SCHEDULE':
      return {
        ...state,
        schedules: {
          ...state.schedules,
          [action.payload.type]: { ...state.schedules[action.payload.type], ...action.payload.updates }
        }
      };
      
    case 'SET_NEXT_BACKUP_INFO':
      return { ...state, nextBackupInfo: action.payload };
      
    // ========== MESSAGE ACTIONS ==========
    case 'SET_ERROR':
      return { ...state, error: action.payload, success: null };
      
    case 'SET_SUCCESS':
      return { ...state, success: action.payload, error: null };
      
    case 'CLEAR_MESSAGES':
      return { ...state, error: null, success: null };
      
    case 'CLEAR_ALL_PROGRESS':
      return {
        ...state,
        backupProgress: null,
        restoreProgress: null,
        isBackupProcessing: false,
        isRestoreProcessing: false,
        currentBackupId: null,
        currentRestoreId: null
      };
      
    // ========== RESET ==========
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
};