// src/components/office/apis/SystemBackupRestoreApi.jsx
import officeApiClient from '../../services/officeApiClient';

const API_BASE = '/office/backup';

export const SystemBackupRestoreApi = {
  
  startFullBackup: async () => {
    const response = await officeApiClient.post(`${API_BASE}/full`);
    return response.data;
  },

  startDifferentialBackup: async () => {
    const response = await officeApiClient.post(`${API_BASE}/differential`);
    return response.data;
  },

  startIncrementalBackup: async () => {
    const response = await officeApiClient.post(`${API_BASE}/incremental`);
    return response.data;
  },

  getProgress: async (backupId) => {
    const response = await officeApiClient.get(`${API_BASE}/progress/${backupId}`);
    return response.data;
  },

  restoreBackup: async (file, password = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (password) formData.append('password', password);
    
    const response = await officeApiClient.post(`${API_BASE}/restore`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getBackupHistory: async (page = 1, size = 10, backupType = 'all', fromDate = '', toDate = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (backupType && backupType !== 'all') params.append('backupType', backupType);
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    
    const response = await officeApiClient.get(`${API_BASE}/history?${params}`);
    return response.data;
  },

  restartSystem: async () => {
    const response = await officeApiClient.post(`${API_BASE}/system/restart`);
    return response.data;
  },

  optimizeSystem: async () => {
    const response = await officeApiClient.post(`${API_BASE}/system/optimize`);
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await officeApiClient.get(`${API_BASE}/system/health`);
    return response.data;
  },

  getSchedules: async () => {
    const response = await officeApiClient.get(`${API_BASE}/schedules`);
    return response.data;
  },

  updateSchedule: async (type, scheduleData) => {
    const response = await officeApiClient.put(`${API_BASE}/schedules/${type}`, scheduleData);
    return response.data;
  },

  addCustomSchedule: async (scheduleData) => {
    const response = await officeApiClient.post(`${API_BASE}/schedules/custom`, scheduleData);
    return response.data;
  }
};