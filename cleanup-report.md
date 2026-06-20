# Codebase Cleanup Report: Unused & Duplicate Files

This report contains the list of orphan components, unused files, and duplicate assets identified during Phase 1 (Project Structure Analysis) of the codebase audit. As per the constraints of this audit, these files have been identified but **not deleted**, pending final manual verification.

---

## 1. Unused / Orphan Files

The following files under the `src/` directory are not imported by any reachable files starting from `main.jsx` and `App.jsx`:

| Path | Type | Category |
| :--- | :--- | :--- |
| `src/assets/favicon.svg` | SVG Image | Asset (Standard site favicon, referenced in `index.html`) |
| `src/components/common/DataUnavailable.jsx` | React Component | UI Component |
| `src/components/Roles/DeleteRoleModal.jsx` | React Component | Role Management UI Component |
| `src/components/Roles/EditRoleModal.jsx` | React Component | Role Management UI Component |
| `src/components/Roles/RoleCard.jsx` | React Component | Role Management UI Component |
| `src/hooks/usePagination.js` | Custom Hook | Pagination Utility Hook |
| `src/utils/qrcode.js` | JS Script | QR Code Generation Utility |

---

## 2. Duplicate Files (Identical Content Hashes)

We found identical duplicates of project tracking and test case spreadsheets under the `src/assets/project-tracker/` folder. The duplicate files can be safely consolidated into a single master file.

### Duplicate Group 1: Project Tracker CSVs
* `src/assets/project-tracker/HAATZA_Project_Tracker.csv` (MD5: identical to v2 & v3)
* `src/assets/project-tracker/HAATZA_Project_Tracker_v2.csv` (MD5: identical)
* `src/assets/project-tracker/HAATZA_Project_Tracker_v3.csv` (MD5: identical)

### Duplicate Group 2: Project Tracker Excel Spreadsheets
* `src/assets/project-tracker/HAATZA_Project_Tracker.xlsx` (MD5: identical to v2 & v3)
* `src/assets/project-tracker/HAATZA_Project_Tracker_v2.xlsx` (MD5: identical)
* `src/assets/project-tracker/HAATZA_Project_Tracker_v3.xlsx` (MD5: identical)

### Other Unused Tracker Attachments (Standalone Sheets)
* `src/assets/project-tracker/HAATZA_Test_Cases.csv`
* `src/assets/project-tracker/HAATZA_Test_Cases.xlsx`
