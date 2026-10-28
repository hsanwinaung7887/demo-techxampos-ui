// src/components/user/UserExpenseModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../../light-style/user-css/userExpenseModal.css';
import { branchUserAccountApi } from '../apis/branchUserAccountApi';

const UserExpenseModal = ({ onSave, onClose, initialData, language, branchId, onEmployeesLoaded }) => {
  const isEdit = !!initialData;
  const t = (en, mm) => language === 'mm' ? mm : en;

  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subCategory: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    status: 'Pending',
    vendor: '',
    description: '',
    depreciationType: 'none',
    depreciationRate: '',
    depreciationValue: '',
    capitalType: 'investment',
    employeeId: '',
    employeeName: ''
  });

  const [errors, setErrors] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});
  const [showDepreciation, setShowDepreciation] = useState(false);
  const [showCapital, setShowCapital] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState(null);

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const selectRefs = useRef({});

  // ============================================================
  // ✅ SAFE CLOSE — Force close, isSaving ဖြစ်လည်း ပိတ်
  // ============================================================
  const handleClose = () => {
    try {
      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (err) {
      console.error('❌ onClose error:', err);
    }
  };

  // ===== Fetch Employees =====
  useEffect(() => {
    if (branchId) {
      fetchEmployees();
    } else {
      setEmployeeError('Branch ID not provided');
    }
  }, [branchId]);

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      setEmployeeError(null);

      const response = await branchUserAccountApi.getAccounts({
        branchId: branchId,
        size: 100,
        statusTab: 'all-accounts'
      });

      if (response && response.success) {
        const employeeList = response.data?.data || [];
        const filteredList = employeeList.filter(
          acc => acc.status === 'Active' && acc.role !== 'VIEWER'
        );

        setEmployees(filteredList);

        if (onEmployeesLoaded && typeof onEmployeesLoaded === 'function') {
          onEmployeesLoaded(filteredList);
        }
      } else {
        setEmployeeError(response?.message || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('❌ Failed to fetch employees:', error);
      setEmployeeError(error.message || 'Network error');
    } finally {
      setEmployeeLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      let employeeName = initialData.employeeName || '';
      let employeeId = initialData.employeeId || '';

      if (employeeId && employees.length > 0) {
        const foundEmployee = employees.find(emp => emp.id === employeeId);
        if (foundEmployee) {
          employeeName = foundEmployee.fullName || foundEmployee.username;
        }
      }

      setFormData({
        title: initialData.title || '',
        category: initialData.category || '',
        subCategory: initialData.subCategory || '',
        amount: initialData.amount || '',
        date: initialData.expenseDate || initialData.date || new Date().toISOString().split('T')[0],
        paymentMethod: initialData.paymentMethod || 'Cash',
        status: initialData.status || 'Pending',
        vendor: initialData.vendor || '',
        description: initialData.description || '',
        depreciationType: initialData.depreciationType || 'none',
        depreciationRate: initialData.depreciationRate || '',
        depreciationValue: initialData.depreciationValue || '',
        capitalType: initialData.capitalType || 'investment',
        employeeId: employeeId,
        employeeName: employeeName
      });

      setShowDepreciation(initialData.category === 'Depreciation');
      setShowCapital(initialData.category === 'Capital');
    }
  }, [initialData, employees]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && dropdownRefs.current[openDropdown] &&
          !dropdownRefs.current[openDropdown].contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  useEffect(() => {
    if (openDropdown && selectRefs.current[openDropdown]) {
      const rect = selectRefs.current[openDropdown].getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
      setDropdownWidth(rect.width);
    }
  }, [openDropdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleEmployeeSelect = (employeeId, employeeName) => {
    setFormData(prev => ({ ...prev, employeeId, employeeName }));
    setOpenDropdown(null);
    if (errors.employeeId) setErrors(prev => ({ ...prev, employeeId: null }));
  };

  const handleDropdownSelect = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    setOpenDropdown(null);
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category: value, subCategory: '' }));
    if (errors.category) setErrors(prev => ({ ...prev, category: null }));
    setOpenDropdown(null);
    setShowDepreciation(value === 'Depreciation');
    setShowCapital(value === 'Capital');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = t('Title is required', 'ခေါင်းစဉ် လိုအပ်ပါသည်');
    if (!formData.category) newErrors.category = t('Category is required', 'အမျိုးအစား လိုအပ်ပါသည်');
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = t('Valid amount is required', 'မှန်ကန်သောပမာဏ လိုအပ်ပါသည်');
    if (!formData.date) newErrors.date = t('Date is required', 'ရက်စွဲ လိုအပ်ပါသည်');
    if (!formData.paymentMethod) newErrors.paymentMethod = t('Payment method is required', 'ငွေပေးချေမှုနည်းလမ်း လိုအပ်ပါသည်');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const data = {
        title: formData.title,
        category: formData.category,
        subCategory: formData.subCategory,
        amount: parseFloat(formData.amount) || 0,
        expenseDate: formData.date,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        vendor: formData.vendor,
        description: formData.description,
        depreciationType: formData.depreciationType,
        depreciationRate: formData.depreciationRate,
        depreciationValue: formData.depreciationValue,
        capitalType: formData.capitalType,
        branchId: branchId
      };

      if (formData.category === 'Salary') {
        data.employeeId = formData.employeeId || null;
        data.employeeName = formData.employeeName || null;
      }

      if (formData.category === 'Depreciation') {
        data.depreciationValue = parseFloat(formData.depreciationValue) || 0;
        data.depreciationRate = parseFloat(formData.depreciationRate) || 0;
      }

      await onSave(data);
    } catch (error) {
      console.error('❌ Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const categoryOptions = [
    { value: 'Salary', label_en: 'Salary', label_mm: 'ဝန်ထမ်းခ' },
    { value: 'Rent', label_en: 'Rent', label_mm: 'ဆိုင်ငှားခ' },
    { value: 'Utilities', label_en: 'Utilities', label_mm: 'ရေဖိုးမီးဘာညာ' },
    { value: 'Software', label_en: 'Software', label_mm: 'ဆော့ဝဲလ်' },
    { value: 'Equipment', label_en: 'Equipment', label_mm: 'ပစ္စည်းကိရိယာ' },
    { value: 'Supplies', label_en: 'Supplies', label_mm: 'သုံးစွဲပစ္စည်း' },
    { value: 'Marketing', label_en: 'Marketing', label_mm: 'စျေးကွက်ရှာဖွေရေး' },
    { value: 'Transport', label_en: 'Transport', label_mm: 'သယ်ယူပို့ဆောင်ရေး' },
    { value: 'Food', label_en: 'Food', label_mm: 'စားသောက်ကုန်' },
    { value: 'Insurance', label_en: 'Insurance', label_mm: 'အာမခံ' },
    { value: 'Tax', label_en: 'Tax', label_mm: 'အခွန်' },
    { value: 'Maintenance', label_en: 'Maintenance', label_mm: 'ပြုပြင်ထိန်းသိမ်းခြင်း' },
    { value: 'Depreciation', label_en: 'Depreciation', label_mm: 'တန်ဖိုးလျော့ချခြင်း' },
    { value: 'Other', label_en: 'Other', label_mm: 'အခြား' }
  ];

  const subCategoryOptions = {
    'Salary': [
      { value: 'Staff', label_en: 'Staff', label_mm: 'ဝန်ထမ်း' },
      { value: 'Manager', label_en: 'Manager', label_mm: 'မန်နေဂျာ' },
      { value: 'Part-time', label_en: 'Part-time', label_mm: 'အချိန်ပိုင်း' }
    ],
    'Utilities': [
      { value: 'Electricity', label_en: 'Electricity', label_mm: 'လျှပ်စစ်' },
      { value: 'Water', label_en: 'Water', label_mm: 'ရေ' },
      { value: 'Internet', label_en: 'Internet', label_mm: 'အင်တာနက်' },
      { value: 'Phone', label_en: 'Phone', label_mm: 'ဖုန်း' }
    ],
    'Depreciation': [
      { value: 'Equipment', label_en: 'Equipment', label_mm: 'ကိရိယာ' },
      { value: 'Furniture', label_en: 'Furniture', label_mm: 'ပရိဘောဂ' },
      { value: 'Vehicle', label_en: 'Vehicle', label_mm: 'ယာဉ်' },
      { value: 'Building', label_en: 'Building', label_mm: 'အဆောက်အဦ' }
    ]
  };

  const paymentMethodOptions = [
    { value: 'Cash', label_en: 'Cash', label_mm: 'ငွေသား' },
    { value: 'Bank Transfer', label_en: 'Bank Transfer', label_mm: 'ဘဏ်လွှဲ' },
    { value: 'Credit Card', label_en: 'Credit Card', label_mm: 'ခရက်ဒစ်ကဒ်' },
    { value: 'Mobile Payment', label_en: 'Mobile Payment', label_mm: 'မိုဘိုင်းငွေပေးချေ' }
  ];

  const statusOptions = [
    { value: 'Paid', label_en: 'Paid', label_mm: 'ပေးချေပြီး' },
    { value: 'Pending', label_en: 'Pending', label_mm: 'ဆိုင်ငံ့' },
    { value: 'Cancelled', label_en: 'Cancelled', label_mm: 'ပယ်ဖျက်ထား' }
  ];

  const depreciationTypeOptions = [
    { value: 'straight_line', label_en: 'Straight Line', label_mm: 'တန်းတူ' },
    { value: 'declining_balance', label_en: 'Declining Balance', label_mm: 'ကျဆင်းနေသော' },
    { value: 'unit_of_production', label_en: 'Unit of Production', label_mm: 'ထုတ်လုပ်မှုအလိုက်' }
  ];

  const getDisplayValue = (options, value) => {
    if (!value) return t('Select...', 'ရွေးချယ်ပါ...');
    const found = options.find(opt => opt.value === value);
    return found ? (language === 'mm' ? found.label_mm : found.label_en) : value;
  };

  const CustomDropdown = ({ name, options, value, label, required, error, disabled, onChange }) => {
    const isOpen = openDropdown === name;
    const displayValue = options ? getDisplayValue(options, value) : value || (language === 'mm' ? 'ရွေးချယ်ပါ...' : 'Select...');

    return (
      <div className="expense-form-group" ref={el => dropdownRefs.current[name] = el}>
        <label className={required ? 'expense-required' : ''}>{label}</label>
        <div
          ref={el => selectRefs.current[name] = el}
          className={`expense-custom-select ${isOpen ? 'open' : ''} ${error ? 'input-error' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled && !isSaving) toggleDropdown(name);
          }}
        >
          <span className="expense-custom-select-value">{displayValue}</span>
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
        </div>

        {isOpen && !disabled && !isSaving && (
          <div
            className="expense-custom-select-dropdown"
            style={{
              position: 'fixed',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              minWidth: dropdownWidth || '200px',
              maxWidth: '400px',
              zIndex: 99999999
            }}
          >
            <div className="expense-custom-select-options">
              {options && options.length > 0 ? (
                options.map((opt) => (
                  <div
                    key={opt.value}
                    className={`expense-custom-option ${opt.value === value ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onChange) onChange(opt.value);
                      else handleDropdownSelect(name, opt.value);
                    }}
                  >
                    {language === 'mm' ? opt.label_mm : opt.label_en}
                    {opt.value === value && <i className="fas fa-check"></i>}
                  </div>
                ))
              ) : (
                <div className="expense-custom-option disabled">{t('No options', 'ရွေးစရာမရှိပါ')}</div>
              )}
            </div>
          </div>
        )}
        {error && <span className="expense-field-error">{error}</span>}
      </div>
    );
  };

  const EmployeeSelect = () => {
    const isOpen = openDropdown === 'employeeSelect';

    const getEmployeeDisplay = () => {
      if (employeeLoading) return <><i className="fas fa-spinner fa-spin"></i> {t('Loading...', 'ဖွင့်နေသည်...')}</>;
      if (employeeError) return <span style={{ color: '#ef4444' }}>{t('Error loading employees', 'ဝန်ထမ်းများရယူရာတွင် အမှားရှိပါသည်')}</span>;
      if (formData.employeeName) return formData.employeeName;
      if (employees.length === 0) return t('No employees found', 'ဝန်ထမ်းမရှိပါ');
      return language === 'mm' ? 'ဝန်ထမ်းရွေးပါ...' : 'Select employee...';
    };

    return (
      <div className="expense-form-group" ref={el => dropdownRefs.current['employeeSelect'] = el} style={{ position: 'relative', zIndex: 999999 }}>
        <label className="expense-required">{t('Employee', 'ဝန်ထမ်း')}</label>
        <div
          ref={el => selectRefs.current['employeeSelect'] = el}
          className={`expense-custom-select ${isOpen ? 'open' : ''} ${errors.employeeId ? 'input-error' : ''}`}
          onClick={() => {
            if (!employeeLoading && !employeeError && employees.length > 0 && !isSaving) toggleDropdown('employeeSelect');
          }}
          style={{ cursor: employeeLoading || employeeError || employees.length === 0 || isSaving ? 'not-allowed' : 'pointer' }}
        >
          <span className="expense-custom-select-value">{getEmployeeDisplay()}</span>
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
        </div>

        {isOpen && !employeeLoading && !employeeError && employees.length > 0 && !isSaving && (
          <div
            className="expense-custom-select-dropdown"
            style={{
              position: 'fixed',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              minWidth: dropdownWidth || '100%',
              maxWidth: '400px',
              zIndex: 99999999,
              maxHeight: '250px',
              overflowY: 'auto'
            }}
          >
            <div className="expense-custom-select-options">
              <div
                className="expense-custom-option"
                onClick={() => { handleEmployeeSelect('', ''); setOpenDropdown(null); }}
                style={{ borderBottom: '1px solid #e2e8f0', color: '#94a3b8' }}
              >
                {t('None', 'မရှိ')}
              </div>
              {employees.map(emp => (
                <div
                  key={emp.id}
                  className={`expense-custom-option ${emp.id === formData.employeeId ? 'selected' : ''}`}
                  onClick={() => { handleEmployeeSelect(emp.id, emp.fullName || emp.username); setOpenDropdown(null); }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{emp.fullName || emp.username}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      @{emp.username} • {emp.role}
                    </span>
                  </div>
                  {emp.id === formData.employeeId && <i className="fas fa-check"></i>}
                </div>
              ))}
            </div>
          </div>
        )}
        {employeeError && (
          <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#ef4444' }}>
            <i className="fas fa-exclamation-circle"></i> {employeeError}
            <button type="button" onClick={fetchEmployees} style={{ marginLeft: '8px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer' }} disabled={isSaving}>
              <i className="fas fa-sync-alt"></i> {t('Retry', 'ပြန်ကြိုးစားရန်')}
            </button>
          </div>
        )}
        {errors.employeeId && <span className="expense-field-error">{errors.employeeId}</span>}
        {formData.employeeId && formData.employeeName && !employeeError && (
          <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#10b981' }}>
            <i className="fas fa-user-check"></i> {t('Selected', 'ရွေးထားသည်')}: {formData.employeeName}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="expense-modal-overlay" onClick={handleClose}>
      <div className="expense-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="expense-modal-header">
          <h2>
            <i className="fas fa-money-bill-wave"></i>
            {isEdit ? t('Edit Expense', 'ကုန်ကျစရိတ်ပြင်ဆင်ရန်') : t('New Expense', 'ကုန်ကျစရိတ်အသစ်')}
          </h2>
          {/* ✅ type="button" + disabled ဖျက် */}
          <button
            type="button"
            onClick={handleClose}
            className="expense-modal-close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="expense-modal-body">
          {/* Title */}
          <div className="expense-form-row">
            <div className="expense-form-group" style={{ flex: '2' }}>
              <label className="expense-required">{t('Title', 'ခေါင်းစဉ်')}</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder={t('Enter expense title', 'ကုန်ကျစရိတ်ခေါင်းစဉ်ရေးပါ')}
                className={errors.title ? 'input-error' : ''} disabled={isSaving} />
              {errors.title && <span className="expense-field-error">{errors.title}</span>}
            </div>
          </div>

          {/* Category + Sub Category */}
          <div className="expense-form-row">
            <CustomDropdown name="category" options={categoryOptions} value={formData.category}
              label={t('Category', 'အမျိုးအစား')} required={true} error={errors.category}
              onChange={handleCategoryChange} />
            <CustomDropdown name="subCategory"
              options={formData.category ? subCategoryOptions[formData.category] || [] : []}
              value={formData.subCategory} label={t('Sub Category', 'အမျိုးအစားခွဲ')}
              disabled={!formData.category || isSaving} />
          </div>

          {/* Salary Section */}
          {formData.category === 'Salary' && (
            <div className="expense-form-row">
              <EmployeeSelect />
            </div>
          )}

          {/* Amount + Date */}
          <div className="expense-form-row">
            <div className="expense-form-group">
              <label className="expense-required">{t('Amount (MMK)', 'ပမာဏ (MMK)')}</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange}
                placeholder={t('Enter amount', 'ပမာဏရေးပါ')} min="0" step="100"
                className={errors.amount ? 'input-error' : ''} disabled={isSaving} />
              {errors.amount && <span className="expense-field-error">{errors.amount}</span>}
            </div>
            <div className="expense-form-group">
              <label className="expense-required">{t('Date', 'ရက်စွဲ')}</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange}
                className={errors.date ? 'input-error' : ''} disabled={isSaving} />
              {errors.date && <span className="expense-field-error">{errors.date}</span>}
            </div>
          </div>

          {/* Depreciation Section */}
          {formData.category === 'Depreciation' && (
            <div className="expense-depreciation-section" style={{ position: 'relative', zIndex: 1 }}>
              <div className="expense-form-row">
                <CustomDropdown name="depreciationType" options={depreciationTypeOptions}
                  value={formData.depreciationType} label={t('Depreciation Type', 'တန်ဖိုးလျော့ချမှုအမျိုးအစား')} />
                <div className="expense-form-group">
                  <label>{t('Rate (%)', 'ရာခိုင်နှုန်း')}</label>
                  <input type="number" name="depreciationRate" value={formData.depreciationRate}
                    onChange={handleChange} placeholder="e.g., 10" min="0" max="100" step="0.5" disabled={isSaving} />
                </div>
                <div className="expense-form-group">
                  <label>{t('Depreciation Value', 'တန်ဖိုးလျော့ချမှု')}</label>
                  <input type="number" name="depreciationValue" value={formData.depreciationValue}
                    onChange={handleChange} placeholder={t('Auto-calculated', 'အလိုအလျောက်တွက်ချက်')}
                    min="0" step="100" disabled={isSaving} />
                </div>
              </div>
            </div>
          )}

          {/* Payment + Status */}
          <div className="expense-form-row">
            <CustomDropdown name="paymentMethod" options={paymentMethodOptions}
              value={formData.paymentMethod} label={t('Payment Method', 'ငွေပေးချေမှုနည်းလမ်း')}
              required={true} error={errors.paymentMethod} />
            <CustomDropdown name="status" options={statusOptions} value={formData.status}
              label={t('Status', 'အခြေအနေ')} />
          </div>

          {/* Vendor + Description */}
          <div className="expense-form-row">
            <div className="expense-form-group" style={{ flex: '1' }}>
              <label>{t('Vendor', 'ပေးသွင်းသူ')}</label>
              <input type="text" name="vendor" value={formData.vendor} onChange={handleChange}
                placeholder={t('Enter vendor name', 'ပေးသွင်းသူအမည်ရေးပါ')} disabled={isSaving} />
            </div>
            <div className="expense-form-group" style={{ flex: '2' }}>
              <label>{t('Description', 'အသေးစိတ်')}</label>
              <input type="text" name="description" value={formData.description} onChange={handleChange}
                placeholder={t('Enter description (optional)', 'အသေးစိတ်ရေးပါ (မလိုအပ်ပါ)')} disabled={isSaving} />
            </div>
          </div>
        </div>

        <div className="expense-modal-footer">
          {/* ✅ Cancel — disabled ဖျက် */}
          <button
            type="button"
            className="expense-btn-cancel"
            onClick={handleClose}
          >
            <i className="fas fa-times"></i> {t('Cancel', 'ပယ်ဖျက်မည်')}
          </button>
          <button
            type="button"
            className={`expense-btn-submit ${isSaving ? 'loading' : ''}`}
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <><i className="fas fa-spinner fa-spin"></i> {t('Saving...', 'သိမ်းနေသည်...')}</>
            ) : (
              <><i className="fas fa-save"></i> {isEdit ? t('Update Expense', 'ပြင်ဆင်မည်') : t('Add Expense', 'ထည့်မည်')}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserExpenseModal;