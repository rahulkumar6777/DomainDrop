import { LoaderCircle } from 'lucide-react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import SiteLayout from './components/SiteLayout.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import { useAuth } from './hooks/useAuth.js'
import {
  AboutPage,
  HomePage,
  NotFoundPage,
  PricingPage,
} from './pages/MarketingPages.jsx'
import DocsLayout from './features/developer/components/DocsLayout.jsx'
import ApiReferencePage from './features/developer/pages/ApiReferencePage.jsx'
import AuthenticationPage from './features/developer/pages/AuthenticationPage.jsx'
import DeliveryGuidePage from './features/developer/pages/DeliveryGuidePage.jsx'
import DocsOverviewPage from './features/developer/pages/DocsOverviewPage.jsx'
import LanguageExamplePage from './features/developer/pages/LanguageExamplePage.jsx'
import NodeSdkPage from './features/developer/pages/NodeSdkPage.jsx'
import QuickstartPage from './features/developer/pages/QuickstartPage.jsx'
import UploadGuidePage from './features/developer/pages/UploadGuidePage.jsx'
import {
  ForgotPasswordPage,
  LoginPage,
  ResetPasswordPage,
  SignupPage,
} from './pages/AuthPages.jsx'
import ApiKeysPage from './features/api-keys/ApiKeysPage.jsx'
import ApiKeyUsagePage from './features/api-keys/ApiKeyUsagePage.jsx'
import FilesPage from './features/files/FilesPage.jsx'
import OverviewPage from './features/overview/OverviewPage.jsx'
import SpacesPage from './features/spaces/SpacesPage.jsx'
import SettingsPage from './features/storage/SettingsPage.jsx'
import SessionsPage from './features/sessions/SessionsPage.jsx'
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

  return isAuthenticated ? <Navigate to="/app" replace /> : children
}

function ProtectedRoute() {
  const { isAuthenticated, isReady } = useAuth()
  const location = useLocation()

  if (!isReady) {
    return (
      <section className="auth-route-loading" role="status" aria-label="Checking session">
        <LoaderCircle className="spin" size={24} aria-hidden="true" />
      </section>
    )
  }

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="developer" element={<DocsLayout />}>
              <Route index element={<DocsOverviewPage />} />
              <Route path="quickstart" element={<QuickstartPage />} />
              <Route path="authentication" element={<AuthenticationPage />} />
              <Route path="guides/upload-files" element={<UploadGuidePage />} />
              <Route path="guides/file-delivery" element={<DeliveryGuidePage />} />
              <Route path="api/auth" element={<ApiReferencePage group="auth" />} />
              <Route path="api/spaces" element={<ApiReferencePage group="spaces" />} />
              <Route path="api/files" element={<ApiReferencePage group="files" />} />
              <Route path="api/storage" element={<ApiReferencePage group="storage" />} />
              <Route path="api/api-keys" element={<ApiReferencePage group="api-keys" />} />
              <Route path="sdk/node" element={<NodeSdkPage />} />
              <Route path="examples/:language" element={<LanguageExamplePage />} />
              <Route path="*" element={<Navigate to="/developer" replace />} />
            </Route>
            <Route path="about" element={<AboutPage />} />
            <Route
              path="login"
              element={
                <GuestOnlyRoute>
                  <LoginPage />
                </GuestOnlyRoute>
              }
            />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
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
          <Route element={<ProtectedRoute />}>
            <Route path="app" element={<AppLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="storage/files" element={<FilesPage />} />
              <Route path="storage/spaces" element={<SpacesPage />} />
              <Route path="developer/api-keys" element={<ApiKeysPage />} />
              <Route path="developer/api-keys/:apiKeyId/usage" element={<ApiKeyUsagePage />} />
              <Route path="settings/sessions" element={<SessionsPage />} />
              <Route path="settings/bucket" element={<SettingsPage />} />
              <Route path="files" element={<Navigate to="/app/storage/files" replace />} />
              <Route path="spaces" element={<Navigate to="/app/storage/spaces" replace />} />
              <Route path="api-keys" element={<Navigate to="/app/developer/api-keys" replace />} />
              <Route path="sessions" element={<Navigate to="/app/settings/sessions" replace />} />
              <Route path="settings" element={<Navigate to="/app/settings/bucket" replace />} />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
