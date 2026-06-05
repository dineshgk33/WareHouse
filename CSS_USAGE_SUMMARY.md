## CSS & JSX Property Usage Summary

### 📊 Quick Stats
✅ **Total CSS Classes Defined:** 160  
✅ **Classes Actually Used:** 113+ (including dynamic classes from utilities)  
⚠️ **Unused CSS Classes:** ~30 (after accounting for utility functions)  
⚠️ **Classes Missing from CSS:** ~15 (used in JSX but not defined)

---

### 🟢 CORRECTLY USED (No Action Needed)
- All `.orders-*` main styling classes
- All `.odt-*` table styling classes  
- All `.orders-stat-card` stats card classes
- Status pill classes (`.orders-pill*`) - via `statusUtils.js`
- Label styling classes (`.quick-commerce-label`, `.label-*`)
- Modal classes (`.orders-modal-*`)
- Pagination classes
- Bulk actions toolbar classes

---

### 🟡 UNUSED CSS (Can Be Removed or Fixed)

**Most Likely to Remove:**
1. **Avatar Colors (8 classes)** - May be defined but applied via inline styles
   - `.avatar-indigo`, `.avatar-teal`, `.avatar-rose`, `.avatar-amber`
   - `.avatar-violet`, `.avatar-sky`, `.avatar-green`, `.avatar-orange`

2. **Old Status Styles (5 classes)** - Replaced by new `.orders-pill` system
   - `.status-pending`, `.status-processing`, `.status-shipped`
   - `.status-delivered`, `.status-cancelled`

3. **Header Classes (7 classes)** - Replaced by different names
   - `.orders-page`, `.orders-page-header`, `.orders-page-title`
   - `.orders-page-title-block`, `.orders-page-icon-wrap`
   - `.orders-page-subtitle`, `.orders-page-ellipsis`

4. **Form/Select Classes (10 classes)** - Not used in modals
   - `.orders-select`, `.orders-select-wrap`, `.orders-select-icon`
   - `.orders-select-chevron`, `.orders-select--date`
   - `.orders-filters`, `.orders-page-number--active`

5. **Grid Classes (4 classes)** - Alternative layouts not in use
   - `.grid-1x1`, `.grid-1x2`, `.grid-2x2`, `.grid-3x4`

6. **Product Categories (5 classes)** - Not dynamically applied
   - `.category-dairy`, `.category-frozen`, `.category-fruits`
   - `.category-grocery`, `.category-vegetables`

7. **Other (3 classes)**
   - `.orders-status-pill`, `.orders-status-dot`, `.orders-tab--active`

---

### 🔴 CSS CLASSES MISSING FROM Orders.css (Added in JSX)

**Likely From Global CSS:**
- `.fade-in`, `.fade-in-up`, `.scale-up` (animations)
- `.toast-icon` (icon styling)

**Likely From Other Components:**
- `.global-action-dropdown`, `.global-dropdown-*` (from another component)
- `.adjust-explainer` (from ConfirmModal)

**Actually Missing:**
- `.orders-empty-state-container` - Used but not defined
- `.orders-header-left`, `.orders-header-right` - Used but not defined
- `.orders-toolbar-log-info` - Used but not defined
- `.dot-failed` - Used in delivery status but not in CSS
- `.odt-warehouse` - Table column styling
- `.horizontal`, `.vertical` - Map grid styling
- `.store`, `.rider-pin` - Map pin styling
- `.monospace`, `.font-mono`, `.bold`, `.highlight` - Text styling utilities

---

### 🛠️ Action Items

**Immediate (High Priority):**
1. ✅ Add missing classes to Orders.css:
   - `.orders-header-left` / `.orders-header-right`
   - `.orders-empty-state-container`
   - `.dot-failed`
   - Map-related classes (`.store`, `.rider-pin`, `.horizontal`, `.vertical`)

2. ⚠️ Review and fix avatar color application logic

3. ✅ Move global animations to global CSS file

**Short Term (Medium Priority):**
1. Remove 8 avatar color classes if not needed
2. Remove 5 old status classes (replaced by `.orders-pill`)
3. Remove 7 old header classes (replaced by new structure)
4. Remove 10 unused form/select classes
5. Consolidate grid layout classes

**Long Term (Low Priority):**
1. Document CSS class usage per component
2. Standardize naming conventions
3. Organize CSS into logical sections
4. Add CSS comments for complex selectors

---

### 📝 Files to Check/Update

| File | Action | Issue |
|------|--------|-------|
| [src/pages/Orders/OrdersPage.jsx](src/pages/Orders/OrdersPage.jsx) | Review | Avatar colors not applied as className |
| [src/utils/statusUtils.js](src/utils/statusUtils.js) | Check | Returns correct `orders-pill` classes ✅ |
| [src/pages/Orders/Orders.css](src/pages/Orders/Orders.css) | Update | Add missing classes, remove unused ones |
| [src/index.css](src/index.css) | Check | May contain global animations |
| [src/components/ConfirmModal/ConfirmModal.jsx](src/components/ConfirmModal/ConfirmModal.jsx) | Check | Source of `.adjust-explainer` |

---

### 💡 Key Insights

1. **Dynamic Classes Work Well** - Status utility functions return correct CSS classes
2. **Naming Inconsistency** - Old header classes exist alongside new ones
3. **Avatar Colors Issue** - Defined in CSS but stored in JS variables, not applied as classes
4. **Missing Grid Implementation** - Grid classes defined but print preview might use different approach
5. **Global CSS Leak** - Some global animation classes referenced but not checked

---

**Generated:** 2026-06-05  
**Analysis Tool:** analyze_css.js  
**Report:** CSS_JSX_ANALYSIS_REPORT.md
