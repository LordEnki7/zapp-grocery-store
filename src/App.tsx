import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppProvider';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
import Checkout from './pages/Checkout';
import Affiliate from './pages/Affiliate';
import BusinessDashboard from './pages/business/BusinessDashboard';
import BusinessOrders from './pages/business/BusinessOrders';
import BusinessTaxExempt from './pages/business/BusinessTaxExempt';
import BusinessTeam from './pages/business/BusinessTeam';
import TodaysDeals from './pages/TodaysDeals';
import FreshPharmacy from './pages/FreshPharmacy';
import FreshFoods from './pages/FreshFoods';
import GiftCards from './pages/GiftCards';
import Orders from './pages/Orders';
import Returns from './pages/Returns';
import Help from './pages/Help';

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/account" element={<Account />} />
              <Route path="/affiliate" element={<Affiliate />} />
              <Route path="/business/dashboard" element={<BusinessDashboard />} />
            <Route path="/business/orders" element={<BusinessOrders />} />
            <Route path="/business/tax-exempt" element={<BusinessTaxExempt />} />
            <Route path="/business/team" element={<BusinessTeam />} />
            <Route path="/deals" element={<TodaysDeals />} />
            <Route path="/fresh" element={<FreshFoods />} />
            <Route path="/pharmacy" element={<FreshPharmacy />} />
            <Route path="/gift-cards" element={<GiftCards />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/help" element={<Help />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AppProvider>
    </Router>
  );
};

export default App;
