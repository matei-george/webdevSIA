import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CardSidebar.css";

const CardSidebar = ({ isopen, onClose }) => {
   const [cart, setCart] = useState({
      items: [],
      total: 0,
      totalItems: 0,
   });
   const [loading, setLoading] = useState(false);

   const [processingPayment, setProcessingPayment] = useState(false);

   // Încarcă coşul la deschidere
   useEffect(() => {
      if (isopen) {
         fetchCart();
      }
   }, [isopen]);

   const fetchCart = async () => {
      try {
         const response = await axios.get("http://localhost:3000/api/cart");
         if (response.data.success) {
            setCart(response.data.cart);
         }
      } catch (error) {
         console.error("Eroare la încărcarea coşului:", error);
      }
   };

   const removeFromCart = async (productId) => {
      try {
         setLoading(true);
         const response = await axios.delete(`http://localhost:3000/api/cart/${productId}`);
         if (response.data.success) {
            setCart(response.data.cart);
            if (onCartUpdate) {
               onCartUpdate();
            }
         }
      } catch (error) {
         console.error("Eroare la ştergerea din coș:", error);
      } finally {
         setLoading(false);
      }
   };
   const handleCheckoutClick = async () => {
      try {
         setProcessingPayment(true);
         const response = await fetch("http://localhost:3000/api/create-checkout-session", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               amount: cart.total + 19.99,
               cartItems: cart.items,
            }),
         });
         if (!response.ok) {
            throw new Error("Eroare server");
         }
         const data = await response.json();
         if (!data.success) {
            throw new Error(data.error || "Eroare necunoscută");
         }
         window.location.href = data.sessionUrl;
      } catch (error) {
         console.error(" Eroare la crearea sesiunii de checkout:", error);
         alert("Eroare la inițializarea plății: " + error.message);
         setProcessingPayment(false);
      }
   };
   if (!isopen) return null;

   return (
      <div className="card-sidebar-overlay" onClick={onClose}>
         <div className="card-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
               <h2>Coşul de cumpărături</h2>
               <button className="close-btn" onClick={onClose}>
                  x
               </button>
            </div>
            <div className="card-content">
               {cart.items.length === 0 ? (
                  <div className="empty-cart">
                     <p>Coșul tău este gol</p>
                     <span>Adaugă produse din catalog</span>
                  </div>
               ) : (
                  <>
                     <div className="cart-items">
                        {cart.items.map((item) => (
                           <div key={item.productId} className="cart-item">
                              <img src={item.imageUrl} alt={item.title} className="item-image" />
                              <div className="item-details">
                                 <h4>{item.title}</h4>
                                 <p className="item-author">de {item.author}</p>
                                 <div className="item-price-quantity">
                                    <span className="item-price">
                                       {item.price}
                                       RON
                                    </span>
                                    <span className="item-quantity">x {item.quantity}</span>
                                 </div>
                              </div>
                              <button className="remove-btn" onClick={() => removeFromCart(item.productId)} disabled={loading}>
                                 Şterge
                              </button>
                           </div>
                        ))}
                     </div>
                     <div className="cart-summary">
                        <div className="total-items">Total produse: {cart.totalItems}</div>
                        <div className="total-price">
                           Total: <strong>{cart.total.toFixed(2)} RON</strong>
                        </div>
                        <button className="checkout-btn" onClick={handleCheckoutClick} disabled={processingPayment}>
                           {processingPayment ? "Se deschide plata..." : `Finalizează comanda ${(cart.total + 19.99).toFixed(2)} RON `}
                        </button>
                     </div>
                  </>
               )}
            </div>
         </div>
      </div>
   );
};

export default CardSidebar;
