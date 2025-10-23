import React, { useState, useEffect, useReducer } from "react";

// Reducer pentru gestionarea stării aplicației
const initialState = {
   books: [],
   loading: false,
   error: null,
};

function reducer(state, action) {
   switch (action.type) {
      case "FETCH_START":
         return { ...state, loading: true, error: null };
      case "FETCH_SUCCESS":
         return { books: action.payload, loading: false, error: null };
      case "FETCH_ERROR":
         return { ...state, loading: false, error: action.payload };
      default:
         return state;
   }
}

const PublicBooks = () => {
   // useState folosit pentru input (căutare)
   const [query, setQuery] = useState("react");

   // useReducer folosit pentru gestionarea datelor API (stare complexă: books, loading, error)
   const [state, dispatch] = useReducer(reducer, initialState);

   useEffect(() => {
      // Nu executa fetch dacă string-ul de căutare e gol
      if (!query.trim()) return;

      const fetchBooks = async () => {
         dispatch({ type: "FETCH_START" });
         try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${query}`);
            const data = await response.json();
            console.log(data);
            dispatch({ type: "FETCH_SUCCESS", payload: data.docs.slice(0, 10) }); // primele 10 rezultate
         } catch (err) {
            console.error("Eroare la fetch:", err);
            dispatch({ type: "FETCH_ERROR", payload: "Eroare la încărcarea datelor" });
         }
      };

      fetchBooks();
   }, [query]); // useEffect rulează de fiecare dată când se schimbă query

   return (
      <div style={{ maxWidth: "700px", margin: "40px auto", textAlign: "center" }}>
         <h2>Public Books</h2>
         {/* Căutare */}
         <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută o carte"
            style={{
               padding: "10px",
               width: "80%",
               margin: "15px 0",
               borderRadius: "8px",
               border: "1px solid #ccc",
            }}
         />
         {/* Loading / Error */}
         {state.loading && <p>Se încarcă rezultatele...</p>}
         {state.error && <p style={{ color: "red" }}>{state.error}</p>}

         {/* Afisare rezultate */}
         <ul style={{ listStyle: "none", padding: 0 }}>
            {state.books.map((book, index) => (
               <li
                  key={index}
                  style={{
                     background: "#f9f9f9",
                     margin: "10px 0",
                     padding: "10px",
                     borderRadius: "8px",
                     textAlign: "left",
                  }}
               >
                  <strong>{book.title}</strong> <br />
                  {book.author_name && <span>Autor: {book.author_name[0]}</span>}
                  {book.first_publish_year && <span> • {book.first_publish_year}</span>}
               </li>
            ))}
         </ul>
      </div>
   );
};

export default PublicBooks;
