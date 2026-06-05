# Thermal Printer Quick Start Guide

## 🖨️ Using Thermal Printer Labels

### Step 1: Select Thermal Format
In the print preview modal, choose from:
- **🖨️ Thermal 4-inch (101.6mm)** ← Most common
- **🖨️ Thermal 100mm × 50mm** ← Alternative size

### Step 2: Configure Your Printer

| Setting | Value |
|---------|-------|
| **Paper Size** | Continuous Feed |
| **Paper Width** | 101.6mm (4-inch) or 100mm |
| **Margins** | 0mm (None) |
| **Orientation** | Portrait |
| **Scale** | 100% |
| **Background** | Print backgrounds ON |

### Step 3: Print
Click "Print Sheet" button

---

## 📋 Label Specifications

| Property | Value |
|----------|-------|
| **Width** | 101.6mm (4-inch) or 100mm |
| **Height** | 50mm |
| **Feed Type** | Continuous |
| **Gap Between Labels** | 6mm |
| **Barcode Height** | 35px |
| **Orientation** | Portrait |

---

## ✅ What's Optimized for Thermal

✓ **Single column** - No side-by-side labels  
✓ **Vertical stacking** - One label per row  
✓ **No page breaks** - Continuous output  
✓ **Larger barcode** - Better scannability  
✓ **Compact fonts** - Fits thermal width  
✓ **Direct printing** - No scaling needed  

---

## 🖥️ Compatible Printers

- ✅ Zebra (ZP450, ZP505, ZE500, etc.)
- ✅ TSC (TTP-244, TTP-342, TTP-2410, etc.)
- ✅ XPrinter (XP-365B, XP-108B, XP-406B, etc.)
- ✅ AAON ALP-100
- ✅ Any standard 4-inch thermal printer

---

## 🔧 Browser Settings

### Chrome/Edge:
```
Device: [Select your thermal printer]
Paper size: Custom (101.6 x auto)
Orientation: Portrait
Margins: None
Scale: 100%
```

### Firefox:
```
Format: 101.6 mm × Auto
Orientation: Portrait
Margins: None
Scale: 100%
```

### Safari:
```
Paper size: Manage custom sizes → 101.6 × auto
Orientation: Portrait
Scale: 100%
```

---

## 📊 Layout Comparison

### Before (A4 Grid - 2×4)
```
[Label] [Label]
[Label] [Label]
[Label] [Label]
[Label] [Label]
```
- 210mm width (A4 width)
- 297mm height (A4 height)
- 8 labels per page
- Grid layout

### After (Thermal 4-inch)
```
[Label]
[Label]
[Label]
[Label]
[Label]
```
- 101.6mm width (4-inch width)
- Auto height (continuous)
- 1 label at a time (continuous feed)
- Single column layout

---

## 🚨 Troubleshooting

### Q: Labels are cutting off
**A:** Set margins to **0mm** in printer settings. Check paper width is **101.6mm**.

### Q: Barcode won't scan
**A:** Ensure printer DPI is **203 or higher**. Barcode is now 35px (larger).

### Q: Text is too small
**A:** This is intentional for thermal (space constraints). Use A4 format for larger text.

### Q: Pages breaking between labels
**A:** Use thermal format. A4 formats may break. Thermal format avoids page breaks.

### Q: Printer not appearing in list
**A:** Install printer drivers. Add printer to system first.

### Q: Different printer widths needed
**A:** Switch between thermal-4inch and thermal-100x50. Both in dropdown.

---

## 📌 Default Format

The system now defaults to **thermal-4inch**. To change back to A4:
1. Select **📄 A4 Sheet - 2x4 Grid (8 labels)** from dropdown
2. Or modify code: `setLabelLayoutFormat("grid-2x4")`

---

## 🎯 Typical Workflow

1. **Select orders** to print labels for
2. **Click "Print Labels"** button
3. **Format dropdown appears** - Thermal-4inch already selected
4. **Review preview** - Labels in single column
5. **Click "Print Sheet"**
6. **Browser print dialog** opens
7. **Select thermal printer**
8. **Click Print**

---

## 📦 Paper Requirements

- **Type**: Thermal transfer labels (no ink needed)
- **Size**: 101.6mm × 50mm (4" × 2")
- **Adhesive**: Strong (warehouse use)
- **Material**: Synthetic or paper
- **Quantity**: Usually sold in rolls of 500-1000

### Recommended Suppliers:
- Amazon (search "4 inch thermal labels")
- Uline.com
- eBay
- Local office supply stores
- Direct from printer manufacturers

**Common products:**
- Zebra Z-Select 4×2 Thermal Labels
- TSC TT Series Thermal Labels
- XPrinter Thermal Labels 101.6×50.8mm

---

## 💡 Tips & Tricks

### 1. Test Print First
Print 5-10 labels on test paper before main batch

### 2. Adjust Gap Size
If labels stick together, increase gap in CSS:
```css
gap: 8mm; /* Change from 6mm */
```

### 3. Barcode Testing
Always test barcode scans with your scanner before full deployment

### 4. Printer Maintenance
- Clean printer heads weekly
- Use correct DPI setting for your printer
- Store labels in cool, dry place

### 5. Batch Printing
Print in batches of 20-50 for best results

---

## 📞 Support Information

### Common Issues & Fixes:

| Issue | Fix |
|-------|-----|
| Crooked labels | Check paper alignment |
| Faded barcode | Increase print darkness |
| Shifted content | Check paper width setting |
| Slow printing | Lower DPI or reduce quality |
| Memory error | Print in smaller batches |

---

## 🔄 Switching Between Formats

**Thermal to A4:**
- Select any "📄 A4 Sheet" option from dropdown
- Labels will display in grid
- Print normally on A4 paper

**A4 to Thermal:**
- Select "🖨️ Thermal" option from dropdown
- Labels will display in single column
- Use thermal printer settings

---

## 📈 Performance Notes

**Print Speed** (approx):
- Thermal: 150mm/sec typical
- 100 labels: ~5-10 minutes

**Quality**:
- Thermal DPI: 203 DPI standard
- Barcode readability: Excellent
- Text clarity: Good

---

## ✨ What's New

### In This Release:
- ✅ Thermal printer support (4-inch)
- ✅ Single-column layout
- ✅ Optimized barcode size
- ✅ Continuous feed support
- ✅ No page breaks between labels
- ✅ Backwards compatible with A4

### Coming Soon:
- ⏳ 3-inch thermal format
- ⏳ 5-inch thermal format
- ⏳ Auto printer detection
- ⏳ Direct ESC/P commands

---

## 🎓 Educational Resources

### Thermal Printing Basics:
- Wikipedia: [Thermal Transfer](https://en.wikipedia.org/wiki/Thermal_transfer)
- DPI Explanation: Higher DPI = Sharper printing

### Barcode Standards:
- Code 128: Used in this system
- GS1 Standards: International barcode format

### Printer Specifications:
- Zebra: [ZP450 Spec Sheet](https://www.zebra.com/)
- TSC: [TTP-244 Spec Sheet](https://www.tsclabel.com/)

---

## 🔐 Quality Assurance

Before deploying to production:

- [ ] Test with actual thermal printer
- [ ] Verify barcode scans correctly
- [ ] Check label alignment
- [ ] Confirm paper width matches
- [ ] Print sample 50-label batch
- [ ] Verify no missed labels
- [ ] Check barcode readability at distance

---

## 📋 Checklist for Setup

### Hardware:
- [ ] Thermal printer installed
- [ ] Print drivers updated
- [ ] Test print successful
- [ ] Paper loaded correctly

### Software:
- [ ] System updated with thermal support
- [ ] Format dropdown shows thermal options
- [ ] Preview shows single-column layout
- [ ] Print button works

### Workflow:
- [ ] Team trained on thermal printing
- [ ] Paper stock ordered
- [ ] Printer maintenance schedule set
- [ ] Backup printer available

---

**Last Updated**: June 5, 2026  
**Version**: 1.0  
**Status**: Ready for Production  

For detailed technical documentation, see: **THERMAL_PRINTER_IMPLEMENTATION.md**
