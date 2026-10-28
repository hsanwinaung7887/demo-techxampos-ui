import React, { useState, useRef, useEffect } from 'react';
import "../../light-style/user-css/VoucherModal.css";
import { generateInvoicePDF } from "./GenerateInvoicePDF";
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const VoucherModal = ({ 
  isOpen, 
  onClose, 
  saleData, 
  shopInfo,
  onCompleteSale,
  language = "mm",
  preGeneratedInvoiceNo = null
}) => {
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [selectedPayment, setSelectedPayment] = useState('Cash');
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentInvoiceNo, setCurrentInvoiceNo] = useState(
    preGeneratedInvoiceNo || saleData?.invoiceNo || 'Generating...'
  );
  const [editableTaxPercent, setEditableTaxPercent] = useState(saleData?.tax || 0);
  const [voucherSettings, setVoucherSettings] = useState(null);
  const [printError, setPrintError] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchVoucherSettings();
      setAdditionalDiscount(0);
      setDiscountType('percentage');
      setSelectedPayment('Cash');
      setIsPrinting(false);
      setPrintError(null);
      setCurrentInvoiceNo(saleData?.invoiceNo || 'Generating...');
      setEditableTaxPercent(saleData?.tax || 0);
    }
  }, [isOpen, saleData]);

  const fetchVoucherSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/setting/voucher`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setVoucherSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch voucher settings:', error);
    }
  };

  useEffect(() => {
    if (preGeneratedInvoiceNo) {
      setCurrentInvoiceNo(preGeneratedInvoiceNo);
    }
  }, [preGeneratedInvoiceNo]);

  useEffect(() => {
    if (saleData?.invoiceNo && saleData.invoiceNo !== currentInvoiceNo) {
      setCurrentInvoiceNo(saleData.invoiceNo);
    }
  }, [saleData?.invoiceNo]);

  if (!isOpen || !saleData) return null;

  const formatPrice = (amount) => {
    if (amount === null || amount === undefined) return '0 Ks';
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(num)) return '0 Ks';
    const rounded = num.toFixed(1);
    const formatted = rounded.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formatted + ' Ks';
  };

  const subtotal = saleData.totals?.subtotal || 0;
  const productDiscount = saleData.totals?.discountTotal || 0;

  let additionalDiscountAmount = 0;
  if (discountType === 'percentage') {
    additionalDiscountAmount = (subtotal * additionalDiscount) / 100;
  } else {
    additionalDiscountAmount = parseFloat(additionalDiscount) || 0;
  }
  additionalDiscountAmount = Math.min(additionalDiscountAmount, subtotal);
  additionalDiscountAmount = parseFloat(additionalDiscountAmount.toFixed(1));

  const taxable = subtotal - additionalDiscountAmount;
  const taxAmount = (taxable * editableTaxPercent) / 100;
  const finalTotal = taxable + taxAmount;

  const totalDiscount = productDiscount + additionalDiscountAmount;
  const totalItemsCount = saleData.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  const itemTypes = saleData.items.length;

  const getFreeQuantity = (item) => {
    const isBuyXGetY = item.isBuyXGetY || 
                      (item.discount?.type === 'BuyXGetY') || 
                      (item.discount?.type === 'Buy X Get Y');
    if (!isBuyXGetY) return 0;
    const buyQty = item.buyQty || item.discount?.buyQuantity || 3;
    const getQty = item.getQty || item.discount?.getQuantity || 1;
    return Math.floor(item.quantity / buyQty) * getQty;
  };

  const getDiscountLabel = (discount) => {
    if (!discount) return null;
    switch(discount.type) {
      case 'Percentage': return `${discount.discountValue}% OFF`;
      case 'Fixed': return `${discount.discountValue?.toLocaleString()} Ks OFF`;
      case 'BuyXGetY': case 'Buy X Get Y': return `Buy ${discount.buyQuantity} Get ${discount.getQuantity} Free`;
      default: return discount.label || 'Discount';
    }
  };

  // ============================================================
  // ✅ PRINT RECEIPT - Just prints, doesn't complete sale
  // ============================================================
  const handlePrintReceipt = async (autoPrint = false) => {
    setIsPrinting(true);
    setPrintError(null);
    
    try {
      const paperSize = voucherSettings?.paperSize || '80mm';
      
      const updatedShopInfo = {
        ...shopInfo,
        voucherSettings: voucherSettings
      };
      
      const invoiceData = {
        ...saleData,
        invoiceNo: currentInvoiceNo,
        additionalDiscount: additionalDiscountAmount,
        totalDiscount: totalDiscount,
        tax: editableTaxPercent,
        totals: {
          ...saleData.totals,
          subtotal: subtotal,
          discountTotal: productDiscount,
          taxAmount: taxAmount,
          finalTotal: finalTotal,
          additionalDiscount: additionalDiscountAmount,
          totalDiscount: totalDiscount
        },
        cashier: shopInfo.cashier,
        totalItemsCount: totalItemsCount,
        shopInfo: updatedShopInfo,
        language: language,
        voucherSettings: voucherSettings,
        paperSize: paperSize,
        paymentMethod: selectedPayment
      };
      
      await generateInvoicePDF(invoiceData, updatedShopInfo, autoPrint, language);
      
    } catch (error) {
      console.error('Print error:', error);
      setPrintError(error.message || 'Printer not found');
      alert(language === "mm" ? 
        `❌ ပရင့်ထုတ်ရာတွင် ပြဿနာရှိနေပါသည်။\n\n${error.message}` : 
        `❌ Print error.\n\n${error.message}`
      );
    } finally {
      setIsPrinting(false);
    }
  };

  // ============================================================
// ✅ SUPER FAST COMPLETE SALE - Modal closes IMMEDIATELY
// ============================================================
const handleCompleteSale = async () => {
  setIsPrinting(true);
  setPrintError(null);
  
  try {
    const paperSize = voucherSettings?.paperSize || '80mm';
    const updatedShopInfo = {
      ...shopInfo,
      voucherSettings: voucherSettings
    };
    
    const invoiceData = {
      ...saleData,
      invoiceNo: currentInvoiceNo,
      additionalDiscount: additionalDiscountAmount,
      paymentMethod: selectedPayment,
      tax: editableTaxPercent,
      totals: {
        ...saleData.totals,
        subtotal: subtotal,
        discountTotal: productDiscount,
        taxAmount: taxAmount,
        finalTotal: finalTotal,
        additionalDiscount: additionalDiscountAmount,
        totalDiscount: totalDiscount
      },
      cashier: shopInfo.cashier,
      totalItemsCount: totalItemsCount,
      voucherSettings: voucherSettings,
      paperSize: paperSize
    };
    
    // ✅ 1. CLOSE MODAL IMMEDIATELY
    onClose();
    
    // ✅ 2. AWAIT the sale completion (Progress bar will show in UserSalePage)
    await onCompleteSale(invoiceData);
    
    // ✅ 3. Print in background (don't wait)
    generateInvoicePDF(invoiceData, updatedShopInfo, true, language)
      .then(() => console.log('✅ Print done'))
      .catch(err => console.warn('⚠️ Print error:', err));
    
  } catch (error) {
    console.error('Complete sale error:', error);
    if (error.message && !error.message.includes('Printer')) {
      alert(language === "mm" ? 
        `❌ ငွေရှင်းခြင်း မအောင်မြင်ပါ\n\n${error.message}` : 
        `❌ Sale failed\n\n${error.message}`
      );
    }
  } finally {
    setIsPrinting(false);
  }
};

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handlePaymentChange = (methodId) => {
    if (!isPrinting) {
      setSelectedPayment(methodId);
    }
  };

  const paymentMethods = [
    { id: 'Cash', label: language === "mm" ? 'ငွေသား' : 'Cash', icon: 'fas fa-money-bill-wave' },
    { id: 'KPay', label: 'KPay', icon: 'fas fa-mobile-alt' },
    { id: 'Wave', label: 'Wave', icon: 'fas fa-mobile-alt' },
    { id: 'Credit', label: language === "mm" ? 'အကြွေး' : 'Credit', icon: 'fas fa-credit-card' }
  ];

  const displayShopName = voucherSettings?.shopName || shopInfo?.name || "My Shop";
  const displayAddress = voucherSettings?.address || shopInfo?.address || "";
  const displayPhone = voucherSettings?.phone || shopInfo?.phone || "";

  return (
    <div className="voucher-modal-overlay" onClick={handleOverlayClick}>
      <div ref={modalRef} className="voucher-modal-container">
        <div className="voucher-modal-header">
          <h3>{language === "mm" ? "ငွေရှင်းခြင်းအတည်ပြုခြင်း" : "Checkout Confirmation"}</h3>
          <button className="voucher-modal-close" onClick={onClose}>×</button>
        </div>

        {/* Show error if any */}
        {printError && (
          <div style={{
            background: '#fee',
            color: '#d63031',
            padding: '10px 16px',
            margin: '8px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            border: '1px solid #d63031',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>
              {language === "mm" ? 'ပရင်တာ ချိတ်ဆက်မှု မရှိပါ' : 'Printer not connected'}
              <br />
              <span style={{ fontSize: '11px', color: '#666' }}>
                {language === "mm" ? 'USB ချိတ်ဆက်မှုကို စစ်ဆေးပြီး ပြန်ကြိုးစားပါ။' : 'Check USB connection and try again.'}
              </span>
            </span>
          </div>
        )}

        <div className="voucher-modal-two-col">
          {/* Left Column: Receipt Preview */}
          <div className="voucher-left">
            <div className="receipt-preview">
              <div className="receipt-shop-info">
                <div className="receipt-shop-name">{displayShopName}</div>
                {displayAddress && <div className="receipt-shop-address">{displayAddress}</div>}
                {displayPhone && <div className="receipt-shop-phone">Tel: {displayPhone}</div>}
              </div>
              <div className="receipt-divider"></div>

              <div className="invoice-info-container">
                <div className="invoice-info-left">
                  <div className="invoice-no">
                    <span>{language === "mm" ? "ဘောင်ချာနံပါတ်" : "Invoice"}: </span>
                    <strong>{currentInvoiceNo}</strong>
                    {currentInvoiceNo === 'Generating...' && <span className="invoice-spinner"></span>}
                  </div>
                  <div>{language === "mm" ? "ရက်စွဲ" : "Date"}: {new Date().toLocaleDateString()}</div>
                </div>
                <div className="invoice-info-right">
                  <div>{language === "mm" ? "အချိန်" : "Time"}: {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                  <div>{language === "mm" ? "ငွေကိုင်" : "Cashier"}: {shopInfo.cashier}</div>
                </div>
              </div>

              {saleData.customer.name !== 'Guest' && saleData.customer.name !== 'ဧည့်သည်' && (
                <div className="customer-info">
                  <div>{language === "mm" ? "ဝယ်သူ" : "Customer"}: {saleData.customer.name}</div>
                  <div>{language === "mm" ? "ဖုန်း" : "Phone"}: {saleData.customer.phone}</div>
                </div>
              )}
              <div className="receipt-divider"></div>

              <div className="receipt-header">
                <div className="receipt-header-col" style={{ width: '40%' }}>{language === "mm" ? "ပစ္စည်း" : "Item"}</div>
                <div className="receipt-header-col" style={{ width: '15%', textAlign: 'center' }}>{language === "mm" ? "အရေတွက်" : "Qty"}</div>
                <div className="receipt-header-col" style={{ width: '25%', textAlign: 'right' }}>{language === "mm" ? "ဈေးနှုန်း" : "Price"}</div>
                <div className="receipt-header-col" style={{ width: '20%', textAlign: 'right' }}>{language === "mm" ? "စုစုပေါင်း" : "Total"}</div>
              </div>

              <div className="items-container">
                {saleData.items.map((item, index) => {
                  const isBuyXGetY = item.isBuyXGetY || 
                                    (item.discount?.type === 'BuyXGetY') || 
                                    (item.discount?.type === 'Buy X Get Y');
                  const freeQty = isBuyXGetY ? getFreeQuantity(item) : 0;
                  const paidQty = item.quantity;

                  const itemTotal = paidQty * item.price;
                  const originalTotal = (item.originalPrice || item.price) * paidQty;
                  const itemDiscount = originalTotal - itemTotal;
                  const hasDiscount = itemDiscount > 0 || (isBuyXGetY && freeQty > 0);
                  const discountLabel = getDiscountLabel(item.discount);

                  return (
                    <div key={index} className="receipt-item">
                      <div className="receipt-item-col-number">{index + 1}</div>
                      <div className="receipt-item-col-name">
                        <div>{item.name.length > 18 ? item.name.substring(0, 18) + '...' : item.name}</div>
                        {hasDiscount && discountLabel && (
                          <div className="receipt-item-discount-label">{discountLabel}</div>
                        )}
                      </div>
                      <div className="receipt-item-col-qty">
                        {paidQty}
                        {freeQty > 0 && <div className="receipt-item-free-badge">+{freeQty} free</div>}
                      </div>
                      <div className="receipt-item-col-price">
                        <div>{formatPrice(item.price)}</div>
                        {hasDiscount && (
                          <div className="receipt-item-original-price">{formatPrice(item.originalPrice)}</div>
                        )}
                      </div>
                      <div className="receipt-item-col-total">
                        <div>{formatPrice(itemTotal)}</div>
                        {hasDiscount && (
                          <div className="receipt-item-discount-amount">-{formatPrice(itemDiscount)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="receipt-divider"></div>

              <div className="totals-container">
                <div className="receipt-line">
                  <span>{language === "mm" ? "စုစုပေါင်း (အခွန်မပါ)" : "Subtotal"}:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {productDiscount > 0 && (
                  <div className="receipt-line discount-line">
                    <span>{language === "mm" ? "ပစ္စည်းလျှော့စျေး" : "Product Discount"}:</span>
                    <span>-{formatPrice(productDiscount)}</span>
                  </div>
                )}
                {additionalDiscountAmount > 0 && (
                  <div className="receipt-line discount-line">
                    <span>{language === "mm" ? "ထပ်ဆောင်းလျှော့စျေး" : "Additional Discount"}:</span>
                    <span>-{formatPrice(additionalDiscountAmount)}</span>
                  </div>
                )}
                <div className="receipt-line">
                  <span>{language === "mm" ? "အခွန်" : "Tax"} ({editableTaxPercent}%):</span>
                  <span>+{formatPrice(taxAmount)}</span>
                </div>
                <div className="receipt-line grand-total">
                  <span>{language === "mm" ? "နောက်ဆုံးစုစုပေါင်း" : "Grand Total"}:</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
                <div className="receipt-summary">
                  <span>{language === "mm" ? `ပစ္စည်းအမျိုးအစား: ${itemTypes} မျိုး` : `Item types: ${itemTypes}`}</span>
                  <span>{language === "mm" ? `စုစုပေါင်းအရေအတွက်: ${totalItemsCount} ခု` : `Total quantity: ${totalItemsCount} pcs`}</span>
                </div>
              </div>

              <div className="receipt-payment-method" style={{ marginTop: '8px', textAlign: 'center', fontSize: '10px' }}>
                <span style={{ background: '#f0f0f0', padding: '3px 10px', borderRadius: '15px', display: 'inline-block' }}>
                  {language === "mm" ? "ငွေပေးချေမှု" : "Payment"}: {
                    selectedPayment === 'Cash' ? (language === "mm" ? 'ငွေသား' : 'Cash') :
                    selectedPayment === 'KPay' ? 'KPay' :
                    selectedPayment === 'Wave' ? 'Wave' :
                    selectedPayment === 'Credit' ? (language === "mm" ? 'အကြွေး' : 'Credit') : selectedPayment
                  }
                </span>
              </div>

              <div className="receipt-divider"></div>
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="voucher-right">
            <div className="control-group">
              <label>{language === "mm" ? "ထပ်ဆောင်းလျှော့စျေး" : "Additional Discount"}</label>
              <div className="discount-input-group">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  disabled={isPrinting}
                  className="discount-type-select"
                >
                  <option value="percentage">{language === "mm" ? "ရာခိုင်နှုန်း (%)" : "Percentage"}</option>
                  <option value="fixed">{language === "mm" ? "ပမာဏ (ကျပ်)" : "Amount (Ks)"}</option>
                </select>
                <input
                  type="number"
                  value={additionalDiscount}
                  onChange={(e) => setAdditionalDiscount(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.25"
                  disabled={isPrinting}
                  className="discount-amount-input"
                />
                <span className="discount-symbol">{discountType === 'percentage' ? '%' : 'Ks'}</span>
              </div>
            </div>

            <div className="control-group">
              <label>{language === "mm" ? "အခွန်နှုန်း" : "Tax Rate"}</label>
              <div className="tax-input-group">
                <input
                  type="number"
                  value={editableTaxPercent}
                  onChange={(e) => setEditableTaxPercent(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={isPrinting}
                  className="tax-percent-input"
                />
                <span>%</span>
                <span className="tax-amount">{formatPrice(taxAmount)}</span>
              </div>
            </div>

            <div className="control-group">
              <label>{language === "mm" ? "ငွေပေးချေမှုနည်းလမ်း" : "Payment Method"}</label>
              <div className="payment-icons">
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    className={`payment-icon ${selectedPayment === method.id ? 'selected' : ''}`}
                    onClick={() => handlePaymentChange(method.id)}
                    style={{ cursor: isPrinting ? 'not-allowed' : 'pointer', opacity: isPrinting ? 0.6 : 1 }}
                  >
                    <i className={method.icon}></i>
                    <span>{method.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="btn-group-vertical">
              <button 
                className="btn-action btn-pdf" 
                onClick={() => handlePrintReceipt(false)} 
                disabled={isPrinting}
              >
                {language === "mm" ? "PDF အဖြစ်သိမ်းမည်" : "Save as PDF"}
              </button>
              
              <button 
                className="btn-action btn-print" 
                onClick={() => handlePrintReceipt(true)} 
                disabled={isPrinting}
                style={{
                  background: isPrinting ? '#95a5a6' : '#2ecc71',
                  color: 'white',
                  padding: '14px',
                  fontSize: '12px'
                }}
              >
                {isPrinting ? (
                  <span>{language === "mm" ? "ပရင့်ထုတ်နေသည်..." : "Printing..."}</span>
                ) : (
                  <span>{language === "mm" ? "ဘောင်ချာထုတ်မည်" : "Print Receipt"}</span>
                )}
              </button>
              
              {/* ✅ THIS BUTTON CLOSES MODAL FIRST THEN COMPLETES SALE */}
              <button 
                className="btn-action btn-complete" 
                onClick={handleCompleteSale} 
                disabled={isPrinting}
              >
                {language === "mm" ? "ငွေရှင်းပြီး ပရင့်ထုတ်မည်" : "Complete Sale & Print"}
              </button>
              
              <button 
                className="btn-action btn-cancel" 
                onClick={onClose} 
                disabled={isPrinting}
              >
                {language === "mm" ? "မလုပ်တော့ပါ" : "Cancel"}
              </button>
            </div>

            <div style={{ 
              marginTop: '8px', 
              padding: '6px 10px', 
              background: '#f0f7ff', 
              borderRadius: '6px',
              fontSize: '10px',
              textAlign: 'center',
              border: '1px solid #d0e0ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <span style={{ 
                display: 'inline-block', 
                width: '8px', 
                height: '8px', 
                background: '#27ae60', 
                borderRadius: '50%',
                animation: 'pulse 1.5s infinite'
              }}></span>
              <span>
                {language === "mm" ? 'POS-58C ပရင်တာ အဆင်သင့်' : 'POS-58C Printer Ready'}
              </span>
              <span style={{ fontSize: '8px', color: '#999' }}>
                (USB001)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherModal;
