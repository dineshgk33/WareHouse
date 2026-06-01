import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Orders from "./pages/Orders/OrdersPage.jsx";
import Inventory from "./pages/Inventory/InventoryPage.jsx";
import Analytics from "./pages/Analytics/AnalyticsPage.jsx";
import Customers from "./pages/Customers/CustomersPage.jsx";
import Billing from "./pages/Billing/BillingPage.jsx";
import Settings from "./pages/Settings/SettingsPage.jsx";
import Darkhouses from "./pages/Darkhouses/DarkhousesPage.jsx";

// Catalog Module Sub-Pages
import CatalogProducts from "./pages/catalog/Products/ProductsPage.jsx";
import CatalogCategories from "./pages/catalog/Categories/CategoriesPage.jsx";
import CatalogBrands from "./pages/catalog/Brands/BrandsPage.jsx";
import CatalogAttributes from "./pages/catalog/Attributes/AttributesPage.jsx";
import CatalogVariants from "./pages/catalog/Variants/VariantsPage.jsx";
import CatalogPricing from "./pages/catalog/Pricing/PricingPage.jsx";
import CatalogMapping from "./pages/catalog/Mapping/MappingPage.jsx";
import CatalogBulkUpload from "./pages/catalog/BulkUpload/BulkUploadPage.jsx";
import CatalogMediaLibrary from "./pages/catalog/MediaLibrary/MediaLibraryPage.jsx";
import CatalogProductAudit from "./pages/catalog/ProductAudit/ProductAuditPage.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="darkhouses" element={<Darkhouses />} />
                    <Route path="orders" element={<Orders />} />
                    
                    {/* Catalog Module Routes */}
                    <Route path="catalog/products" element={<CatalogProducts />} />
                    <Route path="catalog/categories" element={<CatalogCategories />} />
                    <Route path="catalog/brands" element={<CatalogBrands />} />
                    <Route path="catalog/attributes" element={<CatalogAttributes />} />
                    <Route path="catalog/variants" element={<CatalogVariants />} />
                    <Route path="catalog/pricing" element={<CatalogPricing />} />
                    <Route path="catalog/mapping" element={<CatalogMapping />} />
                    <Route path="catalog/bulk-upload" element={<CatalogBulkUpload />} />
                    <Route path="catalog/media" element={<CatalogMediaLibrary />} />
                    <Route path="catalog/audit" element={<CatalogProductAudit />} />
                    
                    {/* Compatibility alias route */}
                    <Route path="products" element={<CatalogProducts />} />
                    
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="billing" element={<Billing />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;