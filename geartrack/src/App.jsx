import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ScannerPage from './pages/ScannerPage'
import ProductFormPage from './pages/ProductFormPage'
import EmployeeManagementPage from './pages/EmployeeManagementPage'
import StoreSettingsPage from './pages/StoreSettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes — wrapped in ProtectedRoute + MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/"            element={<DashboardPage />} />
          <Route path="/scanner"     element={<ScannerPage />} />
          <Route path="/product/new" element={<ProductFormPage />} />
          <Route path="/employees"   element={<EmployeeManagementPage />} />
          <Route path="/settings"    element={<StoreSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
