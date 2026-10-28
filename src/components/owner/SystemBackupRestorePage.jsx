// src/components/office/SystemBackupRestorePage.jsx
import React, { useState, useEffect, useRef, useCallback, useReducer } from "react";
import { NavLink } from "react-router-dom";
import { SystemBackupRestoreApi } from "../apis/systemBackupRestoreApi";
import { SystemBackupRestoreReducer,initialState } from "../owner-useReducer/systemBackupRestoreReducer";
import "../../light-style/office-css/systemBackupRestore.css";

const SystemBackupRestorePage = () => {
  const [state, localDispatch] = useReducer(SystemBackupRestoreReducer, initialState);
  
  // Language State
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('officeLanguage') || 'en';
  });

  const pollingIntervalRef = useRef(null);
  const isInitialMount = useRef(true);

  // Language Effect
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'officeLanguage') setLanguage(e.newValue || 'en');
    };
    const handleLanguageEvent = () => {
      setLanguage(localStorage.getItem('officeLanguage') || 'en');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('languageChange', handleLanguageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChange', handleLanguageEvent);
    };
  }, []);

  // Fetch Backup History
  const fetchHistory = useCallback(async () => {
    const { currentPage, pageSize } = state.pagination;
    const { backupType, fromDate, toDate } = state.filters;
    
    localDispatch({ type: 'FETCH_HISTORY_START' });
    
    try {
      const response = await SystemBackupRestoreApi.getBackupHistory(currentPage, pageSize, backupType, fromDate, toDate);
      if (response.success) {
        localDispatch({ type: 'FETCH_HISTORY_SUCCESS', payload: response.data });
      } else {
        localDispatch({ type: 'FETCH_HISTORY_ERROR', payload: response.message });
      }
    } catch (error) {
      localDispatch({ type: 'FETCH_HISTORY_ERROR', payload: error.message });
    }
  }, [state.pagination.currentPage, state.pagination.pageSize, state.filters]);

  // Poll Backup Progress
  const startPollingBackup = useCallback((backupId) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await SystemBackupRestoreApi.getProgress(backupId);
        if (response.success && response.data) {
          const progress = response.data;
          localDispatch({ type: 'UPDATE_BACKUP_PROGRESS', payload: progress });
          
          if (progress.percentage >= 100) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            localDispatch({ type: 'BACKUP_PROGRESS_COMPLETE' });
            fetchHistory();
          } else if (progress.percentage < 0) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
            localDispatch({ type: 'BACKUP_PROGRESS_FAILED', payload: progress.message });
          }
        }
      } catch (error) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        localDispatch({ type: 'BACKUP_PROGRESS_FAILED', payload: error.message });
      }
    }, 2000);
  }, [fetchHistory]);

  // Handle Full Backup
  const handleFullBackup = async () => {
    localDispatch({ type: 'START_BACKUP' });
    
    try {
      const response = await SystemBackupRestoreApi.startFullBackup();
      if (response.success) {
        localDispatch({ type: 'BACKUP_SUCCESS', payload: { backupId: response.backupId, message: response.message } });
        startPollingBackup(response.backupId);
        setTimeout(() => fetchHistory(), 1000);
      } else {
        localDispatch({ type: 'BACKUP_ERROR', payload: response.message });
      }
    } catch (error) {
      localDispatch({ type: 'BACKUP_ERROR', payload: error.message });
    }
  };

  // Handle Differential Backup
  const handleDifferentialBackup = async () => {
    localDispatch({ type: 'START_BACKUP' });
    
    try {
      const response = await SystemBackupRestoreApi.startDifferentialBackup();
      if (response.success) {
        localDispatch({ type: 'BACKUP_SUCCESS', payload: { backupId: response.backupId, message: response.message } });
        startPollingBackup(response.backupId);
        setTimeout(() => fetchHistory(), 1000);
      } else {
        localDispatch({ type: 'BACKUP_ERROR', payload: response.message });
      }
    } catch (error) {
      localDispatch({ type: 'BACKUP_ERROR', payload: error.message });
    }
  };

  // Handle Incremental Backup
  const handleIncrementalBackup = async () => {
    localDispatch({ type: 'START_BACKUP' });
    
    try {
      const response = await SystemBackupRestoreApi.startIncrementalBackup();
      if (response.success) {
        localDispatch({ type: 'BACKUP_SUCCESS', payload: { backupId: response.backupId, message: response.message } });
        startPollingBackup(response.backupId);
        setTimeout(() => fetchHistory(), 1000);
      } else {
        localDispatch({ type: 'BACKUP_ERROR', payload: response.message });
      }
    } catch (error) {
      localDispatch({ type: 'BACKUP_ERROR', payload: error.message });
    }
  };

  // Handle Restore with File Upload
  const handleRestore = async () => {
    if (!state.restoreFile) {
      localDispatch({ type: 'SET_ERROR', payload: language === 'mm' ? 'ကျေးဇူးပြု၍ ပြန်လည်ယူရန် ဖိုင်တစ်ခုကို ရွေးချယ်ပါ။' : 'Please select a backup file to restore' });
      return;
    }
    
    localDispatch({ type: 'START_RESTORE' });
    
    try {
      const response = await SystemBackupRestoreApi.restoreBackup(state.restoreFile, state.restorePassword);
      if (response.success) {
        localDispatch({ type: 'RESTORE_SUCCESS' });
        setTimeout(() => fetchHistory(), 3000);
      } else {
        localDispatch({ type: 'RESTORE_ERROR', payload: response.message });
      }
    } catch (error) {
      localDispatch({ type: 'RESTORE_ERROR', payload: error.message });
    }
  };

  // Pagination Handlers
  const handlePageChange = (page) => {
    if (page < 1 || page > state.pagination.totalPages) return;
    localDispatch({ type: 'SET_PAGE', payload: page });
  };

  const handlePageSizeChange = (size) => {
    localDispatch({ type: 'SET_PAGE_SIZE', payload: parseInt(size) });
  };

  const handlePageInputChange = (value) => {
    localDispatch({ type: 'SET_PAGE_INPUT', payload: value });
  };

  const handlePageInputBlur = () => {
    let page = parseInt(state.pageInputValue);
    if (isNaN(page)) page = 1;
    if (page < 1) page = 1;
    if (page > state.pagination.totalPages) page = state.pagination.totalPages;
    handlePageChange(page);
  };

  // Filter Handlers
  const handleFilterChange = (key, value) => {
    localDispatch({ type: 'SET_FILTERS', payload: { [key]: value } });
  };

  const clearAllFilters = () => {
    localDispatch({ type: 'CLEAR_FILTERS' });
  };

  // Helper Functions
  const totalItems = state.pagination.totalItems;
  const totalPages = state.pagination.totalPages;
  const currentPage = state.pagination.currentPage;
  const pageSize = state.pagination.pageSize;
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Effects
  useEffect(() => {
    if (state.success || state.error) {
      const timer = setTimeout(() => {
        localDispatch({ type: 'CLEAR_MESSAGES' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.success, state.error]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchHistory();
    }
  }, [fetchHistory]);

  useEffect(() => {
    if (!isInitialMount.current) {
      fetchHistory();
    }
  }, [state.pagination.currentPage, state.pagination.pageSize, state.filters, fetchHistory]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  // Current Progress Display
  const currentProgress = state.backupProgress || state.restoreProgress;
  const isProcessing = state.isBackupProcessing || state.isRestoreProcessing;

  return (
    <div className="system-backup-main">
      {/* Header */}
      <div className="backup-header">
        <div className="header-top-row">
          <NavLink to="/office/dashboard" className="backup-back-btn">
            <i className="fas fa-arrow-left"></i> {language === 'mm' ? 'Dashboard သို့ပြန်သွားရန်' : 'Back to Dashboard'}
          </NavLink>
          <div className="header-center-content">
            <h1><i className="fas fa-database"></i> {language === 'mm' ? 'စနစ် အရန်သိမ်းခြင်းနှင့် ပြန်လည်ယူခြင်း' : 'System Backup & Restore'}</h1>
            <p>{language === 'mm' ? 'အရန်သိမ်းခြင်း၊ ပြန်လည်ယူခြင်း၊ စနစ်ပြန်စခြင်းနှင့် ပိုမိုကောင်းမွန်အောင်ပြုလုပ်ခြင်းများ' : 'Manage backups, restore system, optimizations and maintenance'}</p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {(state.success || state.error) && (
        <div className={`notification ${state.success ? 'success' : 'error'}`}>
          <i className={`fas ${state.success ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{state.success || state.error}</span>
          <button onClick={() => localDispatch({ type: 'CLEAR_MESSAGES' })}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* System Metrics Cards */}
      <div className="metrics-cards">
        <div className="metric-card">
          <div className="metric-icon total"><i className="fas fa-hdd"></i></div>
          <div className="metric-content">
            <h3>{language === 'mm' ? 'စုစုပေါင်း အရန်သိမ်းအရွယ်အစား' : 'Total Backup Size'}</h3>
            <h2>{state.summary.totalSize}</h2>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon last"><i className="fas fa-calendar-alt"></i></div>
          <div className="metric-content">
            <h3>{language === 'mm' ? 'စုစုပေါင်း အရန်သိမ်းမှုများ' : 'Total Backups'}</h3>
            <h2>{state.summary.totalBackups}</h2>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon health"><i className="fas fa-heartbeat"></i></div>
          <div className="metric-content">
            <h3>{language === 'mm' ? 'စနစ် ကျန်းမာရေး' : 'System Health'}</h3>
            <h2>{state.summary.healthStatus}</h2>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons-grid">
        <button className="action-btn backup" onClick={() => localDispatch({ type: 'SHOW_BACKUP_DIALOG' })} disabled={isProcessing}>
          <i className="fas fa-cloud-upload-alt"></i>
          <span>{language === 'mm' ? 'စနစ် အရန်သိမ်းရန်' : 'Backup System'}</span>
        </button>
        <button className="action-btn restore" onClick={() => localDispatch({ type: 'SHOW_RESTORE_DIALOG' })} disabled={isProcessing}>
          <i className="fas fa-cloud-download-alt"></i>
          <span>{language === 'mm' ? 'စနစ် ပြန်လည်ယူရန်' : 'Restore System'}</span>
        </button>
        <button className="action-btn optimize" onClick={() => localDispatch({ type: 'SHOW_OPTIMIZATION_DIALOG' })} disabled={isProcessing}>
          <i className="fas fa-magic"></i>
          <span>{language === 'mm' ? 'ပိုမိုကောင်းမွန်အောင်ပြုလုပ်ခြင်း' : 'Optimization'}</span>
        </button>
      </div>

      {/* Backup History Section */}
      <div className="backup-history-section">
        <div className="section-header">
          <h2><i className="fas fa-history"></i> {language === 'mm' ? 'အရန်သိမ်းမှတ်တမ်း' : 'Backup History'}</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="date-filter-btn" onClick={() => localDispatch({ type: 'SET_DATE_PICKER_VISIBLE', payload: !state.showDatePicker })}>
              <i className="fas fa-calendar-alt"></i> {language === 'mm' ? 'ရက်စွဲအလိုက် စစ်ထုတ်ရန်' : 'Filter by Date'}
            </button>
            
            <select value={state.filters.backupType} onChange={(e) => handleFilterChange('backupType', e.target.value)}>
              <option value="all">{language === 'mm' ? 'အားလုံး' : 'All'}</option>
                            <option value="FULL">{language === 'mm' ? 'အပြည့်အစုံ' : 'Full'}</option>
              <option value="DIFFERENTIAL">{language === 'mm' ? 'ခြားနားချက်' : 'Differential'}</option>
              <option value="INCREMENTAL">{language === 'mm' ? 'အပိုင်းလိုက်' : 'Incremental'}</option>
            </select>
            
            {(state.filters.fromDate || state.filters.toDate || state.filters.backupType !== 'all') && (
              <button onClick={clearAllFilters} className="clear-filters-btn">
                <i className="fas fa-times"></i> {language === 'mm' ? 'အားလုံးရှင်းရန်' : 'Clear All'}
              </button>
            )}
          </div>
        </div>
        
        {/* Date Picker Panel */}
        {state.showDatePicker && (
          <div className="date-picker-panel">
            <div className="date-picker-row">
              <div className="date-input-group">
                <label>{language === 'mm' ? 'မှ (From)' : 'From'}</label>
                <input type="date" value={state.filters.fromDate} onChange={(e) => handleFilterChange('fromDate', e.target.value)} />
              </div>
              <div className="date-input-group">
                <label>{language === 'mm' ? 'ထိ (To)' : 'To'}</label>
                <input type="date" value={state.filters.toDate} onChange={(e) => handleFilterChange('toDate', e.target.value)} />
              </div>
              <button onClick={() => localDispatch({ type: 'SET_DATE_PICKER_VISIBLE', payload: false })}>
                {language === 'mm' ? 'ပိတ်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        )}
        
        {/* Pagination Header */}
        <div className="pagination-header">
          <div className="showing-info">
            {language === 'mm' 
              ? `စုစုပေါင်း ${totalItems.toLocaleString()} ခုအနက် ${startItem} - ${endItem} ပြသထားသည်` 
              : `Showing ${startItem} - ${endItem} of ${totalItems.toLocaleString()} items`}
          </div>
          <div className="pagination-controls">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || state.isLoading}>
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <div className="page-input-group">
              <input type="number" value={state.pageInputValue} onChange={(e) => handlePageInputChange(e.target.value)} onBlur={handlePageInputBlur} onKeyPress={(e) => e.key === 'Enter' && handlePageInputBlur()} />
              <span>/ {totalPages.toLocaleString()}</span>
            </div>
            
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0 || state.isLoading}>
              <i className="fas fa-chevron-right"></i>
            </button>
            
            <select value={pageSize} onChange={(e) => handlePageSizeChange(e.target.value)}>
              <option value={10}>10 / {language === 'mm' ? 'မျက်နှာ' : 'page'}</option>
              <option value={20}>20 / {language === 'mm' ? 'မျက်နှာ' : 'page'}</option>
              <option value={50}>50 / {language === 'mm' ? 'မျက်နှာ' : 'page'}</option>
              <option value={100}>100 / {language === 'mm' ? 'မျက်နှာ' : 'page'}</option>
            </select>
          </div>
        </div>
        
        {/* Backup Table */}
        <div className="backup-table-container">
          <table className="backup-table">
            <thead>
              <tr>
                <th>{language === 'mm' ? 'အရန်သိမ်းအမည်' : 'Backup Name'}</th>
                <th>{language === 'mm' ? 'ရက်စွဲနှင့်အချိန်' : 'Date & Time'}</th>
                <th>{language === 'mm' ? 'အမျိုးအစား' : 'Type'}</th>
                <th>{language === 'mm' ? 'အရွယ်အစား' : 'Size'}</th>
                <th>{language === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                <th>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
               </tr>
            </thead>
            <tbody>
              {state.isLoading ? (
                <tr>
                  <td colSpan="6" className="loading-cell">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>{language === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading...'}</p>
                  </td>
                </tr>
              ) : state.backups.length > 0 ? (
                state.backups.map((backup) => (
                  <tr key={backup.id}>
                    <td>
                      <div className="backup-info">
                        <i className={`fas ${backup.backupType === 'FULL' ? 'fa-database' : backup.backupType === 'DIFFERENTIAL' ? 'fa-chart-line' : 'fa-chart-simple'}`}></i>
                        <span>{backup.backupName}</span>
                      </div>
                    </td>
                    <td>{new Date(backup.createdAt).toLocaleString()}</td>
                    <td>
                      <span className={`backup-type ${backup.backupType?.toLowerCase()}`}>
                        {language === 'mm' 
                          ? (backup.backupType === 'FULL' ? 'အပြည့်အစုံ' : backup.backupType === 'DIFFERENTIAL' ? 'ခြားနားချက်' : 'အပိုင်းလိုက်')
                          : backup.backupType}
                      </span>
                    </td>
                    <td>{backup.fileSize}</td>
                    <td>
                      <span className={`status ${backup.status?.toLowerCase()}`}>
                        <i className={`fas ${backup.status === 'SUCCESS' || backup.status === 'VERIFIED' ? 'fa-check-circle' : 'fa-spinner fa-spin'}`}></i>
                        {backup.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-restore" onClick={() => localDispatch({ type: 'SHOW_RESTORE_DIALOG', payload: backup })}>
                        <i className="fas fa-undo-alt"></i> {language === 'mm' ? 'ပြန်ယူရန်' : 'Restore'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    <i className="fas fa-folder-open"></i>
                    <p>{language === 'mm' ? 'အရန်သိမ်းမှတ်တမ်းများ မတွေ့ပါ' : 'No backup records found'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Overlay */}
      {isProcessing && currentProgress && (
        <div className="progress-overlay">
          <div className="progress-container">
            <div className="progress-header">
              <i className="fas fa-spinner fa-spin"></i>
              <h3>{state.isBackupProcessing ? (language === 'mm' ? 'အရန်သိမ်းနေသည်...' : 'Backing up...') : (language === 'mm' ? 'ပြန်လည်ယူနေသည်...' : 'Restoring...')}</h3>
            </div>
            <div className="progress-bar-wrapper">
              <div className="progress-bar-fill" style={{ width: `${currentProgress.percentage}%` }}>
                <span>{currentProgress.percentage}%</span>
              </div>
            </div>
            <p className="progress-message">{currentProgress.message}</p>
          </div>
        </div>
      )}

      {/* Backup Dialog */}
      {state.showBackupDialog && (
        <div className="modal-overlay">
          <div className="modal-dialog backup-dialog">
            <div className="modal-header">
              <h2><i className="fas fa-cloud-upload-alt"></i> {language === 'mm' ? 'အရန်သိမ်းခြင်း' : 'Backup'}</h2>
              <button className="close-btn" onClick={() => localDispatch({ type: 'HIDE_BACKUP_DIALOG' })}>×</button>
            </div>
            <div className="modal-body">
              <div className="backup-options">
                <div className={`option ${state.backupType === 'full' ? 'selected' : ''}`} onClick={() => localDispatch({ type: 'SET_BACKUP_TYPE', payload: 'full' })}>
                  <i className="fas fa-database"></i>
                  <h3>{language === 'mm' ? 'အပြည့်အစုံ' : 'Full Backup'}</h3>
                  <p>{language === 'mm' ? 'စနစ်တစ်ခုလုံး အရန်သိမ်းခြင်း' : 'Complete system backup'}</p>
                </div>
                <div className={`option ${state.backupType === 'differential' ? 'selected' : ''}`} onClick={() => localDispatch({ type: 'SET_BACKUP_TYPE', payload: 'differential' })}>
                  <i className="fas fa-chart-line"></i>
                  <h3>{language === 'mm' ? 'ခြားနားချက်' : 'Differential'}</h3>
                  <p>{language === 'mm' ? 'နောက်ဆုံး Full backup ပြီးနောက် အပြောင်းအလဲများ' : 'Changes since last full backup'}</p>
                </div>
                <div className={`option ${state.backupType === 'incremental' ? 'selected' : ''}`} onClick={() => localDispatch({ type: 'SET_BACKUP_TYPE', payload: 'incremental' })}>
                  <i className="fas fa-chart-simple"></i>
                  <h3>{language === 'mm' ? 'အပိုင်းလိုက်' : 'Incremental'}</h3>
                  <p>{language === 'mm' ? 'နောက်ဆုံး backup ပြီးနောက် အပြောင်းအလဲများ' : 'Changes since last backup'}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => localDispatch({ type: 'HIDE_BACKUP_DIALOG' })}>
                {language === 'mm' ? 'မလုပ်တော့ပါ' : 'Cancel'}
              </button>
              {state.backupType === 'full' && (
                <button className="btn-confirm" onClick={handleFullBackup} disabled={isProcessing}>
                  <i className="fas fa-play"></i> {language === 'mm' ? 'စတင်ရန်' : 'Start'}
                </button>
              )}
              {state.backupType === 'differential' && (
                <button className="btn-confirm" onClick={handleDifferentialBackup} disabled={isProcessing}>
                  <i className="fas fa-play"></i> {language === 'mm' ? 'စတင်ရန်' : 'Start'}
                </button>
              )}
              {state.backupType === 'incremental' && (
                <button className="btn-confirm" onClick={handleIncrementalBackup} disabled={isProcessing}>
                  <i className="fas fa-play"></i> {language === 'mm' ? 'စတင်ရန်' : 'Start'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Restore Dialog */}
      {state.showRestoreDialog && (
        <div className="modal-overlay">
          <div className="modal-dialog restore-dialog">
            <div className="modal-header">
              <h2><i className="fas fa-cloud-download-alt"></i> {language === 'mm' ? 'စနစ် ပြန်လည်ယူခြင်း' : 'Restore System'}</h2>
              <button className="close-btn" onClick={() => localDispatch({ type: 'HIDE_RESTORE_DIALOG' })}>×</button>
            </div>
            <div className="modal-body">
              <div className="restore-form">
                <div className="form-group">
                  <label><i className="fas fa-file-upload"></i> {language === 'mm' ? 'အရန်သိမ်းဖိုင်ရွေးရန်' : 'Select Backup File'}</label>
                  <input type="file" accept=".backup,.enc" onChange={(e) => localDispatch({ type: 'SET_RESTORE_FILE', payload: e.target.files[0] })} />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-lock"></i> {language === 'mm' ? 'စကားဝှက် (ရှိလျှင်)' : 'Password (if encrypted)'}</label>
                  <input type="password" placeholder="Enter decryption password" value={state.restorePassword} onChange={(e) => localDispatch({ type: 'SET_RESTORE_PASSWORD', payload: e.target.value })} />
                </div>
                {state.selectedBackup && (
                  <div className="backup-details">
                    <h4>{language === 'mm' ? 'အရန်သိမ်းအသေးစိတ်' : 'Backup Details'}</h4>
                    <p><strong>{language === 'mm' ? 'အမည်' : 'Name'}:</strong> {state.selectedBackup.backupName}</p>
                    <p><strong>{language === 'mm' ? 'ရက်စွဲ' : 'Date'}:</strong> {new Date(state.selectedBackup.createdAt).toLocaleString()}</p>
                    <p><strong>{language === 'mm' ? 'အရွယ်အစား' : 'Size'}:</strong> {state.selectedBackup.fileSize}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => localDispatch({ type: 'HIDE_RESTORE_DIALOG' })}>
                {language === 'mm' ? 'မလုပ်တော့ပါ' : 'Cancel'}
              </button>
              <button className="btn-confirm restore" onClick={handleRestore} disabled={isProcessing}>
                <i className="fas fa-undo-alt"></i> {language === 'mm' ? 'ပြန်လည်ယူရန်' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Dialog */}
      {state.showOptimizationDialog && (
        <div className="modal-overlay">
          <div className="modal-dialog optimization-dialog">
            <div className="modal-header">
              <h2><i className="fas fa-magic"></i> {language === 'mm' ? 'စနစ် Optimization' : 'System Optimization'}</h2>
              <button className="close-btn" onClick={() => localDispatch({ type: 'HIDE_OPTIMIZATION_DIALOG' })}>×</button>
            </div>
            <div className="modal-body">
              <p>{language === 'mm' ? 'Optimization လုပ်ခြင်းဖြင့် စနစ်စွမ်းဆောင်ရည် ပိုမိုကောင်းမွန်လာမည်ဖြစ်သည်။ ဆက်လုပ်မည်လား။' : 'Optimization will improve system performance. Continue?'}</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => localDispatch({ type: 'HIDE_OPTIMIZATION_DIALOG' })}>
                {language === 'mm' ? 'မလုပ်တော့ပါ' : 'Cancel'}
              </button>
              <button className="btn-confirm optimize" onClick={async () => {
                localDispatch({ type: 'HIDE_OPTIMIZATION_DIALOG' });
                localDispatch({ type: 'SET_SUCCESS', payload: language === 'mm' ? 'Optimization အောင်မြင်ပါသည်' : 'Optimization completed successfully' });
              }}>
                <i className="fas fa-check"></i> {language === 'mm' ? 'အတည်ပြုရန်' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemBackupRestorePage;