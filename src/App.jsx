import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import PremierLogin from './UserRegistration/Login';
import PremierRegistration from './UserRegistration/RegistrationScreen';
import PremierLegalPages from './UserRegistration/TermsAndPrivacy';
import PremierNavbar from './Navigation/Navbar';
import HomePage from './Homepage/HomePage';
import Products from './ProductsPage/Products';
import GoogleSuccess from './UserRegistration/GoogleSuccess';
import BannerPage from './AdminPages/BannerManagement/BannerPage';
import CategoryPage from './AdminPages/CategoryManagement/CategoryPage';
import ProductPage from './AdminPages/ProductManagement/ProductPage';
import Cart from './components/Cart';
import SuperAdminBannerPage from './SuperAdminPages/BannerMangement/BannerPage';
import SuperAdminStorePage from './SuperAdminPages/StoreManagement/StorePage';
import SuperAdminCategoryPage from './SuperAdminPages/CategoryManagement/CategoryPage';
import SuperAdminProductPage from './SuperAdminPages/ProductManagement/ProductPage';
import CheckoutPage from './components/CheckoutPage';
import Addresses from './UserPages/Addresses';
import OrderConfirmation from './components/OrderConfirmation';
import ViewOrdersPage from './UserPages/ViewOrdersPage';
import OrderDetailsPage from './UserPages/OrderDetailsPage';
import OrderReceiptPage from './UserPages/OrderReceiptPage';
import WishlistPage from './ProductsPage/components/WishlistPage';
import { WishlistProvider } from './context/WishlistContext';
import OrderTracking from './UserPages/OrderTracking';

// Placeholder components for Orders and Reviews
const Reviews = () => <div className="p-8 text-2xl">Your Reviews (Coming Soon)</div>;

// Layout to conditionally show Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Hide navbar for login, register, legal pages, all admin, superAdmin, and user panel routes
  const hideNavbar =
    ['/login', '/register', '/privacy', '/terms'].includes(location.pathname) ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/superAdmin') ||
    location.pathname.startsWith('/user');
  
  return (
    <>
      {!hideNavbar && <PremierNavbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/login" element={<PremierLogin />} />
                <Route path="/register" element={<PremierRegistration />} />
                <Route path="/terms" element={<PremierLegalPages />} />
                <Route path="/privacy" element={<PremierLegalPages />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/products/*" element={<Products />} />
                <Route path="/google-success" element={<GoogleSuccess />} />
                <Route path="/admin/banners" element={<BannerPage />} />
                <Route path="/superAdmin/stores" element={<SuperAdminStorePage />} />
                <Route path="/superAdmin/banners" element={<SuperAdminBannerPage />} />
                <Route path="/superAdmin/categories" element={<SuperAdminCategoryPage />} />
                <Route path="/superAdmin/products" element={<SuperAdminProductPage />} />
                <Route path="/admin/categories" element={<CategoryPage />} />
                <Route path="/admin/products" element={<ProductPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />

                {/* User routes */}
                <Route path="/user/addresses" element={<Addresses />} />
                <Route path="/user/orders" element={<ViewOrdersPage />} />
                <Route path="/user/orders/:orderId" element={<OrderDetailsPage />} />
                <Route path="/user/orders/:orderId/receipt" element={<OrderReceiptPage />} />
                <Route path="/user/reviews" element={<Reviews />} />
                <Route path="/user/order-tracking/:trackingNumber?" element={<OrderTracking />} />

                <Route path="/wishlist" element={<WishlistPage />} />

                {/* Order Tracking route */}

                <Route path="/" element={<Navigate to="/home" replace />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;