import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { LoginPage, RegisterPage } from './pages/Auth.jsx';
import { StudioShell } from './components/Shell.jsx';
import { StudioPage } from './pages/Studio.jsx';
import { UsersPage } from './pages/Users.jsx';
import { GroupsPage } from './pages/Groups.jsx';
import { PreviewPage } from './pages/Preview.jsx';
import { OrdersPage } from './pages/Orders.jsx';
import { MyOrdersPage } from './pages/MyOrders.jsx';
import { DataPage } from './pages/Data.jsx';
import { PageDetail } from './pages/PageDetail.jsx';
import { ProductsAdmin } from './pages/ProductsAdmin.jsx';
import { ShopPage, ProductDetailPage } from './components/shop.jsx';
import { Spinner, Guard } from './components/ui.jsx';

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) {
    // Public browsing: no login required. Shop + content pages + PDP.
    // Admin/editor routes are simply absent; unknown paths fall back to home.
    return (
      <StudioShell>
        <Routes>
          <Route path="/" element={<PageDetail slug="home" />} />
          <Route path="/home" element={<PageDetail slug="home" />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/faq" element={<PageDetail slug="faq" />} />
          <Route path="/our-story" element={<PageDetail slug="our-story" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<PageDetail slug="home" />} />
        </Routes>
      </StudioShell>
    );
  }
  return (
    <StudioShell>
      <Routes>
        <Route path="/" element={<Navigate to="/studio" replace />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product" element={<Navigate to="/shop" replace />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/orders" element={<Guard need="admin"><OrdersPage /></Guard>} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/home" element={<PageDetail slug="home" />} />
        <Route path="/faq" element={<PageDetail slug="faq" />} />
        <Route path="/our-story" element={<PageDetail slug="our-story" />} />
        <Route path="/products" element={<Guard need="admin"><ProductsAdmin /></Guard>} />
        <Route path="/users" element={<Guard need="admin"><UsersPage /></Guard>} />
        <Route path="/data" element={<Guard need="admin"><DataPage /></Guard>} />
        <Route path="/groups" element={<Guard need="admin"><GroupsPage /></Guard>} />
      </Routes>
    </StudioShell>
  );
}
