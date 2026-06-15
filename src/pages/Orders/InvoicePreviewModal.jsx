import React, { useMemo } from "react";
import { X, Printer, Download } from "lucide-react";

// Indian Rupee number to words converter helper
function numberToWords(num) {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWordsLessThanThousand = (n) => {
        if (n === 0) return '';
        let str = '';
        if (n >= 100) {
            str += a[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 20) {
            str += b[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n > 0) {
            str += a[n] + ' ';
        }
        return str.trim();
    };

    const convert = (n) => {
        if (n === 0) return 'Zero';
        let words = '';
        const crores = Math.floor(n / 10000000);
        n %= 10000000;
        if (crores > 0) {
            words += numToWordsLessThanThousand(crores) + ' Crore ';
        }
        const lakhs = Math.floor(n / 100000);
        n %= 100000;
        if (lakhs > 0) {
            words += numToWordsLessThanThousand(lakhs) + ' Lakh ';
        }
        const thousands = Math.floor(n / 1000);
        n %= 1000;
        if (thousands > 0) {
            words += numToWordsLessThanThousand(thousands) + ' Thousand ';
        }
        if (n > 0) {
            words += numToWordsLessThanThousand(n);
        }
        return words.trim();
    };

    const parts = parseFloat(num).toFixed(2).split('.');
    const rupees = parseInt(parts[0], 10);
    const paise = parseInt(parts[1], 10);

    let result = convert(rupees) + ' Rupees';
    if (paise > 0) {
        result += ' And ' + convert(paise) + ' Paisa';
    } else {
        result += ' And Zero Paisa';
    }
    return result + ' Only';
}

// Simulated QR code component
const QRISvg = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29" style={{ width: "80px", height: "80px", display: "block" }}>
            <rect x="0" y="0" width="7" height="7" fill="black" />
            <rect x="1" y="1" width="5" height="5" fill="white" />
            <rect x="2" y="2" width="3" height="3" fill="black" />
            
            <rect x="22" y="0" width="7" height="7" fill="black" />
            <rect x="23" y="1" width="5" height="5" fill="white" />
            <rect x="24" y="2" width="3" height="3" fill="black" />
            
            <rect x="0" y="22" width="7" height="7" fill="black" />
            <rect x="1" y="23" width="5" height="5" fill="white" />
            <rect x="2" y="24" width="3" height="3" fill="black" />
            
            <rect x="18" y="18" width="5" height="5" fill="black" />
            <rect x="19" y="19" width="3" height="3" fill="white" />
            <rect x="20" y="20" width="1" height="1" fill="black" />
            
            <rect x="8" y="2" width="1" height="1" fill="black" />
            <rect x="10" y="0" width="2" height="1" fill="black" />
            <rect x="13" y="1" width="1" height="3" fill="black" />
            <rect x="15" y="0" width="3" height="1" fill="black" />
            <rect x="19" y="2" width="1" height="2" fill="black" />
            
            <rect x="8" y="4" width="3" height="1" fill="black" />
            <rect x="12" y="5" width="2" height="1" fill="black" />
            <rect x="16" y="4" width="1" height="3" fill="black" />
            
            <rect x="2" y="8" width="1" height="3" fill="black" />
            <rect x="4" y="9" width="3" height="1" fill="black" />
            <rect x="9" y="8" width="1" height="2" fill="black" />
            <rect x="11" y="9" width="2" height="2" fill="black" />
            <rect x="14" y="8" width="4" height="1" fill="black" />
            <rect x="20" y="8" width="2" height="1" fill="black" />
            
            <rect x="0" y="13" width="4" height="1" fill="black" />
            <rect x="5" y="14" width="1" height="2" fill="black" />
            <rect x="8" y="13" width="2" height="1" fill="black" />
            <rect x="12" y="12" width="1" height="4" fill="black" />
            <rect x="15" y="14" width="3" height="1" fill="black" />
            <rect x="19" y="13" width="2" height="2" fill="black" />
            <rect x="23" y="12" width="4" height="1" fill="black" />
            
            <rect x="2" y="18" width="2" height="2" fill="black" />
            <rect x="6" y="19" width="1" height="2" fill="black" />
            <rect x="9" y="18" width="1" height="1" fill="black" />
            <rect x="14" y="19" width="2" height="1" fill="black" />
            <rect x="25" y="18" width="2" height="1" fill="black" />
            
            <rect x="9" y="22" width="2" height="1" fill="black" />
            <rect x="12" y="24" width="3" height="1" fill="black" />
            <rect x="16" y="23" width="1" height="3" fill="black" />
            <rect x="24" y="25" width="3" height="1" fill="black" />
        </svg>
    );
};

function InvoicePreviewModal({ isOpen, order, onClose }) {
    if (!isOpen || !order) return null;

    // Retrieve order items dynamically
    const getItemsForOrder = (ord) => {
        const idNum = parseInt((ord.id || "").replace(/\D/g, "")) || 1234;
        const productsList = [
            { name: "Mr Muscle Kitchen Cleaner (Spray)", sku: "FRT-ANG-01", price: 120 },
            { name: "Dettol Antiseptic Liquid 250ml", sku: "DRY-MILK-02", price: 65 },
            { name: "Alphonso Mangoes Premium 1kg", sku: "FZN-FRIES-03", price: 180 },
            { name: "Organic Whole Milk 1L", sku: "FRT-AAPL-04", price: 60 },
            { name: "Paneer Block Fresh 200g", sku: "DRY-PANR-05", price: 85 }
        ];
        const selected = [];
        const count = ord.items || 1;
        for (let i = 0; i < count; i++) {
            const prod = productsList[(idNum + i) % productsList.length];
            selected.push({
                ...prod,
                qty: ((idNum + i) % 2) + 1
            });
        }
        return selected;
    };

    const rawItems = getItemsForOrder(order);

    // Calculate tax breakdowns dynamically so they sum exactly to order.amount
    const invoiceCalculations = useMemo(() => {
        const targetTotal = parseFloat((order.amount || "₹0").replace(/[^\d.]/g, '')) || 260.00;
        
        let sumPaidItems = 0;
        const processed = rawItems.map((item, idx) => {
            const isHighTax = !["Milk", "Paneer", "Dettol", "Liquid"].some(keyword => item.name.includes(keyword));
            const cgstPct = isHighTax ? 9.0 : 2.5;
            const sgstPct = isHighTax ? 9.0 : 2.5;
            const taxRate = (cgstPct + sgstPct) / 100;
            
            const gross = item.price * item.qty;
            const discount = (item.price > 100 ? 5.00 : 2.00) * item.qty;
            const paid = gross - discount;
            sumPaidItems += paid;

            const taxableValue = paid / (1 + taxRate);
            const cgstVal = (taxableValue * cgstPct) / 100;
            const sgstVal = (taxableValue * sgstPct) / 100;

            return {
                ...item,
                cgstPct,
                sgstPct,
                gross,
                discount,
                paid,
                taxableValue,
                cgstVal,
                sgstVal
            };
        });

        // Bridge difference using delivery charges
        const deliveryDiff = targetTotal - sumPaidItems;
        let deliveryTotal = 0;
        let deliveryTaxable = 0;
        let deliveryCgst = 0;
        let deliverySgst = 0;
        let deliveryTaxRate = 0.18; // 18% GST

        if (deliveryDiff > 0) {
            deliveryTotal = deliveryDiff;
            deliveryTaxable = deliveryTotal / (1 + deliveryTaxRate);
            deliveryCgst = (deliveryTaxable * 9.0) / 100;
            deliverySgst = (deliveryTaxable * 9.0) / 100;
        } else if (deliveryDiff < 0 && processed.length > 0) {
            // Adjust last item discount to match
            const last = processed[processed.length - 1];
            last.discount += Math.abs(deliveryDiff);
            last.paid = last.gross - last.discount;
            const taxRate = (last.cgstPct + last.sgstPct) / 100;
            last.taxableValue = last.paid / (1 + taxRate);
            last.cgstVal = (last.taxableValue * last.cgstPct) / 100;
            last.sgstVal = (last.taxableValue * last.sgstPct) / 100;
        }

        // Totals
        const totalQty = processed.reduce((sum, item) => sum + item.qty, 0);
        const totalTaxable = processed.reduce((sum, item) => sum + item.taxableValue, 0) + deliveryTaxable;
        const totalCgst = processed.reduce((sum, item) => sum + item.cgstVal, 0) + deliveryCgst;
        const totalSgst = processed.reduce((sum, item) => sum + item.sgstVal, 0) + deliverySgst;
        
        return {
            items: processed,
            deliveryTotal,
            deliveryTaxable,
            deliveryCgst,
            deliverySgst,
            totalQty,
            totalTaxable,
            totalCgst,
            totalSgst,
            targetTotal
        };
    }, [rawItems, order]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="invoice-modal-backdrop">
            {/* Modular styling specific to this invoice card */}
            <style>{`
                .invoice-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(8px);
                    z-index: 99999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    overflow-y: auto;
                    padding: 20px;
                    box-sizing: border-box;
                }

                .invoice-controls-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    max-width: 800px;
                    background-color: #0f172a;
                    padding: 12px 24px;
                    border-radius: 12px 12px 0 0;
                    box-sizing: border-box;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                .invoice-controls-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #94a3b8;
                    letter-spacing: 0.5px;
                }

                .invoice-controls-actions {
                    display: flex;
                    gap: 12px;
                }

                .invoice-btn-blue {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background-color: #1e60ff;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background-color 0.15s ease, transform 0.1s ease;
                    box-shadow: 0 4px 10px rgba(30, 96, 255, 0.25);
                }

                .invoice-btn-blue:hover {
                    background-color: #0c4ce0;
                    transform: translateY(-1px);
                }

                .invoice-btn-close {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background-color: #334155;
                    color: #cbd5e1;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background-color 0.15s ease;
                }

                .invoice-btn-close:hover {
                    background-color: #475569;
                    color: white;
                }

                .invoice-card-main {
                    background-color: white;
                    width: 100%;
                    max-width: 800px;
                    padding: 35px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
                    border-radius: 0 0 12px 12px;
                    box-sizing: border-box;
                    color: #000000;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
                    margin-bottom: 40px;
                }

                /* ─── Logo & Header ─── */
                .invoice-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 25px;
                }

                .invoice-logo-blue {
                    font-size: 36px;
                    font-weight: 900;
                    color: #1e60ff !important;
                    letter-spacing: -2px;
                    margin: 0;
                    line-height: 1;
                }

                .invoice-title-text {
                    font-size: 28px;
                    font-weight: 800;
                    color: #000000;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: -0.5px;
                }

                /* ─── Grid Panels ─── */
                .invoice-grid-box {
                    display: grid;
                    grid-template-columns: 1.8fr 1.2fr;
                    border: 1px solid #000000;
                    margin-bottom: 12px;
                }

                .invoice-grid-box.border-bottom-none {
                    border-bottom: none;
                }

                .grid-panel-left {
                    border-right: 1px solid #000000;
                    padding: 12px 15px;
                    box-sizing: border-box;
                }

                .grid-panel-right {
                    padding: 12px 15px;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    gap: 8px;
                }

                .panel-section-title {
                    background-color: #f1f5f9;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #000000;
                    padding: 4px 6px;
                    border: 1px solid #000000;
                    margin: -13px -16px 8px -16px;
                }

                .seller-name, .customer-name-bold {
                    font-size: 14px;
                    font-weight: 800;
                    margin: 0 0 6px 0;
                }

                .seller-details-text, .billing-details-text {
                    font-size: 11px;
                    line-height: 1.4;
                    color: #1e293b;
                    margin-bottom: 8px;
                }

                .seller-tax-labels {
                    font-size: 11px;
                    line-height: 1.5;
                }

                .seller-tax-labels div {
                    display: flex;
                    gap: 6px;
                }

                .seller-tax-labels strong {
                    width: 140px;
                    display: inline-block;
                }

                .meta-table-details {
                    font-size: 11px;
                    width: 100%;
                }

                .meta-table-details td {
                    padding: 4px 0;
                    vertical-align: top;
                }

                .meta-table-details td.label-td {
                    font-weight: 700;
                    width: 100px;
                }

                /* ─── Items Table ─── */
                .invoice-items-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #000000;
                    margin-bottom: 12px;
                    font-size: 10px;
                }

                .invoice-items-table th {
                    border: 1px solid #000000;
                    background-color: #f1f5f9;
                    font-weight: 800;
                    text-align: center;
                    padding: 6px 4px;
                    vertical-align: middle;
                }

                .invoice-items-table td {
                    border: 1px solid #000000;
                    padding: 8px 6px;
                    vertical-align: middle;
                }

                .invoice-items-table tr.total-row td {
                    font-weight: 800;
                    background-color: #f8fafc;
                }

                .text-center { text-align: center; }
                .text-right { text-align: right; }

                /* ─── Amount in Words ─── */
                .invoice-words-box {
                    border: 1px solid #000000;
                    padding: 10px 15px;
                    font-size: 11px;
                    margin-bottom: 12px;
                    background-color: #f8fafc;
                }

                /* ─── Declaration & Signatures ─── */
                .invoice-declaration-row {
                    display: grid;
                    grid-template-columns: 1.8fr 1.2fr;
                    border: 1px solid #000000;
                    margin-bottom: 12px;
                    height: 120px;
                }

                .dec-left {
                    border-right: 1px solid #000000;
                    padding: 12px 15px;
                    font-size: 10px;
                    line-height: 1.4;
                }

                .sig-right {
                    padding: 12px 15px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    align-items: center;
                    box-sizing: border-box;
                    position: relative;
                }

                .signature-graphic-line {
                    font-family: 'Cedarville Cursive', 'Brush Script MT', cursive;
                    font-size: 22px;
                    color: #1e40af;
                    margin-top: 10px;
                }

                .sig-label {
                    font-size: 10px;
                    font-weight: 700;
                    border-top: 1px dashed #475569;
                    width: 80%;
                    text-align: center;
                    padding-top: 4px;
                }

                /* ─── Reverse Charge & Terms ─── */
                .invoice-reverse-charge {
                    font-size: 11px;
                    font-weight: 700;
                    margin-bottom: 12px;
                }

                .invoice-terms-box {
                    font-size: 9px;
                    line-height: 1.4;
                    color: #334155;
                    margin-bottom: 20px;
                    border-bottom: 1px dashed #cbd5e1;
                    padding-bottom: 15px;
                }

                .invoice-terms-box h4 {
                    font-size: 10px;
                    font-weight: 800;
                    color: #000000;
                    margin: 0 0 6px 0;
                    text-transform: uppercase;
                }

                .invoice-terms-box ol {
                    margin: 0;
                    padding-left: 14px;
                }

                .invoice-terms-box li {
                    margin-bottom: 4px;
                }

                /* ─── Annexure Table ─── */
                .annexure-title {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    margin-bottom: 6px;
                }

                .invoice-annexure-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #000000;
                    font-size: 9px;
                }

                .invoice-annexure-table th {
                    border: 1px solid #000000;
                    background-color: #f1f5f9;
                    font-weight: 800;
                    text-align: center;
                    padding: 5px 4px;
                }

                .invoice-annexure-table td {
                    border: 1px solid #000000;
                    padding: 6px;
                }

                .invoice-annexure-table tr.total-row td {
                    font-weight: 800;
                    background-color: #f8fafc;
                }

                /* ═══════════════════════════════════════════════════════════════
                   CRITICAL PRINT LAYOUT MEDIA RULES
                   ═══════════════════════════════════════════════════════════════ */
                @media print {
                    body {
                        background: #ffffff !important;
                        color: #000000 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    #root,
                    .app-layout,
                    .sidebar,
                    .topbar,
                    .orders-modal-backdrop,
                    .preview-backdrop,
                    .confirm-modal-backdrop,
                    .global-dropdown-overlay,
                    .invoice-controls-top {
                        display: none !important;
                        visibility: hidden !important;
                    }

                    .invoice-modal-backdrop {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        background: #ffffff !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                        backdrop-filter: none !important;
                    }

                    .invoice-card-main {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                        max-width: none !important;
                        border-radius: 0 !important;
                    }
                }
            `}</style>

            {/* Modal Controls Bar */}
            <div className="invoice-controls-top print-btn-no-print">
                <span className="invoice-controls-title">haatza Invoice Command Center</span>
                <div className="invoice-controls-actions">
                    <button className="invoice-btn-blue" onClick={handlePrint}>
                        <Download size={15} />
                        <span>Download Invoice</span>
                    </button>
                    <button className="invoice-btn-close" onClick={onClose}>
                        <X size={15} />
                        <span>Close</span>
                    </button>
                </div>
            </div>

            {/* A4 Printable Invoice Sheet */}
            <div className="invoice-card-main">
                
                {/* Logo & Invoice Title */}
                <div className="invoice-header-row">
                    <div>
                        <h1 className="invoice-logo-blue">haatza</h1>
                    </div>
                    <div className="text-right">
                        <h2 className="invoice-title-text">Tax Invoice</h2>
                    </div>
                </div>

                {/* Sold By Info & QR Code Panel */}
                <div className="invoice-grid-box border-bottom-none">
                    <div className="grid-panel-left">
                        <div className="panel-section-title">Sold By / Seller</div>
                        <h4 className="seller-name">HAATZA COMMERCE PRIVATE LIMITED</h4>
                        <p className="seller-details-text">
                            BCPL - Bengaluru E-City Phase-2 E547<br />
                            ii, No. 177, Sallapuriaamma Complex, Sampige Nagar Road, Electronic City, Bengaluru, Karnataka 560100
                        </p>
                        <div className="seller-tax-labels">
                            <div><strong>GSTIN:</strong> <span>29AAFCG9846E1Z7</span></div>
                            <div><strong>FSSAI License Number:</strong> <span>11222302000037</span></div>
                            <div><strong>CIN:</strong> <span>U74140HR2015FTC055568</span></div>
                            <div><strong>PAN:</strong> <span>AAFCG9846E</span></div>
                        </div>
                    </div>
                    <div className="grid-panel-right" style={{ alignItems: "center", justifyContent: "center" }}>
                        <QRISvg />
                        <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#475569", marginTop: "6px" }}>
                            Invoice Number: C17569T26{order.id.replace(/\D/g, '') || "260056356"}
                        </span>
                    </div>
                </div>

                {/* Invoice To & Order Metadata Panel */}
                <div className="invoice-grid-box">
                    <div className="grid-panel-left">
                        <div className="panel-section-title">Invoice To</div>
                        <h4 className="customer-name-bold">{order.customer}</h4>
                        <p className="billing-details-text" style={{ margin: 0 }}>
                            {order.customer}, 303, SVR Agasthya, 41, daddy's gen main rd, Kammasandra,<br />
                            Electronic City, Bangalore, Glass Factory Layout, Electronic City, Bengaluru, Karnataka, 560100
                        </p>
                        <div style={{ fontSize: "11px", marginTop: "8px" }}>
                            <strong>Pin code:</strong> 560100 | <strong>State:</strong> Karnataka
                        </div>
                    </div>
                    <div className="grid-panel-right">
                        <table className="meta-table-details">
                            <tbody>
                                <tr>
                                    <td className="label-td">Order Id</td>
                                    <td>: {order.id}</td>
                                </tr>
                                <tr>
                                    <td className="label-td">Invoice Date</td>
                                    <td>: {order.date}</td>
                                </tr>
                                <tr>
                                    <td className="label-td">Place of Supply</td>
                                    <td>: Karnataka</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Items Description Table */}
                <table className="invoice-items-table">
                    <thead>
                        <tr>
                            <th>Sr. no</th>
                            <th>SKU</th>
                            <th>Item Description</th>
                            <th>MRP</th>
                            <th>Discount</th>
                            <th style={{ width: "30px" }}>Qty</th>
                            <th>Taxable Value</th>
                            <th>CGST (%)</th>
                            <th>CGST (INR)</th>
                            <th>SGST (%)</th>
                            <th>SGST (INR)</th>
                            <th>Cess (%)</th>
                            <th>Cess Val</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceCalculations.items.map((item, idx) => (
                            <React.Fragment key={idx}>
                                {/* Item Main Row */}
                                <tr>
                                    <td className="text-center">{idx + 1}</td>
                                    <td className="font-mono text-center">{item.sku}</td>
                                    <td>
                                        <strong>{item.name}</strong><br />
                                        <span style={{ fontSize: "8.5px", color: "#64748b" }}>[Bottle] (HSN-{item.cgstPct === 9.0 ? "34029091" : "30049069"})</span>
                                    </td>
                                    <td className="text-right">₹{item.price.toFixed(2)}</td>
                                    <td className="text-right">₹{item.discount.toFixed(2)}</td>
                                    <td className="text-center font-bold">{item.qty}</td>
                                    <td className="text-right">₹{item.taxableValue.toFixed(2)}</td>
                                    <td className="text-center">{(item.cgstPct).toFixed(2)}</td>
                                    <td className="text-right">₹{item.cgstVal.toFixed(2)}</td>
                                    <td className="text-center">{(item.sgstPct).toFixed(2)}</td>
                                    <td className="text-right">₹{item.sgstVal.toFixed(2)}</td>
                                    <td className="text-center">0.00</td>
                                    <td className="text-right">₹0.00</td>
                                    <td className="text-right font-bold">₹{item.paid.toFixed(2)}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                        
                        {/* Delivery Charges Sub-row */}
                        {invoiceCalculations.deliveryTotal > 0 && (
                            <tr>
                                <td className="text-center">-</td>
                                <td className="text-center" style={{ color: "#64748b" }}>-</td>
                                <td>
                                    <strong>Delivery and other charges</strong>
                                </td>
                                <td className="text-right">-</td>
                                <td className="text-right">-</td>
                                <td className="text-center">-</td>
                                <td className="text-right">₹{invoiceCalculations.deliveryTaxable.toFixed(2)}</td>
                                <td className="text-center">9.00</td>
                                <td className="text-right">₹{invoiceCalculations.deliveryCgst.toFixed(2)}</td>
                                <td className="text-center">9.00</td>
                                <td className="text-right">₹{invoiceCalculations.deliverySgst.toFixed(2)}</td>
                                <td className="text-center">0</td>
                                <td className="text-right">₹0.00</td>
                                <td className="text-right font-bold">₹{invoiceCalculations.deliveryTotal.toFixed(2)}</td>
                            </tr>
                        )}

                        {/* Grand Totals */}
                        <tr className="total-row">
                            <td colSpan="5">Total</td>
                            <td className="text-center">{invoiceCalculations.totalQty}</td>
                            <td className="text-right">₹{invoiceCalculations.totalTaxable.toFixed(2)}</td>
                            <td className="text-center">-</td>
                            <td className="text-right">₹{invoiceCalculations.totalCgst.toFixed(2)}</td>
                            <td className="text-center">-</td>
                            <td className="text-right">₹{invoiceCalculations.totalSgst.toFixed(2)}</td>
                            <td className="text-center">-</td>
                            <td className="text-right">₹0.00</td>
                            <td className="text-right">₹{invoiceCalculations.targetTotal.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Amount in Words */}
                <div className="invoice-words-box">
                    <strong>Amount in Words:</strong> {numberToWords(invoiceCalculations.targetTotal)}
                </div>

                {/* Corporate Info & Authorized Signatory */}
                <div className="invoice-declaration-row">
                    <div className="dec-left">
                        <strong>HAATZA COMMERCE PRIVATE LIMITED</strong><br />
                        <span style={{ fontSize: "8.5px" }}>(formerly known as Grofers India Private Limited)</span><br /><br />
                        <strong>GSTIN:</strong> 29AAFCG9846E1Z7 &nbsp;&nbsp;|&nbsp;&nbsp; <strong>FSSAI License Number:</strong> 10018064001545<br />
                        <strong>CIN:</strong> U74140HR2015FTC055568 &nbsp;&nbsp;|&nbsp;&nbsp; <strong>PAN:</strong> AAFCG9846E
                    </div>
                    <div className="sig-right">
                        <div className="signature-graphic-line">Amrit Lal</div>
                        <div className="sig-label">Authorised Signatory</div>
                    </div>
                </div>

                {/* Reverse Charge Notification */}
                <div className="invoice-reverse-charge">
                    Whether the tax is payable on reverse charge - No
                </div>

                {/* Terms and Conditions */}
                <div className="invoice-terms-box">
                    <h4>Terms & Conditions:</h4>
                    <ol>
                        <li>If you have any issues or queries in respect of your order, please contact customer chat support through Haatza platform or drop in email at support@haatza.com</li>
                        <li>In case you need to get more information about seller's or Haatza's FSSAI status, please visit https://foscos.fssai.gov.in/ and use the FBO search option with FSSAI License / Registration number.</li>
                        <li>Please note that we never ask for bank account details such as CVV, account number, UPI Pin, etc. across our support channels. For your safety please do not share these details with anyone over any medium.</li>
                        <li>MRP displayed on the platform is as printed on the product package. Actual MRP and amount payable may be a function of offers/ discounts and/ or the revised GST rates made effective by Govt. from 22 Sep 2025 onwards.</li>
                        <li>Delivery & other charges are ancillary to the principal supply of items/goods, wherever applicable.</li>
                    </ol>
                </div>

                {/* Annexure Details Table */}
                <div className="annexure-title">Annexure</div>
                <table className="invoice-annexure-table">
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>Nature of charge</th>
                            <th>Tax Rate (%)</th>
                            <th>Cess Rate (%)</th>
                            <th>Taxable Value</th>
                            <th>CGST (INR)</th>
                            <th>SGST (INR)</th>
                            <th>Cess (INR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="text-center">1</td>
                            <td>Handling charge</td>
                            <td className="text-center">18.00</td>
                            <td className="text-center">0.00</td>
                            <td className="text-right">₹{(invoiceCalculations.deliveryTaxable).toFixed(3)}</td>
                            <td className="text-right">₹{(invoiceCalculations.deliveryCgst).toFixed(3)}</td>
                            <td className="text-right">₹{(invoiceCalculations.deliverySgst).toFixed(3)}</td>
                            <td className="text-right">₹0.000</td>
                        </tr>
                        <tr>
                            <td className="text-center">2</td>
                            <td>Handling charge</td>
                            <td className="text-center">5.00</td>
                            <td className="text-center">0.00</td>
                            <td className="text-right">
                                ₹{invoiceCalculations.items
                                    .filter(item => item.cgstPct === 2.5)
                                    .reduce((sum, item) => sum + item.taxableValue, 0)
                                    .toFixed(3)}
                            </td>
                            <td className="text-right">
                                ₹{invoiceCalculations.items
                                    .filter(item => item.cgstPct === 2.5)
                                    .reduce((sum, item) => sum + item.cgstVal, 0)
                                    .toFixed(3)}
                            </td>
                            <td className="text-right">
                                ₹{invoiceCalculations.items
                                    .filter(item => item.cgstPct === 2.5)
                                    .reduce((sum, item) => sum + item.sgstVal, 0)
                                    .toFixed(3)}
                            </td>
                            <td className="text-right">₹0.000</td>
                        </tr>
                        <tr className="total-row">
                            <td colSpan="4" className="text-center">Total</td>
                            <td className="text-right">
                                ₹{(invoiceCalculations.deliveryTaxable + invoiceCalculations.items
                                    .filter(item => item.cgstPct === 2.5)
                                    .reduce((sum, item) => sum + item.taxableValue, 0)).toFixed(3)}
                            </td>
                            <td className="text-right">
                                ₹{(invoiceCalculations.deliveryCgst + invoiceCalculations.items
                                    .filter(item => item.cgstPct === 2.5)
                                    .reduce((sum, item) => sum + item.cgstVal, 0)).toFixed(3)}
                            </td>
                            <td className="text-right">
                                ₹{(invoiceCalculations.deliverySgst + invoiceCalculations.items
                                    .filter(item => item.cgstPct === 2.5)
                                    .reduce((sum, item) => sum + item.sgstVal, 0)).toFixed(3)}
                            </td>
                            <td className="text-right">₹0.000</td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </div>
    );
}

export default InvoicePreviewModal;
