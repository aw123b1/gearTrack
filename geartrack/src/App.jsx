import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ScannerPage from './pages/ScannerPage'
import ProductFormPage from './pages/ProductFormPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — wrapped in MainLayout (TopNavbar + BottomNav) */}
        <Route element={<MainLayout />}>
          <Route path="/"            element={<DashboardPage />} />
          <Route path="/scanner"     element={<ScannerPage />} />
          <Route path="/product/new" element={<ProductFormPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
