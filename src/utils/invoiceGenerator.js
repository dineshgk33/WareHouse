import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getQRCodeMatrix } from "./qrcode";

// Products pool for generating deterministic items based on Order ID
const PRODUCTS_POOL = [
    { name: "Mr Muscle Kitchen Cleaner (Spray) (Bottle)", sku: "8904271201147", hsn: "34029091", mrp: 99.00, discount: 3.00, gstRate: 18 },
    { name: "Dettol Antiseptic Liquid - 250ml(Pack)", sku: "8901396350309", hsn: "30049099", mrp: 159.37, discount: 0.37, gstRate: 5 },
    { name: "Fresh Alphonso Mangoes - 1kg", sku: "8901234560012", hsn: "08045020", mrp: 180.00, discount: 10.00, gstRate: 0 },
    { name: "Amul Taaza Toned Milk - 1L", sku: "8901262010125", hsn: "04012000", mrp: 66.00, discount: 2.00, gstRate: 0 },
    { name: "Lay's Classic Salted Chips - 50g", sku: "8901491321015", hsn: "20052000", mrp: 20.00, discount: 0.00, gstRate: 12 },
    { name: "Coca-Cola Zero Sugar - 320ml", sku: "8901764012012", hsn: "22021010", mrp: 40.00, discount: 1.00, gstRate: 18 },
    { name: "McCain French Fries - 450g", sku: "8901982030124", hsn: "20041000", mrp: 110.00, discount: 5.00, gstRate: 12 }
];

// Helper to convert number to words in Indian Rupees
const numberToWords = (num) => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numString = num.toFixed(2);
    if (parseFloat(numString) === 0) return 'Zero';

    const parts = numString.split('.');
    const rupees = parseInt(parts[0], 10);
    const paisa = parts[1] ? parseInt(parts[1].substring(0, 2), 10) : 0;

    const convertLessThanThousand = (n) => {
        if (n < 20) return a[n];
        const digit = n % 10;
        return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
    };

    const convert = (n) => {
        if (n === 0) return '';
        let word = '';
        
        if (n >= 10000000) {
            word += convert(Math.floor(n / 10000000)) + ' Crore ';
            n %= 10000000;
        }
        
        if (n >= 100000) {
            word += convert(Math.floor(n / 100000)) + ' Lakh ';
            n %= 100000;
        }
        
        if (n >= 1000) {
            word += convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand ';
            n %= 1000;
        }
        
        if (n >= 100) {
            word += convertLessThanThousand(Math.floor(n / 100)) + ' Hundred ';
            n %= 100;
        }
        
        if (n > 0) {
            if (word !== '') word += 'and ';
            word += convertLessThanThousand(n);
        }
        
        return word.trim();
    };

    let result = convert(rupees) + ' Rupees';
    if (paisa > 0) {
        result += ' and ' + convertLessThanThousand(paisa) + ' Paisa';
    } else {
        result += ' and Zero Paisa';
    }
    return result + ' Only';
};

// Draw a real vector-based QR Code offline-ready
const drawQRCode = (doc, x, y, size, text) => {
    // Outer border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);
    doc.rect(x, y, size, size);
    
    try {
        const matrix = getQRCodeMatrix(text, 'M');
        if (!matrix || matrix.length === 0) {
            return;
        }
        
        const modules = matrix.length;
        // Leave a small 1mm border for scan margin
        const innerSize = size - 2;
        const mSize = innerSize / modules;
        const startX = x + 1;
        const startY = y + 1;
        
        doc.setFillColor(0, 0, 0);
        for (let row = 0; row < modules; row++) {
            for (let col = 0; col < modules; col++) {
                if (matrix[row][col]) {
                    // Small overlap factor of 0.02 to avoid thin white lines in PDF rendering
                    doc.rect(startX + col * mSize, startY + row * mSize, mSize + 0.02, mSize + 0.02, "F");
                }
            }
        }
    } catch (e) {
        console.error("Failed to draw QR code on doc:", e);
    }
};

// Generates the jsPDF Document object representing the Blinkit-style Tax Invoice
export const generateInvoicePDF = (order) => {
    // Initialize PDF document (A4 page, Portrait, millimeters)
    const doc = new jsPDF("p", "mm", "a4");
    
    // Colors
    const BLACK = [0, 0, 0];
    const GRAY = [80, 80, 80];
    
    // Margins and width
    const margin = 12;
    const contentWidth = 210 - margin * 2; // 186mm
    
    // ─── 1. HEADER SECTION (Blinkit Branding) ──────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(30, 96, 255); // Haatza Royal Blue (#1e60ff)
    doc.text("HAATZA", margin, 18);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.text("Tax Invoice", 210 - margin - 42, 18);
    
    // ─── 2. SELLER & INVOICE META BLOCK (Boxed Grid Layout) ──────────────────────
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);
    
    // Outer Box for Seller Details and Invoice Info
    doc.rect(margin, 24, contentWidth, 38);
    // Vertical Divider
    doc.line(margin + 115, 24, margin + 115, 62);
    
    // Left Side - Seller Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.text("Sold By / Seller", margin + 3, 29);
    
    doc.text("HAATZA COMMERCE PRIVATE LIMITED", margin + 3, 33);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text("HCPL - Bengaluru Central Hub, Building C-2, Outer Ring Road,", margin + 3, 37);
    doc.text("Mahadevapura, Bengaluru, Karnataka, 560048", margin + 3, 40.5);
    doc.text("", margin + 3, 44); // Empty line spacer to match structure
    
    // Credentials labels
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.text("GSTIN", margin + 3, 49.5);
    doc.text("FSSAI License Number", margin + 3, 52.8);
    doc.text("CIN", margin + 3, 56.1);
    doc.text("PAN", margin + 3, 59.4);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.text(":  29AAFCG9846E1Z7", margin + 35, 49.5);
    doc.text(":  11222302000097", margin + 35, 52.8);
    doc.text(":  U74140KA2024PTC182391", margin + 35, 56.1);
    doc.text(":  AAFCG9846E", margin + 35, 59.4);
    
    // Right Side - QR Code and Invoice Metadata
    const qrSize = 20;
    const qrX = margin + 125;
    
    // Dynamic network IP detection for developer environment QR scanner scans
    let origin = "https://haatza.com";
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        const port = window.location.port;
        if (hostname === "localhost" || hostname === "127.0.0.1") {
            /* global __LOCAL_IP__ */
            const localIp = typeof __LOCAL_IP__ !== "undefined" ? __LOCAL_IP__ : "localhost";
            origin = `http://${localIp}${port ? ":" + port : ""}`;
        } else {
            origin = window.location.origin;
        }
    }
    
    const orderIdNum = order.id.replace(/\D/g, "") || "8821";
    const qrUrl = `${origin}/orders/download-pdf/${orderIdNum}`;
    drawQRCode(doc, qrX, 27, qrSize, qrUrl);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.text(`Invoice Number : C${orderIdNum}T2600${orderIdNum}`, margin + 118, 54);
    
    // ─── 3. BUYER DETAILS & ORDER INFO (Boxed Grid Layout) ──────────────────────
    const buyerY = 66;
    doc.rect(margin, buyerY, contentWidth, 27);
    // Vertical Divider
    doc.line(margin + 115, buyerY, margin + 115, buyerY + 27);
    
    // Left Side - Buyer Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Invoice To", margin + 3, buyerY + 4.5);
    doc.text("Name", margin + 3, buyerY + 8.5);
    doc.text("Address", margin + 3, buyerY + 12.5);
    
    const addressLine1 = `${order.customer}, Flat ${100 + (parseInt(orderIdNum) % 400)}, Block ${order.initials || "C"}, Green Meadows,`;
    const addressLine2 = `Koramangala 3rd Block, Near Central Park, Bengaluru, Karnataka`;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(`:  ${order.customer}`, margin + 18, buyerY + 8.5);
    doc.text(`:  ${addressLine1}`, margin + 18, buyerY + 12.5);
    doc.text(addressLine2, margin + 21, buyerY + 16);
    
    doc.setFont("helvetica", "bold");
    doc.text("Pin code", margin + 3, buyerY + 20);
    doc.text("State", margin + 3, buyerY + 23.5);
    doc.setFont("helvetica", "normal");
    doc.text(`:  560034`, margin + 18, buyerY + 20);
    doc.text(`:  Karnataka`, margin + 18, buyerY + 23.5);
    
    // Right Side - Order Info
    doc.setFont("helvetica", "bold");
    doc.text("Order Id", margin + 118, buyerY + 6.5);
    doc.text("Invoice Date", margin + 118, buyerY + 11.5);
    doc.text("Place of Supply", margin + 118, buyerY + 16.5);
    
    doc.setFont("helvetica", "normal");
    doc.text(`:  ${orderIdNum}`, margin + 142, buyerY + 6.5);
    doc.text(`:  ${order.date || "14-May-2026"}`, margin + 142, buyerY + 11.5);
    doc.text(`:  Karnataka`, margin + 142, buyerY + 16.5);
    
    // ─── 4. PRODUCT DETAILS TABLE (Blinkit Style with GST Splits & Cess) ─────────
    const grandTotal = parseFloat(order.amount.replace(/[^\d.]/g, "")) || 100.00;
    const itemsCount = order.items || 1;
    
    // Distribute total value among items
    const itemTotals = [];
    if (itemsCount === 1) {
        itemTotals.push(grandTotal);
    } else {
        const baseShare = Math.floor((grandTotal / itemsCount) * 100) / 100;
        let sum = 0;
        for (let i = 0; i < itemsCount - 1; i++) {
            itemTotals.push(baseShare);
            sum += baseShare;
        }
        itemTotals.push(parseFloat((grandTotal - sum).toFixed(2)));
    }
    
    const rows = [];
    let totalTaxableValue = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalQuantity = 0;
    
    // Annexure summaries mapping
    const annexureSummary = {};
    
    for (let i = 0; i < itemsCount; i++) {
        const total = itemTotals[i];
        const prodIndex = (parseInt(orderIdNum) + i) % PRODUCTS_POOL.length;
        const product = PRODUCTS_POOL[prodIndex];
        
        const gstRate = product.gstRate;
        const cgstPct = gstRate / 2;
        const sgstPct = gstRate / 2;
        const discount = product.discount;
        
        // 3% of the total amount goes to simulated delivery and other charges (Blinkit style)
        const deliveryTotal = parseFloat((total * 0.03).toFixed(2));
        const itemTotal = parseFloat((total - deliveryTotal).toFixed(2));
        
        // Item tax computations
        const itemTaxable = itemTotal / (1 + gstRate / 100);
        const itemGst = itemTotal - itemTaxable;
        const itemCgst = itemGst / 2;
        const itemSgst = itemGst / 2;
        const itemMrp = itemTotal + discount;
        
        // Delivery tax computations
        const dlvTaxable = deliveryTotal / (1 + gstRate / 100);
        const dlvGst = deliveryTotal - dlvTaxable;
        const dlvCgst = dlvGst / 2;
        const dlvSgst = dlvGst / 2;
        
        // Accumulate totals
        totalTaxableValue += itemTaxable + dlvTaxable;
        totalCGST += itemCgst + dlvCgst;
        totalSGST += itemSgst + dlvSgst;
        totalQuantity += 1;
        
        // Store for Annexure
        if (!annexureSummary[gstRate]) {
            annexureSummary[gstRate] = { taxable: 0, cgst: 0, sgst: 0 };
        }
        annexureSummary[gstRate].taxable += dlvTaxable;
        annexureSummary[gstRate].cgst += dlvCgst;
        annexureSummary[gstRate].sgst += dlvSgst;
        
        // Item Main Row
        rows.push([
            (i + 1).toString(),
            product.sku,
            `${product.name}\n(HSN: ${product.hsn})`,
            itemMrp.toFixed(2),
            discount.toFixed(2),
            "1",
            itemTaxable.toFixed(2),
            cgstPct > 0 ? `${cgstPct}%` : "0%",
            itemCgst.toFixed(2),
            sgstPct > 0 ? `${sgstPct}%` : "0%",
            itemSgst.toFixed(2),
            "0.00%",
            "0.00",
            itemTotal.toFixed(2)
        ]);
        
        // Item Delivery Charges Sub-row
        rows.push([
            "-",
            "-",
            "  Delivery and other charges",
            "-",
            "-",
            "-",
            dlvTaxable.toFixed(2),
            cgstPct > 0 ? `${cgstPct}%` : "0%",
            dlvCgst.toFixed(2),
            sgstPct > 0 ? `${sgstPct}%` : "0%",
            dlvSgst.toFixed(2),
            "0.00%",
            "0.00",
            deliveryTotal.toFixed(2)
        ]);
    }
    
    // Grand Total Row
    rows.push([
        "Total",
        "",
        "",
        "",
        "",
        totalQuantity.toString(),
        totalTaxableValue.toFixed(2),
        "",
        totalCGST.toFixed(2),
        "",
        totalSGST.toFixed(2),
        "",
        "0.00",
        grandTotal.toFixed(2)
    ]);
    
    // Draw product details grid table
    autoTable(doc, {
        startY: 97,
        head: [
            [
                "Sr. no",
                "UPC",
                "Item Description",
                "MRP",
                "Discount",
                "Qty",
                "Taxable Value",
                "CGST (%)",
                "CGST (INR)",
                "SGST (%)",
                "SGST (INR)",
                "Cess (%)",
                "Additional Cess Val",
                "Total"
            ]
        ],
        body: rows,
        theme: "grid",
        styles: {
            fontSize: 6.2,
            font: "helvetica",
            cellPadding: 1,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            textColor: [0, 0, 0]
        },
        headStyles: {
            fillColor: [255, 255, 255],
            fontStyle: "bold",
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.1
        },
        columnStyles: {
            0: { halign: "center", cellWidth: 8 },
            1: { halign: "center", cellWidth: 18 },
            2: { halign: "left", cellWidth: 44 },
            3: { halign: "right", cellWidth: 11 },
            4: { halign: "right", cellWidth: 11 },
            5: { halign: "center", cellWidth: 7 },
            6: { halign: "right", cellWidth: 15 },
            7: { halign: "center", cellWidth: 10 },
            8: { halign: "right", cellWidth: 12 },
            9: { halign: "center", cellWidth: 10 },
            10: { halign: "right", cellWidth: 12 },
            11: { halign: "center", cellWidth: 8 },
            12: { halign: "right", cellWidth: 10 },
            13: { halign: "right", fontStyle: "bold", cellWidth: 10 }
        },
        didParseCell: (data) => {
            // style footer total row
            if (data.row.index === rows.length - 1) {
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.fillColor = [240, 240, 240];
            }
        }
    });
    
    // ─── 5. TOTALS AND WRITTEN AMOUNT SECTION ──────────────────────────────────
    let currentY = doc.lastAutoTable.finalY + 4;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.text("Amount in Words:", margin, currentY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const amountWords = numberToWords(grandTotal);
    doc.text(amountWords, margin + 28, currentY);
    
    currentY += 4;
    
    // ─── 6. FOOTER AUTHORIZED SIGNATORY BLOCK ────────────────────────────────────
    doc.rect(margin, currentY, contentWidth, 23);
    doc.line(margin + 120, currentY, margin + 120, currentY + 23);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("Haatza Commerce Private Limited (formerly known as Haatza Logistics Private Limited)", margin + 3, currentY + 4);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text("GSTIN  : 29AAFCG9846E1Z7   |   FSSAI License Number : 11222302000097", margin + 3, currentY + 9);
    doc.text("CIN      : U74140KA2024PTC182391   |   PAN : AAFCG9846E", margin + 3, currentY + 14);
    
    // Signature block on the right
    doc.setFont("helvetica", "italic");
    doc.setFontSize(13);
    doc.setTextColor(30, 96, 255); // Haatza Royal Blue
    doc.text("Vignesh S", margin + 135, currentY + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.line(margin + 124, currentY + 14, margin + 180, currentY + 14);
    doc.text("Authorised Signatory", margin + 136, currentY + 18);
    
    currentY += 25;
    
    // ─── 7. REVERSE CHARGE STATEMENT ─────────────────────────────────────────────
    doc.rect(margin, currentY, contentWidth, 5.5);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.text("Whether the tax is payable on reverse charge - No", margin + 3, currentY + 3.8);
    
    currentY += 7.5;
    
    // ─── 8. TERMS & CONDITIONS (Blinkit Exact Content) ──────────────────────────
    doc.rect(margin, currentY, contentWidth, 31);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.text("Terms & Conditions:", margin + 3, currentY + 4);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text("1. If you have any issues or queries in respect of your order, please contact customer chat support through Haatza platform or drop an email at info@haatza.com", margin + 3, currentY + 8.5);
    doc.text("2. In case you need to get more information about seller's or Haatza's FSSAI status, please visit https://foscos.fssai.gov.in/ and use the FBO search option with FSSAI License / Registration number.", margin + 3, currentY + 12.5);
    doc.text("3. Please note that we never ask for bank account details such as CVV, account number, UPI Pin, etc. across our support channels. For your safety please do not share these details with anyone over any medium.", margin + 3, currentY + 16.5);
    doc.text("4. MRP displayed on the platform is as printed on the product package. Actual MRP and amount payable may be a function of offers/ discounts and/ or the revised GST rates made effective by Govt. from 22 Sep 2025 onwards.", margin + 3, currentY + 20.5);
    doc.text("5. Delivery & other charges are ancillary to the principal supply of items/goods, wherever applicable.", margin + 3, currentY + 24.5);
    
    currentY += 33.5;
    
    // ─── 9. ANNEXURE TABLE (Tax Rates Details Summary) ──────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.text("Annexure", margin, currentY);
    
    // Build Annexure rows data
    const annexureRows = [];
    let sNo = 1;
    let annexureTotalTaxable = 0;
    let annexureTotalCgst = 0;
    let annexureTotalSgst = 0;
    
    Object.keys(annexureSummary).forEach(rate => {
        const r = parseFloat(rate);
        const data = annexureSummary[rate];
        
        annexureTotalTaxable += data.taxable;
        annexureTotalCgst += data.cgst;
        annexureTotalSgst += data.sgst;
        
        annexureRows.push([
            (sNo++).toString(),
            `Handling / Delivery charge (${r}% GST)`,
            `${r}%`,
            "0.00%",
            data.taxable.toFixed(3),
            data.cgst.toFixed(3),
            data.sgst.toFixed(3),
            "0.000"
        ]);
    });
    
    annexureRows.push([
        "Total",
        "",
        "",
        "",
        annexureTotalTaxable.toFixed(3),
        annexureTotalCgst.toFixed(3),
        annexureTotalSgst.toFixed(3),
        "0.000"
    ]);
    
    autoTable(doc, {
        startY: currentY + 2.5,
        head: [
            ["S.No.", "Nature of charge", "Tax Rate", "Cess Rate", "Taxable Value", "CGST", "SGST", "Cess"]
        ],
        body: annexureRows,
        theme: "grid",
        styles: {
            fontSize: 6.2,
            font: "helvetica",
            cellPadding: 1,
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
            textColor: [0, 0, 0]
        },
        headStyles: {
            fillColor: [255, 255, 255],
            fontStyle: "bold",
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0],
            lineWidth: 0.1
        },
        columnStyles: {
            0: { halign: "center", cellWidth: 10 },
            1: { halign: "left", cellWidth: 50 },
            2: { halign: "center", cellWidth: 16 },
            3: { halign: "center", cellWidth: 18 },
            4: { halign: "right", cellWidth: 24 },
            5: { halign: "right", cellWidth: 22 },
            6: { halign: "right", cellWidth: 22 },
            7: { halign: "right", cellWidth: 24 }
        },
        didParseCell: (data) => {
            // Style footer total row
            if (data.row.index === annexureRows.length - 1) {
                data.cell.styles.fontStyle = "bold";
                data.cell.styles.fillColor = [240, 240, 240];
            }
        }
    });
    
    return doc;
};

// Generates the PDF blob URL for rendering inside iframe preview
export const generateInvoiceBlobUrl = (order) => {
    const doc = generateInvoicePDF(order);
    const blob = doc.output("blob");
    return URL.createObjectURL(blob);
};

// Triggers PDF file download directly (with fallback for mobile browsers)
export const downloadInvoicePDF = (order) => {
    const doc = generateInvoicePDF(order);
    const fileName = `Invoice_${order.id.replace("#", "")}.pdf`;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        const blob = doc.output("blob");
        const blobUrl = URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, "_blank");
        if (!newWindow) {
            doc.save(fileName);
        }
    } else {
        doc.save(fileName);
    }
};

// Triggers PDF printing
export const printInvoicePDF = (order) => {
    const doc = generateInvoicePDF(order);
    doc.autoPrint();
    const blob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = pdfUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(pdfUrl);
        }, 5000);
    };
};
