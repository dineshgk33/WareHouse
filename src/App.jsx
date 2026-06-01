import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Orders from "./pages/Orders/OrdersPage.jsx";
import Products from "./pages/Products/ProductsPage.jsx";
import Inventory from "./pages/Inventory/InventoryPage.jsx";
import Analytics from "./pages/Analytics/AnalyticsPage.jsx";
import Customers from "./pages/Customers/CustomersPage.jsx";
import Billing from "./pages/Billing/BillingPage.jsx";
import Settings from "./pages/Settings/SettingsPage.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="products" element={<Products />} />
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