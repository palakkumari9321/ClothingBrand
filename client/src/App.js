import logo from "./logo.svg";
import "./App.css";
import Header from "./component/Header";
import Login from "./containers/login/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import Order from "./containers/order/Order";

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />

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

            <Route path="/checkout" element={<Checkout />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
            <Route path="/orders" element={<Order />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
