// src/components/user/StoreReport.jsx
import React, { useEffect, useRef, useState } from 'react';
import "../../light-style/user-css/StoreReport.css";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ✅ Safe number parser - BigDecimal error အတွက်
const safeNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const StoreReport = ({
  storeData,
  branchData,
  language,
  formatMoney,
  paymentPieData,
  discountPieData,
  businessInsights,
  onClose
}) => {
  const reportRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const formatReportDate = () => {
    const now = new Date();
    return now.toLocaleDateString(language === 'mm' ? 'my-MM' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const createPageElement = (content, pageNumber, totalPages, pageTitle) => {
    const pageDiv = document.createElement('div');
    pageDiv.className = 'a4-report-page';
    pageDiv.style.cssText = `
      width: 210mm;
      min-height: 297mm;
      padding: 15mm 15mm 10mm 15mm;
      background: white;
      position: relative;
      page-break-after: always;
      box-sizing: border-box;
      font-family: 'Pyidaungsu', 'Arial', sans-serif;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      text-align: center;
      margin-bottom: 10mm;
      border-bottom: 2px solid #2c3e50;
      padding-bottom: 5mm;
    `;
    header.innerHTML = `
      <h1 style="margin:0; color:#2c3e50; font-size:24px;">${storeData?.branchName || 'Branch Report'}</h1>
      <h2 style="margin:5px 0; color:#34495e; font-size:18px;">${language === 'mm' ? 'လုပ်ငန်းအစီရင်ခံစာ' : 'Business Report'}</h2>
      ${pageTitle ? `<h3 style="margin:5px 0; color:#7f8c8d; font-size:14px;">${pageTitle}</h3>` : ''}
      <p style="margin:5px 0; color:#7f8c8d; font-size:12px;">${formatReportDate()}</p>
      <p style="margin:5px 0; color:#7f8c8d; font-size:12px;">${storeData?.periodLabel || ''}</p>
    `;

    const footer = document.createElement('div');
    footer.style.cssText = `
      position: absolute;
      bottom: 10mm;
      left: 15mm;
      right: 15mm;
      text-align: center;
      color: #95a5a6;
      font-size: 10px;
      border-top: 1px solid #ecf0f1;
      padding-top: 5px;
    `;
    footer.innerHTML = `${language === 'mm' ? 'စာမျက်နှာ' : 'Page'} ${pageNumber} ${language === 'mm' ? 'မှ' : 'of'} ${totalPages}`;

    pageDiv.appendChild(header);
    pageDiv.innerHTML += content;
    pageDiv.appendChild(footer);

    return pageDiv;
  };

  const generateSectionHTML = (sectionName) => {
    let html = '';

    switch (sectionName) {
      case 'storeInfo':
        html = `
          <div class="report-section" style="margin-bottom: 8mm;">
            <h3 style="color:#2c3e50; border-bottom:1px solid #bdc3c7; padding-bottom:3px; margin-bottom:5mm;">
              ${language === 'mm' ? 'ဆိုင်အချက်အလက်များ' : 'Store Information'}
            </h3>
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding:3mm; background:#f8f9fa; width:40%;">${language === 'mm' ? 'ဆိုင်အမည်' : 'Branch Name'}</td>
                <td style="padding:3mm;">${storeData?.branchName}</td>
              </tr>
              <tr>
                <td style="padding:3mm; background:#f8f9fa;">${language === 'mm' ? 'တည်နေရာ' : 'Location'}</td>
                <td style="padding:3mm;">${branchData?.address || storeData?.location || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding:3mm; background:#f8f9fa;">${language === 'mm' ? 'မန်နေဂျာ' : 'Manager'}</td>
                <td style="padding:3mm;">${storeData?.manager?.name || 'N/A'} ${storeData?.manager?.phone ? `(${storeData.manager.phone})` : ''}</td>
              </tr>
              <tr>
                <td style="padding:3mm; background:#f8f9fa;">${language === 'mm' ? 'အခြေအနေ' : 'Status'}</td>
                <td style="padding:3mm;">
                  <span style="display:inline-block; padding:2px 8px; border-radius:12px; background:${storeData?.periodProfit >= 0 ? '#27ae60' : '#e74c3c'}; color:white;">
                    ${storeData?.periodProfit >= 0 ? (language === 'mm' ? 'အမြတ်ရ' : 'Profitable') : (language === 'mm' ? 'အရှုံး' : 'Loss')}
                  </span>
                </td>
              </tr>
            </table>
          </div>
        `;
        break;

      case 'financialSummary':
        // ✅ periodProfit က generalExpenses နုတ်ပြီးသား ဖြစ်တာမို့ ထပ်မနုတ်ရ
        const generalExpenses = safeNumber(storeData?.generalExpenses || 0);
        const totalCOGS = safeNumber(storeData?.totalCOGS || 0);
        const totalReturnCOGS = safeNumber(storeData?.totalReturnCOGS || 0);
        const realCOGS = totalCOGS - totalReturnCOGS;
        const actualProfit = safeNumber(storeData?.periodProfit || 0);

        html = `
          <div class="report-section" style="margin-bottom: 8mm;">
            <h3 style="color:#2c3e50; border-bottom:1px solid #bdc3c7; padding-bottom:3px; margin-bottom:5mm;">
              ${language === 'mm' ? 'ငွေကြေးအချုပ်အခြာ' : 'Financial Summary'}
            </h3>
            <table style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:#34495e; color:white;">
                  <th style="padding:3mm; text-align:left;">${language === 'mm' ? 'အမျိုးအစား' : 'Category'}</th>
                  <th style="padding:3mm; text-align:right;">${language === 'mm' ? 'ပမာဏ' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1;">${language === 'mm' ? 'စုစုပေါင်းရောင်းရငွေ' : 'Gross Sales'}</td>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1; text-align:right;">${formatMoney(storeData?.totalGrossSales || 0)}</td>
                </tr>
                <tr>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1;">${language === 'mm' ? 'ပြန်အမ်းငွေ' : 'Refunds'}</td>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1; text-align:right; color:#e74c3c;">${formatMoney(storeData?.totalRefunds || 0)}</td>
                </tr>
                <tr style="background:#f8f9fa; font-weight:bold;">
                  <td style="padding:3mm;">${language === 'mm' ? 'အသားတင်ရောင်းအား' : 'Net Sales'}</td>
                  <td style="padding:3mm; text-align:right;">${formatMoney(storeData?.periodSales || 0)}</td>
                </tr>
                <tr>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1;">${language === 'mm' ? 'ကုန်ကျစရိတ် (COGS)' : 'COGS'}</td>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1; text-align:right; color:#e74c3c;">${formatMoney(realCOGS)}</td>
                </tr>
                <tr>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1;">${language === 'mm' ? 'ပျက်စီးဆုံးရှုံးမှု' : 'Damage Loss'}</td>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1; text-align:right; color:#e74c3c;">${formatMoney(storeData?.periodLoss || 0)}</td>
                </tr>
                <tr>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1;">${language === 'mm' ? 'လက်ဆောင်ပစ္စည်းတန်ဖိုး' : 'Free Items'}</td>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1; text-align:right; color:#e74c3c;">${formatMoney(storeData?.freeGift?.amount || 0)}</td>
                </tr>
                <tr>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1;">${language === 'mm' ? 'လျှော့ဈေး' : 'Discount'}</td>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1; text-align:right; color:#e74c3c;">${formatMoney(storeData?.periodDiscount || 0)}</td>
                </tr>
                <tr>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1;">${language === 'mm' ? 'အထွေထွေကုန်ကျစရိတ်' : 'General Expenses'}</td>
                  <td style="padding:3mm; border-bottom:1px solid #ecf0f1; text-align:right; color:#e67e22;">${formatMoney(generalExpenses)}</td>
                </tr>
                <tr style="background:#f8f9fa; font-weight:bold;">
                  <td style="padding:3mm;">${language === 'mm' ? 'အမြတ်' : 'Profit'}</td>
                  <td style="padding:3mm; text-align:right; color:${actualProfit >= 0 ? '#27ae60' : '#e74c3c'};">
                    ${formatMoney(actualProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
        break;

      case 'additionalMetrics':
        html = `
          <div class="report-section" style="margin-bottom: 8mm;">
            <h3 style="color:#2c3e50; border-bottom:1px solid #bdc3c7; padding-bottom:3px; margin-bottom:5mm;">
              ${language === 'mm' ? 'အခြားကိန်းဂဏန်းများ' : 'Additional Metrics'}
            </h3>
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding:3mm; background:#f8f9fa; width:50%;">${language === 'mm' ? 'အရောင်းစာရင်းအရေအတွက်' : 'Total Invoices'}</td>
                <td style="padding:3mm;">${storeData?.totalInvoices || 0}</td>
              </tr>
              <tr>
                <td style="padding:3mm; background:#f8f9fa;">${language === 'mm' ? 'အခွန်' : 'Tax Amount'}</td>
                <td style="padding:3mm;">${formatMoney(storeData?.totalTax || 0)}</td>
              </tr>
              <tr>
                <td style="padding:3mm; background:#f8f9fa;">${language === 'mm' ? 'ရရန်အကြွေး' : 'Credit Outstanding'}</td>
                <td style="padding:3mm;">${formatMoney(storeData?.periodCreditOutstanding || 0)}</td>
              </tr>
              <tr>
                <td style="padding:3mm; background:#f8f9fa;">${language === 'mm' ? 'ကြီးထွားနှုန်း' : 'Growth Rate'}</td>
                <td style="padding:3mm;">${storeData?.growthPercentage || '0%'}</td>
              </tr>
            </table>
          </div>
        `;
        break;

      case 'paymentMethods':
        if (paymentPieData && Object.keys(storeData?.paymentMethodAmounts || {}).length > 0) {
          let rows = '';
          Object.entries(storeData.paymentMethodAmounts).forEach(([method, amount]) => {
            rows += `
              <tr>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1;">${method}</td>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1; text-align:right;">${formatMoney(amount)}</td>
              </tr>
            `;
          });

          html = `
            <div class="report-section" style="margin-bottom: 8mm;">
              <h3 style="color:#2c3e50; border-bottom:1px solid #bdc3c7; padding-bottom:3px; margin-bottom:5mm;">
                ${language === 'mm' ? 'ငွေပေးချေမှုနည်းလမ်းများ' : 'Payment Methods'}
              </h3>
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="background:#34495e; color:white;">
                    <th style="padding:3mm; text-align:left;">${language === 'mm' ? 'နည်းလမ်း' : 'Method'}</th>
                    <th style="padding:3mm; text-align:right;">${language === 'mm' ? 'ပမာဏ' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          `;
        }
        break;

      case 'discountTypes':
        if (discountPieData && Object.keys(storeData?.discountAmounts || {}).length > 0) {
          let rows = '';
          Object.entries(storeData.discountAmounts).forEach(([type, amount]) => {
            rows += `
              <tr>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1;">${type}</td>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1; text-align:right;">${formatMoney(amount)}</td>
              </tr>
            `;
          });

          html = `
            <div class="report-section" style="margin-bottom: 8mm;">
              <h3 style="color:#2c3e50; border-bottom:1px solid #bdc3c7; padding-bottom:3px; margin-bottom:5mm;">
                ${language === 'mm' ? 'လျှော့စျေးအမျိုးအစားများ' : 'Discount Types'}
              </h3>
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="background:#34495e; color:white;">
                    <th style="padding:3mm; text-align:left;">${language === 'mm' ? 'အမျိုးအစား' : 'Type'}</th>
                    <th style="padding:3mm; text-align:right;">${language === 'mm' ? 'ပမာဏ' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          `;
        }
        break;

      case 'topProducts':
        if (storeData?.topProducts && storeData.topProducts.length > 0) {
          let rows = '';
          storeData.topProducts.forEach((product, index) => {
            rows += `
              <tr>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1; text-align:center;">${index + 1}</td>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1;">${product.productName}</td>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1; text-align:center;">${product.quantitySold}</td>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1; text-align:right;">${formatMoney(product.salesAmount)}</td>
              </tr>
            `;
          });

          html = `
            <div class="report-section" style="margin-bottom: 8mm;">
              <h3 style="color:#2c3e50; border-bottom:1px solid #bdc3c7; padding-bottom:3px; margin-bottom:5mm;">
                ${language === 'mm' ? 'အကောင်းဆုံးပစ္စည်း ၁၀ မျိုး' : 'Top 10 Products'}
              </h3>
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="background:#34495e; color:white;">
                    <th style="padding:2mm;">${language === 'mm' ? 'စဉ်' : 'No.'}</th>
                    <th style="padding:2mm; text-align:left;">${language === 'mm' ? 'ပစ္စည်းအမည်' : 'Product Name'}</th>
                    <th style="padding:2mm;">${language === 'mm' ? 'အရေအတွက်' : 'Qty'}</th>
                    <th style="padding:2mm; text-align:right;">${language === 'mm' ? 'ရောင်းအား' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          `;
        }
        break;

      case 'worstProducts':
        if (storeData?.worstProducts && storeData.worstProducts.length > 0) {
          let rows = '';
          storeData.worstProducts.forEach((product, index) => {
            rows += `
              <tr>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1; text-align:center;">${index + 1}</td>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1;">${product.productName}</td>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1; text-align:center;">${product.quantitySold}</td>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1; text-align:right;">${formatMoney(product.salesAmount)}</td>
              </tr>
            `;
          });

          html = `
            <div class="report-section" style="margin-bottom: 8mm;">
              <h3 style="color:#2c3e50; border-bottom:1px solid #bdc3c7; padding-bottom:3px; margin-bottom:5mm;">
                ${language === 'mm' ? 'ရောင်းအားအနည်းဆုံး ပစ္စည်း ၁၀ မျိုး' : 'Bottom 10 Products'}
              </h3>
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="background:#34495e; color:white;">
                    <th style="padding:2mm;">${language === 'mm' ? 'စဉ်' : 'No.'}</th>
                    <th style="padding:2mm; text-align:left;">${language === 'mm' ? 'ပစ္စည်းအမည်' : 'Product Name'}</th>
                    <th style="padding:2mm;">${language === 'mm' ? 'အရေအတွက်' : 'Qty'}</th>
                    <th style="padding:2mm; text-align:right;">${language === 'mm' ? 'ရောင်းအား' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          `;
        }
        break;

      case 'topEmployees':
        if (storeData?.topEmployees && storeData.topEmployees.length > 0) {
          let rows = '';
          storeData.topEmployees.forEach((emp, index) => {
            rows += `
              <tr>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1; text-align:center;">${index + 1}</td>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1;">${emp.employeeName}</td>
                <td style="padding:2mm; border-bottom:1px solid #ecf0f1; text-align:right;">${formatMoney(emp.salesAmount)}</td>
              </tr>
            `;
          });

          html = `
            <div class="report-section" style="margin-bottom: 8mm;">
              <h3 style="color:#2c3e50; border-bottom:1px solid #bdc3c7; padding-bottom:3px; margin-bottom:5mm;">
                ${language === 'mm' ? 'ထိပ်တန်းဝန်ထမ်း ၁၀ ဦး' : 'Top 10 Employees'}
              </h3>
              <table style="width:100%; border-collapse:collapse;">
                <thead>
                  <tr style="background:#34495e; color:white;">
                    <th style="padding:2mm;">${language === 'mm' ? 'စဉ်' : 'No.'}</th>
                    <th style="padding:2mm; text-align:left;">${language === 'mm' ? 'အမည်' : 'Name'}</th>
                    <th style="padding:2mm; text-align:right;">${language === 'mm' ? 'ရောင်းအား' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          `;
        }
        break;

      case 'insights':
        if (businessInsights && businessInsights.length > 0) {
          let insights = '';
          businessInsights.forEach(insight => {
            insights += `
              <div style="margin-bottom:4mm; padding:3mm; background:${insight.type === 'success' ? '#d4edda' : insight.type === 'warning' ? '#fff3cd' : insight.type === 'danger' ? '#f8d7da' : '#d1ecf1'}; border-left:4px solid ${insight.type === 'success' ? '#28a745' : insight.type === 'warning' ? '#ffc107' : insight.type === 'danger' ? '#dc3545' : '#17a2b8'};">
                <strong style="display:block; margin-bottom:2mm;">${insight.title}</strong>
                <p style="margin:0;">${insight.description}</p>
              </div>
            `;
          });

          html = `
            <div class="report-section">
              <h3 style="color:#2c3e50; border-bottom:1px solid #bdc3c7; padding-bottom:3px; margin-bottom:5mm;">
                ${language === 'mm' ? 'အကြံပြုချက်များ' : 'Business Insights'}
              </h3>
              ${insights}
            </div>
          `;
        }
        break;

      default:
        break;
    }

    return html;
  };

  const downloadAsPDF = async () => {
    if (!reportRef.current || isGeneratingPDF) return;

    setIsGeneratingPDF(true);

    try {
      const pages = [
        { name: 'page1', sections: ['storeInfo'], title: language === 'mm' ? 'ဆိုင်အချက်အလက်များ' : 'Store Information' },
        { name: 'page2', sections: ['financialSummary', 'additionalMetrics'], title: language === 'mm' ? 'ငွေကြေးအချုပ်အခြာနှင့် အခြားကိန်းဂဏန်းများ' : 'Financial Summary & Additional Metrics' },
        { name: 'page3', sections: ['paymentMethods', 'discountTypes'], title: language === 'mm' ? 'ငွေပေးချေမှုနည်းလမ်းများနှင့် လျှော့စျေးအမျိုးအစားများ' : 'Payment Methods & Discount Types' },
        { name: 'page4', sections: ['topProducts'], title: language === 'mm' ? 'အကောင်းဆုံးပစ္စည်း ၁၀ မျိုး' : 'Top 10 Products' },
        { name: 'page5', sections: ['worstProducts'], title: language === 'mm' ? 'ရောင်းအားအနည်းဆုံး ပစ္စည်း ၁၀ မျိုး' : 'Bottom 10 Products' },
        { name: 'page6', sections: ['topEmployees'], title: language === 'mm' ? 'ထိပ်တန်းဝန်ထမ်း ၁၀ ဦး' : 'Top 10 Employees' },
        { name: 'page7', sections: ['insights'], title: language === 'mm' ? 'အကြံပြုချက်များ' : 'Business Insights' }
      ];

      const availablePages = pages.filter(page => {
        return page.sections.some(section => {
          if (section === 'paymentMethods') return paymentPieData && Object.keys(storeData?.paymentMethodAmounts || {}).length > 0;
          if (section === 'discountTypes') return discountPieData && Object.keys(storeData?.discountAmounts || {}).length > 0;
          if (section === 'topProducts') return storeData?.topProducts && storeData.topProducts.length > 0;
          if (section === 'worstProducts') return storeData?.worstProducts && storeData.worstProducts.length > 0;
          if (section === 'topEmployees') return storeData?.topEmployees && storeData.topEmployees.length > 0;
          if (section === 'insights') return businessInsights && businessInsights.length > 0;
          return true;
        });
      });

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      document.body.appendChild(tempContainer);

      const pageCanvases = [];

      for (let pageIndex = 0; pageIndex < availablePages.length; pageIndex++) {
        const page = availablePages[pageIndex];
        let combinedHTML = '';

        for (const sectionName of page.sections) {
          const sectionHTML = generateSectionHTML(sectionName);
          if (sectionHTML) {
            combinedHTML += sectionHTML;
          }
        }

        if (combinedHTML) {
          const pageDiv = createPageElement(combinedHTML, pageIndex + 1, availablePages.length, page.title);
          tempContainer.appendChild(pageDiv);

          const canvas = await html2canvas(pageDiv, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: false,
            useCORS: true,
            windowWidth: 210 * 3.78,
            windowHeight: 297 * 3.78
          });

          pageCanvases.push(canvas);
          tempContainer.innerHTML = '';
        }
      }

      document.body.removeChild(tempContainer);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pageCanvases.forEach((canvas, index) => {
        if (index > 0) pdf.addPage();
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const yPos = (pdfHeight - imgHeight) / 2;
        pdf.addImage(imgData, 'PNG', 10, yPos > 0 ? yPos : 10, imgWidth, imgHeight);
      });

      pdf.save(`${storeData?.branchName || 'branch'}-report-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(language === 'mm' ? 'PDF ထုတ်ရာတွင် အဆင်မပြေပါ။' : 'Failed to generate PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const downloadAsPNG = async () => {
    if (reportRef.current) {
      try {
        const element = reportRef.current;
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: false,
          useCORS: true,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight
        });

        const link = document.createElement('a');
        link.download = `${storeData?.branchName || 'branch'}-report-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

      } catch (error) {
        console.error('Error generating PNG:', error);
        alert(language === 'mm' ? 'PNG ထုတ်ရာတွင် အဆင်မပြေပါ။' : 'Failed to generate PNG.');
      }
    }
  };

  return (
    <div className="report-modal-overlay">
      <div className="report-modal">
        <div className="report-modal-header">
          <h2>
            <i className="fas fa-file-alt"></i>
            {language === 'mm' ? ' လုပ်ငန်းအစီရင်ခံစာ' : ' Business Report'}
          </h2>
          <div className="report-modal-actions">
            <button className="report-download-btn pdf" onClick={downloadAsPDF} disabled={isGeneratingPDF}>
              <i className="fas fa-file-pdf"></i>
              {isGeneratingPDF
                ? (language === 'mm' ? ' ထုတ်နေသည်...' : ' Generating...')
                : (language === 'mm' ? ' PDF ထုတ်ရန်' : ' Download PDF')}
            </button>
            <button className="report-download-btn png" onClick={downloadAsPNG}>
              <i className="fas fa-image"></i>
              {language === 'mm' ? ' PNG ထုတ်ရန်' : ' Download PNG'}
            </button>
            <button className="report-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="report-modal-body">
          <div className="a4-report" ref={reportRef}>
            {/* Report Header */}
            <div className="report-header">
              <h1>{storeData?.branchName}</h1>
              <h2>{language === 'mm' ? 'လုပ်ငန်းအစီရင်ခံစာ' : 'Business Report'}</h2>
              <div className="report-meta">
                <p className="report-date">{formatReportDate()}</p>
                <p className="report-period">{storeData?.periodLabel}</p>
              </div>
            </div>

            {/* Store Information */}
            <div className="report-section">
              <h3>{language === 'mm' ? 'ဆိုင်အချက်အလက်များ' : 'Store Information'}</h3>
              <table className="report-table info-table">
                <tbody>
                  <tr>
                    <td className="label">{language === 'mm' ? 'ဆိုင်အမည်' : 'Branch Name'}</td>
                    <td className="value">{storeData?.branchName}</td>
                  </tr>
                  <tr>
                    <td className="label">{language === 'mm' ? 'တည်နေရာ' : 'Location'}</td>
                    <td className="value">{branchData?.address || storeData?.location || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="label">{language === 'mm' ? 'မန်နေဂျာ' : 'Manager'}</td>
                    <td className="value">{storeData?.manager?.name || 'N/A'} {storeData?.manager?.phone ? `(${storeData.manager.phone})` : ''}</td>
                  </tr>
                  <tr>
                    <td className="label">{language === 'mm' ? 'အခြေအနေ' : 'Status'}</td>
                    <td className="value">
                      <span className={`status-badge ${storeData?.periodProfit >= 0 ? 'success' : 'danger'}`}>
                        {storeData?.periodProfit >= 0
                          ? (language === 'mm' ? 'အမြတ်ရ' : 'Profitable')
                          : (language === 'mm' ? 'အရှုံး' : 'Loss')}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="report-section">
              <h3>{language === 'mm' ? 'ငွေကြေးအချုပ်အခြာ' : 'Financial Summary'}</h3>
              <table className="report-table financial-table">
                <thead>
                  <tr>
                    <th>{language === 'mm' ? 'အမျိုးအစား' : 'Category'}</th>
                    <th>{language === 'mm' ? 'ပမာဏ' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{language === 'mm' ? 'စုစုပေါင်းရောင်းရငွေ' : 'Gross Sales'}</td>
                    <td className="amount">{formatMoney(storeData?.totalGrossSales || 0)}</td>
                  </tr>
                  <tr>
                    <td>{language === 'mm' ? 'ပြန်အမ်းငွေ' : 'Refunds'}</td>
                    <td className="amount refund">{formatMoney(storeData?.totalRefunds || 0)}</td>
                  </tr>
                  <tr className="total-row">
                    <td><strong>{language === 'mm' ? 'အသားတင်ရောင်းအား' : 'Net Sales'}</strong></td>
                    <td className="amount"><strong>{formatMoney(storeData?.periodSales || 0)}</strong></td>
                  </tr>
                  <tr>
                    <td>{language === 'mm' ? 'ကုန်ကျစရိတ် (COGS)' : 'COGS'}</td>
                    <td className="amount expense">{formatMoney(safeNumber(storeData?.totalCOGS || 0) - safeNumber(storeData?.totalReturnCOGS || 0))}</td>
                  </tr>
                  <tr>
                    <td>{language === 'mm' ? 'ပျက်စီးဆုံးရှုံးမှု' : 'Damage Loss'}</td>
                    <td className="amount expense">{formatMoney(storeData?.periodLoss || 0)}</td>
                  </tr>
                  <tr>
                    <td>{language === 'mm' ? 'လက်ဆောင်ပစ္စည်းတန်ဖိုး' : 'Free Items'}</td>
                    <td className="amount expense">{formatMoney(storeData?.freeGift?.amount || 0)}</td>
                  </tr>
                  <tr>
                    <td>{language === 'mm' ? 'လျှော့ဈေး' : 'Discount'}</td>
                    <td className="amount expense">{formatMoney(storeData?.periodDiscount || 0)}</td>
                  </tr>
                  <tr>
                    <td>{language === 'mm' ? 'အထွေထွေကုန်ကျစရိတ်' : 'General Expenses'}</td>
                    <td className="amount" style={{ color: '#e67e22' }}>{formatMoney(safeNumber(storeData?.generalExpenses || 0))}</td>
                  </tr>
                  {/* ✅ FIXED: periodProfit က generalExpenses နုတ်ပြီးသား ဖြစ်တာမို့ ထပ်မနုတ်ရ */}
                  <tr className="total-row">
                    <td><strong>{language === 'mm' ? 'အမြတ်' : 'Profit'}</strong></td>
                    <td className={`amount ${safeNumber(storeData?.periodProfit || 0) >= 0 ? 'profit' : 'loss'}`}>
                      <strong>{formatMoney(safeNumber(storeData?.periodProfit || 0))}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Additional Metrics */}
            <div className="report-section">
              <h3>{language === 'mm' ? 'အခြားကိန်းဂဏန်းများ' : 'Additional Metrics'}</h3>
              <table className="report-table metrics-table">
                <tbody>
                  <tr>
                    <td className="label">{language === 'mm' ? 'အရောင်းစာရင်းအရေအတွက်' : 'Total Invoices'}</td>
                    <td className="value">{storeData?.totalInvoices || 0}</td>
                  </tr>
                  <tr>
                    <td className="label">{language === 'mm' ? 'အခွန်' : 'Tax Amount'}</td>
                    <td className="value">{formatMoney(storeData?.totalTax || 0)}</td>
                  </tr>
                  <tr>
                    <td className="label">{language === 'mm' ? 'ရရန်အကြွေး' : 'Credit Outstanding'}</td>
                    <td className="value">{formatMoney(storeData?.periodCreditOutstanding || 0)}</td>
                  </tr>
                  <tr>
                    <td className="label">{language === 'mm' ? 'ကြီးထွားနှုန်း' : 'Growth Rate'}</td>
                    <td className="value">{storeData?.growthPercentage || '0%'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Methods */}
            {paymentPieData && (
              <div className="report-section">
                <h3>{language === 'mm' ? 'ငွေပေးချေမှုနည်းလမ်းများ' : 'Payment Methods'}</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>{language === 'mm' ? 'နည်းလမ်း' : 'Method'}</th>
                      <th>{language === 'mm' ? 'ပမာဏ' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(storeData?.paymentMethodAmounts || {}).map(([method, amount], index) => (
                      <tr key={index}>
                        <td>{method}</td>
                        <td className="amount">{formatMoney(amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Discount Types */}
            {discountPieData && (
              <div className="report-section">
                <h3>{language === 'mm' ? 'လျှော့စျေးအမျိုးအစားများ' : 'Discount Types'}</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>{language === 'mm' ? 'အမျိုးအစား' : 'Type'}</th>
                      <th>{language === 'mm' ? 'ပမာဏ' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(storeData?.discountAmounts || {}).map(([type, amount], index) => (
                      <tr key={index}>
                        <td>{type}</td>
                        <td className="amount">{formatMoney(amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Top Products */}
            {storeData?.topProducts && storeData.topProducts.length > 0 && (
              <div className="report-section">
                <h3>{language === 'mm' ? 'အကောင်းဆုံးပစ္စည်း ၁၀ မျိုး' : 'Top 10 Products'}</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>{language === 'mm' ? 'စဉ်' : 'No.'}</th>
                      <th>{language === 'mm' ? 'ပစ္စည်းအမည်' : 'Product Name'}</th>
                      <th>{language === 'mm' ? 'အရေအတွက်' : 'Qty'}</th>
                      <th>{language === 'mm' ? 'ရောင်းအား' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeData.topProducts.map((product, index) => (
                      <tr key={product.productId || index}>
                        <td>{index + 1}</td>
                        <td>{product.productName}</td>
                        <td>{product.quantitySold}</td>
                        <td className="amount">{formatMoney(product.salesAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Worst Products */}
            {storeData?.worstProducts && storeData.worstProducts.length > 0 && (
              <div className="report-section">
                <h3>{language === 'mm' ? 'ရောင်းအားအနည်းဆုံး ပစ္စည်း ၁၀ မျိုး' : 'Bottom 10 Products'}</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>{language === 'mm' ? 'စဉ်' : 'No.'}</th>
                      <th>{language === 'mm' ? 'ပစ္စည်းအမည်' : 'Product Name'}</th>
                      <th>{language === 'mm' ? 'အရေအတွက်' : 'Qty'}</th>
                      <th>{language === 'mm' ? 'ရောင်းအား' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeData.worstProducts.map((product, index) => (
                      <tr key={product.productId || index}>
                        <td>{index + 1}</td>
                        <td>{product.productName}</td>
                        <td>{product.quantitySold}</td>
                        <td className="amount">{formatMoney(product.salesAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Top Employees */}
            {storeData?.topEmployees && storeData.topEmployees.length > 0 && (
              <div className="report-section">
                <h3>{language === 'mm' ? 'ထိပ်တန်းဝန်ထမ်း ၁၀ ဦး' : 'Top 10 Employees'}</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>{language === 'mm' ? 'စဉ်' : 'No.'}</th>
                      <th>{language === 'mm' ? 'အမည်' : 'Name'}</th>
                      <th>{language === 'mm' ? 'ရောင်းအား' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeData.topEmployees.map((emp, index) => (
                      <tr key={emp.employeeId || index}>
                        <td>{index + 1}</td>
                        <td>{emp.employeeName}</td>
                        <td className="amount">{formatMoney(emp.salesAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Business Insights */}
            {businessInsights && businessInsights.length > 0 && (
              <div className="report-section">
                <h3>{language === 'mm' ? 'အကြံပြုချက်များ' : 'Business Insights'}</h3>
                <div className="insights-list">
                  {businessInsights.map((insight, idx) => (
                    <div key={idx} className={`insight-item ${insight.type}`}>
                      <strong>{insight.title}</strong>
                      <p>{insight.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Footer */}
            <div className="report-footer">
              <p>{language === 'mm' ? 'ထုတ်ယူသည့်ရက်စွဲ' : 'Generated on'}: {formatReportDate()}</p>
              <p className="page-info">{language === 'mm' ? 'စာမျက်နှာ' : 'Page'} 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreReport;