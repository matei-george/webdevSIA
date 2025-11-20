import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BookCatalog from "./components/BookCatalog";
import PublicBooks from "./components/PublicBooks";
import PaymentSuccess from "./components/PaymentSuccess";
import AdminLogin from "./components/admin/AdminLogin";
import ProductAdmin from "./components/admin/ProductAdmin";
// import  './App.css';

const App = () => {
   return (
      <Router>
         <Routes>
            <Route path="/" element={<BookCatalog />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/products" element={<ProductAdmin />} />
            <Route path="/publicbooks" element={<PublicBooks />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
         </Routes>
      </Router>
   );
};

export default App;
