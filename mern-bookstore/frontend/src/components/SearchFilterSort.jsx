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
         filtered = products.filter(
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
      if (priceRange[0] !== 0 || priceRange[1] !== 200) {
         // O condiție pentru a filtra doar dacă intervalul nu este cel implicit (0-200)
         filtered = filtered.filter((product) => {
            // Determinăm prețul relevant al produsului
            const priceProduct = product.discountPrice || product.price;

            // Ne asigurăm că valoarea minimă nu este mai mare decât cea maximă
            const minPrice = Math.min(priceRange[0], priceRange[1]);
            const maxPrice = Math.max(priceRange[0], priceRange[1]);

            // Returnăm un boolean: prețul produsului este ÎNTRE min și max?
            return priceProduct >= minPrice && priceProduct <= maxPrice;
         });
      }
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

            {/* Categorie */}
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
               {/* Eticheta: Afișăm întotdeauna valoarea minimă și maximă în ordinea corectă */}
               <label className="filter-label">
                  Preț (RON): {Math.min(priceRange[0], priceRange[1])} - {Math.max(priceRange[0], priceRange[1])}
               </label>

               <div className="price-range">
                  {/* Input pentru Prețul MINIM (priceRange[0]) */}
                  <input
                     type="number"
                     className="search-input"
                     min="0"
                     // Opțional: poți adăuga o valoare maximă dinamică
                     max={priceRange[1]}
                     value={priceRange[0]}
                     placeholder="Minim"
                     onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  />

                  {/* Input pentru Prețul MAXIM (priceRange[1]) */}
                  <input
                     type="number"
                     className="search-input"
                     min={priceRange[0]}
                     // Opțional: poți adăuga o valoare minimă dinamică
                     value={priceRange[1]}
                     placeholder="Maxim"
                     // CORECTAT: Păstrează priceRange[0] și actualizează priceRange[1]
                     onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 200])}
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
