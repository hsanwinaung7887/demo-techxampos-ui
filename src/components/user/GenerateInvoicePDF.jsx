import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// ===== HELPER: format money =====
const formatMoney = (amount) => {
  if (amount === null || amount === undefined) return '0 Ks';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '0 Ks';
  const rounded = num.toFixed(1);
  const formatted = rounded.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return formatted + ' Ks';
};

// ===== GET FREE QUANTITY =====
const getFreeQuantity = (item) => {
  const isBuyXGetY = item.isBuyXGetY || 
                    (item.discount?.type === 'BuyXGetY') || 
                    (item.discount?.type === 'Buy X Get Y');
  if (!isBuyXGetY) return 0;
  const buyQty = item.buyQty || item.discount?.buyQuantity || 3;
  const getQty = item.getQty || item.discount?.getQuantity || 1;
  return Math.floor(item.quantity / buyQty) * getQty;
};

// ===== GET DISCOUNT LABEL =====
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
// ✅ GENERATE RECEIPT HTML - WITH LOGO & QR CODE
// ============================================================
const generateReceiptHTML = (invoiceData, shopInfo, language = 'mm') => {
  const voucherSettings = invoiceData.voucherSettings || shopInfo?.voucherSettings || {};
  
  // ✅ Get images from voucher settings
  const logoImageUrl = voucherSettings.logoImageUrl || null;
  const qrCodeImageUrl = voucherSettings.qrCodeImageUrl || null;
  
  const shopName = voucherSettings.shopName || shopInfo?.name || "My Shop";
  const shopAddress = voucherSettings.address || shopInfo?.address || "";
  const shopPhone = voucherSettings.phone || shopInfo?.phone || "";
  const note1 = voucherSettings.note1 || "";
  const note2 = voucherSettings.note2 || "";
  
  const subtotal = invoiceData.totals?.subtotal || 0;
  const productDiscount = invoiceData.totals?.discountTotal || 0;
  const additionalDiscount = invoiceData.additionalDiscount || 0;
  const taxAmount = invoiceData.totals?.taxAmount || 0;
  const finalTotal = invoiceData.totals?.finalTotal || 0;
  const totalItemsCount = invoiceData.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
  const itemTypes = invoiceData.items.length;
  const tax = invoiceData.tax || 0;
  
  let itemsHTML = '';
  invoiceData.items.forEach((item, index) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const total = price * quantity;
    const originalPrice = parseFloat(item.originalPrice) || price;
    const hasDiscount = originalPrice > price;
    const discountLabel = item.discount ? getDiscountLabel(item.discount) : null;
    const freeQty = getFreeQuantity(item);
    const isBuyXGetY = item.isBuyXGetY || 
                      (item.discount?.type === 'BuyXGetY') || 
                      (item.discount?.type === 'Buy X Get Y');
    
    let itemName = item.name || 'Item';
    if (itemName.length > 20) {
      const firstLine = itemName.substring(0, 18);
      const secondLine = itemName.substring(18);
      itemName = firstLine + '<br>' + secondLine;
    }
    
    let priceHTML = '';
    if (hasDiscount) {
      priceHTML = `
        <span class="discount-price">${formatMoney(price)}</span>
        <span class="original-price">${formatMoney(originalPrice)}</span>
      `;
    } else {
      priceHTML = `<span class="discount-price">${formatMoney(price)}</span>`;
    }
    
    itemsHTML += `
      <div class="item-row">
        <div class="item-name">
          ${index + 1}. ${itemName}
          ${hasDiscount && discountLabel ? `<span class="discount-label">(${discountLabel})</span>` : ''}
          ${isBuyXGetY && freeQty > 0 ? `<span class="discount-label">(+${freeQty} free)</span>` : ''}
        </div>
        <div class="item-qty">${quantity}</div>
        <div class="item-price">${priceHTML}</div>
        <div class="item-total">${formatMoney(total)}</div>
      </div>
    `;
  });
  
  const paymentLabels = {
    'Cash': language === "mm" ? 'ငွေသား' : 'Cash',
    'KPay': 'KPay',
    'Wave': 'Wave',
    'Credit': language === "mm" ? 'အကြွေး' : 'Credit'
  };
  const paymentLabel = paymentLabels[invoiceData.paymentMethod] || invoiceData.paymentMethod || 'Cash';
  
  // ✅ Paper size (from voucher settings)
  const paperSize = invoiceData.paperSize || '80mm';
  const is58mm = paperSize === '58mm';
  const containerWidth = is58mm ? '58mm' : '80mm';
  
  // Logo and QR sizes
  const logoSize = is58mm ? '80px' : '100px';
  const qrSize = is58mm ? '100px' : '120px';
  
  // ✅ Logo HTML (only if image exists)
  const logoHTML = logoImageUrl ? `
    <div style="text-align: center; padding: 2px 0 4px 0;">
      <img src="${logoImageUrl}" style="max-width: ${logoSize}; max-height: ${logoSize}; object-fit: contain;" alt="Logo" />
    </div>
  ` : '';
  
  // ✅ QR Code HTML (only if image exists)
  const qrHTML = qrCodeImageUrl ? `
    <div style="text-align: center; padding: 4px 0 2px 0;">
      <img src="${qrCodeImageUrl}" style="width: ${qrSize}; height: ${qrSize}; object-fit: contain;" alt="QR" />
    </div>
  ` : '';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          @page {
            size: ${containerWidth} auto;
            margin: 0;
          }
          
          body {
            font-family: 'Pyidaungsu', 'Noto Sans Myanmar', 'Courier New', monospace;
            background: white;
            padding: 0px 5px 0px 0px;
            width: ${containerWidth};
            margin: 0 auto;
          }
          
          .receipt {
            width: 100%;
            max-width: ${containerWidth};
            margin: 0 auto;
            font-size: ${is58mm ? '11px' : '13px'};
            font-weight: bold;
            line-height: 1.4;
            background: white;
          }
          
          .shop-name {
            font-size: ${is58mm ? '18px' : '22px'};
            font-weight: 900;
            text-align: center;
            padding: 4px 0 3px 0;
            letter-spacing: 1px;
          }
          
          .shop-detail {
            font-size: ${is58mm ? '10px' : '12px'};
            font-weight: bold;
            text-align: center;
            padding: 2px 0;
          }
          
          .divider {
            border-top: 2px solid #000;
            margin: 4px 0;
          }
          
          .divider-double {
            border-top: 3px solid #000;
            margin: 4px 0;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            font-size: ${is58mm ? '10px' : '12px'};
            font-weight: bold;
            padding: 2px 0;
          }
          
          .customer-info {
            padding: 4px 6px;
            margin: 4px 0;
            font-size: ${is58mm ? '10px' : '12px'};
            font-weight: bold;
            border: 1px solid #ccc;
            border-radius: 3px;
          }
          
          .header-row {
            display: flex;
            font-weight: 900;
            font-size: ${is58mm ? '10px' : '12px'};
            padding: 3px 0;
            border-bottom: 2px solid #000;
            margin-bottom: 3px;
          }
          
          .item-row {
            display: flex;
            padding: 2px 0;
            font-size: ${is58mm ? '11px' : '13px'};
            font-weight: bold;
            border-bottom: 1px dotted #ccc;
          }
          
          .item-name {
            width: 38%;
            word-break: break-word;
            font-weight: bold;
          }
          
          .item-qty {
            width: 14%;
            text-align: center;
            font-weight: bold;
          }
          
          .item-price {
            width: 22%;
            text-align: right;
            font-weight: bold;
          }
          
          .item-total {
            width: 26%;
            text-align: right;
            font-weight: 900;
          }
          
          .discount-label {
            font-size: ${is58mm ? '8px' : '10px'};
            font-weight: bold;
            padding-left: 12px;
            margin-top: 1px;
            display: block;
          }
          
          .original-price {
            font-size: 10px;
            font-weight: 900;
            text-decoration: line-through;
            color: #1e1d1d;
            display: block;
            text-align: right;
          }
          
          .discount-price {
            font-size: ${is58mm ? '11px' : '13px'};
            font-weight: 900;
            color: #000;
            display: block;
            text-align: right;
          }
          
          .free-badge {
            font-size: ${is58mm ? '8px' : '10px'};
            font-weight: bold;
            color: #27ae60;
            margin-left: 2px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            font-size: ${is58mm ? '11px' : '13px'};
            font-weight: bold;
          }
          
          .grand-total {
            display: flex;
            justify-content: space-between;
            font-size: ${is58mm ? '16px' : '20px'};
            font-weight: 900;
            border-top: 3px solid #000;
            padding-top: 5px;
            margin-top: 4px;
          }
          
          .payment-method {
            text-align: center;
            font-size: ${is58mm ? '10px' : '12px'};
            font-weight: bold;
            margin: 4px 0;
            padding: 3px 0;
            border: 1px solid #ccc;
            border-radius: 4px;
          }
          
          .footer {
            text-align: center;
            font-size: ${is58mm ? '9px' : '11px'};
            font-weight: bold;
            margin-top: 4px;
            padding-top: 3px;
            border-top: 1px dashed #999;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            font-size: ${is58mm ? '9px' : '11px'};
            font-weight: bold;
            padding: 2px 0;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <!-- ✅ LOGO (only if exists) -->
          ${logoHTML}
          
          <div class="shop-name">${shopName}</div>
          ${shopAddress ? `<div class="shop-detail">${shopAddress}</div>` : ''}
          ${shopPhone ? `<div class="shop-detail">Tel: ${shopPhone}</div>` : ''}
          <div class="divider-double"></div>
          
          <div class="info-row">
            <span>${language === "mm" ? "ဘောင်ချာ" : "Inv"}: ${invoiceData.invoiceNo || 'N/A'}</span>
            <span>${new Date().toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span>${language === "mm" ? "ငွေကိုင်" : "Cashier"}: ${invoiceData.cashier || "Cashier"}</span>
            <span>${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
          </div>
          
          ${invoiceData.customer && invoiceData.customer.name !== "Guest" && invoiceData.customer.name !== "ဧည့်သည်" ? `
            <div class="customer-info">
              <div>${language === "mm" ? "ဝယ်သူ" : "Cust"}: ${invoiceData.customer.name}</div>
              ${invoiceData.customer.phone ? `<div>${language === "mm" ? "ဖုန်း" : "Tel"}: ${invoiceData.customer.phone}</div>` : ''}
            </div>
          ` : ''}
          
          <div class="divider"></div>
          
          <div class="header-row">
            <div style="width:38%;">${language === "mm" ? "ပစ္စည်း" : "Item"}</div>
            <div style="width:14%;text-align:center;">${language === "mm" ? "အရေ" : "Qty"}</div>
            <div style="width:22%;text-align:right;">${language === "mm" ? "ဈေး" : "Price"}</div>
            <div style="width:26%;text-align:right;">${language === "mm" ? "ပေါင်း" : "Total"}</div>
          </div>
          
          ${itemsHTML}
          
          <div class="divider"></div>
          
          <!-- ===== TOTALS SECTION ===== -->
          <div class="total-row">
            <span>${language === "mm" ? "စုစုပေါင်း(လျှော့ဈေးနှုတ်ပီး)" : "Subtotal(after pro-discount"}:</span>
            <span>${formatMoney(subtotal)}</span>
          </div>
          
          <!-- ✅ Product Discount (သပ်သပ်) -->
          ${productDiscount > 0 ? `
            <div class="total-row">
              <span>${language === "mm" ? "လျှော့စျေး" : "Product Discount"}:</span>
              <span>-${formatMoney(productDiscount)}</span>
            </div>
          ` : ''}
          
          <!-- ✅ Additional Discount (သပ်သပ်) -->
          ${additionalDiscount > 0 ? `
            <div class="total-row">
              <span>${language === "mm" ? "ထပ်ဆောင်းလျှော့စျေး" : "Additional Discount"}:</span>
              <span>-${formatMoney(additionalDiscount)}</span>
            </div>
          ` : ''}
          
          ${tax > 0 ? `
            <div class="total-row">
              <span>${language === "mm" ? "အခွန်" : "Tax"} (${tax}%):</span>
              <span>+${formatMoney(taxAmount)}</span>
            </div>
          ` : ''}
          
          <div class="grand-total">
            <span>${language === "mm" ? "နောက်ဆုံးစုစု" : "GRAND TOTAL"}:</span>
            <span>${formatMoney(finalTotal)}</span>
          </div>
          
          <div class="summary-row">
            <span>${language === "mm" ? `အမျိုး ${itemTypes} မျိုး` : `${itemTypes} types`}</span>
            <span>${language === "mm" ? `စုစု ${totalItemsCount} ခု` : `${totalItemsCount} pcs`}</span>
          </div>
          
          <div class="payment-method">
            ${language === "mm" ? "ငွေပေးချေမှု" : "Payment"}: ${paymentLabel}
          </div>
          
          <div class="divider"></div>
          
          <!-- ✅ QR CODE (only if exists) -->
          ${qrHTML}
          
          ${note1 ? `<div class="footer">${note1}</div>` : ''}
          ${note2 ? `<div class="footer">${note2}</div>` : ''}
          <div class="footer" style="font-size:${is58mm ? '11px' : '14px'};font-weight:900;border-top:none;">
            ${language === "mm" ? "ကျေးဇူးတင်ပါသည်!" : "THANK YOU!"}
          </div>
          <div class="footer" style="font-size:${is58mm ? '7px' : '9px'};border-top:none;">
            ${new Date().toLocaleTimeString()}
          </div>
        </div>
      </body>
    </html>
  `;
};

// ============================================================
// ✅ MAIN THERMAL PRINT FUNCTION
// ============================================================
export const printThermalReceipt = (invoiceData, shopInfo, language = 'mm') => {
  return new Promise((resolve, reject) => {
    try {
      const printContent = generateReceiptHTML(invoiceData, shopInfo, language);
      
      const printWindow = window.open('', '_blank', 'width=380,height=600,menubar=no,toolbar=no,status=no,scrollbars=yes');
      
      if (!printWindow) {
        reject(new Error('Popup blocked! Please allow popups for this site.'));
        return;
      }
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      printWindow.onload = function() {
        setTimeout(function() {
          printWindow.print();
          setTimeout(function() {
            printWindow.close();
          }, 1000);
        }, 500);
      };
      
      resolve('POS-58C print job sent successfully');
      
    } catch (error) {
      reject(error);
    }
  });
};

// ============================================================
// ✅ PDF GENERATION
// ============================================================
const generatePDF = async (invoiceData, shopInfo, language = 'mm') => {
  try {
    const paperSize = invoiceData.paperSize || '80mm';
    const is58mm = paperSize === '58mm';
    const containerWidth = is58mm ? '210px' : '280px';
    
    const htmlContent = generateReceiptHTML(invoiceData, shopInfo, language);
    
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: ${containerWidth};
      background: white;
      padding: 4px 5px;
      z-index: 99999;
    `;
    document.body.appendChild(container);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const canvas = await html2canvas(container, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: container.scrollWidth,
      height: container.scrollHeight,
    });
    
    document.body.removeChild(container);
    
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = is58mm ? 58 : 80;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
      compress: true
    });
    
    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    const fileName = `receipt_${invoiceData.invoiceNo || 'temp'}.pdf`;
    doc.save(fileName);
    
    return fileName;
    
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};

// ============================================================
// ✅ MAIN EXPORT FUNCTION
// ============================================================
export const generateInvoicePDF = async (invoiceData, shopInfo, shouldAutoPrint = false, language = 'mm') => {
  try {
    if (shouldAutoPrint) {
      await printThermalReceipt(invoiceData, shopInfo, language);
      return 'pos58c_print_success';
    }
    return await generatePDF(invoiceData, shopInfo, language);
  } catch (error) {
    console.error("Generation failed:", error);
    throw error;
  }
};

export default generateInvoicePDF;