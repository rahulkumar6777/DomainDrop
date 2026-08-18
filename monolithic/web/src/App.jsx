import { LoaderCircle } from 'lucide-react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import SiteLayout from './components/SiteLayout.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import { useAuth } from './hooks/useAuth.js'
import {
  AboutPage,
  DeveloperPage,
  HomePage,
  NotFoundPage,
  PricingPage,
} from './pages/MarketingPages.jsx'
import { LoginPage, SignupPage } from './pages/AuthPages.jsx'
import './App.css'

function GuestOnlyRoute({ children }) {
  const { isAuthenticated, isReady } = useAuth()

  if (!isReady) {
    return (
      <section className="auth-route-loading" role="status" aria-label="Checking session">
        <LoaderCircle className="spin" size={24} aria-hidden="true" />
      </section>
    )
  }

  return isAuthenticated ? <Navigate to="/developer" replace /> : children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="developer" element={<DeveloperPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route
              path="login"
              element={
                <GuestOnlyRoute>
                  <LoginPage />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="signup"
              element={
                <GuestOnlyRoute>
                  <SignupPage />
                </GuestOnlyRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
