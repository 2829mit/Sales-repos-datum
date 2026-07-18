
import { TANK_OPTIONS, RFD_SENSORS_AND_CONTROLLER_OPTIONS, RFD_REPOS_OS_OPTIONS, RFD_Z_BASE_OPTIONS, RFD_Z_UPGRADE_OPTIONS } from '../constants';
import { QuoteData } from '../types';

// Declare jsPDF on window since we are using CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = (error) => {
      console.warn("Failed to load logo for PDF", error);
      resolve("");
    };
    img.src = url;
  });
};

const numberToWords = (num: number): string => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString().length > 9 ? parseFloat(num.toString().slice(0, 9)) : num) === 0) return '';
  
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';

  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  
  return str.trim();
};

const formatIndianCurrency = (num: number): string => {
  if (num === undefined || num === null) return "0";
  
  const val = Math.round(num);
  const s = val.toString();
  
  let lastThree = s.substring(s.length - 3);
  const otherNumbers = s.substring(0, s.length - 3);
  
  let res = lastThree;
  if (otherNumbers !== '') {
      res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }
  
  return res;
};

// Salesperson Contact Mapping
const SALES_CONTACTS: Record<string, { mobile: string; email: string }> = {
  'Ajay Kumar': { mobile: '7015493848', email: 'ajay@reposenergy.com' },
  'Ketan Sarode': { mobile: '7875487815', email: 'ketan.sarode@reposenergy.com' },
  'Burhan Cyclewala': { mobile: '8149775353', email: 'burhan@reposenergy.com' },
  'Malvika Sharma': { mobile: '8956853779', email: 'Malvika.Sharma@reposenergy.com' },
  'Chetan Walunj': { mobile: '9552555555', email: 'chetan@reposenergy.com' },
  'Aditi Walunj': { mobile: '9552555555', email: 'aditi@reposenergy.com' },
};

const DEFAULT_CONTACT = { mobile: '8669990062', email: 'rajesh.jadhav@reposenergy.com' };

export const generateQuotePDF = async (data: QuoteData) => {
  if (!window.jspdf) {
    alert("PDF library not loaded yet. Please check your connection.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const tankObj = data.configuration?.tank ? TANK_OPTIONS.find(t => t.id === data.configuration.tank) : undefined;
  
  const logoUrl = "https://i.postimg.cc/52fvQyLD/Repos-New-Logo-V1-1.png";
  let logoBase64 = "";
  try {
    logoBase64 = await getBase64ImageFromURL(logoUrl);
  } catch (e) {
    console.error(e);
  }

  const black = "#000000";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(black);

  doc.rect(5, 5, 200, 287); // Main border

  // --- HEADER ---
  // Reduced starting Y position to 10
  let yPos = 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("BUSINESS PROPOSAL", 105, yPos, { align: "center" });
  doc.line(5, yPos + 2, 205, yPos + 2); 

  yPos += 5; // Compact spacing
  
  doc.setFontSize(10);
  doc.text("Repos Energy India Private Limited", 105, yPos, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8); // Reduced address font size
  yPos += 3.5;
  doc.text("FL No. 301, Bhuvaneshwari Apartment, Plot No. 1, S.NO. 108/1B, Aundh,", 105, yPos, { align: "center" });
  yPos += 3.5;
  doc.text("Pune - 411007, Maharashtra", 105, yPos, { align: "center" });
  yPos += 3.5;
  doc.text("GSTIN/UIN: 27AAICR3322D1ZO, CIN: U74999PN2017PTC170768, PAN No.: AAICR3322D", 105, yPos, { align: "center" });
  
  // Dynamic Contact Details
  const salesperson = data.customerDetails?.salesperson;
  const contactInfo = SALES_CONTACTS[salesperson] || DEFAULT_CONTACT;
  
  yPos += 3.5;
  // Make Contact line bold
  doc.setFont("helvetica", "bold");
  doc.text(`Contact : ${contactInfo.mobile} E-Mail : ${contactInfo.email} www.reposenergy.com`, 105, yPos, { align: "center" });
  doc.setFont("helvetica", "normal");

  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 160, 5, 30, 8); // Slightly smaller logo
  }

  yPos += 4;
  doc.line(5, yPos, 205, yPos);

  // --- GRID SECTION ---
  const sectionTop = yPos;
  const col1X = 5;
  const col2X = 105; 
  const rowHeight = 20; // Reduced row height to 20mm to save space
  
  doc.line(105, sectionTop, 105, sectionTop + (rowHeight * 2));
  doc.line(105, sectionTop + rowHeight, 205, sectionTop + rowHeight);
  doc.line(5, sectionTop + (rowHeight * 2), 205, sectionTop + (rowHeight * 2));

  // To (Formerly Bill To)
  yPos = sectionTop + 3;
  doc.setFontSize(8); // Reduced font size for grid content
  doc.setFont("helvetica", "bold");
  doc.text("To", col1X + 2, yPos);
  doc.setFont("helvetica", "normal");
  yPos += 3.5;

  const d = data.customerDetails;
  
  // Show only Name, Company, State as values (no labels)
  if (d?.name) {
    doc.text(d.name, col1X + 2, yPos);
    yPos += 3.5;
  }
  if (d?.company) {
    doc.text(d.company, col1X + 2, yPos);
    yPos += 3.5;
  }
  if (d?.state) {
    doc.text(d.state, col1X + 2, yPos);
    yPos += 3.5;
  }

  // Proposal Details
  let capacity = '22KL';
  if (data.selectedProduct === 'rfd-z') {
    capacity = data.rfdZConfiguration?.base === 'datum-2kl' ? '2KL' : '2KL';
  } else {
    capacity = tankObj ? tankObj.name : '22KL';
  }
  
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
  const serial = String(Date.now()).slice(-4);
  
  const proposalNo = `REIPL_RFD_${capacity}_${dateStr}_${serial}`;
  const proposalDate = now.toLocaleDateString('en-GB');
  
  const isInstallment = data.paymentMode === 'installments';
  const modeText = isInstallment ? 'Easy Installments (36 Months)' : 'Outright (Full Amount)';
  
  // Reset yPos for Column 2 to align top
  yPos = sectionTop + 3;
  doc.setFont("helvetica", "bold");
  
  // Use splitTextToSize to prevent distortion/overflow
  const proposalLabel = `Proposal No. - ${proposalNo}`;
  const splitProposal = doc.splitTextToSize(proposalLabel, 95); // max width 95
  doc.text(splitProposal, col2X + 2, yPos);
  yPos += (splitProposal.length * 3.5);

  doc.text(`Dated- ${proposalDate}`, col2X + 2, yPos);
  yPos += 6; // Increased gap between Date and Payment Mode
  
  // Payment Mode Label Bold
  doc.setFont("helvetica", "bold");
  doc.text("Payment Mode:", col2X + 2, yPos);
  const pmLabelWidth = doc.getTextWidth("Payment Mode:");
  
  doc.setFont("helvetica", "normal");
  // Adjust position for value
  doc.text(modeText, col2X + 2 + pmLabelWidth + 1, yPos);

  // Repos Account
  yPos = sectionTop + rowHeight + 3;
  doc.setFont("helvetica", "bold");
  doc.text("Repos Account Details", col2X + 2, yPos);
  doc.setFont("helvetica", "normal");
  yPos += 3.5;
  doc.text("Name of the Beneficiary - Repos Energy India Private Limited", col2X + 2, yPos);
  yPos += 3.5;
  doc.text("Account Number: 777705029009", col2X + 2, yPos);
  yPos += 3.5;
  doc.text("Bank Name: ICICI Bank Ltd", col2X + 2, yPos);
  yPos += 3.5;
  doc.text("Branch: Shivajinagar, Pune IFSC Code: ICIC0000039", col2X + 2, yPos);

  yPos = sectionTop + (rowHeight * 2);

  // --- DATA COLLECTION ---
  const multiplier = isInstallment ? 1 : 36;
  const tenureText = isInstallment ? "36 Months" : "Nos";

  interface LineItem {
    desc: string;
    rate: number;
    hsn: string;
    tenure: string;
    isAddon: boolean;
    quantity: string;
    forceStandard?: boolean;
  }

  const allSelectedItems: LineItem[] = [];
  
  if (data.selectedProduct === 'rfd-z') {
    const baseOpt = RFD_Z_BASE_OPTIONS.find(o => o.id === data.rfdZConfiguration?.base);
    allSelectedItems.push({
      desc: `Repos RFD Z Base Unit: ${baseOpt ? baseOpt.name : 'Datum 2KL'}`,
      rate: (baseOpt ? baseOpt.price : 0) * multiplier,
      hsn: "84131191",
      tenure: tenureText,
      isAddon: false,
      quantity: "1",
      forceStandard: true
    });

    if (data.rfdZConfiguration?.upgrades?.length) {
      data.rfdZConfiguration.upgrades.forEach(upgradeId => {
        const opt = RFD_Z_UPGRADE_OPTIONS.find(o => o.id === upgradeId);
        const name = opt ? opt.name : upgradeId.toUpperCase();
        const price = opt ? opt.price : 0;
        allSelectedItems.push({
          desc: `Add-On: ${name}`,
          rate: price * multiplier,
          hsn: "84131191",
          tenure: tenureText,
          isAddon: true,
          quantity: "1"
        });
      });
    }
  } else {
    // Base Product
    let mainProductDesc = `Repos Fuel Datum Capacity : ${capacity} (HSD)\n`;
    
    allSelectedItems.push({
      desc: mainProductDesc,
      rate: (tankObj?.price || 0) * multiplier,
      hsn: "84131191",
      tenure: tenureText,
      isAddon: false,
      quantity: "1",
      forceStandard: true
    });

    const collectItems = (list: any[]) => {
        list.forEach(item => {
            let description = item.name;
            let rate = item.price || 0;
            
            if (item.id === 'advanced-skid') {
              description = "Advanced Skid with Metering Counter";
              if (data.configuration.tank === '30kl') {
                return; // Do not add to invoice
              }
            }
            
            allSelectedItems.push({
              desc: description,
              rate: rate * multiplier,
              hsn: "84131191",
              tenure: isInstallment ? "36" : "Nos",
              isAddon: true,
              quantity: "1"
            });
        });
    };

    // Collect ALL categories
    collectItems(data.configuration.dispensingUnits);
    collectItems(data.configuration.accessories.reposOs);
    collectItems(data.configuration.decantation);
    collectItems(data.configuration.accessories.mechanical);
    collectItems(data.configuration.accessories.safetyUnits);
    collectItems(data.configuration.accessories.safetyUpgrades);

    // Add RFID Tags if selected
    if (data.rfidTagsQuantity && data.rfidTagsQuantity > 0) {
      allSelectedItems.push({
        desc: "RFID Tags",
        rate: (data.rfidTagsQuantity * 49) * multiplier,
        hsn: "84131191",
        tenure: isInstallment ? "36" : "Nos",
        isAddon: true,
        quantity: data.rfidTagsQuantity.toString()
      });
    }
  }

  // --- SORT ITEMS: Standard Classification First ---
  allSelectedItems.sort((a, b) => {
    const isStandardA = a.forceStandard || a.rate === 0;
    const isStandardB = b.forceStandard || b.rate === 0;
    
    // Standard comes first
    if (isStandardA && !isStandardB) return -1;
    if (!isStandardA && isStandardB) return 1;
    return 0;
  });

  // --- COMMERCIAL TABLE ---
  const customerState = data.customerDetails?.state?.toLowerCase() || "";
  const isMaharashtra = customerState.includes("maharashtra");
  
  let columns: string[] = [];
  let columnStyles: any = {};

  if (isInstallment) {
    // Removed Down Payment Column
    columns = ["Sr", "Product Descriptions", "Classification", "HSN/SAC", "Quantity", "Rate", "Tenure"];
    columnStyles = {
      0: { cellWidth: 8, halign: 'center' }, 
      1: { cellWidth: 'auto' }, 
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 12, halign: 'center' }, 
      5: { cellWidth: 22, halign: 'right' }, 
      6: { cellWidth: 22, halign: 'center' }, 
    };
  } else {
    // Outright: Removed Per and Amount columns
    columns = ["Sr", "Product Descriptions", "Classification", "HSN/SAC", "Quantity", "Rate"];
    columnStyles = {
      0: { cellWidth: 10, halign: 'center' }, 
      1: { cellWidth: 'auto' }, 
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' }, 
      5: { cellWidth: 35, halign: 'right' }, // Rate acts as Amount
    };
  }

  let tableBody: any[] = [];
  let subtotalMainItem = 0;
  let subtotalAddons = 0;
  let totalRateSum = 0;

  allSelectedItems.forEach((item, index) => {
    const rate = item.rate;
    let amount = 0;
    
    // Check forceStandard for classification
    const classification = (item.forceStandard || rate === 0) ? "Standard" : "Addon";

    if (isInstallment) {
      amount = 0; // Not calculated per row for display anymore
    } else {
      amount = rate;
    }

    if (item.isAddon) {
      subtotalAddons += amount;
    } else {
      subtotalMainItem += amount;
    }

    totalRateSum += rate;
    
    const row = [
      (index + 1).toString(),
      item.desc,
      classification,
      item.hsn,
      item.quantity,
      formatIndianCurrency(rate)
    ];

    if (isInstallment) {
        row.push(item.tenure);
    }

    tableBody.push(row);
  });

  // --- DISCOUNT CALCULATION ---
  const discountAmountInput = data.discountAmount || 0;
  const totalExWorks = totalRateSum;
  let discountAmount = 0;
  let netExWorks = totalExWorks;

  if (discountAmountInput > 0) {
    discountAmount = discountAmountInput;
    netExWorks = totalExWorks - discountAmount;
  }

  let cgst = 0, sgst = 0, igst = 0;
  let totalIncl = 0;
  let downPaymentGST = 0;
  let grandTotal = 0;
  
  if (!isInstallment) {
    // Outright: Calculate 18% Tax on Net Amount
    const taxableAmount = netExWorks;
    if (isMaharashtra) {
      cgst = taxableAmount * 0.09;
      sgst = taxableAmount * 0.09;
    } else {
      igst = taxableAmount * 0.18;
    }
    totalIncl = taxableAmount + cgst + sgst + igst;
    grandTotal = totalIncl;

    // Summary Rows
    tableBody.push(["", "Ex-Works Total(INR)", "", "", "", formatIndianCurrency(totalExWorks)]);
    
    if (discountAmountInput > 0) {
      tableBody.push(["", `Discount`, "", "", "", `-${formatIndianCurrency(discountAmount)}`]);
      tableBody.push(["", "Net Ex-Works", "", "", "", formatIndianCurrency(netExWorks)]);
    }

    tableBody.push(["", "GST @18%", "", "", "", formatIndianCurrency(totalIncl)]);
    tableBody.push(["", "Round Off", "", "", "", "0"]);
    tableBody.push(["", "Total (INR)", "", "", "", formatIndianCurrency(totalIncl)]);

  } else {
    // Installment Summary
    const monthlyExWorks = totalRateSum; // Monthly Rate
    
    // For installment, if discount is applied, it applies to monthly rental
    const monthlyDiscountAmount = discountAmountInput;
    const netMonthly = monthlyExWorks - monthlyDiscountAmount;
    
    downPaymentGST = netMonthly * 36 * 0.18; // GST on total contract value (36 months) derived from net monthly
    grandTotal = netMonthly; // Display Monthly

    tableBody.push(["", "Ex-Works Total(INR)", "", "", "", formatIndianCurrency(monthlyExWorks), ""]);
    
    if (discountAmountInput > 0) {
      tableBody.push(["", `Discount`, "", "", "", `-${formatIndianCurrency(monthlyDiscountAmount)}`, ""]);
      tableBody.push(["", "Net Monthly Ex-Works", "", "", "", formatIndianCurrency(netMonthly), ""]);
    }

    tableBody.push(["", "Down Payment (GST @18%)", "", "", "", formatIndianCurrency(downPaymentGST), ""]);
    tableBody.push(["", "Round Off", "", "", "", "0", ""]);
    tableBody.push([
      "", 
      "Total (INR)", 
      "", 
      "", 
      "",
      formatIndianCurrency(netMonthly), 
      "36 Months"
    ]);
  }

  doc.autoTable({
    startY: yPos,
    head: [columns],
    body: tableBody,
    theme: 'grid',
    margin: { left: 10, right: 10 }, 
    styles: {
      font: "helvetica", fontSize: 6.5, textColor: black, lineColor: [0, 0, 0], lineWidth: 0.1, valign: 'top', cellPadding: 1, overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [255, 255, 255], textColor: black, fontStyle: 'bold', lineWidth: 0.1, lineColor: [0, 0, 0],
    },
    columnStyles: columnStyles,
    didParseCell: function (data: any) {
      // Bold summary rows
      if (data.row.index >= (tableBody.length - (discountAmountInput > 0 ? (isInstallment ? 5 : 5) : (isInstallment ? 3 : 3)))) {
         data.cell.styles.fontStyle = 'bold';
      }
      // Bold "Addon" classification
      if (data.section === 'body' && data.column.index === 2 && data.cell.raw === 'Addon') {
         data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  // @ts-ignore
  let finalY = doc.lastAutoTable.finalY;

  if (!isInstallment) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`Amount (Words) - Rs. ${numberToWords(Math.round(grandTotal))} Only`, 10, finalY + 6);
    finalY += 10;
  } else {
    finalY += 6;
  }

  // --- FOOTER SECTION (Signature & Note) ---
  const pageHeight = 287; // Matches the bottom border limit used elsewhere (297 - 10)
  
  // Ensure we have enough vertical space for the signature block.
  // If we are too close to the bottom (e.g. > 265mm), add a new page.
  // NOTE: Optimized for 1-page fit where possible by compressing header.
  if (finalY > 265) {
    doc.addPage();
    doc.rect(5, 5, 200, 287); // Draw border on new page
    finalY = 20; // Reset Y position near top
  }

  // Draw the footer container box
  // Box starts at finalY and extends to the bottom margin (282 = 287 - 5)
  doc.rect(5, finalY, 200, pageHeight - finalY - 5);
  doc.line(140, finalY, 140, pageHeight - 5); // Vertical separator

  // Note Section (Left)
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Note: This is a business proposal.", 7, finalY + 10);

  // Signature Section (Right)
  doc.setFont("helvetica", "bold");
  // "For Repos..." text at the top of the signature cell
  doc.text("For Repos Energy India Private Limited", 142, finalY + 6);
  
  // "Authorised Signatory" text at the bottom of the signature cell
  // This ensures a clear gap for the signature
  doc.text("Authorised Signatory", 170, pageHeight - 10, { align: "center" });


  // --- PAGE 2: TERMS AND CONDITIONS ---
  doc.addPage();
  doc.rect(5, 5, 200, 287);
  let tY = 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TERMS AND CONDITIONS (ANNEXURE)", 105, tY, { align: 'center' });
  doc.line(5, tY + 2, 205, tY + 2);
  tY += 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  // Helper to add a numbered point with bold title and normal content
  const addPoint = (title: string, content: string) => {
     // Pre-calculate content height to check for page break
     doc.setFont("helvetica", "normal");
     // Justify -> Left align to fix uneven spacing issues
     const splitText = doc.splitTextToSize(content, 185);
     const lineHeight = 4;
     const contentHeight = splitText.length * lineHeight;
     const titleHeight = 5;
     const gap = 4;
     
     // Check bounds (275 safe limit for bottom margin)
     if (tY + titleHeight + contentHeight + gap > 275) {
         doc.addPage();
         doc.rect(5, 5, 200, 287);
         tY = 20;
     }

     doc.setFont("helvetica", "bold");
     doc.text(title, 10, tY);
     tY += 5; // Move down for content

     doc.setFont("helvetica", "normal");
     // Justify -> Left align
     doc.text(content, 10, tY, { maxWidth: 185, align: "left" });
     tY += contentHeight + gap;
  };

  // A. USAGE
  addPoint("A. USE:", "The Repos Fuel Datum (“RFD”) is for internal business use of storing and dispensing high speed diesel only (in line with approval from PESO) and the RFD shall not be used for any other purpose. Customer shall not use RFD for refueling any third party vehicle or for the purpose of reselling of high speed diesel to any third party vehicle; since such use of RFD will be in contravention of Motor Spirit And High Speed Diesel (Regulation Of Supply, Distribution And Prevention Of Malpractices) Order, 2005 as amended from time to time, for which the only Customer will be liable.");

  // B. WORK ORDER
  addPoint("B. WORK ORDER:", "The Customer shall place the order only in the name of Repos Energy India Private Limited (“The Company”). Any discrepancy in the name shall result in cancellation of order. Upon initiation of the work order, no modification regarding RFD variant model or any other related upgrades will be accepted.");

  // C. TITLE TRANSFER
  addPoint("C. TITLE TRANSFER & DELIVERY:", "RFD shall be ready for delivery at Delivery Location (defined hereunder) within twelve (12) weeks from the date of execution of the purchase order, subject to the fulfilment of payment terms mentioned in Point D. below and prior approvals from the governmental organizations. The title of the said RFD shall stand transferred from Repos Energy India Private Limited (hereinafter referred to as \"Repos\") to the Customer upon dispatch of the said RFD from Repos' manufacturing facility situated at Chakan, Pune, Maharashtra, India. Upon such transfer of title, save and except as expressly provided herein, all obligations pertaining to the RFD shall stand transferred from Repos to the Customer, and Repos shall stand discharged from all obligations relating to the RFD, except those explicitly specified herein. Subsequent to the transfer of title, the Customer shall be solely responsible and liable for any non-compliance or deviation from the Standard Operating Procedures (SOPs), regulations promulgated by relevant authorities, and statutory compliances prescribed by the Petroleum and Explosives Safety Organization (PESO), Oil Marketing Companies (OMCs), or any other concerned regulatory or governing bodies. Repos shall, on a best effort basis, undertake the installation of the RFD within fifteen (15) business days from the date of dispatch subject to the site readiness, which timeline is indicative and shall not be construed as a mandatory obligation upon Repos.");

  // D. PAYMENT TERMS
  let paymentIntro = "as per Table 1 mentioned hereunder";
  if (isInstallment) {
    paymentIntro = "As per the approved bank Scheduled of Disbursement";
  }

  const paymentContent = `Payment shall be made by the Customer to Repos ${paymentIntro}. The dispatch shall be scheduled only after the complete payment is received by Repos. The said dispatch of RFD would be in accordance with Ex-Workshop (EXW) basis at Waki, Chakan Pune (Maharashtra).\n\nRepos shall make the RFD available for collection by the Buyer on an EXW basis from Repos’ facility located in Waki, Chakan, Pune, Maharashtra ("Delivery Location") and the Customer shall be solely responsible for all costs, risks, and liabilities associated with transportation, loading, insurance and any other expenses incurred after the goods have been made available at the Delivery Location. Upon notification of readiness for pickup, Customer shall take delivery within seven (7) days, failing which storage charges may apply at the Repos’ discretion. Title and risk in the goods shall pass to the Buyer upon collection from the Delivery Location read with Point C. TITLE TRANSFER & DELIVERY above.`;
  
  // Calculate height for D text manually since it has Table 1 injection
  doc.setFont("helvetica", "normal");
  const splitPaymentText = doc.splitTextToSize(paymentContent, 185);
  const paymentTextHeight = splitPaymentText.length * 4;
  
  if (tY + 4 + paymentTextHeight + 2 > 275) {
      doc.addPage();
      doc.rect(5, 5, 200, 287);
      tY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.text("D. PAYMENT TERMS:", 10, tY);
  tY += 4;
  doc.setFont("helvetica", "normal");
  
  // Justify -> Left align
  doc.text(paymentContent, 10, tY, { maxWidth: 185, align: "left" });
  tY += paymentTextHeight + 2;

  // Only show Table 1 if NOT installment
  if (!isInstallment) {
      if (tY > 250) {
          doc.addPage();
          doc.rect(5, 5, 200, 287);
          tY = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text("Table 1", 10, tY + 4);
      tY += 6;
      doc.autoTable({
          startY: tY,
          head: [["Payment Schedule", "Amount"]],
          body: [
              ["Prior Approval Application", "INR 5,00,000/-"],
              ["Start of Manufacturing", "INR 20,00,000/-"],
              ["Before Dispatch", "Balance Amount"]
          ],
          theme: 'grid',
          tableWidth: 120,
          margin: { left: 10 },
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [220, 220, 220], textColor: black, fontStyle: 'bold' }
      });
      // @ts-ignore
      tY = doc.lastAutoTable.finalY + 8;
  } else {
      tY += 4;
  }

  // E. GST
  addPoint("E. PAYMENT OF GOODS & SERVICE TAX (GST):", "GST will be applicable on RFD at prevailing rates at the time of dispatch & GST rate is subject to change, any revisions will automatically be applied.");

  // F. INSPECTION
  addPoint("F. INSPECTION:", "Prior to dispatch, RFD shall be inspected by the Inspection Team and/or the Customer or its authorized representative to ensure compliance with the agreed specifications and quality standards. The inspection shall take place at the Repos’ facility, and the Customer shall have the right to verify RFD’s condition before acceptance. Any concerns or discrepancies identified during the inspection shall be addressed before shipment.");

  // G. WARRANTY
  addPoint("G. WARRANTY:", "The RFD is covered under a twelve (12) month warranty from the date of dispatch, against manufacturing and craftsmanship defects. This warranty does not cover any damages resulting from mishandling, physical damage due to accidents, operator negligence, improper maintenance, unauthorized modifications, or repairs attempted by any third party other than authorized representatives of Repos.\n\nOnce the RFD has been dispatched from Repos' facility or title has been transferred, Repos shall not be liable for any loss or damage.");

  // H. CUSTOMER SCOPE
  const customerScopeText = "1. Civil & Electrical Work: Any civil, electrical, or additional work required for the installation and functioning of the RFD shall be the sole responsibility of the Customer.\n2. Fraudulent Activities: Repos shall not be liable for any fraudulent activities conducted by the Customer in connection with any services provided through RFD.\n3. Additional Costs: The Customer shall bear all costs related to: a) transportation of RFD; b) Insurance; c) nozzle or any other yearly renewals;\n4. Unloading Responsibility: The Customer shall be responsible for unloading RFD at their designated site.\n5. Cancellation after invoicing incurs a cancellation fee. Repos may levy a fee on the Customer for cancellation of order post invoicing.\n6. Fuel Procurement and Quality/Quantity: The Customer shall be solely responsible for procuring High-Speed Diesel (HSD) from authorized Oil Marketing Companies (OMCs) , in compliance with all applicable laws and regulations. The Customer shall be exclusively liable to verify and ensure the quality and quantity of the HSD so procured. Repos shall have no responsibility or liability, whether direct or indirect, in relation to the procurement, quality, or quantity of the fuel purchased by the Customer, nor for any losses, claims, or damages arising therefrom.";
  addPoint("H. CUSTOMER SCOPE:", customerScopeText);

  // I. IP
  addPoint("I. INTELLECTUAL PROPERTIES (“IP”):", "All intellectual properties and proprietary technology of Company remains absolute property of the Company and under no condition the Customer shall have any right on the IP. The Customer shall not copy or reverse-engineer the RMD or any software.");

  // J. APPLICABILITY
  addPoint("J. APPLICABILITY OF TERMS AND CONDITIONS:", "Unless otherwise expressly agreed in writing, these Terms and Conditions shall apply to all contracts, and engagements between Customer and Repos for the sale of RFD and all related services provided by Repos, into which contracts are incorporated by reference.");

  doc.save(`${proposalNo}.pdf`);
};
