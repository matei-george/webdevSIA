import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BookCatalog from "./components/BookCatalog";
import PublicBooks from "./components/PublicBooks";
// import  './App.css';

const App = () => {
   return (
      <Router>
         <Routes>
            <Route path="/" element={<BookCatalog />} />
            <Route path="/publicbooks" element={<PublicBooks />} />
         </Routes>
      </Router>
   );
};

export default App;
