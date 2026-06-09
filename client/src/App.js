import "./App.css";
import Header from "./component/Header";
import Login from "./containers/login/Login";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Register from "./containers/register/Register";
import About from "./containers/about/About";
import Support from "./containers/suppport/Support";
import Home from "./containers/user/Home";
import Men from "./containers/men/Men";
import Footer from "./component/Footer";
import Collection from "./containers/collection/Collection";
import Trends from "./containers/trends/Trends";
import Women from "./containers/women/Women";
import Kids from "./containers/kids/Kids";
import Wishlist from "./containers/wishlist/Wishlist";
import Cart from "./containers/cart/Cart";
import ProductDetail from "./containers/product/ProductDetail";
import { CartProvider } from "./context/CartContext";
import SearchResults from "./containers/searchResult/SearchResults";
import Checkout from "./containers/checkout/Checkout";
import Success from "./containers/success/Success";
import Cancel from "./containers/cancel/Cancel";
import Sale from "./containers/sale/Sale";
import CancelOrder from "./containers/cancel/CancelOrder";
import AdminPanel from "./containers/admin/AdminPanel";

/* ── Admin Route Guard ── */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token || user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
};

/* ── User Route Guard ── */
const UserRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  return children;
};

/* ── Layout (useLocation yahan chalega — Router ke andar hai) ── */
const AppLayout = () => {
  const location = useLocation(); // ✅ Sahi jagah
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="App">
      {!isAdminPage && <Header />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/support" element={<Support />} />
        <Route path="/men" element={<Men />} />
        <Route path="/men/:type" element={<Men />} />
        <Route path="/women" element={<Women />} />
        <Route path="/women/:type" element={<Women />} />
        <Route path="/kids" element={<Kids />} />
        <Route path="/kids/:sub/:type" element={<Kids />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/sale" element={<Sale />} />

        {/* User Only Routes */}
        <Route
          path="/wishlist"
          element={
            <UserRoute>
              <Wishlist />
            </UserRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <UserRoute>
              <Cart />
            </UserRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <UserRoute>
              <Checkout />
            </UserRoute>
          }
        />
        <Route
          path="/cancel-order"
          element={
            <UserRoute>
              <CancelOrder />
            </UserRoute>
          }
        />

        {/* Payment Routes */}
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdminPage && <Footer />}
    </div>
  );
};

/* ── Main App ── */
function App() {
  return (
    <CartProvider>
      <Router>
        <AppLayout />{" "}
        {/* ← Router ke andar hai, isliye useLocation kaam karega */}
      </Router>
    </CartProvider>
  );
}

export default App;
