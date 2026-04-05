import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@components/layout/Layout';
import { ProtectedRoute } from '@components/layout/ProtectedRoute';
import { AdminRoute } from '@components/layout/AdminRoute';
import { AdminLayout } from '@components/layout/AdminLayout';
import { ErrorBoundary } from '@components/ErrorBoundary';
import { OfflineBanner } from '@components/OfflineBanner';
import { ToastProvider } from '@components/ui/Toast';

import { LoginPage } from '@pages/LoginPage';
import { RegisterPage } from '@pages/RegisterPage';
import { ForgotPasswordPage } from '@pages/ForgotPasswordPage';
import { HomePage } from '@pages/HomePage';
import { CatalogPage } from '@pages/CatalogPage';
import { ProductPage } from '@pages/ProductPage';
import { CartPage } from '@pages/CartPage';
import { CheckoutPage } from '@pages/CheckoutPage';
import { CheckoutProcessingPage } from '@pages/CheckoutProcessingPage';
import { CheckoutSuccessPage } from '@pages/CheckoutSuccessPage';
import { CheckoutFailedPage } from '@pages/CheckoutFailedPage';
import { OrdersPage } from '@pages/OrdersPage';
import { OrderDetailPage } from '@pages/OrderDetailPage';
import { ProfilePage } from '@pages/ProfilePage';
import { WalletPage } from '@pages/WalletPage';
import { WishlistPage } from '@pages/WishlistPage';
import { SupportPage } from '@pages/SupportPage';
import { AboutPage } from '@pages/AboutPage';
import { ComparePage } from '@pages/ComparePage';
import { NotFoundPage } from '@pages/NotFoundPage';
import { ServerErrorPage } from '@pages/ServerErrorPage';
import { VerifyEmailPage } from '@pages/VerifyEmailPage';
import { ForbiddenPage } from '@pages/ForbiddenPage';
import { RateLimitedPage } from '@pages/RateLimitedPage';
import { AdminDashboardPage } from '@pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@pages/admin/AdminProductsPage';
import { AdminOrdersPage } from '@pages/admin/AdminOrdersPage';
import { AdminUsersPage } from '@pages/admin/AdminUsersPage';
import { AdminPromosPage } from '@pages/admin/AdminPromosPage';
import { AdminCategoriesPage } from '@pages/admin/AdminCategoriesPage';
import { AdminStatsPage } from '@pages/admin/AdminStatsPage';
import { AdminReviewsPage } from '@pages/admin/AdminReviewsPage';
import { AdminSettingsPage } from '@pages/admin/AdminSettingsPage';
import { BlogPage } from '@pages/BlogPage';
import { BlogArticlePage } from '@pages/BlogArticlePage';
import { FaqPage } from '@pages/FaqPage';
import { ContactPage } from '@pages/ContactPage';
import { PrivacyPage } from '@pages/PrivacyPage';
import { TermsPage } from '@pages/TermsPage';
import { ShippingPage } from '@pages/ShippingPage';
import { ReturnsPage } from '@pages/ReturnsPage';

import './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <ToastProvider>
            <OfflineBanner />
            <Routes>
              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />

              {/* Admin */}
              <Route element={<Layout />}>
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="promos" element={<AdminPromosPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="stats" element={<AdminStatsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
              </Route>

              {/* Main layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/catalog/:id" element={<ProductPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogArticlePage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/shipping" element={<ShippingPage />} />
                <Route path="/returns" element={<ReturnsPage />} />

                {/* Protected */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/processing"
                  element={
                    <ProtectedRoute>
                      <CheckoutProcessingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/success"
                  element={
                    <ProtectedRoute>
                      <CheckoutSuccessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/failed"
                  element={
                    <ProtectedRoute>
                      <CheckoutFailedPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/wallet"
                  element={
                    <ProtectedRoute>
                      <WalletPage />
                    </ProtectedRoute>
                  }
                />

                {/* System */}
                <Route path="/403" element={<ForbiddenPage />} />
                <Route path="/429" element={<RateLimitedPage />} />
                <Route path="/500" element={<ServerErrorPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </ToastProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
