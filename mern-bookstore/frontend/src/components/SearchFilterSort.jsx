import React, { useState, useEffect } from "react";
import "./SearchFilterSort.css";

const SearchFilterSort = ({ products, onFilteredProducts, categories = [] }) => {
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("all");
   const [sortBy, setSortBy] = useState("name");
   const [priceRange, setPriceRange] = useState([0, 200]);
   const [inStockOnly, setInStockOnly] = useState(false);
   const [featuredOnly, setFeaturedOnly] = useState(false);

   //    Extragem categorii unice din produse

   const uniqueCategories = [...new Set(products.map((product) => product.category))];

   //    Aplicam filtrele si sortarea
   useEffect(() => {
      let filtered = [...products];

      // Filtram dupa cautare
      if (searchTerm) {
         filtered = filter.filter(
            (product) =>
               product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               product.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
               product.description.toLowerCase().includes(searchTerm.toLowerCase())
         );
      }

      //   Filtram dupa categorie
      if (selectedCategory !== "all") {
         filtered = filtered.filter((product) => product.category === selectedCategory);
      }

      // Filtram dupa pret
      filtered = filtered.filter((product) => {
         const price = product.discountPrice || product.price;
         return (price) => priceRange[0] && price <= priceRange[1];
      });

      //   Filtram dupa stoc
      if (inStockOnly) {
         filtered = filtered.filter((product) => product.stock > 0);
      }

      // Filtram dupa featured
      if (featuredOnly) {
         filtered = filtered.filter((product) => product.featured);
      }

      //   Sortare
      filtered.sort((a, b) => {
         switch (sortBy) {
            case "name":
               return a.title.localeCompare(b.title);
            case "price-low":
               return (a.discountPrice || a.price) - (b.discountPrice || b.price);
            case "price-high":
               return (b.discountPrice || b.price) - (a.discountPrice || a.price);
            case "rating":
               return b.rating - a.rating;
            case "author":
               return a.author.localeCompare(b.author);

            case "newest":
               return new Date(b.createdAt) - new Date(a.createdAt);
            default:
               return 0;
         }
      });

      onFilteredProducts(filtered);
   }, [searchTerm, selectedCategory, sortBy, priceRange, inStockOnly, featuredOnly, products, onFilteredProducts]);

   const clearFilters = () => {
      setSearchTerm("");
      setSelectedCategory("all");
      setSortBy("name");
      setPriceRange([0, 200]);
      setInStockOnly(false);
      setFeaturedOnly(false);
   };
   return (
      <div className="search-filter-container">
         <div className="filters-row first-row">
            {/* Cautare */}
            <div className="filter-group search-group">
               <label htmlFor="" className="filter-label">
                  Cautare
               </label>
               <div className="search-input-container">
                  <input
                     className="search-input"
                     type="text"
                     placeholder="🔎 Titlu, Autor, Descriere....."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                     <button className="clear-search" onClick={() => setSearchTerm("")}>
                        x
                     </button>
                  )}
               </div>
            </div>

            {/* Categorie
             */}
            <div className="filter-group">
               <label className="filter-label">Categorie</label>
               <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-select">
                  <option value="all">Toate categoriile</option>
                  {uniqueCategories.map((category) => (
                     <option key={category} value={category}>
                        {category}
                     </option>
                  ))}
               </select>
            </div>

            {/* Pret */}
            <div className="filter-group price-group">
               <label className="filter-label">Pret:{priceRange[0] - priceRange[1]} RON</label>
               <div className="price-range">
                  <input
                     type="range"
                     min="0"
                     max="200"
                     value={priceRange[0]}
                     onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                     className="range-input"
                  />
                  <input
                     type="range"
                     min="0"
                     max="200"
                     value={priceRange[1]}
                     onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                     className="range-input"
                  />
               </div>
            </div>

            {/* Sortare */}
            <div className="filter-group">
               <label className="filter-label">Sortare</label>
               <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                  <option value="name">Nume (A-Z)</option>
                  <option value="author">Autor (A-Z)</option>
                  <option value="price-low">Preț (Mic → Mare)</option>
                  <option value="price-high">Preț (Mare → Mic)</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Cele mai noi</option>
               </select>
            </div>
         </div>
         <div className="filters-row second-row">
            <div className="quick-filters">
               <label className="checkbox-label">
                  <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                  <span className="checkmark"></span>
                  Doar în stoc
               </label>
               <label className="checkbox-label">
                  <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
                  <span className="checkmark"></span>
                  Doar recomandate
               </label>
               <button className="clear-filters-btn" onClick={clearFilters}>
                  🗑 Resetare filtre
               </button>
            </div>
         </div>
      </div>
   );
};

export default SearchFilterSort;
